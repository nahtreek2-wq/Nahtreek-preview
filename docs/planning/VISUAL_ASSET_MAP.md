# NAHTREEK Professionals visual asset map

The photos in this table are bundled with the Professional app. The generated contextual photos were created for this redesign with the built-in image generation tool and resized to 1200 px JPEG at 78% quality. They have no text or brand marks. The app's service catalogue and professional portfolio still come from the backend.

| Asset | Purpose | Screen/component | Role | State |
|---|---|---|---|---|
| `src/assets/nahtreek-logo.png` | Official brand mark | Splash, Home header, auth | Both | Brand only |
| `src/assets/professionals/engineer-work-banner-v1.png` | Work readiness context | Home intro | Engineer | Profile/work readiness |
| `src/assets/professionals/service-work-banner-v1.png` | Work readiness context | Home intro | Service provider | Profile/work readiness |
| `src/assets/professionals/engineer-job-detail-v1.jpg` | Reviewing site plans | `JobContextVisual` in Jobs and detail | Engineer | Engineering request |
| `src/assets/professionals/plumbing-job-detail-v1.jpg` | Actual plumbing context | `JobContextVisual` in Jobs and detail | Service provider | Plumbing request |
| `src/assets/professionals/painting-job-detail-v1.jpg` | Actual painting context | `JobContextVisual` in Jobs and detail | Service provider | Painting request |
| `WorkVisual` → engineering | Architectural tool pictogram | Fallback work imagery | Engineer | Unknown request category |
| `WorkVisual` → service category | Category-specific iconography from the shared catalogue mapping | Fallback work imagery | Service provider | Other service categories |
| `WorkVisual` → verification, schedule, message, review, portfolio, location, notification, offline, error | Semantic pictograms with appropriate surface tint | Attention rows, profile, notifications and feedback | Both | Distinct workflow and feedback states |
| Remote `avatarUrl` | Professional's chosen photo, with initial/icon fallback | Header, profile, public preview | Both | Account identity |
| Remote `portfolioItems[].imageUrl` | Uploaded project photography | Public profile/portfolio | Both | Real work examples |

Do not substitute bundled job photos for a customer's uploaded attachment, professional portfolio item, or live map. Do not repeatedly place a Home readiness banner on unrelated screens. For service categories without a dedicated bundled photo, `JobContextVisual` uses the category-specific icon; this avoids an incorrect or generic trade photo.
