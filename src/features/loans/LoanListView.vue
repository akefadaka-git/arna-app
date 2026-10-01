<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 6
=============================================================================

 File:      mase_app/src/features/loans/LoanListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 6
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~55 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.1.0):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at /loans.

 After (v1.1.1):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "ብድሮች — MASES"
     Empty VITE_APP_NAME →  "ብድሮች"

   The portal build has its own loans list surface (MyLoansPage.vue),
   which is a different component in a different route tree. This
   file is workspace-only.

   The composed title uses the same `labels.pageTitle` string the
   view's PageHeader already renders as the page's <h1>. The browser
   tab and the page heading agree.

   No other behaviour change. Every existing import, ref, computed,
   watcher, handler, template element, test hook, and scoped style
   rule is byte-for-byte identical to v1.1.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanListView.vue  (AMEND)
 Unit:      CR-LW2 — Workspace loan dialogs (list view's "New loan" wiring)
 Delivery type:  Amendment — one dialog import, one label import, one
                 open-state ref, one dialog component in the template,
                 the `onCreate` placeholder handler replaced with a
                 dialog-opening handler, one new `onApplicationSubmitted`
                 handler.
 Net lines:      +2 imports; +1 ref; +2 handlers; ~+12 lines template;
                 ~35 lines docblock.

 Before (v1.0.0):
   The list view rendered a "New loan" PrimaryButton (gated by
   `loan.apply`), but its `onCreate` handler was a no-op placeholder
   (the CR-LW1 file 4 header §"The 'New loan' button in CR-LW1"
   recorded the reasoning — the dialog did not yet exist). Clicking
   the button did nothing visible.

 After (v1.1.0):
   The list view owns the LoanApplicationForm dialog:

     · An `isApplicationOpen` ref controls the dialog's open state.
     · The `onCreate` handler sets that ref to `true`.
     · A new `onApplicationSubmitted` handler reloads the loans list
       after a successful creation.
     · The dialog component is rendered at the bottom of the page's
       template, above the closing `</div>`.

   The dialog itself is delivered as CR-LW2 file 11
   (`LoanApplicationForm.vue`). It fetches its own reference data
   (shareholders and active products) on open — the list view does
   not need to pre-load anything to support it.

 =============================================================================
 Why the list view owns the application dialog
 =============================================================================
 The dialog creates a NEW loan, which is not an operation on an
 existing loan. The loan detail route wrapper (CR-LW2 file 9) owns
 the five lifecycle dialogs that operate on an existing loan. The
 split follows the wallet feature's precedent exactly:

   · WalletListView owns the wallet-open dialog (creates a new
     wallet).
   · WalletDetailRoute owns the five lifecycle dialogs (adjust,
     obligation, payment, allocation, allocation-reverse).

 See WalletListView.vue's "onOpen" handler and its `WalletOpenForm`
 binding for the direct precedent.

 =============================================================================
 The "New loan" button's permission gate
 =============================================================================
 The button is already wrapped in `<PermissionGate permission="loan.apply">`
 (delivered in CR-LW1 file 4). The gate remains unchanged. The dialog
 is opened only when the button is clicked, so only a caller holding
 `loan.apply` can reach it. The backend additionally enforces the
 permission on the request via `Gate::authorize('loan.apply')` (A.77).

 =============================================================================
 The reload after creation
 =============================================================================
 The dialog emits `submitted` with the newly-created loan.
 `onApplicationSubmitted` closes the dialog (the dialog closes itself
 — see `LoanApplicationForm.vue`'s onSubmit's second emit) and reloads
 the loans list. The new loan appears at the top of the list (the
 backend orders by `application_date DESC, id DESC`).

 The list reload matches the wallet list's pattern: after
 `WalletOpenForm` emits `submitted`, `WalletListView` closes its
 dialog and calls `load()`.

 Dependency note:
   · Depends on `LoanApplicationForm.vue` (CR-LW2 file 11).
   · Depends on `loanApplicationFormLabels` from `./labels` (CR-LW2
     file 1).
   · No change to the list's own state, its columns, its filters, its
     pagination, or any existing behaviour.
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            this file only
 Files added:               none
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW1
=============================================================================

 File:      mase_app/src/features/loans/LoanListView.vue  (NEW)
 Unit:      CR-LW1 — Workspace loan views (list)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The workspace had no loans list page. The
   backend's `GET /api/loans` endpoint was reachable only by direct
   request; the sidebar had no loans nav item.

 After:
   A list page rendering the authenticated tenant's loans — one row
   per loan, five columns, four data states. Follows the shape of
   WalletListView.vue (1.0.3) and FilesListView.vue (1.0.2).

   The page shows, per row:
     · a linkable loan identifier (`#<id>`),
     · the principal amount,
     · the outstanding total,
     · the status badge,
     · the application date,
     · a per-row actions menu.

   Filters: status (twelve C4 values + "all"), active-only, in-arrears.

   The "New loan" button was rendered under `loan.apply` but was a
   no-op — see the CR-LW1 file 4 header §"The 'New loan' button in
   CR-LW1". CR-LW2's amendment (this file's 1.1.0 revision) wires the
   button to the LoanApplicationForm dialog.

 Dependency note:
   · Depends on `listLoans` and `formatAmount` from
     `@/features/loans/service` (CR-LW1 file 2).
   · Depends on `LoanListViewLabels` and `loanListViewLabels` from
     `./labels` (CR-LW1 file 3).
   · Depends on the CR-L1 backend route `GET /api/loans` being
     reachable under the corrected `/api` prefix (deployed).
   · Depends on the CR-L2 backend `_display` fields on LoanResource
     (deployed).
   · Depends on the CR-LW1 file 7 route registration for `/loans` to
     resolve.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none
 Routes registered:         none (declared by CR-LW1 file 7)
 Nav entry:                 none (declared by CR-LW1 file 8)

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanListView
=============================================================================

 File:      mase_app/src/features/loans/LoanListView.vue
 Layer:     Features (Loan domain)
 Version:   1.1.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §8.6,
              §9.14–§9.15, §9.19–§9.21, §11.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §13.3, §22 STAGE WF
            Loan domain LoanController.php (A.77, verified against source)
            Loan domain Routes/api.php (A.84, verified against source)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-LW1). The list page with its five-column
          table, three filters, four states, and the "New loan"
          placeholder button.

 1.1.0  — the "New loan" button now opens the LoanApplicationForm
          dialog (CR-LW2). The dialog is owned by this view; the
          button's no-op handler becomes a dialog-opening handler;
          a new `onApplicationSubmitted` handler reloads the list
          after a successful creation.

 1.1.1  — CR-WORKSPACE-TITLE Phase 1 File 6. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the sixth workspace view in the CR's scope,
          following FilesListView.vue v1.0.3, ShareholderListView.vue
          v1.1.1, ShareClassListView.vue v1.0.1,
          WalletListView.vue v1.0.4, and WalletStatementView.vue
          v1.0.3.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, watcher, handler,
              template element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .loan-list-view div. The template
          becomes a two-node fragment; Vue 3 supports multi-root
          templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /loans page's content. Renders a filterable, paginated list of
 the current tenant's loans.

 Content page. The route record (CR-LW1 file 7) wraps it in
 AuthenticatedLayout, which composes AppShell.

 -----------------------------------------------------------------------------
 The "New loan" dialog
 -----------------------------------------------------------------------------
 The list view owns the LoanApplicationForm dialog. See this file's
 CR-LW2 change-verification block §"Why the list view owns the
 application dialog" for the reasoning. In brief: the dialog creates
 a new loan, which is a list-page concern, not a detail-page concern.

 The dialog fetches its own reference data (shareholders, active
 products) on open. The list view does not pre-load anything.

 -----------------------------------------------------------------------------
 The list does not embed the borrower or the product
 -----------------------------------------------------------------------------
 LoanController::index() does NOT eager-load any relation. Each loan
 in the response therefore carries only its own columns. The four
 visible columns are chosen from the columns that ARE present.

 -----------------------------------------------------------------------------
 The nested pagination meta
 -----------------------------------------------------------------------------
 LoanController::respondWithLoans() wraps the pagination inside a
 `pagination` object. The page's `meta` ref carries the raw `meta`
 block from the response and reads `meta.pagination.*` defensively.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The list, its pagination meta, the three filter values, the current
 page, the currently-open row-actions menu, and the application
 dialog's open state are component-local refs. The service (CR-LW1
 file 2) is stateless.

 -----------------------------------------------------------------------------
 Permission gating (§7.3.2)
 -----------------------------------------------------------------------------
 The "New loan" action is gated on loan.apply.

 -----------------------------------------------------------------------------
 Query construction — mutable view of a readonly type
 -----------------------------------------------------------------------------
 The API module declares ListLoansQuery with readonly fields. This
 component builds the query incrementally, so it constructs through a
 local mutable mapped type and returns the result as ListLoansQuery.
 Same pattern as WalletListView.vue and FilesListView.vue.

 -----------------------------------------------------------------------------
 Row-actions menu — single-open control
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component. To ensure only one row's menu
 is open at a time, this page tracks the id of the currently-open row
 (`openRowId`).

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 The <PageTitle> binding reads `labels.pageTitle` — an existing label;
 no literal string is introduced. The only literal in the file's scope
 is the `— ` separator, which is owned by PageTitle, not by this file.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, gap via
 tokens, margin via tokens, padding, min-width).

 PageTitle renders nothing and declares no styles. This revision adds
 no CSS.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 Unchanged from v1.1.0:

 data-testid="loan-list-view-root"        on the outer <div>
 data-testid="loan-list-view-new"         on the New loan PrimaryButton
                                           (rendered only when the
                                           user holds loan.apply)
 data-testid="loan-list-view-status"      on the status BaseSelect
 data-testid="loan-list-view-active"      on the active-only BaseSelect
 data-testid="loan-list-view-arrears"     on the in-arrears BaseSelect
 data-testid="loan-list-view-table"       on the DataTable
 data-testid="loan-list-view-loading"     on the LoadingState
 data-testid="loan-list-view-error"       on the ErrorState
 data-testid="loan-list-view-empty"       on the EmptyState
 data-testid="loan-list-view-pagination"  on the Pagination

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 The LoanApplicationForm dialog carries its own root data-testid (see
 CR-LW2 file 11).

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.1.0. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - BaseSelect, Pagination, DataTable, DropdownMenu, and the Modal
     inside LoanApplicationForm all own their accessibility contracts.
   - The row-actions trigger button receives its accessible name from
     labels.rowActionsAriaLabel; DropdownMenu supplies aria-haspopup,
     aria-expanded, and aria-controls through the scoped slot.
   - The status badge's accessible name is its label text.
   - Reduced motion: this file defines no animation.

 -----------------------------------------------------------------------------
 Why <PageTitle> is used (CR-WORKSPACE-TITLE Phase 1)
 -----------------------------------------------------------------------------
 PageTitle (v1.0.0, src/layouts/AppShell/PageTitle/) is the shell's
 canonical document.title manager. It:

   · composes the string from a title and an optional suffix separated
     by an em-dash (the default separator is ` — `);
   · handles the empty-suffix case by omitting the separator;
   · restores the previous document.title on unmount;
   · re-runs when its props change;
   · renders nothing (its template is empty).

 The composition is declarative:

     <PageTitle
       :title="labels.pageTitle"
       :suffix="appName"
     />

 The `:title` binding reads `labels.pageTitle` — the same string the
 view's PageHeader already renders as the page's <h1>. The browser tab
 and the page heading agree by construction.

 `appName` is read once from `import.meta.env.VITE_APP_NAME`. The
 variable is declared non-optional in vite-env.d.ts v1.1.0; the
 declaration here is a plain `const appName: string`.
