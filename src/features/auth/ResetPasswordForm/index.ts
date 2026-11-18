/*
 * =============================================================================
 * MASES Phase 2 UI — ResetPasswordForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/ResetPasswordForm/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ResetPasswordForm SFC and its labels type so
 * consumers can import everything from a stable path:
 *
 *     import ResetPasswordForm from '@/features/auth/ResetPasswordForm';
 *     import type {
 *       ResetPasswordFormLabels,
 *     } from '@/features/auth/ResetPasswordForm';
 * =============================================================================
 */

import ResetPasswordForm from './ResetPasswordForm.vue';

export default ResetPasswordForm;

export type { ResetPasswordFormLabels } from './ResetPasswordForm.vue';