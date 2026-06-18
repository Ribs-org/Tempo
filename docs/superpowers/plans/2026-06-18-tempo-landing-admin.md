# Tempo S.A. Landing + Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sober, professional Astro website for Tempo S.A. (engineering & projects consultancy) showing a portfolio of works, plus a protected admin panel to manage works (with photo uploads) and contact info, all backed by Supabase.

**Architecture:** Astro in server (SSR) mode with the Node standalone adapter. Public pages render SSR reading from Supabase with the anon key so admin edits appear without re-deploy. `/admin/*` is protected by middleware checking a Supabase Auth session. All writes (DB + Storage) run server-side via Astro Actions using the service role key. RLS allows public SELECT and denies client-side writes.

**Tech Stack:** Astro 5, `@astrojs/node`, Tailwind CSS v4 (`@tailwindcss/vite`), `@supabase/supabase-js`, `@supabase/ssr`, Supabase (Postgres + Storage + Auth), Vitest for unit tests, TypeScript.

## Global Constraints

- Language of all UI copy: **Spanish (Chile)**.
- Brand palette derived from logo: corporate **green** (primary), **orange** (accent), black/graphite headings, light backgrounds. Define as CSS tokens.
- Headings font: Space Grotesk. Body font: Inter.
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never imported into client-side code or `PUBLIC_` env.
- Work categories enum (exact values): `obra_construida`, `proyecto`, `peritaje`, `licitacion`.
- Work status enum (exact values): `en_curso`, `finalizada`.
- Storage bucket name: `obras` (public read).
- Node 24, npm 11 (already installed).
- Commit after every task with a conventional commit message.

---

### Task 1: Scaffold Astro project with Node adapter, Tailwind, fonts, base layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.example`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro` (temporary placeholder)
- Test: `vitest.config.ts` + `src/lib/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: a runnable Astro SSR app; `BaseLayout.astro` exposing props `{ title: string; description?: string }` and a default slot. Global CSS tokens: `--color-green`, `--color-green-dark`, `--color-orange`, `--color-ink`, fonts via Tailwind `font-display` / `font-sans`.

- [ ] **Step 1: Initialize package.json and install dependencies**

```bash
cd /home/vicente/generar_patrimonio/Tempo
npm init -y
npm install astro@^5 @astrojs/node@^9 @supabase/supabase-js@^2 @supabase/ssr@^0.5
npm install -D @tailwindcss/vite@^4 tailwindcss@^4 vitest@^2 typescript
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3: Write `package.json` scripts**

Set the `scripts` field to:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "node ./dist/server/entry.mjs",
  "test": "vitest run"
}
```

Also add `"type": "module"` to `package.json`.

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
.astro/
.env
.DS_Store
```

- [ ] **Step 6: Write `.env.example`**

```
PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 7: Write `src/styles/global.css`**

```css
@import 'tailwindcss';

@theme {
  --color-green: #1f8a4c;
  --color-green-dark: #14633a;
  --color-orange: #ef7d12;
  --color-ink: #111418;
  --color-mist: #f5f7f5;
  --font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
body { color: var(--color-ink); }
```

- [ ] **Step 8: Write `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
interface Props { title: string; description?: string; }
const { title, description = 'Consultora de ingeniería y proyectos' } = Astro.props;
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="font-sans bg-white">
    <slot />
  </body>
</html>
```

- [ ] **Step 9: Write temporary `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="TEMPO S.A.">
  <main class="p-10"><h1 class="font-display text-4xl text-green">TEMPO S.A.</h1></main>
</BaseLayout>
```

- [ ] **Step 10: Write `vitest.config.ts` and smoke test**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node' } });
```

`src/lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2); }); });
```

- [ ] **Step 11: Run test and build to verify scaffold**

Run: `npm test`
Expected: PASS (smoke test)

Run: `npm run build`
Expected: build completes, creates `dist/server/entry.mjs`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro SSR project with Tailwind and base layout"
```

---

### Task 2: Supabase client factories and type definitions

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/types.ts`
- Test: `src/lib/__tests__/types.test.ts`

**Interfaces:**
- Produces:
  - `src/lib/types.ts`: types `Categoria = 'obra_construida' | 'proyecto' | 'peritaje' | 'licitacion'`; `Estado = 'en_curso' | 'finalizada'`; interfaces `Obra`, `ObraFoto`, `Contacto`; const arrays `CATEGORIAS` and `ESTADOS` with `{ value, label }` entries; helper `categoriaLabel(value): string`.
  - `src/lib/supabase.ts`:
    - `createAnonServerClient(cookies: AstroCookies): SupabaseClient` — anon key, reads/writes auth cookies via `@supabase/ssr` for session.
    - `createAdminClient(): SupabaseClient` — service role key, server-only, no session persistence.

- [ ] **Step 1: Write the failing test for types helpers**

`src/lib/__tests__/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CATEGORIAS, ESTADOS, categoriaLabel } from '../types';

describe('types', () => {
  it('exposes 4 categories', () => { expect(CATEGORIAS).toHaveLength(4); });
  it('exposes 2 estados', () => { expect(ESTADOS).toHaveLength(2); });
  it('maps a categoria value to its label', () => {
    expect(categoriaLabel('peritaje')).toBe('Peritaje');
  });
  it('returns the raw value for unknown categoria', () => {
    expect(categoriaLabel('zzz')).toBe('zzz');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/types.test.ts`
Expected: FAIL ("Cannot find module '../types'").

- [ ] **Step 3: Write `src/lib/types.ts`**

```ts
export type Categoria = 'obra_construida' | 'proyecto' | 'peritaje' | 'licitacion';
export type Estado = 'en_curso' | 'finalizada';

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'obra_construida', label: 'Obra construida' },
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'licitacion', label: 'Licitación' },
];

export const ESTADOS: { value: Estado; label: string }[] = [
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
];

export function categoriaLabel(value: string): string {
  return CATEGORIAS.find((c) => c.value === value)?.label ?? value;
}

export function estadoLabel(value: string): string {
  return ESTADOS.find((e) => e.value === value)?.label ?? value;
}

export interface ObraFoto { id: string; obra_id: string; url: string; alt: string | null; orden: number; }

export interface Obra {
  id: string; slug: string; titulo: string; categoria: Categoria;
  descripcion: string | null; ubicacion: string | null; anio: number | null;
  cliente: string | null; estado: Estado | null; portada_url: string | null;
  destacada: boolean; orden: number; created_at: string;
  obra_fotos?: ObraFoto[];
}

export interface Contacto {
  id: number; razon_social: string; direccion: string | null; telefono: string | null;
  email: string | null; horario: string | null; redes: Record<string, string> | null;
  mapa_embed: string | null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/types.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write `src/lib/supabase.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/** Anon client bound to the request cookies — used for reads and auth/session. */
export function createAnonServerClient(cookies: AstroCookies): SupabaseClient {
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => cookies.getAll().map(({ name, value }) => ({ name, value })),
      setAll: (toSet) =>
        toSet.forEach(({ name, value, options }) => cookies.set(name, value, options)),
    },
  });
}

