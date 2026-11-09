# iOS implementation and validation

Status on 14 September 2026: native source implemented for Keychain session persistence and runtime configuration; not built or tested on iOS yet.

## Configuration

The application target compiles `NahtreekClient/NahtreekRuntimeConfig.m`. Set `NAHTREEK_ENVIRONMENT` and `NAHTREEK_API_BASE_URL` through Xcode build settings or CI. Info.plist passes them to the shared runtime module. Missing environment defaults to development in Debug and production otherwise. Unexpanded URL variables are discarded. The simulator development fallback uses localhost; physical devices need an explicit reachable endpoint.

## Session storage

The bridge implements get/set/clear using a non-synchronizing generic-password Keychain item scoped to the application bundle identifier. Writes update existing items and add only when missing. Storage errors reject the bridge promise. Shared JavaScript serializes reads, writes and clears.

The item uses Apple's [AfterFirstUnlockThisDeviceOnly protection](https://developer.apple.com/documentation/security/ksecattraccessibleafterfirstunlockthisdeviceonly): background access is possible after the first unlock following restart, and the item does not migrate to another device. No credentials are stored in AsyncStorage.

## Required validation before advancing the platform phase

Install full Xcode and an iPhone simulator runtime. The current selected developer directory is `/Library/Developer/CommandLineTools`; `xcrun simctl` is unavailable and `/Applications` has no Xcode installation. Resolve CocoaPods with the project toolchain, then compile both Debug and Release with the application scheme. An unsigned simulator build is useful for QA but does not establish distribution signing.

On iOS test: login and process restart, token rotation, write followed immediately by logout, locked-device storage failure, logout followed by restart, absent/corrupt session, runtime configuration, safe area, keyboard, font icons, large text, denied image/location permissions, and back gestures. Shared JS tests cannot prove Keychain or native UI behavior.

Before App Store release also verify provisioning, distribution signing, privacy manifest inclusion, purpose strings, push entitlements/APNs, real API configuration, and an installable TestFlight archive. These remain pending.
