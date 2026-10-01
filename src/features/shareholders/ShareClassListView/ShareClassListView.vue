<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 3
=============================================================================

 File:      mase_app/src/features/shareholders/ShareClassListView/ShareClassListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 3
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~45 docblock; +1 import; +3 lines const;
                 +9 lines template element (with leading comment).

 Before (v1.0.0):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at
   /shareholders/classes.

 After (v1.0.1):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build    →  "የአክሲዮን ክፍሎች — MASES"
     Empty VITE_APP_NAME →  "የአክሲዮን ክፍሎች"

   The portal build does not mount this view (the shareholders
   vertical is workspace-only), so there is no portal title to
   verify for this file.

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
 MASES Phase 2 UI — ShareClassListView
=============================================================================

 File:      mase_app/src/features/shareholders/ShareClassListView/ShareClassListView.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §11.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §13.3, §22 STAGE 15
            ShareClassController.php / ShareClassResource.php
              (verified against source)
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. The reference-data table for the tenant's
          share classes (FOUNDERS, STANDARD, and any future
          additions). Four data states; no search, no filter, no
          pagination.

 1.0.1  — CR-WORKSPACE-TITLE Phase 1 File 3. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the third workspace view in the CR's scope,
          following FilesListView.vue v1.0.3 and ShareholderListView.vue
          v1.1.1.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, handler, template
              element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .share-class-list-view div. The
          template becomes a two-node fragment; Vue 3 supports
          multi-root templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /shareholders/classes page's content. Renders the tenant's share
 class reference data (FOUNDERS, STANDARD, and any future additions) as
 a single read-only table.

 Content page. The route wrapper (Unit 15.10) composes it inside
 AuthenticatedLayout.

 -----------------------------------------------------------------------------
 Deliberately minimal — see the response preamble
 -----------------------------------------------------------------------------
 No search, no filter, no sort, no pagination, no row actions. The
 reference data is two rows; adding any of these capabilities would be
 unnecessary complexity (master prompt §30).

 A future CR that adds a capability will need to justify it.

 -----------------------------------------------------------------------------
 Backend-supplied order
 -----------------------------------------------------------------------------
 ShareClassController::index() returns classes in the canonical order
 defined by config('shareholder.share_classes.codes'). This view does
 not re-sort: the frozen order is the backend's concern.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The list and the loading/error flags are component-local refs.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The backend-translated
 `display_name` is rendered verbatim — this view does not re-translate.

 The <PageTitle> binding reads `labels.pageTitle` — an existing label;
 no literal string is introduced. The only literal in the file's scope
 is the `— ` separator, which is owned by PageTitle, not by this file.

 -----------------------------------------------------------------------------
 StatusBadge contract note
 -----------------------------------------------------------------------------
 StatusBadge requires a `status` string prop (a stable semantic
 identifier, distinct from the visual `variant`) in addition to
 `variant`, `label`, and the optional `icon` / `dot` / `size` props.

 The `status` values used below are the backend's semantic enum values
 ("founder", "default", "active", "inactive"). The `variant` values
 follow the standard visual palette ("warning", "info", "success",
 "neutral").

 See the accompanying change report for the caveats on BadgeVariant
 membership.

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
 Test hooks
 -----------------------------------------------------------------------------
 Unchanged from v1.0.0:

 data-testid="share-class-list-view-root"          on the outer <div>
 data-testid="share-class-list-view-loading"       on the LoadingState
 data-testid="share-class-list-view-error"         on the ErrorState
 data-testid="share-class-list-view-empty"         on the EmptyState
 data-testid="share-class-list-view-table"         on the DataTable
 data-testid="share-class-list-view-flag-founder"  on the founder chip
 data-testid="share-class-list-view-flag-default"  on the default chip
 data-testid="share-class-list-view-status"        on the active chip

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.0.0. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - DataTable carries its own accessibility contract.
   - The code cell renders its value in a monospace font.
   - Each StatusBadge carries its own accessible name from its label.
   - No focus, no keyboard interaction, no ARIA role beyond the
     composed components' own semantics.
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
 */
export interface ShareClassListViewLabels {
  /* PageHeader */
  readonly pageTitle: string;
  readonly pageDescription: string;

  /* Table columns */
  readonly columnCode: string;
  readonly columnName: string;
  readonly columnParValue: string;
  readonly columnFlags: string;
  readonly columnActive: string;

  /* Flag chips */
  readonly flagFounder: string;
  readonly flagDefault: string;

  /* Status chips */
  readonly statusActive: string;
  readonly statusInactive: string;

  /* States */
  readonly loadingMessage: string;
  readonly errorMessage: string;
  readonly errorRetryLabel: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { listShareClasses } from '@/features/shareholders/service';
import type { ShareClass } from '@/features/shareholders/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: ShareClassListViewLabels;
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
// State
// -----------------------------------------------------------------------------
type ListState = 'loading' | 'error' | 'empty' | 'ready';

const shareClasses = ref<readonly ShareClass[]>([]);
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);

