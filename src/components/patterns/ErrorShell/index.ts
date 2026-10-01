/*
 * =============================================================================
 * MASES Phase 2 UI — ErrorShell — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/ErrorShell/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the ErrorShell SFC. ErrorShell has no supporting types —
 * it is a pure layout frame with three slots and no props. This
 * barrel exists for API consistency with every other pattern in
 * Stage 10 (each pattern folder exposes an index.ts), so consumers
 * can uniformly import from '@/components/patterns/ErrorShell'.
 *
 *     import ErrorShell from '@/components/patterns/ErrorShell';
 * =============================================================================
 */

import ErrorShell from './ErrorShell.vue';

export default ErrorShell;