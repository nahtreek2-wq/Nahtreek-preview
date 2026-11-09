# AI Project Planner Security

## Required controls

- Authenticate every route and authorize every project, message, attachment and plan lookup by owner.
- Keep AI and storage credentials server-side in a secret manager; never bundle them in mobile builds or logs.
- Apply user, IP and device-aware rate limits plus daily token and cost ceilings.
- Validate attachment extension, MIME signature, size and checksum; scan before parsing; use private object storage and short-lived grants.
- Escape and delimit extracted text. Explicitly classify it as untrusted content in server prompts.
- Permit retrieval only from the owning project and approved NAHTREEK reference content.
- Validate model output against a strict schema; render it as text, never executable markup.
- Redact tokens, passwords, contact details, precise addresses and document contents from telemetry.
- Make archive reversible and deletion auditable, idempotent and inclusive of stored files and derived text.

## Product safeguards

Every generated plan states that it is an AI-assisted planning draft, lists assumptions, and directs structural, legal, safety and cost decisions to qualified professionals. Verification badges, prices, availability and official approvals may come only from trusted platform data—not model output.

## Threat tests

Test cross-account ID access, attachment path traversal, MIME spoofing, decompression bombs, prompt injection inside documents, quota bypass, duplicate generation, stale-session resurrection, deletion races and sensitive-data leakage in logs/errors.
