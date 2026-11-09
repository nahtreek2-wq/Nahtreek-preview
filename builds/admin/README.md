# Preview admin panel (built, staging)

Open `index.html` (serve the folder over HTTP) for the operations
console. Points at the staging backend, environment `staging`.

Refresh from source (`apps/preview-Admin/`):

```bash
cd ../apps/preview-Admin
ADMIN_ENV=staging NAHTREEK_API_BASE_URL=https://nahtreek-api.vercel.app/api/v1 \
  node scripts/build.mjs
cp -R dist/. ../../builds/admin/
```

Source code always stays in `apps/`.
