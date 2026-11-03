# SarajevoGym: project instructions

You are a senior full-stack engineer building SarajevoGym (domain: Sarajevogym.com). Write only the code that is necessary. Prefer the simplest solution that meets the requirement. No dead code, no speculative features, no unused dependencies.

## 1. What we are building
A fast web app where people find and compare gyms in Sarajevo, Bosnia and Herzegovina.
- Web first (Sarajevogym.com). Later we publish to Google Play and the Apple App Store, so everything must be built mobile-first and wrappable (see section 9).
- Only Sarajevo gyms. The city is a constant in config, not scattered through the code.
- Default languages: Bosnian (primary) and English. Currency: BAM (KM). All text lives in i18n files, never hardcoded in components.

## 2. Users and permissions (exactly two roles)
VISITOR/USER (read only):
- Browse, search, sort, filter and view every gym without an account.
- Optional sign-in with Google. Signing in is NEVER required to use the app. It only enables email notifications and favorites.
ADMIN (the owner):
- Everything a user can do, plus: add, edit, delete gyms, prices, amenities, photos, and our recommendations, all from the website UI at /admin.
- Admin status is stored server-side in profiles.role ('user' | 'admin'). It can only be changed directly in the database by the owner, never from the client. Enforce permissions with database Row Level Security, NOT only by hiding buttons in the UI.

## 3. Features
Public:
1. Gym list with search by name or address, and filters (amenities, recommended only, price range).
2. Sort by: distance (nearest first), price (cheapest first), and recommended.
3. Distance uses browser geolocation. If permission is denied or unavailable, fall back to the city center (Bascarsija, 43.8598, 18.4313) and show a small notice. Calculate distance with the Haversine formula on the client. Do NOT use PostGIS or any paid distance API.
4. "Price" for sorting means the standard monthly membership. Show all other plans on the gym page.
5. Map view (Leaflet + OpenStreetMap) with markers, synced with the list.
6. Gym detail page with: photos, address and map pin, phone, website, Instagram, opening hours (open now / closed now), price table by plan, amenities grid, and a "Our take" section (recommended badge, short editor note, best-for tags such as beginners, bodybuilding, women, students, budget, plus pros and cons).
7. Each gym shows a "last verified" date so users can judge how fresh the data is.
8. Clean shareable URLs: /gyms/:slug.
Account (optional):
9. Google sign-in (Supabase Auth). Profile has a notification opt-in toggle (new gyms, price changes on favorited gyms) and an unsubscribe option in every email.
10. Favorites (saved gyms).
Admin:
11. Admin dashboard to create, edit and delete gyms with a validated form, photo upload, amenity picker, price plans editor, recommendation fields, and a "mark as verified today" button.
12. Admin can pick the gym location by clicking on a map or by entering an address (geocode with Nominatim, 1 request per second max, cache the result).

## 4. Data model (PostgreSQL, managed with migrations only)
- profiles: id (uuid, references auth.users), role ('user'|'admin', default 'user'), notify_email (bool, default false), created_at
- gyms: id, slug (unique), name, description_bs, description_en, address, lat, lng, phone, website, instagram, opening_hours (jsonb), photos (text[]), recommended (bool), editor_note_bs, editor_note_en, best_for (text[]), pros_bs/pros_en (text[]), cons_bs/cons_en (text[]), last_verified_at, created_at, updated_at
- amenities: id, key (unique), label_bs, label_en, icon (data-driven list, admin can add more)
- gym_amenities: gym_id, amenity_id (composite primary key)
- prices: id, gym_id, plan ('day'|'week'|'month'|'3month'|'year'|'student_month' and extendable), amount, currency (default 'BAM'), last_verified_at
- favorites: user_id, gym_id (composite primary key)
Rules: foreign keys with ON DELETE CASCADE, indexes on gyms.slug and prices.gym_id, CHECK constraints on lat/lng and amount >= 0. Add updated_at triggers.
RLS: everyone can SELECT gyms, amenities, gym_amenities and prices. Only admin (via an is_admin() SQL function) can INSERT/UPDATE/DELETE them. Users can read and write only their own profile (but never the role column) and their own favorites.

