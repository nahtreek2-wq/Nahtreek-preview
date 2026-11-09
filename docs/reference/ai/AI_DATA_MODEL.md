# AI Project Planner Data Model

Every record is client-owned, uses opaque identifiers and includes `createdAt`, `updatedAt` and an optimistic concurrency version.

## Project

- `id`, `clientId`, `title`, `city`, `status`
- structured `facts`: project type, property type, scope, budget band, target timing and constraints
- `activePlanVersionId`, `archivedAt`, `deletedAt`

## Planner message

- `id`, `projectId`, `role` (`client`, `assistant`, `system_notice`)
- sanitized text, sequence, optional generation operation ID
- no raw provider payload or secret prompt

## Attachment

- `id`, `projectId`, owner, original display name, storage key
- MIME type, byte size, checksum, scan status and processing status
- extracted-text storage key, parser version and deletion timestamps

## Plan version

- `id`, `projectId`, version number, source operation ID
- structured sections: summary, assumptions, phases, decisions, risks, questions and suggested professional categories
- model/provider metadata suitable for audit, excluding hidden reasoning
- immutable after creation; edits create a new version

## Audit event

- actor, project, action, target, timestamp, request correlation ID and minimal safe metadata
- records create, generation, retry, version selection, archive, restore and delete

The current Prisma/PostgreSQL schema does not yet contain these models. Equivalent Mongoose schemas must not be introduced until the database migration decision is explicit.
