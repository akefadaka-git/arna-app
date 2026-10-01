<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 8
=============================================================================

 File:      mase_app/src/features/loans/LoanStatementView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 8
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~55 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.0):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at
   /loans/:id/statement.

 After (v1.0.1):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "መግለጫ — MASES"
     Empty VITE_APP_NAME →  "መግለጫ"

   The portal build does not mount this view (the loan sub-resource
   views are workspace-only; the portal has no statement route for
   loans), so there is no portal title to verify for this file.

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
 CHANGE VERIFICATION — CR-LW3 (build fix)
=============================================================================

 File:      mase_app/src/features/loans/LoanStatementView.vue  (AMEND)
 Unit:      CR-LW3 — build fix (label name)
 Delivery type:  Correction — one identifier in the lineTypeLabel()
                 switch. No structural, template, or style change.
 Net lines:      ±0.

 Before (build-broken):
   `lineTypeLabel()` referenced `props.labels.lineTypeWrittenOff` in the
   `case 'write_off'` branch. The label interface declares
   `lineTypeWriteOff` — noun form, matching the register of the other
   seven `lineType*` fields (`lineTypeDisbursement`,
   `lineTypeInterestAccrual`, `lineTypePenaltyAccrual`,
   `lineTypeRepayment`, `lineTypeRestructure`, `lineTypeCollateralRelease`,
   `lineTypeStatusChange`). `vue-tsc --noEmit` reports:
     LoanStatementView.vue(377,52): error TS2551: Property
       'lineTypeWrittenOff' does not exist on type
       'LoanStatementViewLabels'. Did you mean 'lineTypeWriteOff'?

 After:
   The `case 'write_off'` branch reads `props.labels.lineTypeWriteOff`.
   No other reference in the file touches a label name that does not
   exist on the interface.

 Files modified:  this file only
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanStatementView.vue  (NEW)
 Unit:      CR-LW3 — Workspace loan sub-resource views (statement)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The loan statement endpoint
   (GET /api/loans/{loan}/statement) was reachable only by direct
   request.

 After:
   A dedicated statement page at /loans/:id/statement. Renders:
     · a summary card with the loan's opening balance and closing
       balance (each as a single total, from the corresponding
       LoanStatementBalance's `.total`),
     · a chronological lines table with six columns: date, type,
       description, debit, credit, balance,
     · a "back to loan" link above the page header.

   Structure follows WalletStatementView.vue's shape — page header,
   summary card, lines table — adapted to the loan statement's
   composite shape (the resource emits a `loan` header, a `period`, an
   `opening_balance`, a `lines` array, a `closing_balance`, and a
   `totals` block).

   Four states: loading / error / empty (404) / ready. A ready state
   with zero lines renders the lines card's `linesEmpty` message.

 =============================================================================
 The lines table's debit/credit columns
 =============================================================================
 Each line's `total_delta` is a signed decimal string. The two columns
 split it by sign:

   · `total_delta > 0` → the "debit" column. The loan's outstanding
     increased (a disbursement, an interest accrual, a penalty
     accrual, or the net-increase case of a restructure).
   · `total_delta < 0` → the "credit" column, with the value
     rendered as its absolute. The loan's outstanding decreased (a
     repayment, a write-off, or the net-decrease case of a
     restructure).

 This matches the standard accounting convention for a loan
 receivable: debits increase the loan asset, credits decrease it. The
 `balance` column renders the line's `running_balance.total` — the
 loan's outstanding immediately after the movement.

 The `principal_delta`, `interest_delta`, and `penalty_delta` fields
 are NOT rendered as separate columns — the total column and the
 running balance convey the same information without five numeric
 columns. A future CR that wants the component breakdown adds three
 more columns; the labels file carries no sub-component column labels
 today.

 =============================================================================
 Date rendering — client-side slice (deliberate)
 =============================================================================
 The statement lines' `occurred_at` is an ISO 8601 string with no
 `_display` sibling. The resource that produces the lines
 (`LoanStatementResource`, A.74) builds the composite in the controller
 and does not wrap each line in a resource class — the `_display`
 convention P3 · Unit 2 established for entity resources does not
 apply to composite output.

 The view therefore uses a local `formatDate()` helper that slices the
 ISO string at the `T` separator, matching the wallet statement view's
 precedent (`WalletStatementView.vue`, whose entries ledger renders
 the same client-side slice for the same reason).

 A future CR that adds `_display` fields to the composite lines at the
 controller level would retire the local helper and read the display
 field directly.

 =============================================================================
 The totals block is not rendered
 =============================================================================
 The statement's `totals` block carries six aggregate buckets
 (`total_disbursed`, `total_interest_accrued`, `total_penalty_accrued`,
 `total_repaid`, `total_restructured`, `total_written_off`). The labels
 file (CR-LW3 file 1) declared `totalDebitLabel` and `totalCreditLabel`
 — two fields that do not cleanly map to the six-bucket shape. Rather
 than mislabel the buckets, this CR renders no totals card and leaves
 the two declared fields reserved for a future CR that adds the six
 correct labels and lights up the card.

 The `opening_balance` and `closing_balance` are each four-component
 objects (`principal`, `interest`, `penalty`, `total`). This view
 renders only their `.total` — the component breakdown is a future CR
 that adds four sub-component labels and a two-column sub-list.

 =============================================================================
 The back link and the loan id
 =============================================================================
 A RouterLink above the PageHeader navigates to /loans/:id. The
 target's id is read from `statement.loan.id`, so the link appears
 only in the ready state.

 =============================================================================
 404 vs error
 =============================================================================
 A 404 (the loan does not exist, or belongs to another tenant) is
 distinguished from every other failure:
   - 404 (NormalizedApiError.category === 'not-found')
     → 'empty' state: "Loan not found"
   - Any other failure
     → 'error' state: generic message with retry

 An invalid route id (non-numeric, zero, or negative) short-circuits
 directly to 'empty' without a request.

 =============================================================================
 Local state only (Freeze §13.3)
 =============================================================================
 The statement, its loading/error/notFound flags are component-local
 refs. No store.

 =============================================================================
 No hardcoded user-facing string
 =============================================================================
 Every visible string comes from the `labels` prop. The one exception
 is the arrow glyph (`←`) that prefixes the back-link label — a
 decorative character, marked `aria-hidden` on the span that carries
 it.

 =============================================================================
 Token discipline
 =============================================================================
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding).

 No hex value appears in this file.

 =============================================================================
 Test hooks
 =============================================================================
 data-testid="loan-statement-view-root"          on the outer <div>
 data-testid="loan-statement-view-back"          on the back-to-loan link
 data-testid="loan-statement-view-loading"       on the LoadingState
 data-testid="loan-statement-view-error"         on the ErrorState
 data-testid="loan-statement-view-not-found"     on the EmptyState (404)
 data-testid="loan-statement-view-summary"       on the summary Card
 data-testid="loan-statement-view-lines"         on the lines Card
 data-testid="loan-statement-view-lines-table"   on the lines DataTable
 data-testid="loan-statement-view-lines-empty"   on the empty message

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 =============================================================================
 Accessibility
 =============================================================================
 BASIC + COMPOSITE:

   - PageHeader renders the page's <h1>.
   - The back-to-loan link is a RouterLink with a visible label; the
     arrow glyph is inside an aria-hidden span.
   - Each section is a Card with an <h2> heading.
   - The summary block is a semantic <dl>.
   - The lines table is a DataTable, which carries its own
     accessibility contract.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanStatementView
=============================================================================

 File:      mase_app/src/features/loans/LoanStatementView.vue
 Layer:     Features (Loan domain)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22 STAGE WF
            Loan domain LoanStatementController.php (A.84, verified
              against source)
            Loan domain LoanStatementResource.php (A.74, verified
              against source)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-LW3). The /loans/:id/statement page: a
          summary card and the statement lines table.

 1.0.1  — CR-WORKSPACE-TITLE Phase 1 File 8. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the eighth workspace view in the CR's scope,
          following FilesListView.vue v1.0.3, ShareholderListView.vue
          v1.1.1, ShareClassListView.vue v1.0.1,
          WalletListView.vue v1.0.4, WalletStatementView.vue v1.0.3,
          LoanListView.vue v1.1.1, and LoanScheduleView.vue v1.0.1.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, handler, template
              element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .loan-statement-view div. The template
          becomes a two-node fragment; Vue 3 supports multi-root
          templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /loans/:id/statement page's content. Renders:
   - a summary card with the loan's opening and closing balance,
   - a table of the loan's chronological statement lines.

 Content page. The route record (CR-LW3 file 10) wraps it in
 AuthenticatedLayout, which composes AppShell.

 -----------------------------------------------------------------------------
 The statement endpoint's projection
 -----------------------------------------------------------------------------
 GET /api/loans/{loan}/statement returns a `LoanStatementResource` —
 a composite projection assembled by `LoanStatementController` from
 every monetary-movement source on the loan:

   · the loan's identity and terms under the `loan` key,
   · the statement `period` (from / to),
   · the `opening_balance` (four components: principal, interest,
     penalty, total),
   · the `lines` array (chronological; each line has a type, deltas,
     a running balance, and optional metadata),
   · the `closing_balance` (four components, same shape),
   · a `totals` block of six aggregate-movement buckets.

 The view renders the opening and closing balance totals and the
 lines. It does not render the `totals` block — see the CR-LW3 block
 §"The totals block is not rendered".

 -----------------------------------------------------------------------------
 Line types
 -----------------------------------------------------------------------------
 The eight line types the controller emits:

   disbursement, interest_accrual, penalty_accrual, repayment,
   restructure, write_off, collateral_release, status_change

 Each is mapped to an Amharic label in the `lineTypeLabel()` helper.
 An unrecognised value (a future backend addition) is echoed verbatim
 — the same defensive fallback pattern the portal's ledger entry-type
 helper uses.

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
 The statement, its loading/error/notFound flags are component-local
 refs. No store.

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 The statement lines' `occurred_at` is an ISO 8601 string with no
 `_display` sibling — the composite is built by the controller and
 does not wrap each line in a resource class. The view uses a local
 `formatDate()` helper that slices the ISO string at the `T`
 separator, matching the wallet statement view's precedent.

 -----------------------------------------------------------------------------
 Monetary rendering
 -----------------------------------------------------------------------------
 Every monetary value is rendered through formatAmount() (re-exported
 from the wallet service via the loans service). Every formatAmount
 call site reads `statement.loan.currency ?? ''` — the statement
 endpoint emits the loan's currency, which is nullable on the wire.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The one exception
 is the arrow glyph (`←`) that prefixes the back-link label — a
 decorative character, marked `aria-hidden` on the span that carries
 it.

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

 data-testid="loan-statement-view-root"          on the outer <div>
 data-testid="loan-statement-view-back"          on the back-to-loan link
 data-testid="loan-statement-view-loading"       on the LoadingState
 data-testid="loan-statement-view-error"         on the ErrorState
 data-testid="loan-statement-view-not-found"     on the EmptyState (404)
 data-testid="loan-statement-view-summary"       on the summary Card
 data-testid="loan-statement-view-lines"         on the lines Card
 data-testid="loan-statement-view-lines-table"   on the lines DataTable
 data-testid="loan-statement-view-lines-empty"   on the empty message

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
   - The back-to-loan link is a RouterLink with a visible label; the
     arrow glyph is inside an aria-hidden span.
   - Each section is a Card with an <h2> heading.
   - The summary block is a semantic <dl>.
   - The lines table is a DataTable, which carries its own
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
export type { LoanStatementViewLabels } from './labels';
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

