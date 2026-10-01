/*
 * =============================================================================
 * MASES Phase 2 UI — TenantSwitcher — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AppShell/TenantSwitcher/index.ts
 * Layer:     4 (Shell — AppShell family)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the TenantSwitcher SFC and its labels type so consumers
 * can import everything from a stable path:
 *
 *     import TenantSwitcher from '@/layouts/AppShell/TenantSwitcher';
 *     import type {
 *       TenantSwitcherLabels,
 *     } from '@/layouts/AppShell/TenantSwitcher';
 *
 * The component self-hides when the user has only one accessible
 * tenant, so the shell does not need a v-if guard.
 * =============================================================================
 */

import TenantSwitcher from './TenantSwitcher.vue';

export default TenantSwitcher;

export type { TenantSwitcherLabels } from './TenantSwitcher.vue';