<!--
=============================================================================
 MASES Phase 2 UI — WalletDetailView
=============================================================================

 File:      mase_app/src/features/wallet/WalletDetailView.vue
 Layer:     Features (Wallet domain)
 Version:   1.0.3
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3, §11.6
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22 STAGE WF
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
            Wallet domain Step 7 v1.1.0 §A.1.2 (Frozen RBAC matrix)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (WF-9). The wallet detail page: balance card,
          obligations, payments, allocations, entries ledger.

 1.0.1  — two corrections:
          · Duplicate-identifier fix. The top `<script lang="ts">
import { formatCalendarDate } from '@/core/dates/calendar';` block
            previously imported `WalletAllocation` and
            `WalletDetailViewLabels` and then re-exported both by name.
            Vue compiles the two script blocks into one module, so the
            `<script setup>` block's own imports of the same identifiers
            produced TS2300 (Duplicate identifier). The top block now
            uses pure re-export syntax — `export type { X } from '...'` —
            which does not introduce the identifier into module scope,
            resolving the collision.
          · WF-9b exposure extension. `defineExpose` now exposes
            `wallet`, `payments`, and `obligations` in addition to
            `reload`. The route wrapper (WalletDetailRoute.vue) reads
            the three refs to feed the five dialogs' `:wallet`,
            `:payments`, and `:obligations` props. Without this
            extension, the wrapper's `v-if="walletState !== null"`
            guard never fires and none of the dialogs renders.

 1.0.2  — two corrections:
          · Balance-cell field-name fix. The balance card read
            `wallet.balance`, but the API's Wallet resource emits the
            balance under `current_balance` (matching the `wallets`
            table column). With the v1.0.1 `formatAmount` the call
            threw `TypeError: can't access property "indexOf", t is
            undefined`; even with the v1.0.2 `formatAmount` guard the
            value rendered blank. The cell now reads
            `wallet.current_balance`. Same root cause as
            WalletListView 1.0.1 and api.ts 1.0.1.
          · Removed the non-null assertion in the allocation payment
            cell. The template previously read
            `asAllocation(row).payment!.amount`, which relied on a
            `!` that TypeScript accepts but that provides no runtime
            safety. Replaced with a display helper that returns a
            string and null-checks the embedded summary.

          No behavior change to any other rendered element. The two
          fixes affect exactly one cell each in the template; the
          script block, the emit contract, the load logic, the
          `defineExpose` surface, and every CSS rule are unchanged.

 1.0.3  — hardcoded-string cleanup and payment-method localization
          (Session G of the layout enhancement proposal):
          · Three Amharic literals in this file were hardcoded rather
            than sourced from the labels prop:
              - 'ንቁ'          / 'ንቁ ያልሆነ'          in the balance-list
                                                    status row.
              - 'የተከፈለ'      / 'ያልተከፈለ'          in the obligations-
                                                    table status cell.
          · The four strings were moved to WalletSharedLabels in
            Session G file 1 (labels.ts 1.1.0), as
            `statusActiveLabel`, `statusInactiveLabel`,
            `obligationSettledLabel`, and `obligationUnsettledLabel`.
            This file now consumes them from the `labels` prop.
          · The allocation-payment cell previously rendered the raw
            wire value (`'cash'`, `'bank_transfer'`, `'cheque'`,
            `'other'`) as the method segment. A new helper,
            `paymentMethodLabel(method: WalletPaymentMethod)`, maps
            each wire value to its Amharic label from the shared
            labels (also moved to WalletSharedLabels in labels.ts
            1.1.0 as `methodCash`, `methodBankTransfer`, `methodCheque`,
            `methodOther`). The cell now reads
            "<amount> · <Amharic method label>".
          · The `WalletPaymentMethod` type is imported from `./api` to
            type the new helper's parameter.
          · No other change to the template, the script, or the styles.
            The mobile-first structure (Session B.2), the wrapping
            rules (Session B.1), and the component's behaviour are
            unchanged.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /wallets/:id page's content. Renders:
   - the wallet's identity and current balance
   - its obligations (one row per obligation)
   - its payments (one row per payment)
   - its allocations (one row per allocation, each with a reverse action)
   - its ledger entries (from the statement's entries array)

 Content page. The route wrapper (WF-9b) composes it inside
 AuthenticatedLayout and owns the five sub-dialogs.

 -----------------------------------------------------------------------------
 Sub-forms are NOT composed here
 -----------------------------------------------------------------------------
 This view emits five intents:
   @adjust               — consumer opens the wallet-adjust dialog
   @record-obligation    — consumer opens the record-obligation dialog
   @record-payment       — consumer opens the record-payment dialog
   @record-allocation    — consumer opens the record-allocation dialog
   @reverse-allocation   — consumer opens the reverse-allocation dialog
                           (payload: the allocation)

 The route wrapper (WF-9b) owns the dialogs.

 -----------------------------------------------------------------------------
 Composite detail fetch (WF-3)
 -----------------------------------------------------------------------------
 The view calls fetchWalletDetail(id) which runs two parallel requests:
 getWallet and getWalletStatement. The wallet response may embed its
 three child collections (obligations, payments, allocations); when
 absent, the view renders empty-section messages. The entries come from
 the statement's entries array.

 -----------------------------------------------------------------------------
 404 vs error
 -----------------------------------------------------------------------------
 A 404 (the wallet does not exist, or belongs to another tenant) is
 distinguished from every other failure:
   - 404 (NormalizedApiError.category === 'not-found')
     → 'empty' state: "Wallet not found"
   - Any other failure
     → 'error' state: generic message with retry

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The wallet, its three child collections, its entries, the two
 loading/error flags, and the currently-open allocation row-menu are
 component-local refs.

 -----------------------------------------------------------------------------
 Permission gating (§7.3.2)
 -----------------------------------------------------------------------------
   Adjust wallet                — wallet.adjust
   View statement               — ungated (backend enforces)
   Record obligation            — wallet.obligation.create
   Record payment               — wallet.payment.record
   Record allocation            — wallet.allocation.create
   Reverse allocation (row)     — wallet.allocation.reverse

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 Prior to 1.0.3 this was not quite true: four Amharic literals
 ('ንቁ', 'ንቁ ያልሆነ', 'የተከፈለ', 'ያልተከፈለ') were hardcoded in the
 balance-list status row and the obligations-table status cell. The
 allocation-payment cell also rendered the raw Latin-script wire
 value for the payment method instead of its Amharic label.

 All five issues were resolved in 1.0.3 by consuming the shared
 labels from WalletSharedLabels (labels.ts 1.1.0) and by adding a
 `paymentMethodLabel()` helper to map the payment-method wire value
 to its localized label.

 -----------------------------------------------------------------------------
 Row-actions menu — single-open control
 -----------------------------------------------------------------------------
 The allocations table's row-actions menu is a controlled DropdownMenu.
 Only one row's menu is open at a time, tracked by `openAllocationRowId`.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding, position, inset, width,
 height, overflow).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="wallet-detail-view-root"            on the outer <div>
 data-testid="wallet-detail-view-loading"         on the LoadingState
 data-testid="wallet-detail-view-error"           on the ErrorState
 data-testid="wallet-detail-view-empty"           on the EmptyState
 data-testid="wallet-detail-view-adjust"          on the adjust button
 data-testid="wallet-detail-view-statement"       on the statement button
 data-testid="wallet-detail-view-balance"         on the balance card
 data-testid="wallet-detail-view-obligations"     on the obligations card
 data-testid="wallet-detail-view-obligations-new" on the obligation button
 data-testid="wallet-detail-view-obligations-table" on the obligation table
 data-testid="wallet-detail-view-obligations-empty" on the empty message
 data-testid="wallet-detail-view-payments"        on the payments card
 data-testid="wallet-detail-view-payments-new"    on the payment button
 data-testid="wallet-detail-view-payments-table"  on the payment table
 data-testid="wallet-detail-view-payments-empty"  on the empty message
 data-testid="wallet-detail-view-allocations"     on the allocations card
 data-testid="wallet-detail-view-allocations-new" on the allocation button
 data-testid="wallet-detail-view-allocations-table" on the allocation table
 data-testid="wallet-detail-view-allocations-empty" on the empty message
 data-testid="wallet-detail-view-entries"         on the entries card
 data-testid="wallet-detail-view-entries-table"   on the entries table
 data-testid="wallet-detail-view-entries-empty"   on the empty message

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - PageHeader renders the page's <h1>.
   - Each section is a Card with an <h2> heading.
   - The allocations table's row-actions trigger button receives its
     accessible name from labels.allocationsRowActionsAriaLabel;
     DropdownMenu supplies aria-haspopup, aria-expanded, and
     aria-controls through the scoped slot.
   - The status chip is a plain span with a data attribute; its text
     content is the accessible name.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (WF-16).
 *
 * These are pure re-exports: `export type { X } from '...'` does not
 * import `X` into the module scope. The two identifiers therefore do
 * not collide with the same-named imports in the `<script setup>`
 * block below. Prior to version 1.0.1, the two statements were an
 * import followed by a named re-export, which did introduce the
 * identifiers and produced TS2300.
 */
