/*
 * =============================================================================
 * MASES Phase 2 UI — Breadcrumbs — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/composites/Breadcrumbs/index.ts
 * Layer:     2 (Composites)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the Breadcrumbs SFC and the BreadcrumbItem type so
 * consumers can import both from a stable path:
 *
 *     import Breadcrumbs from '@/components/composites/Breadcrumbs';
 *     import type { BreadcrumbItem } from '@/components/composites/Breadcrumbs';
 *
 * The BreadcrumbItem type is re-exported for consumers that type a
 * variable against the trail's shape (e.g., PageHeader at Stage 10).
 * =============================================================================
 */

import Breadcrumbs from './Breadcrumbs.vue';

export default Breadcrumbs;

export type { BreadcrumbItem } from './Breadcrumbs.vue';