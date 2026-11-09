# Preview Android builds (test builds, debug-signed)

**The one place to take APKs from.** Install on any Android phone.
No "preview" anywhere in names or labels — they install as
"Nahtreek Home" and "Nahtreek Pro".

- `Nahtreek-Home-v51.apk` — Home v51 (`1.0.0`), preview API — FINAL
- `Nahtreek-Pro-v17.apk` — Pro v17 (`1.0.0`), preview API — FINAL

Final preview builds. All older APKs were removed; these two are the only
installable files. Includes Plus ₹129, engineer 2% discount, speed SLA +
penalties, AI express booking, Nahtreek logo on Razorpay checkout.
Verified: API 357 + Home 194 + Pro 68 green, live payment PAID.

Debug-signed `.internal` packages: they sit alongside any other apps and
touch only test data. Maps work (preview key baked in).

## Sign in (no OTP needed)

Use email + password from the private demo-accounts file
(45 test accounts, never shared publicly):

- Home app → `client-01.preview@nahtreek.example` (+ its password)
- Pro app → `engineer-01.preview@nahtreek.example` or
  `provider-01.preview@nahtreek.example`

## What to try

Home: search engineers/services → open a profile → book → check
Requests → Chat → Saved → Profile.
Pro: Jobs → accept → Chat → My Time → Profile.

## Rebuild (`internal` flavor, Java 17)

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
cd ../apps/preview-Home   # or ../apps/preview-Pro
NAHTREEK_VERSION_CODE=<next> NAHTREEK_VERSION_NAME='1.0.0-v<next>' \
  ./android/gradlew -p android app:assembleInternal --offline
# then copy app-internal.apk here as Nahtreek-Home-v<next>.apk
```

Source code always stays in `apps/`.
