/*
 * =============================================================================
 * MASES Phase 2 UI — DangerButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/DangerButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the DangerButton SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import DangerButton from '@/components/primitives/DangerButton';
 *
 * The type re-exports mirror BaseButton's so that TypeScript consumers
 * can reference ButtonSize and ButtonType from either module without
 * importing BaseButton directly.
 * =============================================================================
 */

import DangerButton from './DangerButton.vue';

export default DangerButton;

export type { ButtonSize, ButtonType } from '../BaseButton';