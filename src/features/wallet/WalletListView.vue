<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 4
=============================================================================

 File:      mase_app/src/features/wallet/WalletListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 4
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~50 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.3):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at /wallets.

 After (v1.0.4):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "የገንዘብ ማስቀመጫዎች — MASES"
     Empty VITE_APP_NAME →  "የገንዘብ ማስቀመጫዎች"

   The portal build does not mount this view (the wallet vertical is
   workspace-only; the portal's own wallet surface is MyWalletPage),
   so there is no portal title to verify for this file.

   The composed title uses the same `labels.pageTitle` string the
   view's PageHeader already renders as the page's <h1>. The browser
   tab and the page heading agree.

   No other behaviour change. Every existing import, ref, computed,
   watcher, handler, template element, test hook, and scoped style
   rule is byte-for-byte identical to v1.0.3.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — WalletListView
=============================================================================

 File:      mase_app/src/features/wallet/WalletListView.vue
 Layer:     Features (Wallet domain)
 Version:   1.0.4
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §8.6,
              §9.14–§9.15, §9.19–§9.21, §11.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §13.3, §22 STAGE WF
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
            Wallet domain Step 7 v1.1.0 §A.1.2 (Frozen RBAC matrix)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.

 1.0.1  — balance cell field-name fix. The cell read `wallet.balance`,
          but the API's Wallet resource emits `current_balance`. Same
          root cause as api.ts 1.0.1 and WalletDetailView.vue 1.0.2.

 1.0.2  — initial-loading-state fix.
          `isLoading` now defaults to `true` rather than `false`. With
          the old default, the component's FIRST render — before
          `onMounted` fires — resolved `state` to 'empty', because
          `isLoading === false`, `loadError === null`, and
          `wallets.length === 0`. On a fast network Vue batched the
          subsequent flip to 'loading' into the same frame and the
          browser never painted the wrong state. On a slow network the
          router's async component resolution and the initial HTML gap
          produced a visible "blank" period in which neither the
          loading state nor the empty state was shown — the user saw
          a bare card with a header and controls, then the table.
          Defaulting `isLoading` to `true` guarantees the LoadingState
          is the first thing painted, on every connection speed.

          No other change. The `state` computed is byte-for-byte
          identical; only its initial inputs differ. `load()` still
          sets `isLoading.value = true` at its start, which is now a
          no-op on the first call and a necessary reset on every
          subsequent retry from the error state.

 1.0.3  — hardcoded-string cleanup (Session G of the layout
          enhancement proposal):
          · Three Amharic literals in this file were hardcoded rather
            than sourced from the labels prop:
              - 'ሁሉም'        in the `activeOptions` computed.
              - 'ንቁ'         in the `activeOptions` computed and in
                             the status-chip cell template.
              - 'ንቁ ያልሆነ'    in the same two places.
          · The three strings were moved to WalletSharedLabels in
            Session G file 1 (labels.ts 1.1.0), as `filterAllLabel`,
            `statusActiveLabel`, and `statusInactiveLabel`. This file
            now consumes them from the `labels` prop.
          · The status chip's own comment was corrected: the previous
            comment claimed the label came "from WF-1's shared labels,
            exposed here via the enum-like filter options" — that was
            not accurate; the label was hardcoded.
          · No other change to the template, the script, or the
            styles. The mobile-first structure (Session B.2) and the
            component's behaviour are unchanged.

 1.0.4  — CR-WORKSPACE-TITLE Phase 1 File 4. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the fourth workspace view in the CR's scope,
          following FilesListView.vue v1.0.3, ShareholderListView.vue
          v1.1.1, and ShareClassListView.vue v1.0.1.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, watcher, handler,
              template element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .wallet-list-view div. The template
          becomes a two-node fragment; Vue 3 supports multi-root
          templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /wallets page's content. Renders a searchable, filterable,
 paginated list of the current tenant's wallets, with:
   - a "New wallet" primary action (gated by wallet.open)
   - a per-row actions menu (view / statement)
   - four data states: loading / error / empty / ready

 Content page. The route record (WF-5) wraps it in
 AuthenticatedLayout, which composes AppShell.

 -----------------------------------------------------------------------------
 Workspace-only page
 -----------------------------------------------------------------------------
 The backend's GET /api/wallets route is gated by `wallet.view`. The
 `manager` role holds `wallet.view_own` (see WF-1's labels file and
 the Wallet domain's RBAC matrix), which grants policy-mediated access
 to the caller's own wallet, not the tenant-wide list. A manager
 reaches their own wallet through the portal build (a future unit), or
 through the same list view if the backend's index action applies the
 `_own` filter for callers without the broad permission.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The list, its pagination meta, the search term, the active filter,
 and the currently-open row-actions menu are component-local refs. The
 service (WF-3) is stateless.

 -----------------------------------------------------------------------------
 Permission gating (§7.3.2)
 -----------------------------------------------------------------------------
 The "New wallet" action is gated on wallet.open.
 The "Statement" row action is ungated — the backend enforces the
 statement permission (wallet.statement.view OR
 wallet.statement.view_own) on the request; the frontend does not
 duplicate the OR.

 -----------------------------------------------------------------------------
 Query construction — mutable view of a readonly type
 -----------------------------------------------------------------------------
 The API module declares ListWalletsQuery with readonly fields. This
 component builds the query incrementally (each filter is optional),
 so it constructs through a local mutable mapped type and returns the
 result as ListWalletsQuery. Same pattern as ShareholderListView.vue.

 -----------------------------------------------------------------------------
 Row-actions menu — single-open control
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop
 and emits `update:open`. To ensure only one row's menu is open at a
 time, this page tracks the id of the currently-open row (`openRowId`).
 Each row's DropdownMenu reads its open state from that single ref and
 writes back through a shared handler.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 Prior to 1.0.3 this was not quite true: three Amharic literals
 ('ሁሉም', 'ንቁ', 'ንቁ ያልሆነ') were hardcoded in the `activeOptions`
 computed and in the status-chip cell template. They are now sourced
 from `labels.filterAllLabel`, `labels.statusActiveLabel`, and
 `labels.statusInactiveLabel`, which live in WalletSharedLabels
 (labels.ts 1.1.0). See the file header comment §"Revision history"
 (1.0.3) for the full list.

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
 Unchanged from v1.0.3:

 data-testid="wallet-list-view-root"        on the outer <div>
 data-testid="wallet-list-view-open"        on the Open PrimaryButton
                                             (rendered only when the
                                             user holds wallet.open)
 data-testid="wallet-list-view-search"      on the SearchBar
 data-testid="wallet-list-view-active"      on the status BaseSelect
 data-testid="wallet-list-view-table"       on the DataTable
 data-testid="wallet-list-view-loading"     on the LoadingState
                                             (loading state only)
 data-testid="wallet-list-view-error"       on the ErrorState
                                             (error state only)
 data-testid="wallet-list-view-empty"       on the EmptyState
                                             (empty state only)
 data-testid="wallet-list-view-pagination"  on the Pagination
                                             (rendered only when
                                             meta.last_page > 1)

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.0.3. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - SearchBar, BaseSelect, Pagination, DataTable, and DropdownMenu own
     their own accessibility contracts.
   - The row-actions trigger button receives its accessible name from
     labels.rowActionsAriaLabel; DropdownMenu supplies aria-haspopup,
     aria-expanded, and aria-controls through the scoped slot.
   - The status chip's accessible name is its label text.
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
import { formatCalendarDate } from '@/core/dates/calendar';
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts, delivered in WF-16).
 */

/**
 * Consumer-supplied, translated labels.
 *
 * The shape is exactly WalletListViewLabels (WF-1). The interface is
 * re-imported here so that a consumer of the .vue component gets the
 * type from the component module, matching the shareholders pattern.
 */
import type { WalletListViewLabels } from './labels';
export type { WalletListViewLabels };
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import PermissionGate from '@/components/patterns/PermissionGate';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import DropdownMenu from '@/components/composites/DropdownMenu';
import SearchBar from '@/components/composites/SearchBar';
import Pagination from '@/components/composites/Pagination';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import BaseSelect from '@/components/primitives/BaseSelect';
import PrimaryButton from '@/components/primitives/PrimaryButton';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { listWallets, formatAmount } from '@/features/wallet/service';
import type {
  ListWalletsQuery,
  PaginationMeta,
  Wallet,
} from '@/features/wallet/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletListViewLabels;
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
 * This view is mounted in the workspace build only. The portal's own
 * wallet surface is MyWalletPage, which is a different component in a
 * different route tree.
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// List state (local — see the file header comment)
// -----------------------------------------------------------------------------

/*
 * `isLoading` defaults to `true`. The component begins its life in
 * the loading state and only leaves it when the first fetch resolves
 * or rejects. See the file header revision history (1.0.2) for why
 * this matters: with `false`, the first render resolved `state` to
 * 'empty' and (on slow networks) the browser could paint a bare card
 * before the loading state replaced it.
 */
type ListState = 'loading' | 'error' | 'empty' | 'ready';

const wallets = ref<readonly Wallet[]>([]);
const meta = ref<PaginationMeta>({});
const isLoading = ref<boolean>(true);
const loadError = ref<unknown | null>(null);

const search = ref<string>('');
const activeFilter = ref<string>('all');
const currentPage = ref<number>(1);

// -----------------------------------------------------------------------------
// Derived state
// -----------------------------------------------------------------------------
const state = computed<ListState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (wallets.value.length === 0) return 'empty';
  return 'ready';
});

