/*
 * =============================================================================
 * MASES Phase 2 UI — Application Bootstrap
 * =============================================================================
 *
 * File:      mase_app/src/core/bootstrap.ts
 * Layer:     Core (shared infrastructure)
 * Version:   1.0.1
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §6.6  Token storage policy (interim freeze)
 *              §8.5  Tenant-scoped cache invalidation
 *              §13   State architecture
 *              §13.5 Cross-store coordination
 *              §12.3 Request pipeline (headers, providers)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 12, Unit 12.4)
 * 1.0.1  — API client provider install added (Stage 15.12, Unit
 *          15.12-B). bootstrapApp() now installs the three provider
 *          setters exposed by @/core/api/client:
 *            · setAuthHeaderProvider     — bearer token
 *            · setTenantHeaderProvider   — X-Tenant-ID
 *            · setUnauthorizedHandler    — clears the auth store on 401
 *          Prior to this re-issue, every authenticated request was
 *          sent without those two headers and 401 responses did not
 *          clear the store. The API client (Phase 2 Unit 2.1)
 *          anticipated this step in its own header comment as
 *          "Phase 2 Unit 2.2". No other behaviour changed.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The single shared startup routine for both builds (workspace-entry
 * and portal-entry). Performs four things, in order:
 *
 *   1. Install the auth token storage adapter (interim §6.6 freeze:
 *      sessionStorage). Must run BEFORE any store is created, because
 *      the auth store reads its storage on setup.
 *
 *   2. Install the API client's three providers (bearer token, tenant
 *      id, unauthorized handler). The client evaluates them lazily on
 *      every request, so a login mid-session immediately affects
 *      subsequent requests. See the file header's §"API client wiring".
 *
 *   3. Wire the tenant → cache $onAction subscription (§8.5, §13.5).
 *
 *   4. Restore the session by calling the auth service's
 *      bootstrapSession() (Unit 12.3), which reads the stored token,
 *      fetches GET /api/user if a token is present, and hydrates the
 *      auth, tenant, and locale stores.
 *
 * The routine returns the session status so the entry point can react
 * (e.g. show an offline banner when the status is 'network-error').
 *
 * -----------------------------------------------------------------------------
 * What this file does NOT do
 * -----------------------------------------------------------------------------
 *   - It does NOT create the Vue app. That is the entry point's job.
 *   - It does NOT install Pinia or the router. The caller does, before
 *     calling bootstrapApp(pinia).
 *   - It does NOT mount the app. The caller calls app.mount() after
 *     this function resolves.
 *   - It does NOT fetch data beyond the auth bootstrap. The launcher
 *     list and notifications are fetched by their respective services
 *     at the point of use.
 *
 * -----------------------------------------------------------------------------
 * Caller contract
 * -----------------------------------------------------------------------------
 * The entry point must, in this order:
 *
 *   1. Create the Vue app.
 *   2. Create a Pinia instance.
 *   3. app.use(pinia).
 *   4. app.use(router) — the router is delivered as Unit 12.12, and
 *      both entry points (Unit 12.14) already install it.
 *   5. await bootstrapApp(pinia, { tokenStorage: 'session' }).
 *   6. app.mount('#app').
 *
 * Step 3 (app.use(pinia)) installs the plugin's active-pinia side
 * effect, but this file calls setActivePinia(pinia) itself as a
 * defensive measure.
 *
 * -----------------------------------------------------------------------------
 * API client wiring
 * -----------------------------------------------------------------------------
 * The API client (@/core/api/client, Phase 2 Unit 2.1) deliberately
 * does NOT import any Pinia store. That would create a circular
 * dependency (client → store → client) and couple the transport to the
 * state architecture. Instead, the client exposes three setters, and
 * this file installs them:
 *
 *   setAuthHeaderProvider(fn)
 *     fn() returns the current bearer token or null. Wired to
 *     useAuthStore(pinia).token. Evaluated fresh on every request, so
 *     a logout immediately stops sending the token.
 *
 *   setTenantHeaderProvider(fn)
 *     fn() returns the active tenant id or null. Wired to
 *     useTenantStore(pinia).effectiveTenantId, which falls back to the
 *     user's default tenant when the user has not switched (Freeze
 *     §8.2). When null, the client omits X-Tenant-ID entirely and lets
 *     the backend fall back to the user's default.
 *
 *   setUnauthorizedHandler(fn)
 *     fn() is invoked on any 401 response, AFTER the error is
 *     normalized and BEFORE the promise rejects. Wired to
 *     useAuthStore(pinia).clearSession(). The client does NOT navigate
 *     on 401 — the store change triggers the router guard on the next
 *     navigation, which redirects to /login.
 *
 * All three providers are plain closures over the Pinia instance. They
 * are not reactive; the client reads them fresh on every request, and
 * the underlying stores' getters are the reactive surface.
 *
 * -----------------------------------------------------------------------------
 * Cross-store coordination (§13.5)
 * -----------------------------------------------------------------------------
 * Two coordination paths exist in the codebase:
 *
 *   - tenant → launcher + notifications  :  wired HERE via $onAction.
 *     When the user switches tenants (or clears the active tenant),
 *     tenant-scoped caches are invalidated. This has no other explicit
 *     mechanism, so $onAction is necessary.
 *
 *   - auth → tenant + locale + launcher + notifications  :  wired in
 *     @/features/auth/service.ts's clearAllStores(). This is the
 *     explicit-store-action mechanism that §13.5 also sanctions, and
 *     it is authoritative for logout. Wiring a $onAction subscription
 *     for auth.clearSession would duplicate that work.
 *
 * The unauthorized handler installed above calls only
 * authStore.clearSession(), NOT clearAllStores(). The remaining stores
 * are re-hydrated on the next successful login flow (the auth service
 * calls tenantStore.reconcileWithUser() and
 * localeStore.hydrateFromUser() after a fresh GET /api/user). This is
 * deliberate: a mid-session 401 is not a logout, and forcibly resetting
 * the tenant and locale stores mid-flight could surprise the login
 * page's own initialization.
 *
 * -----------------------------------------------------------------------------
 * Token storage policy (§6.6 interim freeze)
 * -----------------------------------------------------------------------------
 * §6.6 lists three candidates (in-memory, sessionStorage, localStorage
 * — the last prohibited by default) and defers the final decision until
 * refresh-from-cold-load is verified against a running backend. Since
 * that verification cannot happen from within a chat, the interim
 * freeze is sessionStorage.
 *
 * The choice is expressed at the CALL SITE, not baked into this file:
 * the entry points pass { tokenStorage: 'session' }. Tests that wish to
 * use a custom adapter install it before calling this function and pass
 * no options. A future switch to in-memory (candidate A) is a one-word
 * change at each entry point, with no change to this file or to the
 * auth store.
 *
 * -----------------------------------------------------------------------------
 * No hardcoded user-facing string
 * -----------------------------------------------------------------------------
 * This file produces no user-facing text.
 *
 * -----------------------------------------------------------------------------
 * No store writes
 * -----------------------------------------------------------------------------
 * This file installs providers that READ store state (the auth token
 * and the effective tenant id) and invokes one store ACTION in the
 * unauthorized handler (authStore.clearSession()). It does not call
 * arbitrary mutations. §13.5 compliant.
 *
 * -----------------------------------------------------------------------------
 * No props, no emits, no slots
 * -----------------------------------------------------------------------------
 * This is a plain TypeScript module, not a Vue component. It has no
 * template, no component instance, no reactive surface of its own.
 * =============================================================================
 */

import { setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';

import {
  setAuthTokenStorage,
  useAuthStore,
} from '@/stores/auth';
import type { AuthTokenStorage } from '@/stores/auth';
import { useTenantStore } from '@/stores/tenant';
import { useLauncherStore } from '@/stores/launcher';
import { useNotificationsStore } from '@/stores/notifications';

import {
  setAuthHeaderProvider,
  setTenantHeaderProvider,
  setUnauthorizedHandler,
} from '@/core/api/client';

import { bootstrapSession } from '@/features/auth/service';
import type { BootstrapResult as SessionBootstrapResult } from '@/features/auth/service';

// =============================================================================
// Public types
// =============================================================================

/**
 * Options for bootstrapApp().
 */
export interface BootstrapOptions {
  /**
   * The token storage strategy to install before any store is created.
   *
   *   undefined  →  do not install any adapter; the store keeps
   *                 whatever it currently has (its in-memory default,
   *                 or a caller-installed adapter)
   *   'session'  →  install the sessionStorage adapter (interim §6.6
   *                 freeze); this is what both production entry points
   *                 pass
   *   'memory'   →  install nothing; the store's default in-memory
   *                 storage remains in effect; this is the recommended
   *                 option for tests
   */
  readonly tokenStorage?: 'session' | 'memory';
}

/**
 * The result of bootstrapApp().
 */
export interface AppBootstrapResult {
  /**
   * The session status returned by the auth service's
   * bootstrapSession() (Unit 12.3).
   *
   *   'no-token'       — no stored token; the user is unauthenticated
   *   'restored'       — token valid; stores hydrated
   *   'invalidated'    — token rejected (401); stores cleared
   *   'network-error'  — the API was unreachable; token preserved
   */
  readonly session: SessionBootstrapResult;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Bootstrap the application. See the file header comment §"Purpose" and
 * §"Caller contract".
 *
 * Does not throw on auth-bootstrap failure — the result's `session`
 * field reports what happened. Non-auth failures (a bug in the
 * storage adapter, a circular store dependency introduced by a future
 * change) are programming errors and are allowed to propagate, so the
 * app fails loudly during development rather than mounting in a
 * corrupted state.
 */
export async function bootstrapApp(
  pinia: Pinia,
  options: BootstrapOptions = {},
): Promise<AppBootstrapResult> {
  /*
   * Order matters — see the file header comment §"Purpose".
   *
   *   setActivePinia       — so every subsequent useXxxStore() (including
   *                          the ones inside bootstrapSession and
   *                          inside the API client provider closures)
   *                          resolves against this Pinia instance.
   *   installAuthToken…    — before any store is created; the auth store
   *                          reads its storage on setup.
   *   installApiClient…    — installs the three lazy provider closures.
   *                          No store is created by this call; the
   *                          closures resolve stores on first use.
   *   wireStoreCoord…      — registers $onAction listeners; creates the
   *                          tenant store as a side effect.
   *   bootstrapSession     — reads the token, fetches the user, and
   *                          hydrates the stores.
   */
  setActivePinia(pinia);

  installAuthTokenStorage(options.tokenStorage);
  installApiClientProviders(pinia);
  wireStoreCoordinations(pinia);

  const session = await bootstrapSession();

  return { session };
}

// =============================================================================
// Private helpers
// =============================================================================

/**
 * Install the auth token storage adapter, if the caller requested one.
 *
 * See the file header comment §"Token storage policy". When `kind` is
 * undefined or 'memory', no adapter is installed and the store keeps
 * its default (in-memory) storage.
 */
function installAuthTokenStorage(
  kind: 'session' | 'memory' | undefined,
): void {
  if (kind === undefined || kind === 'memory') {
    return;
  }
  setAuthTokenStorage(createSessionStorageAuthTokenStorage());
}

/**
 * Install the three API client providers.
 *
 * The providers are plain closures over the Pinia instance. They are
 * evaluated lazily by the client, on every request — see the file
 * header comment §"API client wiring".
 *
 * No store is created by this function. The closures resolve their
 * stores the first time they are invoked, which is on the first HTTP
 * request that flows through the client. By that time,
 * installAuthTokenStorage() has already run (it is called immediately
 * before this function), so the auth store reads its storage adapter
 * correctly on first setup.
 */
function installApiClientProviders(pinia: Pinia): void {
  /*
   * Bearer token: the client attaches `Authorization: Bearer <token>`
   * when this returns non-null.
   */
  setAuthHeaderProvider(() => useAuthStore(pinia).token);

  /*
   * Tenant id: the client attaches `X-Tenant-ID: <id>` when this
   * returns non-null. `effectiveTenantId` falls back to the user's
   * default tenant (Freeze §8.2) so a user who has not switched is
   * still correctly scoped.
   */
  setTenantHeaderProvider(() => useTenantStore(pinia).effectiveTenantId);

  /*
   * Unauthorized handler: invoked on any 401 response, after
   * normalization and before the promise rejects. Clears the auth
   * store. The router guard reacts on the next navigation. The client
   * does not navigate on 401.
   *
   * Only `clearSession()` is invoked — not the broader clearAllStores()
   * cascade from the auth service. See the file header comment
   * §"Cross-store coordination" for the rationale.
   */
  setUnauthorizedHandler(() => useAuthStore(pinia).clearSession());
}

/**
 * The sessionStorage-backed token storage. Used for the interim §6.6
 * freeze. This is the ONLY storage adapter installed by the bootstrap;
 * the tenant and locale stores keep their default localStorage
 * adapters, matching the frozen §13.4 persistence rules (only the token
 * is affected by the §6.6 deferral).
 *
 * The storage key is namespaced (`mases.auth_token`) so it cannot
 * collide with a host page's own sessionStorage usage.
 */
function createSessionStorageAuthTokenStorage(): AuthTokenStorage {
  const KEY = 'mases.auth_token';

  return {
    get(): string | null {
      return sessionStorage.getItem(KEY);
    },
    set(token: string): void {
      sessionStorage.setItem(KEY, token);
    },
    clear(): void {
      sessionStorage.removeItem(KEY);
    },
  };
}

/**
 * Wire the $onAction subscriptions that constitute cross-store
 * coordination. See the file header comment §"Cross-store coordination
 * (§13.5)".
 *
 * Only the tenant → cache invalidation path is wired here; the
 * auth-cascade path is handled by the service (Unit 12.3).
 *
 * The subscription lives for the application's lifetime. For an SPA
 * whose shell never unmounts, no unsubscribe is needed; the returned
 * cleanup function is intentionally not retained.
 */
function wireStoreCoordinations(pinia: Pinia): void {
  useTenantStore(pinia).$onAction(({ name }) => {
    if (name === 'setActiveTenant' || name === 'clearActiveTenant') {
      /*
       * Tenant-scoped caches. Both stores hold data whose validity is
       * bound to the active tenant:
       *   - the launcher list (accessible applications per tenant)
       *   - the notifications list (per-user, per-tenant)
       */
      useLauncherStore(pinia).clear();
      useNotificationsStore(pinia).clear();
    }
  });
}