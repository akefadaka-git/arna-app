# Admin Control Plane — Frontend Integration Contract

The Admin build consumes the central read APIs delivered by the API repository. It does not own identity, tenant or RBAC data and does not make authorization decisions.

- Admin application entry access requires `app.admin.access`.
- Identity pages require `platform.identity.read`.
- Roles and permissions pages require `platform.rbac.read`.
- Tenant registry and membership pages require `platform.tenancy.read`.
- Route guards and permission gates are UX controls only; every request is independently protected by API middleware.
- All requests use the shared `@/core/api/client` transport so Sanctum credentials, tenant context, locale and request IDs remain consistent.
- Read-only pages must not offer edit/create/delete actions until the API exposes separately gated, audited mutation endpoints.

The initial Admin feature surfaces are identity directory, role catalogue, permission catalogue and tenant registry. No fabricated dashboard metrics are introduced.
