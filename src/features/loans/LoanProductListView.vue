<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 9
=============================================================================

 File:      mase_app/src/features/loans/LoanProductListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 9
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~50 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.1):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at
   /loan-products.

 After (v1.0.2):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "የብድር ዓይነቶች — MASES"
     Empty VITE_APP_NAME →  "የብድር ዓይነቶች"

   The portal build does not mount this view (the loan product
   catalogue is workspace-only), so there is no portal title to
   verify for this file.

   The composed title uses the same `labels.pageTitle` string the
   view's inline <h1> already renders. The browser tab and the page
   heading agree.

   No other behaviour change. Every existing import, ref, computed,
   watcher, handler, template element, test hook, and scoped style
   rule is byte-for-byte identical to v1.0.1.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3 (build fix)
=============================================================================

 File:      mase_app/src/features/loans/LoanProductListView.vue  (AMEND)
 Unit:      CR-LW3 — build fix (readonly mutation, formatAmount arity)
 Delivery type:  Correction — three call sites changed. No markup,
                 state, or behaviour change beyond the fixes.
 Net lines:      ±0 (rewrites only).

 Before (build-broken):
   · The load() body mutated `query.active_only = true` on a query
     object whose type declares `active_only` as `readonly`.
     `vue-tsc` reports:
       LoanProductListView.vue(273,13): error TS2540: Cannot assign
                                        to 'active_only' because it
                                        is a read-only property.

   · formatPrincipalRange called formatAmount with one argument. The
     service signature is `formatAmount(amount, currency)`.
     `vue-tsc` reports:
       LoanProductListView.vue(314,27): error TS2554: Expected 2
                                        arguments, but got 1.
       LoanProductListView.vue(315,13): error TS2554: Expected 2
                                        arguments, but got 1.
       LoanProductListView.vue(315,36): error TS2554: Expected 2
                                        arguments, but got 1.

 After:
   · load() builds the query as a conditional literal —
     `activeFilter === 'only' ? { active_only: true } : {}` — so no
     readonly field is mutated.
   · formatPrincipalRange takes a `currency` parameter and forwards
     it to every formatAmount call. The call site passes
     `product.currency` (each product row carries its own currency;
     the loan-product catalogue is not single-currency).

 Files modified:  this file only
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanProductListView.vue  (NEW)
 Unit:      CR-LW3 — Workspace loan sub-resources (product catalogue)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. No workspace view rendered the tenant's loan
   product catalogue; the products endpoint had no consumer outside the
   loan application dialog's product picker.

 After:
   A read-only catalogue view for /loan-products. Loads
   GET /api/loans/products via `listLoanProducts`, renders the six
   label-scoped columns (code, name, currency, principal range, term
   range, status), and exposes the endpoint's single query parameter
   (`active_only`) as a two-option filter select.

   The view:
     · fetches on mount and on filter change,
     · holds the products collection in a local ref (§13.3 — feature
       state lives in the feature module),
     · guards against stale responses with a monotonic request
       sequence,
     · renders four states in order: loading → error → empty → table,
     · renders the table as stacked cards on mobile (base CSS) and as a
       semantic table from 640px up.

 Dependency note:
   · Depends on `listLoanProducts` and `formatAmount` from
     `@/features/loans/service` (v1.1.0, CR-LW1 file 2). The former is
     a thin delegate to `./api`; the latter is the wallet service's
     shared monetary formatter, re-exported.
   · Depends on `LoanProductListViewLabels` and
     `loanProductListViewLabels` from `./labels` (v1.2.0, CR-LW3 file 1).
   · Depends on the CR-L1 backend `GET /api/loans/products` route
     (deployed).
   · Depends on primitives: Alert, FormField (composites); BaseSelect,
     BaseButton (primitives).
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanProductListView
=============================================================================

 File:      mase_app/src/features/loans/LoanProductListView.vue
 Layer:     Features (Loan domain)
 Version:   1.0.2
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §11.4, §11.5,
              §13.3, §22 STAGE WF
            Loan domain LoanProductController.php (A.74, verified
              against source)
            Loan domain LoanProductResource.php (A.70, CR-L2, verified
              against source)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-LW3). The catalogue view with its six
          columns, its `active_only` filter, and its four data states.

 1.0.1  — build fix. Two corrections: the query object is built as a
          conditional literal rather than mutated through a readonly
          field; and `formatPrincipalRange` forwards each product's
          own `currency` to `formatAmount`. No markup or behaviour
          change.

 1.0.2  — CR-WORKSPACE-TITLE Phase 1 File 9. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the ninth workspace view in the CR's scope,
          following FilesListView.vue v1.0.3, ShareholderListView.vue
          v1.1.1, ShareClassListView.vue v1.0.1,
          WalletListView.vue v1.0.4, WalletStatementView.vue v1.0.3,
          LoanListView.vue v1.1.1, LoanScheduleView.vue v1.0.1, and
          LoanStatementView.vue v1.0.1.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing inline <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, watcher, handler,
              template element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .loan-product-list-view div. The
          template becomes a two-node fragment; Vue 3 supports
          multi-root templates natively.

          Note: this view uses its own inline <header> element rather
          than the shared PageHeader pattern. The inline header is
          unchanged by this revision; the tab title binds to the same
          `labels.pageTitle` string the inline <h1> renders.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A read-only catalogue of the tenant's loan products. The products are
 the reference data the loan application dialog selects from; this
 view is the administrative read of that catalogue.

 The endpoint is not paginated — the catalogue is a bounded set — so
 the view renders a single collection without pagination controls.

 -----------------------------------------------------------------------------
 The endpoint and its single query parameter
 -----------------------------------------------------------------------------
 GET /api/loans/products accepts exactly one query parameter,
 `active_only` (boolean). The view surfaces it as a two-option select:
 "all" (the parameter is omitted) and "active only" (the parameter is
 `true`). The default is "all" — an administrative catalogue read
 should show inactive products too.

 The filter select is wrapped in FormField so the label association
 and accessibility wiring match the form-side controls. It is not a
 form — there is no submit — but the wrapping is the same primitive
 convention the rest of the workspace uses.

 -----------------------------------------------------------------------------
 The table columns
 -----------------------------------------------------------------------------
 Six columns, matching LoanProductListViewLabels:

   · columnCode           → product.code
   · columnName           → product.display_name
   · columnCurrency       → product.currency
   · columnPrincipalRange → formatAmount(min_principal, currency) –
                            formatAmount(max_principal, currency)
   · columnTermRange      → "{min_term_months} – {max_term_months}"
   · columnStatus         → is_active ? statusActive : statusInactive

 `display_name` is the resource's pre-resolved name — the backend
 applies the Amharic/English fallback, so the view reads a single
 field rather than branching on `name_am` / `name_en`.

 The principal range collapses to a single value when min === max; the
 term range collapses the same way. Currency is not appended to the
 range values — it has its own column — but it IS passed to
 `formatAmount`, whose signature takes the currency as its second
 argument.

 -----------------------------------------------------------------------------
 The mobile-first table
 -----------------------------------------------------------------------------
 Base CSS renders each <tr> as a stacked card. The <thead> is visually
 hidden, the <table> and its children become block-level, and each
 <td>'s label is drawn via `content: attr(data-label)` bound to the
 matching labels string. There is no markup duplication.

 From min-width: 640px the elements revert to their table-native
 display values and the data-label pseudo-element is suppressed. The
 breakpoint matches the sibling dialogs' single breakpoint.

 -----------------------------------------------------------------------------
 Race guard
 -----------------------------------------------------------------------------
 The filter can be toggled faster than the round-trip completes. A
 monotonic `requestSeq` discards a stale response when a newer request
 has started; the last-issued request always wins.

 -----------------------------------------------------------------------------
 Error handling
 -----------------------------------------------------------------------------
 The view is read-only, so there is no four-category classifier. A
 failed load replaces the body with an error state: an Alert carrying
 `genericErrorTitle` as its heading and `errorMessage` as its body,
 plus a `BaseButton` retry labelled `errorRetryLabel`. When the API
 client attached a `requestId`, it renders beneath the message with
 the shared `requestIdPrefix`.

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
 non-token CSS values are structural (display values, flex-direction,
 width, border-collapse, the single media query's breakpoint, and the
 `content: attr(...)` declarator).

 PageTitle renders nothing and declares no styles. This revision adds
 no CSS.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 Unchanged from v1.0.1:

 data-testid="loan-product-list-view-root"         on the root div
 data-testid="loan-product-list-view-filter"       on the filter select
 data-testid="loan-product-list-view-loading"      on the loading block
 data-testid="loan-product-list-view-error"        on the error block
 data-testid="loan-product-list-view-error-retry"  on the retry button
 data-testid="loan-product-list-view-empty"        on the empty block
 data-testid="loan-product-list-view-table"        on the table
 data-testid="loan-product-list-view-row"          on each <tr>

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.0.1. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - The page heading is a single <h1>; the empty state carries an
     <h2>. No heading levels are skipped.
   - The table uses <th scope="col"> for every column header.
   - The filter select is labelled through FormField's automatic
     label-for wiring against the BaseSelect's id.
   - The loading block is plain text; no aria-live is declared. A
     future CR that adds an aria-live region for the load transition
     would introduce one here.
   - The error Alert carries its own role.
   - Reduced motion: the component declares no animation.

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
 view's inline <h1> renders. The browser tab and the page heading
 agree by construction.

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
 * scope.
 */
