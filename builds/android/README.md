# Preview Android builds (test builds, debug-signed)

**The one place to take APKs from.** Install on any Android phone.
No "preview" anywhere in names or labels — they install as
"Nahtreek Home" and "Nahtreek Pro".

- `Nahtreek-Home-v70.apk` — Home v70 (`1.0.0-v70`), preview API — FINAL. v69 plus: Plus manager screen (all states + cancel), Loans moved to Profile, Track banner rebuilt, branded dialogs, natural icons, pull-to-refresh everywhere, polling diet, realtime billing.
- `Nahtreek-Pro-v43.apk` — Pro v43 (`1.0.0-v43`), preview API — FINAL. v42 plus: branded dialogs, natural icons, pull-to-refresh everywhere, polling diet, dues realtime + payout link, verification push.

Final preview builds. Older APKs are superseded by Home v70 and Pro v43 and
can be deleted. Includes Plus ₹129, engineer 2% discount, speed SLA +
penalties, AI express booking, Nahtreek logo on Razorpay checkout.
Verified: Home 52 suites / 250 tests green, Pro 23 suites / 114 tests green, tsc clean (all four apps).

Debug-signed `.internal` packages: they sit alongside any other apps and
touch only test data. Maps work (preview key baked in).

## Sign in (OTP only, no passwords)

Use an email from the private demo-accounts file
(45 test accounts, never shared publicly), request a code, then enter the
preview demo code `123456`:

- Home app → `client-01.preview@nahtreek.example`
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