const state = computed<ListState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (shareClasses.value.length === 0) return 'empty';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listShareClasses();
    shareClasses.value = result;
  } catch (err) {
    loadError.value = err;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Table columns
// -----------------------------------------------------------------------------
const columns = computed<readonly DataTableColumn[]>(() => [
  { key: 'code', label: props.labels.columnCode, align: 'start' },
  { key: 'name', label: props.labels.columnName, align: 'start' },
  { key: 'par_value', label: props.labels.columnParValue, align: 'end' },
  { key: 'flags', label: props.labels.columnFlags, align: 'start' },
  { key: 'active', label: props.labels.columnActive, align: 'start' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to ShareClass.
 */
function rowKey(row: unknown): string {
  return String((row as ShareClass).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to ShareClass at the point of use. Remove once
 * DataTable accepts a generic row type.
 */
function asShareClass(row: unknown): ShareClass {
  return row as ShareClass;
}

// -----------------------------------------------------------------------------
// Presentation helpers
// -----------------------------------------------------------------------------
/*
 * Par value formatter — monetary, not a share quantity. Renders the
 * numeric part with two decimal places and appends the currency code.
 *
 * The backend emits par_value as a DECIMAL(20,4) string; two decimals is
 * the standard currency presentation convention.
 */
function formatParValue(decimal: string, currency: string): string {
  if (decimal === '') return '';

  // Split the DECIMAL(20,4) string on the decimal point.
  const dot = decimal.indexOf('.');

  // No fractional part — pad to two decimals.
  if (dot < 0) {
    return `${decimal}.00 ${currency}`;
  }

  const integerPart = decimal.slice(0, dot);
  const fraction = decimal.slice(dot + 1);

  // Pad the fractional part to at least two digits, then truncate to
  // exactly two.
  const padded = (fraction + '00').slice(0, 2);

  return `${integerPart}.${padded} ${currency}`;
}

// -----------------------------------------------------------------------------
// Flag and status helpers
// -----------------------------------------------------------------------------
function hasAnyFlag(row: ShareClass): boolean {
  return row.is_founder || row.is_default;
}

/*
 * Maps the share class's active boolean to a StatusBadge variant.
 *
 * "active"   →  success   (standard positive-status palette)
 * "inactive" →  neutral   (no semantic weight; a de-emphasized state)
 *
 * If the codebase's BadgeVariant union uses different tokens (e.g.
 * "positive" / "muted"), adjust the two return values. See the change
 * report for caveats.
 */
function activeVariantFor(row: ShareClass): 'success' | 'neutral' {
  return row.is_active ? 'success' : 'neutral';
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .share-class-list-view root div so that its lifetime
    matches the route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="share-class-list-view"
    :data-state="state"
    data-testid="share-class-list-view-root"
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
        data-testid="share-class-list-view-loading"
      />

      <!-- Error -->
      <ErrorState
        v-else-if="state === 'error'"
        :title="labels.errorMessage"
        :action-label="labels.errorRetryLabel"
        data-testid="share-class-list-view-error"
        @action="load"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="share-class-list-view-empty"
      />

      <!-- Ready -->
      <DataTable
        v-else
        :columns="columns"
        :rows="shareClasses"
        :row-key="rowKey"
        data-testid="share-class-list-view-table"
      >
        <!-- Code — the canonical identifier, rendered verbatim. -->
        <template #cell:code="{ row }">
          <code class="share-class-list-view__code">{{ asShareClass(row).code }}</code>
        </template>

        <!-- Name — the backend-resolved locale-aware display name. -->
        <template #cell:name="{ row }">
          {{ asShareClass(row).display_name }}
        </template>

        <!-- Par value — formatted with currency. -->
        <template #cell:par_value="{ row }">
          {{ formatParValue(asShareClass(row).par_value, asShareClass(row).currency) }}
        </template>

        <!-- Flags — chips for founder and default. -->
        <template #cell:flags="{ row }">
          <div
            v-if="hasAnyFlag(asShareClass(row))"
            class="share-class-list-view__flags"
          >
            <StatusBadge
              v-if="asShareClass(row).is_founder"
              status="founder"
              variant="warning"
              :label="labels.flagFounder"
              data-testid="share-class-list-view-flag-founder"
            />
            <StatusBadge
              v-if="asShareClass(row).is_default"
              status="default"
              variant="info"
              :label="labels.flagDefault"
              data-testid="share-class-list-view-flag-default"
            />
          </div>
        </template>

        <!-- Active — status chip. -->
        <template #cell:active="{ row }">
          <StatusBadge
            :status="asShareClass(row).is_active ? 'active' : 'inactive'"
            :variant="activeVariantFor(asShareClass(row))"
            :label="asShareClass(row).is_active ? labels.statusActive : labels.statusInactive"
            data-testid="share-class-list-view-status"
          />
        </template>
      </DataTable>
    </Card>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.share-class-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Code cell
   ---------------------------------------------------------------------------
   Rendered in a monospace font so the identifier reads as a stable code
   rather than a display string.
   ============================================================================ */
.share-class-list-view__code {
  font-family: var(--mases-font-family-mono);
  font-size: var(--mases-font-size-body-sm);
  color: var(--mases-color-text-primary);
}

/* ============================================================================
   Flags cell
   ---------------------------------------------------------------------------
   A horizontal row of chips. If a share class has neither flag, the
   cell is empty (the v-if on the wrapper).
   ============================================================================ */
.share-class-list-view__flags {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--mases-space-2);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .share-class-list-view {
    /* no-op placeholder */
  }
}
</style>