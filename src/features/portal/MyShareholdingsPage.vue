<!--
=============================================================================
 MASES Phase 2 UI — MyShareholdingsPage
=============================================================================

 File:      mase_app/src/features/portal/MyShareholdingsPage.vue
 Layer:     Features (Portal)
 Version:   1.2.0
 Status:    FROZEN
 Authority: P3 · Unit 1 (drill-down); P3 · Unit 2 (date rendering)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 15.12). Two-column list (class, quantity)
          with the five-state page machine.

 1.1.0  — holdings-history drill-down (P3 · Unit 1):
          · A per-row toggle button in a new actions column expands a
            nested ledger card below the main table.
          · The card fetches the holding's detail via getShareHolding(id)
            on expand — the list endpoint's payload is not enlarged.
          · Four columns: date, type, quantity, balance-after. Display
            order is newest-first (client-side reverse of the wire order).
          · Entry-type labels resolve through six fields added to the
            labels module in File 1 of that unit.

 1.2.0  — Ethiopian calendar date rendering (P3 · Unit 2):
          · The local `formatDate()` helper is removed.
          · The ledger drill-down's date column now renders the
            backend-supplied `occurred_at_display` field, which carries
            the locale-appropriate medium Ethiopian form
            (`ሐምሌ 9, 2018 ዓ.ም. (July 16, 2026)` for `am`,
             `Hamle 9, 2018 E.C. (July 16, 2026)` for `en`).
          · No structural change to the drill-down, the toggle, or the
            main table. No new labels. No new state.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the authenticated user's own shareholdings — one row per share
 class the user currently holds — and, on demand, the append-only ledger
 of every entry that produced each holding's current quantity.

 The page reads its shareholder id from the provided useMyShareholder
 state (Unit 15.12-F) and calls listShareHoldings(shareholderId). The
 drill-down calls getShareHolding(holdingId) — both existing service
 functions. The page does not call the API client directly.

 -----------------------------------------------------------------------------
 The page state machine — unchanged
 -----------------------------------------------------------------------------
   loading   — identity loading OR holdings idle/loading
   unlinked  — identity unlinked (shared unlinked panel)
   error     — identity error OR holdings error; retry is state-aware
   empty     — identity linked, holdings loaded, zero items
   ready     — identity linked, holdings loaded, one or more items

 -----------------------------------------------------------------------------
 The drill-down state machine
 -----------------------------------------------------------------------------
   idle      — no row is expanded
   loading   — the ledger fetch is in flight
   ready     — one or more entries fetched
   empty     — the fetch succeeded and returned zero entries
   error     — the fetch failed

 Only one row is expanded at a time. Expanding row A collapses row B;
 clicking A while A is expanded collapses A. The card appears directly
 below the main table and is anchored to the toggle button via
 aria-controls.

 -----------------------------------------------------------------------------
 Date rendering (P3 · Unit 2)
 -----------------------------------------------------------------------------
 The ledger drill-down's date column renders `occurred_at_display`, the
 backend-supplied medium Ethiopian form. The frontend does no date
 formatting of its own. The ISO `occurred_at` field remains available
 on the wire for consumers that need a machine-readable instant; this
 page does not use it.

 The main table's `quantity` column and the drill-down's `quantity` and
 `balance_after` columns continue to render decimal strings via the
 local `formatQuantity()` helper imported from the shareholders service
 — that helper concerns quantities, not dates, and is unaffected by
 this change.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
import type { MyShareholdingsPageLabels } from './labels';
export type { MyShareholdingsPageLabels };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { useMyShareholder } from './useMyShareholder';
import {
  listShareHoldings,
  getShareHolding,
  formatQuantity,
} from '@/features/shareholders/service';
import type {
  ShareHolding,
  ShareHoldingEntry,
} from '@/features/shareholders/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: MyShareholdingsPageLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Identity state (provided by PortalLayout)
// -----------------------------------------------------------------------------
const { state: identityState, shareholder, load: loadIdentity } =
  useMyShareholder();

// -----------------------------------------------------------------------------
// Holdings data state (page-local — unchanged from 1.0.0)
// -----------------------------------------------------------------------------
type DataState = 'idle' | 'loading' | 'ready' | 'error';

const holdings = ref<readonly ShareHolding[]>([]);
const dataState = ref<DataState>('idle');
const dataError = ref<unknown | null>(null);

