<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 7
=============================================================================

 File:      mase_app/src/features/loans/LoanScheduleView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 7
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~55 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.0):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at
   /loans/:id/schedule.

 After (v1.0.1):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "የመክፈያ መርሃግብር — MASES"
     Empty VITE_APP_NAME →  "የመክፈያ መርሃግብር"

   The portal build does not mount this view (the loan sub-resource
   views are workspace-only; the portal has no schedule route), so
   there is no portal title to verify for this file.

   The composed title uses the same `labels.pageTitle` string the
   view's PageHeader already renders as the page's <h1>. The browser
   tab and the page heading agree.

   No other behaviour change. Every existing import, ref, computed,
   handler, template element, test hook, and scoped style rule is
   byte-for-byte identical to v1.0.0.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanScheduleView.vue  (NEW)
 Unit:      CR-LW3 — Workspace loan sub-resource views (schedule)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The loan schedule endpoint
   (GET /api/loans/{loan}/schedule) was reachable only by direct
   request. The detail page's schedule section (CR-LW2) rendered the
   installments inline; there was no dedicated schedule view.

 After:
   A dedicated schedule page at /loans/:id/schedule. Renders:
     · a summary card with the loan's schedule-summary columns
       (monthly installment, total scheduled interest, total scheduled
       repayment, maturity date),
     · a schedule table with the loan's installments (five columns:
       number, due date, expected, settled, remaining),
     · a "back to loan" link above the page header.

   Structure follows WalletStatementView.vue's shape — a page header,
   a summary card, and a table — adapted to the schedule endpoint's
   narrower projection. The endpoint returns a `LoanSchedule` — the
   loan's identity and terms plus the installments collection and a
   `totals` block; this view renders the summary columns and the
   installments, not the `totals` block (the labels file carries no
   totals-block strings — a future CR that wants a totals card adds
   them).

   Four states: loading / error / empty (404) / ready. A ready state
   with zero installments (a pre-disbursement loan) renders the
   schedule card's `scheduleEmpty` message.

 =============================================================================
 The five schedule columns — no status column
 =============================================================================
 The schedule table renders five columns: number, due date, expected,
 settled, remaining.

 A status column is NOT rendered in this CR. The installment status
 vocabulary (five values — pending, partial, settled, overdue,
 superseded) has no Amharic labels in the labels module. A StatusBadge
 rendering the raw wire value would break the Amharic-first rule that
 governs every other table in the workspace.

 The `scheduleColumnStatus` field is declared in
 `LoanScheduleViewLabels` for the CR that adds the five installment
 status labels and lights up the column. Until then, the "remaining"
 column conveys the practical state of each installment: a zero
 remaining means settled; a partial remaining means partial; a
 superseded installment appears in the collection but the schedule
 view is a current-schedule projection (a future CR may filter
 superseded rows at the query boundary).

 =============================================================================
 The "back to loan" link
 =============================================================================
 A RouterLink above the PageHeader navigates to /loans/:id — the
 loan's detail page. The link's target is derived from the loaded
 schedule's `loan_id`, so it appears only in the ready state (there is
 no loan to navigate back to in the loading, error, or 404 states).

 Dependency note:
   · Depends on `getLoanSchedule` and `formatAmount` from
     `@/features/loans/service` (CR-LW1 file 2).
   · Depends on `LoanScheduleViewLabels` and `loanScheduleViewLabels`
     from `./labels` (CR-LW3 file 1).
   · Depends on the CR-L1 backend route
     `GET /api/loans/{loan}/schedule` being reachable under the
     corrected `/api` prefix (deployed).
   · Depends on the CR-L2 backend `_display` fields on
     LoanScheduleResource and LoanInstallmentResource (deployed).
   · Depends on the CR-LW3 file 10 route registration for
     `/loans/:id/schedule` to resolve; until then the page exists but
     has no URL.
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanScheduleView
=============================================================================

 File:      mase_app/src/features/loans/LoanScheduleView.vue
 Layer:     Features (Loan domain)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22 STAGE WF
            Loan domain LoanScheduleController.php (A.81, verified
              against source)
            Loan domain LoanScheduleResource.php (A.73, CR-L2, verified
              against source)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-LW3). The /loans/:id/schedule page: a
          summary card and the schedule table.

 1.0.1  — CR-WORKSPACE-TITLE Phase 1 File 7. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the seventh workspace view in the CR's scope,
          following FilesListView.vue v1.0.3, ShareholderListView.vue
          v1.1.1, ShareClassListView.vue v1.0.1,
          WalletListView.vue v1.0.4, WalletStatementView.vue v1.0.3,
          and LoanListView.vue v1.1.1.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, handler, template
              element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .loan-schedule-view div. The template
          becomes a two-node fragment; Vue 3 supports multi-root
          templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /loans/:id/schedule page's content. Renders:
   - a summary card with the loan's schedule-summary columns,
   - a table of the loan's installments.

 Content page. The route record (CR-LW3 file 10) wraps it in
 AuthenticatedLayout, which composes AppShell.

 -----------------------------------------------------------------------------
 The schedule endpoint's projection
 -----------------------------------------------------------------------------
 GET /api/loans/{loan}/schedule returns a `LoanScheduleResource` — a
 narrow projection over the loan aggregate:

   · the loan's identity and terms (id, tenant, borrower, product,
     status, currency, principal, term),
   · the persisted schedule-summary columns written by
     `LoanScheduleService::generate()` (monthly installment amount,
     total scheduled interest, total scheduled repayment),
   · the `maturity_date`,
   · a `totals` block that aggregates the loaded installments,
   · the full installments collection.

 The view renders the summary columns and the installments. It does
 not render the `totals` block — the labels file carries no
 totals-block strings, and the per-installment columns convey the same
 information at a row level.

 -----------------------------------------------------------------------------
 The summary card is conditional
 -----------------------------------------------------------------------------
 A pre-disbursement loan has no schedule-summary columns (they are
 written at disbursement time) and no maturity date. When all four
 summary fields are null, the summary card is not rendered at all —
 the page shows only the schedule card's empty message.

 See the `hasSummaryData` computed below.

 -----------------------------------------------------------------------------
 404 vs error
 -----------------------------------------------------------------------------
 A 404 (the loan does not exist, or belongs to another tenant) is
 distinguished from every other failure:
   - 404 (NormalizedApiError.category === 'not-found')
     → 'empty' state: "Loan not found"
   - Any other failure
     → 'error' state: generic message with retry

 An invalid route id (non-numeric, zero, or negative) short-circuits
 directly to 'empty' without a request.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The schedule, its loading/error/notFound flags are component-local
 refs. No store.

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 Every date value is the backend-supplied `_display` field, not the
 raw ISO. The frontend does no date formatting. The schedule's
 `maturity_date_display` and each installment's `due_date_display` are
 the two rendered date fields.

 -----------------------------------------------------------------------------
 Monetary rendering
 -----------------------------------------------------------------------------
 Every monetary value is rendered through formatAmount() (re-exported
 from the wallet service via the loans service). Every formatAmount
 call site reads `schedule.currency ?? ''` — the schedule endpoint
 emits the loan's currency, which is nullable on the wire.

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
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding).

 PageTitle renders nothing and declares no styles. This revision adds
 no CSS.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 Unchanged from v1.0.0:

 data-testid="loan-schedule-view-root"         on the outer <div>
 data-testid="loan-schedule-view-back"         on the back-to-loan link
 data-testid="loan-schedule-view-loading"      on the LoadingState
 data-testid="loan-schedule-view-error"        on the ErrorState
 data-testid="loan-schedule-view-not-found"    on the EmptyState (404)
 data-testid="loan-schedule-view-summary"      on the summary Card
 data-testid="loan-schedule-view-schedule"     on the schedule Card
 data-testid="loan-schedule-view-schedule-table" on the schedule DataTable
 data-testid="loan-schedule-view-schedule-empty" on the empty message

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.0.0. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - The back-to-loan link is a RouterLink with a visible label.
   - Each section is a Card with an <h2> heading.
   - The summary block is a semantic <dl>.
   - The schedule table is a DataTable, which carries its own
     accessibility contract.
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
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel. The re-export is pure — `export
 * type { X } from '...'` does not introduce the identifier into module
 * scope, avoiding collision with the same-named imports in the
 * `<script setup>` block below.
 */
