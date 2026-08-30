import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const sender = Deno.env.get('BOOKING_EMAIL_FROM');
const dispatchSecret = Deno.env.get('OUTBOX_DISPATCH_SECRET');

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!dispatchSecret || request.headers.get('x-dispatch-secret') !== dispatchSecret) return new Response('Unauthorized', { status: 401 });
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !sender) return Response.json({ error: 'Email dispatcher is not configured' }, { status: 503 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: messages, error: claimError } = await supabase.rpc('claim_booking_emails', { p_limit: 20 });
  if (claimError) return Response.json({ error: claimError.message }, { status: 500 });

  const results = [];
  for (const message of messages ?? []) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender, to: [message.recipient_email], subject: message.subject, text: message.body }),
      });
      const responseBody = await response.text();
      await supabase.rpc('complete_booking_email', { p_id: message.id, p_sent: response.ok, p_error: response.ok ? null : responseBody });
      results.push({ id: message.id, sent: response.ok });
    } catch (error) {
      await supabase.rpc('complete_booking_email', { p_id: message.id, p_sent: false, p_error: error instanceof Error ? error.message : 'Unknown delivery error' });
      results.push({ id: message.id, sent: false });
    }
  }
  return Response.json({ processed: results.length, results });
});
