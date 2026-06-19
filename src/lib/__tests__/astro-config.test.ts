import { describe, it, expect } from 'vitest';
// @ts-expect-error - astro.config.mjs has no type declarations
import config from '../../../astro.config.mjs';

// Regression guard: behind Vercel's proxy, Astro rebuilds the request origin
// from x-forwarded-host ONLY if that host is in security.allowedDomains.
// Without it, url.origin becomes "https://localhost", the CSRF check fails,
// and every admin form POST (login, save obra, etc.) returns a 403.
describe('astro.config security.allowedDomains', () => {
  it('trusts Vercel deploy hostnames so form POSTs pass the CSRF origin check', () => {
    const domains = config.security?.allowedDomains ?? [];
    expect(domains).toContainEqual({ hostname: '**.vercel.app' });
  });
});
