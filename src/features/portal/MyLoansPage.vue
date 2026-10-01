<!--
=============================================================================
 CHANGE VERIFICATION — CR-L3 · File 4 · Revision 1.0.1
=============================================================================

 File:      mase_app/src/features/portal/MyLoansPage.vue  (AMEND — revision)
 Unit:      CR-L3 — Portal self-service loans pages (list)
 Delivery type:  Amendment — two call-site defensive reads; version bump.
 Net lines:      +2 call-site changes; ~20 lines docblock.

 Before (v1.0.0):
   The two monetary cells rendered through the shared formatAmount
   helper, passing the loan's currency directly:

     {{ formatAmount(asLoan(row).principal_amount, asLoan(row).currency) }}
     {{ formatAmount(asLoan(row).outstanding_total, asLoan(row).currency) }}

   Both calls assumed `currency` is always a string. The
   `Loan.currency` field is declared `string | null` as of CR-L3 file
   1's revision 1.0.1 (the schema column is nullable, and the
   LoanResource does not cast the value), so the assumption no longer
   compiles:

     · vue-tsc reports TS2345 on both call sites — passing
       `string | null` to a `string` parameter.

     · At runtime, a loan whose currency is null would pass null to
       formatAmount's `currency` parameter, whose string-concatenation
       tail would render the literal text "null" — producing a cell
       reading e.g. "10000.00 null".

 After (v1.0.1):
   Both call sites gain the nullish-coalescing default:

     {{ formatAmount(asLoan(row).principal_amount, asLoan(row).currency ?? '') }}
     {{ formatAmount(asLoan(row).outstanding_total, asLoan(row).currency ?? '') }}

   The `?? ''` reads are the file-1 revision's documented contract:
   the interface widens `currency` to `string | null`, and the two
   consuming pages handle the null case explicitly.

   The observable difference at runtime is confined to loans whose
   currency is null — a pre-disbursement draft. For such a loan the
   two cells render the amount followed by a trailing space rather
   than the literal text "null". For every other loan the rendered
   string is byte-for-byte identical to v1.0.0's.

   `MyLoanDetailPage.vue` (CR-L3 file 5) is not affected by this
   revision: it already reads through a local `currency` computed
   (`loan.value?.currency ?? ''`) and passes that computed to every
   formatAmount call.

 Compile-time dependency:
   · CR-L3 file 1 (`api.ts`) revision 1.0.1 — the `Loan.currency`
     type widening to `string | null`. The two revisions ship in the
     same batch. Shipping file 1 alone produces two TS2345 errors;
     shipping file 4 alone against a v1.0.0 api.ts is harmless
     (TypeScript accepts `?? ''` on a `string`-typed field — the
     right-hand branch is unreachable but legal).

   · No other CR-L3 file is affected by this revision.

 No structural change. The template's DataTable block, the four
 column definitions, the four cell templates (except the two
 formatAmount argument lists), the status label/variant helpers, the
 loading/empty/error states, and every CSS rule are byte-for-byte
 identical to v1.0.0.

 =============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — MyLoansPage
