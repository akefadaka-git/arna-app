/*
 * =============================================================================
 * CHANGE VERIFICATION — SSO fix
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/service.ts  (AMEND)
 * Unit:      bootstrapSession — attempt the API call unconditionally
 * Delivery type:  Correction — the session-cookie path now works.
 * Net lines:      +~50 docblock; +7 code lines net.
 *
 * Before (v1.1.0):
 *   bootstrapSession() short-circuited before making any API call:
 *
 *     const auth = useAuthStore();
 *     if (auth.token === null) {
 *       return 'no-token';
 *     }
 *     try { await fetchAndSyncCurrentUser(); return 'restored'; }
 *     catch (err) { ... }
 *
 *   The guard existed to avoid an unnecessary API call when the
 *   caller was clearly logged out. It was correct under the
 *   assumption that the ONLY authentication credential is a bearer
 *   token — an assumption that held for the workspace-only
 *   deployment.
 *
 *   With the Shareholder Portal live on a sibling subdomain of
 *   .maalearna.com.et, the assumption breaks. A visitor may hold a
 *   valid Sanctum session cookie (scoped to .maalearna.com.et by
 *   SESSION_DOMAIN) while the SPA's in-memory auth store has no
 *   token — because the token is never persisted across origins.
 *   The guard returned 'no-token' without ever asking the API,
 *   producing the observed behavior: a logged-in user is treated as
 *   logged out on the second subdomain and redirected to /login.
 *
 * After (v1.2.0):
 *   bootstrapSession() attempts GET /api/user UNCONDITIONALLY. The
 *   API itself is the authoritative judge of whether the caller is
 *   authenticated: if a valid session cookie (or bearer token) is
 *   present, /api/user returns 200 with the user; if not, it returns
 *   401. The SPA no longer pretends to know the answer from the
 *   in-memory token.
 *
 *   Behavior matrix:
 *     · Token present + session valid   → 200, 'restored'
 *     · Token absent + session valid    → 200, 'restored'   (SSO case)
 *     · Token present + session invalid → 401, 'invalidated'
 *     · Token absent + session invalid  → 401, 'no-token'
 *     · Network unreachable             → 'network-error'
 *
 *   The 'invalidated' vs. 'no-token' distinction is preserved by
 *   capturing `hadToken` BEFORE clearAllStores() runs.
 *
 *   The extra round trip on a fresh unauthenticated visitor is one
 *   GET that returns 401 — negligible, and the cost of correct SSO.
 *
 * Files modified:  this file only
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Authentication Service
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/service.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.2.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6, §6.5, §6.6, §13
 *            MASES_PHASE_2_UI_COMPONENT_CATALOG.md §26.2
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.2.0  — SSO fix. bootstrapSession() now attempts GET /api/user
 *          unconditionally instead of short-circuiting when the
 *          in-memory token is absent. See the CR-block at the top of
 *          the file for the full rationale and the behavior matrix.
 *
 * 1.1.0  — Sanctum CSRF handshake (production unblock):
 *          · login() and register() now await api.csrfCookie() before
 *            issuing their state-changing POST. Without this call,
 *            every login and registration attempt was rejected with
 *            HTTP 419 (CSRF token mismatch).
 *
 *            Why the call belongs HERE, not in each form component:
 *
 *              The forms (LoginForm.vue, RegisterForm.vue) call this
 *              service; the service calls the API layer; the API layer
 *              calls the shared client. Every state-changing flow in
 *              the app should perform the handshake as part of its own
 *              service method, not rely on the calling component to do
 *              it first. Centralizing it here means:
 *
 *                - No form can forget the handshake.
 *                - No form needs to import @/core/api/client directly,
 *                  preserving the layering the client's own header
 *                  comment insists upon.
 *                - Tests of the auth service exercise the handshake
 *                  automatically.
 *
 *            Why the call must be AWAITED:
 *
 *              `GET /sanctum/csrf-cookie` responds with 204 and two
 *              Set-Cookie headers (`XSRF-TOKEN` and
 *              `laravel_session`). The browser applies those cookies
 *              asynchronously — after the response arrives. If the
 *              login POST is issued before that has happened, the
 *              outgoing request carries either no `X-XSRF-TOKEN`
 *              header or a stale value, and the server returns 419.
 *              `await` on csrfCookie() guarantees the response — and
 *              therefore the cookie application — has completed
 *              before the POST is built.
 *
 *            Why login() is the right place, not bootstrapSession():
 *
 *              bootstrapSession() runs at app start, before the user
 *              has interacted with the login form. It has no reason
 *              to touch the CSRF cookie — the user may not log in at
 *              all during that page load. Priming the cookie at login
 *              time also handles the case where a session expires
 *              while the tab is open: the user returns to the login
 *              form, submits, and the handshake runs again, producing
 *              a fresh token. If the handshake ran only at bootstrap,
 *              a long-lived tab would accumulate a stale cookie and
 *              fail on the first POST after the session expired.
 *
 *            Alternative considered and rejected:
 *
 *              Calling csrfCookie() once in main.ts immediately after
 *              bootstrapApp(). This is the pattern Laravel's own
 *              Sanctum documentation shows for small SPAs. It was
 *              rejected here because it does not cover the
 *              "session expired mid-tab" case above. The cost of
 *              calling csrfCookie() on every login attempt is one
 *              extra HTTP round-trip per login, which is negligible
 *              relative to the login POST itself.
 *
 *          · No change to logout(), refresh(), bootstrapSession(),
 *            fetchAndSyncCurrentUser(), or any password-reset /
 *            verification method. Logout and refresh already carry a
 *            valid session cookie (the user was authenticated to call
 *            them), so the CSRF cookie is present. The password-reset
 *            and verification endpoints are public and the backend
 *            does not enforce CSRF on them in the delivered
 *            configuration.
 *
 * 1.0.1  — backend-source audit corrections:
 *          · resendVerificationEmail(email) now takes and forwards an
 *            email argument. The endpoint is PUBLIC, not authenticated.
 *            (See Unit 12.2 v1.0.1.)
 *          · Docblock updated to reflect the endpoint's true access
 *            policy.
 *          No other behavior change. The register() and login() flows
 *          are unchanged; only the RegisterRequest interface in ./api
 *          was corrected, and the service transparently benefits.
 *
 * 1.0.0  — initial delivery (Stage 12, Unit 12.3)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The single orchestration layer for authentication. Composes the
 * typed API functions of ./api (Unit 12.2 v1.0.1) with the store
 * mutations of @/stores/auth, @/stores/tenant, @/stores/locale,
 * @/stores/launcher, @/stores/notifications.
 *
 * Every auth page calls this service; none calls ./api or the store's
 * mutations directly.
 *
 * -----------------------------------------------------------------------------
 * What this service does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not call the API client's HTTP methods directly for the
 *     domain endpoints. All domain HTTP goes through ./api. The one
 *     exception is csrfCookie(), which is a protocol-level call (it
 *     primes a cookie; it does not touch application data) and
 *     belongs to the client's own API surface. The service imports
 *     `api` from '@/core/api/client' solely to call csrfCookie().
 *   - It does not touch storage. The auth store owns its
 *     AuthTokenStorage adapter.
 *   - It does not navigate. The router guards decide redirects.
 *   - It does not render. Errors propagate as NormalizedApiError.
 *
 * -----------------------------------------------------------------------------
 * Login / register flow (provisional session)
 * -----------------------------------------------------------------------------
 * POST /api/login (and /register) returns a PARTIAL user — five
 * fields, verified against AuthController's ->only([...]). The auth
 * store expects a FULL AuthUser (Unit 11.4) with roles, permissions,
 * tenants. The store has no "set token only" action. The service
 * therefore performs these steps, in order:
 *
 *   0. AWAIT api.csrfCookie(). Primes the CSRF cookie. Added in
 *      1.1.0. See the revision history for the rationale.
 *
 *   1. Install a provisional session with the partial user and empty
 *      roles / permissions / tenants arrays.
 *
 *   2. Call GET /api/user (the request carries the token from step 1).
 *
 *   3. Replace the provisional user with the full one.
 *
 * The window between steps 1 and 3 is a single HTTP request. No UI
 * renders in that window. On step-2 failure, the provisional session
 * is cleared and the error propagates.
 *
 * If step 0 fails — the CSRF endpoint is unreachable, returns a
 * non-2xx, or the response is otherwise not the expected 204 — the
 * error propagates before any state is modified. The store is not
 * touched; no provisional session is installed; the caller (the
 * form) receives the NormalizedApiError and presents its network or
 * generic banner. This is the correct posture: no partial state.
 *
 * -----------------------------------------------------------------------------
 * Token storage policy — INTERIM FREEZE (§6.6)
 * -----------------------------------------------------------------------------
 * Freeze §6.6 defers the persistence decision to Stage 12 and lists
 * three candidates (in-memory, sessionStorage, localStorage — the
 * last prohibited by default). §6.6 also requires integration
 * testing of refresh-from-cold-load before the decision is final.
 *
 * That verification cannot be performed from within a chat; it needs
 * a running backend. The interim freeze is therefore:
 *
 *   ★ sessionStorage for the token
 *
 * Rationale: candidate A (in-memory) depends on refresh-from-cold-
 * load working as hoped, which is UNVERIFIED. Candidate C is
 * prohibited. Candidate B works today without depending on unverified
 * behavior; its only documented caveat ("vulnerable to same-origin
 * scripts") is mitigated by the CSP header required at §21.8 on
 * app.maalearna.com.et.
 *
 * This is a REVERSIBLE decision. The service does not touch storage —
 * the store's AuthTokenStorage adapter does. Switching between A and
 * B is one call to setAuthTokenStorage(...) at bootstrap (main.ts, a
 * later unit). No change to this file.
 *
 * -----------------------------------------------------------------------------
 * Interaction with the API client's CSRF handling
 * -----------------------------------------------------------------------------
 * The shared API client (Unit 2.1 v1.1.0) does two things related to
 * CSRF:
 *
 *   1. It sets `X-XSRF-TOKEN` on every outgoing request, by reading
 *      the `XSRF-TOKEN` cookie. This is automatic and invisible to
 *      callers.
 *
 *   2. It exposes `csrfCookie()`, which issues
 *      `GET /sanctum/csrf-cookie` to CREATE that cookie.
 *
 * This service calls (2) at the start of each state-changing flow.
 * Once the cookie exists, (1) takes care of the header on the
 * subsequent POST. There is no duplicated logic: the service is
 * responsible for the handshake, the client for the header.
 *
 * -----------------------------------------------------------------------------
 * SSO across sibling subdomains
 * -----------------------------------------------------------------------------
 * MASES is deployed as multiple SPAs on sibling subdomains of
 * maalearna.com.et (app, portal, and future surfaces). Sanctum's
 * session cookie is scoped to `.maalearna.com.et`
 * (SESSION_DOMAIN=.maalearna.com.et in the API's .env), so a login
 * performed on any of them produces a session cookie that every
 * sibling honours.
 *
 * The bearer token, in contrast, is NOT persisted across origins:
 * the auth store's in-memory adapter holds it for the lifetime of
 * one SPA's tab. A visitor who logs in on `app.maalearna.com.et` and
 * then navigates to `portal.maalearna.com.et` therefore arrives with
 * a valid session cookie but no token in the new SPA's auth store.
 *
 * As of v1.2.0, bootstrapSession() handles that state correctly: it
 * attempts GET /api/user unconditionally and lets the API judge
 * authentication from whatever credential the browser sends. If the
 * session cookie is valid, the call succeeds and the user is
 * restored — no re-login required. See the top-of-file change
 * block for the full behavior matrix.
 *
 * -----------------------------------------------------------------------------
 * No hardcoded user-facing string
 * -----------------------------------------------------------------------------
 * This file produces no user-facing text. Messages shown to the user
 * are produced from the error's `code` (NormalizedApiError) and the
 * caller's translation layer.
 * =============================================================================
 */