export type { LoanProductListViewLabels } from './labels';
export type { LoanProduct } from './api';
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseButton from '@/components/primitives/BaseButton';
import BaseSelect from '@/components/primitives/BaseSelect';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { formatAmount, listLoanProducts } from '@/features/loans/service';
import type {
  LoanProduct,
  ListLoanProductsQuery,
} from '@/features/loans/api';
import type { LoanProductListViewLabels } from './labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanProductListViewLabels;
}

const props = defineProps<Props>();

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
 * loan-product catalogue route; its loan surfaces are MyLoansPage /
 * MyLoanDetailPage, which are different components in a different
 * route tree.
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
/*
 * The filter's two states. `'all'` omits the `active_only` parameter
 * entirely (the endpoint's default); `'only'` sends `active_only: true`.
 */
type ActiveFilter = 'all' | 'only';

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const activeFilter = ref<ActiveFilter>('all');
const products = ref<readonly LoanProduct[]>([]);
const loading = ref<boolean>(true);
const hasError = ref<boolean>(false);
const errorRequestId = ref<string | undefined>(undefined);

// -----------------------------------------------------------------------------
// Filter select options
// -----------------------------------------------------------------------------
const filterOptions = computed<ReadonlyArray<{ value: string; label: string }>>(
  () => [
    { value: 'all', label: props.labels.activeFilterAll },
    { value: 'only', label: props.labels.activeFilterOnly },
  ],
);

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
/*
 * A monotonic sequence discards a stale response when a newer request
 * has started. The last-issued request always wins. See the file
 * header §"Race guard".
 */
