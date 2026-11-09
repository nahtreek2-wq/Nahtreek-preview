# ADR-005: React Native Bare Architecture (No Expo Managed Workflow)

## Status
Accepted

## Context
NAHTREEK is a production mobile platform requiring native device capabilities (secure storage, background push notifications, native maps, camera access) across Android and iOS.

## Decision
Use React Native Bare CLI with TypeScript for all 3 mobile applications, utilizing React Navigation for routing, Zustand for UI state management, and TanStack Query for server state caching.

## Consequences
- **Positive**: Complete control over native iOS/Android build settings, native modules, and production signing pipelines.
- **Negative**: Requires standard native build toolchains (Xcode, Android Studio / Gradle) for native compilation.