import * as authApi from './api';
import type { RegisterRequest, ResetPasswordRequest } from './api';
import { api } from '@/core/api/client';
import { useAuthStore } from '@/stores/auth';
import type { AuthUser } from '@/stores/auth';
import { useTenantStore } from '@/stores/tenant';
import { useLocaleStore } from '@/stores/locale';
import { useLauncherStore } from '@/stores/launcher';
import { useNotificationsStore } from '@/stores/notifications';

// =============================================================================
// Public types
// =============================================================================

/**
 * The result of bootstrapSession().
 */
export type BootstrapResult =
  | 'no-token'
  | 'restored'
  | 'invalidated'
  | 'network-error';

// =============================================================================
// Internal helpers
// =============================================================================

/*
 * 401-family codes. Verified against bootstrap/app.php's renderer:
 * Laravel's AuthenticationException produces 'UNAUTHENTICATED'. The
 * remaining entries are produced by CoreException subclasses
 * (Authentication\Exceptions) per Freeze §11.3. The set is a SUPERSET
 * of what the renderer alone produces, which is the safe direction.
 */
const UNAUTHORIZED_CODES: ReadonlySet<string> = new Set([
  'UNAUTHENTICATED',
  'AUTH_UNAUTHENTICATED',
  'AUTH_REQUIRED',
  'AUTH_TOKEN_INVALID',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_INVALID_CREDENTIALS',
]);

