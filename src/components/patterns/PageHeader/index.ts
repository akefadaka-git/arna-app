/*
 * =============================================================================
 * MASES Phase 2 UI — PageHeader — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/PageHeader/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the PageHeader SFC and re-exports the BreadcrumbItem type
 * so consumers can import everything they need from a single path:
 *
 *     import PageHeader from '@/components/patterns/PageHeader';
 *     import type { BreadcrumbItem } from '@/components/patterns/PageHeader';
 *
 * BreadcrumbItem is defined in Unit 9.13 and re-exported here for
 * ergonomic consumption by feature pages that only need the
 * PageHeader's surface.
 * =============================================================================
 */

import PageHeader from './PageHeader.vue';

export default PageHeader;

export type { BreadcrumbItem } from '../../composites/Breadcrumbs';