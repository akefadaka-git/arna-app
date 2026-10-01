/*
 * =============================================================================
 * MASES Phase 2 UI — RegisterForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/RegisterForm/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the RegisterForm SFC and its labels type so consumers can
 * import everything from a stable path:
 *
 *     import RegisterForm from '@/features/auth/RegisterForm';
 *     import type {
 *       RegisterFormLabels,
 *     } from '@/features/auth/RegisterForm';
 * =============================================================================
 */

import RegisterForm from './RegisterForm.vue';

export default RegisterForm;

export type { RegisterFormLabels } from './RegisterForm.vue';