/** Service-role client — server only, bypasses RLS. Never import in client code. */
export function createAdminClient(): SupabaseClient {
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}
```

- [ ] **Step 6: Run full test suite**

Run: `npm test`
Expected: PASS (smoke + types).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add supabase client factories and domain types"
```

---

### Task 3: Database migration, RLS policies, and setup docs

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `SETUP.md`

**Interfaces:**
- Produces: tables `obras`, `obra_fotos`, `contacto` with RLS; a seeded `contacto` row (id = 1). No code dependency for other tasks beyond matching column names in `types.ts`.

- [ ] **Step 1: Write `supabase/migrations/0001_init.sql`**

```sql
-- Tempo S.A. initial schema
create extension if not exists "pgcrypto";

create table if not exists obras (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  categoria text not null check (categoria in ('obra_construida','proyecto','peritaje','licitacion')),
  descripcion text,
  ubicacion text,
  anio int,
  cliente text,
  estado text check (estado in ('en_curso','finalizada')),
  portada_url text,
  destacada boolean not null default false,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists obra_fotos (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obras(id) on delete cascade,
  url text not null,
  alt text,
  orden int not null default 0
);

create table if not exists contacto (
  id int primary key default 1 check (id = 1),
  razon_social text not null default 'TEMPO S.A. — Consultora de Ingeniería y Proyectos',
  direccion text,
  telefono text,
  email text,
  horario text,
  redes jsonb,
  mapa_embed text
);

insert into contacto (id) values (1) on conflict (id) do nothing;

-- RLS
alter table obras enable row level security;
alter table obra_fotos enable row level security;
alter table contacto enable row level security;

-- Public read for everyone (anon + authenticated)
create policy "public read obras" on obras for select using (true);
create policy "public read obra_fotos" on obra_fotos for select using (true);
create policy "public read contacto" on contacto for select using (true);
-- No insert/update/delete policies => writes denied to anon/authenticated.
-- All writes go through the service-role key (bypasses RLS).
```

- [ ] **Step 2: Write `SETUP.md`**

````markdown
# Configuración de Tempo S.A.

## 1. Variables de entorno
Copia `.env.example` a `.env` y completa con tu proyecto Supabase:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 2. Base de datos
En el dashboard de Supabase → SQL Editor, pega y ejecuta el contenido de
`supabase/migrations/0001_init.sql`.

## 3. Storage
En Storage, crea un bucket llamado **`obras`** y márcalo como **público**.

## 4. Usuario admin
En Authentication → Users → Add user, crea el usuario administrador con email y
contraseña. (Deshabilita el registro público en Authentication → Providers si quieres.)

## 5. Ejecutar
```
npm install
npm run dev
```
Sitio público en `/`, panel en `/admin`.
````

- [ ] **Step 3: Verify SQL is valid (lint by eye / optional local run)**

If a local Postgres is available: `psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql`. Otherwise this is applied in the Supabase SQL editor per SETUP.md. No automated test.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add db migration, RLS policies, and setup docs"
```

---

### Task 4: Brand logo, Header, and Footer (footer reads contacto)

**Files:**
- Create: `src/components/Logo.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/lib/queries.ts`
- Test: `src/lib/__tests__/slug.test.ts` (slugify lives in queries.ts)

**Interfaces:**
- Consumes: `createAnonServerClient` (Task 2), `Contacto` type (Task 2).
- Produces:
  - `src/lib/queries.ts`: `slugify(s: string): string`; `getContacto(client): Promise<Contacto | null>`; `getObras(client, opts?: { categoria?: string; destacadas?: boolean }): Promise<Obra[]>`; `getObraBySlug(client, slug): Promise<Obra | null>`.
  - `Logo.astro` props `{ class?: string }`. `Header.astro` (no props). `Footer.astro` props `{ contacto: Contacto | null }`.

- [ ] **Step 1: Write the failing test for slugify**

`src/lib/__tests__/slug.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { slugify } from '../queries';

