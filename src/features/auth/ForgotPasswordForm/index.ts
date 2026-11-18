/*
 * =============================================================================
 * MASES Phase 2 UI — ForgotPasswordForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/ForgotPasswordForm/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ForgotPasswordForm SFC and its labels type so
 * consumers can import everything from a stable path:
 *
 *     import ForgotPasswordForm from '@/features/auth/ForgotPasswordForm';
 *     import type {
 *       ForgotPasswordFormLabels,
 *     } from '@/features/auth/ForgotPasswordForm';
 * =============================================================================
 */

import ForgotPasswordForm from './ForgotPasswordForm.vue';

export default ForgotPasswordForm;

export type { ForgotPasswordFormLabels } from './ForgotPasswordForm.vue';