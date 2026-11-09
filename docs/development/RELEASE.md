# NAHTREEK Client Release Notes

## Build

Build from `apps/client-mobile/android` with Java 17:

```bash
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.20.1/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/Users/vedasarathivadivel/Library/Android/sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
./gradlew assembleRelease
```

The unsigned-for-distribution release currently uses the repository debug signing config so it can be installed on the local emulator. It is not Play Store production signing.

## Runtime configuration

Inject environment-specific values through Gradle properties; do not place domains in JavaScript:

```bash
./gradlew assembleRelease \
  -PNAHTREEK_ENVIRONMENT=staging \
  -PNAHTREEK_API_BASE_URL=https://staging-api.example.com/api/v1
```

Use `development`, `staging`, or `production`. A production build without an API endpoint fails closed instead of presenting the development reference catalogue.

## QA gate

Before distribution, run TypeScript, Jest, a release build, and emulator smoke checks for authentication, guest browsing, search, discovery, requests, messaging, notifications, profile, and logout. Replace the local debug signing config with a protected release keystore before publishing an AAB.
