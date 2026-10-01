/*
 * =============================================================================
 * MASES Phase 2 UI — Card — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/Card/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Card SFC and its two supporting types so consumers
 * can import all three from a stable path:
 *
 *     import Card from '@/components/patterns/Card';
 *     import type {
 *       CardVariant,
 *       CardPadding,
 *     } from '@/components/patterns/Card';
 * =============================================================================
 */

import Card from './Card.vue';

export default Card;

export type { CardVariant, CardPadding } from './Card.vue';