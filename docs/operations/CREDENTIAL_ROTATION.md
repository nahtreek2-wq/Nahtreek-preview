# Provider credential rotation

No credential values belong in this document or either APK. Changing environment variable names alone does not rotate credentials.

1. In the sender Google account, create a replacement App Password for NAHTREEK Preview. Replace `GMAIL_SMTP_APP_PASSWORD` on the preview API, redeploy, and check OTP delivery and confirmation. Revoke the old App Password only after this succeeds.
2. In the Supabase project, create a replacement server secret when supported. Replace `SUPABASE_SERVICE_ROLE_KEY` with the server credential used by the storage implementation, redeploy and verify private document uploads and authenticated signed links. Revoke the former key after validation. Legacy service-role JWT rotation can affect other project integrations; inventory them before rotating its signing secret.
3. Rotate the PostgreSQL database password in Supabase, update every affected backend `DATABASE_URL` with correct URL encoding, and redeploy promptly. Prefer a dedicated least-privilege runtime database role, with separate migration credentials. Verify health, login, profiles, booking and worker queries. Do not revoke an application's only database access before its replacement deployment is ready.
4. Generate a new OpenRouter API key, replace the backend `AI_PROVIDER_API_KEY`, redeploy and verify a real reply and saved plan. Revoke the previous key.
5. Confirm deployment logs, docs and APK assets contain no server secrets. Preview and production should use different credentials so either can be rotated independently.

Record completion dates and provider key identifiers privately, without the values. Provider-account access is required for actual rotation; it was not performed by the code changes in this pass.
