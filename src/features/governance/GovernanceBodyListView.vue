<!--
=============================================================================
 CHANGE VERIFICATION — v1.0.4 (duplicate-identifier fix)
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyListView.vue  (AMEND)
 Unit:      Duplicate-identifier fix (build unblock)
 Delivery type:  Correction — the outer <script lang="ts"> block is
                 reduced to the type re-export alone. Two imports and
                 one interface declaration are removed. No template,
                 no state, no behavior change.
 Net lines:      -8 lines removed from <script lang="ts">;
                 ~60 lines docblock added.

 Before (build-broken — five errors from vue-tsc --noEmit):

     GovernanceBodyListView.vue(364,3): TS2300 Duplicate identifier 'GovernanceBody'.
     GovernanceBodyListView.vue(365,3): TS2300 Duplicate identifier 'GovernanceBodiesPaginationMeta'.
     GovernanceBodyListView.vue(368,11): TS6196 'Props' is declared but never used.
     GovernanceBodyListView.vue(393,3): TS2300 Duplicate identifier 'GovernanceBody'.
     GovernanceBodyListView.vue(394,3): TS2300 Duplicate identifier 'GovernanceBodiesPaginationMeta'.

   Root cause: the SFC compiler merges the two script blocks into one
   module. Any name declared in both blocks is a duplicate. The outer
   <script lang="ts"> block was importing GovernanceBody and
   GovernanceBodiesPaginationMeta from './api' and declaring an
   interface Props — all three of which the inner <script setup>
   block also declares. The outer Props was additionally unused
   because defineProps<Props>() lives in the setup block.

 After (v1.0.4):
   The outer <script lang="ts"> block contains exactly one statement:

       export type { GovernanceBodyListViewLabels } from './labels';

   This is the codebase convention established by MyLoansPage.vue,
   MyWalletPage.vue, MyCertificatesPage.vue, and every other page
   that carries both script blocks:

     · <script lang="ts">     — type re-exports only.
     · <script setup>         — every other import, the Props
                                interface, defineProps<Props>().

   The re-export is a pure `export … from` form — it does NOT
   introduce GovernanceBodyListViewLabels into the module's local
   scope, so it does not collide with the setup block's own
   `import type` of the same name.

   The two API type imports (GovernanceBody,
   GovernanceBodiesPaginationMeta) are removed from the outer block
   entirely. They are internal to this component's implementation
   (used in refs, computed types, and cast helpers) and are not part
   of the public surface a consumer would import from this module.
   The setup block imports them for its own use.

   The outer Props interface is removed. Its only purpose had been
   to declare the props type; but defineProps<Props>() reads the
   Props declared in the setup block, and the setup block's Props is
   therefore the one that is actually used.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 10
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 10
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~50 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.2):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at
   /governance/bodies.

 After (v1.0.3):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "የአስተዳደር አካላት — MASES"
     Empty VITE_APP_NAME →  "የአስተዳደር አካላት"

   The portal build does not mount this view (the governance
   vertical is workspace-only), so there is no portal title to
   verify for this file.

   The composed title uses the same `labels.pageTitle` string the
   view's PageHeader already renders as the page's <h1>. The browser
   tab and the page heading agree.

   No other behaviour change. Every existing import, ref, computed,
   watcher, handler, template element, test hook, and scoped style
   rule is byte-for-byte identical to v1.0.2.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — G3 · File 4 of 7 (build fix)
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyListView.vue  (AMEND)
 Unit:      G3 — GovernanceBody frontend module (build fix)
 Delivery type:  Correction — one attribute name changed in the
                 Pagination composite binding. No markup, state, or
                 behaviour change beyond the fix.
 Net lines:      ±1 attribute.

 Before (build-broken):
   The Pagination composite binding used `:aria-label` (kebab-case):

     :aria-label="labels.paginationAriaLabel"

   Vue's template compiler treats the `aria-*` prefix as a reserved
   HTML attribute category and does NOT convert it to an `ariaLabel`
   prop — it treats the attribute as an aria attribute to forward to
   the root element. The compiler therefore did not supply the
   `ariaLabel` prop the component declares, and `vue-tsc --noEmit`
   reported a missing-prop error.

 After (v1.0.2):
   The binding uses `:ariaLabel` (camelCase):

     :ariaLabel="labels.paginationAriaLabel"

   The compiler now supplies the `ariaLabel` prop the component
   declares. `vue-tsc --noEmit` passes on this file; the SPA builds.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — G3 · File 4 of 7 (amendment v1.0.1)
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyListView.vue  (AMEND)
 Unit:      G3 — GovernanceBody frontend module (list view amendment)
 Delivery type:  Amendment — three Pagination prop bindings corrected.
 Net lines:      ±3 lines in the template; ~55 lines docblock.

 Before (v1.0.0):
   The Pagination composite's three label props were bound to
   `labels.pageTitle` as a stopgap.

 After (v1.0.1):
   The three bindings point at the dedicated fields added by the
   labels file's v1.1.0 amendment:
   `paginationAriaLabel`, `paginationPrevLabel`,
   `paginationNextLabel`.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — G3 · File 4 of 7 (initial v1.0.0)
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyListView.vue  (NEW)
 Unit:      G3 — GovernanceBody frontend module (list view)
 Delivery type:  New file.

 After (v1.0.0):
   A read-only list page for /governance/bodies. Five-column table:
   code (linkable), name (display_name), type (backend-supplied
   body_type_label), status (badge), effective-from display.

   Four states: loading / error / empty / ready.

   No filters, no actions column. The code cell carries a RouterLink,
   matching MyLoansPage.vue's single-link pattern.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — GovernanceBodyListView
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyListView.vue
 Layer:     Features (Governance domain)
 Version:   1.0.4
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22
            Governance domain GovernanceBodyController.php (G2a file
              14 of 18, verified against source)
            Governance domain GovernanceBodyResource.php (G2a file 11
              of 17, verified against source)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. The four-state list page with its five
          columns and single-link-per-row pattern.

 1.0.1  — pagination labels rebound. The Pagination composite's three
          label props now read the dedicated fields added to the
          labels file in its v1.1.0 amendment.

 1.0.2  — build fix. The Pagination composite's aria-label binding is
          corrected from `:aria-label` (kebab-case) to `:ariaLabel`
          (camelCase). Vue does not convert the `aria-*` attribute
          category to a camelCase prop name; the compiler was
          forwarding the attribute to the root element rather than
          supplying the `ariaLabel` prop, and `vue-tsc --noEmit`
          reported a missing-prop error.

 1.0.3  — CR-WORKSPACE-TITLE Phase 1 File 10. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

 1.0.4  — duplicate-identifier fix. The outer <script lang="ts">
          block is reduced to the type re-export alone. Two API type
          imports (GovernanceBody, GovernanceBodiesPaginationMeta)
          and one interface declaration (Props) are removed from the
          outer block because the setup block already declares all
          three. The SFC compiler merges the two script blocks into
          one module; any name declared in both is a duplicate.

          No behavior change. The re-export of
          GovernanceBodyListViewLabels is preserved; the Props
          interface that defineProps<Props>() actually reads (the one
          in the setup block) is unchanged.

          See the v1.0.4 change-verification block at the top of this
          file for the full diagnosis and the build errors that
          motivated the fix.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /governance/bodies page's content. Renders a paginated list of
 the current tenant's governance bodies.

 Content page. The route record (G3 file 6) wraps it in
 AuthenticatedLayout. No wrapper file is needed — this is a pure view
 that receives its labels via `props: { labels: ... }`.

 -----------------------------------------------------------------------------
 The two script blocks — the codebase convention
 -----------------------------------------------------------------------------
 This file uses the two-block SFC pattern that the codebase's other
 pages use (MyLoansPage.vue, MyWalletPage.vue, MyCertificatesPage.vue,
 and the other views under src/features/):

   <script lang="ts">
     The outer block. Its only responsibility is the type re-export
     that external consumers import from this module:

         export type { GovernanceBodyListViewLabels } from './labels';

     The `export … from` form is a pure re-export: it does NOT
     introduce the identifier into the module's local scope, so it
     does not collide with the setup block's own `import type` of
     the same name.

     No other statement belongs in this block. Any import, interface,
     or value declared here is merged into the same module scope as
     the setup block's declarations, and a name that appears in both
     blocks is a TS2300 duplicate.

   <script setup lang="ts">
     The setup block. Every other import, the Props interface, the
     defineProps<Props>() call, the component's state, computed
     properties, watchers, handlers, and helper functions.

 -----------------------------------------------------------------------------
 The five columns
 -----------------------------------------------------------------------------
   1. code             →  body.code, rendered as a RouterLink to
                          /governance/bodies/{id}
   2. name             →  body.display_name
   3. type             →  body.body_type_label (backend-supplied)
   4. status           →  StatusBadge driven by body.is_active
   5. effective_from   →  body.effective_from_display (nullable)

 -----------------------------------------------------------------------------
 Pagination
 -----------------------------------------------------------------------------
 The governance-body index emits a FLAT `meta` block. The Pagination
 composite receives `pages`, `perPage`, and `totalItems` from that
 meta and renders only when `last_page > 1`.

 The three label props are bound to the dedicated fields the labels
 file declares. The `ariaLabel` binding uses camelCase — Vue's
 template compiler does not convert the `aria-*` attribute category
 to a camelCase prop name; see the v1.0.2 revision entry.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 No store. The list, the pagination meta, the loading flag, the error
 ref, and the current page live as page-local refs. The state machine
 is the standard four-state form used by every list page in this
 codebase.

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
 Every visual value is a Tier 2 token from tokens.css. No hex value
 appears in this file.

 PageTitle renders nothing and declares no styles. This revision adds
 no CSS.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 Unchanged from v1.0.3:

 data-testid="governance-body-list-view-root"        on the outer <div>
 data-testid="governance-body-list-view-table"       on the DataTable
 data-testid="governance-body-list-view-row-link"    on each code link
 data-testid="governance-body-list-view-status"      on each StatusBadge
 data-testid="governance-body-list-view-loading"     on the LoadingState
 data-testid="governance-body-list-view-error"       on the ErrorState
 data-testid="governance-body-list-view-empty"       on the EmptyState
 data-testid="governance-body-list-view-pagination"  on the Pagination
                                                      wrapper

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
   - DataTable carries its own accessibility contract.
   - StatusBadge carries its own accessible name.
   - The code cell's RouterLink has a visible label.
   - Pagination carries its own aria-label (from
     `labels.paginationAriaLabel`) and its two button labels.
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

 -----------------------------------------------------------------------------
 Outstanding items
 -----------------------------------------------------------------------------
 1. The same duplicate-identifier defect may exist in other feature
    pages under src/features/. The pattern to check for: an outer
    <script lang="ts"> block that imports anything other than the
    label type it re-exports, or that declares an interface that the
    setup block also declares. The codebase's correct pages
    (MyLoansPage.vue and its siblings) contain only the `export type
    { X } from './labels';` statement in the outer block.

 2. The build errors that motivated v1.0.4 were surfaced only after
    the router file's byte-level corruption was repaired. If more
    files carry the same defect, they will surface in the same way —
    one file's errors mask the next file's until the first file
    compiles.
