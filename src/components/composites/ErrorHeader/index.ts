/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorHeader — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/ErrorHeader/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorHeader SFC and the ErrorHeaderVariant type so
 * consumers can import both from a stable path:
 *
 *     import ErrorHeader from '@/components/composites/ErrorHeader';
 *     import type { ErrorHeaderVariant } from '@/components/composites/ErrorHeader';
 *
 * The ErrorHeaderVariant type is re-exported for consumers that type a
 * variable against the accepted values (e.g., the ErrorPage archetype
 * table at Stage 10 that maps each archetype to its badge variant).
 *
 * The component also exposes a `focusTitle()` method via defineExpose,
 * used by the ErrorPage's mount handler to move focus to the <h1>.
 * =============================================================================
 */

import ErrorHeader from './ErrorHeader.vue';

export default ErrorHeader;

export type { ErrorHeaderVariant } from './ErrorHeader.vue';