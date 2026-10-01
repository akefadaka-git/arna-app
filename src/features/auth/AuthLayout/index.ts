/*
 * =============================================================================
 * MASES Phase 2 UI — AuthLayout — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/features/auth/AuthLayout/index.ts
 * Layer:     Features (Stage 12 — Authentication UI)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the AuthLayout SFC. AuthLayout has no supporting types —
 * its entire API is three slots (brand, default, footer) and no props.
 * This barrel exists for API consistency with every other Stage 10/11
 * unit so consumers can uniformly import from
 * '@/features/auth/AuthLayout'.
 *
 *     import AuthLayout from '@/features/auth/AuthLayout';
 * =============================================================================
 */

import AuthLayout from './AuthLayout.vue';

export default AuthLayout;