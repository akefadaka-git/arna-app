/*
 * =============================================================================
 * MASES Phase 2 UI — VerifyEmailResend — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/VerifyEmailResend/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the VerifyEmailResend SFC, its labels type, and its
 * state union so consumers can import everything from a stable path:
 *
 *     import VerifyEmailResend from '@/features/auth/VerifyEmailResend';
 *     import type {
 *       VerifyEmailResendLabels,
 *       VerifyEmailResendState,
 *     } from '@/features/auth/VerifyEmailResend';
 *
 * The state union is exported so tests can assert on the panel's
 * `data-state` attribute against the same literals the component uses.
 * =============================================================================
 */

import VerifyEmailResend from './VerifyEmailResend.vue';

export default VerifyEmailResend;

export type {
  VerifyEmailResendLabels,
  VerifyEmailResendState,
} from './VerifyEmailResend.vue';