# ARNA Shareholder App — A2 Integration Inventory

- **Record:** ARNA-SHD-APP-A2-INV-001
- **Assessment date:** 2026-11-27 (EAT)
- **Stage:** A2 — read-only repository reconciliation
- **App repository:** `akefadaka-git/arna-app`
- **App main baseline:** `648815b69b6419554b656ff91bf5b53df211aebb`
- **API repository:** `akefadaka-git/arna-api`
- **API main baseline:** `cd13c555976ed74050920bb69dd5c0d013ec9509`
- **Canonical reconciliation:** [ARNA-SHAREHOLDER-A2-RECON-001](https://github.com/akefadaka-git/arna-api/blob/docs/shareholder-a2-reconciliation-2026-11-27/docs/shareholder/ARNA-SHAREHOLDER-A2-RECONCILIATION-2026-11-27.md)
- **Change boundary:** Documentation only. No frontend code, routes, tests, workflows, main branch, PR merge or deployment was changed.

## 1. App A2 finding

The App main branch has working source foundations for Workspace shareholder administration and Portal self-service. It does not yet provide the complete shareholder relationship experience across Workspace, Portal, Admin Console, notifications, dividends and General Assembly.

This inventory is complementary to the API A2 record. The API is authoritative for shareholder data and authorization; the App must not create independent shareholder, share-balance, certificate, dividend or voting records.

## 2. Workspace route inventory on main

The authenticated Workspace route tree is `src/router/routes-workspace.ts`. It declares five shareholder routes:

| Relative route | Route name | Component | Route permission |
|---|---|---|---|
| `/shareholders` | `shareholders` | `ShareholderListView` | `shareholder.view` |
| `/shareholders/new` | `shareholder-new` | `ShareholderFormRoute.vue` | `shareholder.create` |
| `/shareholders/classes` | `share-classes` | `ShareClassListView` | `share_class.view` |
| `/shareholders/:id` | `shareholder-detail` | `ShareholderDetailRoute.vue` | any of `shareholder.view`, `shareholder.view_own` |
| `/shareholders/:id/edit` | `shareholder-edit` | `ShareholderFormRoute.vue` | `shareholder.update` |

The detail route uses OR semantics (`permissionMode: 'any'`) because the API policy supports administrator, direct-linked own-record and representative paths. The backend remains authoritative; frontend route metadata is only a navigation/UX gate.

### Workspace feature components on main

`src/features/shareholders/` contains:
- `ShareholderListView`
- `ShareholderForm`
- `ShareholderDetailView`
- `ShareClassListView`
- `HoldingEntryForm`
- `CertificateIssueForm`
- `CertificateCancelDialog`
- `api.ts`, `service.ts`, `labels.ts`

These provide list/create/detail/edit, share-class browsing and detail-level holding/certificate operations. No standalone certificate replacement UI or full shareholder transfer workflow was found.

## 3. Portal route inventory on main

The Portal route tree is `src/router/routes-portal.ts`. Shareholder-specific routes are:

| Relative route | Route name | Component | Purpose |
|---|---|---|---|
| `/my/holdings` | `portal-my-holdings` | `MyShareholdingsPage.vue` | Own holdings and history |
| `/my/certificates` | `portal-my-certificates` | `MyCertificatesPage.vue` | Own certificates |

Portal identity is resolved through `useMyShareholder.ts`, which consumes only `GET /api/shareholders/me`. It accepts no client-supplied shareholder ID and distinguishes loading, linked, unlinked and error states. This is the correct self-service identity boundary.

The current Portal route tree also contains home, wallet and loans pages, but those are owned by their respective domains. There is **no shareholder profile route, dividend statement route, GA notice/meeting route, proxy route, voting route, resolution-history route or unified portfolio route on App main**.

The dividend route `/my/dividends` exists in open App PR #33 only; it is not part of this main baseline.

## 4. Admin Console route inventory on main

`src/router/routes-admin.ts` currently contains the authenticated Admin shell, dashboard route and root/launcher redirects. It has no shareholder routes, shareholder registry, certificate administration, import review, portfolio, dividend administration or GA module.

Open App PR #137 builds a broader Admin control plane and depends on API PR #224, but its declared scope is platform administration/domain inventory and does not constitute a delivered shareholder administration module.

**Boundary:** Admin technical privilege must not imply corporate authority to verify the statutory register, approve transfers, issue/cancel certificates, authorize dividends or certify GA resolutions. Any Admin shareholder surfaces must be explicitly read-only or use separately authorized exception workflows with independent corporate approvers.

## 5. Notifications integration

App main contains:
- `src/features/notifications/NotificationsCenter.vue`
- `src/features/notifications/api.ts`
- `src/stores/notifications.ts`
- AppShell notification bell.

The API adapter consumes the generic tenant/user-scoped inbox:
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `POST /api/notifications/{id}/read`
- `POST /api/notifications/read-all`

It supports localized Amharic/English titles and bodies, pagination, unread counts and read state. This proves generic inbox integration only. It does not prove that shareholder registration, certificate, transfer, dividend or GA events create notices, nor that email/SMS delivery and retries are operational.

Open App PR #93 adds notification locale/routing work; it is cross-cutting and does not close the shareholder event-delivery gap.

## 6. API adapter and application integration

The shareholder feature adapter is `src/features/shareholders/api.ts`, with service orchestration in `service.ts`. Portal identity is shared via `useMyShareholder.ts`.

Main route/API pairing found:
- Workspace list/create/detail/update and share classes pair with the current Shareholder API.
- Detail-level holdings/certificates use current Shareholder endpoints.
- Portal own holdings/certificates depend on server-side `/api/shareholders/me` identity resolution.
- No dividend statement API route exists on API main, so the App PR #33 dividend client cannot be considered integrated on current main.
- GA meeting/election workspaces are not on App main; current GA UI work is on PRs #7, #113 and #120 and requires API reconciliation.
- Portal/Workspace Sanctum SSO is represented by open App PR #15 and API PR #65; exact current-main integration must be verified before relying on those PR branches.

## 7. App tests and verification

### Tests on current App main

The inspected test tree contains general shell, route, accessibility, notification-locale, browser, build and component contracts. It contains no dedicated shareholder route/component/API contract test file.

Relevant existing generic tests include:
- `tests/notifications-locale-contract.test.mjs`
- `tests/governance-route-contract.test.mjs`
- `tests/app-shell-responsive-contract.test.mjs`
- generic component/browser/build smoke suites.

Required new shareholder-specific acceptance tests:
- Workspace route inventory, permission mapping and static-before-dynamic route order;
- shareholder list/create/edit/detail loading, empty, validation, authorization and error states;
- share-class and holding-entry flows;
- certificate issue/cancel and later replacement;
- Portal own-identity linked/unlinked/inactive/error behavior;
- cross-account and cross-tenant isolation through API integration tests;
- dividend statement API contract and portal states;
- GA notice/agenda/proxy/attendance/voting/resolution UI contract;
- Admin shareholder route separation and least-privilege gates;
- notification event navigation and localized delivery status;
- all four App builds and browser/accessibility acceptance.

### Current-main verification

App main SHA `648815b69b6419554b656ff91bf5b53df211aebb` has a latest inspected Frontend verification run [#45955185107](https://github.com/akefadaka-git/arna-app/actions/runs/45955185107), which **FAILED** at `Type-check and build all applications`. The available job metadata does not establish the root cause. Diagnose from exact-run logs before attributing it to shareholder code.

## 8. Open App PR reconciliation

| PR | Scope | Disposition |
|---|---|---|
| [#15](https://github.com/akefadaka-git/arna-app/pull/15) | Sanctum session SSO in Workspace/Portal | Open draft; cross-cutting dependency paired with API #65. Reconcile against current main. |
| [#33](https://github.com/akefadaka-git/arna-app/pull/33) | Annual shareholder dividend statement Portal page and `/my/dividends` | Open draft; depends on API #81. PR-only, not on main. |
| [#35](https://github.com/akefadaka-git/arna-app/pull/35) | Dividend Admin and enhanced Portal integration | Stacked on #33; A4 frontend/API/accessibility evidence is explicitly not closed. |
| [#31](https://github.com/akefadaka-git/arna-app/pull/31) | Earlier Board Election frontend contracts | WIP/legacy election lineage; do not merge wholesale. Reconcile the current-main meeting/election candidate and the approved AGE scope. |
| [#68](https://github.com/akefadaka-git/arna-app/pull/68) | AGE election frontend scope alignment | Open election-contract dependency; confirm it is compatible with the selected current-main Governance workspace branch and authenticated eligibility rules. |
| [#7](https://github.com/akefadaka-git/arna-app/pull/7) | Original Governance meetings workspace | Stacked on integration branch; retain as source lineage, not a current-main merge target. |
| [#113](https://github.com/akefadaka-git/arna-app/pull/113) | Governance meeting/election UI current-main reconciliation | Open draft; older candidate. |
| [#120](https://github.com/akefadaka-git/arna-app/pull/120) | Governance meetings/elections current-main workspace | Open draft; newer candidate than #113, but tested against an older App main SHA. Select one, rebase to current main and rerun tests; do not merge both. |
| [#137](https://github.com/akefadaka-git/arna-app/pull/137) | Admin master console frontend | Open draft; paired with API #224. Not yet a shareholder Admin module. |
| [#93](https://github.com/akefadaka-git/arna-app/pull/93) | Notification locale and safe routing | Open draft; generic notification UX, not shareholder event-delivery completion. |

PR branches are not counted as main functionality. Stacked PRs must be integrated in dependency order and verified against exact current-main heads.

## 9. App implementation backlog

| ID | Priority | Work package | Acceptance evidence |
|---|---|---|---|
| APP-SHD-P0-01 | P0 | Restore App main type-check/build | Root cause and exact-head successful four-app build; no shareholder implementation begins on an untrusted baseline. |
| APP-SHD-P0-02 | P0 | Shareholder Workspace route/API contracts | Typed endpoint parity, route permissions, loading/error/empty/validation states, route tests and API integration tests. |
| APP-SHD-P0-03 | P0 | Portal identity and access regression | Linked/unlinked/inactive/error cases; own-record and cross-tenant isolation; SSO pairing with API. |
| APP-SHD-P0-04 | P0 | GA meeting workspace integration | Select/rebase one of #113/#120; integrate with approved API lifecycle and fail-closed legal states; no fake ballot/approval UI. |
| APP-SHD-P1-01 | P1 | Certificate replacement and secure artefact UX | Replacement chain, download/render/verify and accessible error/empty states, after API contract approval. |
| APP-SHD-P1-02 | P1 | Dividend Portal and Admin integration | Reconcile #33 then #35 with API #81/#83; exact-head type/build/API tests, tax statement correctness and no false-paid state. |
| APP-SHD-P1-03 | P1 | Shareholder notifications UX | Event categories, action links, Amharic-first templates, delivery/read/failure states, aligned to backend outbox contract. |
| APP-SHD-P1-04 | P1 | Unified shareholder portfolio | Read-only aggregate from Shareholder, Finance, Wallet, Loan and Governance; source attribution and stale-data states. |
| APP-SHD-P1-05 | P1 | Admin shareholder oversight | Add only after Admin API contracts; read-only default, explicit permissions and independent corporate approval separation. |
| APP-SHD-P2-01 | P2 | Profile/KYC/representative self-service | Evidence-backed document/status UX after approved KYC and statutory-register specification. |
| APP-SHD-P2-02 | P2 | Statements and accessible exports | Register/ownership/dividend/governance statements with audit references, Amharic-first labels and WCAG acceptance. |

## 10. App A2 conclusion

**App source reconciliation is complete for the inspected main snapshot.** Workspace and Portal foundations are present; Admin shareholder integration, dividend, full GA and shareholder-specific notifications/portfolio remain incomplete or PR-only.

Preserve the existing feature folders, route trees, typed adapters and own-identity composable. Do not duplicate API business logic in Vue components. A3 implementation requires explicit Owner acceptance of the canonical API A2 record and a separately approved, dependency-ordered scope. No merge or deployment is authorized by this document.