export type { WalletDetailViewLabels } from './labels';
export type { WalletAllocation } from './api';
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import PermissionGate from '@/components/patterns/PermissionGate';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import DropdownMenu from '@/components/composites/DropdownMenu';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { fetchWalletDetail, formatAmount } from '@/features/wallet/service';
import type {
  Wallet,
  WalletAllocation,
  WalletEntry,
  WalletObligation,
  WalletPayment,
  WalletPaymentMethod,
} from '@/features/wallet/api';
import type { WalletDetailViewLabels } from './labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletDetailViewLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Consumer opens the wallet-adjust dialog. */
  (event: 'adjust'): void;
  /** Consumer opens the record-obligation dialog. */
  (event: 'record-obligation'): void;
  /** Consumer opens the record-payment dialog. */
  (event: 'record-payment'): void;
  /** Consumer opens the record-allocation dialog. */
  (event: 'record-allocation'): void;
  /** Consumer opens the reverse-allocation dialog for the given allocation. */
  (event: 'reverse-allocation', payload: { allocation: WalletAllocation }): void;
}>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

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

const wallet = ref<Wallet | null>(null);
const obligations = ref<readonly WalletObligation[]>([]);
const payments = ref<readonly WalletPayment[]>([]);
const allocations = ref<readonly WalletAllocation[]>([]);
const entries = ref<readonly WalletEntry[]>([]);
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
    wallet.value = null;
    obligations.value = [];
    payments.value = [];
    allocations.value = [];
    entries.value = [];
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    const detail = await fetchWalletDetail(id);
    wallet.value = detail.wallet;
    obligations.value = detail.obligations;
    payments.value = detail.payments;
    allocations.value = detail.allocations;
    entries.value = detail.statement.entries;
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    wallet.value = null;
    obligations.value = [];
    payments.value = [];
    allocations.value = [];
    entries.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Expose the reload action AND the three state refs
