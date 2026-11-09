# `src/release/` — production Firebase config (per app)

Drop the **production** `google-services.json` here (one per app, from the
production Firebase project). Rules:

- Package names must be exactly `com.nahtreek.client` / `com.nahtreek.professional`.
- NEVER copy `src/internal/google-services.json` here — release builds must
  not reuse preview push credentials.
- The file is git-ignored (`**/google-services.json`). For CI, base64 it into
  the `PROD_GOOGLE_SERVICES_CLIENT` / `PROD_GOOGLE_SERVICES_PRO` secrets.

See `deployments/production/PROD_SETUP_CHECKLIST.md` for the full setup.
