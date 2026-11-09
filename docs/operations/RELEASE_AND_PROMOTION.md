# Release and promotion runbook

## Promotion model

1. Select one source commit.
2. Apply and verify its Prisma migrations in Preview/V2.
3. Build the API, admin, client and professional app from that commit.
4. Run unit, integration and role-based acceptance tests.
5. Test professional submission, admin approval, client discovery and request delivery.
6. Resolve dependency/security findings.
7. Back up production and rehearse rollback/restore.
8. Deploy the same commit and migrations using production-only credentials.
9. Run smoke tests and monitor errors, latency and queue health.

## Mandatory gates

- No secrets in source, docs, APK resources or logs.
- SMS/DLT, email, maps and payment providers use restricted production keys.
- Administrator MFA/SSO and least-privilege access are enabled.
- Database backup restoration has been tested.
- Profile documents remain private and signed access expires.
- Both Android apps use the production API and production signing identity.
- Client/professional/admin/API versions and database migration are recorded.
- Rollback steps and an incident contact are available.
