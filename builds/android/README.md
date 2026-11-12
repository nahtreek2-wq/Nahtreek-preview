# Preview Android builds (test builds, debug-signed)

**The one place to take APKs from.** Install on any Android phone.
No "preview" anywhere in names or labels — they install as
"Nahtreek Home" and "Nahtreek Pro".

- `Nahtreek-Home-v69.apk` — Home v69 (`1.0.0-v69`), preview API — FINAL. v68 plus: gold fixed to Pro's `#C4A639` (rebuilt stale design-system dist), stricter email TLD check.
- `Nahtreek-Pro-v42.apk` — Pro v42 (`1.0.0-v42`), preview API — FINAL. v41 plus: rebuilt design-system dist (navy/gold now exact), stricter email TLD check, copy fix.

Final preview builds. Older APKs are superseded by Home v69 and Pro v42 and
can be deleted. Includes Plus ₹129, engineer 2% discount, speed SLA +
penalties, AI express booking, Nahtreek logo on Razorpay checkout.
Verified: Home 50 suites / 240 tests green, Pro 22 suites / 108 tests green, tsc clean (all four apps).

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