=============================================================================
-->

<script lang="ts">
/*
 * The outer script block.
 *
 * Its sole responsibility is the type re-export that consumers import
 * from this module. The `export … from` form is a pure re-export: it
 * does NOT introduce the identifier into the module's local scope, so
 * it does not collide with the setup block's own `import type` of the
 * same name.
 *
 * No other statement belongs in this block. Any import, interface, or
 * value declared here would be merged into the same module scope as
 * the setup block's declarations, and a name that appears in both
 * blocks is a TS2300 duplicate at vue-tsc time.
 *
 * This is the codebase convention — see MyLoansPage.vue,
 * MyWalletPage.vue, MyCertificatesPage.vue, and the other views under
 * src/features/ that carry both script blocks.
 */
export type { GovernanceBodyListViewLabels } from './labels';
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import Pagination from '@/components/composites/Pagination';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { listGovernanceBodies } from '@/features/governance/service';
import type {
  GovernanceBody,
  GovernanceBodiesPaginationMeta,
} from '@/features/governance/api';
import type { GovernanceBodyListViewLabels } from '@/features/governance/labels';

/**
 * The component's props.
 *
 * Declared in the setup block — not in the outer block — because
 * `defineProps<Props>()` below reads this declaration. The compiler
 * resolves the type argument against the setup block's scope; a
 * second declaration in the outer block would be both unreachable by
 * the macro and a duplicate identifier at the module level.
 */
interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   *
   * The route record passes `governanceBodyListViewLabels` from
   * src/features/governance/labels.ts.
   */
  labels: GovernanceBodyListViewLabels;
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
 * This view is mounted in the workspace build only — the governance
 * vertical is workspace-only. The portal value is therefore never
 * observed here, but the same `VITE_APP_NAME` read is used uniformly
 * across the CR's scope for consistency.
 *
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// List state (local — see the file header comment)
// -----------------------------------------------------------------------------
type ListState = 'loading' | 'error' | 'empty' | 'ready';

/**
 * The current page's rows, as returned by the service. Empty until
 * the first fetch resolves; replaced on every subsequent fetch (a
 * page change re-runs `load` via the watcher below).
 */
const bodies = ref<readonly GovernanceBody[]>([]);

/**
 * The pagination meta for the current page, or null before the first
 * fetch. The three derived values below read from it defensively:
 * `totalPages` falls back to 1, `perPage` to 25, `totalItems` to 0.
 */
const meta = ref<GovernanceBodiesPaginationMeta | null>(null);

/**
 * Loading flag. Initialised to `true` so the first paint after mount
 * shows the loading state rather than an empty table.
 */
const isLoading = ref<boolean>(true);

/**
 * Error ref. Non-null when the last fetch rejected. Used by the
 * `state` computed to select the error branch, and cleared at the
 * start of every `load()`.
 */