let requestSeq = 0;

async function load(): Promise<void> {
  const seq = ++requestSeq;
  loading.value = true;
  hasError.value = false;
  errorRequestId.value = undefined;

  try {
    /*
     * The query object is built as a conditional literal — no
     * mutation of the readonly fields declared on
     * `ListLoanProductsQuery`. See the CR-LW3 build-fix
     * change-verification block.
     */
    const query: ListLoanProductsQuery =
      activeFilter.value === 'only' ? { active_only: true } : {};

    const result = await listLoanProducts(query);
    if (seq !== requestSeq) return;
    products.value = result;
  } catch (err) {
    if (seq !== requestSeq) return;
    hasError.value = true;
    const rid =
      typeof err === 'object' && err !== null && 'requestId' in err
        ? (err as { requestId?: unknown }).requestId
        : undefined;
    if (typeof rid === 'string' && rid !== '') {
      errorRequestId.value = rid;
    }
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
    }
  }
}

// -----------------------------------------------------------------------------
// Refetch on filter change, and once on mount
// -----------------------------------------------------------------------------
watch(activeFilter, () => {
  void load();
});

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Presentation helpers
// -----------------------------------------------------------------------------
/*
 * The principal range collapses to a single value when both bounds
 * are equal. `currency` is the product's own currency — the catalogue
 * is not single-currency, so each row forwards its own to the shared
 * formatter. The currency is not appended to the text; it has its own
 * column.
 */
