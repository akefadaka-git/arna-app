/*
 * =============================================================================
 * MASES Phase 2 UI — Authentication Service
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/service.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.1
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6, §6.5, §6.6, §13
 *            MASES_PHASE_2_UI_COMPONENT_CATALOG.md §26.2
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 12, Unit 12.3)
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
 *   - It does not call the API client directly. All HTTP goes through
 *     ./api.
 *   - It does not touch storage. The auth store owns its
 *     AuthTokenStorage adapter.
 *   - It does not navigate. The router guards decide redirects.
 *   - It does not render. Errors propagate as NormalizedApiError.
 *
 * -----------------------------------------------------------------------------
 * Login / register flow (provisional session)
 * -----------------------------------------------------------------------------
 * POST /api/login (and /register) returns a PARTIAL user — five fields,
 * verified against AuthController's ->only([...]). The auth store
 * expects a FULL AuthUser (Unit 11.4) with roles, permissions, tenants.
 * The store has no "set token only" action. The service therefore:
 *
 *   1. installs a provisional session with the partial user and empty
 *      roles / permissions / tenants arrays;
 *   2. calls GET /api/user (the request carries the token from step 1);
 *   3. replaces the provisional user with the full one.
 *
 * The window between steps 1 and 3 is a single HTTP request. No UI
 * renders in that window. On step-2 failure, the provisional session
 * is cleared and the error propagates.
 *
 * -----------------------------------------------------------------------------
 * Token storage policy — INTERIM FREEZE (§6.6)
 * -----------------------------------------------------------------------------
 * Freeze §6.6 defers the persistence decision to Stage 12 and lists
 * three candidates (in-memory, sessionStorage, localStorage — the last
 * prohibited by default). §6.6 also requires integration testing of
 * refresh-from-cold-load before the decision is final.
 *
 * That verification cannot be performed from within a chat; it needs a
 * running backend. The interim freeze is therefore:
 *
 *   ★ sessionStorage for the token
 *
 * Rationale: candidate A (in-memory) depends on refresh-from-cold-load
 * working as hoped, which is UNVERIFIED. Candidate C is prohibited.
 * Candidate B works today without depending on unverified behavior;
 * its only documented caveat ("vulnerable to same-origin scripts") is
 * mitigated by the CSP header required at §21.8 on app.maalearna.com.et.
 *
 * This is a REVERSIBLE decision. The service does not touch storage —
 * the store's AuthTokenStorage adapter does. Switching between A and B
 * is one call to setAuthTokenStorage(...) at bootstrap (main.ts, a
 * later unit). No change to this file.
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
 * Throws NormalizedApiError on any failure.
 */
export async function login(
  email: string,
  password: string,
): Promise<void> {
  const auth = useAuthStore();

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
 * Throws NormalizedApiError on any failure (AUTH_EMAIL_TAKEN, 422
 * VALIDATION_ERROR, network).
 */
export async function register(
  payload: RegisterRequest,
): Promise<void> {
  const auth = useAuthStore();

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
 */
export async function fetchAndSyncCurrentUser(): Promise<void> {
  const user = await authApi.fetchCurrentUser();
  syncUserIntoStores(user);
}

/**
 * The app-start routine. Call once from main.ts, before app.mount().
 *
 * Does not throw — returns a BootstrapResult status. See the file
 * header comment.
 */
export async function bootstrapSession(): Promise<BootstrapResult> {
  const auth = useAuthStore();

  if (auth.token === null) {
    return 'no-token';
  }

  try {
    await fetchAndSyncCurrentUser();
    return 'restored';
  } catch (err) {
    if (isUnauthorizedError(err)) {
      clearAllStores();
      return 'invalidated';
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
 * Throws NormalizedApiError on failure.
 */
export async function resendVerificationEmail(
  email: string,
): Promise<void> {
  await authApi.resendVerificationEmail(email);
}