describe('slugify', () => {
  it('lowercases and hyphenates', () => { expect(slugify('Edificio Central')).toBe('edificio-central'); });
  it('strips accents', () => { expect(slugify('Construcción Ñuñoa')).toBe('construccion-nunoa'); });
  it('removes punctuation and collapses dashes', () => { expect(slugify('Obra #1: Norte!!')).toBe('obra-1-norte'); });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/slug.test.ts`
Expected: FAIL ("Cannot find module '../queries'").

- [ ] **Step 3: Write `src/lib/queries.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Obra, Contacto } from './types';

export function slugify(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getContacto(client: SupabaseClient): Promise<Contacto | null> {
  const { data } = await client.from('contacto').select('*').eq('id', 1).single();
  return (data as Contacto) ?? null;
}

export async function getObras(
  client: SupabaseClient,
  opts: { categoria?: string; destacadas?: boolean } = {},
): Promise<Obra[]> {
  let q = client.from('obras').select('*, obra_fotos(*)').order('orden', { ascending: true }).order('created_at', { ascending: false });
  if (opts.categoria) q = q.eq('categoria', opts.categoria);
  if (opts.destacadas) q = q.eq('destacada', true);
  const { data } = await q;
  return (data as Obra[]) ?? [];
}

export async function getObraBySlug(client: SupabaseClient, slug: string): Promise<Obra | null> {
  const { data } = await client.from('obras').select('*, obra_fotos(*)').eq('slug', slug).single();
  return (data as Obra) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/slug.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/components/Logo.astro`**

```astro
---
interface Props { class?: string; }
const { class: cls = '' } = Astro.props;
---
<a href="/" class={`inline-flex items-center gap-3 ${cls}`} aria-label="TEMPO S.A. inicio">
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <!-- arco naranja incompleto -->
    <path d="M34 10a18 18 0 1 0 6 14" stroke="var(--color-orange)" stroke-width="4" stroke-linecap="round" fill="none"/>
    <!-- tres barras verdes de distinta altura -->
    <rect x="17" y="26" width="4" height="10" rx="1" fill="var(--color-green)"/>
    <rect x="24" y="20" width="4" height="16" rx="1" fill="var(--color-green)"/>
    <rect x="31" y="14" width="4" height="22" rx="1" fill="var(--color-green)"/>
  </svg>
  <span class="leading-none">
    <span class="font-display font-bold text-xl tracking-tight text-ink">TEMPO</span>
    <span class="font-display text-xs align-top text-ink">S.A.</span>
  </span>
</a>
```

- [ ] **Step 6: Write `src/components/Header.astro`**

```astro
---
import Logo from './Logo.astro';
const links = [
  { href: '/', label: 'Inicio' },
  { href: '/portafolio', label: 'Portafolio' },
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#contacto', label: 'Contacto' },
];
---
<header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/5">
  <div class="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
    <Logo />
    <nav class="hidden sm:flex gap-7 text-sm font-medium text-ink/80">
      {links.map((l) => <a class="hover:text-green transition-colors" href={l.href}>{l.label}</a>)}
    </nav>
  </div>
</header>
```

- [ ] **Step 7: Write `src/components/Footer.astro`**

```astro
---
import type { Contacto } from '../lib/types';
interface Props { contacto: Contacto | null; }
const { contacto } = Astro.props;
---
<footer id="contacto" class="bg-ink text-white/90 mt-24">
  <div class="mx-auto max-w-6xl px-6 py-14 grid gap-10 sm:grid-cols-3">
    <div>
      <p class="font-display font-bold text-lg text-white">{contacto?.razon_social ?? 'TEMPO S.A.'}</p>
      <p class="text-sm text-white/60 mt-2">Consultora de ingeniería y proyectos</p>
    </div>
    <div class="text-sm space-y-1">
      <p class="text-white/50 uppercase tracking-wide text-xs mb-2">Contacto</p>
      {contacto?.direccion && <p>{contacto.direccion}</p>}
      {contacto?.telefono && <p>{contacto.telefono}</p>}
      {contacto?.email && <p><a class="hover:text-orange" href={`mailto:${contacto.email}`}>{contacto.email}</a></p>}
      {contacto?.horario && <p class="text-white/60">{contacto.horario}</p>}
    </div>
    <div class="text-sm">
      {contacto?.redes && Object.entries(contacto.redes).map(([k, v]) => (
        <a class="block hover:text-orange capitalize" href={v}>{k}</a>
      ))}
    </div>
  </div>
  <div class="border-t border-white/10 py-4 text-center text-xs text-white/40">
    © {new Date().getFullYear()} TEMPO S.A. — Todos los derechos reservados.
  </div>
</footer>
```

- [ ] **Step 8: Run full test suite**

Run: `npm test`
Expected: PASS (smoke + types + slug).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add brand logo, header, footer, and data query helpers"
```

---

### Task 5: Landing page (`/`)

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder)
- Create: `src/components/ObraCard.astro`

**Interfaces:**
- Consumes: `createAnonServerClient`, `getObras`, `getContacto`, `Header`, `Footer`, `Logo`, `categoriaLabel`.
- Produces: `ObraCard.astro` props `{ obra: Obra }` (used here and in Task 6).

- [ ] **Step 1: Write `src/components/ObraCard.astro`**

```astro
---
import type { Obra } from '../lib/types';
import { categoriaLabel } from '../lib/types';
interface Props { obra: Obra; }
const { obra } = Astro.props;
---
<a href={`/portafolio/${obra.slug}`} class="group block overflow-hidden rounded-lg border border-black/5 bg-white hover:shadow-lg transition-shadow">
  <div class="aspect-[4/3] overflow-hidden bg-mist">
    {obra.portada_url
      ? <img src={obra.portada_url} alt={obra.titulo} class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      : <div class="h-full w-full grid place-items-center text-ink/30 text-sm">Sin imagen</div>}
  </div>
  <div class="p-5">
    <span class="text-xs font-medium uppercase tracking-wide text-green">{categoriaLabel(obra.categoria)}</span>
    <h3 class="font-display font-semibold text-lg mt-1 text-ink">{obra.titulo}</h3>
    {obra.ubicacion && <p class="text-sm text-ink/60 mt-1">{obra.ubicacion}{obra.anio ? ` · ${obra.anio}` : ''}</p>}
  </div>
</a>
```

- [ ] **Step 2: Write `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import ObraCard from '../components/ObraCard.astro';
import { createAnonServerClient } from '../lib/supabase';
import { getObras, getContacto } from '../lib/queries';

const client = createAnonServerClient(Astro.cookies);
const [destacadas, contacto] = await Promise.all([
  getObras(client, { destacadas: true }),
  getContacto(client),
]);

const servicios = [
  { t: 'Construcción de obras', d: 'Ejecución de inmuebles con estándares de calidad y plazos cumplidos.' },
  { t: 'Proyectos de ingeniería', d: 'Diseño y desarrollo integral de proyectos de edificación e infraestructura.' },
  { t: 'Peritajes de obra', d: 'Inspección técnica, informes periciales y evaluación de obras.' },
  { t: 'Licitaciones', d: 'Participación activa y preparación de propuestas para licitaciones públicas y privadas.' },
];
---
<BaseLayout title="TEMPO S.A. — Consultora de Ingeniería y Proyectos">
  <Header />
  <main>
    <!-- Hero -->
    <section class="mx-auto max-w-6xl px-6 pt-20 pb-16">
      <p class="text-green font-medium tracking-wide uppercase text-sm">Consultora de ingeniería y proyectos</p>
      <h1 class="font-display font-bold text-4xl sm:text-6xl mt-4 max-w-3xl text-ink leading-[1.05]">
        Construimos, proyectamos y peritamos obras con precisión.
      </h1>
      <p class="text-lg text-ink/70 mt-6 max-w-2xl">
        TEMPO S.A. es una consultora de ingeniería dedicada a la construcción de inmuebles, el desarrollo de proyectos y la participación en licitaciones de obra.
      </p>
      <div class="mt-8 flex gap-4">
        <a href="/portafolio" class="rounded-md bg-green px-6 py-3 text-white font-medium hover:bg-green-dark transition-colors">Ver portafolio</a>
        <a href="#contacto" class="rounded-md border border-ink/15 px-6 py-3 font-medium hover:border-green transition-colors">Contáctanos</a>
      </div>
    </section>

    <!-- Servicios -->
    <section id="servicios" class="bg-mist py-20">
      <div class="mx-auto max-w-6xl px-6">
        <h2 class="font-display font-bold text-3xl text-ink">Servicios</h2>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-10">
          {servicios.map((s) => (
            <div class="rounded-lg bg-white p-6 border border-black/5">
              <div class="h-1 w-10 bg-orange rounded-full mb-4"></div>
              <h3 class="font-display font-semibold text-lg text-ink">{s.t}</h3>
              <p class="text-sm text-ink/65 mt-2">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <!-- Obras destacadas -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <div class="flex items-end justify-between">
        <h2 class="font-display font-bold text-3xl text-ink">Obras destacadas</h2>
        <a href="/portafolio" class="text-green font-medium text-sm hover:underline">Ver todo →</a>
      </div>
      {destacadas.length === 0
        ? <p class="text-ink/50 mt-8">Aún no hay obras destacadas. Agrégalas desde el panel de administración.</p>
        : <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">{destacadas.map((o) => <ObraCard obra={o} />)}</div>}
    </section>
  </main>
  <Footer contacto={contacto} />
</BaseLayout>
```

- [ ] **Step 3: Build to verify it compiles**

Run: `npm run build`
Expected: build succeeds with no type/template errors.

- [ ] **Step 4: Manual smoke (if `.env` configured)**

Run: `npm run dev` and open `/`. Expected: hero, 4 services, destacadas section, footer render. Without `.env`, queries return empty arrays gracefully (page still renders). Note: full data verification happens after admin exists (Task 12).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build landing page with hero, services, and featured works"
```

---

### Task 6: Portfolio list page with category filter (`/portafolio`)

**Files:**
- Create: `src/pages/portafolio/index.astro`

**Interfaces:**
- Consumes: `createAnonServerClient`, `getObras`, `getContacto`, `ObraCard`, `CATEGORIAS`, `Header`, `Footer`.

- [ ] **Step 1: Write `src/pages/portafolio/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import ObraCard from '../../components/ObraCard.astro';
import { createAnonServerClient } from '../../lib/supabase';
import { getObras, getContacto } from '../../lib/queries';
import { CATEGORIAS } from '../../lib/types';

const client = createAnonServerClient(Astro.cookies);
const categoria = Astro.url.searchParams.get('categoria') ?? '';
const [obras, contacto] = await Promise.all([
  getObras(client, categoria ? { categoria } : {}),
  getContacto(client),
]);
---
<BaseLayout title="Portafolio — TEMPO S.A.">
  <Header />
  <main class="mx-auto max-w-6xl px-6 py-16">
    <h1 class="font-display font-bold text-4xl text-ink">Portafolio</h1>
    <p class="text-ink/65 mt-3 max-w-2xl">Obras construidas, proyectos, peritajes y licitaciones de TEMPO S.A.</p>

    <div class="flex flex-wrap gap-2 mt-8">
      <a href="/portafolio" class={`rounded-full px-4 py-1.5 text-sm border ${categoria === '' ? 'bg-green text-white border-green' : 'border-ink/15 hover:border-green'}`}>Todas</a>
      {CATEGORIAS.map((c) => (
        <a href={`/portafolio?categoria=${c.value}`} class={`rounded-full px-4 py-1.5 text-sm border ${categoria === c.value ? 'bg-green text-white border-green' : 'border-ink/15 hover:border-green'}`}>{c.label}</a>
      ))}
    </div>

    {obras.length === 0
      ? <p class="text-ink/50 mt-12">No hay obras en esta categoría.</p>
      : <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">{obras.map((o) => <ObraCard obra={o} />)}</div>}
  </main>
  <Footer contacto={contacto} />
</BaseLayout>
```

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add portfolio list page with category filter"
```

---

### Task 7: Portfolio detail page with gallery (`/portafolio/[slug]`)

**Files:**
- Create: `src/pages/portafolio/[slug].astro`

**Interfaces:**
- Consumes: `createAnonServerClient`, `getObraBySlug`, `getContacto`, `categoriaLabel`, `estadoLabel`.

- [ ] **Step 1: Write `src/pages/portafolio/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import { createAnonServerClient } from '../../lib/supabase';
import { getObraBySlug, getContacto } from '../../lib/queries';
import { categoriaLabel, estadoLabel } from '../../lib/types';

const { slug } = Astro.params;
const client = createAnonServerClient(Astro.cookies);
const obra = await getObraBySlug(client, slug!);
if (!obra) return Astro.redirect('/portafolio');
const contacto = await getContacto(client);
const fotos = (obra.obra_fotos ?? []).sort((a, b) => a.orden - b.orden);
const meta = [
  obra.ubicacion && { l: 'Ubicación', v: obra.ubicacion },
  obra.anio && { l: 'Año', v: String(obra.anio) },
  obra.cliente && { l: 'Cliente / Mandante', v: obra.cliente },
  obra.estado && { l: 'Estado', v: estadoLabel(obra.estado) },
].filter(Boolean) as { l: string; v: string }[];
---
<BaseLayout title={`${obra.titulo} — TEMPO S.A.`} description={obra.descripcion ?? undefined}>
  <Header />
  <main class="mx-auto max-w-5xl px-6 py-12">
    <a href="/portafolio" class="text-sm text-green hover:underline">← Volver al portafolio</a>
    <span class="block text-xs font-medium uppercase tracking-wide text-green mt-6">{categoriaLabel(obra.categoria)}</span>
    <h1 class="font-display font-bold text-4xl text-ink mt-2">{obra.titulo}</h1>

    {obra.portada_url && <img src={obra.portada_url} alt={obra.titulo} class="w-full rounded-xl mt-8 aspect-video object-cover" />}

    <div class="grid gap-10 lg:grid-cols-3 mt-10">
      <div class="lg:col-span-2">
        {obra.descripcion && <p class="text-ink/80 leading-relaxed whitespace-pre-line">{obra.descripcion}</p>}
      </div>
      {meta.length > 0 && (
        <dl class="space-y-4 bg-mist rounded-xl p-6 h-fit">
          {meta.map((m) => (
            <div>
              <dt class="text-xs uppercase tracking-wide text-ink/50">{m.l}</dt>
              <dd class="text-ink font-medium">{m.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>

    {fotos.length > 0 && (
      <div class="mt-12">
        <h2 class="font-display font-semibold text-2xl text-ink mb-6">Galería</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fotos.map((f) => <img src={f.url} alt={f.alt ?? obra.titulo} class="rounded-lg aspect-square object-cover" />)}
        </div>
      </div>
    )}
  </main>
  <Footer contacto={contacto} />
</BaseLayout>
```

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add portfolio detail page with gallery and metadata"
```

---

### Task 8: Auth middleware, login, and logout

**Files:**
- Create: `src/middleware.ts`
- Create: `src/pages/admin/login.astro`
- Create: `src/actions/index.ts`
- Modify: `astro.config.mjs` (no change needed; Actions auto-enabled in Astro 5) — verify only.

**Interfaces:**
- Consumes: `createAnonServerClient`.
- Produces:
  - `src/middleware.ts`: redirects unauthenticated requests for `/admin/*` (except `/admin/login`) to `/admin/login`; attaches `context.locals.user` and `context.locals.supabase`.
  - `src/actions/index.ts`: `server.login({ email, password })` and `server.logout()` Astro Actions.
  - `src/env.d.ts` types for `App.Locals`.

- [ ] **Step 1: Write `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
import type { SupabaseClient, User } from '@supabase/supabase-js';
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: User | null;
    }
  }
}
export {};
```

- [ ] **Step 2: Write `src/middleware.ts`**

```ts
import { defineMiddleware } from 'astro:middleware';
import { createAnonServerClient } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createAnonServerClient(context.cookies);
  const { data: { user } } = await supabase.auth.getUser();
  context.locals.supabase = supabase;
  context.locals.user = user;

  const { pathname } = context.url;
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/admin/login';
  if (isAdmin && !isLogin && !user) {
    return context.redirect('/admin/login');
  }
  if (isLogin && user) {
    return context.redirect('/admin');
  }
  return next();
});
```

- [ ] **Step 3: Write `src/actions/index.ts` (login/logout)**

```ts
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createAnonServerClient } from '../lib/supabase';

export const server = {
  login: defineAction({
    accept: 'form',
    input: z.object({ email: z.string().email(), password: z.string().min(1) }),
    handler: async ({ email, password }, ctx) => {
      const supabase = createAnonServerClient(ctx.cookies);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Credenciales inválidas.' });
      return { ok: true };
    },
  }),
  logout: defineAction({
    accept: 'form',
    handler: async (_input, ctx) => {
      const supabase = createAnonServerClient(ctx.cookies);
      await supabase.auth.signOut();
      return { ok: true };
    },
  }),
};
```

- [ ] **Step 4: Write `src/pages/admin/login.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { actions } from 'astro:actions';
const result = Astro.getActionResult(actions.login);
if (result && !result.error) return Astro.redirect('/admin');
---
<BaseLayout title="Ingreso — Admin TEMPO">
  <main class="min-h-screen grid place-items-center bg-mist px-6">
    <form method="POST" action={actions.login} class="w-full max-w-sm bg-white rounded-xl border border-black/5 p-8 space-y-5">
      <h1 class="font-display font-bold text-2xl text-ink">Panel de administración</h1>
      {result?.error && <p class="text-sm text-red-600">{result.error.message}</p>}
      <label class="block text-sm">
        <span class="text-ink/70">Email</span>
        <input name="email" type="email" required class="mt-1 w-full rounded-md border border-ink/15 px-3 py-2" />
      </label>
      <label class="block text-sm">
        <span class="text-ink/70">Contraseña</span>
        <input name="password" type="password" required class="mt-1 w-full rounded-md border border-ink/15 px-3 py-2" />
      </label>
      <button class="w-full rounded-md bg-green text-white py-2.5 font-medium hover:bg-green-dark transition-colors">Ingresar</button>
    </form>
  </main>
</BaseLayout>
```

- [ ] **Step 5: Build to verify**

Run: `npm run build`
Expected: build succeeds (Actions and middleware compile).

- [ ] **Step 6: Manual smoke (requires `.env` + admin user from SETUP.md)**

Run `npm run dev`, open `/admin` → redirected to `/admin/login`. Log in with the Supabase admin user → redirected to `/admin` (will 500 until Task 9 creates the page; acceptable here, or verify redirect target only).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add auth middleware, login page, and login/logout actions"
```

---

### Task 9: Admin layout and dashboard (list works)

**Files:**
- Create: `src/layouts/AdminLayout.astro`
- Create: `src/pages/admin/index.astro`

**Interfaces:**
- Consumes: `Astro.locals.supabase`, `Astro.locals.user`, `getObras`, `categoriaLabel`, `actions.logout`.
- Produces: `AdminLayout.astro` props `{ title: string }` with nav (Obras, Contacto, Cerrar sesión) + slot.

- [ ] **Step 1: Write `src/layouts/AdminLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import { actions } from 'astro:actions';
interface Props { title: string; }
const { title } = Astro.props;
const path = Astro.url.pathname;
const nav = [
  { href: '/admin', label: 'Obras' },
  { href: '/admin/contacto', label: 'Contacto' },
];
---
<BaseLayout title={title}>
  <div class="min-h-screen bg-mist">
    <header class="bg-white border-b border-black/5">
      <div class="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-8">
          <span class="font-display font-bold text-ink">TEMPO · Admin</span>
          <nav class="flex gap-6 text-sm">
            {nav.map((n) => (
              <a href={n.href} class={`hover:text-green ${path === n.href ? 'text-green font-medium' : 'text-ink/70'}`}>{n.label}</a>
            ))}
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <a href="/" class="text-sm text-ink/60 hover:text-green">Ver sitio ↗</a>
          <form method="POST" action={actions.logout}>
            <button class="text-sm text-ink/70 hover:text-red-600">Cerrar sesión</button>
          </form>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-6 py-10">
      <h1 class="font-display font-bold text-2xl text-ink mb-8">{title}</h1>
      <slot />
    </main>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Write `src/pages/admin/index.astro`**

```astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
import { getObras } from '../../lib/queries';
import { categoriaLabel } from '../../lib/types';
const obras = await getObras(Astro.locals.supabase);
---
<AdminLayout title="Obras">
  <div class="flex justify-end mb-6">
    <a href="/admin/obras/new" class="rounded-md bg-green text-white px-5 py-2.5 text-sm font-medium hover:bg-green-dark">+ Nueva obra</a>
  </div>
  <div class="bg-white rounded-xl border border-black/5 overflow-hidden">
    {obras.length === 0
      ? <p class="p-8 text-ink/50 text-sm">No hay obras todavía. Crea la primera.</p>
      : (
        <table class="w-full text-sm">
          <thead class="bg-mist text-left text-ink/60">
            <tr><th class="px-5 py-3">Título</th><th class="px-5 py-3">Categoría</th><th class="px-5 py-3">Destacada</th><th class="px-5 py-3"></th></tr>
          </thead>
          <tbody>
            {obras.map((o) => (
              <tr class="border-t border-black/5">
                <td class="px-5 py-3 font-medium text-ink">{o.titulo}</td>
                <td class="px-5 py-3 text-ink/70">{categoriaLabel(o.categoria)}</td>
                <td class="px-5 py-3">{o.destacada ? '★' : '—'}</td>
                <td class="px-5 py-3 text-right"><a href={`/admin/obras/${o.id}/edit`} class="text-green hover:underline">Editar</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
  </div>
</AdminLayout>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add admin layout and works dashboard"
```

---

### Task 10: Create/edit work with photo upload (form + actions)

**Files:**
- Create: `src/components/ObraForm.astro`
- Create: `src/pages/admin/obras/new.astro`
- Create: `src/pages/admin/obras/[id]/edit.astro`
- Modify: `src/actions/index.ts` (add `saveObra` and `deleteFoto`)

**Interfaces:**
- Consumes: `createAdminClient`, `createAnonServerClient`, `slugify`, `CATEGORIAS`, `ESTADOS`, `getObraBySlug`/direct query.
- Produces in `src/actions/index.ts`:
  - `server.saveObra` (accept `'form'`): inputs `id?`, `titulo`, `categoria`, `descripcion?`, `ubicacion?`, `anio?`, `cliente?`, `estado?`, `destacada?`, `orden?`, `portada` (File?), `fotos` (File[]?). Upserts the work, uploads any files to bucket `obras` under `<obra_id>/`, sets `portada_url`, inserts `obra_fotos`. Returns `{ id }`.
  - `server.deleteFoto` (accept `'form'`): input `fotoId`, `path`. Deletes the storage object and the `obra_fotos` row.
- `ObraForm.astro` props `{ obra?: Obra }`.

- [ ] **Step 1: Add `saveObra` and `deleteFoto` to `src/actions/index.ts`**

Add these imports at the top and append to the `server` object:

```ts
import { createAdminClient } from '../lib/supabase';
import { slugify } from '../lib/queries';

// ...inside `export const server = { ...existing, `:

  saveObra: defineAction({
    accept: 'form',
    input: z.object({
      id: z.string().uuid().optional(),
      titulo: z.string().min(1),
      categoria: z.enum(['obra_construida', 'proyecto', 'peritaje', 'licitacion']),
      descripcion: z.string().optional(),
      ubicacion: z.string().optional(),
      anio: z.coerce.number().int().optional(),
      cliente: z.string().optional(),
      estado: z.enum(['en_curso', 'finalizada']).optional(),
      destacada: z.coerce.boolean().optional(),
      orden: z.coerce.number().int().optional(),
      portada: z.instanceof(File).optional(),
      fotos: z.array(z.instanceof(File)).optional(),
    }),
    handler: async (input, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const base = {
        titulo: input.titulo,
        slug: slugify(input.titulo),
        categoria: input.categoria,
        descripcion: input.descripcion ?? null,
        ubicacion: input.ubicacion ?? null,
        anio: input.anio ?? null,
        cliente: input.cliente ?? null,
        estado: input.estado ?? null,
        destacada: input.destacada ?? false,
        orden: input.orden ?? 0,
      };

      let obraId = input.id;
      if (obraId) {
        const { error } = await admin.from('obras').update(base).eq('id', obraId);
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
      } else {
        const { data, error } = await admin.from('obras').insert(base).select('id').single();
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
        obraId = data!.id as string;
      }

      const upload = async (file: File): Promise<string> => {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const key = `${obraId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await admin.storage.from('obras').upload(key, file, { contentType: file.type, upsert: false });
        if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
        return admin.storage.from('obras').getPublicUrl(key).data.publicUrl;
      };

      if (input.portada && input.portada.size > 0) {
        const url = await upload(input.portada);
        await admin.from('obras').update({ portada_url: url }).eq('id', obraId);
      }
      const fotos = (input.fotos ?? []).filter((f) => f && f.size > 0);
      for (const f of fotos) {
        const url = await upload(f);
        await admin.from('obra_fotos').insert({ obra_id: obraId, url });
      }
      return { id: obraId };
    },
  }),

  deleteFoto: defineAction({
    accept: 'form',
    input: z.object({ fotoId: z.string().uuid(), url: z.string() }),
    handler: async ({ fotoId, url }, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const path = url.split('/object/public/obras/')[1];
      if (path) await admin.storage.from('obras').remove([path]);
      await admin.from('obra_fotos').delete().eq('id', fotoId);
      return { ok: true };
    },
  }),
```

- [ ] **Step 2: Write `src/components/ObraForm.astro`**

```astro
---
import type { Obra } from '../lib/types';
import { CATEGORIAS, ESTADOS } from '../lib/types';
import { actions } from 'astro:actions';
interface Props { obra?: Obra; }
const { obra } = Astro.props;
const fotos = (obra?.obra_fotos ?? []).sort((a, b) => a.orden - b.orden);
const field = 'mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm';
---
<form method="POST" action={actions.saveObra} enctype="multipart/form-data" class="space-y-6 bg-white rounded-xl border border-black/5 p-8 max-w-3xl">
  {obra && <input type="hidden" name="id" value={obra.id} />}
  <div class="grid gap-6 sm:grid-cols-2">
    <label class="block text-sm sm:col-span-2"><span class="text-ink/70">Título *</span>
      <input name="titulo" required value={obra?.titulo ?? ''} class={field} /></label>
    <label class="block text-sm"><span class="text-ink/70">Categoría *</span>
      <select name="categoria" class={field}>
        {CATEGORIAS.map((c) => <option value={c.value} selected={obra?.categoria === c.value}>{c.label}</option>)}
      </select></label>
    <label class="block text-sm"><span class="text-ink/70">Estado</span>
      <select name="estado" class={field}>
        <option value="">—</option>
        {ESTADOS.map((e) => <option value={e.value} selected={obra?.estado === e.value}>{e.label}</option>)}
      </select></label>
    <label class="block text-sm"><span class="text-ink/70">Ubicación</span>
      <input name="ubicacion" value={obra?.ubicacion ?? ''} class={field} /></label>
    <label class="block text-sm"><span class="text-ink/70">Año</span>
      <input name="anio" type="number" value={obra?.anio ?? ''} class={field} /></label>
    <label class="block text-sm"><span class="text-ink/70">Cliente / Mandante</span>
      <input name="cliente" value={obra?.cliente ?? ''} class={field} /></label>
    <label class="block text-sm"><span class="text-ink/70">Orden</span>
      <input name="orden" type="number" value={obra?.orden ?? 0} class={field} /></label>
    <label class="block text-sm sm:col-span-2"><span class="text-ink/70">Descripción</span>
      <textarea name="descripcion" rows="5" class={field}>{obra?.descripcion ?? ''}</textarea></label>
    <label class="flex items-center gap-2 text-sm sm:col-span-2">
      <input name="destacada" type="checkbox" value="true" checked={obra?.destacada} /> <span class="text-ink/70">Destacar en la portada</span></label>
  </div>

  <div class="border-t border-black/5 pt-6 space-y-4">
    <label class="block text-sm"><span class="text-ink/70">Foto de portada {obra?.portada_url && '(reemplaza la actual)'}</span>
      <input name="portada" type="file" accept="image/*" class="mt-1 block text-sm" /></label>
    {obra?.portada_url && <img src={obra.portada_url} alt="portada" class="h-28 rounded-md object-cover" />}
    <label class="block text-sm"><span class="text-ink/70">Agregar fotos a la galería</span>
      <input name="fotos" type="file" accept="image/*" multiple class="mt-1 block text-sm" /></label>
  </div>

  <button class="rounded-md bg-green text-white px-6 py-2.5 text-sm font-medium hover:bg-green-dark">Guardar obra</button>
</form>

{fotos.length > 0 && (
  <div class="mt-8 max-w-3xl">
    <h3 class="font-display font-semibold text-ink mb-3">Galería actual</h3>
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {fotos.map((f) => (
        <div class="relative group">
          <img src={f.url} alt={f.alt ?? ''} class="aspect-square object-cover rounded-md" />
          <form method="POST" action={actions.deleteFoto} class="absolute top-1 right-1">
            <input type="hidden" name="fotoId" value={f.id} />
            <input type="hidden" name="url" value={f.url} />
            <button class="bg-white/90 text-red-600 rounded px-2 py-0.5 text-xs opacity-0 group-hover:opacity-100" title="Eliminar">✕</button>
          </form>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Write `src/pages/admin/obras/new.astro`**

```astro
---
import AdminLayout from '../../../layouts/AdminLayout.astro';
import ObraForm from '../../../components/ObraForm.astro';
import { actions } from 'astro:actions';
const result = Astro.getActionResult(actions.saveObra);
if (result && !result.error) return Astro.redirect(`/admin/obras/${result.data.id}/edit`);
---
<AdminLayout title="Nueva obra">
  {result?.error && <p class="text-sm text-red-600 mb-4">{result.error.message}</p>}
  <ObraForm />
</AdminLayout>
```

- [ ] **Step 4: Write `src/pages/admin/obras/[id]/edit.astro`**

```astro
---
import AdminLayout from '../../../../layouts/AdminLayout.astro';
import ObraForm from '../../../../components/ObraForm.astro';
import { actions } from 'astro:actions';
import type { Obra } from '../../../../lib/types';

const { id } = Astro.params;
const { data } = await Astro.locals.supabase.from('obras').select('*, obra_fotos(*)').eq('id', id).single();
const obra = data as Obra | null;
if (!obra) return Astro.redirect('/admin');
const result = Astro.getActionResult(actions.saveObra);
---
<AdminLayout title={`Editar: ${obra.titulo}`}>
  {result?.error && <p class="text-sm text-red-600 mb-4">{result.error.message}</p>}
  {result && !result.error && <p class="text-sm text-green mb-4">Cambios guardados.</p>}
  <ObraForm obra={obra} />
</AdminLayout>
```

- [ ] **Step 5: Build to verify**

Run: `npm run build`
Expected: build succeeds (actions, form, pages compile).

- [ ] **Step 6: Manual smoke (requires `.env` + Storage bucket + admin user)**

Run `npm run dev`, log in, create a work with a cover photo and 2 gallery photos. Verify it appears in `/admin`, in `/portafolio`, and its detail page shows the gallery. Delete a gallery photo and confirm it disappears.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add work create/edit forms with photo upload and deletion"
```

---

### Task 11: Delete work action

**Files:**
- Modify: `src/actions/index.ts` (add `deleteObra`)
- Modify: `src/pages/admin/obras/[id]/edit.astro` (add delete button)

**Interfaces:**
- Produces: `server.deleteObra` (accept `'form'`): input `id`. Removes all storage objects under `<id>/`, deletes the work row (cascade removes `obra_fotos`). Redirect handled by the page.

- [ ] **Step 1: Add `deleteObra` to `src/actions/index.ts`**

```ts
  deleteObra: defineAction({
    accept: 'form',
    input: z.object({ id: z.string().uuid() }),
    handler: async ({ id }, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const { data: files } = await admin.storage.from('obras').list(id);
      if (files && files.length) {
        await admin.storage.from('obras').remove(files.map((f) => `${id}/${f.name}`));
      }
      const { error } = await admin.from('obras').delete().eq('id', id);
      if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
      return { ok: true };
    },
  }),
```

- [ ] **Step 2: Add delete form to `src/pages/admin/obras/[id]/edit.astro`**

Add this just after the success/error messages (before `<ObraForm .../>`), and add the redirect-on-delete near the top action-result handling:

At the top, after `const result = ...`, add:

```ts
const delResult = Astro.getActionResult(actions.deleteObra);
if (delResult && !delResult.error) return Astro.redirect('/admin');
```

Add the `deleteObra` import is already covered by `actions`. Then near the bottom of the layout body add:

```astro
<form method="POST" action={actions.deleteObra} class="mt-8 max-w-3xl"
      onsubmit="return confirm('¿Eliminar esta obra y todas sus fotos? Esta acción no se puede deshacer.')">
  <input type="hidden" name="id" value={obra.id} />
  <button class="text-sm text-red-600 hover:underline">Eliminar obra</button>
</form>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke**

Create a throwaway work, then delete it; confirm it disappears from `/admin` and its photos are gone from Storage.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add delete work action with storage cleanup"
```

---

### Task 12: Edit contact info

**Files:**
- Create: `src/pages/admin/contacto.astro`
- Modify: `src/actions/index.ts` (add `saveContacto`)

**Interfaces:**
- Consumes: `getContacto`, `createAdminClient`, `Astro.locals.supabase`.
- Produces: `server.saveContacto` (accept `'form'`): inputs `razon_social`, `direccion?`, `telefono?`, `email?`, `horario?`, `linkedin?`, `instagram?`, `mapa_embed?`. Updates the single `contacto` row (id = 1); packs social links into `redes` jsonb.

- [ ] **Step 1: Add `saveContacto` to `src/actions/index.ts`**

```ts
  saveContacto: defineAction({
    accept: 'form',
    input: z.object({
      razon_social: z.string().min(1),
      direccion: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().optional(),
      horario: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      mapa_embed: z.string().optional(),
    }),
    handler: async (input, ctx) => {
      if (!ctx.locals.user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autorizado.' });
      const admin = createAdminClient();
      const redes: Record<string, string> = {};
      if (input.linkedin) redes.linkedin = input.linkedin;
      if (input.instagram) redes.instagram = input.instagram;
      const { error } = await admin.from('contacto').update({
        razon_social: input.razon_social,
        direccion: input.direccion ?? null,
        telefono: input.telefono ?? null,
        email: input.email ?? null,
        horario: input.horario ?? null,
        mapa_embed: input.mapa_embed ?? null,
        redes: Object.keys(redes).length ? redes : null,
      }).eq('id', 1);
      if (error) throw new ActionError({ code: 'BAD_REQUEST', message: error.message });
      return { ok: true };
    },
  }),
```

- [ ] **Step 2: Write `src/pages/admin/contacto.astro`**

```astro
---
import AdminLayout from '../../layouts/AdminLayout.astro';
import { getContacto } from '../../lib/queries';
import { actions } from 'astro:actions';
const contacto = await getContacto(Astro.locals.supabase);
const result = Astro.getActionResult(actions.saveContacto);
const field = 'mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm';
---
<AdminLayout title="Información de contacto">
  {result?.error && <p class="text-sm text-red-600 mb-4">{result.error.message}</p>}
  {result && !result.error && <p class="text-sm text-green mb-4">Contacto actualizado.</p>}
  <form method="POST" action={actions.saveContacto} class="space-y-5 bg-white rounded-xl border border-black/5 p-8 max-w-2xl">
    <label class="block text-sm"><span class="text-ink/70">Razón social *</span>
      <input name="razon_social" required value={contacto?.razon_social ?? ''} class={field} /></label>
    <label class="block text-sm"><span class="text-ink/70">Dirección</span>
      <input name="direccion" value={contacto?.direccion ?? ''} class={field} /></label>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="block text-sm"><span class="text-ink/70">Teléfono</span>
        <input name="telefono" value={contacto?.telefono ?? ''} class={field} /></label>
      <label class="block text-sm"><span class="text-ink/70">Email</span>
        <input name="email" type="email" value={contacto?.email ?? ''} class={field} /></label>
    </div>
    <label class="block text-sm"><span class="text-ink/70">Horario</span>
      <input name="horario" value={contacto?.horario ?? ''} class={field} /></label>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="block text-sm"><span class="text-ink/70">LinkedIn (URL)</span>
        <input name="linkedin" value={contacto?.redes?.linkedin ?? ''} class={field} /></label>
      <label class="block text-sm"><span class="text-ink/70">Instagram (URL)</span>
        <input name="instagram" value={contacto?.redes?.instagram ?? ''} class={field} /></label>
    </div>
    <label class="block text-sm"><span class="text-ink/70">Mapa (URL de iframe de Google Maps)</span>
      <input name="mapa_embed" value={contacto?.mapa_embed ?? ''} class={field} /></label>
    <button class="rounded-md bg-green text-white px-6 py-2.5 text-sm font-medium hover:bg-green-dark">Guardar contacto</button>
  </form>
</AdminLayout>
```

- [ ] **Step 3: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke (full end-to-end)**

Run `npm run dev`. Log in → edit contact → save → confirm the footer on `/` and `/portafolio` reflects the new info. This completes the end-to-end verification of all success criteria.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add editable contact info admin page"
```

---

## Self-Review Notes

- **Spec coverage:** Landing (T5) ✓, portfolio list+filter (T6) ✓, detail+gallery (T7) ✓, admin login+middleware (T8) ✓, dashboard (T9) ✓, create/edit + uploads (T10) ✓, delete (T11) ✓, contact edit (T12) ✓, DB+RLS+storage (T3) ✓, types+clients (T2) ✓, brand/logo (T4) ✓, env (T1/T3) ✓. All spec sections map to a task.
- **Service-role safety:** `createAdminClient` is only imported in `src/actions/index.ts` (server) — never in `.astro` client islands. ✓
- **Type consistency:** `Obra`, `Contacto`, `Categoria`, `Estado`, `slugify`, `getObras`, `getContacto`, `getObraBySlug`, `createAnonServerClient`, `createAdminClient` names are consistent across tasks. ✓
- **Note on testing:** Pure logic (slugify, type helpers) uses Vitest TDD. SSR pages/actions are verified via `npm run build` (compile/type check) + manual smoke against a configured Supabase project, since they require live Supabase + Storage and browser interaction.
