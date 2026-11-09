# NAHTREEK Professionals — Repository Audit

**Date:** 2026-09-21  
**Scope:** Phase 1 audit for one role-aware NAHTREEK Professionals application serving civil engineers and service professionals.

## Current repository

| Area | Current state | Decision |
|---|---|---|
| `apps/client-mobile` | Active React Native Client application with offline fallback and shared design tokens | Preserve; do not disrupt its public API contracts. |
| Former `apps/engineer-mobile` | The engineer-only mock application was removed by the project owner before implementation began | Do not restore it. Create one role-aware `apps/professional-mobile` product. |
| `apps/api` | NestJS API backed entirely by Prisma/PostgreSQL | Migrate this shared API to MongoDB/Mongoose in phases; do not create a parallel API. |
| `packages/design-system` | Shared brand tokens and UI foundations | Reuse for the Professionals application. |
| `packages/types` | Shared TypeScript workspace package | Extend with shared request, professional, and quotation contracts after backend contract review. |

## Reusable API and domain modules

The following NestJS modules are reusable as domain boundaries, although their persistence implementation must change from Prisma to Mongoose:

- Authentication: registration, login, password reset, OTP, refresh token, logout, JWT and bcrypt.
- Client profiles and profile photo upload.
- Discovery: engineers, service categories, and service providers.
- Requests: engineer requests, service requests, status history, reviews.
- Conversations, messages, Socket.IO gateway, read states.
- Notifications and audit logs.
- Favorites.
- AI conversations, messages, plans, document metadata, upload validation, provider adapter, rate limiting.

Existing public API routes are versioned under `/api/v1`; retain route shapes where possible. New professional APIs must be additive and guarded by capability/ownership checks.

## PostgreSQL inventory and MongoDB mapping

| PostgreSQL / Prisma model group | MongoDB collection(s) | Notes |
|---|---|---|
| `User`, `UserRole`, `Session`, OTP records | `users`, `sessions`, `otpChallenges`, `devices` | Keep a user role/capability array and rotate refresh-token sessions. |
| `ClientProfile` | `clientProfiles` | One profile per Client user. |
| `ProfessionalProfile`, `EngineerProfile`, service categories, specializations, service areas, availability | `professionalProfiles`, `serviceCategories`, `specializations`, `availability` | Use a professional type plus capability array; GeoJSON service location requires a `2dsphere` index. |
| `EngineerRequest`, `ServiceRequest`, status-history models | `requests`, `requestStatusHistory` | Replace duplicated request tables with one typed request model and server-controlled state transitions. |
| `Conversation`, participants, `Message` | `conversations`, `messages` | Cursor pagination; membership and request-context ownership checks. |
| `Notification`, `Favorite`, `Review`, `AuditLog` | same-named collections | Index per user/professional and timestamp. |
| Portfolio and verification documents | `portfolioProjects`, `files`, `verificationSubmissions` | Store only metadata in MongoDB; use object storage for media. |
| AI models | `aiConversations`, `aiMessages`, `aiDocuments`, `aiPlans` | Preserve user ownership, upload validation, and audit logging. |

## Required MongoDB indexes

- `users.email` and `users.phoneNumber`: unique sparse indexes where relevant.
- `professionalProfiles.userId`: unique.
- `professionalProfiles.professionalType`, `serviceIds`, and `specializationIds`: query indexes.
- `professionalProfiles.location`: `2dsphere`.
- `requests.clientId + createdAt`, `requests.assignedProfessionalId + status + createdAt`.
- `messages.conversationId + createdAt`.
- `notifications.userId + createdAt`.
- `availability.professionalId + date`.
- `reviews.professionalId + createdAt`.
- `quotations.requestId + createdAt`.

## Incompatibilities and migration risks

1. The existing API injects `PrismaService` into its authentication, discovery, request, messaging, notification, platform, client, favorite, and AI services. This is a complete persistence-layer migration, not a configuration change.
2. PostgreSQL foreign keys and Prisma transactions must be replaced deliberately with MongoDB references, unique indexes, transactions where necessary, and explicit ownership checks.
3. Existing engineer and service request records use separate tables. The Professional product needs one generalized request domain with typed workflows while retaining backward-compatible Client routes during transition.
4. The former engineer-only application used mock data and has been removed. No mock lead, rating, earnings, verification, or availability behavior may be copied into production workflows.
5. The active Client APK currently runs with local/offline development adapters when no API URL is configured. Real cross-device synchronization cannot be claimed until the MongoDB API is deployed.

## Missing professional-side API capabilities

- Professional account creation and progressive profile onboarding.
- Professional role/capability selection and verification submission/review states.
- Professional request inbox, eligibility matching, accept/decline, scheduling, and completion actions.
- Professional availability, schedule, blocked times, and service-area management.
- Portfolio management and storage-provider abstraction.
- Professional review analytics from real reviews only.
- Quotations with server-side totals, lifecycle, client acceptance, and feature flags.
- Professional notification preferences, device registration, and push delivery.
- Professional AI drafts: summaries, questions, scopes, checklists, and quotation descriptions; never auto-send.

## Client compatibility requirements

- Keep current Client API routes working until a versioned replacement is deployed.
- Return backward-compatible request payloads while the unified request domain is introduced.
- Preserve Client authorization: Clients can view and mutate only their own profiles, requests, conversations, favorites, and AI records.
- Professional actions must create shared request history, notifications, and Socket.IO events so the Client sees actual server state.
- Do not place MongoDB, AI, storage, push, maps, SMS, or email secrets in either mobile application.

## Safe implementation order

1. Define Mongoose schemas, indexes, repository interfaces, migration scripts, and contract tests.
2. Implement MongoDB persistence behind the existing API contract; run Client regression tests.
3. Switch the API only after MongoDB parity and data migration verification; remove Prisma after cutover validation.
4. Create `apps/professional-mobile` as one role-aware application, reusing design tokens and common infrastructure.
5. Implement onboarding, verification, request workflows, availability, messaging, portfolio, reviews, and quotations phase-by-phase.
6. Perform real two-device Client-to-Professional end-to-end testing before production claims.

## External configuration still required

- MongoDB Atlas URI and backup policy.
- Object storage credentials and media delivery policy.
- SMS/OTP and email providers.
- FCM/APNs credentials.
- Maps provider key and location/privacy policy.
- Hosted AI provider credentials, if enabled.
- Monitoring, error reporting, and production domain/API hosting.

## Audit conclusion

The current Client app and NestJS domain modules provide a good base, but the requested Professionals product and MongoDB architecture are not yet implemented. The correct next action is a controlled MongoDB migration and shared-contract stabilization, followed by a new role-aware Professionals app—not adapting the mock engineer app into a production system.
