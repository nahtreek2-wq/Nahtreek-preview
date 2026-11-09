# NAHTREEK Professionals — production gap and implementation plan

## Product boundary

NAHTREEK Client and NAHTREEK Professionals are separate mobile applications using one backend and one source of truth. The Client app creates and follows work. The Professionals app receives, accepts, performs and closes that work. Neither app should copy another app's live records into device constants.

## Current shared workflow

1. A Client discovers a verified engineer or service professional from backend catalogue and profile endpoints.
2. The Client creates an engineer request or service request.
3. The backend stores the request, its first status-history record, audit records and a notification for the assigned professional in one transaction.
4. The Professionals app reads the assigned inbox and can accept, decline, start or complete eligible work.
5. Every status transition is concurrency-checked, stored in history and notified to the other account.
6. Once accepted, either participant can open the request conversation. Messages are stored centrally, delivered over Socket.IO and create a notification for the other participant.
7. Both applications read the same request, conversation, notification and history records. The mobile applications never synchronize directly with one another.

## Implemented in the Professionals app

- Separate Android package and role-specific registration for Civil Engineers and Service Professionals.
- Password login, phone OTP registration, reset-password flow, rotating refresh session and secure local token storage.
- Identity onboarding and backend-driven engineering specializations/service categories.
- Professional profile, work location, qualification, services, pricing and profile photo.
- Verification-state display without falsely granting verification.
- Assigned request inbox, filters, request detail, Google Maps link and status transitions.
- Availability slots and pause/resume matching.
- Shared request conversations with REST history and Socket.IO live messages.
- Real per-conversation unread count and message notifications.
- Professional notifications with mark-read and deep links to requests/messages.
- Branded startup loading screen, skeleton loading states, network/focus-aware queries, account-isolated cache and render-error recovery.
- Backend validation, ownership checks, audit history and transactional request updates.

## Client hardcoding that must be removed or strictly limited

Live engineers, providers, availability, prices, reviews, requests, conversations, notifications and account records must only come from the backend. The current `offlineCatalogue.ts` contains recovered sample engineers, requests, conversations and notifications. It may be retained only as a clearly labelled demo/reference mode and must never merge with production data.

The following UI constants are acceptable because they describe presentation, not live business records: navigation labels, status labels, empty-state copy, onboarding explanations and icon mappings. The following should become server-managed configuration if operations must change them without an app release: service groups, service guides, discovery filters, home banners, supported cities, FAQ/help content and AI project types.

## Required production modules still missing

### P0 — required before real users

- Production PostgreSQL instance, migrations, seed/reference data and encrypted environment configuration.
- HTTPS API hostname configured into signed builds; no blank API base URL in distributable builds.
- Real SMS provider, OTP abuse controls, email verification and account recovery monitoring.
- Push notification registration, device-token lifecycle, FCM delivery and notification deep links.
- Professional verification document upload, secure object storage, malware/type checks, expiry and admin review workflow.
- Terms, privacy consent versioning, account deletion/export and support escalation.
- Crash reporting, structured logs, API metrics, alerting and backup/restore drills.
- End-to-end tests using two real test accounts: Client and Professional.

### P1 — professional product depth

- Custom weekly availability, blocked dates, booked visits and conflict detection.
- Job calendar with request visits, reschedule proposals and client confirmation.
- Portfolio projects with multiple photos, captions and moderation.
- Service areas by radius/locality/postcode instead of one base coordinate.
- Quote/estimate creation, line items, revisions and client acceptance.
- Milestones, work notes, before/after photos and completion evidence.
- Earnings ledger, invoice/receipt records and payout state (payment gateway requires a separate security review).
- Ratings/reviews inbox and professional responses.
- Leads analytics: views, response time, acceptance rate, completed work and rating trends.
- Help centre, issue reporting, account/security settings and language/accessibility preferences.

### P2 — higher-level capabilities

- Team/business accounts with staff permissions.
- AI-assisted request summarization, quote drafting and schedule suggestions with explicit human confirmation.
- Fraud/risk signals, duplicate-account checks and verification renewal.
- Tamil and additional regional-language content managed through localization files or a CMS.

## Shared API ownership

| Domain | Client writes | Professional writes | Both read |
| --- | --- | --- | --- |
| Profiles | Client profile | Professional profile, capabilities, availability | Public approved professional profile |
| Requests | Create/cancel/review | Accept/decline/start/complete | Detail and status history |
| Conversations | Messages/read receipt | Messages/read receipt | Conversation and unread state |
| Notifications | Mark read | Mark read | User-scoped notification feed |
| History | — | — | User-scoped audit/activity history |

## Definition of production ready

Production ready means the complete two-account flow passes on a real staging backend: professional registers and submits documents; admin verifies; Client discovers that professional; Client creates a request; Professional receives a push notification; Professional accepts and messages; Client receives both updates; location and schedule are confirmed; Professional completes the work; Client reviews it; both histories remain correct after reinstall and token refresh. A successful APK build alone is not production readiness.
