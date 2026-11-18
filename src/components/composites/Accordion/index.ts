/*
 * =============================================================================
 * MASES Phase 2 UI — Accordion — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Accordion/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Accordion SFC and the AccordionItem type so consumers
 * can import both from a stable path:
 *
 *     import Accordion from '@/components/composites/Accordion';
 *     import type { AccordionItem } from '@/components/composites/Accordion';
 *
 * The AccordionItem type is declared in a separate <script> block
 * inside Accordion.vue and re-exported here.
 * =============================================================================
 */

import Accordion from './Accordion.vue';

export default Accordion;

export type { AccordionItem } from './Accordion.vue';