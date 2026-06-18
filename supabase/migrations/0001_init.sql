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
