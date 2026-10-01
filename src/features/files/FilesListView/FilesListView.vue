<!--
=============================================================================
 CHANGE VERIFICATION — CR-WORKSPACE-TITLE · Phase 1 · File 1
=============================================================================

 File:      mase_app/src/features/files/FilesListView.vue  (AMEND)
 Unit:      CR-WORKSPACE-TITLE — Phase 1, File 1
 Delivery type:  Enhancement — document.title via <PageTitle>.
                 One import added, one const added, one template
                 element added. No other change.
 Net lines:      +~35 docblock; +1 import; +3 lines const;
                 +12 lines template element (with leading comment).

 Before (v1.0.2):
   The view set no document.title. The browser tab showed whatever
   the previously-visited route had left, or the entry HTML's
   pre-JS default ("MASES") on a cold load directly at /files.

 After (v1.0.3):
   The view sets document.title via <PageTitle>, bound to the
   existing labels.pageTitle and to import.meta.env.VITE_APP_NAME.

     Workspace build   →  "ሰነዶች — MASES"
     Portal build      →  "ሰነዶች — Maale Arna Portal"
     Empty VITE_APP_NAME →  "ሰነዶች"

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
 MASES Phase 2 UI — FilesListView
=============================================================================

 File:      mase_app/src/features/files/FilesListView/FilesListView.vue
 Layer:     Features (Stage 14 — File Management vertical)
 Version:   1.0.3
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §8.6, §9.14,
              §9.15, §9.19, §9.20, §9.21, §11.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.1, §7.4.1,
              §13.3, §22 STAGE 14
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §23, §71
            CR-WORKSPACE-TITLE Phase 1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 14).
 1.0.1  — API-drift corrections:
          · ErrorState       — message/retry-label/@retry → title/action-label/@action
          · Pagination       — current-page/total-pages/aria-label/prev-label
                               → page/pages/per-page/total-items/ariaLabel/
                                 per-page-label/previous-label (+show-total)
          · DataTable        — TableColumn → DataTableColumn
          · DataTable rowKey — widened to (row: unknown) for variance compat
          · DataTable slots  — added asFile() cast helper
          · DropdownMenu     — MenuItem.id → MenuItem.key
          · ConfirmDeleteDialog — title/message/confirm-label/cancel-label
                               → entity-label/entity-name/confirmation-text/labels
          · ConfirmDeleteDialog — @cancel removed (no such emit); close
                               handled via @update:open
          · Added three label keys for ConfirmDeleteDialog
 1.0.2  — DropdownMenu controlled-open fix:
          · DropdownMenu now requires a controlled `open` prop (v1.0.0 of
            the composite). Added per-row open state so at most one row
            menu is open at a time.
          · Replaced the (never-existing) `#trigger` named slot with the
            component's actual `#default` scoped slot; wired the trigger
            button with triggerId, aria-haspopup, aria-expanded,
            aria-controls, and toggle.

 1.0.3  — CR-WORKSPACE-TITLE Phase 1 File 1. Sets document.title via
          <PageTitle>, bound to the existing labels.pageTitle and to
          import.meta.env.VITE_APP_NAME.

          Prior to this revision, the view set no document.title; the
          browser tab inherited whatever title the previously-visited
          route had left, or the entry HTML's pre-JS default on a cold
          load. This is the first workspace view in the CR's scope.

          The migration is surgical:

            · the existing labels.pageTitle is reused (not duplicated);
            · the existing PageHeader <h1> is unchanged;
            · no new label is added;
            · no existing import, ref, computed, watcher, handler,
              template element, test hook, or scoped style is altered.

          The <PageTitle> element is placed as the first root node,
          preceding the existing .files-list-view div. The template
          becomes a two-node fragment; Vue 3 supports multi-root
          templates natively.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /files page's content. Renders a searchable, filterable, paginated
 list of the current tenant's files, with:
   - an "Upload" primary action (gated by file.upload)
   - a per-row actions menu (view / download / delete)
   - four data states: loading / error / empty / ready

 This file is a CONTENT page. It does NOT compose AppShell — the route
 component (Unit 14.5) does.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The list, its pagination meta, the search term, the status filter, and
 the currently-open row-actions menu are component-local refs. They are
 NOT in a Pinia store. The service (Unit 14.2) is stateless.

 -----------------------------------------------------------------------------
 Permission gating (§7.3.1)
 -----------------------------------------------------------------------------
 The upload button is gated by `file.upload`. The delete action is
 gated by `file.delete`. Both are ADVISORY (§7.4.1) — a user whose
 permissions are role-derived may pass the gate but receive a 403 with
 FILE_ACCESS_DENIED.

 -----------------------------------------------------------------------------
 Delete confirmation — typed-confirmation flow
 -----------------------------------------------------------------------------
 ConfirmDeleteDialog requires:
   - entityLabel, entityName: the dialog interposes these into the
     title and message templates via {entityLabel} / {entityName}
     tokens;
   - labels: a composed object of six translated strings;
   - confirmationText (optional): when supplied, the user must type
     the exact string before the Delete button enables. This unit
     passes the file's original name, so deleting a file requires
     typing its name.

 ConfirmDeleteDialog has no `cancel` emit. Cancel is signalled by
 `update:open(false)` on every close path (Cancel button, Escape,
 backdrop, X). The local `onDeleteDialogClose` handler clears the
 pending target whenever the dialog closes, regardless of path.

 -----------------------------------------------------------------------------
 Row-actions menu — single-open control
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop and
 emits `update:open`. To ensure only one row's menu is open at a time,
 this page tracks the id of the currently-open row (`openRowId`). Each
 row's DropdownMenu reads its open state from that single ref and
 writes back through a shared handler.

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
 Unchanged from v1.0.2:

 data-testid="files-list-view-root"        on the outer <div>
 data-testid="files-list-view-upload"      on the Upload PrimaryButton
 data-testid="files-list-view-search"      on the SearchBar
 data-testid="files-list-view-status"      on the status BaseSelect
 data-testid="files-list-view-table"       on the DataTable
 data-testid="files-list-view-loading"     on the LoadingState
 data-testid="files-list-view-error"       on the ErrorState
 data-testid="files-list-view-empty"       on the EmptyState
 data-testid="files-list-view-pagination"  on the Pagination
 data-testid="files-list-view-upload-modal"        on the Modal
 data-testid="files-list-view-upload-uploader"     on the FileUploader
 data-testid="files-list-view-delete-dialog"       on the
                                                   ConfirmDeleteDialog

 PageTitle contributes no test hook — it renders nothing. A test that
 wants to verify the tab title asserts against `document.title`.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Unchanged from v1.0.2. The added <PageTitle> element renders nothing
 and does not affect the accessibility tree.

   - PageHeader renders the page's <h1>.
   - SearchBar, BaseSelect, Pagination, DataTable, the Modal, and the
     ConfirmDeleteDialog all own their own accessibility contracts.
   - The row-actions trigger button receives its accessible name from
     labels.rowActionsAriaLabel; DropdownMenu supplies aria-haspopup,
     aria-expanded, and aria-controls through the scoped slot.
   - The upload Modal traps focus while open and returns it on close.
   - The ConfirmDeleteDialog's typed-confirmation input carries
     aria-invalid and aria-describedby when the typed value does not
     match.
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
export interface FilesListViewLabels {
  /* PageHeader */
  readonly pageTitle: string;
  readonly pageDescription: string;