const totalPages = computed<number>(() => {
  const n = meta.value.last_page;
  return typeof n === 'number' && n > 0 ? n : 1;
});

/*
 * Pagination meta readings. Both values are read defensively: if the
 * API's PaginationMeta does not expose per_page / total, the component
 * falls back to safe defaults so Pagination still renders correctly.
 */
const perPageForPagination = computed<number>(() => {
  const raw = (meta.value as { per_page?: unknown }).per_page;
  return typeof raw === 'number' && raw > 0 ? raw : 20;
});

const totalItemsForPagination = computed<number>(() => {
  const raw = (meta.value as { total?: unknown }).total;
  return typeof raw === 'number' && raw >= 0 ? raw : 0;
});

const showPagination = computed<boolean>(
  () => state.value === 'ready' && totalPages.value > 1,
);

// -----------------------------------------------------------------------------
// Filter options
// -----------------------------------------------------------------------------
/*
 * The active filter has three options:
 *   - 'all'    → filterAllLabel
 *   - 'true'   → statusActiveLabel
 *   - 'false'  → statusInactiveLabel
 *
 * The `value` field carries the wire value consumed by buildQuery();
 * the `label` field is the visible Amharic string. Both the labels
 * and the wire-value mapping are sourced from the `labels` prop —
 * the three strings live in WalletSharedLabels (labels.ts 1.1.0).
 */
