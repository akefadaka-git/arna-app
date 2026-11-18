/*
 * =============================================================================
 * MASES Phase 2 UI — DataTable — Barrel Export
 * =============================================================================
 *
 * File:      mase_app/src/components/patterns/DataTable/index.ts
 * Layer:     3 (Patterns)
 * Version:   1.0.0
 * Status:    FROZEN
 *
 * Re-exports the DataTable SFC and its supporting types so consumers
 * can import everything from a stable path:
 *
 *     import DataTable from '@/components/patterns/DataTable';
 *     import type {
 *       DataTableColumn,
 *       DataTableSortDir,
 *       DataTableDensity,
 *       DataTableMobileLayout,
 *       DataTableEmptyConfig,
 *       DataTableErrorConfig,
 *       DataTablePaginationConfig,
 *       DataTableSortPayload,
 *       DataTableSelectionLabels,
 *       DataTablePaginationLabels,
 *     } from '@/components/patterns/DataTable';
 * =============================================================================
 */

import DataTable from './DataTable.vue';

export default DataTable;

export type {
  DataTableColumn,
  DataTableAlign,
  DataTablePriority,
  DataTableSortDir,
  DataTableDensity,
  DataTableMobileLayout,
  DataTableEmptyConfig,
  DataTableErrorConfig,
  DataTablePaginationConfig,
  DataTableSortPayload,
  DataTableSelectionLabels,
  DataTablePaginationLabels,
} from './DataTable.vue';