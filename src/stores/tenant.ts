/*
 * =============================================================================
 * MASES Phase 2 UI — useTenantStore
 * =============================================================================
 *
 * File:      mase_app/src/stores/tenant.ts
 * Layer:     Stores (Architecture Freeze §13.2)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §8    Tenancy contract
 *              §13   State architecture
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Owns the active tenant context for the authenticated session:
 *   - the tenant id currently in effect (or null when the user has not
 *     switched and the backend should fall back to the user's default)
 *   - the list of tenants the user may access (read from the auth store)
 *   - the reconciliation logic that validates the persisted id against
 *     the freshly-loaded user summary
 *
 * The API client (Stage 4 services) reads `effectiveTenantId` to build
 * the X-Tenant-ID header (§8.2). Nothing else in the frontend reads or
 * writes the tenant id.
 *
 * -----------------------------------------------------------------------------
 * What the store does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not call the API. Coordination with GET /api/user is the
 *     auth service's responsibility (Stage 12).
 *   - It does not mutate other stores. Cross-store cache invalidation
 *     is set up externally at app bootstrap via $onAction (§13.5).
 *   - It does not own the list of available tenants. That list is a
 *     property of the user summary and lives in the auth store. This
 *     store reads it (§13.5 permits reads; forbids cross-store
 *     mutations).
 *
 * -----------------------------------------------------------------------------
 * Storage (Architecture Freeze §13.4)
 * -----------------------------------------------------------------------------
 * The active tenant id is persisted under `mases.tenant_id` in
 * localStorage (§13.4, frozen). The storage is abstracted behind
 * TenantIdStorage so tests can isolate state without touching the
 * browser's global localStorage. The production default is localStorage.
 *
 * -----------------------------------------------------------------------------
 * Bootstrap sequence (Stage 12 responsibility, documented here so the
 * reviewer can verify the wiring)
 * -----------------------------------------------------------------------------
 *   1. setTenantIdStorage(...)       optional
 *   2. GET /api/user succeeds
 *   3. authStore.setSession({ token, user })
 *   4. tenantStore.reconcileWithUser()   ← this store's validation step
 *   5. localeStore.hydrateFromUser()     (Unit 11.6)
 *   6. launcherStore.fetch()             (Unit 11.7)
 *   7. notificationsStore.fetch()        (Unit 11.8)
 *
 * Plus the $onAction subscription (Stage 12) that clears tenant-scoped
 * caches when setActiveTenant or clearActiveTenant fires.
 *
 * -----------------------------------------------------------------------------
 * Permission to read from the auth store
 * -----------------------------------------------------------------------------
 * §13.5 forbids stores calling each other's MUTATIONS. Reading another
 * store's state is permitted. This store reads authStore.tenants and
 * authStore.defaultTenantId via computed getters. It never calls
 * authStore.setSession, setUser, or clearSession.
 * =============================================================================
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import type { AuthTenantSummary } from './auth';

// =============================================================================
// Storage abstraction (§13.4 default = localStorage; abstraction for tests)
// =============================================================================

/**
 * The pluggable storage backend for the active tenant id.
 */
export interface TenantIdStorage {
  get(): number | null;
  set(id: number): void;
  clear(): void;
}

/**
 * The production default. Reads and writes `mases.tenant_id` in
 * localStorage, matching §13.4.
 *
 * Parses defensively: a corrupted value (non-numeric, negative, zero,
 * or NaN) is treated as absent. The store then falls back to the
 * user's default tenant, which is the correct recovery behavior.
 */
function createLocalStorageTenantIdStorage(): TenantIdStorage {
  const KEY = 'mases.tenant_id';

  return {
    get(): number | null {
      const raw = localStorage.getItem(KEY);
      if (raw === null) return null;
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) return null;
      return parsed;
    },
    set(id: number): void {
      localStorage.setItem(KEY, String(id));
    },
    clear(): void {
      localStorage.removeItem(KEY);
    },
  };
}

/**
 * An in-memory storage factory. Used by tests. Not used in production.
 */
