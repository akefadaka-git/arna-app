# ARNA Android A3 Owner Decision and Implementation Authorization

Document: ARNA-ANDROID-A3-001 | Version 1.0 | 9 November 2026

## Owner decision
The Owner has approved device-scoped authentication and session management as a mandatory ARNA Android requirement and authorized proceeding with A3 implementation under existing governance.

Approved work includes device-bound sessions, independently revocable credentials, same-device-only refresh, authenticated session listing, per-device revocation, Android Keystore-backed credential protection, required API changes, and the native Android foundation.

## Governance boundaries
- Preserve canonical repositories and unrelated branches, PRs, files, and changes.
- Implement only on isolated feature branches; do not modify either main branch.
- Keep API and Android changes separately reviewable.
- No merge, production role/grant mutation, signing, release, or deployment is authorized.
- No production secrets or production data.
- A4 verification and A5 deployment remain separate gates.

## A3 entry baselines
- API main: 0ea16ba583bc95718a1308d0403c58a665d007c7
- App main: 76fb67a421b1a54e0529a3479e551a1d1e0c0d0f
- A2 report: https://github.com/akefadaka-git/arna-app/pull/47
- A1 requirements: https://github.com/akefadaka-git/arna-app/pull/46

This decision supersedes the A2 report's pending Owner/API decision statement. A2 remains PARTIAL / NOT VERIFIED-CLOSED until its outstanding technical evidence is supplied.

## Mandatory A3 workstreams
1. API session lifecycle: device-session persistence, explicit mobile token abilities, registration/list/revocation, and device-scoped refresh. Preserve browser SSO and web compatibility.
2. MFA continuity: bind the MFA challenge to the requested mobile device context; no bearer token before MFA succeeds.
3. Tenant and authorization: preserve server-side tenant membership and canonical permission checks.
4. Native Android: establish a separate native Android project/repository when repository creation is available; use bearer auth, Android Keystore-backed storage, and no browser-cookie dependency.
5. Session UX: current/other device list, safe metadata, last activity, expiry/revocation state, per-device revoke, current-session logout.
6. Security: redact credentials and challenge secrets, avoid raw device identifiers in logs, audit lifecycle events.
7. Tests: cross-device refresh isolation, individual revoke, logout, MFA, expiry/revocation, tenant isolation, inactive accounts, concurrent refresh, backward compatibility.

## Acceptance invariants
- Refresh on device A must not revoke device B.
- Revoking device B must not affect device A.
- Current-session logout revokes only the current device session.
- Revoked, expired, disabled, or mismatched sessions cannot authenticate.
- A device cannot claim another user's session or enumerate another user's devices.
- MFA challenge is bound to user, tenant selection, and device registration context.
- Tokens are never stored in plaintext preferences, logs, crash reports, or backups.
- Server authorization remains authoritative.
- Existing web login, browser SSO, and legacy token behavior remain compatible unless separately changed and tested.

## A3 completion evidence
A3 is not complete until implementation PRs exist, exact-head CI is green where available, tests demonstrate the invariants, API/Android contracts are synchronized, and unrelated work is confirmed untouched. A4 security and device verification remain required before merge approval.