const activeOptions = computed(() => [
  { value: 'all', label: props.labels.filterAllLabel },
  { value: 'true', label: props.labels.statusActiveLabel },
  { value: 'false', label: props.labels.statusInactiveLabel },
]);

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
/*
 * A mutable view of ListWalletsQuery. The API type declares its fields
 * readonly; this local view allows incremental construction of the
 * object without fighting the readonly modifier.
 */
type MutableListWalletsQuery = {
  -readonly [K in keyof ListWalletsQuery]: ListWalletsQuery[K];
};

/*
 * Builds the query parameters from the local filter state. Omits "all"
 * values entirely rather than sending them, because the backend would
 * treat "all" as a literal filter value.
 */
function buildQuery(): ListWalletsQuery {
  const query: MutableListWalletsQuery = {
    page: currentPage.value,
  };

  if (search.value !== '') {
    query.search = search.value;
  }
  if (activeFilter.value === 'true') {
    query.is_active = true;
  } else if (activeFilter.value === 'false') {
    query.is_active = false;
  }

  return query;
}

async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listWallets(buildQuery());
    wallets.value = result.items;
    meta.value = result.meta;
  } catch (err) {
    loadError.value = err;
  } finally {
    isLoading.value = false;
  }
}

// -----------------------------------------------------------------------------
// Debounced reload on search / filter / page change
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

watch([search, activeFilter], () => {
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
  { key: 'owner', label: props.labels.columnOwner, align: 'start' },
  { key: 'balance', label: props.labels.columnBalance, align: 'end' },
  { key: 'currency', label: props.labels.columnCurrency, align: 'start' },
  { key: 'status', label: props.labels.columnStatus, align: 'start' },
  { key: 'created', label: props.labels.columnCreated, align: 'start' },
  { key: 'actions', label: props.labels.columnActions, align: 'end' },
]);