  /* Primary action */
  readonly uploadLabel: string;

  /* Search + filter */
  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilterAll: string;
  readonly statusFilterPublished: string;
  readonly statusFilterArchived: string;

  /* Table */
  readonly columnName: string;
  readonly columnType: string;
  readonly columnSize: string;
  readonly columnUploaded: string;
  readonly columnActions: string;

  /* Row actions */
  readonly rowActionsAriaLabel: string;
  readonly actionView: string;
  readonly actionDownload: string;
  readonly actionDelete: string;

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

  /* Upload modal */
  readonly uploadModalTitle: string;
  readonly uploadModalCloseLabel: string;
  readonly uploadDropLabel: string;
  readonly uploadBrowseLabel: string;
  readonly uploadRetryLabel: string;
  readonly uploadRemoveLabel: string;
  readonly uploadCancelLabel: string;
  readonly uploadStatusPending: string;
  readonly uploadStatusUploading: string;
  readonly uploadStatusSuccess: string;
  readonly uploadStatusError: string;
  readonly uploadStatusCancelled: string;

  /* Delete confirmation */
  readonly deleteDialogTitle: string;
  readonly deleteDialogMessage: string;
  readonly deleteConfirmLabel: string;
  readonly deleteCancelLabel: string;
  /*
   * ConfirmDeleteDialog labels. Three additional strings are needed
   * beyond the four above, because the dialog composes six strings
   * into a single labels object (see deleteDialogLabels below).
   */
  readonly deleteDialogEntityLabel: string;
  readonly deleteDialogConfirmationPrompt: string;
  readonly deleteDialogConfirmationMismatch: string;
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import PermissionGate from '@/components/patterns/PermissionGate';
import ConfirmDeleteDialog from '@/components/patterns/ConfirmDeleteDialog';
import type { ConfirmDeleteDialogLabels } from '@/components/patterns/ConfirmDeleteDialog';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import DropdownMenu from '@/components/composites/DropdownMenu';
import Modal from '@/components/composites/Modal';
import SearchBar from '@/components/composites/SearchBar';
import Pagination from '@/components/composites/Pagination';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import BaseSelect from '@/components/primitives/BaseSelect';
import PrimaryButton from '@/components/primitives/PrimaryButton';
import FileUploader from '@/components/patterns/FileUploader';
import PageTitle from '@/layouts/AppShell/PageTitle';

import {
  listFiles,
  removeFile,
  downloadToDisk,
  uploadViaApi,
} from '@/features/files/service';
import type {
  FileResource,
  PaginationMeta,
} from '@/features/files/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: FilesListViewLabels;
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
 * Passed to <PageTitle> as the title's suffix. PageTitle's own
 * guard handles an empty-string suffix by omitting the separator.
 */
const appName: string = import.meta.env.VITE_APP_NAME;

// -----------------------------------------------------------------------------
// List state (local — see the file header comment)
// -----------------------------------------------------------------------------
type ListState = 'loading' | 'error' | 'empty' | 'ready';

const files = ref<readonly FileResource[]>([]);
const meta = ref<PaginationMeta>({});
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);

