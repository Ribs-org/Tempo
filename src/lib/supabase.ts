import { createServerClient, parseCookieHeader } from '@supabase/ssr';
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

/**
 * Cookie adapter for @supabase/ssr.
 * Astro's `AstroCookies` has no `getAll()`, so reads come from the request's
 * `Cookie` header (via parseCookieHeader) and writes go through `cookies.set`.
 */
export function buildCookieAdapter(cookies: AstroCookies, headers: Headers) {
  return {
    getAll: () => parseCookieHeader(headers.get('Cookie') ?? ''),
    setAll: (toSet: { name: string; value: string; options: Record<string, unknown> }[]) =>
      toSet.forEach(({ name, value, options }) => cookies.set(name, value, options)),
  };
}

/** Anon client bound to the request cookies — used for reads and auth/session. */
export function createAnonServerClient(cookies: AstroCookies, headers: Headers): SupabaseClient {
  return createServerClient(
    requireEnv(SUPABASE_URL, 'PUBLIC_SUPABASE_URL'),
    requireEnv(ANON, 'PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: buildCookieAdapter(cookies, headers) },
  );
}

/** Service-role client — server only, bypasses RLS. Never import in client code. */
export function createAdminClient(): SupabaseClient {
  return createClient(requireEnv(SUPABASE_URL, 'PUBLIC_SUPABASE_URL'), requireEnv(SERVICE, 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}
