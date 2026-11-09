# NAHTREEK Platform Architecture

**Tagline:** From Plot to Home

NAHTREEK has two mobile applications: Client and Engineer. Both use one NestJS API and PostgreSQL database through Prisma. There is no Service Provider application or booking domain.

```text
Client mobile ─┐
               ├── HTTPS + authenticated Socket.IO ── NestJS API ── PostgreSQL
Engineer mobile┘                                      │
                                                       └── SMS provider
```

The Client app is the current delivery phase. It discovers verified civil engineers, creates engineer requests, tracks a server-controlled lifecycle, saves engineers, receives persisted notifications, and messages only an accepted-request participant. The Engineer app will consume the same records after explicit approval.

Requests are server-owned: `PENDING → ACCEPTED → IN_PROGRESS → COMPLETED`, with `DECLINED` and `CANCELLED` terminal. Clients may cancel only `PENDING` or `ACCEPTED` requests.