=============================================================================
-->

<script lang="ts">
/*
 * The page's labels type is imported from ./labels and re-exported here
 * for consumers that import the type from the component module. The
 * source of truth remains ./labels.
 */
import type { LoanListViewLabels } from './labels';
export type { LoanListViewLabels };
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import PermissionGate from '@/components/patterns/PermissionGate';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import DropdownMenu from '@/components/composites/DropdownMenu';
import Pagination from '@/components/composites/Pagination';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import BaseSelect from '@/components/primitives/BaseSelect';
import PrimaryButton from '@/components/primitives/PrimaryButton';
import PageTitle from '@/layouts/AppShell/PageTitle';

import LoanApplicationForm from './LoanApplicationForm.vue';
import { loanApplicationFormLabels } from './labels';

import { listLoans, formatAmount } from '@/features/loans/service';
import type {
  Loan,
  LoanStatus,
  ListLoansQuery,
} from '@/features/loans/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanListViewLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const router = useRouter();

// -----------------------------------------------------------------------------
// Page title suffix
// -----------------------------------------------------------------------------
/*
 * The application name, injected at build time by Vite from
 * VITE_APP_NAME. The variable is declared non-optional in
 * vite-env.d.ts (v1.1.0), so the assignment is a plain string, not
 * `string | undefined`.
 *
 * The value is set per build mode:
 *   workspace  →  "MASES"
 *   portal     →  "Maale Arna Portal"
 *
 * This view is mounted in the workspace build only. The portal has
 * its own loans list surface (MyLoansPage.vue), which is a different
 * component in a different route tree.
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// List state (local — see the file header comment)
// -----------------------------------------------------------------------------

/*
 * `isLoading` defaults to `true`. The component begins its life in the
 * loading state and only leaves it when the first fetch resolves or
 * rejects.
 */
