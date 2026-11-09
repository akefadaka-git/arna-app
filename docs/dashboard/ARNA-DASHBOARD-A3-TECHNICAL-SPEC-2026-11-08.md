# ARNA Executive Overview — A3 Technical Specification

**Document status:** Owner-approved governing A3 technical specification; A3 implementation separately authorized  
**Prepared:** 2026-11-08  
**A1/A2 baseline:** App `76fb67a421b1a54e0529a3479e551a1d1e0c0d0f`; API `ff290b353f1290cc91534fd4d694544e83c58d82`  
**Scope:** Governing A3 design and implementation contract. A3 source implementation is authorized on isolated feature branches. This document does not authorize merge, deployment, production role-grant changes, or production data access.

## 1. Purpose and decision summary

Deliver a tenant-aware Executive Overview for authorized management users while preserving the existing Workspace `/dashboard` feature launcher. The overview is a read-only presentation/aggregation surface. Domain systems remain authoritative for accounting, shareholder, governance, people, documents, calendar, task and notification facts.

**Approved architecture decision:** add a separate child route under the existing authenticated workspace layout:

- UI path: `/executive-overview`
- Vue route name: `executive-overview`
- Component boundary: `src/features/executive-overview/ExecutiveOverviewView.vue`
- API namespace: `/api/dashboard/v1`
- No replacement or semantic change to existing `/dashboard`.
- No client-side calculation of authoritative business metrics.
- API aggregation is read-only and delegates to domain-owned query/report services.

The current App router mounts workspace routes beneath `AuthenticatedLayout`; `dashboard` is already a sibling workspace child. The new route should follow that pattern. Its exact parent navigation placement and audience permission are approval items, not assumed facts.

## 2. Baseline facts and constraints

1. Existing `src/features/dashboard/DashboardView.vue` is a permission-filtered tile launcher. It is not an executive metrics view.
2. API Finance exposes tenant/entity-scoped trial-balance reporting protected by `finance.report.view`; `TrialBalanceService::forEntity(tenantId, legalEntityId, asOf)` scopes ledger data by tenant and entity.
3. Finance route definitions include entity, account, period, journal and trial-balance routes. Existing financial report semantics must be reused; do not recalculate ledger totals in the App.
4. Shareholder routes are loaded under authenticated tenant-membership middleware and use a mixture of route permissions and object-level policies. The `/api/shareholders/me` endpoint is self-service identity, not permission to enumerate the shareholder register.
5. Governance routes include bodies, positions, terms, appointments, memberships and related attendance capabilities. The inspected route file uses `governance.body.view` and `governance.body.manage` for relevant collections. These do not prove that a complete meeting/decision lifecycle exists.
6. Notifications and enterprise search have a proposed App Shell integration contract; final notification permission slugs and activation gates still require API catalogue reconciliation.
7. Calendar workspace/domain work is not established as available on the assessed main baseline.
8. Loan product authorization is canonicalized by the API `LoanProductPolicy` to `loan.view`; `loan.view_own` does not grant product catalogue access. The App dashboard tile still uses `loan_product.view` at the assessed baseline. This is a separate A2 remediation and must not be silently hidden by this dashboard project.
9. A1 identified an authorization discrepancy between the UI/UX strategy's Phase 1 statement and later design-system implementation artefacts. The Owner must reconcile that authority before UI implementation.

## 3. Scope and non-goals

### In scope

- Separate Executive Overview route and responsive page shell.
- Read-only, tenant-scoped aggregation API contract.
- Metric definitions, source lineage, permission policy and freshness semantics.
- Role-aware widget visibility and safe drill-down.
- Empty, partial, stale, unavailable, loading and error states.
- Amharic-first/English-compatible labels, E.C. default display and explicit user calendar preference.
- Accessible cards, tables and chart primitives.
- Exact-head verification and security test plan.

### Out of scope for this A3 specification

- Changing accounting calculations, posting/reversal workflows, opening balances, chart of accounts or Finance policy.
- Creating duplicate shareholder, people, governance, document, calendar or task records/services.
- Introducing a new global tenant selector or bypassing existing tenant middleware.
- Treating pending, draft, forecast or unverified payment data as actuals.
- AI-generated decisions, autonomous actions, write operations from dashboard widgets.
- Admin-wide or public/shareholder portal dashboard reuse.
- Merge, deployment, production configuration or production data inspection.

## 4. Route design

