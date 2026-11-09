# Home app (preview)

Customer app for homeowners: find verified professionals, book work,
track requests, chat, review, and plan with NAHTREEK AI (₹99/mo).

- Source: `apps/preview-Home/` — `src/` is shared by Android + iOS;
  `android/` and `ios/` hold the native shells only.
- Backend: preview API `https://nahtreek-api.vercel.app/api/v1`.
- Installable: `builds/android/Nahtreek-Home.apk` (v31),
  `builds/ios/Nahtreek-Home.app` (simulator).
- Package: `com.nahtreek.client.internal` (debug-signed, test data only).

## Build + test

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
cd apps/preview-Home
npx tsc --noEmit && npx jest          # must stay green (140 tests)
./android/gradlew -p android app:assembleInternal \
  -PNAHTREEK_VERSION_CODE=<next> \
  -PNAHTREEK_VERSION_NAME='1.0.0-internal.<next>'
cp android/app/build/outputs/apk/internal/app-internal.apk ../../builds/android/Nahtreek-Home.apk
```

iOS simulator:

```bash
cd apps/preview-Home/ios
xcodebuild -workspace NahtreekClient.xcworkspace -scheme NahtreekClient \
  -configuration Debug -sdk iphonesimulator build
# copy the .app to ../../builds/ios/ and install with simctl
```

Every change here must be mirrored to the production tree's
`apps/production-Home/` (same relative path).