const loadError = ref<unknown | null>(null);

/**
 * The current page number, bound to the Pagination composite via
 * `v-model:page`. Changing it re-runs `load` via the watcher below.
 */
const currentPage = ref<number>(1);

// -----------------------------------------------------------------------------
// Derived state
// -----------------------------------------------------------------------------
/*
 * The four-state machine. Every rendering decision in the template
 * reads from this one computed, so the states cannot drift apart.
 */
const state = computed<ListState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (bodies.value.length === 0) return 'empty';
  return 'ready';
});

/*
 * The three pagination values. Each reads from `meta` with a
 * defensive fallback for the pre-fetch state — meta is null on
 * mount, before the first response.
 */
const totalPages = computed<number>(() => meta.value?.last_page ?? 1);
const perPage = computed<number>(() => meta.value?.per_page ?? 25);
const totalItems = computed<number>(() => meta.value?.total ?? 0);

/*
 * Whether the pagination control renders. Two conditions: the state
 * must be `ready` (the table is showing rows), and the response must
 * report more than one page. A single-page result renders no
 * pagination.
 */
const showPagination = computed<boolean>(
  () => state.value === 'ready' && totalPages.value > 1,
);

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
/*
 * Fetch the current page's rows. Called once on mount, and again
 * whenever `currentPage` changes.
 *
 * The `isLoading` flag is set before the await so the loading state
 * renders during the request; the error ref is cleared at the same
 * moment so a previous failure does not linger into the new attempt.
 * On success both `bodies` and `meta` are replaced; on failure both
 * are reset to their empty values so the error state does not show
 * stale rows underneath.
 */
