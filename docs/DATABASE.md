# Database setup

## Current storage status

The owner has configured a Supabase project and reports that Google sign-in and the admin role work. When Supabase environment values are configured, gym edits and favorites use the hosted project; without them, the app uses browser `localStorage`.

The SQL schema in `supabase/migrations/20261104000000_initial_schema.sql` prepares a Supabase Postgres database with PostGIS, gym listings and prices, amenity catalog data, photos, user profiles, and per-user favorites. Row-level security is enabled for all app tables.

The app's gym and favorite repositories use Supabase when both environment values are configured; otherwise they use localStorage. Apply the initial schema migration first, then apply `supabase/migrations/20261104010000_atomic_gym_upsert.sql` to enable atomic admin gym saves. This later migration uses an authenticated, security-invoker function, so database RLS policies still decide whether the caller may modify gym, price, photo, and amenity rows.

## Connect a Supabase project

1. In the Supabase Dashboard, open **SQL Editor** and run `20261104000000_initial_schema.sql`.
2. Then run `20261104010000_atomic_gym_upsert.sql`. The admin form needs this migration to save a gym and its related records atomically.
3. Run `20261104020000_admin_user_management.sql` to enable website-based admin promotion.
4. Confirm the schema, `save_gym`, and `promote_user_to_admin` functions are present. New Google accounts receive the `user` role from the profile trigger.
5. The project URL and publishable/anon key belong in the ignored `.env.local` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Use the project root URL (`https://<project-ref>.supabase.co`), not the REST endpoint path ending in `/rest/v1`.
6. Restart the Vite development server after changing environment variables.

The anon/public key is expected in a browser app. Never put a Supabase service-role key in a `VITE_` variable or ship it to the browser. RLS is the security boundary for browser requests.

## Enable Google sign-in

Google sign-in uses Supabase Auth. The owner reports that Google login is configured and working for this project. Configuring Auth does not migrate any data previously saved in browser localStorage.

1. In Google Cloud Console, create an OAuth client ID for a **Web application**.
2. Add your app origins as **Authorized JavaScript origins**, for example `http://localhost:5173` and your production origin.
3. In the Supabase Dashboard, open **Authentication > Providers > Google** and enable Google. Copy the callback URL shown by Supabase into the Google client's **Authorized redirect URIs** (it normally has the form `https://<project-ref>.supabase.co/auth/v1/callback`).
4. Paste the Google client ID and client secret into the Supabase Google provider settings. Keep the client secret in Supabase; never put it in `.env.local`, source code, or a `VITE_` variable.
5. In **Authentication > URL Configuration**, set the production site URL and allow the app's sign-in callback paths, including `http://localhost:5173/login` for local development and `https://your-domain.example/login` for production.
6. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, restart Vite, and select **Continue with Google** on the sign-in page.
7. The app reads the authenticated user's `profiles` row to apply its role. Grant admin access only by promoting a trusted profile with the SQL below; Google account details never grant admin access by themselves.

The Google button is replaced by local demo roles when Supabase is not configured. Once configured, only Supabase-authenticated profile roles are used. Gym data uses Supabase only when the project URL and publishable/anon key are both configured.

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

After applying `20261104020000_admin_user_management.sql`, existing admins can also grant admin access from **Admin > Administrator access**:

1. The person must first sign in once with Google so Supabase creates their account and profile.
2. Enter the exact account email in the admin access form and submit.
3. The database function verifies the caller is already an admin and performs the role change. A browser-side role check alone cannot grant access.
4. The promoted person must sign out and sign in again to reload their profile role.

The function only promotes existing accounts and is not callable by anonymous users. There is intentionally no public user search or self-service role editor.

## Current integration boundary

The migration and environment-aware Supabase client are ready. Google OAuth sign-in and profile-backed role loading are implemented and the owner reports that authentication works. The UI depends on asynchronous `GymRepository` and `FavoriteRepository` contracts selected through the feature repository module and used by TanStack Query hooks. Supabase repositories are selected when the project URL and publishable/anon key are configured.

Applying the migrations does not upload browser-local data or seed gym listings. Both migrations must be applied before using the admin form. Then restart Vite and test RLS with anonymous, normal-user, and admin sessions. Any permission-test gym should be clearly labeled and removed after testing; do not seed unverified listings.

To keep initial setup reversible, seed listings are not inserted into the hosted database automatically. Import only verified gym details once the live data source and verification process are ready.