// -----------------------------------------------------------------------------
/*
 * The route wrapper (WF-9b) reads all four exposed members:
 *
 *   reload      — called after each dialog succeeds, to refresh the
 *                 page's data.
 *   wallet      — read to pass to the dialogs' `:wallet` prop. The
 *                 wrapper's `v-if="walletState !== null"` guard uses
 *                 it to defer rendering until the wallet is loaded.
 *   payments    — read to pass to WalletAllocationForm's
 *                 `:payments` prop.
 *   obligations — read to pass to WalletAllocationForm's
 *                 `:obligations` prop.
 *
 * `defineExpose` unwraps the refs, so the parent reads plain values
 * (Wallet | null, readonly WalletPayment[], readonly WalletObligation[])
 * rather than Ref wrappers.
 */
defineExpose({
  reload: load,
  wallet,
  payments,
  obligations,
});

// -----------------------------------------------------------------------------
// Presentation helpers
// -----------------------------------------------------------------------------
function formatDate(iso: string | null | undefined): string {
  return formatCalendarDate(iso, { dateStyle: 'medium' });
}

const pageTitle = computed<string>(() => {
  if (wallet.value === null) return '';
  const summary = wallet.value.shareholder;
  if (summary != null && summary.display_name !== '') {
    return summary.display_name;
  }
  return `#${wallet.value.id}`;
});

