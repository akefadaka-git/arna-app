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
 *        Calls GET /api/launcher, receives the §20.1 shape, and installs
 *        the result in useLauncherStore. Treats the "endpoint not yet
 *        deployed" 404 as an empty list, not as a user-facing error —
 *        see §"The endpoint is not yet deployed" below.
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
 *   - It does not classify errors beyond the 404 case. Every other
 *     failure propagates as a NormalizedApiError, unchanged, matching
 *     the convention established by features/files/service.ts and
 *     features/shareholders/service.ts.
 *   - It does not read the auth store. Which applications a given
 *     user may access is decided server-side; the frontend renders
 *     whatever the endpoint returns.
 *   - It does not fabricate live data. If the endpoint is absent or
 *     returns an empty list, the store records "we fetched, and there
 *     is nothing to show" — the grid renders its empty state.
 *
 * -----------------------------------------------------------------------------
 * The endpoint is not yet deployed — interim behavior
 * -----------------------------------------------------------------------------
 * The launcher store's header records GET /api/launcher as a Phase 2
 * backend task. It does not exist yet. This module does not pretend
 * otherwise; it handles the "not yet deployed" reality so that the
 * launcher page renders a coherent state today and requires zero
 * changes when the endpoint lands.
 *
 * The handling is:
 *
 *     HTTP 404 from GET /api/launcher   →  the empty state
 *     Any other error                   →  the error state
 *
 * A 404 is treated as "the endpoint is not deployed, so there are no
 * applications to show" rather than as a user-facing failure. This is
 * the honest presentation: the user is not experiencing a broken
 * fetch; they are experiencing a deployment in which no applications
 * are yet reachable through the launcher.
 *
 * When the endpoint is deployed and correctly returns an empty list,
 * the same empty state renders — no code change required.
 * When the endpoint is deployed and returns applications, the grid
 * renders them — no code change required.
 *
 * On 404, the store is stamped via setApplications([]), not via
 * clear(). The distinction matters and is documented in the store's
 * header: setApplications([]) records "we fetched, and there is
 * nothing to show"; clear() records "we have not fetched". The former
 * is what happened — the fetch succeeded and there is nothing.
 *
 * -----------------------------------------------------------------------------
 * The GET /api/launcher contract
 * -----------------------------------------------------------------------------
 * Documented in the launcher store's header (§20.1). Reproduced here
 * so a reader does not need to open two files:
 *
 *     GET /api/launcher
 *       → 200 { success: true, data: [
 *           { slug, name_am, name_en, domain,
 *             description_am, description_en, is_active }
 *         ]}
 *
 * The client's api.get<readonly LauncherApplication[]>('/api/launcher')
 * unwraps the envelope's `data` field and returns the array. The
 * unwrapped value is what this module passes to the store.
 *
 * -----------------------------------------------------------------------------
 * Why loading/error are refs here and not in the store
 * -----------------------------------------------------------------------------
 * Per §13.5, stores do not perform I/O; and per the store's own header,
 * loading state is a per-call concern, not store state. The
 * composable below owns the two refs and exposes them so the route can
 * bind them into the grid. The refs are created fresh each time the
 * composable is called, so if a future CR ever mounts two launcher
 * surfaces (it should not, but the shape permits it), the two do not
 * share fetch state. The Pinia store remains the single source of
 * truth for the list itself.
 *
 * -----------------------------------------------------------------------------
 * Why retry() always fetches but ensureLoaded() may skip
 * -----------------------------------------------------------------------------
 * ensureLoaded() consults the store's cache freshness. It is what the
 * route calls on mount, and it is correct to skip a fetch when the
 * cache is fresh — the user is being shown data that is already
 * loaded. retry(), by contrast, is bound to the grid's @retry emit and
 * is what the user gets after an error state. It always fetches,
 * because the user's action is an explicit "try again".
 *
 * -----------------------------------------------------------------------------
 * No hardcoded user-facing string
 * -----------------------------------------------------------------------------
 * This module produces no user-facing text. Every string the launcher
 * renders comes from router/launcher-labels.ts and is forwarded by the
 * route to LauncherGrid as its labels prop. The Amharic-first policy
 * therefore does not require any change in this file — the labels this
 * module's data flows into are already Amharic.
 *
 * -----------------------------------------------------------------------------
 * Production readiness
 * -----------------------------------------------------------------------------
 * Browser-only at runtime: the module touches the DOM only through
 * @/core/api/client (which itself requires document.cookie for the
 * XSRF handshake) and reads no globals of its own. Under Vitest+jsdom
 * the module loads without issue; the fetch itself is mockable at the
 * api layer, matching how features/files/service.ts and
 * features/shareholders/service.ts are tested.
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
 * On a 404:                       calls setApplications([]).
 * On any other error:             rethrows the NormalizedApiError
 *                                 unchanged.
 *
 * Does not read or write loading/error refs — those belong to the
 * composable below. Callers that want the full state use the
 * composable; a fire-and-forget refresh can call this function
 * directly.
 */
export async function fetchLauncherApplications(): Promise<void> {
  const store = useLauncherStore();

  try {
    const apps = await api.get<readonly LauncherApplication[]>(
      '/api/launcher',
    );
    store.setApplications(apps);
  } catch (err) {
    if (isNotFoundError(err)) {
      /*
       * The endpoint is not yet deployed. Treat this as an empty
       * list, not as an error. See the file header §"The endpoint is
       * not yet deployed".
       *
       * setApplications([]) — not clear() — because the semantics
       * here are "we tried and there is nothing", not "we have not
       * tried". The two are distinguished by the store's own
       * docblock.
       */
      store.setApplications([]);
      return;
    }
    /*
     * Any other failure — network, 5xx, timeout — propagates
     * unchanged. The caller decides how to surface it. The
     * composable below is the standard caller and stores the error
     * in its error ref for the grid to render.
     */
    throw err;
  }
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

/**
 * Duck-typed check for a NormalizedApiError with category 'not-found'.
 *
 * Deliberately not `err instanceof NormalizedApiError`.
 *
 * The class is exported from @/core/api/client, but instanceof checks
 * are fragile under bundler chunk duplication — a class re-exported
 * into two code-split chunks has two distinct constructor identities
 * and an instanceof against one fails for instances of the other.
 *
 * The duck-typed check on the `category` field is what the
 * shareholders feature's page-level error classifiers already use (see
 * ShareholderDetailView.vue's isNotFoundError and ShareholderForm.vue's
 * isNotFoundError, both frozen). Following the same pattern here
 * keeps the codebase's error-classification approach uniform and
 * immune to the chunk-duplication hazard.
 *
 * The check is intentionally narrow: it accepts any object whose
 * `category` field is the literal string 'not-found'. It does not
 * require any other field to be present, because the caller only
 * cares about this one distinction. A future NormalizedApiError
 * category rename is a single grep in the frozen error-classifier
 * call sites.
 */
function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { category?: unknown }).category === 'not-found'
  );
}