/**
 * Best-effort classification of an error as a 401-family failure.
 * Checks three independent signals documented in the freeze.
 */
function isUnauthorizedError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;

  const e = err as {
    category?: unknown;
    httpStatus?: unknown;
    status?: unknown;
    code?: unknown;
  };

  if (e.category === 'unauthorized') return true;
  if (e.httpStatus === 401 || e.status === 401) return true;
  if (typeof e.code === 'string' && UNAUTHORIZED_CODES.has(e.code)) {
    return true;
  }

  return false;
}

/**
 * Install a full AuthUser into the auth store and hydrate the stores
 * that depend on it.
 */
function syncUserIntoStores(user: AuthUser): void {
  const auth = useAuthStore();
  auth.setUser(user);
  useTenantStore().reconcileWithUser();
  useLocaleStore().hydrateFromUser(user.locale);
}

/**
 * Wipe every store that carries session-scoped state.
 */
function clearAllStores(): void {
  useAuthStore().clearSession();
  useTenantStore().reset();
  useLocaleStore().reset();
  useLauncherStore().clear();
  useNotificationsStore().clear();
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Log in with email and password. See the file header comment
 * §"Login / register flow".
 *
 * Step 0 (added in 1.1.0) primes the CSRF cookie. It runs BEFORE any
 * store state is touched, so a handshake failure leaves the app in a
 * clean state — no provisional session, no partial user, no token.
 *
 * Throws NormalizedApiError on any failure, including the handshake
 * failure itself. The login form's `setBannerFromError` classifies a
 * handshake failure correctly:
 *
 *   · A network-level failure (DNS, TLS, connection refused, timeout)
 *     arrives as category 'network' and is presented with the
 *     network-error banner.
 *   · A non-2xx response from the CSRF endpoint (unexpected — the
 *     endpoint normally returns 204) arrives as category 'server-error'
 *     or 'client-error' and is presented with the generic-error banner
 *     plus a request_id for support.
 *
 * Both presentations are appropriate: the user's credentials were
 * never sent, so no credential-specific messaging applies.
 */
export async function login(
  email: string,
  password: string,
): Promise<void> {
  const auth = useAuthStore();

  /*
   * ─────────────────────────────────────────────────────────────────────
   * Step 0 — Sanctum CSRF handshake. Added in 1.1.0.
   * ─────────────────────────────────────────────────────────────────────
   *
   * Awaited (not fire-and-forget): the browser applies the Set-Cookie
   * headers from this response asynchronously. The login POST below
   * must not be issued until those headers have been applied, or the
   * outgoing request will carry a stale or absent X-XSRF-TOKEN
   * header and the server will return 419.
   *
   * See the file header §"Revision history" (1.1.0 entry) for the
   * full rationale, and §"Interaction with the API client's CSRF
   * handling" for how this call relates to the client's own
   * X-XSRF-TOKEN header logic.
   */
  await api.csrfCookie();

  const response = await authApi.login(email, password);

  auth.setSession({
    token: response.token,
    user: {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      locale: response.user.locale,
      default_tenant_id: response.user.default_tenant_id,
      roles: [],
      permissions: [],
      tenants: [],
    },
  });

  try {
    const fullUser = await authApi.fetchCurrentUser();
    syncUserIntoStores(fullUser);
  } catch (err) {
    auth.clearSession();
    throw err;
  }
}

/**
 * Register a new user and log them in.
 *
 * The register endpoint has the same response shape as login. The
 * RegisterRequest interface (Unit 12.2 v1.0.1) reflects the backend's
 * structured bilingual name validation; the caller supplies whichever
 * of `name`, `first_name_am`, or `first_name_en` the backend requires.
 *
 * Step 0 (added in 1.1.0) primes the CSRF cookie, exactly as login()
 * does. The same reasoning applies: register is a state-changing
 * POST that Laravel's ValidateCsrfToken middleware guards, and the
 * handshake must complete before the POST is issued.
 *
 * Throws NormalizedApiError on any failure (AUTH_EMAIL_TAKEN, 422
 * VALIDATION_ERROR, network, or a CSRF handshake failure).
 */
export async function register(
  payload: RegisterRequest,
): Promise<void> {
  const auth = useAuthStore();

  /*
   * Step 0 — Sanctum CSRF handshake. Added in 1.1.0. See the note in
   * login() above; the contract and rationale are identical.
   */
  await api.csrfCookie();

  const response = await authApi.register(payload);

  auth.setSession({
    token: response.token,
    user: {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      locale: response.user.locale,
      default_tenant_id: response.user.default_tenant_id,
      roles: [],
      permissions: [],
      tenants: [],
    },
  });

  try {
    const fullUser = await authApi.fetchCurrentUser();
    syncUserIntoStores(fullUser);
  } catch (err) {
    auth.clearSession();
    throw err;
  }
}

/**
 * Log out. Best-effort server revocation, unconditional local clearing.
 *
 * Does not throw. Resolves once local state is clear.
 *
 * No CSRF handshake is performed. The user is authenticated at the
 * point this is called (they have an active session), which means the
 * CSRF cookie is already present from their login. If the cookie has
 * expired (the session should have expired with it, in which case
 * the logout POST returns 401 and the catch below swallows it), the
 * local clearing still runs — the user is logged out client-side
 * regardless.
 */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    /* Swallowed — see the file header comment. */
  }
  clearAllStores();
}

