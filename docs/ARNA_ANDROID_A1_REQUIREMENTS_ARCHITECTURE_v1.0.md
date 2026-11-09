# ARNA Android — A1 Requirements and Architecture Assessment

**Document:** ARNA-ANDROID-A1-001  
**Version:** 1.0  
**Status:** A1 assessment proposal — Owner acceptance required before A2  
**Assessment date:** 9 November 2026

## 1. Purpose and decision boundary

This document establishes initial product requirements and a target architecture for a dedicated ARNA Android application. It is an A1 assessment only. It does not authorize Android implementation, backend changes, creation of a production Android repository, merge, signing, publication or deployment.

The Android client must extend the existing ARNA platform. It must not become a second ERP, create a second identity system, duplicate domain business rules, or establish a competing source of truth.

## 2. Canonical repositories and read-only baseline

- API: https://github.com/akefadaka-git/arna-api
- Existing web application: https://github.com/akefadaka-git/arna-app

Read-only GitHub evidence captured on 9 November 2026:

| Repository | Default branch | Main HEAD |
|---|---|---|
| akefadaka-git/arna-api | main | 0ea16ba583bc95718a1308d0403c58a665d007c7 |
| akefadaka-git/arna-app | main | 76fb67a421b1a54e0529a3479e551a1d1e0c0d0f |

Source evidence inspected:
- API composer.json: PHP ^8.3, Laravel ^12.0 and Sanctum ^4.0.
- API routes/api.php: public, authenticated and tenant-scoped route groups; authenticated routes use auth:sanctum; tenant-scoped routes additionally require tenant membership.
- API AuthController: Sanctum personal access token issuance and revocation behavior is documented; bearer-token authentication is supported.
- API config/sanctum.php: Sanctum supports bearer tokens and first-party SPA cookie authentication; stateful-domain configuration is intended for browser SPA origins.
- Web package.json and README: Vue 3, TypeScript, Vite, Pinia and Axios; four separate static browser builds (workspace, shareholder portal, admin and public site).
- Web auth service and API client: browser authentication includes Sanctum CSRF/cookie behavior and an interim browser token-storage policy.
- Web UI/UX Master Strategy v1.2: Amharic-first, mobile-first, phased execution, existing domain boundaries and Owner-controlled gates.

The inspected main trees contain no native Android project, Gradle build, Kotlin source tree, Flutter project or Capacitor/Cordova wrapper. The web application has responsive browser UI, including a mobile drawer; that is not a native Android application.

Open pull requests are not part of the main-branch baseline and must not be treated as merged or verified capabilities. At assessment time, API open work included #99, #98, #97 and #96; web-app open work included #45, #44 and #43. A2 must reconcile relevant work at exact heads before freezing integration assumptions.

## 3. Product requirements

### Objective and audiences

Deliver one secure Android entry point into ARNA. Each authenticated person sees only applications, records and actions authorized by the API for their identity, tenant membership and effective permissions.

Target audiences include shareholders and authorized representatives; employees and operational users; managers; finance users; board, committee and governance participants; and platform or tenant administrators. These are audience categories, not blanket grants. The server remains authoritative for application access, tenant scope, resource visibility and every mutation.

### Initial functional scope

1. Secure sign-in, sign-out, session restoration and account-recovery entry points supported by verified API contracts.
2. Amharic-first shell with English support.
3. Authorized application launcher and personalized dashboard.
4. Shareholder Portal capabilities already supported by verified API workflows.
5. Notifications and calendar only where endpoints, permissions and lifecycle contracts are verified.
6. Read-oriented People, Organization, Governance, Documents, Finance, Loan and Wallet workflows where existing API capabilities are verified.
7. Deep links that never bypass server authorization.
8. Clear loading, empty, offline, expired-session, network-error and permission-denied states.

A domain must not be represented as available merely because a web route, UI folder, API model or open PR exists. Each workflow must map to a verified API endpoint, permission, tenant boundary and acceptance test during A2.

### Localization and accessibility

