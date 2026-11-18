/*
 * =============================================================================
 * MASES Phase 2 UI — VerifyEmailPanel — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/VerifyEmailPanel/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the VerifyEmailPanel SFC, its labels type, and its state
 * union so consumers can import everything from a stable path:
 *
 *     import VerifyEmailPanel from '@/features/auth/VerifyEmailPanel';
 *     import type {
 *       VerifyEmailPanelLabels,
 *       VerifyEmailState,
 *     } from '@/features/auth/VerifyEmailPanel';
 *
 * The state union is exported so tests can assert on the panel's
 * `data-state` attribute against the same literals the component uses.
 * =============================================================================
 */

import VerifyEmailPanel from './VerifyEmailPanel.vue';

export default VerifyEmailPanel;

export type {
  VerifyEmailPanelLabels,
  VerifyEmailState,
} from './VerifyEmailPanel.vue';