<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 2
=============================================================================

 File:      mase_app/src/features/shareholders/ShareholderListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 2
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~50 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.1.0):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at /shareholders.

 After (v1.1.1):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "ባለአክሲዮኖች — MASES"
     Empty VITE_APP_NAME →  "ባለአክሲዮኖች"

   The portal build does not mount this view (the shareholders
   vertical is workspace-only), so there is no portal title to
   verify for this file.

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
 MASES Phase 2 UI — ShareholderListView
=============================================================================

 File:      mase_app/src/features/shareholders/ShareholderListView/ShareholderListView.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.1.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §8.6,
              §9.14–§9.15, §9.19–§9.21, §11.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §13.3, §22 STAGE 15
            ShareholderController.php  (verified against source)
            ShareholderResource.php    (verified against source)
            P3 · Unit 2 (date rendering)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 15).
 1.0.1  — API-drift corrections:
          · ErrorState       — message/retry-label/@retry → title/action-label/@action
          · Pagination       — current-page/total-pages/aria-label/prev-label
                               → page/pages/per-page/total-items/ariaLabel/
                                 per-page-label/previous-label (+show-total)
          · DataTable        — TableColumn → DataTableColumn
          · DataTable rowKey — widened to (row: unknown) for variance compat
          · DataTable slots  — added asShareholder() cast helper
          · DropdownMenu     — MenuItem.id → MenuItem.key
          · DropdownMenu     — controlled `open` prop; single-open row state
                               added; #trigger → #default scoped slot wired
                               with triggerId/aria-haspopup/aria-expanded/
                               aria-controls/toggle
          · ListShareholdersQuery — buildQuery constructs through a local
                               mutable mapped type (readonly fields)
 1.1.0  — Ethiopian calendar date rendering (P3 · Unit 2):
          · The local `formatDate()` helper is removed.
          · The `created` column now renders the backend-supplied
            `created_at_display` field, which carries the locale-appropriate
            medium Ethiopian form
            (`ሐምሌ 9, 2018 ዓ.ም. (July 16, 2026)` for `am`,
             `Hamle 9, 2018 E.C. (July 16, 2026)` for `en`).
          · No structural change. No new labels. No new state. Every other
            column, action, and state is unchanged.

 1.1.1  — CR-WORKSPACE-TITLE Phase 1 File 2. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the second workspace view in the CR's scope,
          following FilesListView.vue v1.0.3.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, watcher, handler,
              template element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .shareholder-list-view div. The
          template becomes a two-node fragment; Vue 3 supports
          multi-root templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /shareholders page's content. Renders a searchable, filterable,
 paginated list of the current tenant's shareholders, with:
   - a "New shareholder" primary action (gated by shareholder.create)
   - a per-row actions menu (view / edit, the latter gated by
     shareholder.update)
   - four data states: loading / error / empty / ready

 Content page. The route component (Unit 15.10) wraps it in the
 AuthenticatedLayout (Unit 14.5), which composes AppShell.

 -----------------------------------------------------------------------------
 Workspace-only page
 -----------------------------------------------------------------------------
 The backend's GET /api/shareholders route is gated by
 `auth.permission:shareholder.view`. A regular shareholder holding only
 `shareholder.view_own` cannot call it. The portal build therefore does
 not route to this page — a shareholder's landing page is the portal's
 own detail view. This page is for the workspace.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The list, its pagination meta, the search term, the two filters, and
 the currently-open row-actions menu are component-local refs. The
 service (Unit 15.2) is stateless.

 -----------------------------------------------------------------------------
 Permission gating (§7.3.2)
 -----------------------------------------------------------------------------
 The "New shareholder" action is gated on shareholder.create.
 The "Edit" row action is gated on shareholder.update.
 The "View" row action is ungated (the backend enforces shareholder.view
 on the detail endpoint).

 -----------------------------------------------------------------------------
 Type filter values (D9)
 -----------------------------------------------------------------------------
 Six enum values are offered, plus "All".

 -----------------------------------------------------------------------------
 Query construction — mutable view of a readonly type
 -----------------------------------------------------------------------------
 The API module declares ListShareholdersQuery with readonly fields.
 This component builds the query incrementally (each filter is
 optional), so it constructs through a local mutable mapped type and
 returns the result as ListShareholdersQuery. See buildQuery() below.

 -----------------------------------------------------------------------------
 Row-actions menu — single-open control
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop and
 emits `update:open`. To ensure only one row's menu is open at a time,
 this page tracks the id of the currently-open row (`openRowId`). Each
 row's DropdownMenu reads its open state from that single ref and
 writes back through a shared handler.

 -----------------------------------------------------------------------------
 Date rendering (P3 · Unit 2)
 -----------------------------------------------------------------------------
 The `created` column renders `created_at_display`, the backend-supplied
 medium Ethiopian form. The frontend does no date formatting of its own.
 The ISO `created_at` field remains available on the wire for consumers
 that need a machine-readable instant; this page does not use it.

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
 Every visible string comes from the `labels` prop. The <PageTitle>
 binding reads `labels.pageTitle` — an existing label; no literal
 string is introduced. The only literal in the file's scope is the
 `— ` separator, which is owned by PageTitle, not by this file.

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

 data-testid="shareholder-list-view-root"        on the outer <div>
 data-testid="shareholder-list-view-create"      on the New shareholder
                                                 PrimaryButton
 data-testid="shareholder-list-view-search"      on the SearchBar
 data-testid="shareholder-list-view-type"        on the type BaseSelect
 data-testid="shareholder-list-view-active"      on the active BaseSelect
 data-testid="shareholder-list-view-table"       on the DataTable
 data-testid="shareholder-list-view-loading"     on the LoadingState
 data-testid="shareholder-list-view-error"       on the ErrorState
 data-testid="shareholder-list-view-empty"       on the EmptyState
 data-testid="shareholder-list-view-pagination"  on the Pagination

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.1.0. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - SearchBar, BaseSelect, Pagination, DataTable, and DropdownMenu own
     their own accessibility contracts.
   - The row-actions trigger button receives its accessible name from
     labels.rowActionsAriaLabel; DropdownMenu supplies aria-haspopup,
     aria-expanded, and aria-controls through the scoped slot.
   - The name link in each row's `name` cell is a RouterLink with a
     visible label.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface ShareholderListViewLabels {
  /* PageHeader */
  readonly pageTitle: string;
  readonly pageDescription: string;

  /* Primary action */
  readonly newShareholderLabel: string;

  /* Search */
  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;

  /* Type filter */
  readonly typeFilterLabel: string;
  readonly typeFilterAll: string;
  readonly typeFilterIndividual: string;
  readonly typeFilterCompany: string;
  readonly typeFilterTrust: string;
  readonly typeFilterCooperative: string;
  readonly typeFilterGovernment: string;
  readonly typeFilterReligiousBody: string;

  /* Active filter */
  readonly activeFilterLabel: string;
  readonly activeFilterAll: string;
  readonly activeFilterActive: string;
  readonly activeFilterInactive: string;

  /* Table columns */
  readonly columnName: string;
  readonly columnType: string;
  readonly columnStatus: string;
  readonly columnCreated: string;
  readonly columnActions: string;

  /* Row actions */
  readonly rowActionsAriaLabel: string;
  readonly actionView: string;
  readonly actionEdit: string;

  /* States */
  readonly loadingMessage: string;
  readonly errorMessage: string;
  readonly errorRetryLabel: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;

  /* Pagination */
  readonly paginationAriaLabel: string;
  readonly paginationPrevLabel: string;
  readonly paginationNextLabel: string;
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

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

import { useAuthStore } from '@/stores/auth';
import { listShareholders } from '@/features/shareholders/service';
import type {
  ListShareholdersQuery,
  PaginationMeta,
  Shareholder,
} from '@/features/shareholders/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: ShareholderListViewLabels;
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
 * This view is mounted in the workspace build only — the shareholders
 * vertical is workspace-only. The portal value is therefore never
 * observed here, but the same `VITE_APP_NAME` read is used uniformly
 * across the CR's scope for consistency.
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// Auth store (only for row-action permission filtering — see the file header)
// -----------------------------------------------------------------------------
const auth = useAuthStore();
const canUpdate = computed<boolean>(() => auth.hasPermission('shareholder.update'));

// -----------------------------------------------------------------------------
// List state (local — see the file header comment)
// -----------------------------------------------------------------------------
type ListState = 'loading' | 'error' | 'empty' | 'ready';

const shareholders = ref<readonly Shareholder[]>([]);
const meta = ref<PaginationMeta>({});
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);

