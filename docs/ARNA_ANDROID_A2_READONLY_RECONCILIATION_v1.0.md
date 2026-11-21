# ARNA Android A2 Read-only Reconciliation

Document: ARNA-ANDROID-A2-001 | Version 1.0 | Assessment date: 9 November 2026
Status: PARTIAL — source reconciliation recorded; technical closure remains open.
Repositories: akefadaka-git/arna-api and akefadaka-git/arna-app.

## 1. Executive result

The canonical API and web repositories contain a substantial Laravel/Sanctum API and Vue/TypeScript web client, but no native Android project in either inspected main tree. Android must reuse the existing API and domain services, not duplicate identity, business rules, tenancy, permissions or persistence.

The API supports bearer-token login and TOTP/recovery-code challenge before token issuance. A material native-mobile gap remains: login creates a generic Sanctum token with wildcard abilities; refresh revokes every personal access token for that user before issuing a new token. No device-session registration, listing or per-device revocation API was identified. This requires an Owner/API security decision before production Android authentication.

Browser SSO is cookie/CSRF based. Native Android must use bearer-token transport, not copy the browser cookie flow.

A2 is PARTIAL / NOT VERIFIED-CLOSED. This is static source and GitHub metadata reconciliation, not runtime integration, database execution, independent security review or Android verification.

## 2. Governance and scope

Owner approval authorized A2 read-only reconciliation. This report is documentation only. No main branch, API source, web source, migration, permission, seeder, production configuration or production data was changed. No Android source, dependencies, repository creation, merge, signing, release or deployment was performed. No existing PR was merged, modified or cherry-picked.

## 3. Exact repository baselines

Live refs checked on 9 November 2026:

| Repository | Default branch | Exact main SHA |
|---|---|---|
| arna-api | main | 0ea16ba583bc95718a1308d0403c58a665d007c7 |
| arna-app | main | 76fb67a421b1a54e0529a3479e551a1d1e0c0d0f |

API main is one documentation-only commit ahead of the earlier baseline ff290b353f1290cc91534fd4d694544e83c58d82. Only docs/progress/daily/2026-11-09.md and docs/progress/latest.md changed. App main is unchanged from the A1 baseline.

Current open PR inventory: 50 API + 26 App = 76. Open PRs are not merged capabilities and their branches may be stale, stacked or divergent. Prior API A2 package PR #97 remains open/draft and pinned to the earlier API SHA; its own status is PARTIAL / NOT VERIFIED-CLOSED. It is historical evidence, not a current exact-SHA closure record.

## 4. Native Android existence

Recursive trees for both main branches were inspected:
- No Android Gradle project, Kotlin source tree, Flutter project or Capacitor/Cordova wrapper was found.
- App has a web manifest and is a multi-build static Vue application; this is not a native Android project.
- No service-worker/Workbox source or offline synchronization implementation was identified.
- No FCM/Firebase device-token registration or device-session API was identified.
- GitHub lookup for akefadaka-git/arna-android returned 404. No repository was created.

Conclusion: native Android development has not started in the canonical main branches.

## 5. Authentication and token contract

The API stack is Laravel 12, PHP ^8.3 and Sanctum ^4. The API uses a success/data and failure/error JSON envelope.

Relevant routes:
- POST /api/login and POST /api/register.
- POST /api/password/email and POST /api/password/reset.
- GET /api/verify-email/{id}/{hash} and POST /api/verify-email/resend.
- POST /api/logout, GET /api/profile and GET /api/user.
- POST /api/token/refresh.
- POST /api/mfa/totp/enroll, /confirm and /disable.
- Authenticated phone verification request/confirm routes.

Login identifiers supported include email, username, phone, tenant-scoped shareholder number, employee number and wallet account number. Domain identifiers require an explicit active tenant and fail closed for ambiguous, inactive, non-member or unlinked results.

For TOTP-enabled users, the first login response contains mfa_required, challenge_token and methods (totp, recovery_code). The client submits the challenge token and code to the login endpoint. AuthenticationService validates the challenge before creating a bearer token. No bearer token is issued in the challenge response.

Token lifecycle findings:
- Login creates a Sanctum token named auth_token with wildcard abilities.
- Sanctum token expiry defaults to 7 days through SANCTUM_TOKEN_EXPIRATION.
- Refresh blacklists/deletes the incoming token, revokes every personal access token for the user, then issues a new generic wildcard token.
- Logout also invokes all-token revocation.
- No device identifier, per-device session list, remote per-device revoke endpoint or dedicated Android token ability contract was identified.

Implications: refreshing on one Android installation can invalidate the user's other token sessions. Android credentials require Android Keystore-backed protection and must be excluded from logs, backups and crash telemetry. A device-scoped token/session policy is an unresolved production prerequisite. This report does not authorize API changes.