async function loadHoldings(shareholderId: number): Promise<void> {
  dataState.value = 'loading';
  dataError.value = null;

  try {
    holdings.value = await listShareHoldings(shareholderId);
    dataState.value = 'ready';
  } catch (err) {
    dataError.value = err;
    holdings.value = [];
    dataState.value = 'error';
  }
}

/*
 * Load the holdings as soon as the identity resolves. The watcher fires
 * only when `shareholder` transitions from null to a record; if the
 * identity contract returns unlinked or errors, the watcher never fires
 * and no second request is issued.
 */
watch(
  shareholder,
  (s) => {
    if (s !== null && dataState.value === 'idle') {
      void loadHoldings(s.id);
    }
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Page state — the union of identity and data states (unchanged)
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
  if (holdings.value.length === 0) return 'empty';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Page-level retry — state-aware (unchanged)
// -----------------------------------------------------------------------------
function retry(): void {
  if (shareholder.value === null) {
    void loadIdentity();
    return;
  }
  void loadHoldings(shareholder.value.id);
}

// -----------------------------------------------------------------------------
// Main table columns — unchanged from 1.1.0
// -----------------------------------------------------------------------------
const columns = computed<readonly DataTableColumn[]>(() => [
  { key: 'class', label: props.labels.columnClass, align: 'start' },
  { key: 'quantity', label: props.labels.columnQuantity, align: 'end' },
  { key: 'actions', label: props.labels.columnActions, align: 'end' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to ShareHolding.
 */
function rowKey(row: unknown): string {
  return String((row as ShareHolding).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to ShareHolding at the point of use. Remove
 * once DataTable accepts a generic row type.
 */
function asHolding(row: unknown): ShareHolding {
  return row as ShareHolding;
}

// -----------------------------------------------------------------------------
// Ledger drill-down — state (unchanged from 1.1.0)
// -----------------------------------------------------------------------------
type LedgerState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

/*
 * The id of the currently-expanded holding, or null when no row is
 * expanded. Only one row is expanded at a time; expanding a second
 * collapses the first.
 */
const expandedHoldingId = ref<number | null>(null);

/*
 * The entries of the expanded holding, newest-first. The wire order is
 * chronological (oldest-first, per ShareHolding::entries()); this array
 * is the reversed copy for display.
 */
const ledgerEntries = ref<readonly ShareHoldingEntry[]>([]);

const ledgerState = ref<LedgerState>('idle');
const ledgerError = ref<unknown | null>(null);

// -----------------------------------------------------------------------------
// Ledger drill-down — actions (unchanged from 1.1.0)
// -----------------------------------------------------------------------------

/**
 * Whether the given holding's ledger is currently expanded. Drives the
 * toggle button's aria-expanded and its aria-label.
 */
function isLedgerExpanded(holdingId: number): boolean {
  return expandedHoldingId.value === holdingId;
}

/**
 * Toggle the ledger drill-down for a holding. Clicking the currently-
 * expanded row collapses it; clicking any other row expands it (and
 * collapses whichever row was previously expanded).
 */
async function toggleLedger(holdingId: number): Promise<void> {
  if (expandedHoldingId.value === holdingId) {
    collapseLedger();
    return;
  }
  await expandLedger(holdingId);
}

/**
 * Expand the given holding's ledger. Fetches the holding detail via
 * getShareHolding(id), reverses the wire order, and drives the
 * drill-down state machine.
 *
 * On re-expanding a row after a prior error, the fetch is retried from
 * scratch. The entries array and error ref are cleared before the
 * fetch begins so the loading state is clean.
 */
async function expandLedger(holdingId: number): Promise<void> {
  expandedHoldingId.value = holdingId;
  ledgerState.value = 'loading';
  ledgerError.value = null;
  ledgerEntries.value = [];

  try {
    const holding = await getShareHolding(holdingId);
    const entries = holding.entries ?? [];

    /*
     * Wire order is chronological (oldest first). Display order is
     * newest first: copy, then reverse. The copy is necessary — the
     * array returned by the resource is readonly and would be mutated
     * by an in-place reverse.
     */
    ledgerEntries.value = [...entries].reverse();
    ledgerState.value = entries.length === 0 ? 'empty' : 'ready';
  } catch (err) {
    ledgerError.value = err;
    ledgerEntries.value = [];
    ledgerState.value = 'error';
  }
}

/**
 * Collapse the currently-expanded ledger. Resets every drill-down ref
 * to its idle state.
 */
function collapseLedger(): void {
  expandedHoldingId.value = null;
  ledgerEntries.value = [];
  ledgerState.value = 'idle';
  ledgerError.value = null;
}

/**
 * Retry the ledger fetch for the currently-expanded holding. Bound to
 * the ErrorState's action in the drill-down card.
 */
function retryLedger(): void {
  if (expandedHoldingId.value !== null) {
    void expandLedger(expandedHoldingId.value);
  }
}

// -----------------------------------------------------------------------------
// Ledger table columns (unchanged from 1.1.0)
// -----------------------------------------------------------------------------
const ledgerColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'date', label: props.labels.ledgerColumnDate, align: 'start' },
  { key: 'type', label: props.labels.ledgerColumnType, align: 'start' },
  { key: 'quantity', label: props.labels.ledgerColumnQuantity, align: 'end' },
  { key: 'balance_after', label: props.labels.ledgerColumnBalanceAfter, align: 'end' },
]);

function ledgerRowKey(row: unknown): string {
  return String((row as ShareHoldingEntry).id);
}

function asEntry(row: unknown): ShareHoldingEntry {
  return row as ShareHoldingEntry;
}

// -----------------------------------------------------------------------------
// Ledger presentation helpers
// -----------------------------------------------------------------------------

/**
 * Map a wire entry-type value to its localized label.
 *
 * The wire vocabulary is the D16-R8 closed set:
 *
 *     subscription, transfer_in, transfer_out, allocation,
 *     adjustment, reversal
 *
 * Any value outside the set is echoed verbatim — a defensive choice so
 * that a future backend addition to the vocabulary does not render as
 * an empty cell. The fallback is not a user-facing string the frontend
 * invents; it is the raw wire value, which surfaces the gap.
 */
function entryTypeLabel(entryType: string): string {
  switch (entryType) {
    case 'subscription':
      return props.labels.entryTypeSubscription;
    case 'transfer_in':
      return props.labels.entryTypeTransferIn;
    case 'transfer_out':
      return props.labels.entryTypeTransferOut;
    case 'allocation':
      return props.labels.entryTypeAllocation;
    case 'adjustment':
      return props.labels.entryTypeAdjustment;
    case 'reversal':
      return props.labels.entryTypeReversal;
    default:
      return entryType;
  }
}

/**
 * Format a signed quantity for the ledger's quantity column.
 *
 * The wire value is a decimal string with four fractional digits, and
 * its sign carries the direction: "100.0000" for a credit, "-50.0000"
 * for a debit. `formatQuantity` strips the trailing zeros, preserving
 * the sign. This helper prefixes a "+" on positive values so the
 * direction reads at a glance; debits already carry the "-".
 *
 * A zero-magnitude entry does not occur in Phase 2A (the ledger-write
 * primitive rejects it), but the guard is retained in case a future
 * memo entry is introduced.
 */
function formatLedgerQuantity(quantity: string): string {
  const formatted = formatQuantity(quantity);
  if (formatted === '0' || formatted.startsWith('-')) {
    return formatted;
  }
  return `+${formatted}`;
}

/*
 * The `formatDate` helper that existed in 1.0.0 and 1.1.0 was removed in
 * 1.2.0. The page's only date column now reads the backend-supplied
 * `occurred_at_display` field directly. See the file header §"Date
 * rendering (P3 · Unit 2)".
 */
</script>

<template>
  <div
    class="my-shareholdings-page"
    :data-state="pageState"
    data-testid="my-shareholdings-page-root"
  >
    <!-- ============================================================
         Loading (identity OR holdings)
         ============================================================ -->
    <LoadingState
      v-if="pageState === 'loading'"
      :message="labels.loadingMessage"
      data-testid="my-shareholdings-page-loading"
    />

    <!-- ============================================================
         Unlinked
         ============================================================ -->
    <EmptyState
      v-else-if="pageState === 'unlinked'"
      :title="labels.unlinkedTitle"
      :description="labels.unlinkedDescription"
      data-testid="my-shareholdings-page-unlinked"
    />

    <!-- ============================================================
         Error (page-level)
         ============================================================ -->
    <ErrorState
      v-else-if="pageState === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="my-shareholdings-page-error"
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
        data-testid="my-shareholdings-page-empty"
      />

      <template v-else>
        <!-- ============================================================
             Main holdings table
             ============================================================ -->
        <Card
          padding="none"
          data-testid="my-shareholdings-page-table-card"
        >
          <DataTable
            :columns="columns"
            :rows="holdings"
            :row-key="rowKey"
            data-testid="my-shareholdings-page-table"
          >
            <template #cell:class="{ row }">
              {{ asHolding(row).share_class?.display_name ?? '' }}
            </template>

            <template #cell:quantity="{ row }">
              {{ formatQuantity(asHolding(row).current_quantity) }}
            </template>

            <!--
              Actions column — a single disclosure toggle per row.

              The button:
                · carries the drill-down's aria-label (show or hide,
                  per the expanded state),
                · carries aria-expanded (reflects the state),
                · carries aria-controls (points at the ledger card's id),
                · has a decorative chevron marked aria-hidden.

              The whole row is NOT clickable — only the button. This
              keeps the table's normal text selection and focus order
              intact and matches the pattern used elsewhere in the
              codebase for row-level actions.
            -->
            <template #cell:actions="{ row }">
              <button
                type="button"
                class="my-shareholdings-page__ledger-toggle"
                :aria-label="
                  isLedgerExpanded(asHolding(row).id)
                    ? labels.actionHideLedger
                    : labels.actionShowLedger
                "
                :aria-expanded="isLedgerExpanded(asHolding(row).id)"
                :aria-controls="`holding-ledger-${asHolding(row).id}`"
                :data-testid="`my-shareholdings-page-ledger-toggle-${asHolding(row).id}`"
                @click="toggleLedger(asHolding(row).id)"
              >
                <span aria-hidden="true">
                  {{ isLedgerExpanded(asHolding(row).id) ? '▲' : '▼' }}
                </span>
              </button>
            </template>
          </DataTable>
        </Card>

        <!-- ============================================================
             Ledger drill-down card (one row expanded at a time)
             ============================================================ -->
        <div
          v-if="expandedHoldingId !== null"
          :id="`holding-ledger-${expandedHoldingId}`"
        >
          <Card
            padding="none"
            data-testid="my-shareholdings-page-ledger-card"
          >
            <!-- Loading -->
            <LoadingState
              v-if="ledgerState === 'loading'"
              :message="labels.ledgerLoadingMessage"
              data-testid="my-shareholdings-page-ledger-loading"
            />

            <!-- Error -->
            <ErrorState
              v-else-if="ledgerState === 'error'"
              :title="labels.ledgerErrorMessage"
              :action-label="labels.ledgerErrorRetryLabel"
              data-testid="my-shareholdings-page-ledger-error"
              @action="retryLedger"
            />

            <!-- Empty -->
            <p
              v-else-if="ledgerState === 'empty'"
              class="my-shareholdings-page__ledger-empty"
              data-testid="my-shareholdings-page-ledger-empty"
            >
              {{ labels.ledgerEmptyMessage }}
            </p>

            <!-- Ready -->
            <DataTable
              v-else-if="ledgerState === 'ready'"
              :columns="ledgerColumns"
              :rows="ledgerEntries"
              :row-key="ledgerRowKey"
              data-testid="my-shareholdings-page-ledger-table"
            >
              <template #cell:date="{ row }">
                {{ asEntry(row).occurred_at_display }}
              </template>

              <template #cell:type="{ row }">
                {{ entryTypeLabel(asEntry(row).entry_type) }}
              </template>

              <template #cell:quantity="{ row }">
                <span :data-direction="asEntry(row).direction">
                  {{ formatLedgerQuantity(asEntry(row).quantity) }}
                </span>
              </template>

              <template #cell:balance_after="{ row }">
                {{ formatQuantity(asEntry(row).balance_after) }}
              </template>
            </DataTable>
          </Card>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.my-shareholdings-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Ledger toggle button
   ---------------------------------------------------------------------------
   A minimal disclosure control. Sized to be a comfortable tap target at
   narrow viewports; renders a decorative chevron that flips direction
   with the expanded state.
   ============================================================================ */
.my-shareholdings-page__ledger-toggle {
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
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
  cursor: pointer;
}

.my-shareholdings-page__ledger-toggle:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.my-shareholdings-page__ledger-toggle:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Ledger empty state
   ---------------------------------------------------------------------------
   A single centred line inside the drill-down card. Rendered as a plain
   paragraph rather than the EmptyState composite because the drill-down
   has no title/description pair — the message alone is enough.
   ============================================================================ */
.my-shareholdings-page__ledger-empty {
  margin: 0;
  padding-block: var(--mases-space-6);
  padding-inline: var(--mases-space-4);
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
  .my-shareholdings-page {
    /* no-op placeholder */
  }
}
</style>