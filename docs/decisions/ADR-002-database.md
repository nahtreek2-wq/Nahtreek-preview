# ADR-002: PostgreSQL & Prisma ORM Selection

## Status
Accepted

## Context
NAHTREEK requires strong data consistency, ACID transactions for request/booking lifecycles, relational integrity between users, profiles, reviews, and spatial location capabilities.

## Decision
Use PostgreSQL 15+ as the central relational database engine with Prisma ORM for type-safe query building and migrations.

## Consequences
- **Positive**: Strict foreign key constraints, ACID transaction safety, PostGIS extension support for distance calculations.
- **Negative**: Database migrations must be managed carefully across environment stages.