### 4.1 Frontend route

Proposed child of the existing authenticated workspace layout:

| Property | Proposed value |
|---|---|
| Path | `executive-overview` |
| Name | `executive-overview` |
| Component | `@/features/executive-overview/ExecutiveOverviewView.vue` |
| Auth | Existing `requiresAuth: true` parent |
| Tenant | Existing authenticated tenant context; never query/body-selected |
| Permission | Owner-approved tenant-scoped `dashboard.executive.view`; role-fenced to the frozen three-role audience |
| Navigation | New Executive Overview leaf, only shown to users with approved permission |
| Existing dashboard | Keep `dashboard` route and launcher unchanged |

Do not create a parallel authentication guard. The route meta permission is a UX gate; API authorization remains decisive.

### 4.2 Backend route contract (A3 implementation boundary)

Base prefix: `/api/dashboard/v1`. The implemented overview route is inside the established `auth:sanctum` and `tenant.membership` group, requires `auth.permission:dashboard.executive.view`, and applies `throttle:60,1`.

| Method and path | A3 status | Authorization |
|---|---|---|
| GET `/overview` | IMPLEMENTED | Entry permission plus the runtime approved-role fence and per-widget/domain authorization |
| GET `/metrics/{metricKey}` | NOT IMPLEMENTED; future detail endpoint | Must require Executive view plus metric-specific domain permission |
| GET `/metadata` | NOT IMPLEMENTED; no metadata endpoint is exposed in A3 | If added, metadata must not disclose inaccessible domains or widget descriptors |

The API must not return a widget merely because the caller can access the overview route. Each metric provider independently authorizes access and scopes its query. The Owner-approved generic entry permission is `dashboard.executive.view`; it is not a domain-data grant.

### 4.3 Query parameters

The A3 implementation currently accepts only:

- `as_of`: optional `YYYY-MM-DD` date, validated server-side and passed to the Finance report service.

The following are not accepted or implemented in this A3 slice: `period`, `entity_ref`, `calendar`, and `include`. They remain future contract decisions. The API does not accept `tenant_id`, `user_id`, raw permission lists, arbitrary SQL filters or unbounded date ranges. Tenant and entity scope are resolved and authorized server-side.

### 4.4 Response contract

The implemented A3 `GET /overview` response is deliberately smaller than the future full dashboard contract. It contains only the following fields:

```json
{
  "success": true,
  "data": {
    "contract_version": "1.0",
    "generated_at": "2026-11-09T05:00:00Z",
    "widgets": [
      {
        "key": "finance.trial_balance",
        "status": "available",
        "source": {
          "domain": "finance",
          "report_key": "trial_balance",
          "calculation_version": "1"
        },
        "entity": {
          "code": "ENTITY-CODE",
          "name_am": "የሕጋዊ አካል ስም",
          "name_en": "Legal entity name"
        },
        "as_of": "2026-11-09",
        "currency": "ETB",
        "value": {
          "total_debits": "125000.0000",
          "total_credits": "125000.0000",
          "difference": "0.0000",
          "is_balanced": true
        }
      }
    ]
  }
}
```

Rules:
- Monetary values are decimal strings; never IEEE-754 floating point.
- The current A3 slice emits only `available` widgets. Future `partial`, `stale`, or `unavailable` states require their own verified source/freshness semantics.
- Unauthorized widgets MUST be absent. The API MUST NOT return hidden widget keys, inaccessible domains, denial reasons, permission slugs, counts, or other metadata that reveals restricted data. Authorization denials belong only in protected server-side security/audit records.
- An empty widget list means no currently authorized and implemented widgets are available. It is not a synthetic zero.
- Every Finance widget states currency, authorized legal-entity identity and as-of date.
- Every metric carries source domain, report key, calculation/adapter version and as-of date.
- A3 does not return drill-down links. Any future drill-down route must reauthorize at its destination.
- API errors use the existing standardized error envelope; do not introduce a second error convention.
- Do not expose internal database IDs, sensitive shareholder/person fields or raw exception details.

### 4.5 Metric detail response

Not implemented in A3. Any future `GET /metrics/{metricKey}` must follow this contract:

```json
{
  "success": true,
  "data": {
    "key": "finance.trial_balance",
    "definition_version": "1",
    "unit": "currency",
    "currency": "ETB",
    "period": { "start": "2026-11-01", "end": "2026-11-08", "basis": "EC_financial_period" },
    "points": [],
    "source": { "domain": "finance", "report_key": "trial_balance" },
    "as_of": "2026-11-08T09:55:00Z",
    "freshness": "current"
  }
}
```

