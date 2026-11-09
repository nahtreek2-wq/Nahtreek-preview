# Preview Gmail OTP setup

This mail channel is intentionally available only when the API has both
`APP_ENV=preview` and `PREVIEW_EMAIL_OTP_ENABLED=true`. Production continues to
use SMS OTP and ignores the Gmail configuration.

## Gmail preparation

1. Use a dedicated NAHTREEK Preview Gmail account, not a personal mailbox.
2. Enable 2-Step Verification on that Google account.
3. Open Google Account > Security > App passwords.
4. Create an App Password named `NAHTREEK Preview`.
5. Copy the generated App Password once. Do not store it in source code, an APK,
   a screenshot, chat, or project documentation.

## Vercel Preview API variables

In the `nahtreek-api` Vercel project, add these to the Production environment
used by the Preview deployment:

```text
APP_ENV=preview
PREVIEW_EMAIL_OTP_ENABLED=true
GMAIL_SMTP_USER=your-preview-sender@gmail.com
GMAIL_SMTP_APP_PASSWORD=<Google App Password>
GMAIL_FROM_NAME=NAHTREEK
```

`APP_ENV` and `PREVIEW_EMAIL_OTP_ENABLED` are already configured on the current
Preview Vercel project. Add the two Gmail values in the Vercel dashboard and
redeploy the API so the serverless functions receive them.

## Verification checklist

1. Request an OTP from the Preview Client APK.
2. Confirm that the email arrives and the code expires after five minutes.
3. Complete signup and verify that `isEmailVerified` is true while
   `isPhoneVerified` remains false.
4. Repeat signup in the Preview Professionals APK.
5. Submit the professional profile and proof documents, approve them in Admin,
   and verify that the profile appears in the Client app.
6. Test Preview password reset using the registered email address.

Gmail SMTP is suitable for demonstration traffic only. Move to a dedicated
transactional email service before public production traffic.