/**
 * Refresh the bearer token. The user summary is preserved in the store
 * (the endpoint does not re-emit it — verified).
 *
 * Throws if called without an authenticated user — a programming error.
 *
 * No CSRF handshake is performed. Same reasoning as logout(): the
 * user must already be authenticated to reach this code path, so the
 * CSRF cookie is present.
 */
export async function refresh(): Promise<void> {
  const auth = useAuthStore();

  const currentUser = auth.user;
  if (currentUser === null) {
    throw new Error(
      '[auth/service] refresh() called without an authenticated user. ' +
        'Guard refresh calls with authStore.isAuthenticated.',
    );
  }

  const response = await authApi.refreshToken();

  auth.setSession({
    token: response.token,
    user: currentUser,
  });
}

/**
 * Fetch GET /api/user and hydrate the stores. Assumes an authenticated
 * session already exists. Called by bootstrapSession() and by the
 * router's authorized guard when the user summary is stale.
 *
 * No CSRF handshake is performed — GET requests are not subject to
 * Laravel's CSRF check.
 */
export async function fetchAndSyncCurrentUser(): Promise<void> {
  const user = await authApi.fetchCurrentUser();
  syncUserIntoStores(user);
}

/**
 * The app-start routine. Call once from main.ts, before app.mount().
 *
 * Attempts GET /api/user UNCONDITIONALLY as of v1.2.0. The API is the
 * authoritative judge of authentication: a valid session cookie
 * (Sanctum) or bearer token produces 200; neither produces 401. See
 * the file's SSO-fix change-verification block for the full
 * rationale and the behavior matrix.
 *
 * Does not throw — returns a BootstrapResult status:
 *   'restored'      — the API confirmed a valid session.
 *   'no-token'      — no token was held AND the API returned 401.
 *   'invalidated'   — a token was held but the API returned 401.
 *   'network-error' — the API was unreachable.
 *
 * No CSRF handshake is performed here. See the file header
 * §"Revision history" (1.1.0 entry) for why the handshake lives in
 * login() and register() instead of at bootstrap.
 */
