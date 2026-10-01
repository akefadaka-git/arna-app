/*
 * =============================================================================
 * MASES Phase 2 UI — Authentication API Module
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/api.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.1
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6, §11, §12
 *            MASES_PHASE_2_UI_COMPONENT_CATALOG.md §26.1, §26.2
 *            Verified against:
 *              App\Http\Controllers\Auth\AuthController.php
 *              routes/api.php
 *              bootstrap/app.php
 *              config/sanctum.php
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 12, Unit 12.2)
 * 1.0.1  — backend-source audit corrections:
 *          · RegisterRequest now reflects AuthController::register()'s
 *            bilingual Ethiopian name fields (CR-005). The legacy
 *            `name` field remains supported; it is no longer required.
 *          · resendVerificationEmail() now takes an email argument —
 *            the endpoint is PUBLIC and validates the email body,
 *            contrary to the initial assumption that it was
 *            authenticated and bodyless.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Typed wrappers over the shared API client (Stage 4, @/core/api/client)
 * for the authentication endpoints of Freeze §6.2. Every function here
 * calls exactly one endpoint and returns the unwrapped `data` from the
 * canonical {success, data} envelope. Errors propagate as the client's
 * NormalizedApiError. No store, no state, no side effects.
 *
 * -----------------------------------------------------------------------------
 * Path convention (verified)
 * -----------------------------------------------------------------------------
 * Every path begins with "/api/". Laravel's withRouting(api: ...) in
 * bootstrap/app.php auto-prefixes routes/api.php with "/api"; the
 * shared client's baseUrl is the origin only
 * (VITE_API_BASE_URL=https://api.maalearna.com.et), so the composed
 * URL is https://api.maalearna.com.et/api/<endpoint>. Verified against
 * routes/api.php.
 *
 * -----------------------------------------------------------------------------
 * Endpoint coverage (verified against routes/api.php)
 * -----------------------------------------------------------------------------
 *   POST   /api/login                    login()                public
 *   POST   /api/register                 register()             public
 *   POST   /api/logout                   logout()               auth
 *   POST   /api/token/refresh            refreshToken()         auth
 *   GET    /api/user                     fetchCurrentUser()     auth
 *   POST   /api/password/email           requestPasswordReset() public
 *   POST   /api/password/reset           resetPassword()        public
 *   GET    /api/verify-email/{id}/{hash} verifyEmail()          public
 *   POST   /api/verify-email/resend      resendVerificationEmail() public
 *
 * GET /api/profile is deliberately NOT wrapped — Freeze §7.4.2
 * documents that it emits null names for tenants/roles/permissions and
 * instructs the shell to use /api/user instead. A wrapper would invite
 * accidental use.
 *
 * -----------------------------------------------------------------------------
 * Response shapes (verified)
 * -----------------------------------------------------------------------------
 * login / register:
 *   { success: true, data: { user: LoginResponseUser, token, token_type } }
 *   register additionally carries a top-level `message`, which the
 *   client's envelope unwrap discards. Not modeled here.
 *
 * token/refresh:
 *   { success: true, data: { token, token_type } }   (no user)
 *
 * logout / password/reset / verify-email / verify-email/resend:
 *   { success: true, message }                        (NO `data` key)
 *   Modeled as Promise<unknown>; the caller treats resolution as success.
 *
 * -----------------------------------------------------------------------------
 * The partial-vs-full user distinction
 * -----------------------------------------------------------------------------
 * POST /api/login and /api/register return a PARTIAL user — five
 * fields, matching AuthController's ->only([...]) projection. The FULL
 * user (roles, permissions, tenants) comes from GET /api/user. The
 * auth service (Unit 12.3) performs the two-step flow.
 * =============================================================================
 */

import { api } from '@/core/api/client';
import type { AuthUser } from '@/stores/auth';

// =============================================================================
// Request / response types
// =============================================================================

/**
 * The PARTIAL user returned by POST /api/login and POST /api/register.
 *
 * Verified against AuthController::login() / register():
 *   $result['user']->only(['id', 'name', 'email', 'locale', 'default_tenant_id'])
 *
 * Does NOT include roles, permissions, or tenants — those come from
 * GET /api/user (fetchCurrentUser below).
 */
export interface LoginResponseUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly locale: string;
  readonly default_tenant_id: number | null;
}

/**
 * POST /api/login and POST /api/register response body, after the
 * shared client unwraps the {success, data} envelope.
 */
export interface LoginResponse {
  readonly user: LoginResponseUser;
  readonly token: string;
  readonly token_type: 'Bearer';
}

/**
 * POST /api/token/refresh response body. Verified against
 * AuthController::refreshToken() — no user is emitted.
 */
export interface TokenRefreshResponse {
  readonly token: string;
  readonly token_type: 'Bearer';
}

