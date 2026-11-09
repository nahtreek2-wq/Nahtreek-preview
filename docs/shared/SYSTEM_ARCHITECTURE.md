# Shared system architecture

## Runtime topology

```text
Client Android app ───────┐
Professional Android app ─┼── HTTPS API ── PostgreSQL
Admin web console ────────┘       │        Object storage
                                  ├──────── Realtime notifications
                                  └──────── Audit log
```

The mobile applications never exchange records directly. They read and write
through `apps/api`, which enforces authentication, role authorization, status
transitions and audit logging.

## Identity and authorization

- Client users have the `CLIENT` role.
- Professional users have `ENGINEER` or `SERVICE_PROVIDER` roles.
- Administrators have the `ADMIN` role.
- Access and refresh tokens identify the same database user across API calls.
- Restricting or deactivating an account revokes active sessions.

## Professional visibility invariant

A professional is discoverable only when all of these are true:

1. the user account is active and not deactivated;
2. the professional profile has `verificationStatus = VERIFIED`;
3. the selected city/service/specialization matches the client query.

The API applies this invariant. Neither mobile app can bypass it.

Availability is shown and can affect ordering. The API blocks a new request when
the selected professional is unavailable, even if that verified profile remains
visible for client comparison.

## Environment model

Preview/V2 and Production use the same source commit, Prisma migrations and API
contract. Databases, storage buckets, credentials, domains, signing keys and
monitoring are isolated per environment.
