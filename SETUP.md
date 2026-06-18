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
