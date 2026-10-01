/*
 * =============================================================================
 * MASES Phase 2 UI — Alert — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Alert/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Alert SFC and the AlertVariant type so consumers can
 * import both from a stable path:
 *
 *     import Alert from '@/components/composites/Alert';
 *     import type { AlertVariant } from '@/components/composites/Alert';
 *
 * The ALERT_ICON_BY_VARIANT constant is also re-exported for consumers
 * that need to know which glyph a variant maps to (e.g., a documentation
 * page or an accessibility audit tool).
 * =============================================================================
 */

import Alert from './Alert.vue';

export default Alert;

export type { AlertVariant } from './Alert.vue';

export { ALERT_ICON_BY_VARIANT } from './Alert.vue';