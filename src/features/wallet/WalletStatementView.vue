<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 5
=============================================================================

 File:      mase_app/src/features/wallet/WalletStatementView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 5
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~50 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.2):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at
   /wallets/:id/statement.

 After (v1.0.3):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "መግለጫ — MASES"
     Empty VITE_APP_NAME →  "መግለጫ"

   The portal build does not mount this view (the wallet vertical is
   workspace-only; the portal has no wallet statement route), so
   there is no portal title to verify for this file.

   The composed title uses the same `labels.pageTitle` string the
   view's PageHeader already renders as the page's <h1>. The browser
   tab and the page heading agree.

   No other behaviour change. Every existing import, ref, computed,
   handler, template element, test hook, and scoped style rule is
   byte-for-byte identical to v1.0.2.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — WalletStatementView
=============================================================================

 File:      mase_app/src/features/wallet/WalletStatementView.vue
 Layer:     Features (Wallet domain)
 Version:   1.0.3
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22 STAGE WF
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
            Wallet domain Step 7 v1.1.0 §C.1.1 (Statement endpoint)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (WF-14). The /wallets/:id/statement page:
          period filter, four totals, entries ledger.

 1.0.1  — two structural corrections:
          · The top `<script lang="ts">` block now uses pure re-export
            syntax (`export type { X } from '...'`). The 1.0.0 form —
            an `import type` followed by a named re-export — bound
            the identifier in module scope, which is fragile: a future
            edit that added a same-named import to the `<script setup>`
            block would produce TS2300. The pure form does not bind
            the identifier, and this file was moved to it for
            consistency with WalletDetailView.vue, WalletObligationForm
            .vue, and WalletPaymentForm.vue after their own hardening
            passes.
          · `<script setup>` now imports `WalletStatementViewLabels`
            from `./labels` directly, because the top block's pure
            re-export does not make the identifier available in the
            setup block's scope.
          · The two date fields are unchanged. They already use
            `BaseInput` with `type="date"`, and the `BaseInput.vue`
            unit widened its `InputType` union to include the date
            family, resolving the two `TS2322` type-check errors the
            last run reported against this file. No template change
            was required.
          · No other change to the props, the template's structure,
            the load logic, the filter actions, the four-totals
            rendering, the entries ledger, or the styles.

 1.0.2  — filter fields now use FormField (Session G of the layout
          enhancement proposal):
          · The two period-filter fields (from / to) previously used
            a raw `<label>` + `<span>` + `<BaseInput>` pattern. They
            now use `FormField`, matching the field convention used
            throughout the wallet dialogs (WalletAdjustForm,
            WalletObligationForm, WalletPaymentForm, WalletAllocationForm,
            WalletAllocationReverseDialog, WalletOpenForm).
          · `FormField` supplies the label association via its `for`
            attribute, the `aria-describedby` linkage when helper text
            or an error is present (none today), and the correct
            label/control/help/error DOM structure. The scoped default
            slot exposes `id` and `aria-describedby`, which this file
            binds onto the `BaseInput`.
          · No visible string changed. The labels come from the same
            `labels.fromLabel` and `labels.toLabel` props.
          · CSS follow-ups:
              - `.wallet-statement-view__filter-field` no longer needs
                to declare `display: flex; flex-direction: column; gap`.
                FormField provides its own column layout and a
                `--mases-space-2` gap between the label and the
                control. The rule now only carries the flex sizing
                (`flex: 1 1 180px; min-width: 0`) that the parent
                filter row relies on.
              - `.wallet-statement-view__filter-label` was removed —
                the span it styled is no longer rendered.
          · The visible label-to-control gap widens from space-1
            (4px) to space-2 (8px), the FormField standard. This is
            the only pixel-level visual change in 1.0.2.

 1.0.3  — CR-WORKSPACE-TITLE Phase 1 File 5. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the fifth workspace view in the CR's scope,
          following FilesListView.vue v1.0.3, ShareholderListView.vue
          v1.1.1, ShareClassListView.vue v1.0.1, and
          WalletListView.vue v1.0.4.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, handler, template
              element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .wallet-statement-view div. The
          template becomes a two-node fragment; Vue 3 supports
          multi-root templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /wallets/:id/statement page's content. Renders:
   - the period filter (from / to) with Apply and Clear actions
   - four totals: opening balance, closing balance, total debit,
     total credit
   - the entries ledger for the period (or an empty message)

 Content page. The route record (WF-5) wraps it in
 AuthenticatedLayout, which composes AppShell.

 -----------------------------------------------------------------------------
 The statement is a computed projection
 -----------------------------------------------------------------------------
 Unlike the wallet aggregate, the statement is not a stored resource.
 The GET /wallets/{wallet}/statement endpoint computes it on demand
 from the `from` and `to` period parameters, which the controller
 validates inline. The frontend supplies them through the filter, or
 omits them to let the controller apply its own default period.

 -----------------------------------------------------------------------------
 Filter is explicit, not debounced
 -----------------------------------------------------------------------------
 The Apply/Clear pair is deliberate. Unlike the wallet list's search
 field, a period selection is not a keystroke-level refinement: the
 user picks two dates and applies them together.

 -----------------------------------------------------------------------------
 404 vs error
 -----------------------------------------------------------------------------
 A 404 (the wallet does not exist, or belongs to another tenant) is
 distinguished from every other failure:
   - 404 (NormalizedApiError.category === 'not-found')
     → 'empty' state: "Wallet not found"
   - Any other failure
     → 'error' state: generic message with retry

 A wallet with zero entries in the period is NOT a 404. The four
 totals render with zeros and the entries section renders its empty
 message.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The statement, the from / to refs, the loading / error / notFound
 flags are component-local refs.

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
 non-token CSS values are structural (display, grid, gap via tokens,
 margin via tokens, padding, min-width in the single media query,
 matching the sibling views' breakpoint).

 PageTitle renders nothing and declares no styles. This revision adds
 no CSS.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 Unchanged from v1.0.2:

 data-testid="wallet-statement-view-root"       on the outer <div>
 data-testid="wallet-statement-view-loading"    on the LoadingState
 data-testid="wallet-statement-view-error"      on the ErrorState
 data-testid="wallet-statement-view-empty"      on the EmptyState
 data-testid="wallet-statement-view-filter"     on the filter block
 data-testid="wallet-statement-view-from"       on the from input
 data-testid="wallet-statement-view-to"         on the to input
 data-testid="wallet-statement-view-apply"      on the Apply button
 data-testid="wallet-statement-view-clear"      on the Clear button
 data-testid="wallet-statement-view-totals"     on the totals card
 data-testid="wallet-statement-view-opening"    on the opening-balance value
 data-testid="wallet-statement-view-closing"    on the closing-balance value
 data-testid="wallet-statement-view-total-debit"  on the total-debit value
 data-testid="wallet-statement-view-total-credit" on the total-credit value
 data-testid="wallet-statement-view-entries"    on the entries card
 data-testid="wallet-statement-view-entries-table" on the entries DataTable
 data-testid="wallet-statement-view-entries-empty" on the empty message

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.0.2. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - The two date inputs are wrapped in FormField (1.0.2), which
     supplies the label association via its `for` attribute and the
     `aria-describedby` linkage. The scoped default slot exposes `id`
     and `aria-describedby`, which this file binds onto each BaseInput.
   - The Apply and Clear buttons are native buttons.
   - DataTable renders its own accessibility contract.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (WF-16). The re-export is pure —
 * `export type { X } from '...'` does not introduce the identifier
 * into module scope, avoiding collision with any same-named import in
 * the `<script setup>` block below.
 */
export type { WalletStatementViewLabels } from './labels';
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import FormField from '@/components/composites/FormField';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import BaseInput from '@/components/primitives/BaseInput';
import BaseButton from '@/components/primitives/BaseButton';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { getWalletStatement, formatAmount } from '@/features/wallet/service';
import type {
  WalletEntry,
  WalletStatement,
  WalletStatementQuery,
} from '@/features/wallet/api';
import type { WalletStatementViewLabels } from './labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletStatementViewLabels;
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
 * wallet statement route; its own wallet surface is MyWalletPage,
 * which is a different component in a different route tree.
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

const statement = ref<WalletStatement | null>(null);
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);
const notFound = ref<boolean>(false);

