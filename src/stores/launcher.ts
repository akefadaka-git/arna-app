/*
 * =============================================================================
 * MASES Phase 2 UI — useLauncherStore
 * =============================================================================
 *
 * File:      mase_app/src/stores/launcher.ts
 * Layer:     Stores (Architecture Freeze §13.2)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §13   State architecture
 *              §20.1 GET /api/launcher contract
 *              §9.5  Bilingual name resolution (render-time, not here)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. A seven-field LauncherApplication
 *          interface, delivered before the GET /api/launcher endpoint
 *          existed, against the UI-defined response shape recorded in
 *          Architecture Freeze §20.1.
 *
 * 1.1.0  — LauncherApplication extended to match the endpoint's
 *          now-implemented response shape (Unit L-12):
 *
 *          · The interface gains four fields the endpoint (Unit L-11)
 *            returns but the frontend did not yet declare:
 *
 *              is_frontend_ready — boolean
 *              icon_key          — string | null
 *              category          — string | null
 *              display_order     — number
 *
 *          · No store method, getter, action, or constant changed.
 *            The four fields are read-only members of the type; the
 *            store passes the objects it receives from the endpoint
 *            through unchanged. setApplications, clear, the two
 *            TTL-bounded getters, and LAUNCHER_CACHE_TTL_MS all
 *            preserve their 1.0.0 definitions verbatim.
 *
 *          · The four fields are DORMANT until Unit L-13, which
 *            teaches LauncherTile to render them. Between this unit
 *            and L-13, the interface declares four fields no
 *            consumer reads — the same dormant-and-safe pattern used
 *            by L-10a (registry data extended before the seeder was
 *            taught to write it).
 *
 *          · MINOR version bump because the change is a backward-
 *            compatible additive extension of a type. Adding fields
 *            to an interface is MINOR when no consumer constructs
 *            instances of the type — and in this codebase no
 *            consumer does: LauncherApplication instances are
 *            always received from the API, never constructed
 *            locally. The only two files that name the type
 *            (features/launcher/service.ts and
 *            layouts/AppShell/LauncherTile/LauncherTile.vue) both
 *            receive their instances from the endpoint.
 *
 *          · The header's "The GET /api/launcher contract" section
 *            is rewritten to reflect the endpoint's existence. The
 *            previous revision's "DEPENDENCY MISSING" framing is
 *            preserved in the 1.0.0 entry above; the section itself
 *            now documents the endpoint as live.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * In-memory cache for the authenticated user's accessible-applications
 * list, as returned by GET /api/launcher. Owns exactly three things
 * (§13.2):
 *
 *   1. the accessible-applications list
 *   2. the last fetch time
 *   3. the cache TTL
 *
 * The shell's launcher grid reads `applications` to render the tile
 * grid. The launcher service (features/launcher/service.ts, Unit L-6)
 * reads `isStale` to decide whether to refetch.
 *
 * -----------------------------------------------------------------------------
 * What the store does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not call the API. §13.5 forbids I/O in stores. The
 *     launcher service (features/launcher/service.ts) calls
 *     GET /api/launcher and then invokes setApplications().
 *
 *   - It does not own loading state. That is a per-call concern
 *     assigned to the useLauncherFetchState composable in the
 *     launcher service. If the store also held an `isLoading` flag,
 *     two sources of truth would compete.
 *
 *   - It does not own error state. Same reasoning. The launcher
 *     route renders its own error UI from the composable; the store
 *     caches only successful data.
 *
 *   - It does not resolve bilingual display names. §9.5's
 *     locale-based pick is a render-time concern owned by the tile
 *     component.
 *
 *   - It does not persist across page reloads. §13.4 lists the
 *     launcher store as "in-memory only". A reload starts with an
 *     empty cache, which is correct for an authorization-derived
 *     list.
 *
 * -----------------------------------------------------------------------------
 * The GET /api/launcher contract
 * -----------------------------------------------------------------------------
 * Architecture Freeze §20.1 declared GET /api/launcher as a Phase 2
 * backend task. The endpoint is now implemented — see Unit L-11,
 * App\Http\Controllers\ApplicationController. Its response is:
 *
 *   { success: true, data: [
 *       {
 *         slug, name_am, name_en, description_am, description_en,
 *         domain, is_active,
 *         is_frontend_ready, icon_key, category, display_order
 *       }
 *   ]}
 *
 * The LauncherApplication interface below matches that shape field
 * for field. The four fields added in 1.1.0 (is_frontend_ready,
 * icon_key, category, display_order) correspond to the four columns
 * added to the `platform_applications` table by the L-9 migration
 * and populated by the seeder (Unit L-10b).
 *
 * The endpoint filters server-side: it returns only applications
 * whose is_active and is_frontend_ready are both true AND for which
 * the authenticated user holds the matching `app.{slug}.access`
 * permission. The store therefore receives an authorization-derived
 * list — it does not filter further, and no client-side permission
 * check is performed on the response.
 *
 * -----------------------------------------------------------------------------
 * Cache invalidation
 * -----------------------------------------------------------------------------
 * The launcher cache is tenant-scoped: applications accessible in one
 * tenant may differ from another. When the tenant changes
 * (tenantStore.setActiveTenant or clearActiveTenant fires), the app
 * bootstrap clears this store via $onAction — see Architecture Freeze
 * §13.5 and src/core/bootstrap.ts. This store does not subscribe to
 * the tenant store itself; the subscription lives at bootstrap.
 *
 * On logout, the auth service (Stage 12) calls launcherStore.clear().
 *
 * -----------------------------------------------------------------------------
 * Test affordance
 * -----------------------------------------------------------------------------
 * setApplications() accepts an optional second argument, `fetchedAt`.
 * Production callers pass one argument (the array); the store records
 * Date.now(). Tests pass a past timestamp to simulate staleness
 * without using fake timers. This is documented in the response
 * preamble.
 * =============================================================================
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// =============================================================================
// Public types
// =============================================================================

/**
 * A single accessible application, as returned by GET /api/launcher
 * (Architecture Freeze §20.1, extended in Unit L-12).
 *
 * The eleven fields correspond one-to-one with the eleven keys the
 * endpoint (App\Http\Controllers\ApplicationController) returns for
 * each application. Fields are `readonly` because the store's
 * contents are cache data: no consumer should mutate an instance in
 * place; the store replaces the array wholesale on every fetch.
 *
 * Bilingual fields (name_am/name_en, description_am/description_en)
 * are resolved by the tile component at render time, not by the
 * store. See Architecture Freeze §9.5.
 */