Only bounded, pre-approved time windows are permitted. The endpoint is optional for initial MVP; do not build it if the overview response is sufficient.

## 5. Metric dictionary

The dictionary defines business meaning, not permission to expose the metric. All definitions require domain-owner confirmation before coding. The first delivery should only expose metrics whose source, permission and calculation have been verified.

| ID / key | Definition and calculation rule | Source of truth | Unit / grain | Status and caveat |
|---|---|---|---|---|
| M01 `finance.trial_balance` | Debit and credit totals for selected entity and as-of date; preserve ledger account classification and posted/reversal semantics | Finance TrialBalanceService and ledger | Currency; entity/as-of | Foundation exists; do not call this cash, net assets or profit |
| M02 `finance.cash_position` | Sum of balances of approved cash/bank accounts at as-of date | Finance account classification + ledger report | Currency; entity/as-of | BLOCKED until cash-account classification and reconciliation status are verified |
| M03 `finance.assets_total` | Sum of approved asset-class account balances using sign convention defined by Finance | Finance chart of accounts and approved balance-sheet report | Currency; entity/as-of | BLOCKED pending balance-sheet classification/report contract |
| M04 `finance.liabilities_total` | Sum of approved liability-class account balances | Finance approved balance-sheet report | Currency; entity/as-of | BLOCKED pending classification/report contract |
| M05 `finance.equity_total` | Sum of approved equity-class account balances | Finance approved balance-sheet report | Currency; entity/as-of | BLOCKED pending classification/report contract |
| M06 `finance.income` | Net income account activity for selected period, using approved account mapping and reversal treatment | Finance income-statement report | Currency; entity/period | API PR work is not equivalent to merged/main availability |
| M07 `finance.expense` | Net expense account activity for selected period, using approved mapping and reversal treatment | Finance income-statement report | Currency; entity/period | Same constraint as M06 |
| M08 `finance.net_result` | Income less expense under approved sign and close-period policy | Finance income-statement report | Currency; entity/period | Do not infer from trial balance totals |
| M09 `finance.budget_variance` | Approved budget less actuals; commitments shown separately and never double-counted | Finance budget and ledger domains | Currency and percent; entity/period | BLOCKED until budget baseline/version and commitments semantics are approved |
| M10 `finance.entity_comparison` | Same approved metric across authorized legal entities; consolidated view only with elimination/FX policy | Finance entity mapping and reporting | Currency; entity/period | No cross-entity sum without consolidation rules |
| M11 `shareholder.active_count` | Count of shareholder records meeting approved active-status definition as of date | Shareholder register | Count; tenant/entity | Requires approved status semantics and aggregate access policy |
| M12 `shareholder.share_capital` | Total issued share units × approved nominal value, with share-class and currency treatment | Shareholding ledger and share-class domain | Shares/currency; tenant/entity | Do not infer from shareholder count |
| M13 `shareholder.dividend_position` | Declared, payable, paid, withheld and outstanding amounts, each separately reconciled | Dividend engine + Finance payable/payment ledger | Currency; declaration/entity | BLOCKED until dividend/payment lifecycle evidence and reconciliations pass |
| M14 `governance.meeting_status` | Scheduled meetings and verified meeting lifecycle status | Governance meeting domain when available | Count/status; body/period | Current body/appointment foundations do not prove full meeting lifecycle |
| M15 `governance.quorum_status` | Quorum met only when meeting-specific rule, eligible electorate, attendance/proxy and quorum calculation are verified | Governance policy + meeting/attendance records | Boolean/status; meeting | Never infer quorum from raw attendance count alone |
| M16 `people.active_headcount` | Distinct active people/employees under approved employment/engagement definition | People domain | Count; tenant/org/as-of | Requires People owner to approve inclusion/exclusion and privacy thresholds |
| M17 `organization.unit_distribution` | Authorized count by organization unit; suppress small groups where privacy requires | Organization assignments | Count; unit/as-of | Do not calculate from a paginated UI directory |
| M18 `workflow.my_pending` | Current principal's pending approvals/tasks grouped by type and aging band | Owning workflow/task domains | Count; user/tenant | BLOCKED until authoritative workflow APIs are inventoried |
| M19 `documents.pending_actions` | Documents awaiting review/signature/issuance grouped by authorized status | Documents + File Management | Count; tenant/user | File existence is not proof of issuance or approval |
| M20 `notifications.unread_count` | Authoritative unread notification count for current principal and tenant | Notifications domain | Count; user/tenant | Existing integration contract; final permission slug requires reconciliation |
| M21 `calendar.upcoming` | Authorized upcoming events/deadlines within bounded horizon | Calendar domain | Count/list; tenant/user | BLOCKED until Calendar API and recurrence/timezone contract are verified |
| M22 `operations.exceptions` | Domain-owned actionable exceptions with severity and source timestamp | Each owning domain/observability feed | Count/list; tenant | No generic database scanning; only registered exception providers |
| M23 `analytics.trend` | Historical series of an already approved metric definition | Authoritative metric provider | Metric-specific; bounded period | No separate calculation or client-derived series |
| M24 `forecast.scenario` | Forecast with model version, assumptions, horizon and confidence metadata | Approved forecasting service | Metric-specific | Later phase; never mixed with actuals |
| M25 `ai.management_brief` | Source-linked summary of authorized metrics and exceptions, human-reviewed | Governed AI service + source references | Text + evidence refs | Later phase; must not create or execute actions |