const search = ref<string>('');
const typeFilter = ref<string>('all');
const activeFilter = ref<string>('all');
const currentPage = ref<number>(1);

// -----------------------------------------------------------------------------
// Derived state
// -----------------------------------------------------------------------------
const state = computed<ListState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (shareholders.value.length === 0) return 'empty';
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
const typeOptions = computed(() => [
  { value: 'all', label: props.labels.typeFilterAll },
  { value: 'individual', label: props.labels.typeFilterIndividual },
  { value: 'company', label: props.labels.typeFilterCompany },
  { value: 'trust', label: props.labels.typeFilterTrust },
  { value: 'cooperative', label: props.labels.typeFilterCooperative },
  { value: 'government', label: props.labels.typeFilterGovernment },
  { value: 'religious_body', label: props.labels.typeFilterReligiousBody },
]);

const activeOptions = computed(() => [
  { value: 'all', label: props.labels.activeFilterAll },
  { value: 'true', label: props.labels.activeFilterActive },
  { value: 'false', label: props.labels.activeFilterInactive },
]);

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
/*
 * A mutable view of ListShareholdersQuery. The API type declares its
 * fields readonly; this local view allows incremental construction of
 * the object without fighting the readonly modifier. The final value
 * is structurally identical and satisfies the readonly interface.
 */
