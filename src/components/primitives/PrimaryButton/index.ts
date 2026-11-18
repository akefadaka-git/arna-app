/*
 * =============================================================================
 * MASES Phase 2 UI — PrimaryButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/PrimaryButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the PrimaryButton SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import PrimaryButton from '@/components/primitives/PrimaryButton';
 *
 * The type re-exports mirror BaseButton's so that TypeScript consumers
 * can reference ButtonSize and ButtonType from either module without
 * importing BaseButton directly.
 * =============================================================================
 */

import PrimaryButton from './PrimaryButton.vue';

export default PrimaryButton;

export type { ButtonSize, ButtonType } from '../BaseButton';