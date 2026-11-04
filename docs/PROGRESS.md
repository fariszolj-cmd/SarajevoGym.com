# Progress

## Current status
- Project initialized in the root of the requested GitHub repository path and linked to the GitHub remote: https://github.com/fariszolj-cmd/SarajevoGym.com
- The Vite React + TypeScript foundation is installed and the long-term SarajevoGym feature structure is in place.
- Core app pages, route structure, gym discovery flow, map integration, and i18n-driven layout have been implemented.
- Admin gym management and persistence have been added with local data storage, validation via Zod, and list/detail integration.
- The UI has been modernized to a more polished, editorial, dark-and-warm style with clearer hierarchy and better spacing.
- Authentication-ready architecture has been added with an auth context, login flow, and admin-only route guard for future Supabase integration.
- Favorites now have a saved-list page, and the home page has responsive quick filters and a 10-BAM price selector capped at 150 BAM.
- A Supabase Postgres/PostGIS initial schema and row-level security policies have been prepared, with environment configuration and setup guidance.
- Gym and favorites UI now use asynchronous repository contracts and TanStack Query, with validated localStorage adapters selected centrally in `src/features/gyms/repositories.ts`.
- The owner reports that Google sign-in now works and the owner account has the admin role. Supabase project configuration is local in ignored `.env.local`.
- Gym and favorites now select Supabase-backed repositories when project configuration is present; localStorage remains the fallback when it is absent.
- Admin gym saves use a security-invoker database function in `20261104010000_atomic_gym_upsert.sql` so the gym and its related price/amenity/photo data update atomically under existing RLS rules.
- Anonymous browser verification confirms public gym reads succeed, the Admin navigation link is hidden, and direct `/admin` access is denied. Anonymous Supabase profile reads return no rows, and an anonymous gym insert is denied with HTTP 401 / PostgreSQL code `42501`.
- The new atomic-save RPC is not yet present in the hosted project (anonymous probe returned `PGRST202`), so no authenticated gym-write test was attempted. The owner must apply the new migration before admin form writes can succeed.
- Privacy and prototype-use pages, translated route metadata, a branded favicon, and install metadata are in place. These pages describe the current demo and are not legal advice.
- CI is configured to run lint, tests, and a production build. Repository tests cover the local gym and favorites adapters.
- The discovery page now pairs a sticky map with a single-column results panel on wide screens, stacks them on mobile, and uses locally generated abstract card artwork without adding gym facts or image services.
- Keyboard, focus, form, contrast, and live-status improvements have been applied across the main flows. A 320px browser check confirmed no horizontal overflow.
- Google OAuth sign-in is wired through Supabase Auth, with profile-backed roles, safe user-role defaults for new accounts, and bilingual setup/error messaging. The owner has confirmed successful Google sign-in and admin access.
- The current lint, test, and TypeScript/Vite production build checks pass.

## Next step
- Apply the new atomic-save migration in Supabase after the initial schema migration, then exercise gym CRUD and favorites with the real admin account.
- Verify normal-user behavior against RLS as well as admin behavior. Use and remove a clearly labeled temporary test gym rather than adding unverified listings.
- Do not seed or publish real gym facts; the owner will enter verified listings manually.
- Choose a hosting provider and complete its deployment configuration; the current app has not been deployed.
- Review the demo legal disclosures with appropriate counsel before treating them as production policies.
- Continue final form, error-state, and mobile interaction checks without introducing paid services or external gym-image dependencies.

## Decisions
- Stack selected: Vite + React + TypeScript + React Router + TanStack Query + Tailwind + Leaflet + Zod + i18next.
- Primary app direction: full long-term gym finder experience with a clean feature-based architecture.
- Default locale assumptions: Bosnian / English and BAM currency for Sarajevo-focused UX.
- Admin and public app surfaces are separated into explicit route modules to keep the structure scalable.
- Local storage-backed repositories remain available when Supabase is unconfigured.
- Auth is intentionally implemented behind a small role-based abstraction so the app can evolve cleanly toward Supabase or a custom backend without rewriting UI flows.
- Supabase schema setup is versioned in `supabase/migrations/`; the browser app must use only the anon/public key and rely on RLS.
- Visual direction: flat, high-contrast, warm-neutral editorial design rather than generic blue gradients or template styling.
- Data integrity constraint: only publish verified gym information. Any temporary permission-test listing must be clearly labeled and removed after testing.
