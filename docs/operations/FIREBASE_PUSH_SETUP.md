# Android push setup (preview and production)

Status: preview delivery is enabled with a scheduled worker. Firebase accepted the requested physical-device test on 24 September 2026; on-device display still needs the user's confirmation. Production Firebase and iOS/APNs are not configured.

Preview update (24 September 2026): both internal apps are registered in `nahtreek-preview`. The restricted server credential, `PUSH_ENABLED=true` and a random `CRON_SECRET` are deployed to the preview API. Supabase job `nahtreek-preview-push` checks every minute and calls the dispatcher only while pending rows exist. The bearer secret is stored in Supabase Vault, not in cron SQL. Run `CONFIGURE_PREVIEW_PUSH=yes node scripts/configure-preview-push.cjs` from `apps/api` only for this preview database, then redeploy the API. To stop delivery, unschedule this named job and set `PUSH_ENABLED=false`, then redeploy. This does not configure the separate production environment.

Scheduling reference: [Supabase Cron and pg_net](https://supabase.com/docs/guides/functions/schedule-functions). The worker processes ten updates per invocation; scale the interval/batch architecture before high-volume launch. No promotional campaigns were enabled. Current alerts are generic to protect private content on lock screens.

## Android configuration

Use a separate Firebase project for preview and production. Register these Android applications:

| Environment | Client package | Professional package | Configuration location in each mobile app |
| --- | --- | --- | --- |
| Preview internal APK | `com.nahtreek.client.internal` | `com.nahtreek.professional.internal` | `android/app/src/internal/google-services.json` |
| Production release | `com.nahtreek.client` | `com.nahtreek.professional` | `android/app/src/release/google-services.json` |

Download the matching `google-services.json` into each app's location. Debug builds use `src/debug/google-services.json` only if explicitly configured. These files are ignored by version control. The shared Gradle integration validates the package ID and initializes Firebase from the matching build's configuration. Never put a Firebase server service-account private key in an Android project.

Build new APKs after adding these files. Android 13+ asks the signed-in user to allow notifications. Denial does not block the application; allow notifications from Android Settings later. No Firebase file means no notification prompt and no Firebase registration request.

## Backend configuration

Enable the Firebase Cloud Messaging HTTP v1 API. Create a service account with the Firebase Cloud Messaging API Admin role in the matching Firebase project. Store its JSON privately as `FIREBASE_SERVICE_ACCOUNT_JSON` on the backend. Set `PUSH_ENABLED=true` only after both apps and the scheduler are ready. Generate a separate random `CRON_SECRET` with at least 32 characters and store it as a sensitive environment variable.

The preview Vercel project currently runs `APP_ENV=preview` using Vercel's Production target. Configure those variables on that target. The real production environment must use its own Firebase project, service account and worker secret.

Schedule `GET` or `POST /api/v1/internal/push/dispatch` every minute with `Authorization: Bearer <CRON_SECRET>`. Use a scheduler that supports the required interval. Vercel's integrated cron can supply CRON_SECRET automatically; check the hosting plan's interval limits before configuring it. A long-running production worker can invoke the same route. Run enough batches for queue volume; each invocation processes up to ten notifications. Do not use a mobile timer or an unawaited background task in a serverless function as the scheduler.

Apply database migrations before deploying the new API. The migration skips existing notification history, enables RLS on device registrations, and adds the durable delivery queue. Monitor counts of `Notification.pushState='FAILED'` and the age of pending rows.

## Behavior and acceptance checks

New bookings, booking status changes, messages and verification decisions already create notification rows in the same transaction as their business event. The worker sends generic alerts to active sessions, excludes suspended accounts and revoked/expired sessions, removes unregistered tokens and retries transient failures up to five attempts. Rows older than 24 hours are skipped. Delivery is at least once; the stable notification ID replaces duplicate Android tray entries. In-app history is retained even when delivery fails.

Sign in on two phones, grant permission, background the Professional app, then book that professional from Client. Verify an alert arrives, opening it launches the app and its inbox refreshes. Repeat for messages, acceptance and admin approval. Sign out and verify no further alerts are displayed. Check account switching, token refresh, permission denial, force-stop behavior, loss of network and retry recovery. Android force-stop prevents background delivery until the app is opened again.

Push payloads contain only a notification ID; names, addresses, messages and verification files stay behind authenticated APIs. A push notification opens the app; automatic navigation directly to an individual request is not implemented.

References: [Android setup](https://firebase.google.com/docs/cloud-messaging/android/get-started), [HTTP v1 sending](https://firebase.google.com/docs/cloud-messaging/send/v1-api), [Vercel cron](https://vercel.com/docs/cron-jobs).