=============================================================================

 File:      mase_app/src/features/portal/MyLoansPage.vue
 Layer:     Features (Portal)
 Version:   1.0.1
 Status:    FROZEN
 Authority: CR-L1 (/api/loans/me contract)
            CR-L3 (this delivery)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §13.3

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-L3).
 1.0.1  — defensive currency reads.
          · The two monetary cells (principal, outstanding) now pass
            `asLoan(row).currency ?? ''` to formatAmount, matching the
            `Loan.currency` type widening to `string | null` in
            @/features/loans/api v1.0.1.
          · No structural change. No new labels. No new state. The
            four-column table, the five-state machine, the status
            helpers, and every CSS rule are unchanged.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the authenticated caller's own loans — one row per loan. The
 page reads its identity from the provided useMyShareholder state (the
 same shared instance every portal page consumes) and calls
 getMyLoans() — the CR-L1 self-service endpoint that resolves the
 caller's own loans server-side through the tenant → user → shareholder
 → loans chain.

 The page does not call the API client directly, does not accept a
 loan id or shareholder id as input, and does not fall back to any
 other endpoint.

 -----------------------------------------------------------------------------
 The five states
 -----------------------------------------------------------------------------
   loading    — the identity composable is resolving, OR the loans
                fetch is idle or in-flight.
   unlinked   — identity contract returned { linked: false } — the
                caller has no own shareholder record. Renders the
                shared unlinked panel.
   error      — identity fetch failed, OR loans fetch failed. Retry is
                state-aware: it reloads whichever layer failed.
   empty      — identity linked, loans loaded, zero items.
   ready      — identity linked, loans loaded, one or more items.

 -----------------------------------------------------------------------------
 The empty state — why there is no distinct no-loans state
 -----------------------------------------------------------------------------
 The wallet page (CR-W2) introduced a distinct `no-wallet` state
 because a shareholder with no wallet is a state the page's copy
 wanted to distinguish from "unlinked". For loans, the analogous
 condition — a shareholder with no loans — does not warrant a
 separate state:

   · A newly-registered shareholder normally has no loans. That is
     the expected starting state, not an anomaly. The ordinary
     "empty" copy ("You have no loans yet") is the honest phrasing.

   · The loans endpoint's two-outcome contract returns
     { linked: true, loans: [] } for a linked caller with no loans and
     { linked: false, loans: [] } for a caller with no shareholder
     record. The identity layer already covers the second case: when
     identity is 'unlinked', the page renders the shared unlinked
     panel and never calls getMyLoans(). So the /me endpoint's
     `linked: false` branch is only reachable in a genuinely
     unexpected situation (a race between the two endpoints, a tenant
     mismatch); the page handles it defensively by treating it as
     "empty" — the caller has no loans visible.

 -----------------------------------------------------------------------------
 Data shape
 -----------------------------------------------------------------------------
 The page owns two page-local refs — `loans` and `dataState` — plus a
 `dataError` ref for diagnostic retention. This mirrors the pattern
 MyCertificatesPage.vue uses for its certificates data. Per Freeze
 §13.3, the state lives in the page's ref; the service layer is
 stateless.

 The `getMyLoans()` response is the two-outcome contract
 `{ linked: boolean, loans: readonly Loan[] }`. The page stores the
 `loans` array regardless of which outcome the backend returned — a
 defensive choice documented in §"The empty state".

 -----------------------------------------------------------------------------
 The principal cell — a link to the detail page
 -----------------------------------------------------------------------------
 Each row's principal-amount cell is a RouterLink to /my/loans/:id
 (the detail page, CR-L3 file 5). This mirrors the
 ShareholderListView.vue pattern, whose name cell is a RouterLink to
 /shareholders/:id. A single link, not a row-actions dropdown, is the
 right control for a list with one destination per row.

 The remaining three cells (outstanding, status, applied) render
 plain text. The outstanding amount and the applied date are
 secondary information; the status is a StatusBadge.

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 The `applied` column renders the backend-supplied
 `application_date_display` field, which carries the
 locale-appropriate medium Ethiopian form
 (`መስከረም 5, 2018 ዓ.ም. (September 15, 2025)` for `am`,
 `Meskerem 5, 2018 E.C. (September 15, 2025)` for `en`). The frontend
 does no date formatting of its own.

 The ISO `application_date` field remains available on the wire for
 consumers that need a machine-readable instant; this page does not
 use it.

 -----------------------------------------------------------------------------
 Monetary rendering  (revised in 1.0.1)
 -----------------------------------------------------------------------------
 The principal and outstanding cells render their decimal strings
 through formatAmount() — re-exported from @/features/wallet/service
 via @/features/loans/service (CR-L3 file 2). formatAmount renders the
 backend's decimal string at a fixed two-decimal precision and
 appends the currency code. It performs no arithmetic and never
 converts the string to a JavaScript number.

 The loan's `currency` field is nullable on the wire — a
 pre-disbursement draft loan carries `currency: null` — so both call
 sites pass `asLoan(row).currency ?? ''`. For a null currency the cell
 renders the amount followed by a trailing space rather than the
 literal text "null"; for every loan with a currency the rendered
 string is identical to the pre-1.0.1 output.

 See CR-L3 file 1 revision 1.0.1 for the interface's type widening.

 -----------------------------------------------------------------------------
 Status rendering
 -----------------------------------------------------------------------------
 The LoanResource emits the loan's `status` as the raw C4 backing
 value; it does NOT emit a `status_label`. This page maps each of the
 twelve LoanStatus values to a display string (from the labels prop,
 via the LoanStatusLabels interface both loans pages extend) and to a
 StatusBadge variant (in the `statusVariant()` helper below).

 The variant mapping:
     draft, closed                          → neutral
     submitted, under_review                → info
     approved, disbursed                    → accent
     active, settled                        → success
     in_arrears, restructured               → warning
     rejected, written_off                  → danger

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
import type { MyLoansPageLabels } from './labels';
export type { MyLoansPageLabels };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { useMyShareholder } from './useMyShareholder';
import { getMyLoans, formatAmount } from '@/features/loans/service';
import type { Loan, LoanStatus } from '@/features/loans/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: MyLoansPageLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Identity state (provided by PortalLayout)
// -----------------------------------------------------------------------------
const { state: identityState, shareholder, load: loadIdentity } =
  useMyShareholder();