const search = ref<string>('');
const statusFilter = ref<string>('published');
const currentPage = ref<number>(1);

// -----------------------------------------------------------------------------
// Derived state
// -----------------------------------------------------------------------------
const state = computed<ListState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (files.value.length === 0) return 'empty';
  return 'ready';
});

const totalPages = computed<number>(() => {
  const n = meta.value.last_page;
  return typeof n === 'number' && n > 0 ? n : 1;
});

/*
 * The pagination meta's per_page and total fields. Read defensively:
 * if the API's PaginationMeta does not expose them, the component
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
// Load
// -----------------------------------------------------------------------------
async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;

  try {
    const result = await listFiles({
      page: currentPage.value,
      search: search.value !== '' ? search.value : undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    });
    files.value = result.items;
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

/*
 * When the search term or status filter changes, reset to page 1 and
 * reload (debounced). Page changes load immediately.
 */
watch([search, statusFilter], () => {
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
  { key: 'size', label: props.labels.columnSize, align: 'end' },
  { key: 'uploaded', label: props.labels.columnUploaded, align: 'start' },
  { key: 'actions', label: props.labels.columnActions, align: 'end' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to FileResource.
 */
function rowKey(row: unknown): string {
  return String((row as FileResource).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to FileResource at the point of use. Remove
 * once DataTable accepts a generic row type.
 */
function asFile(row: unknown): FileResource {
  return row as FileResource;
}

// -----------------------------------------------------------------------------
// Per-row presentation helpers
// -----------------------------------------------------------------------------
/*
 * Filesize formatter. Binary units (KiB/MiB/GiB) with one decimal
 * place for values >= 1 unit. Bytes and single-digit KiB render as
 * whole numbers. This is a pure display concern; it does not affect
 * any value sent to the server.
 */
function formatSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kib = bytes / 1024;
  if (kib < 1024) return `${kib.toFixed(0)} KiB`;
  const mib = kib / 1024;
  if (mib < 1024) return `${mib.toFixed(1)} MiB`;
  const gib = mib / 1024;
  return `${gib.toFixed(1)} GiB`;
}

/*
 * The type column shows the extension (uppercased) when available,
 * otherwise a short form of the MIME type. Files without either show
 * an empty string.
 */
function formatType(file: FileResource): string {
  if (file.extension !== undefined && file.extension !== '') {
    return file.extension.toUpperCase();
  }
  if (file.mime_type !== undefined && file.mime_type !== '') {
    const slash = file.mime_type.indexOf('/');
    return slash >= 0 ? file.mime_type.slice(slash + 1).toUpperCase() : file.mime_type;
  }
  return '';
}

/*
 * ISO 8601 → a short, locale-independent display. The design system's
 * localization contract (§9.6) reserves full date formatting for a
 * future i18n layer; until then, a plain YYYY-MM-DD slice is used.
 */
function formatDate(iso: string | undefined): string {
  if (iso === undefined || iso === '') return '';
  const idx = iso.indexOf('T');
  return idx >= 0 ? iso.slice(0, idx) : iso;
}

// -----------------------------------------------------------------------------
// Row actions
// -----------------------------------------------------------------------------
/*
 * The row-actions menu items. Each item's identifier is passed as
 * `key`, matching DropdownMenu's MenuItem contract.
 *
 * The `_file` parameter is currently unused but preserved so that
 * future per-row action gating (e.g. file.delete) can read the row
 * without a signature change at the call site.
 */
function rowActionsFor(_file: FileResource) {
  return [
    { key: 'view', label: props.labels.actionView, icon: 'eye' },
    { key: 'download', label: props.labels.actionDownload, icon: 'download' },
    { key: 'delete', label: props.labels.actionDelete, icon: 'close', variant: 'danger' as const },
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

async function onRowAction(file: FileResource, actionKey: string): Promise<void> {
  if (actionKey === 'view') {
    await router.push(`/files/${file.id}`);
    return;
  }
  if (actionKey === 'download') {
    try {
      await downloadToDisk(file);
    } catch {
      // A failure here is a presentation concern the page delegates to
      // a future toast host. No visible error is surfaced by this unit.
    }
    return;
  }
  if (actionKey === 'delete') {
    pendingDelete.value = file;
    deleteDialogOpen.value = true;
  }
}

// -----------------------------------------------------------------------------
// Delete confirmation
// -----------------------------------------------------------------------------
const pendingDelete = ref<FileResource | null>(null);
const deleteDialogOpen = ref<boolean>(false);

/*
 * The composed labels object ConfirmDeleteDialog expects. Built from
 * the individual strings in FilesListViewLabels.
 *
 * The dialog interpolates three tokens — {entityLabel}, {entityName},
 * {confirmationText} — into the title, message, and prompt strings.
 * The parent's translated strings are expected to include those tokens
 * where appropriate.
 */
const deleteDialogLabels = computed<ConfirmDeleteDialogLabels>(() => ({
  title: props.labels.deleteDialogTitle,
  message: props.labels.deleteDialogMessage,
  confirmLabel: props.labels.deleteConfirmLabel,
  cancelLabel: props.labels.deleteCancelLabel,
  confirmationPrompt: props.labels.deleteDialogConfirmationPrompt,
  confirmationMismatch: props.labels.deleteDialogConfirmationMismatch,
}));

async function onDeleteConfirm(): Promise<void> {
  const target = pendingDelete.value;
  if (target === null) return;

  deleteDialogOpen.value = false;
  pendingDelete.value = null;

  try {
    await removeFile(target.id);
    await load();
  } catch {
    // Failure is a presentation concern (toast / banner); this unit
    // does not surface it directly.
  }
}

/*
 * Handles every close path of the confirm dialog (Cancel button,
 * Escape, backdrop, X) via `update:open`. Clears the pending target so
 * a subsequent open starts fresh.
 *
 * v-model:open writes the boolean to deleteDialogOpen; this handler
 * runs in addition and clears the pending state.
 */
function onDeleteDialogClose(value: boolean): void {
  if (!value) {
    pendingDelete.value = null;
  }
}

// -----------------------------------------------------------------------------
// Upload modal
// -----------------------------------------------------------------------------
const uploadModalOpen = ref<boolean>(false);

function openUploadModal(): void {
  uploadModalOpen.value = true;
}

async function onUploadCompleted(): Promise<void> {
  uploadModalOpen.value = false;
  await load();
}
</script>

<template>
  <!--
    PageTitle renders nothing. It sets document.title during setup
    and restores the previous value on unmount. Placed as a sibling
    to the .files-list-view root div so that its lifetime matches the
    route's lifetime.
  -->
  <PageTitle
    :title="labels.pageTitle"
    :suffix="appName"
  />

  <div
    class="files-list-view"
    :data-state="state"
    data-testid="files-list-view-root"
  >
    <!-- ============================================================
         Page header (title + description + upload action)
         ============================================================ -->
    <PageHeader
      :title="labels.pageTitle"
      :description="labels.pageDescription"
    >
      <PermissionGate permission="file.upload">
        <PrimaryButton
          type="button"
          data-testid="files-list-view-upload"
          @click="openUploadModal"
        >{{ labels.uploadLabel }}</PrimaryButton>
      </PermissionGate>
    </PageHeader>

    <!-- ============================================================
         Search + filter row
         ============================================================ -->
    <div class="files-list-view__controls">
      <SearchBar
        v-model="search"
        :placeholder="labels.searchPlaceholder"
        :aria-label="labels.searchAriaLabel"
        data-testid="files-list-view-search"
      />

      <BaseSelect
        v-model="statusFilter"
        :aria-label="labels.statusFilterLabel"
        :options="[
          { value: 'published', label: labels.statusFilterPublished },
          { value: 'archived', label: labels.statusFilterArchived },
          { value: 'all', label: labels.statusFilterAll },
        ]"
        data-testid="files-list-view-status"
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
        data-testid="files-list-view-loading"
      />

      <!-- Error -->
      <ErrorState
        v-else-if="state === 'error'"
        :title="labels.errorMessage"
        :action-label="labels.errorRetryLabel"
        data-testid="files-list-view-error"
        @action="load"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="files-list-view-empty"
      />

      <!-- Ready -->
      <template v-else>
        <DataTable
          :columns="columns"
          :rows="files"
          :row-key="rowKey"
          data-testid="files-list-view-table"
        >
          <!-- Name -->
          <template #cell:name="{ row }">
            <RouterLink
              class="files-list-view__name-link"
              :to="`/files/${asFile(row).id}`"
            >{{ asFile(row).original_name }}</RouterLink>
          </template>

          <!-- Type -->
          <template #cell:type="{ row }">
            {{ formatType(asFile(row)) }}
          </template>

          <!-- Size -->
          <template #cell:size="{ row }">
            {{ formatSize(asFile(row).size) }}
          </template>

          <!-- Uploaded -->
          <template #cell:uploaded="{ row }">
            {{ formatDate(asFile(row).created_at) }}
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
              :open="isRowMenuOpen(String(asFile(row).id))"
              :items="rowActionsFor(asFile(row))"
              @update:open="
                (v) => onRowMenuOpenChange(String(asFile(row).id), v)
              "
              @select="(key) => onRowAction(asFile(row), key)"
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
                  class="files-list-view__row-actions-trigger"
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
          class="files-list-view__pagination"
          data-testid="files-list-view-pagination"
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

    <!-- ============================================================
         Upload modal
         ============================================================ -->
    <Modal
      v-model:open="uploadModalOpen"
      :title="labels.uploadModalTitle"
      :close-label="labels.uploadModalCloseLabel"
      data-testid="files-list-view-upload-modal"
    >
      <FileUploader
        :upload="uploadViaApi"
        :labels="{
          drop: labels.uploadDropLabel,
          browse: labels.uploadBrowseLabel,
          retry: labels.uploadRetryLabel,
          remove: labels.uploadRemoveLabel,
          cancel: labels.uploadCancelLabel,
          statusPending: labels.uploadStatusPending,
          statusUploading: labels.uploadStatusUploading,
          statusSuccess: labels.uploadStatusSuccess,
          statusError: labels.uploadStatusError,
          statusCancelled: labels.uploadStatusCancelled,
        }"
        data-testid="files-list-view-upload-uploader"
        @completed="onUploadCompleted"
      />
    </Modal>

    <!-- ============================================================
         Delete confirmation
         ============================================================ -->
    <ConfirmDeleteDialog
      v-model:open="deleteDialogOpen"
      :entity-label="labels.deleteDialogEntityLabel"
      :entity-name="pendingDelete?.original_name ?? ''"
      :confirmation-text="pendingDelete?.original_name ?? ''"
      :labels="deleteDialogLabels"
      data-testid="files-list-view-delete-dialog"
      @update:open="onDeleteDialogClose"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.files-list-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Search + filter row
   ---------------------------------------------------------------------------
   Two controls side by side. The SearchBar grows; the BaseSelect stays
   at its natural width. On mobile the row stacks so neither control is
   cramped.
   ============================================================================ */
.files-list-view__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mases-space-3);
}

.files-list-view__controls > :first-child {
  /* SearchBar — grows to fill the remaining space. */
  flex: 1 1 auto;
  min-width: 0;
}

.files-list-view__controls > :last-child {
  /* BaseSelect — fixed width on desktop. */
  flex: 0 0 auto;
}

/* ============================================================================
   Row name link
   ============================================================================ */
.files-list-view__name-link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
}

.files-list-view__name-link:hover {
  text-decoration: underline;
}

.files-list-view__name-link:focus-visible {
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
.files-list-view__row-actions-trigger {
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

.files-list-view__row-actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.files-list-view__row-actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Pagination wrapper
   ============================================================================ */
.files-list-view__pagination {
  display: flex;
  justify-content: center;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Mobile (<640px)
   ============================================================================ */
@media (max-width: 639px) {
  .files-list-view__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .files-list-view__controls > :last-child {
    /* Full width on mobile so the select is a comfortable tap target. */
    width: 100%;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .files-list-view {
    /* no-op placeholder */
  }
}
</style>