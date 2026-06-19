// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // Behind Vercel's proxy, Astro must trust the x-forwarded-host header to
  // rebuild the request origin; otherwise it falls back to "localhost" and the
  // CSRF check (security.checkOrigin) rejects every form POST with a 403
  // "Cross-site ... form submissions are forbidden". '**.vercel.app' covers all
  // preview + production deploy URLs. Add your custom domain here if you set one.
  security: {
    allowedDomains: [{ hostname: '**.vercel.app' }],
  },
  vite: { plugins: [tailwindcss()] },
});
