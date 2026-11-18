/*
 * =============================================================================
 * CHANGE VERIFICATION — SSO fix
 * =============================================================================
 *
 * File:      mase_app/src/stores/auth.ts  (AMEND)
 * Unit:      isAuthenticated — no longer requires a bearer token
 * Delivery type:  Correction — a session-cookie-authenticated user is
 *                 now correctly considered authenticated.
 * Net lines:      +~35 docblock; +0 code lines (one expression changed).
 *
 * Before (v1.0.0):
 *   isAuthenticated required BOTH a token AND a user:
 *
 *     const isAuthenticated = computed<boolean>(
 *       () => _token.value !== null && _user.value !== null,
 *     );
 *
 *   The condition was correct under the assumption that bearer-token
 *   authentication is the only authentication mechanism. It breaks
 *   SSO: a visitor who lands on a sibling subdomain holding a valid
 *   Sanctum session cookie has no in-memory token (the token is not
 *   persisted across origins), so the getter returns false and the
 *   router guard redirects to /login — even though the API would
 *   happily authenticate the request via the session cookie.
 *
 * After (v1.1.0):
 *   isAuthenticated requires only a user:
 *
 *     const isAuthenticated = computed<boolean>(
 *       () => _user.value !== null,
 *     );
 *
 *   The user object is set only after the API confirmed the caller's
 *   identity — either by returning a fresh session on login /
 *   register, or by returning 200 from GET /api/user during
 *   bootstrapSession. Its presence IS the authoritative signal that
 *   the caller is authenticated.
 *
 *   The bearer token is now an OPTIONAL authentication credential,
 *   not a required one. Consumers that need to know whether a token
 *   is present (e.g. to render a "session managed via token" hint)
 *   read `token` directly; the token field itself is unchanged.
 *
 *   The auth header provider installed by bootstrap.ts continues to
 *   return `useAuthStore().token`, which is null on the SSO path.
 *   The client omits the Authorization header, and the session
 *   cookie carries the identity. This is the intended behavior.
 *
 * Files modified:  this file only
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — useAuthStore
 * =============================================================================
 *
 * File:      mase_app/src/stores/auth.ts
 * Layer:     Stores (Architecture Freeze §13.2)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §6    Authentication contract
 *              §7    Authorization contract
 *              §8.5  Tenant context (user.tenants[])
 *              §13   State architecture
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.1.0  — SSO fix. isAuthenticated now requires only a user, not a
 *          token+user pair. See the CR-block at the top of the file
 *          for the full rationale.
 *
 * 1.0.0  — initial delivery. The session model, the token storage
 *          abstraction, and the permission-check helpers.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The single source of truth for the authenticated user's session:
 * the bearer token, the user summary, the role list, and the permission
 * list. Read by:
 *
 *   - the API client (Stage 4 services) to build the Authorization header
 *   - PermissionGate (Unit 10.7) and router guards to gate UI and routes
 *   - the AppShell user menu, sidebar, and launcher to reflect identity
 *   - the locale store and tenant store to bootstrap from the user's
 *     saved locale and default tenant id
 *
 * -----------------------------------------------------------------------------
 * The store does NOT call the API
 * -----------------------------------------------------------------------------
 * Per Architecture Freeze §13.5, stores do not perform I/O. The auth
 * store exposes setters (setSession, setUser, clearSession). The auth
 * service (Stage 12) calls the backend and drives the store.
 *
 * -----------------------------------------------------------------------------
 * Token storage policy (Architecture Freeze §6.6 / §13.4)
 * -----------------------------------------------------------------------------
 * §6.6 defers the persistence mechanism to Stage 12. This store takes
 * a storage ABSTRACTION (AuthTokenStorage) with an in-memory default.
 * Stage 12 will either confirm in-memory (candidate A of §6.6) or
 * install a sessionStorage adapter via setAuthTokenStorage() at app
 * bootstrap — WITHOUT touching this file.
 *
 * The store's public API does not change if the storage changes.
 *
 * Only the token is persisted; user data, roles, and permissions are
 * NOT persisted (§13.4). They are re-fetched from GET /api/user on
 * every authenticated page load.
 *
 * -----------------------------------------------------------------------------
 * Authentication credentials — token OR session cookie
 * -----------------------------------------------------------------------------
 * As of v1.1.0, this store treats TWO authentication credentials as
 * sufficient on their own:
 *
 *   1. A bearer token (set by setSession after login/register, or
 *      restored from the storage adapter on cold start).
 *
 *   2. A Sanctum session cookie (managed by the browser; never
 *      visible to this store). When a session cookie is present and
 *      valid, GET /api/user returns 200 without any Authorization
 *      header, and the auth service installs the user via setUser.
 *
 * The presence of a `user` object — set only after the API confirmed
 * the caller's identity — is therefore the authoritative signal that
 * the caller is authenticated. See the CR-block at the top of the
 * file for the full rationale on why `isAuthenticated` reads the
 * user and not the token.
 *
 * -----------------------------------------------------------------------------
 * Store id
 * -----------------------------------------------------------------------------
 * 'auth' — matches the id used by the temporary stub documented in the
 * handoff (Part 3.1). Replacing the stub with this file requires no
 * change at any call site, including PermissionGate (Unit 10.7).
 *
 * -----------------------------------------------------------------------------
 * The 60-permission vocabulary
 * -----------------------------------------------------------------------------
 * hasPermission(slug) accepts any string. It does NOT enforce that the
 * slug is in the 60-item vocabulary (Architecture Freeze §7.3). A typo
 * produces a negative check, which is the correct behavior: frontend
 * gating is UX only; the backend is the sole authorization authority
 * (§7.1, §7.2 point 4). The store does not maintain a copy of the
 * 60-slug list; doing so would create a second source of truth.
 *
 * -----------------------------------------------------------------------------
 * Private state, not exposed
 * -----------------------------------------------------------------------------
 * The token and the user are held in module-local refs (_token, _user)
 * that are NOT returned from the setup function. Consumers read them
 * through computed getters (token, user, isAuthenticated, userId, …)
 * and write them through actions (setSession, setUser, clearSession).
 * There is no direct mutation path from outside the store.
 * =============================================================================
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// =============================================================================
// Public types
// =============================================================================

/**
 * A tenant summary as returned within GET /api/user (Architecture
 * Freeze §8.5). Used by the tenant store to bootstrap and by the shell
 * tenant switcher (Stage 11) to render its menu.
 */