### 5.1 Financial state semantics

- Actual financial figures include only entries recognized by the Finance reporting service as posted and effective for the requested period.
- Reversals follow the Finance service's documented accounting treatment; do not drop reversal entries or count both original and reversal as unreversed value.
- Draft, submitted, pending approval, canceled and unposted entries are not actuals.
- Payments are not "paid" until the authoritative payment/settlement record and Finance reconciliation state support that label.
- Forecast and scenario values are visually and semantically separate from actuals.
- Opening balances are not to be invented or backfilled by the dashboard.

### 5.2 Freshness classes

Initial proposed labels:
- `current`: provider updated within the domain-approved freshness target.
- `delayed`: data is older than target but still within the provider's maximum stale window.
- `stale`: provider exceeded maximum stale window.
- `unknown`: source does not publish a reliable update timestamp.

The API must return actual `as_of`; frontend must not calculate freshness from browser clock alone. Domain owners must set targets per metric; do not assume one global SLA.

## 6. Widget-to-permission matrix

Permission names marked **candidate** are proposals, not verified catalogue entries. Existing permission slugs are stated only where A2 source inspection confirmed them. API policies remain authoritative; route metadata is presentation-level.

| Widget | Existing source permission/evidence | Proposed additional gate | Visibility rule |
|---|---|---|---|
| Executive route | `dashboard.executive.view` (tenant-scoped; canonical catalogue addition in A3) | Role-fenced to `ceo`, `president`, `finance_manager`; wildcard inheritance explicitly excluded | Entry only; does not grant domain data |
| M01 trial balance | `finance.report.view` | None if domain policy is sufficient | Hide unless finance report access for selected entity |
| M02–M08 financial metrics | `finance.report.view` plus relevant entity scope | Metric-specific only if domain owner defines | Hide metric if source permission absent |
| M09 budget variance | Budget read permission not verified | Must be selected from canonical Finance RBAC catalogue | Hide until permission and budget API verified |
| M10 entity comparison | `finance.entity.view` and `finance.report.view` | Optional consolidation permission only if policy requires | Each entity independently authorized |
| M11–M12 shareholder aggregate | Shareholder route/policy controls exist; exact aggregate read permission must be verified | No invented slug | Aggregate endpoint must explicitly authorize aggregate view; `/me` is not register access |
| M13 dividend position | Finance payable routes use Finance entity/report permissions; dividend domain policy remains under A4 evidence | Reconcile exact canonical dividend read permission | Hide until lifecycle, reconciliation and permissions pass |
| M14–M15 governance | `governance.body.view` verified for relevant body collections | Meeting/decision permissions only if present in canonical catalogue | Quorum/decision indicators require specific source authority |
| M16 People metrics | People read permission not independently confirmed in this pass | Resolve canonical People permission | Hide until role and privacy policy verified |
| M17 Organization metrics | Organization read permission not independently confirmed in this pass | Resolve canonical Organization permission | Hide until entity/unit policy verified |
| M18 tasks/approvals | No unified task permission/API verified | Use owning domain permissions | Per-user, assigned/authorized records only |
| M19 documents | `file.view` is used by App Files routes | Documents issuance/review permissions must be reconciled | File view does not imply document approval authority |
| M20 notifications | Proposed `notifications.view` in App Shell contract; final API catalogue not reconciled | Canonical notification read permission | Current user + active tenant only |
| M21 calendar | Calendar permissions not verified on assessed main | Resolve canonical Calendar read permission | Hide until API, recurrence and timezone controls pass |
| M22 exceptions | No generic exception permission/API verified | Per-domain exception permissions | Only explicitly registered provider data |
| M23 analytics | Inherit every source metric permission | No blanket bypass | Every series reauthorizes source metric |
| M24 forecasts | Not established | Dedicated forecast permission and model policy | Later phase only |
| M25 AI brief | Not established | Dedicated AI brief permission plus source permissions | Only summarize facts caller can already access |

