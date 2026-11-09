# NAHTREEK Professionals — Implementation Plan

**Product:** NAHTREEK Professionals  
**Applications:** one Client app + one role-aware Professionals app  
**Professional roles:** Civil Engineer and Service Professional  
**Shared platform:** NestJS + MongoDB Atlas + Mongoose  
**Mobile:** React Native + TypeScript, Android and iOS

## Non-negotiable rules

- Preserve the working Client app and its user-facing behavior throughout migration.
- Use one shared backend and one authoritative MongoDB database.
- Never connect a mobile app directly to MongoDB or embed provider secrets in a mobile build.
- Do not display fake requests, ratings, verification, earnings, availability, payments, tracking, or metrics.
- Do not remove Prisma until MongoDB parity, migration verification, Client regression tests, and rollback readiness are complete.
- Keep incomplete external-provider features disabled behind explicit feature flags.
- A phase is complete only after implementation, tests, failure/offline checks, visual inspection, and documentation.

## Target repository

```text
apps/
  api/                    Shared NestJS API
  client-mobile/          Existing NAHTREEK Client app
  professional-mobile/    New NAHTREEK Professionals app
packages/
  design-system/          Shared brand tokens and components
  types/                  Shared API/domain contracts
docs/                     Architecture, workflow, operations, and release docs
```

## Phase 0 — Baseline and safety gate

### Work

- Capture Client app tests, Android build, API build, and current public route inventory.
- Record active environment variables without recording secret values.
- Add contract fixtures for auth, profile, discovery, requests, messaging, notifications, and AI.
- Define feature flags: `QUOTATIONS`, `PAYMENTS`, `AI_ASSISTANT`, `PUSH_NOTIFICATIONS`, `MAPS`, `LIVE_LOCATION`, `PROVIDER_VERIFICATION`.

### Exit gate

- Existing Client checks pass.
- Existing Client APK remains buildable.
- Public API contract baseline is committed to tests/documentation.

## Phase 1 — MongoDB domain foundation

### Work

- Add NestJS Mongoose integration and configuration validation.
- Define collections and indexes for users, sessions, profiles, catalogs, requests, status history, conversations, messages, notifications, favorites, reviews, availability, portfolios, files, quotations, audit logs, and AI records.
- Introduce repository/domain interfaces so controllers do not depend on Prisma or Mongoose details.
- Add MongoDB health checks and local-development setup.
- Use MongoDB transactions only for multi-document invariants that require them.

### Exit gate

- Mongoose schemas compile and indexes are tested.
- No public API response changes.
- MongoDB integration tests run against an isolated test database.

## Phase 2 — Controlled Prisma-to-MongoDB migration

### Order

1. Authentication, users, roles/capabilities, sessions, OTP.
2. Client profiles and discovery catalogs.
3. Professional profiles, specializations, services, verification.
4. Unified requests and request-status history.
5. Messaging and notifications.
6. Favorites and reviews.
7. AI records, files, and audit events.

### Work

- Build idempotent migration scripts with dry-run, counts, validation, and error reports.
- Preserve stable external IDs or maintain an explicit ID mapping.
- Dual-read/controlled cutover only where required; avoid long-lived dual writes.
- Run parity comparisons before switching the API.
- Remove Prisma dependencies and PostgreSQL documentation only after cutover acceptance.

### Exit gate

- Record counts and required invariants match.
- Client contract and regression tests pass against MongoDB.
- Rollback procedure is documented and tested.
- PostgreSQL/Prisma is no longer used by production code.

## Phase 3 — Shared professional backend

### Identity and onboarding

- Professional registration using mobile, email, password, confirmation, and consent.
- Progressive role selection: Civil Engineer or Service Professional.
- Progressive profile setup with role-specific fields.
- Backend-driven specialization and service catalogs.
- Verification states: Draft, Profile Completed, Submitted, Under Review, Changes Required, Verified, Rejected, Suspended.

### Security

- JWT access tokens and rotating refresh sessions.
- Professional/capability/ownership guards.
- ObjectId, enum, string, pricing, date, file, and transition validation.
- IDOR tests for requests, files, quotations, profiles, and conversations.

### Exit gate

- Both professional types can register, restore a session, complete profiles, and submit verification.
- Verification is never granted by the mobile app.

## Phase 4 — Professionals mobile foundation

### Work

- Create `apps/professional-mobile` with package/bundle ID `com.nahtreek.professional`.
- Reuse NAHTREEK logo assets and shared design tokens.
- Add simple startup, secure session hydration, network state, query client, role/capability state, error boundary, toast system, and feature flags.
- Bottom navigation: Home, Requests, Schedule, Messages, Profile.
- Build compact button variants and accessible shared components.
- Add Android adaptive icon and iOS app icon assets with correct safe zones.

### Exit gate

- Android and iOS projects compile.
- Startup, session restore, logout, offline state, keyboard handling, safe areas, and accessibility basics pass.

## Phase 5 — Authentication and progressive onboarding

### Shared screens

- Login, create account, verification, forgot password, reset password.
- Isolated state/errors for each authentication flow.
- Professional-type choice with plain-language explanations.

### Engineer onboarding

- Identity, location/service area, specializations, experience, qualification, bio, languages, fee, availability, portfolio, credentials.

### Service-professional onboarding

- Identity/business, location/service area, service categories, experience, about, languages, pricing model, availability, portfolio, credentials.

### Exit gate

- Small-screen and keyboard tests pass.
- Interrupted onboarding resumes at the correct server-backed step.
- Profile completion uses actual required-field state.