export function createInMemoryTenantIdStorage(): TenantIdStorage {
  let stored: number | null = null;
  return {
    get(): number | null {
      return stored;
    },
    set(id: number): void {
      stored = id;
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
let activeStorage: TenantIdStorage = createLocalStorageTenantIdStorage();

/**
 * Install a custom tenant id storage backend. Must be called BEFORE
 * the tenant store is first used. Intended for tests; production uses
 * the default localStorage backend.
 */
export function setTenantIdStorage(next: TenantIdStorage): void {
  activeStorage = next;
}

/**
 * Restore the default localStorage storage. Intended for tests, which
 * must not leak an id between cases.
 */
export function resetTenantIdStorage(): void {
  activeStorage = createLocalStorageTenantIdStorage();
}

// =============================================================================
// The store
// =============================================================================

export const useTenantStore = defineStore('tenant', () => {
  // ---------------------------------------------------------------------------
  // Private state — not returned from setup, so it cannot be mutated from
  // outside. See the file header comment.
  // ---------------------------------------------------------------------------
  const _activeTenantId = ref<number | null>(activeStorage.get());

  // ---------------------------------------------------------------------------
  // Cross-store reads (permitted; see file header)
  // ---------------------------------------------------------------------------
  const _availableTenants = computed<readonly AuthTenantSummary[]>(
    () => useAuthStore().tenants,
  );

  const _defaultTenantId = computed<number | null>(
    () => useAuthStore().defaultTenantId,
  );

  // ---------------------------------------------------------------------------
  // Public getters
  // ---------------------------------------------------------------------------

  /**
   * The tenant id the user has explicitly switched to, or null when the
   * user has not switched. Consumers that want the id actually sent on
   * the wire should read `effectiveTenantId`.
   */
  const activeTenantId = computed<number | null>(() => _activeTenantId.value);

  /**
   * The full tenant summary for the currently active tenant, or null
   * when the user has not switched (or the persisted id no longer
   * matches an accessible tenant).
   */
  const activeTenant = computed<AuthTenantSummary | null>(() => {
    const id = _activeTenantId.value;
    if (id === null) return null;
    return (
      _availableTenants.value.find((t) => t.id === id) ?? null
    );
  });

  /**
   * The list of tenants the current user may access. Read from the auth
   * store (see file header §"Permission to read from the auth store").
   */
  const availableTenants = computed<readonly AuthTenantSummary[]>(
    () => _availableTenants.value,
  );

  /**
   * True when the user's tenant selection set contains more than one
   * tenant. The shell uses this to decide whether to render the tenant
   * switcher at all (§8.5).
   */
  const hasMultipleTenants = computed<boolean>(
    () => _availableTenants.value.length > 1,
  );

  /**
   * The tenant id that should be attached to outgoing requests:
   *   - the active tenant if the user has switched, else
   *   - the user's default tenant id, else
   *   - null (the backend will resolve from config; §8.2)
   *
   * See the response preamble §"Design note — effectiveTenantId vs
   * activeTenantId".
   */
  const effectiveTenantId = computed<number | null>(
    () => _activeTenantId.value ?? _defaultTenantId.value,
  );

  /**
   * True when the persisted active tenant id is still valid against the
   * current user's available tenants. A false value after login means
   * `reconcileWithUser()` has not yet been called — or has been called
   * and found the persisted id stale.
   */
  const isActiveTenantValid = computed<boolean>(() => {
    const id = _activeTenantId.value;
    if (id === null) return true;
    return _availableTenants.value.some((t) => t.id === id);
  });

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Set the active tenant. The id is validated against the current
   * user's available tenants. Returns true when the tenant was found
   * and set, false otherwise (in which case the store is unchanged).
   *
   * Fires a Pinia action, which the app bootstrap listens to via
   * $onAction in order to invalidate tenant-scoped caches (§8.5,
   * §13.5). See the response preamble §"Design note — why there is no
   * cross-store invalidation call".
   */
  function setActiveTenant(id: number): boolean {
    const found = _availableTenants.value.some((t) => t.id === id);
    if (!found) return false;
    _activeTenantId.value = id;
    activeStorage.set(id);
    return true;
  }

  /**
   * Clear the active tenant, returning the session to the user's
   * default tenant. Fires a Pinia action (see setActiveTenant).
   */
  function clearActiveTenant(): void {
    _activeTenantId.value = null;
    activeStorage.clear();
  }

  /**
   * Validate the persisted active tenant against the freshly-loaded
   * user summary. Called by the auth service (Stage 12) immediately
   * after authStore.setSession() on every cold start and login.
   *
   * Behavior:
   *   - If the persisted id is still in user.tenants[], it is kept.
   *   - Otherwise, the store falls back to user.default_tenant_id if
   *     that value is present in user.tenants[], else to the first
   *     available tenant, else to null (no accessible tenants).
   *
   * A fallback that changes the active id fires setActiveTenant (or
   * clearActiveTenant), so the $onAction subscription invalidates
   * caches as it would for an explicit switch. A fallback that does
   * not change the active id is a no-op — the store does not fire a
   * cache-invalidating action for a value the user did not touch.
   */
  function reconcileWithUser(): void {
    const tenants = _availableTenants.value;

    // Case: no tenants available. Clear any persisted id.
    if (tenants.length === 0) {
      if (_activeTenantId.value !== null) {
        clearActiveTenant();
      }
      return;
    }

    // Case: persisted id is still valid. Keep it.
    const currentId = _activeTenantId.value;
    if (currentId !== null && tenants.some((t) => t.id === currentId)) {
      return;
    }

    // Case: persisted id is stale (or null). Fall back.
    const fallbackId =
      _defaultTenantId.value !== null &&
      tenants.some((t) => t.id === _defaultTenantId.value)
        ? _defaultTenantId.value
        : tenants[0].id;

    /*
     * Use setActiveTenant so the $onAction subscription fires. Fall
     * through to activeStorage via setActiveTenant — do not write
     * storage directly here.
     */
    setActiveTenant(fallbackId);
  }

  /**
   * Reset the store to its pre-login state. Clears the active tenant
   * and the persisted id. Called by the auth service on logout.
   */
  function reset(): void {
    _activeTenantId.value = null;
    activeStorage.clear();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    // read-only getters
    activeTenantId,
    activeTenant,
    availableTenants,
    hasMultipleTenants,
    effectiveTenantId,
    isActiveTenantValid,

    // mutations
    setActiveTenant,
    clearActiveTenant,
    reconcileWithUser,
    reset,
  };
});