// -----------------------------------------------------------------------------
// Loans data state (page-local)
// -----------------------------------------------------------------------------
type DataState = 'idle' | 'loading' | 'ready' | 'error';

const loans = ref<readonly Loan[]>([]);
const dataState = ref<DataState>('idle');
const dataError = ref<unknown | null>(null);

async function loadLoans(): Promise<void> {
  dataState.value = 'loading';
  dataError.value = null;

  try {
    const response = await getMyLoans();

    /*
     * The response carries the two-outcome contract
     * `{ linked: boolean, loans: readonly Loan[] }`. When the identity
     * layer has already confirmed the caller is linked, the backend
     * is expected to return `linked: true` (with a possibly-empty
     * loans array). The `linked: false` branch is only reachable in
     * an unexpected situation — a race between the two endpoints, a
     * tenant mismatch — and in that case the caller simply has no
     * loans visible, which the empty state conveys adequately.
     *
     * Either branch is therefore stored the same way: the `loans`
     * array (empty when unlinked) is the page's data, and the
     * `empty`/`ready` distinction is driven by its length. This is
     * the defensive choice documented in the file header §"The empty
     * state".
     */
    loans.value = response.loans;
    dataState.value = 'ready';
  } catch (err) {
    dataError.value = err;
    loans.value = [];
    dataState.value = 'error';
  }
}

/*
 * Load the loans once the identity has resolved to a linked
 * shareholder. The watcher fires on the null → record transition, or
 * immediately if the identity was already resolved when this page
 * mounted (navigating between portal pages reuses the layout's shared
 * instance). If the identity contract returns unlinked or errors, the
 * watcher's guard is false and no loans fetch is issued — the page
 * renders the appropriate state without a wasted request.
 */