type ListState = 'loading' | 'error' | 'empty' | 'ready';

const loans = ref<readonly Loan[]>([]);
const meta = ref<Record<string, unknown>>({});
const isLoading = ref<boolean>(true);
const loadError = ref<unknown | null>(null);

const statusFilter = ref<string>('all');
const activeFilter = ref<string>('all');
const inArrearsFilter = ref<string>('all');
const currentPage = ref<number>(1);

// -----------------------------------------------------------------------------
// Derived state
// -----------------------------------------------------------------------------
const state = computed<ListState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (loans.value.length === 0) return 'empty';
  return 'ready';
});

/*
 * Pagination meta reads. The backend wraps pagination inside a
 * `pagination` object; the two computed properties below read
 * defensively.
 */
const paginationMeta = computed<Record<string, unknown>>(() => {
  const raw = meta.value.pagination;
  return typeof raw === 'object' && raw !== null
    ? (raw as Record<string, unknown>)
    : {};
});

const totalPages = computed<number>(() => {
  const n = paginationMeta.value.last_page;
  return typeof n === 'number' && n > 0 ? n : 1;
});

const perPageForPagination = computed<number>(() => {
  const raw = paginationMeta.value.per_page;
  return typeof raw === 'number' && raw > 0 ? raw : 20;
});