## 6. Tenant and authorization contract

RequestTenantResolver resolves X-Tenant-ID first; if absent, it can resolve one valid non-reserved tenant subdomain. TenantContextMiddleware clears stale context before each resolution. TenantMembershipMiddleware runs after authentication and enforces active membership for tenant-scoped routes.

Login accepts tenant_id to select the login target, and AuthenticationService independently validates active tenant and membership. The web client sends X-Tenant-ID for subsequent API requests. Android should use the authenticated account's allowed tenant list and send selected tenant context; the server remains authoritative.

The platform uses canonical permission slugs, role grants, direct user grants, application access and domain policies. Android checks may control presentation only. Server middleware and policies must authorize every read and mutation. Self-service routes sometimes omit route-level permission middleware because the controller resolves the authenticated user's own record and applies resource policy; Android must not substitute caller-supplied IDs.

Security finding: API main CheckPermission currently returns a 403 message containing the required permission slug and uses AUTH_REQUIRED for its unauthenticated branch. API PR #99 proposes generic denial text and permission-grant changes, but it is open/draft and targets a feature branch, not main. The fix is not present in the inspected main baseline. Android must not parse denial message text.

## 7. API-to-Android capability inventory

| Capability | API main evidence | App main evidence | A2 disposition |
|---|---|---|---|
| Authentication/MFA | Sanctum bearer login, TOTP challenge, logout, refresh, profile | Auth service and stores | Reuse API; device session gap remains |
| Tenant | Header/subdomain resolver and membership middleware | Tenant store and API header | Reuse; isolate local cache by tenant |
| Launcher | GET /api/launcher, server filters app access | Launcher service and shell | Suitable initial screen |
| Shareholder | /api/shareholders/me, holdings and certificates with policies | Portal, holdings, certificates, loans, wallet | Core self-service exists; dividend portal PRs open |
| People | /api/people and explicit tenant access | People directory/profile | Core surface exists; API #31 and App #5 enhancements open |
| Organization | Tenant-scoped API routes | UI PR #6, not main | API exists; main App UI not verified |
| Files/Documents | /api/files upload/list/show/download/update/delete/restore/version | Files list/detail/upload | File management exists; numbering/lifecycle API #53 open |
| Finance | Entities, accounts, periods, journals, trial balance, settlements | No dedicated Finance feature module in App main | API exists; dedicated client specification required |
| Wallet | /api/wallets/me, list, statement and permission-gated mutations | Wallet feature and portal | Core surface exists; verify mutation controls |
| Loans | Products, /me, list/detail, repayment, schedule, statement, collateral, lifecycle | Loan workspace and portal | Core surface exists; loan-product permission mismatch remains |
| Governance | Bodies, positions, terms, appointments, memberships, meetings, attendance, proxies, penalties | Governance views | Core domain exists; meetings/elections work open |
| Notifications | Tenant-scoped inbox, unread count, read/read-all | Notification center/API adapter | In-app inbox exists; native push registration not found |
| Communications | Tenant-scoped announcement lifecycle | Announcements and Communication Hub views | Basic announcements exist; API #74/App #26 open |
| Calendar | Ethiopian date/localization utilities; no calendar event route file in API main | Calendar preference/context UI | Event/reminder workflow not verified; API #71/#73/#75 and App #27 open |
| OCR | No merged OCR route/module in main | No merged OCR UI module in main | API #76/App #30 open; exclude from initial release |
| Board election | No merged election workflow verified in API main | App PR #31 open | Exclude until canonical workflow reconciled |

This is a route/tree inventory, not runtime proof for every endpoint.

## 8. Open PR dependencies and confirmed mismatch

Relevant API open PRs: #97 prior A2 package; #96 integration plan; #99/#98 Executive Overview authorization; #85/#84 Admin identity alternatives; #65 browser SSO; #51 Files; #49 Organization; #31 People; #53 document lifecycle; #58 and related Finance stack; #71/#73/#75 Calendar; #52/#77 Governance; #74 Communication Hub; #76 OCR; #81/#83 dividends.

Relevant App open PRs: #46 Android A1; #42 loan permission correction; #6 Organization; #5 People; #33/#35 shareholder dividend portal; #27 Calendar; #26 Communication Hub; #30 OCR; #15 browser SSO; #19/#18 Design System; #45 Executive Overview.

Confirmed mismatch: App main uses loan_product.view in loan-product route metadata while the API's canonical Loan permission is loan.view. App PR #42 changes the metadata to loan.view and reports successful frontend CI, but it remains open/draft. Android must use the canonical API policy/permission and must not copy the stale App slug.

