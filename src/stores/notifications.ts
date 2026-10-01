/*
 * =============================================================================
 * MASES Phase 2 UI — useNotificationsStore
 * =============================================================================
 *
 * File:      mase_app/src/stores/notifications.ts
 * Layer:     Stores (Architecture Freeze §13.2)
 * Version:   1.0.0
 * Status:    FROZEN
 * Author:    MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §13   State architecture
 *              §20.2 GET /api/notifications/* contract (DEPENDENCY MISSING)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Owns the notification state for the authenticated session. §13.2
 * charter: "Notification list, unread count, fetch state".
 *
 * Unlike the launcher store (Unit 11.7), which owns only a list and a
 * cache metadata pair, this store owns the fetch LIFECYCLE. The
 * reason is that the notifications bell is persistent shell chrome
 * whose loading and error affordances must survive route changes —
 * they are not per-call state. See the response preamble §"Design note
 * — why this store is different from the launcher store".
 *
 * -----------------------------------------------------------------------------
 * What the store does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not call the API. §13.5 forbids I/O in stores. The
 *     notifications service (Stage 11 or 12) calls
 *     GET /api/notifications and GET /api/notifications/unread-count,
 *     then drives setNotifications / setUnreadCount.
 *   - It does not define bilingual rendering. If the backend emits
 *     bilingual notification titles or bodies, the resolve-by-locale
 *     pick is a render-time concern owned by the consumer.
 *   - It does not persist. §13.4 lists the notifications store as
 *     "in-memory only". A reload starts with an empty cache.
 *   - It does not perform optimistic UI on its own. applyReadState and
 *     applyAllRead are pure local updates; the service decides when to
 *     call them (see the response preamble).
 *
 * -----------------------------------------------------------------------------
 * The GET /api/notifications/* endpoints are DEPENDENCY MISSING
 * -----------------------------------------------------------------------------
 * Architecture Freeze §20.2 records four endpoints as Phase 2 backend
 * tasks:
 *
 *   GET  /api/notifications                 — paginated list
 *   GET  /api/notifications/unread-count    — badge count
 *   POST /api/notifications/{id}/read       — mark one read
 *   POST /api/notifications/read-all        — mark all read
 *
 * §20.2 also states plainly that the notification SCHEMA does not
 * currently exist in the database, and that the response shape is "to
 * be defined by backend". The MasesNotification interface below is
 * therefore a PROPOSAL, derived from the shape hints in the master
 * prompt §28 and Catalog §24.18. See the response preamble §"Design
 * note — the notification schema is a proposal".
 *
 * Stage 11 (shell) will render the notifications bell DISABLED with a
 * tooltip ("Notifications coming soon") until the endpoint exists
 * (§20.2). This store is delivered now because path B was chosen
 * (deliver all five stores before shell chrome).
 *
 * -----------------------------------------------------------------------------
 * unreadCount is stored separately from the list — why
 * -----------------------------------------------------------------------------
 * GET /api/notifications returns a PAGINATED list. The count returned
 * by GET /api/notifications/unread-count is the authoritative total. A
 * client that derived unreadCount from the loaded list would under-
 * report the count whenever there are more unread notifications than
 * fit on one page. §20.2's inclusion of a dedicated count endpoint is
 * only meaningful if this distinction exists. See the response
 * preamble §"Design note — why unreadCount is a separate field".
 *
 * -----------------------------------------------------------------------------
 * Cache invalidation
 * -----------------------------------------------------------------------------
 * The notification list is tenant-scoped and user-scoped. When the
 * tenant changes (tenantStore.setActiveTenant or clearActiveTenant
 * fires), the app bootstrap clears this store via $onAction —
 * mirroring the pattern documented in Unit 11.5. On logout, the auth
 * service (Stage 12) calls notificationsStore.clear().
 * =============================================================================
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// =============================================================================
// Public types
// =============================================================================

/**
 * The priority of a notification. Consumed by the shell's notification
 * list to surface high-priority items. Frozen at three levels; the
 * backend is expected to emit one of these strings.
 *
 * SOURCE: master prompt §28 ("Priority").
 */
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * A single notification.
 *
 * PROPOSAL — see the file header comment §"The GET /api/notifications/*
 * endpoints are DEPENDENCY MISSING". Every field's source hint is
 * documented so the eventual reconciliation against the real backend
 * shape is mechanical.
 */
export interface MasesNotification {
  /**
   * Stable identifier. Typed string (not number) to accommodate both
   * integer ids ("123") and UUIDs ("notif_abc") while the backend
   * schema is unfrozen. See the response preamble.
   */
  readonly id: string;

