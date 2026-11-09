# Security

The API validates DTOs with whitelist/forbid-extra-fields rules, uses Prisma parameterization, bcrypt cost 12, rotation/revocation-backed sessions, JWT issuer/audience checks, RBAC, and resource ownership checks. SMS, credential, and OTP values are not logged.

Production requires TLS, a `JWT_SECRET` of at least 32 characters, a configured SMS provider, restrictive CORS, PostgreSQL backups/encryption, secrets management, signed private uploads before document/media features, rate limiting/WAF, and monitoring. Token persistence on mobile is blocked until Keychain/Keystore storage is added.
