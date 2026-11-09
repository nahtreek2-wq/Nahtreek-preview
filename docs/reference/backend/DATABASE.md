# Database

PostgreSQL is accessed only through Prisma. The initial migration is `apps/api/prisma/migrations/20260911000000_initial_engineering_platform` and creates the two-app domain: users/roles/sessions/OTP challenges; Client and Engineer profiles; engineer specializations, availability, service areas, portfolio, verification documents; requests and status history; reviews; conversations/messages; notifications; favorites; and audit logs.

`EngineerRequest` indexes Client/status and Engineer/status. Conversations/messages and notifications have their own read/list indexes. Foreign keys and unique constraints enforce identity, one profile extension, one request review, and conversation participants.

The AI Project Planner uses the same PostgreSQL schema for AI conversations,
messages, project plans, and document records. Each record belongs to the signed-in
Client user and has indexes for history and plan retrieval.

Apply a production migration only against a provisioned PostgreSQL database with `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`. The committed migration has not been applied in this workspace because `DATABASE_URL` is absent.
