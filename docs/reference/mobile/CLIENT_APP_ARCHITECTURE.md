# Client App Architecture

The React Native Client uses React Navigation, React Query for server state, Zustand for small session/UI state, and the shared design system. The app has a clearly labelled development-only offline reference catalogue and guest browsing mode; neither is used as an authoritative production data source.

`apiClient.ts` applies bearer authentication, token refresh, bounded timeouts, mapped errors, and a fail-closed response when no endpoint is configured. Screens render loading, empty, error, and offline states. `NahtreekRuntimeConfig.apiBaseUrl` and `environment` are injected by native build configuration; Android emulator localhost is development-only. Production builds do not fall back to bundled reference records. Socket.IO derives from the same base URL.

Android session credentials are encrypted with an AES-GCM key held by Android Keystore through the native `NahtreekRuntimeConfig` module. The JavaScript layer never uses plain AsyncStorage for access or refresh tokens.

The 14 September delivery plan and outstanding acceptance gates are in `CLIENT_PRODUCT_PLAN.md`. This product is still in progress; the prior Android reference build does not establish production readiness.

iOS now has a `NahtreekRuntimeConfig` bridge registered in the Xcode application target. It stores session payloads in Keychain and exposes runtime settings from Info.plist. Shared secure-storage operations are serialized so logout waits for earlier writes. Missing bridges reject operations instead of silently discarding credentials. Native iOS compilation and device validation remain unverified because Xcode is unavailable on this machine. The existing session store still catches persistence failures; communicating those failures and handling locked-device hydration without deleting valid sessions are pending authentication-phase work.
