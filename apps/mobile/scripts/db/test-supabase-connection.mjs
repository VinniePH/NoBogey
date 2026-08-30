/**
 * Supabase database connection test — verifies that the shared NoBogey database URL is reachable.
 *
 * Expected inputs/outputs: `SUPABASE_DB_URL` from the root `.env` file in; one read-only `SELECT 1` result out.
 * Supabase target (live): the Postgres database identified by `SUPABASE_DB_URL`.
 * Status: LIVE CONNECTION CHECK — no schema, authentication, or application data is read or changed.
 */
/* global process, console */
import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.SUPABASE_DB_URL;

/**
 * Test the configured Supabase Postgres connection with a read-only query.
 * Will connect using `SUPABASE_DB_URL` and execute `SELECT 1`; it never logs the URL or queries app tables.
 */
async function testSupabaseDatabaseConnection() {
  if (!databaseUrl) {
    throw new Error('SUPABASE_DB_URL is missing. Add it to the root .env file before running this script.');
  }

  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 10_000,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT 1 AS connected');

    if (result.rows[0]?.connected !== 1) {
      throw new Error('Database connection check returned an unexpected result.');
    }

    console.log('Supabase database connection succeeded.');
  } finally {
    await client.end().catch(() => undefined);
  }
}

testSupabaseDatabaseConnection().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown database connection error.';
  const safeMessage = databaseUrl ? message.replaceAll(databaseUrl, '[REDACTED]') : message;

  console.error(`Supabase database connection failed: ${safeMessage}`);
  process.exitCode = 1;
});
