/*
 * =============================================================================
 * MASES Phase 2 UI — BaseCheckbox — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/primitives/BaseCheckbox/index.ts
 * Layer:     1 (Primitives)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the BaseCheckbox SFC so consumers can import it via a
 * stable, layer-appropriate path:
 *
 *     import BaseCheckbox from '@/components/primitives/BaseCheckbox';
 *
 * The component's public API is intentionally minimal. The three-state
 * model (true / false / undefined) is expressed through the
 * `modelValue` prop; no additional type needs to be re-exported.
 * =============================================================================
 */

import BaseCheckbox from './BaseCheckbox.vue';

export default BaseCheckbox;