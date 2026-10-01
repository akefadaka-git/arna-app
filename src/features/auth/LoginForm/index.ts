/*
 * =============================================================================
 * MASES Phase 2 UI — LoginForm — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/LoginForm/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the LoginForm SFC and its labels type so consumers can
 * import everything from a stable path:
 *
 *     import LoginForm from '@/features/auth/LoginForm';
 *     import type {
 *       LoginFormLabels,
 *     } from '@/features/auth/LoginForm';
 * =============================================================================
 */

import LoginForm from './LoginForm.vue';

export default LoginForm;

export type { LoginFormLabels } from './LoginForm.vue';