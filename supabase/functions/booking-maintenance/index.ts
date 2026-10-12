import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const dispatchSecret = Deno.env.get("BOOKING_MAINTENANCE_SECRET");

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  const responseHeaders = { "Cache-Control": "no-store", "X-Request-Id": requestId };
  if ((request.method === "GET" || request.method === "HEAD") && new URL(request.url).pathname.endsWith("/health")) {
    return new Response(null, { status: 204, headers: responseHeaders });
  }
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: responseHeaders });
  if (!dispatchSecret || request.headers.get("x-maintenance-secret") !== dispatchSecret) return Response.json({ error: "Unauthorized" }, { status: 401, headers: responseHeaders });
  if (!supabaseUrl || !serviceRoleKey) return Response.json({ error: "Booking maintenance is not configured" }, { status: 503, headers: responseHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("run_booking_maintenance", { p_limit: 200 });
  if (error) {
    console.error(JSON.stringify({ event: "booking_maintenance", request_id: requestId, outcome: "failed" }));
    return Response.json({ error: "Booking maintenance failed" }, { status: 500, headers: responseHeaders });
  }
  console.info(JSON.stringify({ event: "booking_maintenance", request_id: requestId, outcome: "succeeded", expired: data ?? 0 }));
  return Response.json({ expired: data ?? 0 }, { headers: responseHeaders });
});
