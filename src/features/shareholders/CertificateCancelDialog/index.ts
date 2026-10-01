/*
 * =============================================================================
 * MASES Phase 2 UI — CertificateCancelDialog — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/CertificateCancelDialog/index.ts
 * Layer:     Features (Stage 15 — Shareholder Portal)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the CertificateCancelDialog SFC, its labels type, and a
 * pass-through re-export of ShareCertificate (used by consumers that
 * wire the @cancelled handler and hold the target).
 * =============================================================================
 */

import CertificateCancelDialog from './CertificateCancelDialog.vue';

export default CertificateCancelDialog;

export type {
  CertificateCancelDialogLabels,
  ShareCertificate,
} from './CertificateCancelDialog.vue';