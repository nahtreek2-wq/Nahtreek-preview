# NAHTREEK Client V2 Upgrade Plan

## Verified baseline

- The client is React Native 0.75.4 with TypeScript and shared Android/iOS JavaScript.
- Android builds and runs on the `NahtreekDev` emulator.
- The API is NestJS with Prisma and a PostgreSQL datasource. It is **not** MongoDB/Mongoose.
- PostgreSQL, SMS, object storage and an AI provider are not configured locally.
- The iOS project exists, but no iOS simulator/build has been verified in this environment.
- Live professional inventory is empty unless a configured backend supplies verified records. Recovered reference records are not presented as live professionals.

## Architecture decision required

The V2 brief requests MongoDB Atlas/Mongoose, while the existing commercial code and migrations use PostgreSQL/Prisma. Replacing the persistence layer affects authentication, sessions, requests, messaging, audit history and every repository. Until that migration is explicitly approved, V2 backend work must preserve PostgreSQL and use repository/service boundaries that can later support a controlled migration. No dual-write or silent database replacement is permitted.

## Delivery phases

1. **Baseline and audit:** inventory routes, screens, data hooks, states, native storage, API modules and build evidence.
2. **Client visual system:** align with the Engineer app's navy/white/construction-yellow identity, normalize buttons, inputs, cards, feedback and focus states, and preserve readable text contrast.
3. **Core journeys:** improve Home, search/discovery, profiles, services, request creation/tracking, messaging, notifications, profile and settings.
4. **AI foundation:** add typed contracts, provider abstraction, authorization, rate/cost controls, project-plan persistence and guarded prompt construction.
5. **Documents:** add authorized metadata, object-storage adapter, MIME/size validation, processing states and deletion. Parsing is unavailable until storage and a processing service are configured.
6. **AI mobile experience:** guided project intake, messages, attachments, structured plan, plan list/detail/versioning and actions into real services/professionals/requests.
7. **Hardening:** isolated failures, bounded caches, reconnect/retry, accessibility, responsive layouts, performance measurements and security review.
8. **Release QA:** Android device matrix, iOS simulator/device matrix, live database/SMS/storage/AI integration tests and release builds.

## Acceptance evidence

Each phase requires TypeScript, unit/component tests, native builds and manual journey checks. Backend features require integration tests against the configured service; mocks do not prove PostgreSQL/MongoDB, SMS, storage or AI operation. iOS is reported complete only after an actual iOS build and simulator/device verification.
