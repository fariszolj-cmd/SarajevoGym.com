# SarajevoGym

SarajevoGym is a bilingual gym discovery app for Sarajevo, Bosnia and Herzegovina. It currently provides gym listings, filters, a map, gym details, favorites, and a local demo admin experience.

## Run locally

Requirements: Node.js 22 or later and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. To validate a production build and lint:

```powershell
npm run build
npm run lint
```

## Database status

The Supabase project and Google sign-in are configured by the owner, who reports successful login and admin access. With both Supabase environment values present, gym listings and favorites use Supabase; without them, they use browser `localStorage`. The schema and RLS migrations are in `supabase/migrations/`; setup and integration status are in [docs/DATABASE.md](./docs/DATABASE.md).

Google account sign-in uses Supabase Auth. When both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, gym and favorite operations use Supabase repositories; otherwise, localStorage adapters support offline/local demo development.

The UI reads gyms and favorites through asynchronous repository interfaces in `src/features/gyms/`. `src/features/gyms/repositories.ts` selects the Supabase adapters when configured and otherwise uses localStorage adapters. Pages and query hooks do not access browser storage directly.

Never put a Supabase service-role key in the browser or a `VITE_` environment variable.

## Project structure

- `src/pages/` — public, gym detail, saved, and admin pages
- `src/features/gyms/` — gym model, localStorage/Supabase repository adapters, and query hooks
- `src/features/auth/` — Google OAuth integration, local demo identity, profile roles, and route guard
- `src/features/map/` — Leaflet map components
- `src/lib/` — app configuration and lazily initialized Supabase client
- `supabase/migrations/` — versioned database schema and security policies
- `docs/` — database setup, project status, and free-tier limits

See [docs/LIMITS.md](./docs/LIMITS.md) for current provider and free-tier considerations.
