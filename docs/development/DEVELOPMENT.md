# Development

The monorepo contains `apps/client-mobile`, `apps/engineer-mobile`, `apps/api`, `packages/types`, and `packages/design-system`. The Client app is the current phase; do not change Engineer app flows without explicit approval.

Before API integration, configure `DATABASE_URL`, a long random `JWT_SECRET`, `SMS_API_KEY`, and permitted `CORS_ORIGINS` from `apps/api/.env.example`. Use `npx prisma generate --schema=apps/api/prisma/schema.prisma` after schema changes. The sample Engineer seed is disabled in production and accepts `SEED_ENGINEER_PASSWORD` only for local use.
