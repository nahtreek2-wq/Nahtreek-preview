# NAHTREEK AI Project Planner

The Client app’s planner starts with a guided project choice, collects only the details a homeowner knows, stores the conversation, and creates a structured plan. Each recommendation opens an existing NAHTREEK route for engineers, services, or requests.

## What is saved

- Conversations and messages
- Versioned plans with stages, recommendations, checklist, and missing information
- Project photos and supported document records
- Audit events for planner actions

The app never includes AI provider secrets. All planner calls go through `POST /api/v1/ai/...` and require a Client access token.

## Local and hosted operation

Without AI configuration the backend uses a deterministic guided planner. This lets the full user journey work during local development without a third-party key.

To enable a hosted OpenAI-compatible provider on the backend only, set:

```env
AI_PROVIDER_URL=https://openrouter.ai/api/v1/chat/completions
AI_PROVIDER_API_KEY=server-only-secret
AI_MODEL=nvidia/nemotron-3.5-super-vl:free
AI_VISION_MODEL=nvidia/nemotron-3.5-super-vl:free
```

Preview uses OpenRouter (OpenAI-compatible, `Bearer` auth) with a free vision-capable model. The chat and vision models must accept `image_url` parts for photo analysis; swap `AI_MODEL`/`AI_VISION_MODEL` for another OpenRouter slug to change models without code changes.

The hosted provider now receives up to twelve previous text messages. Plan responses are validated before being saved; document filenames do not constitute document-content analysis. Requests have provider timeouts (30s chat, 60s plans, 45s vision) and bounded output budgets (2400 chat/vision tokens, 4000 plan tokens). Failed provider calls are logged server-side with HTTP status; unparseable model output is logged with an excerpt before the guided fallback serves the request. AI actions use a shared PostgreSQL rate window (12 actions per user per 10 minutes).

Do not place these values in Android or iOS configuration files. Configure `DATABASE_URL`, run `npx prisma db push`, and restart the API before using persistent plans.

## Documents

The current mobile implementation uploads project photos up to 1 MB. The API safely accepts JPEG, PNG, WebP, PDF, and text records, validates file signatures, and stores them under backend-controlled uploads. Image and text records are ready to reference in a plan; PDF extraction remains processing until a document-processing worker is configured. The planner never claims that a pending document was analysed.

## Safety

Plans are planning guidance. The app must continue to direct structural, electrical, approval, and legal decisions to qualified professionals.
