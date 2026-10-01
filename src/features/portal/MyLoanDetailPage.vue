<!--
=============================================================================
 CHANGE VERIFICATION — CR-L3
=============================================================================

 File:      mase_app/src/features/portal/MyLoanDetailPage.vue  (NEW)
 Unit:      CR-L3 — Portal self-service loans pages (detail)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The portal had no loan detail view. The
   loans list page (CR-L3 file 4) linked to /my/loans/:id, but the
   destination route was unregistered and the destination component
   was absent.

 After:
   A detail page for a single loan — two sections, following
   WalletDetailView.vue's structure but narrower:

     1. The loan card — a definition list of the loan's own fields
        (product name, status badge, principal, term, outstanding
        total, purpose, and the five lifecycle dates), each label
        from the labels prop.

     2. The schedule card — the loan's installment schedule as a
        five-column table (number, due date, expected, settled,
        remaining), or an empty message when the collection is empty.

   Four states:
     loading   — the fetch is in flight
     error     — the fetch failed for a non-404 reason; retry available
     empty     — 404 (loan does not exist, or belongs to another tenant)
     ready     — the loan is loaded

   The `empty` state is the 404 branch, matching ShareholderDetailView
   .vue's `notFound` pattern: a 404 is distinguished from a generic
   failure and rendered as "Loan not found" rather than a generic error
   with retry.

   The page reads its labels from the labels prop. It reads its loan
   data through a single call to `fetchLoanDetail(id)` — CR-L3 file 2's
   composite fetcher — which unwraps the aggregate response into the
   loan plus its product summary plus its installments array.

 Dependency note:
   · Depends on `fetchLoanDetail` and `formatAmount` in
     @/features/loans/service (CR-L3 file 2).
   · Depends on MyLoanDetailPageLabels and myLoanDetailPageLabels in
     ./labels (CR-L3 file 3).
   · Depends on the CR-L1 backend for the aggregate
     GET /api/loans/{loan} route to be reachable under the corrected
     /api prefix. Until CR-L1 file 1 (config prefix fix) is deployed,
     the endpoint resolves at /loans/{loan}, not /api/loans/{loan},
     and the fetch 404s.
   · Depends on the CR-L2 backend `_display` fields on LoanResource
     and LoanInstallmentResource being present for the date cells to
     render the localized values. Until CR-L2 is deployed, the four
     `_display` fields on the loan row and the two on each installment
     are undefined, and the cells render empty.
   · Depends on the CR-L3 file 6 route registration for
     /my/loans/:id to resolve.
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — MyLoanDetailPage
=============================================================================

 File:      mase_app/src/features/portal/MyLoanDetailPage.vue
 Layer:     Features (Portal)
 Version:   1.0.0
 Status:    FROZEN
 Authority: CR-L1 (the aggregate /loans/{loan} contract)
            CR-L3 (this delivery)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §13.3

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders a single loan's detail — the loan's own fields plus its
 installment schedule. The page reads its id from the route parameter
 and fetches the loan through `fetchLoanDetail(id)` — a single call to
 the aggregate endpoint, which the backend's LoanController::show()
 eager-loads with the borrower, product, installments, collaterals,
 restructurings, writeOff, and statusHistories relations.

 The page surfaces the product summary and the installments collection;
 the other relations are present in the wire payload but not consumed
 by the portal. The page does not fetch a separate schedule endpoint —
 the aggregate response carries the full installments array.

 -----------------------------------------------------------------------------
 The four states
 -----------------------------------------------------------------------------
   loading   — the fetch is in flight
   error     — a non-404 failure; retry available
   empty     — a 404 (invalid route id, or a loan the caller may not
               see); rendered as "Loan not found" rather than an error
   ready     — the loan is loaded

 The 404 / error distinction matches ShareholderDetailView.vue's
 pattern. The route id is validated client-side before the fetch; an
 invalid id (a non-numeric or non-positive value in the URL) short-
 circuits directly to `empty` without a request.

 -----------------------------------------------------------------------------
 The two sections
 -----------------------------------------------------------------------------
 1. The loan card — a definition list with a two-column row layout,
    the same grammar as WalletDetailView.vue's balance card. Rows:
    product name, status badge, principal, term, outstanding total,
    purpose, and the five lifecycle dates. Optional rows (purpose and
    the four nullable dates) render conditionally.

 2. The schedule card — a DataTable with five columns: number, due
    date, expected amount, settled amount, remaining amount. The
    installments collection is sorted by `installment_number` ascending
    by the backend's `installments()` relation (A.18); the page does
    not re-sort. When the collection is empty, an empty message
    replaces the table.

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 Every date value the page renders is the backend-supplied `_display`
 field, not the raw ISO. The frontend does no date formatting:

   · Loan lifecycle dates → application_date_display,
     decision_date_display, disbursement_date_display,
     maturity_date_display, closed_at_display.
   · Installment due dates → due_date_display.

 The ISO fields remain available on the wire for consumers that need
 a machine-readable instant; this page does not use them.

 -----------------------------------------------------------------------------
 Monetary rendering
 -----------------------------------------------------------------------------
 Every monetary value is rendered through formatAmount() (re-exported
 from @/features/wallet/service via @/features/loans/service). The
 helper renders the backend's decimal string at a fixed two-decimal
 precision and appends the currency code.

 The `currency` field of the loan is nullable in the schema and the
 LoanResource does not cast it to string — a pre-disbursement draft
 can emit `currency: null`. Every formatAmount call site defends with
 `loan.currency ?? ''` so a null currency produces a trailing space
 rather than the literal string "null". The interface amendment to
 declare `currency: string | null` is a follow-up micro-CR.

 -----------------------------------------------------------------------------
 Status rendering
 -----------------------------------------------------------------------------
 The LoanResource emits the loan's `status` as the raw C4 backing
 value; it does NOT emit a `status_label`. This page maps each of the
 twelve values to a display string (from the labels prop, via the
 LoanStatusLabels interface) and to a StatusBadge variant through the
 two helpers below.

 The variant mapping mirrors MyLoansPage.vue's — the same twelve
 values, the same variant assignment — kept local to this file
 rather than shared, matching the codebase's pattern of local helpers
 per page (WalletDetailView.vue has its own paymentMethodLabel;
 ShareholderDetailView.vue has its own shareholderStatusVariant).

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
/*
 * The page's labels type is imported from ./labels and re-exported here
 * for consumers that import the type from the component module. The
 * source of truth remains ./labels.
 */