export async function bootstrapSession(): Promise<BootstrapResult> {
  const auth = useAuthStore();

  /*
   * Capture the token-holding state BEFORE any API call or store
   * clear, so the return value can distinguish a fresh visitor
   * ('no-token') from an expired session ('invalidated') even after
   * clearAllStores() has nulled the token.
   *
   * Added in v1.2.0 as part of the SSO fix. See the file's top-of-
   * file change-verification block.
   */
  const hadToken = auth.token !== null;

  try {
    await fetchAndSyncCurrentUser();
    return 'restored';
  } catch (err) {
    if (isUnauthorizedError(err)) {
      clearAllStores();
      return hadToken ? 'invalidated' : 'no-token';
    }
    return 'network-error';
  }
}

/**
 * Request a password-reset email. Public endpoint.
 *
 * The backend validates that the email exists (`exists:users,email`),
 * so a mismatched email produces a 422 VALIDATION_ERROR rather than a
 * silent success. (Verified against AuthController::
 * sendPasswordResetLink.)
 *
 * No CSRF handshake is performed. The delivered backend does not
 * enforce CSRF on this endpoint in its current configuration (the
 * route is public and lives outside the stateful-api middleware
 * group). If the backend configuration changes to enforce CSRF on
 * password-reset requests, add `await api.csrfCookie();` at the top
 * of this function.
 *
 * Throws NormalizedApiError on failure (422, 429, network).
 */
