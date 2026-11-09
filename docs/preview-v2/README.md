# Preview/V2 environment

Preview/V2 is the working demonstration and acceptance environment.

The [fictional preview account roster](../operations/PREVIEW_DEMO_ACCOUNTS.md)
provides 15 test logins per mobile role. It is not production user data.

## Current services

- API and admin hosting: Vercel.
- Database and object storage: Supabase.
- Android apps: preview builds configured with the preview API URL.
- Maps: Google Maps location/directions links without an embedded SDK key.
- SMS signup: intentionally blocked until the shared SMS provider and approved
  Indian DLT templates are configured.

## Current status

The shared API, client, professional and admin source exists. Admin verification,
safe user restriction and client discovery rules are implemented. The environment
must still pass the release checklist before it is used as production.

No preview secret may be copied into a production profile or APK.
