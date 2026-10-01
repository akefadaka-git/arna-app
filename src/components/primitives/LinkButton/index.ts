/*
 * =============================================================================
 * MASES Phase 2 UI — LinkButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/LinkButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the LinkButton SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import LinkButton from '@/components/primitives/LinkButton';
 *
 * The type re-exports mirror BaseButton's so that TypeScript consumers
 * can reference ButtonSize and ButtonType from either module without
 * importing BaseButton directly.
 * =============================================================================
 */

import LinkButton from './LinkButton.vue';

export default LinkButton;

export type { ButtonSize, ButtonType } from '../BaseButton';