  /**
   * Short heading.
   * SOURCE: master prompt §28 ("Category" implies a title/body pair
   * alongside it; Catalog §24.18 "NotificationList" implies the same).
   */
  readonly title: string;

  /**
   * Optional body text. Not every notification needs one.
   */
  readonly body?: string;

  /**
   * Category slug. Backend-defined. The frontend renders a localized
   * label keyed by this slug; it does not interpret the slug itself.
   * SOURCE: master prompt §28 ("Category").
   */
  readonly category: string;

  /**
   * Priority.
   * SOURCE: master prompt §28 ("Priority").
   */
  readonly priority: NotificationPriority;

  /**
   * Read/unread status.
   * SOURCE: master prompt §28 ("Unread, Read").
   */
  readonly is_read: boolean;

  /**
   * ISO 8601 creation timestamp.
   * SOURCE: master prompt §28 ("Timestamp").
   */
  readonly created_at: string;

  /**
   * Optional navigation target — an SPA route the bell navigates to
   * when the user activates the notification.
   * SOURCE: master prompt §28 ("Navigation target").
   */
  readonly action_url?: string;

  /**
   * Optional related-resource reference. The schema of this reference
   * is not defined by §20.2; it is left as `unknown` so consumers must
   * narrow it before use.
   * SOURCE: Catalog §24.18 ("Related resource").
   */
  readonly related_resource?: unknown;
}

// =============================================================================
// Cache TTL (frozen by this unit; see response preamble §"Design note")
// =============================================================================

/**
 * The cache lifetime, in milliseconds. After this interval, `isStale`
 * returns true and the notifications service will refetch on the next
 * opportunity.
 *
 * 60 seconds — see the response preamble §"Design note — TTL of 60
 * seconds" for the reasoning. Exposed so a polling scheduler reads the
 * same constant the store uses.
 */
export const NOTIFICATIONS_CACHE_TTL_MS = 60 * 1000; // 60 seconds

// =============================================================================
// The store
// =============================================================================

