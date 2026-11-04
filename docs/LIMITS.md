# Free-tier limits and external services

The project is intended to use services with a free plan that does not require a credit card. Free-tier quotas and policies can change; check each provider's current terms before launch and monitor usage as traffic grows.

## Database and authentication

- **Supabase Free**: PostgreSQL, Auth, and database backups/availability are subject to Supabase's current free-plan quotas and inactivity policies.
- No Supabase project has been created or connected yet.
- Keep the client-facing anon key protected by Row Level Security. Never place the service-role key in the frontend or in any `VITE_` variable.
- Recheck database size, egress, and Auth limits in the Supabase Dashboard before launch and as usage increases.

## Maps and data

- **OpenStreetMap tiles**: public tile infrastructure is community-funded, has a usage policy, and is not a guaranteed free production tile CDN. Attribute OpenStreetMap and move to a suitable provider or self-hosted tiles if usage grows beyond policy limits.
- **Overpass API**: public instances are shared and rate-limited. Cache results, set a descriptive User-Agent from a server-side importer, and avoid frequent full-area queries.
- **Nominatim**: public geocoding is limited to one request per second and requires caching. Do not send autocomplete keystrokes as separate live requests.

## Hosting and scheduled jobs

- **GitHub Actions**: scheduled workflows consume the repository's available free CI minutes and are subject to GitHub plan quotas.
- No production hosting or scheduled refresh workflow is configured yet.

Check provider dashboards and official usage policies before production. Add alerts or usage checks before approaching any quota; do not assume a free tier guarantees uninterrupted service.