- Amharic is the default locale; English is supported.
- Preserve the approved ARNA brand and semantic design direction.
- Support Ethiopian calendar presentation where required; retain unambiguous ISO/Gregorian dates for API exchange.
- Use Africa/Addis_Ababa as the initial display-timezone default, respecting explicit user preferences where supported.
- Support Ethiopic text rendering, suitable font fallback, dynamic text sizing, TalkBack semantics, contrast, touch-target sizing and reduced-motion preferences.
- Amharic is left-to-right; do not apply RTL behavior to Amharic.

## 4. Proposed technical architecture

**Recommendation for Owner decision:** a dedicated native Android application using Kotlin, Jetpack Compose and a layered architecture.

Rationale: Android is the requested first-class target; native Android provides direct access to lifecycle, secure credential storage, background work, accessibility and platform integration; Compose supports an adaptive UI without replacing the Vue application; a separate native project keeps Gradle/Kotlin concerns out of the existing four-build Vue application.

This is not yet an approved technology freeze. A2 must confirm no native implementation exists elsewhere in relevant canonical branches/history.

Proposed layers:
- Presentation: Compose screens, navigation, design system, accessibility and localized resources.
- Application/domain: use cases, identity/session state, permission-aware navigation and workflow orchestration.
- Data: repositories, API DTOs, response-envelope handling, local cache and synchronization policies.
- Platform: Android Keystore-backed secret protection, connectivity, WorkManager, notifications, approved biometric re-entry and deep links.

Candidate components:

| Concern | Candidate |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose, Material 3 adapted to ARNA design tokens |
| Navigation | AndroidX Navigation for Compose |
| Dependency injection | Hilt, subject to dependency/security review |
| Networking | Retrofit/OkHttp or equivalent maintained client |
| Serialization | Kotlin Serialization or reviewed equivalent |
| Local structured cache | Room |
| Preferences | DataStore |
| Background synchronization | WorkManager |
| Credential protection | Android Keystore-backed encryption |
| Tests | JUnit, coroutine tests, Compose UI and instrumented tests |
| Build | Gradle Kotlin DSL with pinned dependency versions |

No dependency is authorized for installation during A1.

## 5. Authentication and authorization boundary

The existing API documents Sanctum personal access tokens in bearer-token form and revocation of the presented token on logout/refresh. This is a useful starting point, but it does not prove that the current lifecycle is sufficient for a native multi-device client.

A2 must inspect exact login, MFA, refresh, logout, profile, tenant-context and token-ability implementations and tests. Before implementation, the API owner must decide and document:
- Whether Android receives a dedicated device-scoped token or uses the existing token issuance flow.
- Device/session naming, token abilities, expiry, rotation, revocation and lost-device handling.
- MFA completion before any token is issued.
- Multi-device session visibility and remote revocation, if supported.
- Tenant selection/context rules and invalidation of stale data after tenant changes.
- Whether biometrics are only local convenience and never replace server authentication.

Android must use a supported bearer-token contract, not assume browser cookies, shared-domain SSO or a browser CSRF handshake applies to a native client. Tokens must not be stored in plain preferences, logs, analytics, crash reports or unencrypted files. The client must fail closed when authentication, tenant context or permission state is uncertain.

## 6. Offline and synchronization policy

Offline support must be conservative:
- Cache only data whose classification, retention and local-storage rules are approved.
- Clearly distinguish cached/stale data from current server data.
- Revalidate authorization and tenant context before sensitive data is displayed or actions are submitted.
- Do not queue high-impact financial, shareholder, governance or administrative mutations until the API defines idempotency, conflict handling, audit semantics, expiry and replay protections.
- Use bounded retry with backoff; never blindly retry non-idempotent operations.
- Clear or cryptographically invalidate tenant- and user-scoped caches on logout, account change, token revocation or tenant switch.
- Offline state never bypasses server policy.

The initial release may provide offline access to approved reference/read-only content while keeping sensitive workflows online-only. The exact offline matrix is an A2/A3 decision.

## 7. Security, privacy and operations

