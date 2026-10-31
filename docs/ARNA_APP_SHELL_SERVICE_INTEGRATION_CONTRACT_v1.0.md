# ARNA App Shell Service Integration Contract v1.0

Status: PROPOSED — requires backend implementation and domain-owner review before activation.
Scope: authenticated App Shell only. This contract does not authorize changes to existing authentication, tenant resolution, domain policies, or data ownership.

## 1. Security invariants

1. Every request uses the existing Sanctum-authenticated API client and existing tenant-context middleware. The browser must not supply an authoritative tenant ID in query/body parameters.
2. The API resolves the active tenant from the established request context, verifies membership, then applies endpoint- and resource-level permissions. Missing tenant context fails closed; non-members receive the existing denial response.
3. Every search result and notification is filtered server-side by the authenticated principal's effective permissions and tenant scope. Client-side navigation visibility is not authorization.
4. No cross-tenant aggregation, global fallback, unscoped model lookup, or permission inference from UI state is allowed.
5. Tenant switch and logout invalidate in-memory notification/search caches and cancel or disregard stale in-flight responses. Responses from a prior tenant/session must never populate the new context.
6. Do not expose internal IDs or action URLs that let a user bypass domain route policies. Each destination must still enforce its own authorization.

## 2. Notifications API

Base path: `/api/notifications`
Middleware: `auth:sanctum`, `tenant.membership`, plus notification-read permission (proposed slug: `notifications.view`). Mutation routes require `notifications.manage` or an explicit ownership policy. Final permission slugs must be reconciled with the API permission catalogue before implementation.

### GET /api/notifications

Query: `page` (1-based, default 1), `per_page` (default 20, maximum 50), optional `unread_only` boolean.

Success envelope:
```json
{
  "success": true,
  "data": {
    "items": [{
      "id": "opaque-string",
      "title": "Localized or locale-keyed title",
      "body": "Optional body",
      "category": "domain-event",
      "priority": "low|normal|high",
      "is_read": false,
      "created_at": "2026-10-31T10:00:00Z",
      "action": { "route_name": "finance.loans.show", "resource_ref": "opaque-reference" }
    }],
    "pagination": { "page": 1, "per_page": 20, "total": 0 },
    "unread_count": 0
  }
}
```

The API must authorize the referenced resource before emitting an actionable destination. The client must resolve only allow-listed internal route names; arbitrary external URLs and raw redirect targets are forbidden.

### GET /api/notifications/unread-count

Returns `{ "success": true, "data": { "unread_count": 0 } }`. Count is authoritative for the current user and tenant, not derived from the current page.

### POST /api/notifications/{notification}/read

Idempotent. Re-authorizes the notification against the current tenant and recipient/visibility policy. Returns the authoritative unread count.

### POST /api/notifications/read-all

Idempotent and restricted to the current authenticated user's visible notifications in the active tenant. Returns the authoritative unread count.

### Delivery and lifecycle

- Initial list page size 20; maximum 50. No unbounded fetch.
- Client cache is memory-only, keyed by authenticated session + resolved tenant; clear on logout, tenant switch, auth failure, or context mismatch.
- Poll unread count no more frequently than every 60 seconds while the shell is active; pause when document is hidden. No polling on public routes.
- A 401/403/tenant-context failure clears sensitive cached items. A transient 5xx preserves stale data but visibly marks refresh failure.
- The bell remains disabled until the four routes, schema, permission policy, and tenant-isolation tests are deployed and verified.

## 3. Enterprise-wide search API

Route: `GET /api/search`
Middleware: `auth:sanctum`, `tenant.membership`, rate limit, and server-side per-domain permission filtering. Search is tenant-scoped by default; platform-wide results require a separately approved platform permission and must not be inferred from tenant membership.

Query:
- `q`: required UTF-8 query, trimmed, 2–100 characters.
- `types`: optional allow-listed domain types.
- `page`: 1-based; `per_page`: default 10, maximum 25.
- No tenant ID parameter. Tenant comes only from trusted middleware context.

Success envelope:
```json
{
  "success": true,
  "data": {
    "items": [{
      "type": "loan",
      "title": "Loan reference",
      "subtitle": "Permitted contextual summary",
      "route_name": "finance.loans.show",
      "resource_ref": "opaque-reference",
      "matched_fields": ["reference"]
    }],
    "pagination": { "page": 1, "per_page": 10, "total": 0 }
  }
}
```

### Search authorization and data handling

- Search only registered domain providers with an explicit query adapter and permission policy. No generic table scanning or unrestricted model discovery.
- Each provider applies tenant scope in the database query and checks the relevant domain permission before returning a row. Do not fetch broad data and filter only in the browser.
- Result projection is allow-listed per domain; never return private fields, document contents, credentials, or unapproved personal data.
- Search result route names must be allow-listed and re-authorized by the destination route. Resource references must be opaque and non-authoritative.
- Apply request throttling, query normalization, bounded result sizes, safe parameterized queries, and audit logging for denied or suspicious access. Do not log raw sensitive query contents.
- Empty/unsupported type filters return an empty result or validation error; unknown providers are never auto-discovered.
- Search index design and domain adapters are owned by the respective domain teams; the App Shell owns only the command-palette UX and API client.

## 4. Breadcrumb hierarchy

Breadcrumbs are derived from matched route metadata plus the registered navigation tree, not string parsing of URLs. Each route may declare a stable breadcrumb label key and optional parent route name. Parent links are rendered only when the user is authorized to navigate to them. The final crumb is non-link text with `aria-current="page"`. Missing metadata falls back to the nearest authorized navigation ancestor and then the route title; no guessed URL is generated.

## 5. Shell preferences control group

The header control group exposes:
- Locale: existing supported locale catalogue and locale store; do not claim server persistence until a preference endpoint exists.
- Theme: existing design-system theme contract; explicit user override must remain distinct from system preference.
- Accessibility: controls must use existing supported accessibility settings only; no duplicate preference store and no claim of persistence until the owning service exists.

Controls must have visible labels/tooltips, keyboard operation, 44px minimum target, visible focus ring, forced-colors support, and bilingual labels. High-contrast mode must increase semantic text/border/focus contrast without changing brand identity or weakening status distinctions.

## 6. Contrast and visual acceptance

- Normal text: WCAG 2.2 AA contrast ratio at least 4.5:1.
- Large text: at least 3:1.
- Essential non-text controls, focus indicators, and component boundaries: at least 3:1 against adjacent colors.
- Test light and dark themes, brand accents, disabled/error/success/warning states, keyboard focus, forced-colors, and Amharic/English typography.
- Do not assert compliance from token names alone; compute contrast from resolved token pairs and perform rendered visual review at mobile, tablet, desktop, and wide breakpoints.

## 7. Activation gates

1. API schema and permission slugs approved by API/domain owners.
2. Notification persistence/schema, routes, policies, tenant-isolation and authorization tests implemented.
3. Search provider registry, per-domain adapters, permission checks, rate limits, and tenant-isolation tests implemented.
4. App client uses the canonical API client, validates response envelopes, handles stale requests, and clears caches on context change.
5. Exact-head CI and API regression suites pass; then visual and keyboard review.
6. Only after these gates may the notification bell be enabled and the command palette labeled enterprise-wide.

Until these gates are met, the App Shell must retain honest unavailable states rather than mock data or client-only authorization.
