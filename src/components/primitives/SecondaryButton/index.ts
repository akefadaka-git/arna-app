/*
 * =============================================================================
 * MASES Phase 2 UI — SecondaryButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/SecondaryButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the SecondaryButton SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import SecondaryButton from '@/components/primitives/SecondaryButton';
 *
 * The type re-exports mirror BaseButton's so that TypeScript consumers
 * can reference ButtonSize and ButtonType from either module without
 * importing BaseButton directly.
 * =============================================================================
 */

import SecondaryButton from './SecondaryButton.vue';

export default SecondaryButton;

export type { ButtonSize, ButtonType } from '../BaseButton';