async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listGovernanceBodies({
      page: currentPage.value,
    });
    bodies.value = result.items;
    meta.value = result.meta;
  } catch (err) {
    loadError.value = err;
    bodies.value = [];
    meta.value = null;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

watch(currentPage, () => {
  void load();
});

// -----------------------------------------------------------------------------
// Table columns
// -----------------------------------------------------------------------------
/*
 * The five column definitions. Computed because the labels come from
 * the props — a re-render with different labels (a language switch,
 * in a future i18n revision) must rebuild the column array.
 */
const columns = computed<readonly DataTableColumn[]>(() => [
  { key: 'code',           label: props.labels.columnCode,          align: 'start' },
  { key: 'name',           label: props.labels.columnName,          align: 'start' },
  { key: 'type',           label: props.labels.columnType,          align: 'start' },
  { key: 'status',         label: props.labels.columnStatus,        align: 'start' },
  { key: 'effective_from', label: props.labels.columnEffectiveFrom, align: 'start' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to GovernanceBody.
 */
function rowKey(row: unknown): string {
  return String((row as GovernanceBody).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`.
 * This helper narrows it back to GovernanceBody at the point of use.
 * Remove once DataTable accepts a generic row type.
 */
function asBody(row: unknown): GovernanceBody {
  return row as GovernanceBody;
}

// -----------------------------------------------------------------------------
// Status badge
// -----------------------------------------------------------------------------
/*
 * Map the row's is_active flag to a BadgeVariant token.
 *
 * "active"   →  success
 * "inactive" →  neutral
 */
function statusVariant(isActive: boolean): 'success' | 'neutral' {
  return isActive ? 'success' : 'neutral';
}

/*
 * Map the row's is_active flag to the localized status label from the
 * labels prop. The labels file declares `statusActive` and
 * `statusInactive`; a future revision that adds a third status (say,
 * "pending") extends this helper in the same change.
 */
function statusLabel(isActive: boolean): string {
  return isActive ? props.labels.statusActive : props.labels.statusInactive;
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .governance-body-list-view root div so that its lifetime
    matches the route's lifetime.

    The template is a two-root fragment (Vue 3 supports this
    natively). The PageTitle element and the .governance-body-list-view
    div are siblings at the top level; there is no wrapper element
    around them.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="governance-body-list-view"
    :data-state="state"
    data-testid="governance-body-list-view-root"
  >
    <!-- ============================================================
         Page header
         ============================================================ -->
    <PageHeader
      :title="labels.pageTitle"
      :description="labels.pageDescription"
    />

    <!-- ============================================================
         Content (four states)
         ============================================================ -->
    <Card padding="none">
      <!-- Loading -->
      <LoadingState
        v-if="state === 'loading'"
        :message="labels.loadingMessage"
        data-testid="governance-body-list-view-loading"
      />

      <!-- Error -->
      <ErrorState
        v-else-if="state === 'error'"
        :title="labels.errorMessage"
        :action-label="labels.errorRetryLabel"
        data-testid="governance-body-list-view-error"
        @action="load"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="governance-body-list-view-empty"
      />

      <!-- Ready -->
      <template v-else>
        <DataTable
          :columns="columns"
          :rows="bodies"
          :row-key="rowKey"
          data-testid="governance-body-list-view-table"
        >
          <!--
            Code — the body's canonical identifier, rendered as the
            row's only link. The link targets the detail route
            (/governance/bodies/:id), matching the single-link-per-row
            pattern MyLoansPage.vue uses for its principal cell.
          -->
          <template #cell:code="{ row }">
            <RouterLink
              class="governance-body-list-view__code-link"
              :to="`/governance/bodies/${asBody(row).id}`"
              data-testid="governance-body-list-view-row-link"
            >{{ asBody(row).code }}</RouterLink>
          </template>

          <!-- Name — the locale-aware display name. -->
          <template #cell:name="{ row }">
            {{ asBody(row).display_name }}
          </template>

          <!--
            Type — the backend-supplied localized label. The
            GovernanceBodyResource emits `body_type_label` alongside
            the raw `body_type` value, so the frontend performs no
            mapping.
          -->
          <template #cell:type="{ row }">
            {{ asBody(row).body_type_label }}
          </template>

          <!--
            Status — badge driven by the row's is_active flag. The
            label comes from the labels prop; the variant from
            statusVariant above.
          -->
          <template #cell:status="{ row }">
            <StatusBadge
              :status="asBody(row).is_active ? 'active' : 'inactive'"
              :variant="statusVariant(asBody(row).is_active)"
              :label="statusLabel(asBody(row).is_active)"
              data-testid="governance-body-list-view-status"
            />
          </template>

          <!--
            Effective from — the Ethiopian-calendar display string,
            nullable. An open-start body renders an empty cell.
          -->
          <template #cell:effective_from="{ row }">
            {{ asBody(row).effective_from_display ?? '' }}
          </template>
        </DataTable>

        <!--
          Pagination.

          The `ariaLabel` binding uses camelCase — Vue's template
          compiler does not convert the `aria-*` attribute category
          to a camelCase prop name, so the kebab-case form
          `:aria-label` was forwarding the attribute to the root
          element rather than supplying the `ariaLabel` prop. See
          the v1.0.2 revision entry above.

          The other kebab-case props (per-page-label, previous-label,
          next-label, show-total, total-items) are unaffected — Vue
          converts kebab-case to camelCase for every prop name
          except the `aria-*` category.
        -->
        <div
          v-if="showPagination"
          class="governance-body-list-view__pagination"
          data-testid="governance-body-list-view-pagination"
        >
          <Pagination
            v-model:page="currentPage"
            :pages="totalPages"
            :per-page="perPage"
            :total-items="totalItems"
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
   ---------------------------------------------------------------------------
   A vertical stack. The gap matches the shape used by the other list
   views in this codebase (MyLoansPage.vue, WalletListView.vue, etc.).
   ============================================================================ */
.governance-body-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Code link
   ---------------------------------------------------------------------------
   The code cell's RouterLink. Matches the link styling used by the
   other list views' primary-cell links — a brand-coloured link with
   an underline on hover and a visible focus ring.
   ============================================================================ */
.governance-body-list-view__code-link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
  font-variant-numeric: tabular-nums;
}

.governance-body-list-view__code-link:hover {
  text-decoration: underline;
}

.governance-body-list-view__code-link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Pagination wrapper
   ---------------------------------------------------------------------------
   A centred band with a top border, matching the pagination wrapper
   used by the other paginated list views in this codebase.
   ============================================================================ */
.governance-body-list-view__pagination {
  display: flex;
  justify-content: center;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   This file defines no animation. The media query is a defensive
   placeholder: if a future revision adds a hover transition or an
   entrance animation, the block is already in place to disable it
   under the user's reduced-motion preference.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .governance-body-list-view {
    /* no-op placeholder */
  }
}
</style>