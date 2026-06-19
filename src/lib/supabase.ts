import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `[supabase] Falta la variable de entorno "${name}". ` +
        `Configúrala en Vercel (Settings → Environment Variables) para Production y Preview, y vuelve a desplegar. ` +
        `Recuerda que las PUBLIC_* se incrustan en build time.`,
    );
  }
  return value;
}

/** Anon client bound to the request cookies — used for reads and auth/session. */
export function createAnonServerClient(cookies: AstroCookies): SupabaseClient {
  return createServerClient(requireEnv(SUPABASE_URL, 'PUBLIC_SUPABASE_URL'), requireEnv(ANON, 'PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: {
      getAll: () => cookies.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) => cookies.set(name, value, options)),
    },
  });
}

/** Service-role client — server only, bypasses RLS. Never import in client code. */
export function createAdminClient(): SupabaseClient {
  return createClient(requireEnv(SUPABASE_URL, 'PUBLIC_SUPABASE_URL'), requireEnv(SERVICE, 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}
