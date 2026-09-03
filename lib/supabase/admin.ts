import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Only two legitimate callers:
 *  - trusted server-side jobs (seeds, migrations, admin scripts)
 *  - the public agent endpoint (app/(public)/api/chat), which has no user
 *    JWT and must inject `business_id` manually from the URL slug.
 *
 * Never import this from a Client Component, and never forward this key
 * to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database, "insomnio">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: "insomnio" },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
