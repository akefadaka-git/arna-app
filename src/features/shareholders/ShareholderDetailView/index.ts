/*
 * =============================================================================
 * MASES Phase 2 UI — ShareholderDetailView — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/ShareholderDetailView/index.ts
 * Layer:     Features (Stage 15 — Shareholder Portal)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ShareholderDetailView SFC, its labels type, and a
 * pass-through re-export of ShareCertificate (used by consumers that
 * wire the @cancel-certificate handler).
 * =============================================================================
 */

import ShareholderDetailView from './ShareholderDetailView.vue';

export default ShareholderDetailView;

export type {
  ShareholderDetailViewLabels,
  ShareCertificate,
} from './ShareholderDetailView.vue';