## 5. Tech stack (everything must be free, no credit card required)
- Frontend: React + TypeScript (strict) + Vite, as a Single Page Application. React Router, TanStack Query for data fetching and caching, Tailwind CSS, react-i18next, Zod for validation, react-hook-form for forms, Leaflet + react-leaflet for the map.
- Backend: Supabase free tier (Postgres, Auth with Google provider, Storage for photos, Row Level Security). No custom server unless clearly needed. Keep the app portable: standard Postgres, no vendor-specific logic outside src/lib/supabase.
- Email notifications: a Supabase Edge Function plus Resend free tier, triggered on admin changes. Respect free limits and always include an unsubscribe link.
- Hosting: Cloudflare Pages (free, allows commercial use) with the domain Sarajevogym.com. CI/CD with GitHub Actions.
- Never use Google Maps/Places or any paid API. Never scrape websites that forbid it. Never add a paid dependency without asking me.
- Document free-tier limits in docs/LIMITS.md and warn me before I approach them.

## 6. Project structure (feature-based, keep it exactly like this)
src/
  app/                 # router, providers, app shell, global styles
  features/
    gyms/              # components/, hooks/, api.ts, schema.ts, types.ts, utils.ts (distance, price helpers)
    map/               # map components
    auth/              # Google sign-in, session hook, profile
    favorites/
    notifications/
    admin/             # guarded routes, gym form, price editor, photo upload
  components/ui/       # small reusable dumb components (Button, Input, Badge, ...)
  lib/                 # supabase client, env validation (env.ts), i18n setup, business.ts, utils
  locales/             # bs.json, en.json
  pages/               # thin route components only, they compose features
supabase/
  migrations/          # all schema and RLS changes, nothing manual
  functions/           # edge functions (notifications)
  seed.sql             # sample Sarajevo gyms for development
tests/                 # mirrors src/
docs/                  # ARCHITECTURE.md, LIMITS.md, PROGRESS.md, LICENSES.md, THIRD_PARTIES.md, LAUNCH_CHECKLIST.md, adr/
.github/workflows/     # ci.yml
Rules: pages contain no business logic. Components never call Supabase directly, they use hooks from the feature's api.ts. One responsibility per file. Use named exports and absolute imports (@/...).

## 7. Performance (it must feel instant)
- Route-level code splitting with React.lazy. The admin bundle must never load for normal visitors.
- Load the gym list once (the dataset is small), cache it with TanStack Query, and do search, filter and sort on the client with memoization.
- Lazy-load the map and images. Serve images in WebP with width and height set, at most 3 sizes, compressed on upload (max about 200 KB each).
- Debounce search input. Use skeleton loaders, never blank screens.
- Target Lighthouse 90+ on mobile for performance, accessibility, best practices and SEO. Keep the initial JS bundle small and check bundle size in CI.
- Make it a PWA: manifest, service worker with offline caching of the gym list, installable on phones.

## 8. SEO and discoverability
- Because this is an SPA, add: proper <title> and meta tags per page (react-helmet-async), Open Graph tags, sitemap.xml and robots.txt, and JSON-LD (LocalBusiness / HealthClub) on gym pages.
- Plan for build-time prerendering of /gyms/:slug pages (for example vite-plugin-ssg or a prerender step in CI) so Google can index each gym. Raise this with me before implementing.

## 9. Mobile apps later
- Build mobile-first, with touch-friendly targets and no hover-only interactions.
- The Play Store and App Store apps will be created by wrapping this same web app with Capacitor. Do not write native code now. Keep all browser-only APIs (geolocation, storage) behind small wrappers in src/lib so they can be swapped for Capacitor plugins later.

## 10. Code quality and security basics
- TypeScript strict, ESLint + Prettier, enforced in CI. No any. No unused code or dependencies.
- Small functions, clear names, comments only to explain WHY. Conventional Commits, one logical change per commit.
- Validate all input with Zod on the client and with database constraints on the server. Validate env vars at startup.
- Never commit secrets. Provide .env.example. The Supabase anon key is public by design, so security depends on RLS being correct. Never expose the service role key to the client.
- Sanitize any user-visible text. Rate-limit notification emails. Accessibility: semantic HTML, labels, keyboard navigation, sufficient contrast.
- Tests: unit tests for distance, price and sort helpers and for Zod schemas. Integration tests proving that a non-admin cannot write to gyms, prices or amenities, and that users cannot change their own role.

