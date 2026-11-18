/*
 * =============================================================================
 * MASES Phase 2 UI — NotificationsBell — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/NotificationsBell/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the NotificationsBell SFC, its labels type, and the badge
 * cap constant so consumers can import everything from a stable path:
 *
 *     import NotificationsBell, {
 *       BADGE_MAX_DISPLAY,
 *     } from '@/layouts/AppShell/NotificationsBell';
 *
 *     import type {
 *       NotificationsBellLabels,
 *     } from '@/layouts/AppShell/NotificationsBell';
 *
 * BADGE_MAX_DISPLAY is exported so tests that assert the "99+" cap
 * read the same value the component uses, rather than duplicating the
 * literal.
 * =============================================================================
 */

import NotificationsBell from './NotificationsBell.vue';

export default NotificationsBell;

export { BADGE_MAX_DISPLAY } from './NotificationsBell.vue';

export type { NotificationsBellLabels } from './NotificationsBell.vue';