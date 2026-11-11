# Preview Android builds (test builds, debug-signed)

**The one place to take APKs from.** Install on any Android phone.
No "preview" anywhere in names or labels — they install as
"Nahtreek Home" and "Nahtreek Pro".

- `Nahtreek-Home-v61.apk` — Home v61 (`1.0.0-v61`), preview API — FINAL. v60 plus: checkout watchdog recovers lost payment results instead of freezing, with one-tap retry.
- `Nahtreek-Pro-v34.apk` — Pro v34 (`1.0.0-v34`), preview API — FINAL. v33 plus: checkout watchdog recovers lost payment results on membership and dues instead of freezing, with one-tap retry.

Final preview builds. Older APKs are superseded by Home v61 and Pro v34 and
can be deleted. Includes Plus ₹129, engineer 2% discount, speed SLA +
penalties, AI express booking, Nahtreek logo on Razorpay checkout.
Verified: Home 45 suites / 223 tests green, Pro 18 suites / 99 tests green, tsc clean (Pro + Home).

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
