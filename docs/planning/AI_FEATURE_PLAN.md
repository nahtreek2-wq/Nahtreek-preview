# AI Project Planner Feature Plan

## Product outcome

Help a client turn an unclear construction or home-service need into an understandable, editable project plan. The planner must guide rather than impersonate an engineer, contractor, authority or cost estimator.

## User journey

1. Start a project with a plain-language goal and city.
2. Answer short guided questions about property, scope, budget range, timing and constraints.
3. Add optional photos or documents after consent and validation.
4. Review an input summary before generation.
5. Generate a clearly labelled AI draft containing scope, assumptions, phases, decisions, risks, questions and suggested professional categories.
6. Edit project facts, regenerate a new version, compare versions, archive or delete.
7. Continue into real service discovery or a request without silently copying sensitive attachments.

## Delivery gates

- Gate 1: choose PostgreSQL/Prisma retention or approve MongoDB/Mongoose migration.
- Gate 2: configure private object storage, malware scanning and document processing.
- Gate 3: select an AI provider and define per-user limits, cost limits and retention.
- Gate 4: pass authorization, prompt-injection, deletion and model-quality evaluations.
- Gate 5: verify Android and iOS journeys against configured staging services.

Offline mode may save a local draft, but it cannot claim to generate, upload or synchronize an AI plan.