export type { LoanScheduleViewLabels } from './labels';
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { getLoanSchedule, formatAmount } from '@/features/loans/service';
import type { LoanInstallment, LoanSchedule } from '@/features/loans/api';
import type { LoanScheduleViewLabels } from './labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanScheduleViewLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();

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
 * This view is mounted in the workspace build only. The portal has no
 * loan schedule route; its own loan surface is MyLoansPage /
 * MyLoanDetailPage, which are different components in a different
 * route tree.
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
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

const schedule = ref<LoanSchedule | null>(null);
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
    schedule.value = null;
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    schedule.value = await getLoanSchedule(id);
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    schedule.value = null;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Currency and loan id — defensive reads
// -----------------------------------------------------------------------------
const currency = computed<string>(() => schedule.value?.currency ?? '');
const loanId = computed<number | null>(() => schedule.value?.loan_id ?? null);

// -----------------------------------------------------------------------------
// Installments
// -----------------------------------------------------------------------------
const installments = computed<readonly LoanInstallment[]>(
  () => schedule.value?.installments ?? [],
);

function asInstallment(row: unknown): LoanInstallment {
  return row as LoanInstallment;
}

const scheduleColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'number',    label: props.labels.scheduleColumnNumber,    align: 'start' },
  { key: 'due_date',  label: props.labels.scheduleColumnDueDate,   align: 'start' },
  { key: 'expected',  label: props.labels.scheduleColumnExpected,  align: 'end'   },
  { key: 'settled',   label: props.labels.scheduleColumnSettled,   align: 'end'   },
  { key: 'remaining', label: props.labels.scheduleColumnRemaining, align: 'end'   },
]);

