## Como lo cobro

Aplicacion web en Next.js + Supabase para buscar guias de cobro por empresa o servicio.

## GitHub + Supabase

Si conectas este repo desde Supabase, usa estos valores:

- `GitHub Repository`: tu repo
- `Working directory`: `.`
- `Production branch name`: `main`

La carpeta `supabase/` ya quedo preparada con:

- `config.toml`
- `migrations/`
- `seed.sql`

## Variables de entorno

Crea `.env.local` a partir de `.env.example` y completa:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD_HASH`
- `JWT_SECRET`

## Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).