**Required RBAC reconciliation:** enumerate actual API permission catalogue, policies, seeded role grants and frontend route/tile slugs at exact target SHAs. Resolve the known loan product mismatch separately: API `LoanProductPolicy` uses `loan.view`; App tile currently uses `loan_product.view`. The new Executive Overview must not add a duplicate loan permission family.

## 7. Data lineage and ownership

| Data element | Authoritative owner | Read path proposed | Transformation allowed in dashboard layer | Forbidden behavior |
|---|---|---|---|---|
| Ledger totals | Finance | Finance report service / trial balance | Response composition and display formatting only | Recompute ledger in App or dashboard controller |
| Balance sheet/income statement | Finance | Approved financial statement service | None beyond presentation | Infer from trial balance without approved mapping |
| Budget/commitments | Finance | Approved budget/report service | Display approved variance | Derive budget from actuals |
| Legal entity/consolidation | Finance/Organization as contract dictates | Finance entity mapping and consolidation service | Group authorized entity results | Cross-entity aggregation without eliminations/FX |
| Shareholder count/capital | Shareholder | Shareholder aggregate query/service | Display authorized aggregates | Duplicate register or bypass policies |
| Dividends | Dividend domain + Finance | Declaration, payable and settlement services | Reconcile status labels from authoritative state | Treat declared as paid |
| Governance status | Governance | Meeting/attendance/decision services | Aggregate verified statuses | Infer quorum/decision from attendance alone |
| People and units | People + Organization | Domain query services | Privacy-safe aggregation | Count paginated frontend records |
| Tasks/approvals | Owning workflow domains | Domain task/approval read APIs | Group by state/age | Create shadow task database |
| Documents | Documents + File Management | Issuance state plus file metadata APIs | Count approved lifecycle states | Treat file upload as issued/approved document |
| Notifications | Notifications | Current user's notification API | Display unread count/list | Cross-user or cross-tenant count |
| Calendar | Calendar | Calendar event query API | Display date/time in user preference | Store dates as browser-local fake events |
| Exceptions | Owning domains | Registered exception providers | Normalize severity labels | Generic table scans or data exfiltration |
| Forecast | Approved analytics/Finance model | Versioned forecast service | Display assumptions/confidence | Mix forecast with actuals |
| AI brief | Governed AI service | Authorized source references | Summarize with citations | Generate facts without traceable source |

Every provider must emit a source reference, calculation/definition version, as-of timestamp and tenant/entity scope. Source lineage must be retained in logs/audit metadata without leaking private payloads.

## 8. Backend architecture proposal

- Add a Dashboard/ExecutiveOverview application service under an approved API domain boundary. Domain owners must decide whether it belongs to a dedicated Dashboard read-model domain or an application-layer query orchestrator. It must not own source business rules.
- Define a provider registry with explicit providers (Finance, Shareholder, Governance, People, Organization, Documents, Notifications, Calendar, Tasks, Operations).
- Each provider contract: `key()`, `authorize(principal, tenantContext, scope)`, `fetch(scope, period)`, `freshness()`, `lineage()`.
- Provider authorization must use existing AuthorizationService/policies and domain-specific object/entity checks; no permission claims supplied by the browser.
- Resolve tenant from existing `tenant.membership` context; fail closed if absent.
- Use bounded database queries, eager-load only required columns, stable pagination for lists, request-level timeouts and partial failure isolation.
- Do not make cross-domain synchronous fan-out unbounded. Initial MVP may return a widget as unavailable when its provider times out; do not return fabricated zero.
- Cache only safe aggregate payloads. Cache key must include tenant, authorized entity scope, principal/permission context, metric key, period and contract version. Invalidate on tenant/role changes and source events; sensitive per-user data should be uncached unless reviewed.
- Log correlation ID, provider key, duration, result state and source version. Do not log personal/financial payloads.
- Add feature flag only after governance approval; default disabled until A4 acceptance.