function scheduleRowKey(row: unknown): string {
  return String((row as LoanInstallment).id);
}

// -----------------------------------------------------------------------------
// Summary card visibility
// -----------------------------------------------------------------------------
/*
 * The summary card renders only when at least one summary field is
 * present. A pre-disbursement loan has none of them (they are written
 * at disbursement time), so the card is hidden — the page shows only
 * the schedule card's empty message.
 */
const hasSummaryData = computed<boolean>(() => {
  const s = schedule.value;
  if (s === null) return false;
  return (
    s.monthly_installment_amount !== null ||
    s.total_scheduled_interest !== null ||
    s.total_scheduled_repayment !== null ||
    s.maturity_date_display !== null
  );
});
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .loan-schedule-view root div so that its lifetime matches
    the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="loan-schedule-view"
    :data-state="state"
    data-testid="loan-schedule-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="loan-schedule-view-loading"
    />

    <!-- ============================================================
         Error (non-404)
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="loan-schedule-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404 or invalid route id)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="loan-schedule-view-not-found"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="schedule !== null">
      <!-- Back to loan -->
      <RouterLink
        v-if="loanId !== null"
        class="loan-schedule-view__back"
        :to="`/loans/${loanId}`"
        data-testid="loan-schedule-view-back"
      >← {{ labels.backToLoanLabel }}</RouterLink>

      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <!-- ============================================================
           Summary card
           ============================================================ -->
      <Card
        v-if="hasSummaryData"
        data-testid="loan-schedule-view-summary"
      >
        <template #header>
          <h2 class="loan-schedule-view__section-title">
            {{ labels.summarySectionTitle }}
          </h2>
        </template>

        <dl class="loan-schedule-view__summary">
          <div
            v-if="schedule.monthly_installment_amount !== null"
            class="loan-schedule-view__summary-row"
          >
            <dt>{{ labels.summaryMonthlyInstallmentLabel }}</dt>
            <dd>{{ formatAmount(schedule.monthly_installment_amount, currency) }}</dd>
          </div>

          <div
            v-if="schedule.total_scheduled_interest !== null"
            class="loan-schedule-view__summary-row"
          >
            <dt>{{ labels.summaryTotalInterestLabel }}</dt>
            <dd>{{ formatAmount(schedule.total_scheduled_interest, currency) }}</dd>
          </div>

          <div
            v-if="schedule.total_scheduled_repayment !== null"
            class="loan-schedule-view__summary-row"
          >
            <dt>{{ labels.summaryTotalRepaymentLabel }}</dt>
            <dd>{{ formatAmount(schedule.total_scheduled_repayment, currency) }}</dd>
          </div>

          <div
            v-if="schedule.maturity_date_display !== null"
            class="loan-schedule-view__summary-row"
          >
            <dt>{{ labels.summaryMaturityDateLabel }}</dt>
            <dd>{{ schedule.maturity_date_display }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Schedule card
           ============================================================ -->
      <Card data-testid="loan-schedule-view-schedule">
        <template #header>
          <h2 class="loan-schedule-view__section-title">
            {{ labels.scheduleSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="installments.length > 0"
          :columns="scheduleColumns"
          :rows="installments"
          :row-key="scheduleRowKey"
          data-testid="loan-schedule-view-schedule-table"
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
          class="loan-schedule-view__section-empty"
          data-testid="loan-schedule-view-schedule-empty"
        >{{ labels.scheduleEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.loan-schedule-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Back link
   ============================================================================ */
.loan-schedule-view__back {
  align-self: flex-start;
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
}

.loan-schedule-view__back:hover {
  text-decoration: underline;
}

.loan-schedule-view__back:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Summary — definition list, same layout as the detail view's loan card.
   ============================================================================ */
.loan-schedule-view__summary {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.loan-schedule-view__summary-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .loan-schedule-view__summary-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.loan-schedule-view__summary-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.loan-schedule-view__summary-row dd {
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
.loan-schedule-view__section-title {
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
.loan-schedule-view__section-empty {
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
  .loan-schedule-view {
    /* no-op placeholder */
  }
}
</style>