/*
 * DataTable's row callback is typed `(row: unknown) => string | number`
 * (non-generic). This function accepts `unknown` to match and narrows
 * internally to Wallet.
 */
function rowKey(row: unknown): string {
  return String((row as Wallet).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to Wallet at the point of use. Remove once
 * DataTable accepts a generic row type.
 */
function asWallet(row: unknown): Wallet {
  return row as Wallet;
}

// -----------------------------------------------------------------------------
// Presentation helpers
// -----------------------------------------------------------------------------
/*
 * The wallet's owner display name. The backend embeds the shareholder
 * summary on the wallet when the relation is eager-loaded; when it is
 * absent, the cell renders the wallet id as a fallback so the row is
 * still identifiable in the table.
 */
function ownerDisplay(wallet: Wallet): string {
  const summary = wallet.shareholder;
  if (summary != null && summary.display_name !== '') {
    return summary.display_name;
  }
  return `#${wallet.id}`;
}

/*
 * ISO 8601 → a short, locale-independent display. The design system's
 * localization contract (§9.6) reserves full date formatting for a
 * future i18n layer; until then, a plain YYYY-MM-DD slice is used.
 */
function formatDate(iso: string | undefined): string {
  return formatCalendarDate(iso, { dateStyle: 'medium' });
}

// -----------------------------------------------------------------------------
// Row actions
// -----------------------------------------------------------------------------
/*
 * The row-actions menu items. Each item's identifier is passed as
 * `key`, matching DropdownMenu's MenuItem contract.
 *
 * The `_wallet` parameter is currently unused but preserved so that
 * future per-row action gating can read the row without a signature
 * change.
 */
function rowActionsFor(_wallet: Wallet) {
  return [
    { key: 'view', label: props.labels.actionView, icon: 'eye' },
    { key: 'statement', label: props.labels.actionStatement, icon: 'file' },
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

async function onRowAction(wallet: Wallet, actionKey: string): Promise<void> {
  if (actionKey === 'view') {
    await router.push(`/wallets/${wallet.id}`);
    return;
  }
  if (actionKey === 'statement') {
    await router.push(`/wallets/${wallet.id}/statement`);
  }
}

// -----------------------------------------------------------------------------
// Primary action
// -----------------------------------------------------------------------------
async function onOpen(): Promise<void> {
  /*
   * The "open wallet" dialog is delivered in WF-7. Until it exists,
   * this handler is a no-op. When WF-7 lands, this function opens the
   * dialog component via a local ref.
   */
  void router;
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .wallet-list-view root div so that its lifetime matches
    the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="wallet-list-view"
    :data-state="state"
    data-testid="wallet-list-view-root"
  >
    <!-- ============================================================
         Page header (title + description + open action)
         ============================================================ -->
    <PageHeader
      :title="labels.pageTitle"
      :description="labels.pageDescription"
    >
      <PermissionGate permission="wallet.open">
        <PrimaryButton
          type="button"
          data-testid="wallet-list-view-open"
          @click="onOpen"
        >{{ labels.openWalletLabel }}</PrimaryButton>
      </PermissionGate>
    </PageHeader>

    <!-- ============================================================
         Search + filter row
         ============================================================ -->
    <div class="wallet-list-view__controls">
      <SearchBar
        v-model="search"
        :placeholder="labels.searchPlaceholder"
        :aria-label="labels.searchAriaLabel"
        data-testid="wallet-list-view-search"
      />

      <BaseSelect
        v-model="activeFilter"
        :aria-label="labels.columnStatus"
        :options="activeOptions"
        data-testid="wallet-list-view-active"
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
        data-testid="wallet-list-view-loading"
      />

      <!-- Error -->
      <ErrorState
        v-else-if="state === 'error'"
        :title="labels.errorMessage"
        :action-label="labels.errorRetryLabel"
        data-testid="wallet-list-view-error"
        @action="load"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="wallet-list-view-empty"
      />

      <!-- Ready -->
      <template v-else>
        <DataTable
          :columns="columns"
          :rows="wallets"
          :row-key="rowKey"
          data-testid="wallet-list-view-table"
        >
          <!-- Owner — a link to the wallet detail page. -->
          <template #cell:owner="{ row }">
            <RouterLink
              class="wallet-list-view__owner-link"
              :to="`/wallets/${asWallet(row).id}`"
            >{{ ownerDisplay(asWallet(row)) }}</RouterLink>
          </template>

          <!--
            Balance — formatted via the service helper.

            The API's Wallet resource emits the balance under the
            column name `current_balance` (matching the `wallets`
            table). Reading `balance` here caused
            `formatAmount(undefined, ...)` to throw inside the cell
            renderer and prevented the row from painting. See the
            file header revision history, 1.0.1.
          -->
          <template #cell:balance="{ row }">
            {{ formatAmount(asWallet(row).current_balance, asWallet(row).currency) }}
          </template>

          <!-- Currency — the ISO code, rendered verbatim. -->
          <template #cell:currency="{ row }">
            {{ asWallet(row).currency }}
          </template>

          <!--
            Status — the backend's is_active boolean, rendered as a
            localized chip. The visible label is sourced from the
            shared labels (labels.statusActiveLabel / statusInactiveLabel
            from WalletSharedLabels, labels.ts 1.1.0). The `data-active`
            attribute carries the raw boolean for styling hooks.
          -->
          <template #cell:status="{ row }">
            <span
              class="wallet-list-view__status"
              :data-active="asWallet(row).is_active ? 'true' : 'false'"
            >
              {{ asWallet(row).is_active ? labels.statusActiveLabel : labels.statusInactiveLabel }}
            </span>
          </template>

          <!-- Created -->
          <template #cell:created="{ row }">
            {{ formatDate(asWallet(row).created_at) }}
          </template>

          <!-- Actions -->
          <template #cell:actions="{ row }">
            <!--
              Row-actions menu.

              DropdownMenu is controlled: `:open` reads from the shared
              single-open state, `@update:open` writes back through the
              shared handler. Only one row's menu is open at a time.

              The trigger element is supplied via the `#default` scoped
              slot.
            -->
            <DropdownMenu
              :open="isRowMenuOpen(String(asWallet(row).id))"
              :items="rowActionsFor(asWallet(row))"
              @update:open="
                (v) => onRowMenuOpenChange(String(asWallet(row).id), v)
              "
              @select="(key) => onRowAction(asWallet(row), key)"
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
                  class="wallet-list-view__row-actions-trigger"
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
          class="wallet-list-view__pagination"
          data-testid="wallet-list-view-pagination"
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
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.wallet-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Search + filter row
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack. The search field and the filter select
   each sit on their own line, both full-width. The `align-items: stretch`
   on the container makes every child fill the cross axis, so no child
   needs its own `width: 100%` override here.

   Tablet and up switch to a horizontal row at the min-width breakpoint
   below, with the search field growing to absorb the remaining space.
   ============================================================================ */
.wallet-list-view__controls {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--mases-space-3);
}

@media (min-width: 640px) {
  .wallet-list-view__controls {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .wallet-list-view__controls > :first-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  .wallet-list-view__controls > :nth-child(2) {
    flex: 0 0 auto;
  }
}

/* ============================================================================
   Owner link
   ============================================================================ */
.wallet-list-view__owner-link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
}

.wallet-list-view__owner-link:hover {
  text-decoration: underline;
}

.wallet-list-view__owner-link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Status chip
   ============================================================================ */
.wallet-list-view__status {
  display: inline-flex;
  align-items: center;
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-2);
  border-radius: var(--mases-radius-sm);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
}

.wallet-list-view__status[data-active='true'] {
  background-color: var(--mases-color-surface-accent);
  color: var(--mases-color-text-accent);
}

.wallet-list-view__status[data-active='false'] {
  background-color: var(--mases-color-surface-sunken);
  color: var(--mases-color-text-tertiary);
}

/* ============================================================================
   Row actions trigger
   ============================================================================ */
.wallet-list-view__row-actions-trigger {
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

.wallet-list-view__row-actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.wallet-list-view__row-actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Pagination wrapper
   ============================================================================ */
.wallet-list-view__pagination {
  display: flex;
  justify-content: center;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-list-view {
    /* no-op placeholder */
  }
}
</style>