/*
 * =============================================================================
 * MASES Phase 2 UI — CalendarContext — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/CalendarContext/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the CalendarContext SFC, its default formatter helper,
 * and its tick constant so consumers can import everything from a
 * stable path:
 *
 *     import CalendarContext, {
 *       formatIsoLocalDate,
 *       CALENDAR_CONTEXT_TICK_MS,
 *     } from '@/layouts/AppShell/CalendarContext';
 *
 *     import type {
 *       CalendarDateFormatter,
 *     } from '@/layouts/AppShell/CalendarContext';
 *
 * formatIsoLocalDate is exported so consumers that need the same
 * ISO-local-date format elsewhere import it rather than duplicate the
 * three-line helper. CALENDAR_CONTEXT_TICK_MS is exported so tests
 * assert against the same value the component uses.
 * =============================================================================
 */

import CalendarContext from './CalendarContext.vue';

export default CalendarContext;

export {
  formatIsoLocalDate,
  CALENDAR_CONTEXT_TICK_MS,
} from './CalendarContext.vue';

export type { CalendarDateFormatter } from './CalendarContext.vue';