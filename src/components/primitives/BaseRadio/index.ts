/*
 * =============================================================================
 * MASES Phase 2 UI — BaseRadio — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseRadio/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseRadio SFC so consumers can import it via a stable
 * layer-appropriate path:
 *
 *     import BaseRadio from '@/components/primitives/BaseRadio';
 *
 * The emitted payload type is `string | number`, matching the `value`
 * prop. No additional type needs to be re-exported; the union is
 * addressable directly in TypeScript.
 * =============================================================================
 */

import BaseRadio from './BaseRadio.vue';

export default BaseRadio;