No PR is approved for merge by this report.

## 9. Offline, synchronization and push

No native cache, offline outbox, WorkManager task, device registration or mobile sync contract exists in the inspected main trees. The API has specific loan-repayment idempotency work, but no generalized offline mutation queue contract. The notification inbox exists, but push-token registration/revocation was not identified. Calendar event synchronization is not on API main.

Recommended boundary:
1. Require connectivity for sensitive operations in the first release.
2. Cache only approved low-sensitivity read-only reference content.
3. Do not queue financial, shareholder, governance, identity or administrative mutations without idempotency, conflict, audit, authorization-revalidation and replay-expiry contracts.
4. Clear user/tenant cache on logout, account switch, token revocation or tenant switch.
5. Treat push and background sync as later capabilities pending API contracts.

## 10. A2 risk register

| ID | Severity | Finding | Status |
|---|---|---|---|
| A2-AND-01 | High | Refresh revokes all user tokens; no device-scoped session lifecycle | OPEN — Owner/API decision |
| A2-AND-02 | High | Wildcard token abilities and generic token name | OPEN — define least-privilege device token policy |
| A2-AND-03 | High | Main CheckPermission denial leaks permission slug | OPEN — reconcile and verify API #99 fix |
| A2-AND-04 | High | 76 open PRs; critical domains remain unmerged/stacked | OPEN — rebuild selected candidates from current main |
| A2-AND-05 | High | Calendar event APIs, push registration and generalized offline sync absent | OPEN — exclude or separately authorize API work |
| A2-AND-06 | Medium | App loan-product permission differs from API canonical slug | OPEN — App #42 candidate fix not merged |
| A2-AND-07 | Medium | Organization UI and dedicated Finance UI not established on App main | OPEN — specify only from verified API contracts |
| A2-AND-08 | Medium | No unified runtime integration or device test evidence | OPEN — A3/A4 evidence required |
| A2-AND-09 | Medium | Prior API A2 package #97 has stale API baseline | OPEN — refresh evidence against current main |

## 11. Evidence and verification ledger

| Check | Evidence | Result |
|---|---|---|
| API main ref | 0ea16ba583bc95718a1308d0403c58a665d007c7 | PASS |
| App main ref | 76fb67a421b1a54e0529a3479e551a1d1e0c0d0f | PASS |
| API delta from A1 baseline | One docs-only commit; two docs files | PASS |
| Native Android project | Recursive API/App main tree inspection | NOT FOUND |
| arna-android repository | GitHub lookup returned 404 | NOT FOUND / NOT CREATED |
| Open PR inventory | 50 API + 26 App | PASS — inventory only |
| Auth/MFA/token source | AuthController, AuthenticationService, TOTP service, Sanctum config and routes | PASS — static review; lifecycle gap remains |
| Tenant source | Resolver, middleware and App tenant store | PASS — static review |
| Domain route inventory | Root routes plus Finance/Governance/Loan/Shareholder/Wallet routes | PASS — static inventory |
| A1 PR #46 CI | Exact head b3f371db0e2c3bc488ffe9cfffce7f9d786b206a; type-check-and-build success | PASS |
| App PR #42 CI | Candidate head a8d4807...; successful frontend workflow reported | PASS — candidate only, not main |
| API clean install/migrations | Not run | NOT RUN |
| Unified API/App runtime integration | Not run | NOT RUN |
| Android build/device/emulator tests | No Android project | NOT RUN |
| Independent security review | Not performed | NOT RUN |

## 12. A2 disposition and next-stage gate

A2 source reconciliation is PARTIAL. Current baselines, domain ownership, native Android absence, authentication transport, token lifecycle, tenant/permission model, capability inventory and principal integration dependencies are documented.

A2 technical closure is NOT VERIFIED-CLOSED. A production-safe native token/session lifecycle, complete endpoint-by-endpoint policy matrix, clean-install/migration proof, unified runtime integration and device test evidence remain outstanding.

Recommended A3 preparation:
1. Resolve the mobile session/token lifecycle decision: device-scoped sessions or explicit acceptance of global refresh revocation.
2. Reconcile the main-branch authorization denial finding and loan-product permission mismatch through separately reviewed exact-head candidates.
3. Freeze an Android v1 endpoint-to-screen matrix and data-classification/offline matrix from verified API contracts.
4. Only then create the dedicated arna-android repository and begin the native shell/authentication foundation under a separately approved A3 scope.

A3 implementation, API contract changes, repository creation, merge, signing, A5 release and deployment are not authorized by this A2 report.

Owner decision requested: review the A2 findings and approve or revise the proposed A3 entry conditions.