const from = ref<string>('');
const to = ref<string>('');

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
// Query construction — mutable view of a readonly type
// -----------------------------------------------------------------------------
/*
 * The API module declares WalletStatementQuery with readonly fields.
 * This component builds the query incrementally (each parameter is
 * optional), so it constructs through a local mutable mapped type and
 * returns the result as WalletStatementQuery. Same pattern as
 * WalletListView.vue.
 */
type MutableWalletStatementQuery = {
  -readonly [K in keyof WalletStatementQuery]: WalletStatementQuery[K];
};

function buildQuery(): WalletStatementQuery {
  const query: MutableWalletStatementQuery = {};

  if (from.value !== '') {
    query.from = from.value;
  }
  if (to.value !== '') {
    query.to = to.value;
  }

  return query;
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
    statement.value = await getWalletStatement(id, buildQuery());
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
// Expose reload for the route wrapper
// -----------------------------------------------------------------------------
defineExpose({ reload: load });

// -----------------------------------------------------------------------------
// Filter actions
// -----------------------------------------------------------------------------
function onApply(): void {
  void load();
}

function onClear(): void {
  from.value = '';
  to.value = '';
  void load();
}

// -----------------------------------------------------------------------------
// Presentation helpers
// -----------------------------------------------------------------------------
function formatDate(iso: string | null | undefined): string {
  if (iso === undefined || iso === null || iso === '') return '';
  const idx = iso.indexOf('T');
  return idx >= 0 ? iso.slice(0, idx) : iso;
}

const currency = computed<string>(() => statement.value?.currency ?? '');

// -----------------------------------------------------------------------------
// Cast helper for DataTable's non-generic cell slots
// -----------------------------------------------------------------------------
function asEntry(row: unknown): WalletEntry {
  return row as WalletEntry;
}

// -----------------------------------------------------------------------------
// Entries table
// -----------------------------------------------------------------------------
const entryColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'date', label: props.labels.entriesColumnDate, align: 'start' },
  { key: 'description', label: props.labels.entriesColumnDescription, align: 'start' },
  { key: 'debit', label: props.labels.entriesColumnDebit, align: 'end' },
  { key: 'credit', label: props.labels.entriesColumnCredit, align: 'end' },
  { key: 'balance', label: props.labels.entriesColumnBalance, align: 'end' },
]);