import { getLoanStatement, formatAmount } from '@/features/loans/service';
import type { LoanStatement, LoanStatementLine } from '@/features/loans/api';
import type { LoanStatementViewLabels } from './labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanStatementViewLabels;
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
 * loan statement route; its own loan surface is MyLoansPage /
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

const statement = ref<LoanStatement | null>(null);
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
    statement.value = null;
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    statement.value = await getLoanStatement(id);
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    statement.value = null;
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
const currency = computed<string>(() => statement.value?.loan.currency ?? '');
const loanId = computed<number | null>(() => statement.value?.loan.id ?? null);

// -----------------------------------------------------------------------------
// Lines
// -----------------------------------------------------------------------------
const lines = computed<readonly LoanStatementLine[]>(
  () => statement.value?.lines ?? [],
);

function asLine(row: unknown): LoanStatementLine {
  return row as LoanStatementLine;
}

const lineColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'date',        label: props.labels.linesColumnDate,        align: 'start' },
  { key: 'type',        label: props.labels.linesColumnType,        align: 'start' },
  { key: 'description', label: props.labels.linesColumnDescription, align: 'start' },
  { key: 'debit',       label: props.labels.linesColumnDebit,       align: 'end'   },
  { key: 'credit',      label: props.labels.linesColumnCredit,      align: 'end'   },
  { key: 'balance',     label: props.labels.linesColumnBalance,     align: 'end'   },
]);

