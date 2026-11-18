/*
 * =============================================================================
 * MASES Phase 2 UI — BaseLink — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseLink/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseLink SFC so consumers can import it via a stable
 * layer-appropriate path:
 *
 *     import BaseLink from '@/components/primitives/BaseLink';
 *
 * The LinkVariant type is re-exported for consumers that type a
 * variable against the accepted values.
 * =============================================================================
 */

import BaseLink from './BaseLink.vue';

export default BaseLink;

export type LinkVariant = 'default' | 'subtle';