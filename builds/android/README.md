# Preview Android builds (test builds, debug-signed)

**The one place to take APKs from.** Install on any Android phone.
No "preview" anywhere in names or labels — they install as
"Nahtreek Home" and "Nahtreek Pro".

- `Nahtreek-Home-v57.apk` — Home v57 (`1.0.0`), preview API — FINAL. v56 plus: payment sync (lost Razorpay callbacks reconcile, no double charge) + Check status + Plus resubscribe + chat status pills + pro photo in Track row + map watchdog/retry.
- `Nahtreek-Pro-v24.apk` — Pro v24 (`1.0.0`), preview API — FINAL. v23 plus: dues/membership never crash on old backends + membership resubscribe + payout-account section + chat threads with status + rebuilt chat layout + map hardening.

Final preview builds. All older APKs were removed; these two are the only
installable files. Includes Plus ₹129, engineer 2% discount, speed SLA +
penalties, AI express booking, Nahtreek logo on Razorpay checkout.
Verified: API 403 + Home 209 + Pro 92 green, tsc clean x3.

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
