# Frontend Architecture and Integration Guide

**Status:** Repository documentation derived from the current `main` source tree. This guide describes the frontend architecture; it is not a certification of API or production behavior.

## System boundary

ARNA App is a browser-side Vue application repository. The backend is maintained separately in [akefadaka-git/arna-api](https://github.com/akefadaka-git/arna-api). The frontend owns presentation, client navigation, local interaction state, API request composition, and user-facing feedback. The API owns identity validation, tenant isolation, authorization, domain rules, persistence, and authoritative workflow transitions.

A client-side route guard, hidden control, or permission-aware component is a usability feature—not a security boundary. The API must independently authorize every protected operation.

## Four application builds

Vite selects one application entry point per build mode:

| Mode | HTML entry | Vite output | Intended hostname |
|---|---|---|---|
| `workspace` | `workspace-entry/index.html` | `dist/` | `app.maalearna.com.et` |
| `portal` | `portal-entry/index.html` | `dist-portal/` | `portal.maalearna.com.et` |
| `admin` | `admin-entry/index.html` | `dist-admin/` | `admin.maalearna.com.et` |
| `public` | `public-entry/index.html` | `dist-public/` | `www.maalearna.com.et` |

The four builds share the package manifest, lockfile, dependency installation, Vue plugin, TypeScript project, `@/` alias, asset pipeline, and production target. They are separate static outputs, not four Node.js servers. The public site has its own entry and does not boot the authenticated application shell/router.

The build-preparation script copies each selected entry HTML to the output root as `index.html`. The output verifier checks the four root entry points, generated JavaScript and CSS references, local referenced assets, deployed `.htaccess`, the API-origin Content Security Policy allow-list, and the SPA fallback.

## Source organization

| Area | Responsibility |
|---|---|
| `src/core/` | Cross-domain foundations, including the shared API client and bootstrap |
| `src/features/<domain>/` | Domain-oriented UI, API adapters, services, and labels |
| `src/components/primitives/` | Basic reusable controls |
| `src/components/composites/` | Composed interaction components |
| `src/components/patterns/` | Reusable page and workflow patterns |
| `src/layouts/` | Application shells and layouts |
| `src/router/` | Route composition, route labels, and guards |
| `src/stores/` | Client-side authentication, tenant, locale, launcher, and notification state |
| `src/styles/` | Reset, base styles, and shared design tokens |
| `workspace-entry/`, `portal-entry/`, `admin-entry/`, `public-entry/` | Independent Vite HTML/TypeScript entry points |

Feature folders visible on the current source tree include authentication, dashboard, files, governance, loans, people, portal, public content, shareholders, and wallet. This inventory is structural only; it does not imply every workflow is complete or released.

## API integration contract

The shared Axios client in `src/core/api/client.ts` reads its required base URL from `VITE_API_BASE_URL`. Requests use the configured API base URL and the following client behavior:

- `Accept: application/json` is the default response preference.
- An installed authentication provider supplies a bearer token through the `Authorization` header when one is available.
- An installed tenant provider supplies `X-Tenant-ID` when a tenant is resolved. The API remains responsible for validating tenant membership and isolation.
- The active document language is forwarded through `Accept-Language` when available.
- Credentialed requests are enabled for the configured Sanctum/cookie integration.
- The client includes a CSRF-cookie handshake method for flows that require it. Authentication service sequencing must be preserved; do not call state-changing cookie-authenticated operations before the handshake has completed.
- Request correlation and normalized error handling are implemented in the shared client; use those existing contracts rather than adding a second Axios instance for a domain.

The precise API routes, permissions, payload schemas, and response shapes are owned by the API repository and its approved contracts. When changing a frontend adapter, record the API repository commit or contract version against which it was checked. Do not infer an endpoint from a UI screen or a mock response.

## Cross-origin and browser security

The deployed frontend and API use separate origins. The API must explicitly permit the required frontend origins and credential behavior. Cookie attributes, CSRF validation, HTTPS, and CORS must agree across environments. A frontend build cannot repair an API-side CORS, session, tenant, or authorization defect.

The shipped Apache configuration contains a restrictive Content Security Policy whose `connect-src` allow-list includes the approved API origin. If the API origin changes, review and update the Vite environment configuration, API CORS configuration, and deployed CSP together. The static build verifier expects the current approved origin and intentionally fails on a mismatch.

Never put passwords, private keys, bearer tokens, database credentials, signing keys, or other secrets in browser environment variables. Any `VITE_*` value is compiled into client assets and is observable by visitors.

## Architecture change rules

1. Preserve the four entry points and output-directory contract unless a separately reviewed architecture change authorizes a change.
2. Keep domain UI and API adapters in their owning feature folders; keep shared shell and router changes narrow.
3. Do not move backend business rules or authorization into the frontend.
4. Reuse the shared API client, stores, components, and semantic tokens where their contracts apply.
5. Keep Amharic-first and English support, responsive behavior, keyboard accessibility, and clear loading/empty/error/denied states in acceptance criteria.
6. Record cross-repository dependencies and exact API/frontend SHAs in pull requests.
7. Treat application completeness, API compatibility, accessibility, production deployment, and runtime health as separately evidenced claims.

## Related references

- [Environment and configuration](ENVIRONMENT_CONFIGURATION.md)
- [Static deployment and rollback](STATIC_DEPLOYMENT_AND_ROLLBACK.md)
- [UI/UX Enhancement Master Strategy v1.2](ARNA_UI_UX_Enhancement_Master_Strategy_v1.2.md)
- [Brand Identity Master Specification v1.0](BRAND_IDENTITY_MASTER_SPEC_V1.0.md)
- [API repository](https://github.com/akefadaka-git/arna-api)
