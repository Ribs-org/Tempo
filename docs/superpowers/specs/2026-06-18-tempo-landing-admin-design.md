# Tempo S.A. — Landing + Admin de Portafolio — Diseño

**Fecha:** 2026-06-18
**Estado:** Aprobado para implementación

## 1. Objetivo

Sitio web para **Tempo S.A.**, consultora de ingeniería y proyectos (constructora,
proyectista, perita de obras, participante en licitaciones). El sitio debe:

1. Mostrar un **portafolio de obras** de forma sobria y profesional.
2. Ofrecer un **panel de administración** para gestionar las obras (subir fotos e
   información de cada obra) y la información de contacto.
3. Mostrar la **información de contacto** en el pie, editable desde el admin.

## 2. Stack

- **Astro** en modo **híbrido** (`output: 'server'` con páginas públicas marcadas
  `export const prerender = true`).
- **Adaptador:** `@astrojs/node` (standalone). Reemplazable por Vercel/Netlify más adelante.
- **Supabase:** Postgres (datos), Storage (fotos), Auth (login admin).
- **`@supabase/ssr`** para manejo de sesión server-side con cookies.
- **Estilos:** Tailwind CSS (o CSS propio con tokens) — definir en el plan; preferencia Tailwind.
- **Tipografías:** titulares geométricos (Space Grotesk / Sora), cuerpo Inter.

## 3. Arquitectura y estructura de páginas

### Público (SSR, lectura con anon key)
- `/` — Landing: hero, servicios, obras destacadas, sobre la empresa, contacto (footer).
- `/portafolio` — Listado de obras con filtro por categoría.
- `/portafolio/[slug]` — Detalle de una obra con galería de fotos.

> Nota: las páginas públicas se renderizan **SSR** leyendo datos de Supabase con la
> `anon key`, de modo que el contenido editado en el admin aparece sin re-deploy. Solo
> páginas verdaderamente estáticas (p. ej. textos legales, si existieran) se prerenderizan.

### Admin (SSR, protegido)
- `/admin/login` — Formulario de login (email/contraseña).
- `/admin` — Dashboard: listado de obras con acciones crear / editar / eliminar.
- `/admin/obras/new` — Crear obra (formulario + subida de fotos).
- `/admin/obras/[id]/edit` — Editar obra y su galería.
- `/admin/contacto` — Editar la información de contacto.

### Componentes clave
- `Logo.astro` — isotipo SVG (arco naranja + tres barras verdes) + wordmark.
- `Header.astro`, `Footer.astro` (footer consume tabla `contacto`).
- `ObraCard.astro`, `ObraGallery.astro`, `CategoryFilter.astro`.
- `AdminLayout.astro`, `ObraForm.astro`, `ImageUploader.astro`.
- `lib/supabase.ts` — fábrica de clientes: cliente browser (anon), cliente server con
  cookies (anon, sesión), y cliente admin (service role, solo server).

## 4. Modelo de datos (Postgres)

### Tabla `obras`
| campo        | tipo                                   | notas                          |
|--------------|----------------------------------------|--------------------------------|
| id           | uuid PK default gen_random_uuid()      |                                |
| slug         | text unique not null                   | derivado del título            |
| titulo       | text not null                          |                                |
| categoria    | text not null                          | enum: `obra_construida`, `proyecto`, `peritaje`, `licitacion` |
| descripcion  | text                                   |                                |
| ubicacion    | text                                   |                                |
| anio         | int                                    |                                |
| cliente      | text                                   | cliente / mandante             |
| estado       | text                                   | enum: `en_curso`, `finalizada` |
| portada_url  | text                                   | URL pública en Storage         |
| destacada    | boolean default false                  | aparece en la landing          |
| orden        | int default 0                          | orden de despliegue            |
| created_at   | timestamptz default now()              |                                |

Restricción CHECK sobre `categoria` y `estado` para validar los valores del enum.

### Tabla `obra_fotos`
| campo    | tipo                              | notas                       |
|----------|-----------------------------------|-----------------------------|
| id       | uuid PK default gen_random_uuid() |                             |
| obra_id  | uuid FK -> obras(id) on delete cascade |                        |
| url      | text not null                     | URL pública en Storage      |
| alt      | text                              | texto alternativo           |
| orden    | int default 0                     |                             |