## 9. Frontend architecture proposal

Suggested domain-oriented feature layout (subject to App architecture conventions):
- `src/features/executive-overview/ExecutiveOverviewView.vue`
- `src/features/executive-overview/api/`
- `src/features/executive-overview/components/`
- `src/features/executive-overview/metrics/`
- `src/features/executive-overview/labels.ts`
- `src/features/executive-overview/types.ts`

The App owns rendering, localization, user filters and interaction. It does not own metric calculations or permission truth. Use the canonical API client, cancel stale requests on route/tenant changes, and clear sensitive in-memory data on logout, tenant switch or authorization failure.

Required UI states per widget: loading, available, partial, stale, unavailable, empty, forbidden/omitted, and retryable error. The whole page must remain useful if one domain provider is unavailable.

## 10. Acceptance criteria

### Product and routing
- [ ] Existing `/dashboard` feature launcher remains functionally unchanged.
- [ ] New route is only accessible to authenticated, authorized users.
- [ ] Unauthorized users do not receive metric values in API payloads, not merely hidden UI cards.
- [ ] Route and navigation labels are translated in Amharic and English.
- [ ] E.C. is default date display; user preference can select G.C.; stored timestamps remain timezone-aware instants.
- [ ] Admin, shareholder portal and public website do not inherit Workspace executive metrics accidentally.

### Metric correctness
- [ ] Every displayed metric has an approved definition, owner, unit, grain, period, source and calculation version.
- [ ] Financial actuals come from Finance report services; drafts/pending/forecasts remain distinct.
- [ ] Monetary values use decimal-safe serialization and explicit currency.
- [ ] Entity comparison uses only authorized entities and approved consolidation/FX rules.
- [ ] Shareholder and people aggregates follow privacy and object-level access rules.
- [ ] Governance quorum/decision labels are backed by authoritative meeting policy and lifecycle records.
- [ ] Missing or delayed source data is visibly partial/stale/unavailable, never zero-filled.

### Security and tenancy
- [ ] Tenant is resolved server-side; client-supplied tenant/user IDs cannot widen access.
- [ ] Every provider enforces domain permission and entity/object scope before querying or projecting data.
- [ ] Cross-tenant negative tests prove no leakage through values, counts, errors, cache or drill-down.
- [ ] Cache isolation tests cover tenant switch, role change, logout and concurrent sessions.
- [ ] Drill-down destination reauthorizes access and uses allow-listed route names/opaque references.
- [ ] Rate limits, bounded query windows and safe error envelopes are verified.

### UX, accessibility and performance
- [ ] Responsive at mobile, tablet, desktop and wide breakpoints.
- [ ] Keyboard-only operation, visible focus, semantic headings/landmarks and screen-reader labels.
- [ ] WCAG 2.2 AA contrast: text 4.5:1 normal, 3:1 large; essential non-text 3:1.
- [ ] Light/dark themes, forced-colors, Amharic and English typography verified.
- [ ] Charts have accessible tabular/text alternatives and do not encode status by color alone.
- [ ] Page and widget loading/error behavior remains stable under slow/failed providers.
- [ ] Performance budgets and freshness targets are set by product/domain owners and measured; no unsupported numeric SLA is assumed.

## 11. Exact verification plan (A4)

Verification must be run against one frozen App SHA and one frozen API SHA, recorded at start and end. Any source change invalidates affected results and requires rerun against the new exact SHA.

### Gate V0 — baseline and scope
1. Record `git rev-parse HEAD` for both repositories.
2. Record branch, dirty/untracked status and preserve unrelated changes.
3. Confirm route and endpoint diff is limited to approved scope.
4. Confirm no migration, write endpoint, permission seeder change or production configuration change is included unless separately approved.

**Pass:** exact SHAs and diff scope recorded; no unrelated changes overwritten.

### Gate V1 — static and contract validation
- Validate route names, endpoint schema, DTO types and response envelope.
- Validate metric dictionary keys and schema compatibility.
- Validate all permission strings against canonical API catalogue and App route guard.
- Validate route allow-list and translation key completeness.
- Validate no mock/fallback metric values are shipped.

