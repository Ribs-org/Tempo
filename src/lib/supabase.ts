import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/** Anon client bound to the request cookies — used for reads and auth/session. */
export function createAnonServerClient(cookies: AstroCookies): SupabaseClient {
  return createServerClient(SUPABASE_URL, ANON, {
    cookies: {
      getAll: () => cookies.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) => cookies.set(name, value, options)),
    },
  });
}

/** Service-role client — server only, bypasses RLS. Never import in client code. */
export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });
}
