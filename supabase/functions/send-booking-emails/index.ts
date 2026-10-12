import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const sender = Deno.env.get('BOOKING_EMAIL_FROM');
const dispatchSecret = Deno.env.get('OUTBOX_DISPATCH_SECRET');
const DELIVERY_CONCURRENCY = 5;

type ClaimedMessage = {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
};

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  const responseHeaders = { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };
  if ((request.method === 'GET' || request.method === 'HEAD') && new URL(request.url).pathname.endsWith('/health')) {
    return new Response(null, { status: 204, headers: responseHeaders });
  }
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: responseHeaders });
  if (!dispatchSecret || request.headers.get('x-dispatch-secret') !== dispatchSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: responseHeaders });
  }
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !sender) {
    return Response.json({ error: 'Email dispatcher is not configured' }, { status: 503, headers: responseHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data, error: claimError } = await supabase.rpc('claim_booking_emails', { p_limit: 20 });
  if (claimError) {
    console.error(JSON.stringify({ event: 'booking_email_batch', request_id: requestId, outcome: 'claim_failed' }));
    return Response.json({ error: 'Email dispatch is temporarily unavailable' }, { status: 500, headers: responseHeaders });
  }

  const messages = (data ?? []) as ClaimedMessage[];
  let sent = 0;
  for (let offset = 0; offset < messages.length; offset += DELIVERY_CONCURRENCY) {
    const batch = messages.slice(offset, offset + DELIVERY_CONCURRENCY);
    const outcomes = await Promise.all(batch.map(async (message) => {
      let delivered = false;
      let providerMessageId: string | null = null;
      let deliveryError: string | null = null;
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `booking-email/${message.id}`,
          },
          body: JSON.stringify({ from: sender, to: [message.recipient_email], subject: message.subject, text: message.body }),
          signal: AbortSignal.timeout(10_000),
        });
        delivered = response.ok;
        if (response.ok) {
          const responseBody = await response.json().catch(() => ({})) as { id?: string };
          providerMessageId = responseBody.id ?? null;
        } else {
          deliveryError = `provider_http_${response.status}`;
        }
      } catch {
        deliveryError = 'provider_timeout_or_network_error';
      }

      const { error: completionError } = await supabase.rpc('complete_booking_email', {
        p_id: message.id,
        p_sent: delivered,
        p_error: deliveryError,
        p_provider_message_id: providerMessageId,
      });
      if (completionError) {
        console.error(JSON.stringify({ event: 'booking_email_completion', request_id: requestId, outbox_id: message.id, outcome: 'failed' }));
      }
      return delivered && !completionError;
    }));
    sent += outcomes.filter(Boolean).length;
  }

  console.info(JSON.stringify({ event: 'booking_email_batch', request_id: requestId, outcome: 'completed', claimed: messages.length, sent }));
  return Response.json({ processed: messages.length, sent }, { headers: responseHeaders });
});
