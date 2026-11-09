# Preview/V2 layers

| Layer | Source | Preview responsibility |
| --- | --- | --- |
| Client | `apps/client-mobile` | Uses preview API; displays only preview-approved professionals |
| Professional | `apps/professional-mobile` | Saves profile, uploads proof and submits to preview admin review |
| Admin | `apps/admin-web` | Reviews preview records at the deployed preview console |
| API | `apps/api` | Runs shared business rules on Vercel |
| Database | Supabase PostgreSQL | Isolated preview users, profiles, requests and history |
| Storage | Supabase Storage | Isolated preview profile and verification files |
| Releases | `releases/preview` | Debug/acceptance APKs and generated metadata |

The live preview admin URL is documented in
`deployments/preview/admin/README.md`. All credentials belong in Vercel or
Supabase secret management, never in this repository.