const totalItemsForPagination = computed<number>(() => {
  const raw = paginationMeta.value.total;
  return typeof raw === 'number' && raw >= 0 ? raw : 0;
});

const showPagination = computed<boolean>(
  () => state.value === 'ready' && totalPages.value > 1,
);

// -----------------------------------------------------------------------------
// Filter options
// -----------------------------------------------------------------------------
const statusOptions = computed(() => [
  { value: 'all',           label: props.labels.filterAllLabel },
  { value: 'draft',         label: props.labels.statusDraft },
  { value: 'submitted',     label: props.labels.statusSubmitted },
  { value: 'under_review',  label: props.labels.statusUnderReview },
  { value: 'approved',      label: props.labels.statusApproved },
  { value: 'rejected',      label: props.labels.statusRejected },
  { value: 'disbursed',     label: props.labels.statusDisbursed },
  { value: 'active',        label: props.labels.statusActive },
  { value: 'in_arrears',    label: props.labels.statusInArrears },
  { value: 'restructured',  label: props.labels.statusRestructured },
  { value: 'written_off',   label: props.labels.statusWrittenOff },
  { value: 'settled',       label: props.labels.statusSettled },
  { value: 'closed',        label: props.labels.statusClosed },
]);

const activeOptions = computed(() => [
  { value: 'all',  label: props.labels.activeFilterAll },
  { value: 'only', label: props.labels.activeFilterOnly },
]);

