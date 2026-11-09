# Nahtreek Preview Codebase

This tree builds and runs PREVIEW (staging) only.

| Part | Folder | Notes |
|---|---|---|
| Home app | `apps/preview-Home/` | package `com.nahtreek.client.internal`, staging API |
| Pro app | `apps/preview-Pro/` | staging API |
| API | `apps/preview-Api/` | staging env in `apps/preview-Api/.env` |
| Admin web | `apps/preview-Admin/` | staging |
| Admin panel | `builds/admin/` | points at staging (`/backend`) |
| Output | `builds/android/Nahtreek-Home-v<next>.apk` | |

Build Home preview:

```sh
cd apps/preview-Home/android
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
./gradlew :app:assembleInternal \
  -PNAHTREEK_VERSION_CODE=<next> -PNAHTREEK_VERSION_NAME="1.0"
cp app/build/outputs/apk/internal/app-internal.apk ../../builds/android/Nahtreek-Home-v<next>.apk
```

Deploy preview API from `apps/preview-Api` (`vercel --prod` on the
staging project). Changes here do NOT flow to `Nahtreek-production`.
