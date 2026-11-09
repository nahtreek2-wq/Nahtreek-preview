# NAHTREEK cloud connection

Status: the shared backend is deployed at https://nahtreek-api.vercel.app and uses Supabase PostgreSQL through its transaction pooler. Eleven migrations are deployed. The database contains the public service/specialization catalogue but no fabricated professional accounts. Verification found every public table protected by RLS and no direct table grants to browser roles.

Supabase Storage is connected through the backend. `nahtreek-avatars` is public and limited to supported image types; `nahtreek-private` stores AI documents privately. Private database records contain opaque object references and API responses generate short-lived signed URLs only after ownership checks.

Production Vercel variables are configured for the database, JWT signing, Supabase URL and server-only storage credential. Both internal Android APKs were rebuilt with `https://nahtreek-api.vercel.app/api/v1`, installed on the emulator and smoke-tested. The public health, service catalogue and specialization routes returned HTTP 200; an unauthenticated protected route returned HTTP 401.

Verification completed locally: backend build and TypeScript checks passed; 49 backend tests, 47 client tests and 7 professional tests passed; both mobile type checks and lints completed (the client still reports legacy lint warnings but no lint errors).

The current connection uses the database owner for this initial setup. Introduce a dedicated least-privilege backend database role before production; keep migration credentials separate. Direct Supabase mobile database access is intentionally denied: the apps must use the authenticated NestJS API. Any future Realtime integration needs explicit authorization design rather than broad table grants.

Credentials shared in conversation must be rotated before real user data is stored. The backend configuration is excluded from version control; never copy its values into documentation or APKs.

Both Android apps already accept NAHTREEK_API_BASE_URL at build time. Use the same HTTPS API origin with /api/v1 appended for both. Never put database credentials or Supabase service keys in either APK.

## Connected infrastructure

- Supabase project: database, service catalogue, private/public storage buckets.
- Vercel project: `nahtreek-api`, owned by the configured NAHTREEK Vercel account.
- Android API origin: `https://nahtreek-api.vercel.app/api/v1` for both internal APKs.
- Server credentials stay in `apps/api/.env` for local checks and encrypted Vercel environment variables for deployment.

## Deployment checks

- Review migrations and validate the Prisma schema before applying them. Use migrate deploy for the selected hosted database, never migrate dev or a database reset.
- Generate the Prisma client and compile the API from the current source. Confirm the fresh output entry point; this checkout contains older dist/main.js and dist/src/main.js outputs.
- Configure a private JWT_SECRET, NODE_ENV, PORT and web CORS origins on the host.
- GET /api/v1/health returns 200 only if a database query succeeds, otherwise 503 without connection details.
- Verify server authentication, profile persistence, request creation and messages across two separate accounts before rebuilding the APKs with the hosted API address.

## Deliberately blocked or outstanding

Live SMS and payments are deferred at the user's request. Signup remains blocked until an SMS provider is configured; no verification bypass or fake user account was created. Payment collection and professional payouts remain disabled until business accounts, provider credentials and webhook verification are configured.

The AI workspace, guided fallback planner and private document storage are deployed, but hosted generative AI still requires a provider URL/key. Socket.IO is deployed on Vercel and both apps also poll durable database state so messages recover across reconnects; authenticated two-account chat could not be exercised because signup is intentionally blocked and the database has no users.

Update, 24 September 2026: the API has been upgraded to NestJS 11.2.6 and bcrypt 6, with a standalone lockfile and reproducible Vercel installation. Its standalone dependency audit reports zero known vulnerabilities. Mobile framework/build-tool advisories, penetration/security testing and the other production gates in [implementation status](../operations/IMPLEMENTATION_STATUS.md) remain open. Treat the deployment as an internal preview, not a public production launch.