/*
 * The statement lines have no primary key — the composite's lines are
 * not entities with their own ids. The row key is a composite of the
 * three fields that together identify a line: its type, its timestamp,
 * and the id of its source record (if any).
 *
 * Two lines with the same type and the same timestamp and the same
 * source reference id would collide. In practice that cannot occur —
 * no two distinct movements share all three fields — but the key is
 * documented here so a future reader can revise the strategy if the
 * composite ever changes.
 */
function lineRowKey(row: unknown): string {
  const r = row as LoanStatementLine;
  return `${r.type ?? ''}-${r.occurred_at ?? ''}-${r.reference_id ?? ''}`;
}

// -----------------------------------------------------------------------------
// Presentation helpers — dates
// -----------------------------------------------------------------------------
/*
 * The statement lines' `occurred_at` is an ISO 8601 string with no
 * `_display` sibling — the composite is built by the controller and
 * does not wrap each line in a resource class. This helper slices the
 * ISO string at the `T` separator, matching the wallet statement
 * view's precedent. See the file header §"Date rendering — client-side
 * slice".
 */
function formatDate(iso: string | null): string {
  if (iso === null || iso === '') return '';
  const idx = iso.indexOf('T');
  return idx >= 0 ? iso.slice(0, idx) : iso;
}

// -----------------------------------------------------------------------------
// Presentation helpers — line type labels
// -----------------------------------------------------------------------------
/*
 * Maps a statement line's `type` to its Amharic label. The eight wire
 * values are the discriminator the controller emits — see
 * `LoanStatementController`'s class docblock §"The event sources and
 * their balance deltas" for the source of each.
 *
 * An unrecognised value (a future backend addition) is echoed verbatim
 * — the same defensive fallback the portal's ledger entry-type helper
 * uses.
 */
function lineTypeLabel(type: string | null): string {
  if (type === null) return '';
  switch (type) {
    case 'disbursement':       return props.labels.lineTypeDisbursement;
    case 'interest_accrual':   return props.labels.lineTypeInterestAccrual;
    case 'penalty_accrual':    return props.labels.lineTypePenaltyAccrual;
    case 'repayment':          return props.labels.lineTypeRepayment;
    case 'restructure':        return props.labels.lineTypeRestructure;
    case 'write_off':          return props.labels.lineTypeWriteOff;
    case 'collateral_release': return props.labels.lineTypeCollateralRelease;
    case 'status_change':      return props.labels.lineTypeStatusChange;
    default:                   return type;
  }
}

// -----------------------------------------------------------------------------
// Presentation helpers — debit/credit split
// -----------------------------------------------------------------------------
/*
 * Splits a line's signed `total_delta` into the debit and credit
 * columns. Positive deltas go to debit (the outstanding increased);
 * negative deltas go to credit as their absolute value (the
 * outstanding decreased). See the file header §"The lines table's
 * debit/credit columns" for the accounting convention.
 *
 * The string manipulation operates directly on the decimal string —
 * no parsing to `number`, no client-side arithmetic. The sign is read
 * from the leading `-`; the magnitude is the remainder.
 */
