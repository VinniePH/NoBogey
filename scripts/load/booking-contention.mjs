/* global process, URL, performance, console */
import pg from "pg";
import { randomUUID } from "node:crypto";

const databaseUrl = process.env.LOAD_TEST_DATABASE_URL;
const teeTimeId = process.env.LOAD_TEST_TEE_TIME_ID;
const caddieId = process.env.LOAD_TEST_CADDIE_ID;
const golferIds = (process.env.LOAD_TEST_GOLFER_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 100);
const partySize = Number(process.env.LOAD_TEST_PARTY_SIZE ?? 1);
const concurrency = Math.min(100, Math.max(1, Number(process.env.LOAD_TEST_CONCURRENCY ?? golferIds.length)));

if (!databaseUrl || !teeTimeId || !caddieId || !golferIds.length) {
  throw new Error("Set LOAD_TEST_DATABASE_URL, LOAD_TEST_TEE_TIME_ID, LOAD_TEST_CADDIE_ID, and LOAD_TEST_GOLFER_IDS.");
}
const hostname = new URL(databaseUrl.replace(/^postgres(?:ql)?:/, "http:")).hostname;
const local = ["localhost", "127.0.0.1", "::1", "db"].includes(hostname);
if (!local && process.env.ALLOW_STAGING_LOAD_TEST !== "true") {
  throw new Error("Refusing to run outside a local database. Set ALLOW_STAGING_LOAD_TEST=true only for explicitly authorized staging.");
}
if (/tuprsezzpiworthbbygk|nobogeyofficial/i.test(databaseUrl)) {
  throw new Error("Refusing to run against the known production project.");
}

const pool = new pg.Pool({ connectionString: databaseUrl, max: concurrency, statement_timeout: 10_000, query_timeout: 12_000 });
const runId = randomUUID();
const timings = [];

async function reserve(golferId, index) {
  const client = await pool.connect();
  const started = performance.now();
  try {
    await client.query("begin");
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [golferId]);
    await client.query("set local role authenticated");
    const result = await client.query(
      "select id, status from public.create_mobile_booking($1,$2,$3::smallint,$4)",
      [teeTimeId, caddieId, partySize, `load-${runId}-${index}`]
    );
    await client.query("commit");
    timings.push(performance.now() - started);
    return { ok: true, bookingId: result.rows[0]?.id };
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    timings.push(performance.now() - started);
    return { ok: false, code: error.code, message: error.message };
  } finally {
    client.release();
  }
}

const results = await Promise.all(golferIds.map(reserve));
const sorted = timings.sort((a, b) => a - b);
const percentile = (fraction) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0;
const successes = results.filter(({ ok }) => ok);
const conflicts = results.filter(({ ok, code }) => !ok && code === "23P01");
const verification = await pool.query(
  `select count(*)::int bookings, coalesce(sum(a.capacity_units),0)::int units
   from private.booking_allocations a join public.bookings b on b.id=a.booking_id
   where a.tee_time_id=$1 and a.released_at is null
     and (b.status in ('confirmed','in_progress') or (b.status='pending' and b.expires_at>now()))`,
  [teeTimeId]
);

console.log(JSON.stringify({
  environment: local ? "local" : "authorized-staging",
  attempts: results.length,
  successes: successes.length,
  conflicts: conflicts.length,
  otherErrors: results.length - successes.length - conflicts.length,
  latencyMs: { p50: percentile(0.5), p95: percentile(0.95), p99: percentile(0.99) },
  authoritativeAllocation: verification.rows[0]
}, null, 2));

await pool.end();