export const useNotificationsStore = defineStore('notifications', () => {
  // ---------------------------------------------------------------------------
  // Private state — not returned from setup. Consumers read via getters
  // and write via actions.
  // ---------------------------------------------------------------------------
  const _notifications = ref<readonly MasesNotification[]>([]);
  const _unreadCount = ref<number>(0);
  const _isLoading = ref<boolean>(false);
  const _error = ref<unknown | null>(null);
  const _lastFetchedAt = ref<number | null>(null);

  // ---------------------------------------------------------------------------
  // Public getters
  // ---------------------------------------------------------------------------

  /**
   * The cached notification list. Empty until the first successful fetch.
   */
  const notifications = computed<readonly MasesNotification[]>(
    () => _notifications.value,
  );

  /**
   * The number of cached notifications. May be less than `unreadCount`
   * when the list is paginated.
   */
  const count = computed<number>(() => _notifications.value.length);

  /**
   * The authoritative unread count. See the file header comment
   * §"unreadCount is stored separately".
   */
  const unreadCount = computed<number>(() => _unreadCount.value);

  /**
   * Convenience: is there at least one unread notification? Drives the
   * bell's badge visibility.
   */
  const hasUnread = computed<boolean>(() => _unreadCount.value > 0);

  /**
   * True while a fetch is in flight. The bell reads this to render an
   * inline spinner (in place of the count) while loading.
   */
  const isLoading = computed<boolean>(() => _isLoading.value);

  /**
   * The last fetch error, or null. The bell reads this to render an
   * error indicator (typically a small warning glyph in place of the
   * count) when the most recent fetch failed.
   *
   * Cleared on the next beginFetch(). Does not gate the visibility of
   * cached data: a stale list from a previous successful fetch remains
   * readable while an error indicator shows that a refresh failed.
   */
  const error = computed<unknown | null>(() => _error.value);

  /**
   * True once a successful fetch has completed. Note that this is true
   * even when the list is empty: a user with no notifications has been
   * "fetched", which is distinct from "not yet fetched".
   */
  const hasFetched = computed<boolean>(() => _lastFetchedAt.value !== null);

  /**
   * The epoch-ms timestamp of the last successful fetch, or null.
   */
  const lastFetchedAt = computed<number | null>(() => _lastFetchedAt.value);

  /**
   * True when the cache is missing or has exceeded its TTL. See the
   * response preamble §"Design note — TTL of 60 seconds".
   */
  const isStale = computed<boolean>(() => {
    if (_lastFetchedAt.value === null) return true;
    return Date.now() - _lastFetchedAt.value > NOTIFICATIONS_CACHE_TTL_MS;
  });

  // ---------------------------------------------------------------------------
  // Actions — fetch lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Mark the start of a fetch. Clears the previous error and sets
   * isLoading. Does NOT clear the cached list or count — the bell
   * keeps showing the previous state while the refresh is in flight,
   * which is the intended UX (no flicker).
   */
  function beginFetch(): void {
    _isLoading.value = true;
    _error.value = null;
  }

  /**
   * Install a fresh notification list and (optionally) the authoritative
   * unread count. Also terminates a fetch begun with beginFetch().
   *
   * Production callers pass (list, count); the store stamps
   * Date.now(). Tests may pass a past `fetchedAt` to simulate staleness
   * without fake timers — same affordance as Unit 11.7.
   */
  function setNotifications(
    list: readonly MasesNotification[],
    unreadCount: number,
    fetchedAt: number = Date.now(),
  ): void {
    _notifications.value = list;
    _unreadCount.value = Math.max(0, Math.floor(unreadCount));
    _isLoading.value = false;
    _error.value = null;
    _lastFetchedAt.value = fetchedAt;
  }

  /**
   * Update the unread count without touching the list. Intended for:
   *   - a polling scheduler that only hits
   *     GET /api/notifications/unread-count
   *   - a service response that carries an updated count after a read
   *     action (overrides the local best-effort decrement applied by
   *     applyReadState)
   *
   * Does not change isLoading, error, lastFetchedAt, or the list.
   */
  function setUnreadCount(count: number): void {
    _unreadCount.value = Math.max(0, Math.floor(count));
  }

  /**
   * Terminate a fetch with an error. The cached list and count are
   * preserved — the bell shows a stale-but-readable state alongside an
   * error indicator.
   */
  function failFetch(err: unknown): void {
    _isLoading.value = false;
    _error.value = err;
  }

  // ---------------------------------------------------------------------------
  // Actions — read-state mutations
  //
  // Pure local updates. NOT optimistic UI. See the response preamble
  // §"Design note — why applyReadState and applyAllRead are not
  // optimistic".
  // ---------------------------------------------------------------------------

  /**
   * Mark a single notification as read in the cached list, and decrement
   * the local unread count by one (bounded at zero).
   *
   * No-op if the id is not in the loaded list (e.g. it is on a page the
   * client has not fetched), or if the notification is already read.
   * In the first case the service may still want to refresh the count
   * via setUnreadCount() after the POST succeeds.
   */
  function applyReadState(id: string): void {
    const idx = _notifications.value.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const target = _notifications.value[idx];
    if (target.is_read) return;

    // Immutable update so the array identity changes and computed
    // getters re-evaluate.
    const next = _notifications.value.slice();
    next[idx] = { ...target, is_read: true };
    _notifications.value = next;

    _unreadCount.value = Math.max(0, _unreadCount.value - 1);
  }

  /**
   * Mark every cached notification as read and zero the unread count.
   *
   * No-op when the list is already all-read or empty.
   */
  function applyAllRead(): void {
    if (_notifications.value.length === 0) {
      // The count may still be non-zero (list not yet fetched). Zeroing
      // it here is correct: read-all was confirmed server-side.
      if (_unreadCount.value !== 0) _unreadCount.value = 0;
      return;
    }

    if (_notifications.value.every((n) => n.is_read)) {
      // Already all read in the cache; still zero the count in case a
      // prior best-effort decrement drifted.
      if (_unreadCount.value !== 0) _unreadCount.value = 0;
      return;
    }

    _notifications.value = _notifications.value.map((n) =>
      n.is_read ? n : { ...n, is_read: true },
    );
    _unreadCount.value = 0;
  }

  // ---------------------------------------------------------------------------
  // Actions — lifecycle
  // ---------------------------------------------------------------------------

  /**
   * Reset the store to its pre-login state. Called by:
   *   - the app bootstrap when the tenant changes (via $onAction on
   *     the tenant store)
   *   - the auth service on logout
   */
  function clear(): void {
    _notifications.value = [];
    _unreadCount.value = 0;
    _isLoading.value = false;
    _error.value = null;
    _lastFetchedAt.value = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    // read-only getters
    notifications,
    count,
    unreadCount,
    hasUnread,
    isLoading,
    error,
    hasFetched,
    lastFetchedAt,
    isStale,

    // fetch lifecycle
    beginFetch,
    setNotifications,
    setUnreadCount,
    failFetch,

    // read-state mutations
    applyReadState,
    applyAllRead,

    // lifecycle
    clear,
  };
});