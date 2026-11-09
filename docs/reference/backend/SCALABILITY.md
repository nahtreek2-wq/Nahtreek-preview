# NAHTREEK Scaling Strategy & Evolution Plan

## 1. Modular Monolith Extraction Path
NAHTREEK starts as a NestJS **Modular Monolith**. Every business domain is encapsulated inside a self-contained module directory (`src/modules/<module-name>`).

## 2. Horizontal Scaling Roadmap
1. **Phase 1 (Monolith Optimization)**: Statemachine & cache caching via Redis; database connection pooling with PgBouncer.
2. **Phase 2 (Read/Write Separation)**: PostgreSQL primary instance for writes with read replicas for heavy discovery search queries.
3. **Phase 3 (Microservices Extraction)**: When traffic justifies, high-load modules (`auth`, `discovery`, `messaging`, `notifications`) can be extracted into independent microservices using standard gRPC / NATS bus without rewriting core domain services.
