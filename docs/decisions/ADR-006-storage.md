# ADR-006: S3-Compatible Object Storage with Signed Upload URLs

## Status
Accepted

## Context
NAHTREEK handles public media assets (profile photos, portfolio work images) as well as highly sensitive private documents (identity verification papers, engineering degree certificates).

## Decision
Use AWS S3 object storage (or S3-compatible alternatives like MinIO for local dev). Store binary assets strictly in S3 while PostgreSQL stores metadata references. Enforce private bucket policies with Signed URLs for verification documents.

## Consequences
- **Positive**: High availability, cost-effective media storage, strict security controls over sensitive verification records.
- **Negative**: Requires secure pre-signed URL generation flow in NestJS backend.
