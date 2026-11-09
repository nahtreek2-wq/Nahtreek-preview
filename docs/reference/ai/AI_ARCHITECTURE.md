# AI architecture

```text
Client mobile app → authenticated NestJS AI module → provider adapter → structured plan
                         ↓
              PostgreSQL via Prisma + backend upload storage
```

The AI module owns conversations, messages, project plans, documents, ownership checks, upload validation, audit records, and a per-user rate limit. `AiProvider` separates the planner service from an OpenAI-compatible hosted provider. When no provider is configured, `GuidedPlannerProvider` supplies local development plans.

Database tables are defined in `apps/api/prisma/schema.prisma`. Apply them only after a PostgreSQL `DATABASE_URL` is configured:

```sh
cd apps/api
npx prisma db push
npm run build
```
