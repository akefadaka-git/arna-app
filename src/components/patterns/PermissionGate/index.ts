/*
 * =============================================================================
 * MASES Phase 2 UI — PermissionGate — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/PermissionGate/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the PermissionGate SFC and the PermissionGateMode type so
 * consumers can import both from a stable path:
 *
 *     import PermissionGate from '@/components/patterns/PermissionGate';
 *     import type { PermissionGateMode } from '@/components/patterns/PermissionGate';
 *
 * IMPORTANT
 * ---------
 * PermissionGate is UX gating, not security. The backend remains the
 * sole authority for every authorization decision. See
 * MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.2 and §15.4.
 *
 * The component imports useAuthStore from '@/stores/auth'. That store
 * is delivered in Stage 12 (Authentication UI). Until then, the module
 * import fails; see the SFC's header comment §"The store interface".
 * =============================================================================
 */

import PermissionGate from './PermissionGate.vue';

export default PermissionGate;

export type { PermissionGateMode } from './PermissionGate.vue';