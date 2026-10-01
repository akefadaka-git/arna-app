/*
 * =============================================================================
 * MASES Phase 2 UI — GhostButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/GhostButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the GhostButton SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import GhostButton from '@/components/primitives/GhostButton';
 *
 * The type re-exports mirror BaseButton's so that TypeScript consumers
 * can reference ButtonSize and ButtonType from either module without
 * importing BaseButton directly.
 * =============================================================================
 */

import GhostButton from './GhostButton.vue';

export default GhostButton;

export type { ButtonSize, ButtonType } from '../BaseButton';