import type { MyLoanDetailPageLabels } from './labels';
export type { MyLoanDetailPageLabels };
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { fetchLoanDetail, formatAmount } from '@/features/loans/service';
import type {
  Loan,
  LoanInstallment,
  LoanProductSummary,
  LoanStatus,
} from '@/features/loans/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: MyLoanDetailPageLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
/*
 * A numeric, positive id is required. A non-numeric, zero, or negative
 * route parameter is treated as not-found without a network request —
 * a URL that cannot correspond to a well-formed loan resource.
 */
const routeId = computed<number | null>(() => {
  const raw = route.params.id;
  const asString = typeof raw === 'string' ? raw : '';
  const parsed = Number.parseInt(asString, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const loan = ref<Loan | null>(null);
const product = ref<LoanProductSummary | null>(null);
const installments = ref<readonly LoanInstallment[]>([]);
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);
const notFound = ref<boolean>(false);

const state = computed<ViewState>(() => {
  if (isLoading.value) return 'loading';
  if (notFound.value) return 'empty';
  if (loadError.value !== null) return 'error';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Error classification
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly httpStatus?: unknown;
  readonly status?: unknown;
}

function isNotFoundError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as NormalizedApiErrorLike;
  if (e.category === 'not-found') return true;
  if (e.httpStatus === 404 || e.status === 404) return true;
  return false;
}

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
async function load(): Promise<void> {
  const id = routeId.value;

  if (id === null) {
    loan.value = null;
    product.value = null;
    installments.value = [];
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    const detail = await fetchLoanDetail(id);
    loan.value = detail.loan;
    product.value = detail.product;
    installments.value = detail.installments;
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    loan.value = null;
    product.value = null;
    installments.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Currency — defensive read
// -----------------------------------------------------------------------------
/*
 * The loan's `currency` column is nullable in the schema, and the
 * LoanResource emits it without casting. A pre-disbursement loan can
 * therefore carry `currency: null` on the wire. Every formatAmount
 * call site reads this computed rather than the raw field, so a null
 * currency produces a trailing space rather than the literal string
 * "null".
 *
 * The interface amendment to declare `currency: string | null` on the
 * Loan interface (in @/features/loans/api) is a follow-up micro-CR;
 * until then, this computed provides the same safety at the call site.
 */
const currency = computed<string>(() => loan.value?.currency ?? '');

// -----------------------------------------------------------------------------
// Cast helpers for DataTable's non-generic cell slots
// -----------------------------------------------------------------------------
function asInstallment(row: unknown): LoanInstallment {
  return row as LoanInstallment;
}

// -----------------------------------------------------------------------------
// Schedule table
// -----------------------------------------------------------------------------
const scheduleColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'number', label: props.labels.scheduleColumnNumber, align: 'start' },
  { key: 'due_date', label: props.labels.scheduleColumnDueDate, align: 'start' },
  { key: 'expected', label: props.labels.scheduleColumnExpected, align: 'end' },
  { key: 'settled', label: props.labels.scheduleColumnSettled, align: 'end' },
  { key: 'remaining', label: props.labels.scheduleColumnRemaining, align: 'end' },
]);

function scheduleRowKey(row: unknown): string {
  return String((row as LoanInstallment).id);
}

// -----------------------------------------------------------------------------
// Status label and variant mapping
// -----------------------------------------------------------------------------
/*
 * The LoanResource emits the loan's `status` as the raw C4 backing
 * value; it does NOT emit a `status_label`. This page maps each of
 * the twelve values to a display string (from the labels prop, via
 * LoanStatusLabels) and to a StatusBadge variant.
 *
 * The map is exhaustive over LoanStatus. A future CR that extends the
 * backend enum extends the union in @/features/loans/api and the
 * labels in ./labels in the same change; the map below will fail to
 * compile if the union grows without a new branch.
 */
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

/*
 * Maps each LoanStatus to a valid BadgeVariant token. The mapping
 * mirrors MyLoansPage.vue's — the same twelve values, the same variant
 * assignment.
 *
 * The BadgeVariant union is:
 *   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'
 */
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
</script>

<template>
  <div
    class="my-loan-detail-page"
    :data-state="state"
    data-testid="my-loan-detail-page-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="my-loan-detail-page-loading"
    />

    <!-- ============================================================
         Error (non-404)
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="my-loan-detail-page-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404 or invalid route id)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="my-loan-detail-page-not-found"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="loan !== null">
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <!-- ============================================================
           Loan card
           ============================================================ -->
      <Card data-testid="my-loan-detail-page-loan">
        <template #header>
          <h2 class="my-loan-detail-page__section-title">
            {{ labels.loanSectionTitle }}
          </h2>
        </template>

        <dl class="my-loan-detail-page__loan-list">
          <!--
            Product — the loan product's locale-aware display name, when
            the product summary is present.
          -->
          <div
            v-if="product !== null"
            class="my-loan-detail-page__loan-row"
          >
            <dt>{{ labels.productLabel }}</dt>
            <dd>{{ product.display_name }}</dd>
          </div>

          <!-- Status — badge. -->
          <div class="my-loan-detail-page__loan-row">
            <dt>{{ labels.statusLabel }}</dt>
            <dd>
              <StatusBadge
                :status="loan.status"
                :variant="statusVariant(loan.status)"
                :label="statusLabel(loan.status)"
                data-testid="my-loan-detail-page-status"
              />
            </dd>
          </div>

          <!-- Principal — monetary. -->
          <div class="my-loan-detail-page__loan-row">
            <dt>{{ labels.principalLabel }}</dt>
            <dd>{{ formatAmount(loan.principal_amount, currency) }}</dd>
          </div>

          <!-- Term — a bare number of months. -->
          <div class="my-loan-detail-page__loan-row">
            <dt>{{ labels.termLabel }}</dt>
            <dd>{{ loan.term_months }}</dd>
          </div>

          <!-- Outstanding total — monetary, computed server-side. -->
          <div class="my-loan-detail-page__loan-row">
            <dt>{{ labels.outstandingTotalLabel }}</dt>
            <dd>{{ formatAmount(loan.outstanding_total, currency) }}</dd>
          </div>

          <!-- Purpose — optional free text. -->
          <div
            v-if="loan.purpose !== null"
            class="my-loan-detail-page__loan-row"
          >
            <dt>{{ labels.purposeLabel }}</dt>
            <dd>{{ loan.purpose }}</dd>
          </div>

          <!-- Applied on — always present. -->
          <div class="my-loan-detail-page__loan-row">
            <dt>{{ labels.applicationDateLabel }}</dt>
            <dd>{{ loan.application_date_display }}</dd>
          </div>

          <!-- Decided on — nullable. -->
          <div
            v-if="loan.decision_date_display !== null"
            class="my-loan-detail-page__loan-row"
          >
            <dt>{{ labels.decisionDateLabel }}</dt>
            <dd>{{ loan.decision_date_display }}</dd>
          </div>

          <!-- Disbursed on — nullable. -->
          <div
            v-if="loan.disbursement_date_display !== null"
            class="my-loan-detail-page__loan-row"
          >
            <dt>{{ labels.disbursementDateLabel }}</dt>
            <dd>{{ loan.disbursement_date_display }}</dd>
          </div>

          <!-- Matures on — nullable. -->
          <div
            v-if="loan.maturity_date_display !== null"
            class="my-loan-detail-page__loan-row"
          >
            <dt>{{ labels.maturityDateLabel }}</dt>
            <dd>{{ loan.maturity_date_display }}</dd>
          </div>

          <!-- Closed on — nullable. -->
          <div
            v-if="loan.closed_at_display !== null"
            class="my-loan-detail-page__loan-row"
          >
            <dt>{{ labels.closedAtLabel }}</dt>
            <dd>{{ loan.closed_at_display }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Schedule card
           ============================================================ -->
      <Card data-testid="my-loan-detail-page-schedule">
        <template #header>
          <h2 class="my-loan-detail-page__section-title">
            {{ labels.scheduleSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="installments.length > 0"
          :columns="scheduleColumns"
          :rows="installments"
          :row-key="scheduleRowKey"
          data-testid="my-loan-detail-page-schedule-table"
        >
          <template #cell:number="{ row }">
            {{ asInstallment(row).installment_number }}
          </template>

          <template #cell:due_date="{ row }">
            {{ asInstallment(row).due_date_display ?? '' }}
          </template>

          <template #cell:expected="{ row }">
            {{ formatAmount(asInstallment(row).expected_total, currency) }}
          </template>

          <template #cell:settled="{ row }">
            {{ formatAmount(asInstallment(row).settled_amount, currency) }}
          </template>

          <template #cell:remaining="{ row }">
            {{ formatAmount(asInstallment(row).remaining_total, currency) }}
          </template>
        </DataTable>

        <p
          v-else
          class="my-loan-detail-page__section-empty"
          data-testid="my-loan-detail-page-schedule-empty"
        >{{ labels.scheduleEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.my-loan-detail-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Loan list — definition list, same layout as WalletDetailView's balance
   card.
   ---------------------------------------------------------------------------
   MOBILE BASE: a single-column definition list. The label sits above
   the value, with a tight block gap.

   Tablet and up switch to a two-column grid at the min-width breakpoint
   below, with the value column twice as wide as the label column.
   ============================================================================ */
.my-loan-detail-page__loan-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.my-loan-detail-page__loan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .my-loan-detail-page__loan-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.my-loan-detail-page__loan-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.my-loan-detail-page__loan-row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Section title
   ============================================================================ */
.my-loan-detail-page__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Empty section message
   ============================================================================ */
.my-loan-detail-page__section-empty {
  margin: 0;
  padding-block: var(--mases-space-4);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .my-loan-detail-page {
    /* no-op placeholder */
  }
}
</style>