// -----------------------------------------------------------------------------
// Cast helpers for DataTable's non-generic cell slots
// -----------------------------------------------------------------------------
function asObligation(row: unknown): WalletObligation {
  return row as WalletObligation;
}
function asPayment(row: unknown): WalletPayment {
  return row as WalletPayment;
}
function asAllocation(row: unknown): WalletAllocation {
  return row as WalletAllocation;
}
function asEntry(row: unknown): WalletEntry {
  return row as WalletEntry;
}

// -----------------------------------------------------------------------------
// Payment-method label mapping (added in 1.0.3)
// -----------------------------------------------------------------------------
/*
 * Map a WalletPaymentMethod wire value to its localized display
 * string. The four labels live in WalletSharedLabels (labels.ts
 * 1.1.0), moved there from WalletPaymentFormLabels so that this view
 * can render them without importing the payment-form interface.
 *
 * The `default` case returns the raw wire value as a safe fallback:
 * if a future backend expands the WalletPaymentMethod vocabulary
 * (WF-2's type union grows), the cell shows the raw value rather
 * than rendering empty or throwing. A missing label is a
 * documentation defect, not a runtime failure.
 *
 * Called by allocationPaymentDisplay() below. Also available for any
 * future cell that needs the method label (e.g. a payments-table
 * "method" cell that prefers a label over `method_label`).
 */
function paymentMethodLabel(method: WalletPaymentMethod): string {
  switch (method) {
    case 'cash':
      return props.labels.methodCash;
    case 'bank_transfer':
      return props.labels.methodBankTransfer;
    case 'cheque':
      return props.labels.methodCheque;
    case 'other':
      return props.labels.methodOther;
    default:
      /*
       * Exhaustive over the current union, but a widened string
       * reaching this component is possible via a live API response.
       * Return the raw value as the visible fallback.
       */
      return method;
  }
}

// -----------------------------------------------------------------------------
// Obligations table
// -----------------------------------------------------------------------------
const obligationColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'description', label: props.labels.obligationsColumnDescription, align: 'start' },
  { key: 'amount', label: props.labels.obligationsColumnAmount, align: 'end' },
  { key: 'due', label: props.labels.obligationsColumnDueDate, align: 'start' },
  { key: 'status', label: props.labels.obligationsColumnStatus, align: 'start' },
]);

function obligationRowKey(row: unknown): string {
  return String((row as WalletObligation).id);
}

// -----------------------------------------------------------------------------
// Payments table
// -----------------------------------------------------------------------------
const paymentColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'method', label: props.labels.paymentsColumnMethod, align: 'start' },
  { key: 'amount', label: props.labels.paymentsColumnAmount, align: 'end' },
  { key: 'reference', label: props.labels.paymentsColumnReference, align: 'start' },
  { key: 'date', label: props.labels.paymentsColumnDate, align: 'start' },
]);

function paymentRowKey(row: unknown): string {
  return String((row as WalletPayment).id);
}

// -----------------------------------------------------------------------------
// Allocations table
// -----------------------------------------------------------------------------
const allocationColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'payment', label: props.labels.allocationsColumnPayment, align: 'start' },
  { key: 'obligation', label: props.labels.allocationsColumnObligation, align: 'start' },
  { key: 'amount', label: props.labels.allocationsColumnAmount, align: 'end' },
  { key: 'date', label: props.labels.allocationsColumnDate, align: 'start' },
  { key: 'actions', label: props.labels.allocationsColumnActions, align: 'end' },
]);

function allocationRowKey(row: unknown): string {
  return String((row as WalletAllocation).id);
}

/*
 * The reverse action is available only on allocations that are not
 * already reversed.
 */
function allocationActionsFor(row: WalletAllocation) {
  if (row.is_reversed) {
    return [];
  }
  return [
    {
      key: 'reverse',
      label: props.labels.allocationsActionReverse,
      icon: 'close',
      variant: 'danger' as const,
    },
  ];
}

