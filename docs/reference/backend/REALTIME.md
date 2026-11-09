# Realtime

The active realtime feature is request-linked chat. Socket.IO connects to `/chat` using `auth.token`, verifies JWT issuer/audience and session validity, then validates membership before joining a conversation room.

Before scaling API instances, configure a Socket.IO adapter and pub/sub layer. Notifications persist in PostgreSQL; FCM/APNs and realtime request-status events are future integrations, not current claims.
