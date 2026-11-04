# Database setup

## Current storage status

The owner has configured a Supabase project and reports that Google sign-in and the admin role work. Gym edits and favorites are still stored in browser `localStorage`; they are not yet shared across browsers or devices. The Supabase Auth client is configured locally, while the repository layer still needs its Supabase-backed implementation.

The SQL schema in `supabase/migrations/20261104000000_initial_schema.sql` prepares a Supabase Postgres database with PostGIS, gym listings and prices, amenity catalog data, photos, user profiles, and per-user favorites. Row-level security is enabled for all app tables.

## Connect a Supabase project

1. Create a Supabase project using its free plan. A database project has not been created on your behalf.
2. In the Supabase Dashboard, open **SQL Editor**, paste the contents of the migration file, and run it.
3. In **Project Settings > API**, copy the project URL and the anon/public key.
4. `.env.local` contains the project URL for the configured Supabase project. Add its anon/public key as `VITE_SUPABASE_ANON_KEY`. Use the project URL root (`https://<project-ref>.supabase.co`), not the REST endpoint path ending in `/rest/v1`.
5. Restart the Vite development server after changing environment variables.
6. Confirm the schema is present in **Table Editor**. New Google accounts are created with the `user` role by the profile trigger.

The anon/public key is expected in a browser app. Never put a Supabase service-role key in a `VITE_` variable or ship it to the browser. RLS is the security boundary for browser requests.

## Enable Google sign-in

Google sign-in uses Supabase Auth. It is not active until a Supabase project and Google OAuth credentials are configured. The gym and favorite repositories remain localStorage-backed; enabling Auth does not migrate or upload their data.

1. In Google Cloud Console, create an OAuth client ID for a **Web application**.
2. Add your app origins as **Authorized JavaScript origins**, for example `http://localhost:5173` and your production origin.
3. In the Supabase Dashboard, open **Authentication > Providers > Google** and enable Google. Copy the callback URL shown by Supabase into the Google client's **Authorized redirect URIs** (it normally has the form `https://<project-ref>.supabase.co/auth/v1/callback`).
4. Paste the Google client ID and client secret into the Supabase Google provider settings. Keep the client secret in Supabase; never put it in `.env.local`, source code, or a `VITE_` variable.
5. In **Authentication > URL Configuration**, set the production site URL and allow the app's sign-in callback paths, including `http://localhost:5173/login` for local development and `https://your-domain.example/login` for production.
6. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, restart Vite, and select **Continue with Google** on the sign-in page.
7. The app reads the authenticated user's `profiles` row to apply its role. Grant admin access only by promoting a trusted profile with the SQL below; Google account details never grant admin access by themselves.

The Google button is replaced by local demo roles when Supabase is not configured. Once configured, only Supabase-authenticated profile roles are used. A Supabase project is required for this authentication path; no project has been created or connected for this app.

## Admin account

New accounts receive the `user` role. Users cannot change their own role through the app. After creating the trusted admin account, promote its profile from the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'admin@example.com'
);
```

Replace the example address with the admin account's email. Do not expose a role-editing interface to ordinary users.

## Current integration boundary

The migration and environment-aware Supabase client are ready. Google OAuth sign-in and profile-backed role loading are implemented and the owner reports that authentication works. The UI depends on asynchronous `GymRepository` and `FavoriteRepository` contracts, selected through the feature repository modules and used by TanStack Query hooks. The current implementations are still localStorage adapters. Until Supabase-backed repositories replace them, gym CRUD in the UI does not exercise database RLS.

Applying the migration alone will not move browser data into Postgres. The next integration work is to implement the repository contracts against Supabase, then test RLS with anonymous, normal-user, and admin sessions. Any test gym should be clearly labeled and removed after testing; do not seed unverified listings.

To keep initial setup reversible, seed listings are not inserted into the hosted database automatically. Import only verified gym details once the live data source and verification process are ready.
