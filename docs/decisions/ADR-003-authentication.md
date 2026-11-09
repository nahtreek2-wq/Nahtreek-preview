# ADR-003: Database-Backed Refresh Sessions

## Decision

Use 15-minute JWT access tokens and rotating opaque refresh tokens. Persist only refresh-token hashes in PostgreSQL sessions, revoke on logout, and validate the session for every access JWT. Mobile persistence must use Keychain/Keystore when introduced.