function lineDirection(row: LoanStatementLine): { debit: string; credit: string } {
  const delta = row.total_delta;
  if (delta === null || delta === '') {
    return { debit: '', credit: '' };
  }

  if (delta.startsWith('-')) {
    return {
      debit: '',
      credit: formatAmount(delta.slice(1), currency.value),
    };
  }

  return {
    debit: formatAmount(delta, currency.value),
    credit: '',
  };
}

// -----------------------------------------------------------------------------
// Opening and closing balance totals
// -----------------------------------------------------------------------------
/*
 * The `LoanStatementBalance` is a four-component object
 * (`principal`, `interest`, `penalty`, `total`). This view renders
 * only the `.total` — the component breakdown is a future CR that
 * adds sub-component labels and a two-column sub-list.
 */
const openingBalanceDisplay = computed<string>(() => {
  const b = statement.value?.opening_balance;
  if (b === undefined || b === null) return '';
  return formatAmount(b.total, currency.value);
});

const closingBalanceDisplay = computed<string>(() => {
  const b = statement.value?.closing_balance;
  if (b === undefined || b === null) return '';
  return formatAmount(b.total, currency.value);
});
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .loan-statement-view root div so that its lifetime matches
    the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="loan-statement-view"
    :data-state="state"
    data-testid="loan-statement-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="loan-statement-view-loading"
    />

    <!-- ============================================================
         Error (non-404)
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="loan-statement-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404 or invalid route id)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="loan-statement-view-not-found"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="statement !== null">
      <!-- Back to loan -->
      <RouterLink
        v-if="loanId !== null"
        class="loan-statement-view__back"
        :to="`/loans/${loanId}`"
        data-testid="loan-statement-view-back"
      >
        <span aria-hidden="true">←</span>
        {{ labels.backToLoanLabel }}
      </RouterLink>

      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <!-- ============================================================
           Summary card — opening and closing balance
           ============================================================ -->
      <Card data-testid="loan-statement-view-summary">
        <dl class="loan-statement-view__summary">
          <div class="loan-statement-view__summary-row">
            <dt>{{ labels.openingBalanceLabel }}</dt>
            <dd>{{ openingBalanceDisplay }}</dd>
          </div>

          <div class="loan-statement-view__summary-row">
            <dt>{{ labels.closingBalanceLabel }}</dt>
            <dd>{{ closingBalanceDisplay }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Lines card
           ============================================================ -->
      <Card data-testid="loan-statement-view-lines">
        <template #header>
          <h2 class="loan-statement-view__section-title">
            {{ labels.linesSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="lines.length > 0"
          :columns="lineColumns"
          :rows="lines"
          :row-key="lineRowKey"
          data-testid="loan-statement-view-lines-table"
        >
          <template #cell:date="{ row }">
            {{ formatDate(asLine(row).occurred_at) }}
          </template>

          <template #cell:type="{ row }">
            {{ lineTypeLabel(asLine(row).type) }}
          </template>

          <template #cell:description="{ row }">
            {{ asLine(row).description ?? '' }}
          </template>

          <template #cell:debit="{ row }">
            {{ lineDirection(asLine(row)).debit }}
          </template>

          <template #cell:credit="{ row }">
            {{ lineDirection(asLine(row)).credit }}
          </template>

          <template #cell:balance="{ row }">
            {{ formatAmount(asLine(row).running_balance.total, currency) }}
          </template>
        </DataTable>

        <p
          v-else
          class="loan-statement-view__section-empty"
          data-testid="loan-statement-view-lines-empty"
        >{{ labels.linesEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.loan-statement-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Back link
   ============================================================================ */
.loan-statement-view__back {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
  align-self: flex-start;
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
}

.loan-statement-view__back:hover {
  text-decoration: underline;
}

.loan-statement-view__back:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Summary — definition list.
   ============================================================================ */
.loan-statement-view__summary {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.loan-statement-view__summary-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .loan-statement-view__summary-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.loan-statement-view__summary-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.loan-statement-view__summary-row dd {
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
.loan-statement-view__section-title {
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
.loan-statement-view__section-empty {
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
  .loan-statement-view {
    /* no-op placeholder */
  }
}
</style>