const inArrearsOptions = computed(() => [
  { value: 'all',  label: props.labels.inArrearsFilterAll },
  { value: 'only', label: props.labels.inArrearsFilterOnly },
]);

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
type MutableListLoansQuery = {
  -readonly [K in keyof ListLoansQuery]: ListLoansQuery[K];
};

function buildQuery(): ListLoansQuery {
  const query: MutableListLoansQuery = {
    page: currentPage.value,
  };

  if (statusFilter.value !== 'all') {
    query.status = statusFilter.value as LoanStatus;
  }
  if (activeFilter.value === 'only') {
    query.active_only = true;
  }
  if (inArrearsFilter.value === 'only') {
    query.in_arrears = true;
  }

  return query;
}

async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listLoans(buildQuery());
    loans.value = result.items;
    meta.value = result.meta as Record<string, unknown>;
  } catch (err) {
    loadError.value = err;
  } finally {
    isLoading.value = false;
  }
}

// -----------------------------------------------------------------------------
// Debounced reload on filter / page change
// -----------------------------------------------------------------------------
const DEBOUNCE_MS = 300;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleLoad(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void load();
  }, DEBOUNCE_MS);
}

watch([statusFilter, activeFilter, inArrearsFilter], () => {
  currentPage.value = 1;
  scheduleLoad();
});

watch(currentPage, () => {
  void load();
});

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Table columns
// -----------------------------------------------------------------------------
const columns = computed<readonly DataTableColumn[]>(() => [
  { key: 'loan',        label: props.labels.columnLoan,        align: 'start' },
  { key: 'principal',   label: props.labels.columnPrincipal,   align: 'end'   },
  { key: 'outstanding', label: props.labels.columnOutstanding, align: 'end'   },
  { key: 'status',      label: props.labels.columnStatus,      align: 'start' },
  { key: 'applied',     label: props.labels.columnApplied,     align: 'start' },
  { key: 'actions',     label: props.labels.columnActions,     align: 'end'   },
]);

function rowKey(row: unknown): string {
  return String((row as Loan).id);
}

function asLoan(row: unknown): Loan {
  return row as Loan;
}

// -----------------------------------------------------------------------------
// Currency read
// -----------------------------------------------------------------------------
function currencyOf(loan: Loan): string {
  return loan.currency ?? '';
}

// -----------------------------------------------------------------------------
// Status label and variant mapping
// -----------------------------------------------------------------------------
function statusLabel(status: LoanStatus): string {
  const map: Record<LoanStatus, string> = {
    draft:        props.labels.statusDraft,
    submitted:    props.labels.statusSubmitted,
    under_review: props.labels.statusUnderReview,
    approved:     props.labels.statusApproved,
    rejected:     props.labels.statusRejected,
    disbursed:    props.labels.statusDisbursed,
    active:       props.labels.statusActive,
    in_arrears:   props.labels.statusInArrears,
    restructured: props.labels.statusRestructured,
    written_off:  props.labels.statusWrittenOff,
    settled:      props.labels.statusSettled,
    closed:       props.labels.statusClosed,
  };
  return map[status];
}

function statusVariant(
  status: LoanStatus,
): 'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent' {
  switch (status) {
    case 'draft':
    case 'closed':
      return 'neutral';
    case 'submitted':
    case 'under_review':
      return 'info';
    case 'approved':
    case 'disbursed':
      return 'accent';
    case 'active':
    case 'settled':
      return 'success';
    case 'in_arrears':
    case 'restructured':
      return 'warning';
    case 'rejected':
    case 'written_off':
      return 'danger';
  }
}

