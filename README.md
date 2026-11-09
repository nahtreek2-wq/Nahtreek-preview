# NAHTREEK preview tree (testing)

Four apps, one shared backend, test data only.

| App | Source | Install from |
|---|---|---|
| Home | `apps/preview-Home/` | `builds/android/Nahtreek-Home.apk`, `builds/ios/Nahtreek-Home.app` |
| Pro | `apps/preview-Pro/` | `builds/android/Nahtreek-Pro.apk` |
| API | `apps/preview-Api/` | staging backend |
| Admin | `apps/preview-Admin/` | `builds/admin/` (built panel) |

Shared code: `packages/`. Guides: `docs/home.md`, `docs/professional.md`.
Map: `PROJECT_LAYOUT.md`. Commands: `CODEBASE.md`.

Mirror every change to `Nahtreek-production/` at the same relative path.
