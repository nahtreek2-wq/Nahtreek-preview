# ADR-004: Authenticated Socket.IO Chat

## Decision

Use Socket.IO `/chat` for persisted engineer-request conversations. Authenticate the handshake, check session validity and conversation membership before room join, and emit a message only after database persistence. Add a pub/sub adapter before multi-instance scaling.
