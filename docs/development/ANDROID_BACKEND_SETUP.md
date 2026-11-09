# Android client and backend setup

## Current delivery status

The Android client has separate Engineers and Services paths. Home Services appear first. Provider discovery is city-filtered; profile changes and photos are shared by Home and Profile. Service requests have a separate history and status timeline. Notifications link to the corresponding request. Google Maps opens a location link; there is no embedded Maps SDK or API key requirement at this stage.

The NestJS/Prisma backend now includes service-category administration, professional onboarding and admin verification, provider discovery, participant-only service requests and status updates, engineer status updates, profile-photo uploads and authenticated account activity history. Status writes use transactions and compare-and-set checks. Histories are restricted to the authenticated participant/user, including professionals and administrators.

PostgreSQL is **not configured** on this machine. Schema validation, TypeScript builds and mocked unit tests do not prove database integration. Migrations have not been applied. No live provider accounts have been added, and no production backend has been deployed. Do not interpret an empty listing as a defect or populate it with invented professionals.

## Configure PostgreSQL and the API

### Client account update — September 16

Account creation is now two steps: name, house/street address, city, state and six-digit PIN code; then mobile, email, password, password confirmation and acceptance of the account data notice. Birth date, gender and identity documents are not collected unnecessarily. Email syntax is validated but email ownership is **not verified** by this implementation.

Configured-API registration uses `POST /auth/otp/request`, followed by `POST /auth/register` with those details plus a six-digit `code` and `acceptedTerms: true`. Registration atomically consumes the code, creates the verified-mobile client and stores a bcrypt password hash. Password login accepts exactly one of `phoneNumber` or `email` with `password` at `POST /auth/login`.

Password reset uses `POST /auth/password-reset/request` with a mobile number, then `POST /auth/password-reset/confirm` with mobile, code and new password. Codes expire, have bounded attempts and are consumed once. Reset revokes existing sessions and increments the account authentication version, so a refresh issued concurrently using the old version cannot remain valid. An in-process guard limits repeated authentication attempts; configure a shared gateway/distributed limiter before multi-instance deployment.