type MutableListShareholdersQuery = {
  -readonly [K in keyof ListShareholdersQuery]: ListShareholdersQuery[K];
};

/*
 * Builds the query parameters from the local filter state. Omits "all"
 * values entirely rather than sending them, because the backend would
 * treat "all" as a literal filter value.
 */
function buildQuery(): ListShareholdersQuery {
  const query: MutableListShareholdersQuery = {
    page: currentPage.value,
  };

  if (search.value !== '') {
    query.search = search.value;
  }
  if (typeFilter.value !== 'all') {
    query.type = typeFilter.value;
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
    const result = await listShareholders(buildQuery());
    shareholders.value = result.items;
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

watch([search, typeFilter, activeFilter], () => {
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
  { key: 'name', label: props.labels.columnName, align: 'start' },
  { key: 'type', label: props.labels.columnType, align: 'start' },
  { key: 'status', label: props.labels.columnStatus, align: 'start' },
  { key: 'created', label: props.labels.columnCreated, align: 'start' },
  { key: 'actions', label: props.labels.columnActions, align: 'end' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to Shareholder.
 */
function rowKey(row: unknown): string {
  return String((row as Shareholder).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to Shareholder at the point of use. Remove
 * once DataTable accepts a generic row type — at that point the slot
 * types propagate the consumer's row type automatically and the casts
 * become unnecessary.
 */
function asShareholder(row: unknown): Shareholder {
  return row as Shareholder;
}

// -----------------------------------------------------------------------------
// Presentation helpers
// -----------------------------------------------------------------------------
/*
 * The `formatDate` helper that existed in 1.0.0 and 1.0.1 was removed in
 * 1.1.0. The page's only date column now reads the backend-supplied
 * `created_at_display` field directly. See the file header §"Date
 * rendering (P3 · Unit 2)".
 */

// -----------------------------------------------------------------------------
// Row actions
// -----------------------------------------------------------------------------
/*
 * The action list is built per-row and filtered by permission. Each
 * item's identifier is passed as `key`, matching DropdownMenu's
 * MenuItem contract.
 *
 * The `_row` parameter is currently unused but preserved so that
 * future per-row action gating (e.g. hiding 'edit' when the specific
 * row is not editable) can read the row without a signature change.
 */
function rowActionsFor(_row: Shareholder) {
  const viewItem = { key: 'view', label: props.labels.actionView, icon: 'eye' };
  if (!canUpdate.value) {
    return [viewItem];
  }
  // 'edit' has no frozen-registry icon; the menu renders label-only.
  return [
    viewItem,
    { key: 'edit', label: props.labels.actionEdit },
  ];
}

// -----------------------------------------------------------------------------
// Row-actions menu open state (single-open control)
// -----------------------------------------------------------------------------
/*
 * DropdownMenu is a controlled component — it requires an `open` prop
 * and emits `update:open`. To ensure only one row's menu is open at a
 * time, this page tracks the id of the currently-open row. Each row's
 * menu reads its open state from this single ref and writes back
 * through the shared handler below.
 *
 * `null` means no menu is open.
 */
const openRowId = ref<string | null>(null);

function isRowMenuOpen(rowId: string): boolean {
  return openRowId.value === rowId;
}

function onRowMenuOpenChange(rowId: string, open: boolean): void {
  openRowId.value = open ? rowId : null;
}

async function onRowAction(
  row: Shareholder,
  actionKey: string,
): Promise<void> {
  if (actionKey === 'view') {
    await router.push(`/shareholders/${row.id}`);
    return;
  }
  if (actionKey === 'edit') {
    await router.push(`/shareholders/${row.id}/edit`);
  }
}

// -----------------------------------------------------------------------------
// Primary action
// -----------------------------------------------------------------------------
async function onCreate(): Promise<void> {
  await router.push('/shareholders/new');
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .shareholder-list-view root div so that its lifetime
    matches the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="shareholder-list-view"
    :data-state="state"
    data-testid="shareholder-list-view-root"
  >
    <!-- ============================================================
         Page header (title + description + create action)
         ============================================================ -->
    <PageHeader
      :title="labels.pageTitle"
      :description="labels.pageDescription"
    >
      <PermissionGate permission="shareholder.create">
        <PrimaryButton
          type="button"
          data-testid="shareholder-list-view-create"
          @click="onCreate"
        >{{ labels.newShareholderLabel }}</PrimaryButton>
      </PermissionGate>
    </PageHeader>

    <!-- ============================================================
         Search + filter row
         ============================================================ -->
    <div class="shareholder-list-view__controls">
      <SearchBar
        v-model="search"
        :placeholder="labels.searchPlaceholder"
        :aria-label="labels.searchAriaLabel"
        data-testid="shareholder-list-view-search"
      />

      <BaseSelect
        v-model="typeFilter"
        :aria-label="labels.typeFilterLabel"
        :options="typeOptions"
        data-testid="shareholder-list-view-type"
      />

      <BaseSelect
        v-model="activeFilter"
        :aria-label="labels.activeFilterLabel"
        :options="activeOptions"
        data-testid="shareholder-list-view-active"
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
        data-testid="shareholder-list-view-loading"
      />

      <!-- Error -->
      <ErrorState
        v-else-if="state === 'error'"
        :title="labels.errorMessage"
        :action-label="labels.errorRetryLabel"
        data-testid="shareholder-list-view-error"
        @action="load"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="shareholder-list-view-empty"
      />

      <!-- Ready -->
      <template v-else>
        <DataTable
          :columns="columns"
          :rows="shareholders"
          :row-key="rowKey"
          data-testid="shareholder-list-view-table"
        >
          <!-- Name — uses the backend's locale-aware composed name. -->
          <template #cell:name="{ row }">
            <RouterLink
              class="shareholder-list-view__name-link"
              :to="`/shareholders/${asShareholder(row).id}`"
            >{{ asShareholder(row).display_name }}</RouterLink>
          </template>

          <!-- Type — backend-translated. -->
          <template #cell:type="{ row }">
            {{ asShareholder(row).type_label }}
          </template>

          <!-- Status — backend-translated. -->
          <template #cell:status="{ row }">
            {{ asShareholder(row).status_label }}
          </template>

          <!-- Created — backend-supplied localized display string. -->
          <template #cell:created="{ row }">
            {{ asShareholder(row).created_at_display }}
          </template>

          <!-- Actions -->
          <template #cell:actions="{ row }">
            <!--
              Row-actions menu.

              DropdownMenu is controlled: `:open` reads from the shared
              single-open state, `@update:open` writes back through the
              shared handler. Only one row's menu is open at a time.

              The trigger element is supplied via the `#default` scoped
              slot. The slot exposes the trigger's id, its ARIA
              attributes, and the toggle function; the button binds
              them all so the menu's aria-labelledby resolves, the
              aria-expanded state reflects `open`, and clicks toggle
              the menu.
            -->
            <DropdownMenu
              :open="isRowMenuOpen(String(asShareholder(row).id))"
              :items="rowActionsFor(asShareholder(row))"
              @update:open="
                (v) => onRowMenuOpenChange(String(asShareholder(row).id), v)
              "
              @select="(key) => onRowAction(asShareholder(row), key)"
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
                  class="shareholder-list-view__row-actions-trigger"
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
          class="shareholder-list-view__pagination"
          data-testid="shareholder-list-view-pagination"
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
.shareholder-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Search + filter row
   ---------------------------------------------------------------------------
   Three controls. SearchBar grows; the two BaseSelects stay at their
   natural widths on desktop. On mobile the row stacks.
   ============================================================================ */
.shareholder-list-view__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mases-space-3);
}

.shareholder-list-view__controls > :first-child {
  flex: 1 1 auto;
  min-width: 0;
}

.shareholder-list-view__controls > :nth-child(2),
.shareholder-list-view__controls > :nth-child(3) {
  flex: 0 0 auto;
}

/* ============================================================================
   Row name link
   ============================================================================ */
.shareholder-list-view__name-link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
}

.shareholder-list-view__name-link:hover {
  text-decoration: underline;
}

.shareholder-list-view__name-link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Row actions trigger
   ---------------------------------------------------------------------------
   A minimal button containing the ellipsis glyph. DropdownMenu owns the
   open/close logic and the menu; this button is the trigger it wires
   with the id, aria-haspopup, aria-expanded, aria-controls, and toggle
   callback exposed by the scoped slot.
   ============================================================================ */
.shareholder-list-view__row-actions-trigger {
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

.shareholder-list-view__row-actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.shareholder-list-view__row-actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Pagination wrapper
   ============================================================================ */
.shareholder-list-view__pagination {
  display: flex;
  justify-content: center;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   The filter row stacks. Search takes full width; each select takes
   full width so the tap target is comfortable.
   ============================================================================ */
@media (max-width: 639px) {
  .shareholder-list-view__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .shareholder-list-view__controls > :nth-child(2),
  .shareholder-list-view__controls > :nth-child(3) {
    width: 100%;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .shareholder-list-view {
    /* no-op placeholder */
  }
}
</style>