watch(
  shareholder,
  (s) => {
    if (s !== null && dataState.value === 'idle') {
      void loadLoans();
    }
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Page state — the union of identity and data states
// -----------------------------------------------------------------------------
type PageState = 'loading' | 'unlinked' | 'error' | 'empty' | 'ready';

const pageState = computed<PageState>(() => {
  if (identityState.value === 'loading') return 'loading';
  if (identityState.value === 'unlinked') return 'unlinked';
  if (identityState.value === 'error') return 'error';

  // identity is 'linked' from here on
  if (dataState.value === 'idle' || dataState.value === 'loading') {
    return 'loading';
  }
  if (dataState.value === 'error') return 'error';
  if (loans.value.length === 0) return 'empty';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Page-level retry — state-aware
// -----------------------------------------------------------------------------
/*
 * Dispatches the retry at whichever layer failed. If the identity
 * never resolved, the identity fetch is retried; otherwise the loans
 * fetch is retried. Mirrors MyCertificatesPage.vue's retry().
 */
function retry(): void {
  if (shareholder.value === null) {
    void loadIdentity();
    return;
  }
  void loadLoans();
}

// -----------------------------------------------------------------------------
// Table columns
// -----------------------------------------------------------------------------
const columns = computed<readonly DataTableColumn[]>(() => [
  { key: 'principal', label: props.labels.columnPrincipal, align: 'end' },
  { key: 'outstanding', label: props.labels.columnOutstanding, align: 'end' },
  { key: 'status', label: props.labels.columnStatus, align: 'start' },
  { key: 'applied', label: props.labels.columnApplied, align: 'start' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to Loan.
 */
function rowKey(row: unknown): string {
  return String((row as Loan).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to Loan at the point of use. Remove once
 * DataTable accepts a generic row type.
 */
function asLoan(row: unknown): Loan {
  return row as Loan;
}

// -----------------------------------------------------------------------------
// Status label and variant mapping
// -----------------------------------------------------------------------------
/*
 * The LoanResource emits the loan's `status` as the raw C4 backing
 * value; it does NOT emit a `status_label` the way the
 * ShareholderResource and ShareCertificateResource do. This page maps
 * each of the twelve values to a display string (from the labels
 * prop, via LoanStatusLabels) and to a StatusBadge variant.
 *
 * The label map is exhaustive over LoanStatus. A future CR that
 * extends the backend enum extends the union in @/features/loans/api
 * and the labels in ./labels in the same change; the map below will
 * fail to compile if the union grows without a new branch.
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
 * Maps each LoanStatus to a valid BadgeVariant token. The mapping is
 * documented in the file header §"Status rendering". The BadgeVariant
 * union is:
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
    class="my-loans-page"
    :data-state="pageState"
    data-testid="my-loans-page-root"
  >
    <!-- ============================================================
         Loading (identity OR loans)
         ============================================================ -->
    <LoadingState
      v-if="pageState === 'loading'"
      :message="labels.loadingMessage"
      data-testid="my-loans-page-loading"
    />

    <!-- ============================================================
         Unlinked
         ============================================================ -->
    <EmptyState
      v-else-if="pageState === 'unlinked'"
      :title="labels.unlinkedTitle"
      :description="labels.unlinkedDescription"
      data-testid="my-loans-page-unlinked"
    />

    <!-- ============================================================
         Error (page-level)
         ============================================================ -->
    <ErrorState
      v-else-if="pageState === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="my-loans-page-error"
      @action="retry"
    />

    <!-- ============================================================
         Ready / empty (both under a page header)
         ============================================================ -->
    <template v-else>
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <EmptyState
        v-if="pageState === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="my-loans-page-empty"
      />

      <Card
        v-else
        padding="none"
        data-testid="my-loans-page-table-card"
      >
        <DataTable
          :columns="columns"
          :rows="loans"
          :row-key="rowKey"
          data-testid="my-loans-page-table"
        >
          <!--
            Principal — the row's primary identifying value and the
            row's only link. The cell is a RouterLink to the loan's
            detail page, mirroring ShareholderListView.vue's name-cell
            pattern.

            The currency read is defensive (`?? ''`) — the loan's
            `currency` field is nullable on the wire. See the file
            header §"Monetary rendering" and CR-L3 file 1's revision
            1.0.1.
          -->
          <template #cell:principal="{ row }">
            <RouterLink
              class="my-loans-page__link"
              :to="`/my/loans/${asLoan(row).id}`"
            >{{ formatAmount(asLoan(row).principal_amount, asLoan(row).currency ?? '') }}</RouterLink>
          </template>

          <!--
            Outstanding — the loan's total remaining balance, rendered
            through the shared monetary formatter. Same defensive
            currency read as the principal cell above.
          -->
          <template #cell:outstanding="{ row }">
            {{ formatAmount(asLoan(row).outstanding_total, asLoan(row).currency ?? '') }}
          </template>

          <!--
            Status — the loan's raw C4 status, mapped to a display
            label and a BadgeVariant by the two helpers above.
          -->
          <template #cell:status="{ row }">
            <StatusBadge
              :status="asLoan(row).status"
              :variant="statusVariant(asLoan(row).status)"
              :label="statusLabel(asLoan(row).status)"
              data-testid="my-loans-page-status"
            />
          </template>

          <!--
            Applied — the loan's application date, rendered directly
            from the backend-supplied `_display` string. No frontend
            date formatting.
          -->
          <template #cell:applied="{ row }">
            {{ asLoan(row).application_date_display }}
          </template>
        </DataTable>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.my-loans-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Row link
   ---------------------------------------------------------------------------
   The principal cell's RouterLink. Matches the ShareholderListView's
   name-link styling — a brand-colored link with an underline on
   hover and a visible focus ring.
   ============================================================================ */
.my-loans-page__link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
}

.my-loans-page__link:hover {
  text-decoration: underline;
}

.my-loans-page__link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .my-loans-page {
    /* no-op placeholder */
  }
}
</style>