// -----------------------------------------------------------------------------
// Row actions
// -----------------------------------------------------------------------------
function rowActionsFor(_loan: Loan) {
  return [
    { key: 'view', label: props.labels.actionView, icon: 'eye' },
  ];
}

// -----------------------------------------------------------------------------
// Row-actions menu open state (single-open control)
// -----------------------------------------------------------------------------
const openRowId = ref<string | null>(null);

function isRowMenuOpen(rowId: string): boolean {
  return openRowId.value === rowId;
}

function onRowMenuOpenChange(rowId: string, open: boolean): void {
  openRowId.value = open ? rowId : null;
}

async function onRowAction(loan: Loan, actionKey: string): Promise<void> {
  if (actionKey === 'view') {
    await router.push(`/loans/${loan.id}`);
  }
}

// -----------------------------------------------------------------------------
// New-loan dialog (CR-LW2)
// -----------------------------------------------------------------------------
/*
 * The list view owns the LoanApplicationForm dialog. See the file
 * header §"The 'New loan' dialog" for the reasoning.
 */
const isApplicationOpen = ref<boolean>(false);

function onCreate(): void {
  isApplicationOpen.value = true;
}

function onApplicationSubmitted(): void {
  /*
   * The dialog has already emitted `update:open: false` (it closes
   * itself after `submitted` — see LoanApplicationForm.vue). This
   * handler reloads the list so the newly-created loan appears at the
   * top (the backend orders by `application_date DESC, id DESC`).
   */
  void load();
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .loan-list-view root div so that its lifetime matches the
    route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="loan-list-view"
    :data-state="state"
    data-testid="loan-list-view-root"
  >
    <!-- ============================================================
         Page header (title + description + new-loan action)
         ============================================================ -->
    <PageHeader
      :title="labels.pageTitle"
      :description="labels.pageDescription"
    >
      <PermissionGate permission="loan.apply">
        <PrimaryButton
          type="button"
          data-testid="loan-list-view-new"
          @click="onCreate"
        >{{ labels.newLoanLabel }}</PrimaryButton>
      </PermissionGate>
    </PageHeader>

    <!-- ============================================================
         Filter row
         ============================================================ -->
    <div class="loan-list-view__controls">
      <BaseSelect
        v-model="statusFilter"
        :aria-label="labels.statusFilterLabel"
        :options="statusOptions"
        data-testid="loan-list-view-status"
      />

      <BaseSelect
        v-model="activeFilter"
        :aria-label="labels.activeFilterLabel"
        :options="activeOptions"
        data-testid="loan-list-view-active"
      />

      <BaseSelect
        v-model="inArrearsFilter"
        :aria-label="labels.inArrearsFilterLabel"
        :options="inArrearsOptions"
        data-testid="loan-list-view-arrears"
      />
    </div>

    <!-- ============================================================
         Content (four states)
         ============================================================ -->
    <Card padding="none">
      <!-- Loading -->
      <LoadingState
        v-if="state === 'loading'"
        :message="labels.loadingMessage"
        data-testid="loan-list-view-loading"
      />

      <!-- Error -->
      <ErrorState
        v-else-if="state === 'error'"
        :title="labels.errorMessage"
        :action-label="labels.errorRetryLabel"
        data-testid="loan-list-view-error"
        @action="load"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="loan-list-view-empty"
      />

      <!-- Ready -->
      <template v-else>
        <DataTable
          :columns="columns"
          :rows="loans"
          :row-key="rowKey"
          data-testid="loan-list-view-table"
        >
          <!-- Loan identifier — a link to the detail page. -->
          <template #cell:loan="{ row }">
            <RouterLink
              class="loan-list-view__loan-link"
              :to="`/loans/${asLoan(row).id}`"
            >#{{ asLoan(row).id }}</RouterLink>
          </template>

          <!-- Principal — formatted via the shared service helper. -->
          <template #cell:principal="{ row }">
            {{ formatAmount(asLoan(row).principal_amount, currencyOf(asLoan(row))) }}
          </template>

          <!-- Outstanding total — formatted via the shared service helper. -->
          <template #cell:outstanding="{ row }">
            {{ formatAmount(asLoan(row).outstanding_total, currencyOf(asLoan(row))) }}
          </template>

          <!-- Status — badge. -->
          <template #cell:status="{ row }">
            <StatusBadge
              :status="asLoan(row).status"
              :variant="statusVariant(asLoan(row).status)"
              :label="statusLabel(asLoan(row).status)"
              data-testid="loan-list-view-status"
            />
          </template>

          <!-- Applied — the backend-supplied localized display string. -->
          <template #cell:applied="{ row }">
            {{ asLoan(row).application_date_display }}
          </template>

          <!-- Actions -->
          <template #cell:actions="{ row }">
            <DropdownMenu
              :open="isRowMenuOpen(String(asLoan(row).id))"
              :items="rowActionsFor(asLoan(row))"
              @update:open="
                (v) => onRowMenuOpenChange(String(asLoan(row).id), v)
              "
              @select="(key) => onRowAction(asLoan(row), key)"
            >
              <template
                #default="{
                  triggerId,
                  toggle,
                  ariaHaspopup,
                  ariaExpanded,
                  ariaControls,
                }"
              >
                <button
                  :id="triggerId"
                  type="button"
                  class="loan-list-view__row-actions-trigger"
                  :aria-haspopup="ariaHaspopup"
                  :aria-expanded="ariaExpanded"
                  :aria-controls="ariaControls"
                  :aria-label="labels.rowActionsAriaLabel"
                  @click="toggle"
                >
                  ⋯
                </button>
              </template>
            </DropdownMenu>
          </template>
        </DataTable>

        <!-- Pagination -->
        <div
          v-if="showPagination"
          class="loan-list-view__pagination"
          data-testid="loan-list-view-pagination"
        >
          <Pagination
            v-model:page="currentPage"
            :pages="totalPages"
            :per-page="perPageForPagination"
            :total-items="totalItemsForPagination"
            :ariaLabel="labels.paginationAriaLabel"
            :per-page-label="''"
            :previous-label="labels.paginationPrevLabel"
            :next-label="labels.paginationNextLabel"
            :show-total="false"
          />
        </div>
      </template>
    </Card>

    <!-- ============================================================
         New-loan dialog (CR-LW2)
         ============================================================ -->
    <LoanApplicationForm
      v-model:open="isApplicationOpen"
      :labels="loanApplicationFormLabels"
      @submitted="onApplicationSubmitted"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.loan-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Filter row
   ---------------------------------------------------------------------------
   Three filter selects. On desktop they sit side by side at their
   natural widths; on mobile the row stacks so each select is a
   comfortable tap target.
   ============================================================================ */
.loan-list-view__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mases-space-3);
}

.loan-list-view__controls > * {
  flex: 0 0 auto;
}

/* ============================================================================
   Loan link
   ============================================================================ */
.loan-list-view__loan-link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
  font-variant-numeric: tabular-nums;
}

.loan-list-view__loan-link:hover {
  text-decoration: underline;
}

.loan-list-view__loan-link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Row actions trigger
   ============================================================================ */
.loan-list-view__row-actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mases-space-6);
  height: var(--mases-space-6);
  padding: 0;
  border: 0;
  border-radius: var(--mases-radius-md);
  background-color: transparent;
  color: var(--mases-color-icon-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: 1;
  cursor: pointer;
}

.loan-list-view__row-actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.loan-list-view__row-actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Pagination wrapper
   ============================================================================ */
.loan-list-view__pagination {
  display: flex;
  justify-content: center;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   The filter row stacks.
   ============================================================================ */
@media (max-width: 639px) {
  .loan-list-view__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .loan-list-view__controls > * {
    width: 100%;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-list-view {
    /* no-op placeholder */
  }
}
</style>