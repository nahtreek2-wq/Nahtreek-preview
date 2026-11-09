# Authorization

`JwtAuthGuard` validates signature and active session. `RolesGuard` applies role requirements, and services scope private records to the caller.

| Capability | Client | Engineer |
|---|---:|---:|
| Edit Client profile | own | no |
| Create, view, cancel, review request | own | no |
| Advance assigned request | no | yes |
| Send or read request conversation | participant | participant |

The API derives client, engineer, sender, and request state from stored records, never from a mobile request body.