function formatPrincipalRange(
  min: string,
  max: string,
  currency: string,
): string {
  if (min === max) return formatAmount(min, currency);
  return `${formatAmount(min, currency)} – ${formatAmount(max, currency)}`;
}

function formatTermRange(min: number, max: number): string {
  if (min === max) return String(min);
  return `${min} – ${max}`;
}

function statusLabel(product: LoanProduct): string {
  return product.is_active
    ? props.labels.statusActive
    : props.labels.statusInactive;
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .loan-product-list-view root div so that its lifetime
    matches the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="loan-product-list-view"
    data-testid="loan-product-list-view-root"
  >
    <!-- Page header -->
    <header class="loan-product-list-view__header">
      <h1 class="loan-product-list-view__title">{{ labels.pageTitle }}</h1>
      <p class="loan-product-list-view__description">
        {{ labels.pageDescription }}
      </p>
    </header>

    <!-- Filter -->
    <div class="loan-product-list-view__filters">
      <FormField
        :label="labels.activeFilterLabel"
        html-for="loan-products-active-filter"
        :disabled="loading"
      >
        <BaseSelect
          id="loan-products-active-filter"
          v-model="activeFilter"
          :options="filterOptions"
          :disabled="loading"
          data-testid="loan-product-list-view-filter"
        />
      </FormField>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="loan-product-list-view__loading"
      data-testid="loan-product-list-view-loading"
    >{{ labels.loadingMessage }}</div>

    <!-- Error -->
    <div
      v-else-if="hasError"
      class="loan-product-list-view__error"
      data-testid="loan-product-list-view-error"
    >
      <Alert
        variant="danger"
        :title="labels.genericErrorTitle"
      >
        <p class="loan-product-list-view__error-message">
          {{ labels.errorMessage }}
        </p>
        <p
          v-if="errorRequestId"
          class="loan-product-list-view__error-reference"
        >{{ labels.requestIdPrefix }} {{ errorRequestId }}</p>
      </Alert>

      <div class="loan-product-list-view__error-actions">
        <BaseButton
          type="button"
          variant="secondary"
          data-testid="loan-product-list-view-error-retry"
          @click="load"
        >{{ labels.errorRetryLabel }}</BaseButton>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="products.length === 0"
      class="loan-product-list-view__empty"
      data-testid="loan-product-list-view-empty"
    >
      <h2 class="loan-product-list-view__empty-title">
        {{ labels.emptyTitle }}
      </h2>
      <p class="loan-product-list-view__empty-description">
        {{ labels.emptyDescription }}
      </p>
    </div>

    <!-- Table -->
    <table
      v-else
      class="loan-product-list-view__table"
      data-testid="loan-product-list-view-table"
    >
      <thead>
        <tr>
          <th scope="col">{{ labels.columnCode }}</th>
          <th scope="col">{{ labels.columnName }}</th>
          <th scope="col">{{ labels.columnCurrency }}</th>
          <th scope="col">{{ labels.columnPrincipalRange }}</th>
          <th scope="col">{{ labels.columnTermRange }}</th>
          <th scope="col">{{ labels.columnStatus }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products"
          :key="product.id"
          class="loan-product-list-view__row"
          data-testid="loan-product-list-view-row"
        >
          <td :data-label="labels.columnCode">{{ product.code }}</td>
          <td :data-label="labels.columnName">{{ product.display_name }}</td>
          <td :data-label="labels.columnCurrency">{{ product.currency }}</td>
          <td :data-label="labels.columnPrincipalRange">
            {{
              formatPrincipalRange(
                product.min_principal,
                product.max_principal,
                product.currency,
              )
            }}
          </td>
          <td :data-label="labels.columnTermRange">
            {{ formatTermRange(product.min_term_months, product.max_term_months) }}
          </td>
          <td :data-label="labels.columnStatus">{{ statusLabel(product) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.loan-product-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Header
   ============================================================================ */
.loan-product-list-view__header {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
}

.loan-product-list-view__title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-1);
  line-height: var(--mases-line-height-heading-1);
  font-weight: var(--mases-font-weight-semibold);
}

.loan-product-list-view__description {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

/* ============================================================================
   Filters
   ---------------------------------------------------------------------------
   A single select. Capped in width on larger viewports so it does not
   stretch the full page width. On mobile it fills the available width.
   ============================================================================ */
.loan-product-list-view__filters {
  width: 100%;
}

@media (min-width: 640px) {
  .loan-product-list-view__filters {
    max-width: 320px;
  }
}

/* ============================================================================
   Loading
   ============================================================================ */
.loan-product-list-view__loading {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

/* ============================================================================
   Error
   ============================================================================ */
.loan-product-list-view__error {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
}

.loan-product-list-view__error-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-product-list-view__error-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

.loan-product-list-view__error-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@media (min-width: 640px) {
  .loan-product-list-view__error-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
}

/* ============================================================================
   Empty
   ============================================================================ */
.loan-product-list-view__empty {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  padding: var(--mases-space-5);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-subtle);
  text-align: center;
}

.loan-product-list-view__empty-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-3);
  line-height: var(--mases-line-height-heading-3);
  font-weight: var(--mases-font-weight-semibold);
}

.loan-product-list-view__empty-description {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

/* ============================================================================
   Table
   ---------------------------------------------------------------------------
   MOBILE BASE: cards.
   The <table> and its children become block-level; the <thead> is
   visually removed; each row becomes a card; each cell is a
   label/value pair whose label is drawn via `content: attr(data-label)`.

   DESKTOP (min-width: 640px): the elements revert to their table-native
   display values; the data-label pseudo-element is suppressed.
   ============================================================================ */
.loan-product-list-view__table {
  display: block;
  width: 100%;
  border-collapse: collapse;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

.loan-product-list-view__table thead {
  display: none;
}

.loan-product-list-view__table tbody,
.loan-product-list-view__table tr,
.loan-product-list-view__table td {
  display: block;
  width: 100%;
}

.loan-product-list-view__table tr {
  padding: var(--mases-space-3);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  margin-block-end: var(--mases-space-3);
}

.loan-product-list-view__table tr:last-child {
  margin-block-end: 0;
}

.loan-product-list-view__table td {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--mases-space-3);
  padding-block: var(--mases-space-1);
  overflow-wrap: anywhere;
}

.loan-product-list-view__table td:first-child {
  padding-block-start: 0;
}

.loan-product-list-view__table td:last-child {
  padding-block-end: 0;
}

.loan-product-list-view__table td::before {
  content: attr(data-label);
  flex-shrink: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-semibold);
}

/* ----------------------------------------------------------------------------
   Desktop — revert to a native table.
   ---------------------------------------------------------------------------- */
@media (min-width: 640px) {
  .loan-product-list-view__table {
    display: table;
  }

  .loan-product-list-view__table thead {
    display: table-header-group;
  }

  .loan-product-list-view__table tbody {
    display: table-row-group;
  }

  .loan-product-list-view__table tr {
    display: table-row;
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 0;
    border-block-end: 1px solid var(--mases-color-border-subtle);
  }

  .loan-product-list-view__table tr:last-child {
    border-block-end: none;
  }

  .loan-product-list-view__table th,
  .loan-product-list-view__table td {
    display: table-cell;
    padding-block: var(--mases-space-3);
    padding-inline: var(--mases-space-3);
    text-align: start;
    vertical-align: top;
    white-space: nowrap;
  }

  .loan-product-list-view__table td::before {
    display: none;
  }

  .loan-product-list-view__table th {
    color: var(--mases-color-text-secondary);
    font-size: var(--mases-font-size-caption);
    line-height: var(--mases-line-height-caption);
    font-weight: var(--mases-font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: var(--mases-letter-spacing-caption);
    border-block-end: 1px solid var(--mases-color-border-default);
  }
}
</style>