An unconfigured internal build uses native Android local password accounts, not the earlier phone-only login. Account records are encrypted using Android Keystore-backed AES-GCM; passwords are salted PBKDF2-HMAC-SHA256 hashes with 600,000 iterations, calculated off the UI thread. This choice follows [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Local reset requires matching mobile/email and Android device-credential confirmation. On an emulator without a PIN/pattern/password, reset fails safely: configure a screen lock in Android Settings first. This confirms the device owner, **not SMS ownership**, and is strictly a development feature. It is not available in configured-API or production builds.

Earlier phone-only test profiles are not silently converted into password accounts. Register a new password account (the same old test number is allowed if no native password account exists yet). Local accounts do not sync across devices. The account data notice is a functional collection notice, not a substitute for a reviewed production privacy policy, legal terms or an implemented account-deletion policy. Complete those before public release.

Home now includes curated home-service cards, engineering/home-service request shortcuts, saved professionals and profile/contact management. These are working navigation actions, not invented provider statistics.

1. Provision a PostgreSQL database and a restricted application database user. For migration deployment, use an appropriately privileged migration identity. Keep credentials outside source control.
2. Copy the structure of `apps/api/.env.example` into your private `apps/api/.env`. Set `DATABASE_URL`, a strong random `JWT_SECRET`, `PORT`, the permitted `CORS_ORIGINS`, and `UPLOAD_DIR`. Never paste credentials into chat or commit `.env`.
3. Run these commands from `apps/api` using the dependencies already installed in this workspace:

```sh
../../node_modules/.bin/prisma validate
../../node_modules/.bin/prisma generate
../../node_modules/.bin/prisma migrate deploy
../../node_modules/.bin/jest --runInBand
../../node_modules/.bin/nest build
node dist/main.js
```

Back up an existing database before migration. Inspect migration status first; an existing database without Prisma migration history must be correctly baselined, not reset. The three checked-in migrations create the original platform, add the service platform, and add client PIN/consent fields and authentication versions. Do not run the old recovered-catalogue seed against a real database: it contains reference engineer identities, not onboarded professionals.

The API routes use the `/api/v1` prefix. Android's emulator accesses the host through `10.0.2.2`, not `localhost`. The client requires an HTTPS API URL (including `/api/v1`); use a development HTTPS endpoint trusted by the emulator, or an emulator reverse connection through a correctly configured TLS listener. Do not disable TLS validation to make testing work.

## Add genuine services and professionals

An existing, trusted administrator must be provisioned outside public registration. There is no public endpoint for granting yourself ADMIN.

Authenticated route inventory:

| Route | Use / authority |
| --- | --- |
| `PUT /admin/services` | ADMIN: create/update category by slug |
| `PUT /professionals/me` | Account: submit engineer/service-provider profile, initially PENDING |
| `GET /professionals/me` | Account: own professional profile |
| `PATCH /professionals/:id/verification` | ADMIN: review and verify/reject |
| `POST /service-requests` | CLIENT: request a verified, available provider |
| `GET /service-requests` and `GET /service-requests/:id` | Owning client or assigned provider only |
| `PATCH /service-requests/:id/status` | Participant: allowed status transition only |
| `PATCH /engineer-requests/:id/status` | Assigned ENGINEER: allowed status transition |
| `GET /history/me` | Signed-in user: own logged account actions |
| `POST /clients/me/photo` | CLIENT: JPG/PNG/WebP upload, maximum 1 MB decoded |
| `PATCH /clients/me` | CLIENT: own name, email, address, photo and location |

Public discovery: `GET /discovery/services`, `GET /discovery/providers?city=Chennai&serviceId=plumbing`, and `GET /discovery/engineers?city=Chennai`. Paginated routes accept positive integer `page` and `limit` from 1 to 100.

Category payload example (editorial content, not a fake provider):

```json
{"slug":"plumbing","title":"Plumbing","group":"Home Services","description":"Leaks, taps and drainage","prepare":"Tell us where the issue is.","sortOrder":1,"isActive":true}
```

Use slugs matching the client's bundled imagery where appropriate: plumbing, electrical, painting, carpentry, renovation, masonry, waterproofing, inspection and maintenance. Real categories come from the configured API; the unconfigured internal build uses only bundled editorial category names. Engineers are not presented as home-service providers.

Professional setup requires `kind`, `fullName`, `title`, `baseCity`, `baseState`, `baseLatitude`, `baseLongitude`, and `yearsOfExperience`. Service-provider setup also requires valid active category slugs in `serviceCategories`. Engineer setup requires degree, institution and graduation year; specialization IDs must reference real specialization records. Do not assign guessed coordinates or prices. After a role is added, sign in again/refresh tokens before using role-guarded routes. Verification resets to PENDING when a professional changes the submitted profile.

## Authentication and photos

The current SMS adapter requires `SMS_API_KEY` and a compatible Fast2SMS account/configuration. Configure and test the actual delivery route, Indian number format and provider permissions before treating OTP as working. No credentials means no SMS sign-in. This delivery does not add a production SMS contract or test external delivery.

An unconfigured **internal/staging** Android build allows device-local profiles for development only. They are not SMS-verified accounts, do not synchronize across devices, and are not a production authentication system. Production/configured-API builds must use server authentication. Local accounts start with empty requests, messages and notifications; the recovered demo catalogue is not active inventory.

Local profile metadata also uses Keystore-backed encryption in the internal Android build. Existing per-account profile metadata migrates on first read; its legacy duplicate is removed only after encryption succeeds. Logout removes only the encrypted session payload, preserving local accounts and profile metadata. Other device-local history is private app storage, not an encrypted production data store. Local profile photos are copied from picker cache into the app's durable private files directory. Configured-API photos upload to the backend and return a shared URL. `UPLOAD_DIR` must use a durable volume; public avatar URLs require the same API origin and HTTPS. Before scaling, replace local-file storage with validated image processing/object storage, upload rate limits, retention cleanup and a reviewed privacy policy. Do not serve unrelated private files from the uploads directory. Uninstalling the app removes local-only profiles/photos.

Successful signup presents a personal welcome using the returned client name and home city. “Go to Home” establishes the session; closing the app before that does not delete the newly created account, which can still sign in. The account screen uses the shared navy/white/construction-yellow palette and a two-step client-details/contact-and-password form. Do not confuse a welcoming success screen with verified email ownership or available professional inventory.

## Caching and history

Only public discovery/categories are persisted in a bounded 2 MB cache, up to 30 query entries and 24-hour age. Public cache v2 intentionally does not restore the earlier demo cache. Private server query state is discarded on account switch/logout; device-local lists use per-account keys and reject pending writes after session changes. Local profile history retains up to 500 recent entries. Server history records the newly implemented profile, onboarding/verification, category and request changes; it is not a backfill of every historic event or an analytics capture of every tap.

No failed network write is silently stored as a successful live booking. Cached inventory may be stale: the server revalidates providers/categories when creating a request.

## Build and validate Android

From `apps/client-mobile`:

```sh
../../node_modules/.bin/tsc --noEmit
../../node_modules/.bin/jest --runInBand
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/Users/vedasarathivadivel/Library/Android/sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
# Omit this variable for the device-local internal build.
export NAHTREEK_API_BASE_URL=https://your-api-host.example/api/v1
node scripts/build-android-internal.mjs
```

Output: `NAHTREEK-Client-v1.0.0-internal.apk` in the project root. This is a new build, not recovered original source. The original `Nahtreek-release.apk` is not currently present at the previously supplied project-root path; this workflow did not remove it. Preserve any original APK/backups stored elsewhere. Internal signing credentials stay in the private `.android-signing` directory; do not share them.

After database/HTTPS/SMS setup, test two clients and two professionals in different cities: registration, real OTP, photo persistence after restart, city filtering, booking, unauthorized request access, concurrent transitions, notifications, history, offline/reconnect and logout/account switching. Those live integration checks, production deployment, embedded Maps SDK, real payments, provider-side app screens and production push delivery are not completed by this Android-client build. Test usability with actual users, including users with limited literacy; no test suite can guarantee zero bugs or zero lag.
