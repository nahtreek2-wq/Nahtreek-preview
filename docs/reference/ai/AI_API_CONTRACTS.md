# AI Project Planner API Contracts

All routes are under `/api/v1/ai-projects`, require client authentication and enforce record ownership on the server.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/` | Create a draft project using an idempotency key |
| `GET` | `/` | Return an owned, cursor-paginated project list |
| `GET` | `/:projectId` | Return project facts and active plan summary |
| `PATCH` | `/:projectId` | Validate and update editable project facts |
| `POST` | `/:projectId/messages` | Add a bounded client message |
| `POST` | `/:projectId/attachments/init` | Validate metadata and create a private upload grant |
| `POST` | `/:projectId/attachments/:attachmentId/complete` | Queue scan and extraction after upload |
| `POST` | `/:projectId/generations` | Queue generation and return an operation |
| `GET` | `/:projectId/generations/:operationId` | Read generation status |
| `GET` | `/:projectId/versions` | List immutable plan versions |
| `GET` | `/:projectId/versions/:versionId` | Read an owned version |
| `POST` | `/:projectId/versions/:versionId/activate` | Select an existing version |
| `POST` | `/:projectId/archive` | Archive without deleting |
| `POST` | `/:projectId/restore` | Restore an archived project |
| `DELETE` | `/:projectId` | Start authorized deletion and retention cleanup |

Mutations return stable error codes, correlation IDs and server timestamps. Lists are bounded and cursor-paginated. Attachment bytes never pass through JSON. Generation accepts no provider name, system prompt or arbitrary retrieval source from the client.
