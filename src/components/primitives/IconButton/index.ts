/*
 * =============================================================================
 * MASES Phase 2 UI — IconButton — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/IconButton/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the IconButton SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import IconButton from '@/components/primitives/IconButton';
 *
 * The type re-exports mirror BaseButton's where applicable. The
 * IconButtonVariant type is a subset of BaseButton's variant set,
 * defined here because IconButton excludes the 'link' variant. If the
 * subset is ever widened, it widens here.
 * =============================================================================
 */

import IconButton from './IconButton.vue';

export default IconButton;

export type { ButtonSize, ButtonType } from '../BaseButton';

/**
 * The four visual variants IconButton supports.
 *
 * This is a strict subset of BaseButton's variant set. The 'link'
 * variant is deliberately excluded; see IconButton.vue's file header
 * comment §"Visual identity" for the rationale.
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';