# Professional app (preview)

Worker app for engineers/service providers: jobs, accept/decline,
chat, schedule, membership, verification, profile.

- Source: `apps/preview-Pro/` — `src/` is shared by Android + iOS;
  `android/` and `ios/` hold the native shells only.
- Backend: preview API `https://nahtreek-api.vercel.app/api/v1`.
- Installable: `builds/android/Nahtreek-Pro.apk`.
- Package: `com.nahtreek.professional.internal` (test data only).

## Build

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
cd apps/preview-Pro
./android/gradlew -p android app:assembleInternal \
  -PNAHTREEK_VERSION_CODE=<next> \
  -PNAHTREEK_VERSION_NAME='1.0.0-internal.<next>'
cp android/app/build/outputs/apk/internal/app-internal.apk ../../builds/android/Nahtreek-Pro.apk
```

Every change here must be mirrored to the production tree's
`apps/production-Pro/` (same relative path).
