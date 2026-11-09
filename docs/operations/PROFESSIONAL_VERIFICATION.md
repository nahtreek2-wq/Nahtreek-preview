# Professional verification runbook

## Submission requirements

- Engineer: identity proof, address proof and qualification proof.
- Service provider: identity proof, address proof and work proof.
- Optional licences can be uploaded when applicable.
- Files are limited to validated PDF/JPG/PNG/WebP content under 1 MB.

## Administrator procedure

1. Open the correct environment's admin console.
2. Select an `UNDER_REVIEW` professional.
3. Compare identity and profile details with each private document.
4. Approve or reject every required document. Record a clear reason for rejection.
5. Approve the profile only after required proofs are approved.
6. Confirm that the professional receives the updated status.
7. Confirm that approved active profiles appear in matching client discovery and
   rejected/unreviewed profiles do not.

## State meanings

- `NOT_SUBMITTED`: profile has not started review.
- `PENDING`: work details exist but proof submission is incomplete.
- `UNDER_REVIEW`: the application is visible in the admin review queue.
- `VERIFIED`: eligible for client discovery when active and available.
- `REJECTED`: professional must correct data or replace proof and resubmit.

Every document and profile decision is recorded in the audit log with the acting
administrator and timestamp.