export interface LauncherApplication {
  /**
   * The application's canonical identifier. Matches the middle
   * segment of the application's `app.{slug}.access` permission
   * slug.
   */
  readonly slug: string;

  /**
   * The display name in Amharic. The primary display string under
   * the system's Amharic-first policy (§9.1). May be empty if the
   * register's row carries no Amharic name for the application.
   */
  readonly name_am: string;

  /**
   * The display name in Latin script. Fallback for a missing Amharic
   * name and for the English locale.
   */
  readonly name_en: string;

  /**
   * The application's canonical domain, without a scheme. The tile
   * prepends `https://` when building its launch href.
   */
  readonly domain: string;

  /**
   * A one-line Amharic description. The primary description string.
   */
  readonly description_am: string;

  /**
   * The Latin-script counterpart to description_am.
   */
  readonly description_en: string;

  /**
   * Whether the application is registered as part of the platform
   * ecosystem. An inactive application is not returned by the
   * endpoint; the field is carried so the tile can render an honest
   * state if the register's active flag ever differs from what the
   * endpoint's filter returned.
   */
  readonly is_active: boolean;

  /**
   * Whether a deployable frontend exists at the application's domain.
   *
   * When `true`, the tile renders as a clickable link. When `false`,
   * the tile renders a non-link state with a badge — the application
   * is registered but not launchable today.
   *
   * Added in version 1.1.0 (Unit L-12). Dormant until Unit L-13
   * teaches LauncherTile to render it.
   */
  readonly is_frontend_ready: boolean;

  /**
   * The Lucide icon name for the tile's glyph, or null.
   *
   * When non-null, the tile passes the value to BaseIcon as its
   * `name` prop. When null, the tile uses its own default glyph
   * (currently `layout-grid`). See the tile component for the
   * registry semantics — an unregistered name logs a dev warning
   * and renders no glyph, and the tile falls back to its default.
   *
   * Added in version 1.1.0 (Unit L-12). Dormant until Unit L-13.
   */
  readonly icon_key: string | null;

  /**
   * The launcher grid's grouping key, or null.
   *
   * When non-null, the grid may render the tile under a category
   * heading (a future CR; the current grid renders flat). When null,
   * the tile is ungrouped.
   *
   * Added in version 1.1.0 (Unit L-12). Dormant until a future grid
   * revision consumes it.
   */
  readonly category: string | null;