export async function requestPasswordReset(
  email: string,
): Promise<void> {
  await authApi.requestPasswordReset(email);
}

/**
 * Complete a password reset using the token from the reset email.
 * Public endpoint.
 *
 * No CSRF handshake is performed — same reasoning as
 * requestPasswordReset() above.
 *
 * Throws NormalizedApiError on failure.
 */
export async function resetPassword(
  payload: ResetPasswordRequest,
): Promise<void> {
  await authApi.resetPassword(payload);
}

/**
 * Verify an email address using the id + hash from the verification
 * email. Public endpoint.
 *
 * No CSRF handshake — this is a GET.
 *
 * Throws NormalizedApiError on failure.
 */
export async function verifyEmail(
  id: number | string,
  hash: string,
): Promise<void> {
  await authApi.verifyEmail(id, hash);
}

/**
 * Resend the verification email to the given address. PUBLIC endpoint.
 *
 * VERIFIED (v1.0.1): the endpoint is declared outside auth:sanctum in
 * routes/api.php and validates the email body. It is NOT authenticated
 * — this corrects the initial assumption.
 *
 * No CSRF handshake is performed — same reasoning as
 * requestPasswordReset() above.
 *
 * Throws NormalizedApiError on failure.
 */
export async function resendVerificationEmail(
  email: string,
): Promise<void> {
  await authApi.resendVerificationEmail(email);
}