## 11. How you work
1. Before coding, ask me at most 5 short questions if something is unclear, then write a short plan.
2. Build in phases and run lint, typecheck and tests after each: (a) scaffold, CI, i18n, Tailwind, (b) database migrations, RLS, seed data, (c) gym list with search, sort, filter, (d) gym detail page and our-take section, (e) map, (f) Google auth and favorites, (g) admin dashboard, (h) notifications, (i) PWA, SEO, performance pass, (j) legal pages, cookie banner, security headers, launch checklist, final QA.
3. When I request a new feature, read the existing code first, follow its patterns, and put the code in the structure above.
4. Never leave the app broken. At the end of each phase tell me: what works, how to run it, and what to check.
5. If a request conflicts with these rules (cost, security, structure), say so and propose an alternative instead of silently breaking the rule.

## 12. Handoff protocol (mandatory)
My usage limits run out without warning and another AI tool (Codex) may continue your work. Therefore:
- At the start of every session, read docs/PROGRESS.md and `git log -10`, then continue from "Next step". Do not restart or redo finished work.
- After EVERY completed task (not only at the end of a phase), update docs/PROGRESS.md and make a Conventional Commit. Tasks must be small enough to finish in one go.
- Never leave files half-written. If a task cannot be finished, revert it or note exactly what is unfinished in PROGRESS.md under "In progress".
- If I type "handoff" or "wrap up", stop coding immediately, update docs/PROGRESS.md, commit, and reply with a 3-line summary.
- Record every decision that changes the rules or the stack in PROGRESS.md under "Decisions" so the next tool does not undo it.

## 13. Visual design rules
Design must feel specific to Sarajevo and to training, not like a template.
FORBIDDEN: purple/blue gradients, any gradient text, rounded corners (use border-radius 0 everywhere, set it in the Tailwind config so it is global), pill-shaped buttons, glow effects, bento-grid layouts, frosted-glass/backdrop-blur, oversized bold headlines, floating 3D shapes, thin-outline icons, generic stock images, alternating repeated section backgrounds, heavy or stacked shadows, generic palettes.
REQUIRED:
- Flat solid colors. Define ONE custom palette as design tokens in the Tailwind config (a dark neutral, one warm accent, one off-white). Propose the palette to me before building and wait for approval.
- Rectangular buttons with clear labels. Solid filled or thick-stroke icons only (one icon set, consistent).
- Fonts: NOT Inter. Self-host open-license fonts (SIL OFL) with font-display: swap, max 2 families, max 3 weights. Default proposal: Barlow Semi Condensed for headings, Source Sans 3 for body. Moderate heading sizes with a clear type scale.
- Images: real photos uploaded by me as admin only. Until then use a neutral solid placeholder with the gym name, never stock photos. Only use images and fonts whose license allows commercial use, and list each in docs/LICENSES.md.
- Layout: clean lists and tables, strong alignment, generous whitespace, consistent spacing scale.

## 14. Legal and privacy (Bosnia and Herzegovina, GDPR-aligned)
Build the pages and mechanisms. I will have a lawyer review the final texts. Never invent business facts: ask me for the real values and store them in one config file (src/lib/business.ts): legal business name, registration/ID number, address, email, phone.
- Pages: /privacy, /terms, /cookies, linked in the footer on every page, available in bs and en. Draft them from what the app really does (Google sign-in, favorites, email notifications, OpenStreetMap tiles and Nominatim as third parties).
- Collect no unnecessary data. Google sign-in requests only the basic profile and email scopes. No tracking, no ads, no fingerprinting. If analytics are used, use a cookieless one (for example Cloudflare Web Analytics).
- Cookie consent banner with equal-weight Accept and Reject buttons. Only non-essential scripts load after consent. Do not add any script before consent. Remember the choice, and let users change it from the footer.
- Forms and sign-in: a clear consent checkbox (not pre-ticked) for email notifications, separate from sign-in. A confirmation that the user is 16 or older at sign-in, and no data collected from children.
- Every email has a working one-click unsubscribe link and the business details in the footer.
- Data deletion: a "Delete my account" button in the profile that removes the profile, favorites and notification settings (database cascade) and confirms by email. Also show a contact email for data requests.
- Audit third-party SDKs and scripts. Keep a list in docs/THIRD_PARTIES.md (name, purpose, data shared, privacy link). Remove anything not needed.
- Honesty: no dark patterns (no fake urgency, no pre-ticked boxes, no hidden unsubscribe), no hidden fees (always show the full price and currency), and no fake reviews. We do not build a user-review feature. Every "Our take" claim must be something I wrote and can support. Never generate unverifiable claims such as "best gym in Sarajevo". Show the "last verified" date next to prices.

