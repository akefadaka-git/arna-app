/*
 * =============================================================================
 * MASES Phase 2 UI — Timeline — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/Timeline/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.1
 * Status:    FROZEN
 *
 * Re-exports the Timeline SFC and its two supporting types so consumers
 * can import all three from a stable path:
 *
 *     import Timeline from '@/components/patterns/Timeline';
 *     import type {
 *       TimelineItem,
 *       TimelineItemVariant,
 *     } from '@/components/patterns/Timeline';
 *
 * TimelineItem is the item shape. TimelineItemVariant is the variant
 * union. Both are declared in a separate <script> block inside
 * Timeline.vue.
 *
 * Version history:
 *   1.0.0  — initial delivery.
 *   1.0.1  — mobile icon-mode marker size correction (SFC-only change;
 *            this barrel is unchanged in shape).
 * =============================================================================
 */

import Timeline from './Timeline.vue';

export default Timeline;

export type { TimelineItem, TimelineItemVariant } from './Timeline.vue';