export interface AuthTenantSummary {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly is_active: boolean;
}

/**
 * The authenticated user summary, as returned by GET /api/user
 * (Architecture Freeze §6.3 for the login-shape fields, §7.2 for
 * roles/permissions, §8.5 for tenants).
 */
export interface AuthUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly locale: string;
  readonly default_tenant_id: number | null;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly tenants: readonly AuthTenantSummary[];
}

/**
 * The payload passed to setSession — the composition of a login
 * response's token + user.
 */
export interface SessionPayload {
  readonly token: string;
  readonly user: AuthUser;
}

// =============================================================================
// Token storage abstraction (Architecture Freeze §6.6 deferral, honored)
// =============================================================================

/**
 * The pluggable storage backend for the bearer token.
 *
 * The default is in-memory. Stage 12 will install a sessionStorage
 * adapter (or confirm in-memory) at app bootstrap.
 */
export interface AuthTokenStorage {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}

/**
 * A private in-memory storage factory. Each call returns a fresh
 * instance — no shared closure state between instances. This is what
 * makes resetAuthTokenStorage() safe for tests.
 */
function createInMemoryStorage(): AuthTokenStorage {
  let stored: string | null = null;
  return {
    get(): string | null {
      return stored;
    },
    set(token: string): void {
      stored = token;
    },
    clear(): void {
      stored = null;
    },
  };
}

/*
 * Module-level active storage. Read by the store's setup function on
 * first use, and by every action thereafter.
 */
let activeStorage: AuthTokenStorage = createInMemoryStorage();

/**
 * Install a custom token storage backend.
 *
 * Must be called BEFORE the auth store is first used (i.e. before the
 * first useAuthStore() call). Calling it afterwards has no effect on
 * the already-created store instance; it only affects future instances
 * in devtools-reset scenarios.
 *
 * Stage 12's bootstrap will call this once, at the top of main.ts,
 * before app.mount().
 */
export function setAuthTokenStorage(next: AuthTokenStorage): void {
  activeStorage = next;
}

/**
 * Restore the default in-memory storage.
 *
 * Intended for tests, which must not leak a token between cases. Do
 * not call this from production code.
 */
export function resetAuthTokenStorage(): void {
  activeStorage = createInMemoryStorage();
}

// =============================================================================
// The store
// =============================================================================

