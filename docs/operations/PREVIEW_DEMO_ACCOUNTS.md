# Preview demo accounts

The preview environment has a repeatable roster of 45 **fictional** test users:
15 clients, 15 engineers, and 15 service providers. Names are plausible but
invented; the profile images are distinct illustrated avatars, not real people.
The images are stored in the preview Supabase avatar bucket after generation.
These accounts are for UI, sign-in, onboarding, and admin workflow testing only.

Seeded and checked on 24 September 2026: the preview database contains exactly
15 accounts in each role, all 45 avatar URLs are distinct, and representative
Client, Engineer, and Service Provider logins each returned a session from the
deployed preview API. Three sampled public avatar URLs returned PNG images.
An Engineer and a Client also signed in through their preview APKs on the
emulator. The Client avatar/name loaded; the Professional avatar/name loaded.
The deployed public Engineer list initially excluded every new unverified demo Engineer.
On 24 September 2026, the 15 fictional Engineers and 15 fictional Service
Providers were enabled for **preview-only** discovery and booking demos at the
user's request. Every affected record has a `SYNTHETIC_PREVIEW_DEMO_APPROVED`
audit entry stating that no real identity review occurred. Their `(Demo)` names
and preview-only biographies must remain visible. This is not an approval of
identity, qualification, licence, or work history, and these records must never
be copied into production.

## Login and visibility

- Sign in with each account's email and password from the local credential file
  at `.local-private/NAHTREEK-preview-demo-credentials.json` (45 accounts:
  `client-01…15`, `engineer-01…15`, `provider-01…15`, all `@nahtreek.example`).
  It is git-ignored and must stay private. Never upload or commit it.
- Verified 3 Nov 2026: fresh Vercel deploy healthy, `client-01` login returns
  tokens (HTTP 201), authenticated engineer discovery returns seeded profiles.
- These accounts were inserted by a guarded preview seed, so their email is
  marked verified for login. No OTP was sent and this **does not** test live
  Gmail delivery or signup.
- Engineer and service-provider accounts have the right role, category or
  specialization, home city, and an illustrated avatar. The 30 fictional
  profiles have a preview-only `VERIFIED` flag to exercise the existing Client
  discovery and booking paths; none has submitted verification documents.
  Do not interpret the UI's verification badge on these demo records as real
  verification. A separate production database must not contain them.
- The roster is split evenly across Coimbatore, Krishnagiri, and Chennai.
  Engineer specializations rotate through Structural Design, Architectural 3D,
  Site Plan Approval, Geotechnical, and Renovation Audit. Service providers
  rotate through the current service catalogue.

## Rerun guard

The seed is idempotent for its own demo email/phone/display-name combination
and refuses to modify a different account. It requires matching database and
storage project references, `APP_ENV=staging`, and an explicit opt-in. It must
never be used against production. The implementation is
[`apps/api/prisma/seed-preview-accounts.ts`](../../apps/api/prisma/seed-preview-accounts.ts).

The avatars use DiceBear Notionists, a CC0 illustrated style. They are generated
once and copied into preview storage, so app display does not depend on the
external avatar API. Source: https://www.dicebear.com/styles/notionists/ .

## Acceptance checks still needed

The deployed preview API now returns all 15 demo Engineers and all 15 demo
Service Providers in public discovery (five of each in Coimbatore,
Krishnagiri, and Chennai). A complete Client-to-Professional booking test on
two phones is still needed. To test genuine admin verification, create a
separate preview professional account and submit clearly marked sample
documents through the normal workflow. Do not treat sample paperwork as real
identity proof, and do not promote demo profiles or the credential file to
production.