### Tabla `contacto` (fila única)
| campo         | tipo  | notas                              |
|---------------|-------|------------------------------------|
| id            | int PK (siempre 1, CHECK id = 1)   |              |
| razon_social  | text  | "TEMPO S.A. — Consultora de Ingeniería y Proyectos" |
| direccion     | text  |                                    |
| telefono      | text  |                                    |
| email         | text  |                                    |
| horario       | text  |                                    |
| redes         | jsonb | { linkedin, instagram, ... } opc.  |
| mapa_embed    | text  | URL/iframe de mapa, opcional       |

### Storage
- Bucket **`obras`**, lectura pública. Las fotos se suben con ruta `obras/<obra_id>/<archivo>`.

## 5. Seguridad (RLS y claves)

- **RLS activado** en `obras`, `obra_fotos`, `contacto`.
  - Política SELECT pública (rol `anon`) en las tres tablas → el sitio público puede leer.
  - INSERT/UPDATE/DELETE **denegado** a `anon`/`authenticated` vía RLS; todas las escrituras
    pasan por el servidor con la **service role key** (que bypassa RLS).
- **Auth:** Supabase Auth, email/contraseña, **un solo admin** (se crea manualmente en el
  dashboard de Supabase o por script). No hay registro público.
- **Middleware** (`src/middleware.ts`): protege `/admin/*` (excepto `/admin/login`). Si no
  hay sesión válida de Supabase, redirige a `/admin/login`.
- Claves:
  - `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` — expuestas al cliente.
  - `SUPABASE_SERVICE_ROLE_KEY` — **solo servidor**, nunca enviada al cliente.

## 6. Flujos de escritura

Implementados con **Astro Actions** (o rutas API en `src/pages/api/`) que corren en servidor:

- **Crear/editar obra:** valida campos, genera/actualiza `slug`, hace upsert en `obras`.
- **Subir foto:** recibe el archivo, lo sube al bucket `obras`, obtiene la URL pública,
  inserta fila en `obra_fotos` (o setea `portada_url`).
- **Eliminar obra:** borra fotos del Storage + filas (cascade) + la obra.
- **Editar contacto:** update de la fila única `contacto`.
- **Login/Logout:** `signInWithPassword` / `signOut` de Supabase Auth, set/clear de cookies.

Validación de formularios en servidor (campos requeridos, tamaño/tipo de imagen).

## 7. Identidad visual

- **Paleta** (derivada del logo):
  - Verde corporativo (principal) — usado en acentos, líneas, botones.
  - Naranja (acento secundario) — destaques puntuales (arco del isotipo).
  - Negro/grafito para titulares; blancos y grises claros para fondos.
- **Tipografía:** titulares geométricos (Space Grotesk / Sora), cuerpo Inter.
- **Isotipo:** SVG recreando arco naranja incompleto + tres barras verticales verdes de
  distinta altura; wordmark "TEMPO" geométrico negro + "S.A." pequeño; línea verde + slogan
  "CONSULTORA DE INGENIERÍA Y PROYECTOS".
- **Tono:** sobrio, limpio, profesional, con espacio en blanco generoso. El refinamiento
  visual final se realiza con la skill de diseño frontend durante la implementación.
- **Idioma:** español (Chile).

## 8. Variables de entorno

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Se entrega `.env.example`. El usuario ya posee las credenciales de su proyecto Supabase.

## 9. Migraciones / setup

- Script SQL (`supabase/migrations/0001_init.sql`) que crea tablas, enums (CHECK),
  políticas RLS, y la fila por defecto de `contacto`.
- Instrucción para crear el bucket `obras` (público) y el usuario admin.

## 10. Fuera de alcance (YAGNI)

- Multi-idioma, blog/noticias, formulario de contacto con envío de correo (el contacto es
  informativo), múltiples usuarios admin, analíticas, CMS externo.

## 11. Criterios de éxito

1. La landing muestra servicios, obras destacadas y contacto reales desde Supabase.
2. `/portafolio` lista y filtra obras; el detalle muestra galería.
3. El admin permite login, crear/editar/eliminar obras con subida de fotos, y editar contacto.
4. Los cambios del admin se reflejan en el sitio público sin re-deploy.
5. La service role key nunca llega al cliente; `/admin/*` exige sesión.