**Pass:** no unknown permission slug, unresolved route name or schema mismatch.

### Gate V2 — API functional and accounting correctness
- Unit-test each provider calculation against domain service fixtures.
- Test posted, reversed, draft, pending, canceled and unposted entries.
- Test date boundaries, EC/GC display conversion, entity scope and decimal precision.
- Test missing source, stale source, provider timeout and partial aggregation.
- Test budget commitments and consolidation only after domain-approved semantics exist.

**Pass:** outputs match authoritative domain reports for the same tenant/entity/period and documented accounting state.

### Gate V3 — authorization and tenant isolation
- Unauthenticated request returns existing 401 behavior.
- Authenticated non-member / missing tenant context fails closed.
- Tenant A cannot retrieve Tenant B metrics, counts, metadata or cached responses.
- User without Finance report permission cannot retrieve Finance metrics.
- User with shareholder self-service only cannot retrieve the full register aggregate.
- User without governance body permission cannot retrieve governance metrics.
- Per-entity authorization blocks unauthorized entity references.
- Forged opaque refs and drill-down routes are denied by destination API.
- Cache tests cover user A → logout → user B and tenant A → tenant B switches.

**Pass:** all negative tests deny access without leaking sensitive existence/count information.

### Gate V4 — frontend functional, accessibility and responsive
- Verify authorized/unauthorized route behavior and tile/route permission consistency.
- Verify all widget states: loading, available, empty, partial, stale, unavailable and retry.
- Verify tenant/role changes clear stale values and cancel prior requests.
- Verify Amharic/English labels, E.C. default and explicit G.C. preference.
- Run keyboard, screen-reader semantic, contrast and forced-colors checks.
- Capture screenshots at approved mobile/tablet/desktop/wide viewport sizes.

**Pass:** no critical accessibility defect; all visual states and route transitions verified.

### Gate V5 — performance and resilience
- Measure API p50/p95 latency and database query count with a representative non-production dataset.
- Confirm bounded provider concurrency, query windows and pagination.
- Simulate one provider timeout and one provider 5xx; other authorized widgets remain usable and failed widgets show correct state.
- Verify cache key isolation and invalidation.
- Confirm page avoids repeated polling or unbounded fan-out.

**Pass:** domain owners approve measured targets and no tenant isolation/performance regression is observed.

### Gate V6 — exact-head CI and closure
- Run App and API test suites plus relevant focused suites on the exact frozen SHAs.
- Capture workflow URLs, job conclusions, artifacts, test counts and failures.
- Re-run after any fix; final report must reference one exact final SHA per repository.
- Record PASS / VERIFIED-CLOSED / PARTIAL / MISSING / UNRESOLVED / UNKNOWN / NOT RUN.
- A4 closure requires all P1 acceptance items and security gates to pass; unimplemented P2/P3/P4 items remain explicitly out of scope.

**No claim of passing is valid without visible run/job evidence.** Production deployment remains a separate A5 approval and operational change window.

## 12. Risk register and mitigations

| Risk | Severity | Mitigation / release condition |
|---|---|---|
| Cross-tenant aggregate leakage | Critical | Server-resolved tenant, provider-level authorization, negative tests, cache partitioning |
| Misstated financial actuals | Critical | Reuse Finance reports; explicit posted/reversal semantics; reconcile to source |
| Unauthorized shareholder/people inference | High | Aggregate policy, small-group suppression where needed, object-level checks |
| False governance quorum/decision state | High | Meeting policy and lifecycle evidence required |
| Permission slug drift | High | Canonical RBAC inventory and route/API consistency test |
| Partial provider failure hidden as zero | High | Typed per-widget state and source freshness |
| FX/consolidation error | High | No cross-currency aggregation until policy and rates are approved |
| Duplicate domain logic | High | Provider orchestration only; calculations remain domain-owned |
| Calendar date/time ambiguity | Medium | E.C. display default, timezone-aware instants, user preference |
| AI summary hallucination | High / later phase | Source citations, permission parity, human review; excluded from MVP |

## 13. Owner decisions and approval gates