export const useAuthStore = defineStore('auth', () => {
  // ---------------------------------------------------------------------------
  // Private state
  //
  // Not returned from this setup function. See the file header comment
  // §"Private state, not exposed".
  // ---------------------------------------------------------------------------
  const _token = ref<string | null>(activeStorage.get());
  const _user = ref<AuthUser | null>(null);

  // ---------------------------------------------------------------------------
  // Public getters — read-only reflections of the private state
  // ---------------------------------------------------------------------------
  const token = computed<string | null>(() => _token.value);

  const user = computed<AuthUser | null>(() => _user.value);

  /**
   * Whether the caller is authenticated.
   *
   * True when a user object is present, regardless of whether a bearer
   * token is also present. The user object is set only after the API
   * confirmed the caller's identity — either by returning a fresh
   * session on login/register, or by returning 200 from GET /api/user
   * during bootstrapSession.
   *
   * A visitor authenticated only by a Sanctum session cookie (the
   * cross-subdomain SSO case) has a user object but no token. Before
   * v1.1.0, this state was incorrectly treated as unauthenticated. See
   * the CR-block at the top of the file for the full rationale.
   */
  const isAuthenticated = computed<boolean>(
    () => _user.value !== null,
  );

  const userId = computed<number | null>(() => _user.value?.id ?? null);

  const userName = computed<string | null>(() => _user.value?.name ?? null);

  const userEmail = computed<string | null>(() => _user.value?.email ?? null);

  const userLocale = computed<string | null>(
    () => _user.value?.locale ?? null,
  );

  const defaultTenantId = computed<number | null>(
    () => _user.value?.default_tenant_id ?? null,
  );

  const roles = computed<readonly string[]>(
    () => _user.value?.roles ?? [],
  );

  const permissions = computed<readonly string[]>(
    () => _user.value?.permissions ?? [],
  );

  const tenants = computed<readonly AuthTenantSummary[]>(
    () => _user.value?.tenants ?? [],
  );

  /*
   * Set-backed lookup caches. Recomputed only when the underlying
   * array identity changes (i.e. when setUser or setSession installs a
   * new user object). O(1) per check after the first access.
   */
  const _permissionSet = computed<ReadonlySet<string>>(
    () => new Set(permissions.value),
  );

  const _roleSet = computed<ReadonlySet<string>>(
    () => new Set(roles.value),
  );

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Install a complete session: token + user. Called by the auth
   * service after a successful POST /api/login, POST /api/register,
   * POST /api/token/refresh, or GET /api/user on cold start.
   */
  function setSession(payload: SessionPayload): void {
    _token.value = payload.token;
    _user.value = payload.user;
    activeStorage.set(payload.token);
  }

  /**
   * Replace the user summary without touching the token. Called by the
   * auth service after a successful GET /api/user when the token is
   * already in place (e.g. a fresh page load with a valid token in
   * storage).
   *
   * Also called on the SSO path (v1.1.0+) when GET /api/user succeeds
   * via the session cookie alone: the user is installed and the token
   * remains null. See the CR-block at the top of the file.
   */
  function setUser(nextUser: AuthUser): void {
    _user.value = nextUser;
  }

  /**
   * Clear the session entirely. Called on POST /api/logout, on any
   * 401-class response (§6.5 point 3), and on token revocation. Also
   * clears the token from the storage backend so a subsequent reload
   * does not attempt to use a stale token.
   */
  function clearSession(): void {
    _token.value = null;
    _user.value = null;
    activeStorage.clear();
  }

  // ---------------------------------------------------------------------------
  // Permission and role checks
  //
  // Presentation-only. Never a security boundary. See the file header
  // comment §"The 60-permission vocabulary".
  // ---------------------------------------------------------------------------

  function hasPermission(slug: string): boolean {
    return _permissionSet.value.has(slug);
  }

  function hasRole(slug: string): boolean {
    return _roleSet.value.has(slug);
  }

  /**
   * True when at least one of the supplied slugs is held by the user.
   * An empty array returns false — "no permissions required to allow"
   * is never what the caller means.
   */
  function hasAnyPermission(slugs: readonly string[]): boolean {
    if (slugs.length === 0) return false;
    for (const slug of slugs) {
      if (_permissionSet.value.has(slug)) return true;
    }
    return false;
  }

  /**
   * True when every supplied slug is held by the user. An empty array
   * returns true — vacuously, all zero requirements are satisfied.
   */
  function hasAllPermissions(slugs: readonly string[]): boolean {
    if (slugs.length === 0) return true;
    for (const slug of slugs) {
      if (!_permissionSet.value.has(slug)) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Public API — only what is returned here is visible to consumers
  // ---------------------------------------------------------------------------
  return {
    // read-only getters
    token,
    user,
    isAuthenticated,
    userId,
    userName,
    userEmail,
    userLocale,
    defaultTenantId,
    roles,
    permissions,
    tenants,

    // mutations
    setSession,
    setUser,
    clearSession,

    // checks
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
});