/**
 * POST /api/register request body.
 *
 * Verified against AuthController::register()'s validation rules:
 *   - The legacy single-string `name` field is accepted and optional.
 *   - The structured Ethiopian name is expressed via six bilingual
 *     columns (Ethiopian naming convention, CR-005).
 *   - `first_name_en` is required UNLESS `first_name_am` OR `name` is
 *     supplied (`required_without_all:first_name_am,name`).
 *   - `email`, `password`, and `password_confirmation` are always
 *     required. `password` is checked with `min:8` + `confirmed`.
 *   - `locale` is optional and must be 'am' or 'en'.
 *   - `tenant_id` is optional and, when present, must exist.
 *
 * The "at least one name identifier" rule is not expressible as a plain
 * TS interface without an awkward union. It is documented here and
 * enforced server-side; consumers that violate it receive a
 * VALIDATION_ERROR (422) with the corresponding field errors.
 */
export interface RegisterRequest {
  /** Legacy single-string name. Optional if structured name is given. */
  readonly name?: string;

  /** Structured bilingual name components. */
  readonly first_name_am?: string;
  readonly first_name_en?: string;
  readonly father_name_am?: string;
  readonly father_name_en?: string;
  readonly grandfather_name_am?: string;
  readonly grandfather_name_en?: string;

  readonly email: string;
  readonly password: string;
  readonly password_confirmation: string;
  readonly locale?: 'am' | 'en';
  readonly tenant_id?: number;
}

/**
 * POST /api/password/email request body.
 */
export interface RequestPasswordResetRequest {
  readonly email: string;
}

/**
 * POST /api/password/reset request body.
 */
export interface ResetPasswordRequest {
  readonly token: string;
  readonly email: string;
  readonly password: string;
  readonly password_confirmation: string;
}

// =============================================================================
// API functions — one per endpoint
// =============================================================================

/**
 * POST /api/login — public.
 *
 * Returns a partial user + bearer token. See the file header comment
 * §"The partial-vs-full user distinction".
 */
export function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/login', { email, password });
}

/**
 * POST /api/register — public.
 *
 * Returns the same shape as login. Note the register response includes
 * a top-level `message` that the client unwrap discards.
 */
export function register(
  payload: RegisterRequest,
): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/register', payload);
}

/**
 * POST /api/logout — authenticated. Revokes the current token and all
 * of the user's other tokens. Response has no `data` key; the caller
 * treats a resolved promise as success.
 */
export function logout(): Promise<unknown> {
  return api.post<unknown>('/api/logout', {});
}

/**
 * POST /api/token/refresh — authenticated. Revokes the current token
 * and issues a new one. Returns `{ token, token_type }` only; the user
 * summary is not re-emitted.
 */
export function refreshToken(): Promise<TokenRefreshResponse> {
  return api.post<TokenRefreshResponse>('/api/token/refresh', {});
}

/**
 * GET /api/user — authenticated.
 *
 * The canonical source for the store's AuthUser. Verified against the
 * closure in routes/api.php: { id, name, email, locale,
 * default_tenant_id, tenants, roles, permissions }.
 */
export function fetchCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>('/api/user');
}

/**
 * POST /api/password/email — public.
 *
 * Response: `{ success: true, message }` — no `data`. The backend
 * validates that the email exists (`exists:users,email`); a mismatched
 * email produces a 422 VALIDATION_ERROR rather than a silent success.
 * The `message` is not modeled here.
 */
export function requestPasswordReset(
  email: string,
): Promise<unknown> {
  return api.post<unknown>('/api/password/email', { email });
}

/**
 * POST /api/password/reset — public.
 *
 * Response: `{ success: true, message }` — no `data`.
 */
export function resetPassword(
  payload: ResetPasswordRequest,
): Promise<unknown> {
  return api.post<unknown>('/api/password/reset', payload);
}

/**
 * GET /api/verify-email/{id}/{hash} — public.
 *
 * Response: `{ success: true, message }` — no `data`.
 */
export function verifyEmail(
  id: number | string,
  hash: string,
): Promise<unknown> {
  return api.get<unknown>(
    `/api/verify-email/${encodeURIComponent(String(id))}/${encodeURIComponent(hash)}`,
  );
}

/**
 * POST /api/verify-email/resend — PUBLIC.
 *
 * VERIFIED (v1.0.1): The endpoint is declared in routes/api.php
 * OUTSIDE the `auth:sanctum` group, and AuthController::
 * resendVerificationEmail validates `email` in the request body. It
 * does NOT authenticate a bearer token; it operates on the email
 * supplied. This corrects the initial delivery's assumption.
 *
 * Response: `{ success: true, message }` — no `data`.
 */
export function resendVerificationEmail(
  email: string,
): Promise<unknown> {
  return api.post<unknown>('/api/verify-email/resend', { email });
}