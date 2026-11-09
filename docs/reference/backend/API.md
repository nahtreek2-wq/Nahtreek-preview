# NAHTREEK API v1

Base URL: `/api/v1`. Protected routes require `Authorization: Bearer <accessToken>`.

| Method | Path | Scope |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/otp/request`, `/auth/otp/verify` | public access |
| POST | `/auth/refresh`, `/auth/logout` | rotating/revoking session |
| GET/PATCH | `/clients/me` | Client-owned profile and home location |
| GET | `/discovery/engineers`, `/discovery/engineers/:id`, `/discovery/search` | verified engineer discovery |
| GET/POST | `/engineer-requests` | Client-owned engineering requests |
| GET/PATCH/POST | `/engineer-requests/:id`, `/engineer-requests/:id/cancel`, `/engineer-requests/:id/reviews` | detail, allowed cancellation, post-completion review |
| GET/POST/PATCH | `/conversations`, `/conversations/:id/messages`, `/conversations/:id/read` | request participants only |
| GET/POST/DELETE | `/favorites` | Client-owned favorites |
| GET/PATCH | `/notifications` | Client-owned notification history/read state |

Socket.IO uses `/chat`. The handshake sends `auth.token`; room joins require ConversationParticipant membership; `message:created` is emitted only after persistence.
