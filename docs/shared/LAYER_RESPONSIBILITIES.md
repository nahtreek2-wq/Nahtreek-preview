# Layer responsibilities

## Client mobile

- Account access and client profile.
- City-aware discovery of approved professionals.
- Service/engineering request creation and status history.
- Conversations, notifications, saved professionals and profile management.
- It must never display unverified or inactive professionals.

## Professional mobile

- Engineer/service-provider account access.
- Work identity, service areas, qualifications, prices and availability.
- Profile photo and verification-proof upload.
- Explicit submission to administrator review.
- Request inbox, lifecycle updates, schedule, conversations and notifications.
- It displays the server verification status; it cannot approve itself.

## Admin web

- Operational overview and user search.
- Verification document review and profile approve/reject decisions.
- Private proof viewing through short-lived signed document links.
- Controlled editing of user display/location details without changing roles,
  passwords or verification decisions.
- Account suspension, reversible deactivation and reactivation.
- Audit-backed administrative actions.
- Permanent deletion is not exposed because marketplace history must remain intact.

## API

- Validation, authentication, authorization and rate-sensitive workflows.
- The source of truth for account, verification and request status.
- Signed/private file access, database transactions and audit records.
- Cross-app data synchronization through shared identifiers.

## Database and storage

- PostgreSQL stores users, profiles, roles, requests, histories, messages,
  notifications, review decisions and audit events.
- Private object storage stores verification documents.
- Public or controlled media storage stores approved profile/work images.
- Secrets are runtime configuration and must never be committed.