/*
 * The allocation table's "payment" cell.
 *
 * The embedded payment summary is optional — the backend includes it
 * only when the controller eager-loads the relation. The function
 * returns the empty string when the summary is absent, so the cell
 * renders nothing rather than throwing.
 *
 * Replaces the v1.0.0–v1.0.1 template expression
 * `asAllocation(row).payment!.amount`, which used a non-null assertion
 * that TypeScript accepted but provided no runtime safety.
 *
 * Composition (1.0.3): the cell now reads
 *
 *     <amount> · <Amharic method label>
 *
 * The method segment is produced by `paymentMethodLabel()`, which maps
 * the WalletPaymentMethod wire value to its Amharic label from
 * WalletSharedLabels (labels.ts 1.1.0). Prior to 1.0.3 the raw wire
 * value was rendered directly.
 */
function allocationPaymentDisplay(row: WalletAllocation): string {
  const summary = row.payment;
  if (summary == null) {
    return '';
  }
  const amount = formatAmount(summary.amount, currency.value);
  const methodLabel = paymentMethodLabel(summary.method);
  if (amount === '') {
    return methodLabel;
  }
  return `${amount} · ${methodLabel}`;
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
 *
 * `formatAmount` guards nullish input, so a wallet whose currency is
 * momentarily empty (before the wallet loads) renders an empty string
 * rather than throwing.
 */
function entryDirection(row: WalletEntry, currencyCode: string): { debit: string; credit: string } {
  const formatted = formatAmount(row.amount, currencyCode);
  if (row.direction === 'debit') {
    return { debit: formatted, credit: '' };
  }
  return { debit: '', credit: formatted };
}

// -----------------------------------------------------------------------------
// Row-actions menu open state (single-open control)
// -----------------------------------------------------------------------------
const openAllocationRowId = ref<string | null>(null);

function isAllocationMenuOpen(rowId: string): boolean {
  return openAllocationRowId.value === rowId;
}

function onAllocationMenuOpenChange(rowId: string, open: boolean): void {
  openAllocationRowId.value = open ? rowId : null;
}

function onAllocationAction(row: WalletAllocation, actionKey: string): void {
  if (actionKey === 'reverse') {
    emit('reverse-allocation', { allocation: row });
  }
}

// -----------------------------------------------------------------------------
// Emit forwarding
// -----------------------------------------------------------------------------
function onAdjust(): void {
  emit('adjust');
}

function onRecordObligation(): void {
  emit('record-obligation');
}

function onRecordPayment(): void {
  emit('record-payment');
}

function onRecordAllocation(): void {
  emit('record-allocation');
}

async function onViewStatement(): Promise<void> {
  if (wallet.value === null) return;
  await router.push(`/wallets/${wallet.value.id}/statement`);
}

// -----------------------------------------------------------------------------
// Currency of the current wallet, needed by the entry formatter and by
// the allocation payment display helper.
// -----------------------------------------------------------------------------
const currency = computed<string>(() => wallet.value?.currency ?? '');
</script>

<template>
  <div
    class="wallet-detail-view"
    :data-state="state"
    data-testid="wallet-detail-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="wallet-detail-view-loading"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="wallet-detail-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="wallet-detail-view-empty"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="wallet !== null">
      <PageHeader
        :title="pageTitle"
        :description="labels.pageDescription"
      >
        <PermissionGate permission="wallet.adjust">
          <PrimaryButton
            type="button"
            data-testid="wallet-detail-view-adjust"
            @click="onAdjust"
          >{{ labels.adjustLabel }}</PrimaryButton>
        </PermissionGate>

        <PrimaryButton
          type="button"
          data-testid="wallet-detail-view-statement"
          @click="onViewStatement"
        >{{ labels.statementLabel }}</PrimaryButton>
      </PageHeader>

      <!-- ============================================================
           Balance
           ============================================================ -->
      <Card data-testid="wallet-detail-view-balance">
        <template #header>
          <h2 class="wallet-detail-view__section-title">
            {{ labels.balanceSectionTitle }}
          </h2>
        </template>

        <dl class="wallet-detail-view__balance-list">
          <div class="wallet-detail-view__balance-row">
            <dt>{{ labels.balanceLabel }}</dt>
            <dd>{{ formatAmount(wallet.current_balance, wallet.currency) }}</dd>
          </div>

          <div class="wallet-detail-view__balance-row">
            <dt>{{ labels.ownerLabel }}</dt>
            <dd>{{ pageTitle }}</dd>
          </div>

          <div class="wallet-detail-view__balance-row">
            <dt>{{ labels.currencyLabel }}</dt>
            <dd>{{ wallet.currency }}</dd>
          </div>

          <!--
            Status — the wallet's is_active boolean rendered as a
            localized string. The two labels come from
            WalletSharedLabels (labels.ts 1.1.0), the same source the
            WalletListView's status chip reads from.
          -->
          <div class="wallet-detail-view__balance-row">
            <dt>{{ labels.statusLabel }}</dt>
            <dd>{{ wallet.is_active ? labels.statusActiveLabel : labels.statusInactiveLabel }}</dd>
          </div>

          <div class="wallet-detail-view__balance-row">
            <dt>{{ labels.createdLabel }}</dt>
            <dd>{{ formatDate(wallet.created_at) }}</dd>
          </div>

          <div class="wallet-detail-view__balance-row">
            <dt>{{ labels.updatedLabel }}</dt>
            <dd>{{ formatDate(wallet.updated_at) }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Obligations
           ============================================================ -->
      <Card data-testid="wallet-detail-view-obligations">
        <template #header>
          <div class="wallet-detail-view__section-header">
            <h2 class="wallet-detail-view__section-title">
              {{ labels.obligationsSectionTitle }}
            </h2>
            <PermissionGate permission="wallet.obligation.create">
              <PrimaryButton
                type="button"
                size="sm"
                data-testid="wallet-detail-view-obligations-new"
                @click="onRecordObligation"
              >{{ labels.obligationsNewLabel }}</PrimaryButton>
            </PermissionGate>
          </div>
        </template>

        <DataTable
          v-if="obligations.length > 0"
          :columns="obligationColumns"
          :rows="obligations"
          :row-key="obligationRowKey"
          data-testid="wallet-detail-view-obligations-table"
        >
          <template #cell:description="{ row }">
            {{ asObligation(row).description }}
          </template>
          <template #cell:amount="{ row }">
            {{ formatAmount(asObligation(row).amount, wallet.currency) }}
          </template>
          <template #cell:due="{ row }">
            {{ formatDate(asObligation(row).due_date) }}
          </template>
          <!--
            Status — the obligation's is_settled boolean rendered as
            a localized string. The two labels come from
            WalletSharedLabels (labels.ts 1.1.0). Prior to 1.0.3 the
            ternary was hardcoded.
          -->
          <template #cell:status="{ row }">
            {{ asObligation(row).is_settled ? labels.obligationSettledLabel : labels.obligationUnsettledLabel }}
          </template>
        </DataTable>

        <p
          v-else
          class="wallet-detail-view__section-empty"
          data-testid="wallet-detail-view-obligations-empty"
        >{{ labels.obligationsEmpty }}</p>
      </Card>

      <!-- ============================================================
           Payments
           ============================================================ -->
      <Card data-testid="wallet-detail-view-payments">
        <template #header>
          <div class="wallet-detail-view__section-header">
            <h2 class="wallet-detail-view__section-title">
              {{ labels.paymentsSectionTitle }}
            </h2>
            <PermissionGate permission="wallet.payment.record">
              <PrimaryButton
                type="button"
                size="sm"
                data-testid="wallet-detail-view-payments-new"
                @click="onRecordPayment"
              >{{ labels.paymentsNewLabel }}</PrimaryButton>
            </PermissionGate>
          </div>
        </template>

        <DataTable
          v-if="payments.length > 0"
          :columns="paymentColumns"
          :rows="payments"
          :row-key="paymentRowKey"
          data-testid="wallet-detail-view-payments-table"
        >
          <template #cell:method="{ row }">
            {{ asPayment(row).method_label ?? asPayment(row).method }}
          </template>
          <template #cell:amount="{ row }">
            {{ formatAmount(asPayment(row).amount, wallet.currency) }}
          </template>
          <template #cell:reference="{ row }">
            {{ asPayment(row).reference ?? '' }}
          </template>
          <template #cell:date="{ row }">
            {{ formatDate(asPayment(row).occurred_at) }}
          </template>
        </DataTable>

        <p
          v-else
          class="wallet-detail-view__section-empty"
          data-testid="wallet-detail-view-payments-empty"
        >{{ labels.paymentsEmpty }}</p>
      </Card>

      <!-- ============================================================
           Allocations
           ============================================================ -->
      <Card data-testid="wallet-detail-view-allocations">
        <template #header>
          <div class="wallet-detail-view__section-header">
            <h2 class="wallet-detail-view__section-title">
              {{ labels.allocationsSectionTitle }}
            </h2>
            <PermissionGate permission="wallet.allocation.create">
              <PrimaryButton
                type="button"
                size="sm"
                data-testid="wallet-detail-view-allocations-new"
                @click="onRecordAllocation"
              >{{ labels.allocationsNewLabel }}</PrimaryButton>
            </PermissionGate>
          </div>
        </template>

        <DataTable
          v-if="allocations.length > 0"
          :columns="allocationColumns"
          :rows="allocations"
          :row-key="allocationRowKey"
          data-testid="wallet-detail-view-allocations-table"
        >
          <template #cell:payment="{ row }">
            {{ allocationPaymentDisplay(asAllocation(row)) }}
          </template>
          <template #cell:obligation="{ row }">
            {{ asAllocation(row).obligation?.description ?? '' }}
          </template>
          <template #cell:amount="{ row }">
            {{ formatAmount(asAllocation(row).amount, wallet.currency) }}
          </template>
          <template #cell:date="{ row }">
            {{ formatDate(asAllocation(row).created_at) }}
          </template>
          <template #cell:actions="{ row }">
            <!--
              Allocation row-actions menu.

              DropdownMenu is controlled: `:open` reads from the shared
              single-open state, `@update:open` writes back through the
              shared handler. Only one allocation row's menu is open at
              a time.

              The trigger element is supplied via the `#default` scoped
              slot.
            -->
            <DropdownMenu
              v-if="allocationActionsFor(asAllocation(row)).length > 0"
              :open="isAllocationMenuOpen(String(asAllocation(row).id))"
              :items="allocationActionsFor(asAllocation(row))"
              @update:open="
                (v) => onAllocationMenuOpenChange(String(asAllocation(row).id), v)
              "
              @select="(key) => onAllocationAction(asAllocation(row), key)"
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
                  class="wallet-detail-view__row-actions-trigger"
                  :aria-haspopup="ariaHaspopup"
                  :aria-expanded="ariaExpanded"
                  :aria-controls="ariaControls"
                  :aria-label="labels.allocationsRowActionsAriaLabel"
                  @click="toggle"
                >
                  ⋯
                </button>
              </template>
            </DropdownMenu>
          </template>
        </DataTable>

        <p
          v-else
          class="wallet-detail-view__section-empty"
          data-testid="wallet-detail-view-allocations-empty"
        >{{ labels.allocationsEmpty }}</p>
      </Card>

      <!-- ============================================================
           Entries ledger
           ============================================================ -->
      <Card data-testid="wallet-detail-view-entries">
        <template #header>
          <h2 class="wallet-detail-view__section-title">
            {{ labels.entriesSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="entries.length > 0"
          :columns="entryColumns"
          :rows="entries"
          :row-key="entryRowKey"
          data-testid="wallet-detail-view-entries-table"
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
          class="wallet-detail-view__section-empty"
          data-testid="wallet-detail-view-entries-empty"
        >{{ labels.entriesEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.wallet-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Balance list — definition list, same layout as the shareholder
   identity list.
   ---------------------------------------------------------------------------
   MOBILE BASE: a single-column definition list. The label sits above
   the value, with a tight block gap. This is the most legible layout
   on narrow viewports — long Amharic labels and long monetary values
   each get the full width of the card.

   Tablet and up switch to a two-column grid at the min-width breakpoint
   below, with the value column twice as wide as the label column.
   ============================================================================ */
.wallet-detail-view__balance-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.wallet-detail-view__balance-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .wallet-detail-view__balance-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.wallet-detail-view__balance-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-detail-view__balance-row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Section header (title + action, inside a Card's header slot)
   ============================================================================ */
.wallet-detail-view__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}

.wallet-detail-view__section-title {
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
.wallet-detail-view__section-empty {
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
   Row actions trigger
   ============================================================================ */
.wallet-detail-view__row-actions-trigger {
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

.wallet-detail-view__row-actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.wallet-detail-view__row-actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-detail-view {
    /* no-op placeholder */
  }
}
</style>