import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key so it must never be
// imported from a "use client" file. All access to the app is already
// gated by the password middleware, so RLS is intentionally not used.
export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
