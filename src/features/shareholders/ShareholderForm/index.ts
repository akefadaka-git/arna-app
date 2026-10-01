/*
 * =============================================================================
 * MASES Phase 2 UI — ShareholderForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/ShareholderForm/index.ts
 * Layer:     Features (Stage 15 — Shareholder Portal)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ShareholderForm SFC, its labels type, and a
 * pass-through re-export of Shareholder (used by consumers that wire
 * the @submitted handler).
 * =============================================================================
 */

import ShareholderForm from './ShareholderForm.vue';

export default ShareholderForm;

export type {
  ShareholderFormLabels,
  Shareholder,
} from './ShareholderForm.vue';