- TLS is mandatory; production cleartext traffic is prohibited.
- Do not embed API secrets, private keys or privileged credentials in the APK.
- Request Android permissions only for verified workflows.
- Do not log credentials, tokens, personal data or sensitive financial/governance content.
- Review backup/export behavior so secrets and sensitive caches are not unintentionally copied.
- Protect deep links and exported components against unauthorized invocation.
- Server-side rate limiting, authorization, tenant isolation and audit controls remain mandatory.
- Define dependency updates, vulnerability response, signing-key custody, release provenance and rollback before production release.
- Biometrics may unlock a locally protected session credential only after approved design; they do not grant server permissions or replace MFA.
- Certificate pinning is not a default A1 requirement; if later adopted, key rotation and recovery must be designed.

## 8. Repository and delivery strategy

Recommendation: keep arna-app as the web application and arna-api as the backend. If A2 confirms no existing native project, create a dedicated Android repository (proposed name: arna-android) only after Owner approval.

Do not add Kotlin/Gradle application code to the Vue repository as an expedient. Do not create a second backend, duplicate migrations or move existing web functionality into a new source of truth.

CI should use public GitHub-hosted workflows where feasible and must not depend on paid services, deposits or billing top-ups. Android build/test verification must be tied to exact commit SHAs. Signing and Play publication remain separate A5 activities.

## 9. A1 decision register — proposed decisions

| ID | Decision | A1 recommendation | Status |
|---|---|---|---|
| D01 | Product boundary | Native Android client of the existing ARNA platform | PROPOSED |
| D02 | Android technology | Kotlin + Jetpack Compose | PROPOSED |
| D03 | Repository boundary | Dedicated arna-android repository after A2 confirmation | PROPOSED |
| D04 | Backend authority | Existing ARNA API remains the only business/data authority | PROPOSED |
| D05 | Authentication | Native bearer-token flow; do not reuse browser cookie assumptions | PROPOSED |
| D06 | Localization | Amharic-first, English-supported; Ethiopian calendar presentation | PROPOSED |
| D07 | Offline policy | Approved read-only cache first; mutations gated by API contracts | PROPOSED |
| D08 | First-release scope | Auth, launcher/dashboard and verified high-value workflows | PROPOSED |
| D09 | Delivery governance | A1 → A2 → A3 → A4 → separately approved A5 | PROPOSED |

No decision above is marked Owner-approved by this document.

## 10. A2 entry criteria and required evidence

A2 is read-only and must:
1. Reconfirm exact current main SHAs and inspect relevant open branches/PRs without merging or modifying them.
2. Inventory API authentication endpoints, request/response envelopes, MFA state, token issuance/revocation and tenant-context rules.
3. Map candidate Android workflows to exact API routes, permission slugs, policies, tenant middleware and tests.
4. Identify API gaps for device sessions, token lifecycle, push notifications, file transfer, calendar, offline sync and idempotency.
5. Inspect web workflows as reference behavior without treating browser cookie/CSRF logic as native Android requirements.
6. Produce endpoint-to-screen, authorization and data-classification/cache matrices, plus dependency and risk registers.
7. Confirm whether a native Android repository or implementation exists in relevant canonical branches before recommending repository creation.

A2 must not modify either main branch, alter API contracts, add dependencies, create migrations or implement Android features.

## 11. A1 acceptance criteria

- [x] Canonical API and web repositories identified.
- [x] Current main HEADs recorded from GitHub.
- [x] Existing browser architecture and backend technology inspected.
- [x] No native Android project found in either inspected main tree.
- [x] Initial product, architecture, security and offline requirements documented.
- [x] Existing open PRs excluded from the main-branch baseline.
- [ ] Owner accepts or revises D01–D09.
- [ ] Owner authorizes A2 read-only reconciliation.

**A1 status: PARTIAL — assessment and proposal documented; Owner decision gate remains open.**

## 12. Explicit exclusions

This A1 document does not authorize Android source-code implementation or dependency installation; API changes, migrations, new permissions or token-lifecycle changes; creation of the arna-android repository; changes to existing main branches or unrelated open PRs; merge, signing, release, Play Store submission or deployment; or claims of production readiness or a committed release date.

**Owner decision requested:** review D01–D09 and explicitly approve or revise the A1 baseline. A2 may begin only after that decision.