### Superseding Owner decisions recorded 2026-11-09
- The separate `/executive-overview` route is approved; existing `/dashboard` remains unchanged.
- `dashboard.executive.view` is approved as a tenant-scoped entry permission.
- Initial role audience is exactly `ceo`, `president`, `finance_manager`; no other role is included.
- Finance widgets independently require the existing Finance permissions and entity policy. `finance_manager` currently has `finance.report.view`; `ceo` and `president` do not receive that permission in the canonical grant map.
- The entry permission is explicitly removed from all non-approved role grant results after wildcard resolution, protecting `super_admin`, `platform_admin`, and `tenant_admin` from inherited access.
- The controller additionally checks an approved tenant-bound role, so a direct user permission grant alone cannot bypass the audience boundary.
- Unauthorized widget names and denial metadata are never serialized to clients.
- These decisions supersede conflicting candidate/proposed wording below. The remaining domain-owner decisions continue to govern which future metrics may be added.

### Historical decision checklist (superseded where noted)
1. Approve the separate `/executive-overview` route while retaining `/dashboard`.
2. Confirm initial audience and role grants (recommended: executive/management roles with entity-scoped access).
3. Approve or reject candidate `dashboard.executive.view`; if rejected, specify the domain-permission-only model.
4. Confirm Finance actuals, period, entity comparison, consolidation, FX and currency display semantics.
5. Confirm shareholder aggregate visibility and privacy thresholds.
6. Confirm the exact Governance lifecycle facts eligible for display.
7. Confirm People/Organization aggregate definitions and access rules.
8. Resolve canonical notification permission and loan-product tile mismatch.
9. Reconcile UI/UX Strategy v1.2 and Design System Phase 1 authorization status.
10. Confirm Dashboard aggregation service ownership (dedicated read-model domain vs application-layer orchestrator).

### Separate gates
- **A3 implementation:** explicit Owner approval after this specification and domain contracts are accepted.
- **A4 verification:** explicit authorization for test execution and any remediation scope; report exact SHAs and evidence.
- **PR merge:** separate explicit approval; documentation PR acceptance does not imply code PR approval.
- **A5 production deployment:** separate explicit approval, deployment plan, rollback, backup and operational evidence.
- **Closure:** separate Owner acceptance of evidence and residual risks.

## 14. A3 specification disposition

**Status: OWNER-APPROVED A3 GOVERNING SPECIFICATION — IMPLEMENTATION AUTHORIZED; NOT RELEASE-APPROVED.**

The approved audience/permission policy is implemented on isolated feature branches. Canonical role and permission definitions have been reconciled from source catalogues; production database assignments have not been queried or changed. The response contract excludes unauthorized widget metadata. A4 exact-HEAD testing and independent security review remain required. Merge, production role-grant application, deployment and production data access remain separately gated.


## 15. A3 implementation reconciliation — 2026-11-09

### Canonical RBAC source findings
- The API canonical role catalogue contains ceo, president, and finance_manager.
- ceo and president are tenant-scoped roles. finance_manager is application-scoped to Finance and tenant-bound.
- The canonical Finance grant map gives finance_manager finance.report.view and finance.entity.view. The ceo and president grants include Finance application access only; they do not include finance.report.view or finance.entity.view.
- dashboard.executive.view is a tenant-scoped, non-system permission. It is granted only to the three approved roles.
- The role grant resolver's wildcard results are filtered to remove this permission from every role outside the approved audience. This is required because the existing super_admin wildcard and platform_admin / tenant_admin tenant-scope wildcards would otherwise inherit it.
- Runtime access also requires an approved tenant-bound role. The caller must hold dashboard.executive.view through the approved role's role_has_permissions pivot. A direct user permission assignment cannot substitute for that role grant, and a platform role alone is insufficient.

### Implemented initial data surface
- GET /api/dashboard/v1/overview is inside the existing authenticated tenant-membership route group and requires dashboard.executive.view.
- Finance widgets independently require finance.report.view and pass the existing LegalEntityPolicy (finance.entity.view) before calling FinancialReportService::trialBalance.
- The report is emitted separately per authorized legal entity; no cross-entity or cross-currency aggregation is performed.
- Users without Finance reporting and entity permissions receive an empty widgets array. The response does not disclose omitted widget names, inaccessible domains, permission slugs, or denial reasons.
- Financial responses use Cache-Control: private, no-store.
- The App adds a separately permission-gated /executive-overview route and matching sidebar item. Existing /dashboard remains a separate feature launcher.

### Verification boundary
These findings establish source-catalogue and implementation intent, not the contents of any live production database. The current feature branch has not yet passed exact-HEAD API/App test execution, A4 tenant-isolation/cache tests, independent security review, or production configuration verification.