  /**
   * The tile's sort weight within its category. Lower values appear
   * first.
   *
   * The endpoint returns the applications already ordered by this
   * column ascending; the store does not re-sort. The field is
   * carried on the interface so a future grid revision that wants
   * to interleave categories can re-sort without a second fetch.
   *
   * Added in version 1.1.0 (Unit L-12). Dormant until a future grid
   * revision consumes it.
   */
  readonly display_order: number;
}

// =============================================================================
// Cache TTL (frozen by this unit; see response preamble §"Design note")
// =============================================================================

/**
 * The cache lifetime, in milliseconds. After this interval, `isStale`
 * returns true and the launcher service (features/launcher/service.ts)
 * will refetch on the next ensureLoaded() call.
 *
 * The value is a presentation choice, not a security boundary. It is a
 * module constant so consumers cannot silently set it to Infinity.
 *
 * Unchanged from 1.0.0.
 */
export const LAUNCHER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// =============================================================================
// The store
// =============================================================================

export const useLauncherStore = defineStore('launcher', () => {
  // ---------------------------------------------------------------------------
  // Private state — not returned from setup, so it cannot be mutated from
  // outside. Consumers read via getters and write via actions.
  // ---------------------------------------------------------------------------
  const _applications = ref<readonly LauncherApplication[]>([]);
  const _lastFetchAt = ref<number | null>(null);

  // ---------------------------------------------------------------------------
  // Public getters
  // ---------------------------------------------------------------------------

  /**
   * The cached applications. Empty until the first successful fetch.
   */
  const applications = computed<readonly LauncherApplication[]>(
    () => _applications.value,
  );

  /**
   * The number of cached applications. Convenience for template use
   * (v-if="launcherStore.count > 0").
   */
  const count = computed<number>(() => _applications.value.length);

  /**
   * True once setApplications() has been called at least once. Note
   * that this is true even when the array is empty: a user with zero
   * accessible applications has been "fetched", which is different from
   * "not yet fetched".
   */
  const hasFetched = computed<boolean>(() => _lastFetchAt.value !== null);

  /**
   * The epoch-ms timestamp of the last successful fetch, or null when
   * no fetch has occurred.
   */
  const lastFetchAt = computed<number | null>(() => _lastFetchAt.value);

  /**
   * True when the cache is missing or has exceeded its TTL. The launcher
   * service reads this before deciding whether to refetch.
   *
   * Note: the getter reads Date.now() on each evaluation. It is a
   * computed with no reactive dependency on the clock, so it will not
   * re-evaluate on its own; a consumer that needs up-to-date staleness
   * should read it inside a reactive effect that also depends on some
   * other reactive signal (e.g. a route change). This is the intended
   * usage: `isStale` is consulted at decision points (navigation, shell
   * mount), not observed continuously.
   */
  const isStale = computed<boolean>(() => {
    if (_lastFetchAt.value === null) return true;
    return Date.now() - _lastFetchAt.value > LAUNCHER_CACHE_TTL_MS;
  });

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Install a fresh applications list and record the fetch time.
   *
   * Production callers pass one argument; the store stamps Date.now().
   * Tests may pass a past `fetchedAt` to simulate staleness without
   * fake timers.
   *
   * The array is stored as a readonly snapshot. The store does not
   * defensively copy it (the caller is expected to pass a fresh array
   * from the API response), but the readonly type prevents accidental
   * mutation from consumers.
   */
  function setApplications(
    apps: readonly LauncherApplication[],
    fetchedAt: number = Date.now(),
  ): void {
    _applications.value = apps;
    _lastFetchAt.value = fetchedAt;
  }

  /**
   * Clear the cache entirely. Called by:
   *   - the app bootstrap when the tenant changes (via $onAction on
   *     the tenant store; see the file header comment §"Cache
   *     invalidation")
   *   - the auth service on logout
   *
   * Distinct from setApplications([]): the latter records "we fetched
   * and the user has zero accessible applications"; clear() records
   * "we have not fetched" (lastFetchAt returns to null and isStale
   * returns true).
   */
  function clear(): void {
    _applications.value = [];
    _lastFetchAt.value = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    // read-only getters
    applications,
    count,
    hasFetched,
    lastFetchAt,
    isStale,

    // mutations
    setApplications,
    clear,
  };
});