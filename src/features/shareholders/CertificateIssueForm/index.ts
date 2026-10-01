/*
 * =============================================================================
 * MASES Phase 2 UI — CertificateIssueForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/shareholders/CertificateIssueForm/index.ts
 * Layer:     Features (Stage 15 — Shareholder Portal)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the CertificateIssueForm SFC, its labels type, and a
 * pass-through re-export of ShareCertificate (used by consumers that
 * wire the @submitted handler).
 * =============================================================================
 */

import CertificateIssueForm from './CertificateIssueForm.vue';

export default CertificateIssueForm;

export type {
  CertificateIssueFormLabels,
  ShareCertificate,
} from './CertificateIssueForm.vue';