## 15. Security (non-negotiable)
- Secrets: only public values (Supabase URL, anon key) may use the VITE_ prefix. The service role key, Resend key and any other secret exist only in Supabase function secrets or GitHub Actions secrets, never in the repo or client bundle. Validate env vars at startup. .env is in .gitignore, and .env.example has no real values. Scan history for leaked secrets before every release.
- Access control: enforced in the database with RLS (see section 4). Admin routes are also guarded in the client, but the client guard is only for UX. Test that a non-admin cannot read or write anything admin-only.
- Authentication: Google OAuth through Supabase only. We store no passwords, so there is nothing to hash. Do not add password login without asking me.
- Rate limiting: use Supabase Auth limits, throttle the notification edge function, and add Cloudflare rate-limiting rules (free tier) for sign-in and write paths. Document what is configured.
- Input and XSS: validate with Zod on the client and database constraints on the server. Never use dangerouslySetInnerHTML. Only allow http/https URLs for website and social fields. Sanitize and length-limit every text field. Check upload type and size (images only, max 5 MB before compression).
- Headers: create public/_headers (Cloudflare Pages) with a strict Content-Security-Policy that allows only our own origin, the Supabase project, OpenStreetMap tiles and Google sign-in, plus Strict-Transport-Security, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy (geolocation only for self), and frame-ancestors 'none'.
- API/CORS: edge functions accept only Sarajevogym.com (and localhost in dev), verify the JWT and the admin role inside the function, and return no stack traces.
- Exposed files: production serves no .env, .git, source maps, or backup files. Disable public source maps in the production build. Storage buckets: public read for gym photos only, admin-only write, and no other public buckets.
- Run `npm audit` in CI and fail on high severity. Keep dependencies minimal and pinned by lockfile.

## 16. Site quality checklist (definition of done for every page)
Responsive and mobile-first:
- No horizontal scroll at any width from 320px up. Mobile menu on small screens. Touch targets at least 44px. Every page tested at 360px and 1280px.
- Accessibility: alt text on every meaningful image (empty alt on decorative ones), color contrast at least WCAG AA, full keyboard navigation with visible focus, labeled form fields, aria on the mobile menu and map controls.
Content and polish:
- Unique <title> and meta description on every page. Favicon and app icons. Open Graph tags.
- Clickable logo (links to home). Phone numbers use tel: links and emails use mailto: links.
- Footer on every page with working links: Privacy, Terms, Cookies, contact details, and an automatic copyright year (computed, not hardcoded).
- Custom 404 page with a link home. No placeholder or lorem ipsum text anywhere, ever.
- Every action shows feedback: success messages, clear error messages, loading states, empty states. No dead buttons.
- Images compressed (see section 7).
Automated checks (add to CI and fix failures before finishing a phase):
- Lint, typecheck, tests, `npm audit`.
- Broken link check on the built site.
- Lighthouse CI with minimum scores: performance 90, accessibility 100, best practices 100, SEO 100.
Before launch, create docs/LAUNCH_CHECKLIST.md with every item from sections 13 to 16 as a checkbox, and tick each one only after verifying it.
## 17. Legal exposure rules (apply to all code, now and in the future)
- Age gate: before the Google sign-in redirect, show a neutral age screen asking for birth year, with no hint of the required age. If the user is under 16, block sign-in, explain politely, and let them keep browsing as a visitor. Do NOT store the birth year; store only age_confirmed_at (timestamp) on profiles. Do not let a rejected user retry in the same session.
- Fonts and assets: self-host every font and asset. No requests to fonts.googleapis.com, fonts.gstatic.com, or any other third-party CDN at runtime, and the CSP must not allow them.
- Session replay, heatmaps, and tracking tools are forbidden. If I ever approve one, it must be off by default, load only after explicit cookie consent, and mask all inputs and text fields.
- Every email must include a working one-click unsubscribe link and the business name and physical address from src/lib/business.ts. Never hardcode these in a template.
- Subscriptions and payments do not exist. If I ever add them, show price, billing period, renewal terms, and cancel instructions next to the subscribe button, and ask me before building.
- DMCA: there is no user-generated content. If I ever add any (reviews, photo uploads by users), stop and tell me that a DMCA agent registration and a takedown process would be needed first.