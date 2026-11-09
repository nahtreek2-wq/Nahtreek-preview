# NAHTREEK Testing Strategy & Quality Standards

## 1. Testing Hierarchy
- **Unit Tests (Jest)**: Validate business domain logic, pure utility functions, and state machine transition rules.
- **Integration Tests**: Validate NestJS modules with PostgreSQL and Redis test containers.
- **API Tests (Supertest)**: Test authentication endpoints, authorization guards, request lifecycles, and error responses.
- **End-to-End Tests**: Critical path testing from client mobile UI to backend APIs.

## 2. Mandatory Security & Boundary Test Suite
- **Cross-User Data Access Test**: Verify Client A cannot fetch Client B's private project details or messaging history (IDOR check).
- **Role Escalation Test**: Verify Client cannot invoke Engineer or Admin protected API endpoints.
- **State Transition Enforcement Test**: Verify clients/professionals cannot directly set invalid status fields (e.g. jumping from `PENDING` directly to `COMPLETED`).
- **Document Access Test**: Verify unauthenticated users cannot access sensitive verification document S3 URLs.
