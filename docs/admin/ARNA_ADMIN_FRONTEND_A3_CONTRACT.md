# ARNA Master Admin Frontend — A3 Integration Contract

**Status:** A3 implementation contract / draft  
**Authority:** Owner-authorized A3.1–A3.8  
**Baseline:** `main` at `ffe0495c0eb7c8b5d2013419123aac5b68893d51`  
**Target:** `admin.maalearna.com.et`  
**Deployment:** Not authorized

## 1. Preserve the application architecture

The existing independent static Admin entry point, `admin-entry/`, `AdminLayout`, and `routes-admin.ts` are retained. Do not merge Admin into Workspace or Portal routing. Existing app shell, ARNA brand identity, Amharic-first conventions, WCAG 2.2 AA requirements, and separate static deployment output remain intact.

The current Admin dashboard is explicitly a static landing surface and the sidebar currently contains only that landing route. A3 may replace the static-only limitation with real feature pages, but must not invent metrics or claim data availability before API contracts are verified.

## 2. API contract alignment

The API candidate's canonical namespace is the platform/tenant split:

- `/api/admin/platform/identity/*`
- `/api/admin/platform/rbac/*`
- `/api/admin/platform/tenants/*`
- `/api/admin/tenant/memberships/users/*`
- `/api/admin/tenant/rbac/*`

The older frontend candidate endpoint assumptions (`/api/admin/tenants`, `/api/admin/identity/users`, `/api/admin/authorization/roles`, `/api/admin/authorization/permissions`) are not the integration contract. Do not add compatibility calls to those paths without an explicit backend contract.

Every frontend feature must consume typed service functions through the shared API client. A route permission is only a UX gate; API authorization is authoritative. Do not hardcode a permission slug until it is confirmed by the API permission catalogue.

## 3. Admin information architecture

- Overview
- Platforms & Applications
- Identity & Users
- Organizations & Tenants
- Roles & Permissions
- Domain Management
  - Domain Registry
  - Subdomains
  - DNS Records
  - Nameservers / DNSSEC
  - SSL/TLS Certificates
  - Hosting & Origins
  - Routing & Redirects
  - Verification & Health
  - Domain Audit
- Settings
- Configuration & Feature Flags
- Integrations
- Security & Approvals
- Audit Log
- Operations & Diagnostics

Navigation entries must map to implemented routes and verified permission slugs. No dead links, fake data, decorative controls, or nonfunctional buttons.

## 4. Domain Management UX and safety

The first read-only Admin feature slices are implemented: `/admin` now uses an API-backed overview page; `/admin/platforms` lists the platform application registry; `/admin/domains` lists domain references from application and tenant records. Each route and sidebar item uses its corresponding global permission slug. Domain provider states remain explicitly unverified/unobserved and live mutations are disabled. Contract tests cover route/permission alignment and truthful state presentation.

Domain Management is a first-class feature area. Its first release is a truthful registry and observation surface. Distinguish clearly between:
- configured in ARNA registry;
- verified by domain ownership challenge;
- observed at provider;
- DNS-resolving;
- TLS-valid;
- hosting/origin connected;
- production-ready.

Never infer one state from another. Display provider connection state and last observation timestamp. DNS/TLS/hosting changes must show a reviewed change diff and approval requirement before dispatch. Until provider APIs and credentials are verified, present inventory and connection readiness only; do not simulate successful writes.

## 5. Localization and accessibility

Amharic is the default language. English is supported. Calendar display defaults to Ethiopian Calendar with Gregorian preference. All tables, filters, forms, status labels, error messages, confirmation dialogs, and empty/loading states require Amharic and English coverage. Keyboard operation, visible focus, semantic landmarks, responsive layouts, and contrast remain mandatory.

## 6. Frontend implementation sequence

1. Reconcile current API service and route guard patterns.
2. Implement overview using verified API data only.
3. Implement platform, identity, tenant and RBAC pages against canonical endpoints.
4. Implement Domain Management registry and detail pages; provider mutation UI remains disabled until provider capabilities are independently verified.
5. Implement settings, configuration, integrations, audit, security and operations pages against confirmed contracts.
6. Add route/service/component contract tests and run type-check plus Admin build.

## 7. Verification and release

A4 must verify exact branch HEAD: type-check, Admin build, route/permission contracts, service API paths, Amharic/English label coverage, accessibility and responsive behavior. A5 deployment remains a separate authorization. No deployment behavior, Plesk document root, DNS, TLS or production environment is changed by this branch.
