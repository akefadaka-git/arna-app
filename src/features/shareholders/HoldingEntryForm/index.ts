/*
 * =============================================================================
 * MASES Phase 2 UI — HoldingEntryForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/HoldingEntryForm/index.ts
 * Layer:     Features (Stage 15 — Shareholder Portal)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the HoldingEntryForm SFC, its labels type, its entry-type
 * union, and a pass-through re-export of ShareHolding (used by
 * consumers that wire the @submitted handler).
 * =============================================================================
 */

import HoldingEntryForm from './HoldingEntryForm.vue';

export default HoldingEntryForm;

export type {
  HoldingEntryFormLabels,
  HoldingEntryType,
  ShareHolding,
} from './HoldingEntryForm.vue';