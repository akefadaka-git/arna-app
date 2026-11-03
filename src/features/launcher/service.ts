/*
 * =============================================================================
 * MASES Phase 2 UI — Launcher Feature Service
 * =============================================================================
 *
 * File:      mase_app/src/features/launcher/service.ts
 * Layer:     Features (Launcher surface)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §13.3  Feature state lives in the feature module
 *              §13.5  Stores do not perform I/O
 *              §20.1  GET /api/launcher contract (backend pending)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The launcher surface's data layer. This is the module the launcher
 * store's own header references as "the launcher service (Stage 13)" —
 * the code that calls GET /api/launcher and drives the store via
 * setApplications(). It was not delivered with the store and is
 * delivered here.
 *
 * It provides exactly two things:
 *
 *   1. fetchLauncherApplications()
 *        Calls the registered GET /api/launcher endpoint, receives the
 *        launcher catalogue, and installs the result in useLauncherStore.
 *        HTTP errors, including 404, propagate to the route's error state.
 *
 *   2. useLauncherFetchState()
 *        A composable returning the two refs the launcher route passes
 *        into LauncherGrid as :loading and :error, plus the two async
 *        actions the route wires to mount and to the grid's @retry
 *        emit: ensureLoaded() and retry().
 *
 * The store does NOT own loading or error. Its own header is explicit
 * about this: "It does not own loading state. That is a per-call
 * concern assigned to the useApiRequest composable (§25.1). If the
 * store also held an isLoading flag, two sources of truth would
 * compete." This module implements that decision without introducing
 * a general useApiRequest composable — the one here is launcher-
 * specific and knows about ensureLoaded/retry semantics and the
 * store's isStale / hasFetched getters.
 *
 * -----------------------------------------------------------------------------
 * What this module does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not own the launcher list. That is the store's
 *     responsibility (mase_app/src/stores/launcher.ts).
 *   - It does not own the labels. Those are in
 *     mase_app/src/router/launcher-labels.ts.
 *   - It does not render. LauncherGrid.vue and LauncherTile.vue own
 *     the presentation.
 *   - It does not suppress or reinterpret API errors. Every failure
 *     propagates as a NormalizedApiError, unchanged, matching the
 *     convention established by other feature services.
 *   - It does not read the auth store. Which applications a given
 *     user may access is decided server-side; the frontend renders
 *     whatever the endpoint returns.
 *   - It does not fabricate live data. If the endpoint is absent or
 *     returns an empty list, the store records "we fetched, and there
 *     is nothing to show" — the grid renders its empty state.
 *
 * -----------------------------------------------------------------------------
 * Endpoint contract
 * -----------------------------------------------------------------------------
 * GET /api/launcher is registered in the API's tenant-scoped authenticated
 * route group. A successful empty catalogue is HTTP 200 with an empty array.
 * A 404 indicates a route/deployment/configuration defect and must remain
 * visible through the composable's error state; it must never be converted
 * into a successful empty catalogue.
 *
 * =============================================================================
 */

import { ref } from 'vue';
import type { Ref } from 'vue';

import { api } from '@/core/api/client';
import { useLauncherStore } from '@/stores/launcher';
import type { LauncherApplication } from '@/stores/launcher';

// =============================================================================
// Public types
// =============================================================================

/**
 * The composable's public interface. Every field is read-only from the
 * consumer's perspective; the composable's own actions drive the
 * transitions.
 */
export interface LauncherFetchState {
  /**
   * True while a fetch is in flight. The route passes this to
   * LauncherGrid's :loading prop; the grid derives its loading state
   * from it (a truthy value short-circuits the grid's state machine
   * to 'loading').
   */
  readonly loading: Ref<boolean>;

  /**
   * The most recent fetch error, or null.
   *
   * The route passes this to LauncherGrid's :error prop. LauncherGrid
   * treats any value that is neither undefined nor null as the error
   * state; this module always sets it to null between attempts and on
   * any successful outcome (including the 404-as-empty outcome).
   *
   * The declared type is unknown | null rather than
   * NormalizedApiError | null because the composable does not need to
   * inspect the error to decide what to do with it — it either clears
   * it or stores it. Consumers that need to read the error's category
   * (e.g. for a future analytics hook) narrow it themselves.
   */
  readonly error: Ref<unknown | null>;

  /**
   * Fetch the launcher applications if the store's cache is missing
   * or stale. No-op when the cache is fresh.
   *
   * Called once on the launcher route's mount. If the store already
   * holds a fresh list — e.g. the user navigated away and back within
   * the TTL window — the fetch is skipped, and the grid renders
   * immediately from the cache.
   */
  readonly ensureLoaded: () => Promise<void>;

  /**
   * Force a fetch regardless of cache freshness. Bound to
   * LauncherGrid's @retry emit.
   *
   * Distinct from ensureLoaded: retry() always fetches, because it is
   * the user's explicit request to re-attempt after they have seen
   * the error state.
   */
  readonly retry: () => Promise<void>;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch the launcher applications and install them in the store.
 *
 * On a successful response (200): calls setApplications(apps).
 * On any API/network error:       rethrows the NormalizedApiError
 *                                 unchanged.
 *
 * Does not read or write loading/error refs — those belong to the
 * composable below. Callers that want the full state use the
 * composable; a fire-and-forget refresh can call this function
 * directly.
 */
export async function fetchLauncherApplications(): Promise<void> {
  const store = useLauncherStore();

  const apps = await api.get<readonly LauncherApplication[]>(
    '/api/launcher',
  );
  store.setApplications(apps);
}

/**
 * The launcher surface's fetch-state composable.
 *
 * Called once by the launcher route (see Unit L-7). Returns the two
 * refs the grid consumes as props, plus the two async actions the
 * route wires to mount and to the grid's @retry emit.
 *
 * The composable is a plain function, not a Pinia store. It creates
 * fresh refs each time it is called; the store itself is a Pinia
 * singleton, so the refs describe the state of one fetch attempt
 * against the shared store.
 */
export function useLauncherFetchState(): LauncherFetchState {
  const store = useLauncherStore();

  const loading = ref<boolean>(false);
  const error = ref<unknown | null>(null);

  /**
   * The shared fetch routine. Sets loading true, clears error, calls
   * the fetch function, and rolls both refs on completion. Every
   * other action delegates here so the "clear error before fetch"
   * and "clear loading after fetch" rules are expressed exactly
   * once.
   *
   * The finally block guarantees loading is cleared even when the
   * fetch throws — the error ref holds the throw, and the grid
   * renders the error state, not a stuck spinner.
   */
  async function doFetch(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await fetchLauncherApplications();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded(): Promise<void> {
    /*
     * Cache freshness is the store's decision, not the composable's.
     * `isStale` returns true when the cache is missing or has
     * exceeded LAUNCHER_CACHE_TTL_MS; `hasFetched` distinguishes
     * "never fetched" from "fetched and got zero".
     *
     * The two-condition guard is redundant in practice — isStale is
     * true whenever lastFetchAt is null, so !hasFetched implies
     * isStale — but it expresses the intent explicitly and survives
     * a future change to the store's staleness rule that might make
     * the two conditions diverge.
     */
    if (store.hasFetched && !store.isStale) {
      return;
    }
    await doFetch();
  }

  async function retry(): Promise<void> {
    await doFetch();
  }

  return { loading, error, ensureLoaded, retry };
}

// =============================================================================
// Internal helpers
// =============================================================================