function entryRowKey(row: unknown): string {
  return String((row as WalletEntry).id);
}

/*
 * The signed amount is rendered in the debit or credit column based on
 * the entry's direction. The opposite column is rendered empty so that
 * the two columns are always exactly one-value-per-row.
 */
function entryDirection(row: WalletEntry, cur: string): { debit: string; credit: string } {
  const formatted = formatAmount(row.amount, cur);
  if (row.direction === 'debit') {
    return { debit: formatted, credit: '' };
  }
  return { debit: '', credit: formatted };
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .wallet-statement-view root div so that its lifetime
    matches the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="wallet-statement-view"
    :data-state="state"
    data-testid="wallet-statement-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="wallet-statement-view-loading"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="wallet-statement-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="wallet-statement-view-empty"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="statement !== null">
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <!-- ============================================================
           Period filter

           Both date fields are wrapped in FormField (1.0.2), matching
           the field convention used throughout the wallet dialogs.
           FormField supplies the label association and the
           aria-describedby linkage; the scoped default slot exposes
           `id` and `aria-describedby`, which we bind onto BaseInput.
           ============================================================ -->
      <Card data-testid="wallet-statement-view-filter">
        <div class="wallet-statement-view__filter">
          <FormField
            :label="labels.fromLabel"
            html-for="statement-from"
            class="wallet-statement-view__filter-field"
          >
            <template #default="{ id, 'aria-describedby': describedBy }">
              <BaseInput
                :id="id"
                v-model="from"
                type="date"
                :aria-describedby="describedBy"
                data-testid="wallet-statement-view-from"
              />
            </template>
          </FormField>

          <FormField
            :label="labels.toLabel"
            html-for="statement-to"
            class="wallet-statement-view__filter-field"
          >
            <template #default="{ id, 'aria-describedby': describedBy }">
              <BaseInput
                :id="id"
                v-model="to"
                type="date"
                :aria-describedby="describedBy"
                data-testid="wallet-statement-view-to"
              />
            </template>
          </FormField>

          <div class="wallet-statement-view__filter-actions">
            <BaseButton
              type="button"
              variant="secondary"
              data-testid="wallet-statement-view-clear"
              @click="onClear"
            >{{ labels.filterClearLabel }}</BaseButton>
            <BaseButton
              type="button"
              variant="primary"
              data-testid="wallet-statement-view-apply"
              @click="onApply"
            >{{ labels.filterApplyLabel }}</BaseButton>
          </div>
        </div>
      </Card>

      <!-- ============================================================
           Totals
           ============================================================ -->
      <Card data-testid="wallet-statement-view-totals">
        <div class="wallet-statement-view__totals">
          <div class="wallet-statement-view__total">
            <span class="wallet-statement-view__total-label">
              {{ labels.openingBalanceLabel }}
            </span>
            <span
              class="wallet-statement-view__total-value"
              data-testid="wallet-statement-view-opening"
            >{{ formatAmount(statement.opening_balance, statement.currency) }}</span>
          </div>

          <div class="wallet-statement-view__total">
            <span class="wallet-statement-view__total-label">
              {{ labels.closingBalanceLabel }}
            </span>
            <span
              class="wallet-statement-view__total-value"
              data-testid="wallet-statement-view-closing"
            >{{ formatAmount(statement.closing_balance, statement.currency) }}</span>
          </div>

          <div class="wallet-statement-view__total">
            <span class="wallet-statement-view__total-label">
              {{ labels.totalDebitLabel }}
            </span>
            <span
              class="wallet-statement-view__total-value"
              data-testid="wallet-statement-view-total-debit"
            >{{ formatAmount(statement.total_debit, statement.currency) }}</span>
          </div>

          <div class="wallet-statement-view__total">
            <span class="wallet-statement-view__total-label">
              {{ labels.totalCreditLabel }}
            </span>
            <span
              class="wallet-statement-view__total-value"
              data-testid="wallet-statement-view-total-credit"
            >{{ formatAmount(statement.total_credit, statement.currency) }}</span>
          </div>
        </div>
      </Card>

      <!-- ============================================================
           Entries ledger
           ============================================================ -->
      <Card data-testid="wallet-statement-view-entries">
        <template #header>
          <h2 class="wallet-statement-view__section-title">
            {{ labels.entriesSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="statement.entries.length > 0"
          :columns="entryColumns"
          :rows="statement.entries"
          :row-key="entryRowKey"
          data-testid="wallet-statement-view-entries-table"
        >
          <template #cell:date="{ row }">
            {{ formatDate(asEntry(row).occurred_at) }}
          </template>
          <template #cell:description="{ row }">
            {{ asEntry(row).description ?? '' }}
          </template>
          <template #cell:debit="{ row }">
            {{ entryDirection(asEntry(row), currency).debit }}
          </template>
          <template #cell:credit="{ row }">
            {{ entryDirection(asEntry(row), currency).credit }}
          </template>
          <template #cell:balance="{ row }">
            {{ formatAmount(asEntry(row).balance_after, currency) }}
          </template>
        </DataTable>

        <p
          v-else
          class="wallet-statement-view__section-empty"
          data-testid="wallet-statement-view-entries-empty"
        >{{ labels.entriesEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.wallet-statement-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Period filter
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack. The two date fields sit above the
   action row, each full-width. The action row keeps `justify-content:
   flex-end`, so the Apply/Clear pair trails on its own line.

   Tablet and up switch to a horizontal row at the min-width breakpoint
   below, with `align-items: flex-end` so the date fields and the action
   buttons share a baseline.
   ============================================================================ */
.wallet-statement-view__filter {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--mases-space-4);
}

@media (min-width: 640px) {
  .wallet-statement-view__filter {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
  }
}

/* ============================================================================
   Filter field (applied to the FormField root)
   ---------------------------------------------------------------------------
   FormField provides the column layout and the label/control gap
   (--mases-space-2). This rule only carries the flex sizing that the
   parent filter row relies on: the two fields share the row's free
   space equally at the base, and can shrink below their content width
   without pushing the action row off the row.
   ============================================================================ */
.wallet-statement-view__filter-field {
  flex: 1 1 180px;
  min-width: 0;
}

.wallet-statement-view__filter-actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-shrink: 0;
  justify-content: flex-end;
}

/* ============================================================================
   Totals grid
   ============================================================================ */
.wallet-statement-view__totals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--mases-space-5);
}

.wallet-statement-view__total {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  min-width: 0;
}

.wallet-statement-view__total-label {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-statement-view__total-value {
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  font-variant-numeric: tabular-nums;
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Section title
   ============================================================================ */
.wallet-statement-view__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Empty section message
   ============================================================================ */
.wallet-statement-view__section-empty {
  margin: 0;
  padding-block: var(--mases-space-4);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-statement-view {
    /* no-op placeholder */
  }
}
</style>