# Authentication

Passwords use bcrypt cost 12. OTPs use `crypto.randomInt`, are stored only as SHA-256 hashes, expire after five minutes, and are limited to one request per 30 seconds and five verification attempts.

Access JWTs expire in 15 minutes and include issuer, audience, user id, roles, and session id. Refresh tokens are opaque `sessionId.secret` values; only a hash is persisted, refresh rotates the session, and logout revokes it. JWT validation checks the active database session, so revoked sessions lose access immediately.

The Client keeps tokens only in memory. A release must integrate Keychain/Keystore-backed storage before persistent sessions are enabled; tokens must never enter AsyncStorage.