## Phase 6 — Professional work dashboard

### Sections

- Compact professional header, work status, profile status, new requests, upcoming schedule, active work, unread messages, recent activity, real performance indicators, and useful actions.
- Each section handles loading, empty, error, offline, and partial failure independently.

### Exit gate

- No hardcoded metrics or requests.
- Role-specific dashboard content appears only when relevant.

## Phase 7 — Unified request workflow

### Backend

- One typed request domain for engineering consultation/project, home service, inspection, renovation, and maintenance.
- Server-controlled transitions: Pending, Accepted, Scheduled, In Progress, Completed; Declined/Cancelled under explicit rules.
- Append-only status history with actor, role, reason, and timestamp.
- Matching/eligibility and assignment rules.

### Mobile

- Request inbox, filters, detail, attachments, timeline, client context, actions, and contextual chat link.
- Ask question, accept, decline, schedule, start, and complete actions only when authorized.

### Exit gate

- Client creates a request; an eligible professional receives and transitions it; both apps display the same state.

## Phase 8 — Schedule and availability

- Weekly schedule, time slots, days off, blocked dates, temporary unavailable state, service visits, consultations, and active jobs.
- Store bounded schedule records, not an indefinitely growing profile document.
- Manual service-area setup remains available when location permission is denied.

### Exit gate

- Conflicting slots are rejected server-side.
- Schedule changes are visible in both request and calendar contexts.

## Phase 9 — Messaging and notifications

- Contextual request conversations, paginated history, text/images/documents, retries, failed state, offline history, Socket.IO reconnect, deduplication, ordering, and app lifecycle handling.
- Persistent notification records and optional FCM/APNs adapters.
- Never show typing/read/delivery/online states until genuinely implemented.

### Exit gate

- Client and Professional can exchange messages on an authorized request.
- State remains fetchable if sockets or push delivery fail.

## Phase 10 — Profile, verification, portfolio, and reviews

- Full role-aware professional profile and editable service capabilities.
- Verification checklist, missing fields, submission, review status, and correction reasons.
- Portfolio CRUD, optimized media, progress, compression, thumbnails, retry, reorder, preview, and delete.
- Real rating summary/distribution/reviews; no professional ability to edit or delete client ratings.

### Exit gate

- Only backend-verified profiles receive the verified badge.
- Portfolio metadata is in MongoDB and media is handled by a storage adapter.

## Phase 11 — Quotations

- Feature-flagged quotation drafts, line items, server-calculated totals, notes, validity, and terms.
- States: Draft, Sent, Viewed, Accepted, Rejected, Expired, Withdrawn.
- Client acceptance/rejection is server-controlled and backward-compatible.
- Payments remain unavailable until provider and business rules are approved.

### Exit gate

- Quotation state/security/offline/duplicate-submission tests pass.
- No payment-success language exists.

## Phase 12 — Professional AI assistant

- Feature-flagged request summaries, missing-details detection, suggested client questions, work-plan drafts, scope drafts, quotation-description drafts, and checklists.
- All provider calls go through NestJS.
- AI output remains editable draft content and is never auto-sent or treated as engineering certification.

### Exit gate

- Provider failures degrade cleanly.
- Safety and approval boundaries are tested.

## Phase 13 — Production hardening

- Provider abstractions for storage, SMS, email, push, maps, AI, and monitoring.
- Rate limits, audit logs, secure upload validation, privacy-safe logging, session management, account deletion workflow, and support surfaces.
- Performance audits for startup, queries, lists, images, sockets, memory, and bundle size.
- Accessibility and responsive checks across small/standard/large Android and iPhone sizes.

## Phase 14 — Release and ecosystem acceptance

### Builds

- `NAHTREEK-Professionals-v1.0.0-internal.apk`
- `NAHTREEK-Professionals-v1.0.0.apk`
- `NAHTREEK-Professionals-v1.0.0.aab`
- TestFlight-ready iOS archive configuration.

### Mandatory two-device flow

```text
Client creates request
→ Professional receives and accepts
→ Client sees Accepted
→ Professional messages and schedules
→ Client sees message and schedule
→ Professional starts and completes work
→ Client sees each status
→ Client submits review
→ Professional sees the genuine review
```

### Completion gate

The product is complete only when the brief's Android, iOS, MongoDB persistence, role workflows, security, offline/error states, two-device synchronization, automated tests, and release checks are verified. Missing external credentials must be reported as configuration blockers, never represented as successful production integrations.

## Documentation deliverables

- `PROFESSIONAL_APP_ARCHITECTURE.md`
- `PROFESSIONAL_APP_AUDIT.md`
- `PROFESSIONAL_ROLES.md`
- `PROFESSIONAL_ONBOARDING.md`
- `PROFESSIONAL_VERIFICATION.md`
- `PROFESSIONAL_REQUEST_WORKFLOW.md`
- `AVAILABILITY.md`
- `QUOTATIONS.md`
- `MESSAGING.md`
- `MONGODB_ARCHITECTURE.md`
- `SHARED_API_CONTRACTS.md`
- `OFFLINE.md`
- `SECURITY.md`
- `TESTING.md`
- `ANDROID_PRO_RELEASE.md`
- `IOS_PRO_RELEASE.md`

## Immediate next build slice

1. Freeze Client/API contract tests and baseline builds.
2. Add MongoDB/Mongoose configuration, schemas, and test infrastructure.
3. Migrate authentication and sessions first.
4. Re-run Client regression tests against the MongoDB API.
5. Scaffold `apps/professional-mobile` only after shared identity is stable.
