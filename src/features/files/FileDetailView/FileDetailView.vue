<!--
=============================================================================
 MASES Phase 2 UI — FileDetailView
=============================================================================

 File:      mase_app/src/features/files/FileDetailView/FileDetailView.vue
 Layer:     Features (Stage 14 — File Management vertical)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.3,
              §11.8, §16.3, §16.4, §16.7
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.1, §7.4.1,
              §11.5, §13.3, §22 STAGE 14

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 14).
 1.0.1  — API-drift corrections:
          · ErrorState       — message/retry-label/@retry → title/action-label/@action
          · StatusBadge      — added required `status` prop; remapped
                               variant "pending" → "neutral"/"success"
          · Metadata section — DetailCard replaced with Card + custom header
                               (DetailCard's required `fields` prop is
                               incompatible with the inline StatusBadge)
          · DropdownMenu     — MenuItem.id → MenuItem.key
          · DropdownMenu     — controlled `open` prop; v-model:open added;
                               #trigger → #default scoped slot wired with
                               triggerId/aria-haspopup/aria-expanded/
                               aria-controls/toggle
          · ConfirmDeleteDialog (×2) — title/message/confirm-label/
                               cancel-label → entity-label/entity-name/
                               confirmation-text/labels; @cancel removed
                               (no such emit); @update:open added
          · Added six label keys for the two ConfirmDeleteDialog instances

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /files/:id page's content. Renders:
   - the file's metadata (name, size, type, uploader, dates)
   - a safe inline preview (image / PDF / text / fallback) via
     FilePreview (Unit 10.11)
   - a download action via DownloadButton (Unit 10.12)
   - the file's version history
   - delete actions (soft delete + force delete, each gated)

 Content page. The route component (Unit 14.5) wraps it in AppShell.

 -----------------------------------------------------------------------------
 The preview src problem — see the response preamble
 -----------------------------------------------------------------------------
 FilePreview needs an `src` URL the browser can load directly. The
 download endpoint is authenticated; a browser <img> cannot attach
 a bearer token. This page fetches the blob via the authenticated
 client, creates an object URL, and passes that to FilePreview. The
 object URL is revoked on unmount.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The file, its versions, the loading/error states, the header menu's
 open state, and the two dialog open flags are local refs. No store.

 -----------------------------------------------------------------------------
 Permission gating
 -----------------------------------------------------------------------------
 - Download is not permission-gated at the UI level — a user who can
   see the file can download it (the backend still checks
   file.download on the actual request). A user with file.view alone
   will see the metadata but receive a 403 on download — the
   DownloadButton surfaces the error via its `failed` event.
 - Delete (soft) is gated on file.delete.
 - Force delete is gated on file.force_delete (per §7.3.1) — see
   Unit 14.1's docblock for the backend's defect: FileService::
   forceDelete() checks file.delete, not file.force_delete, so a user
   who holds the former but not the latter passes the UI gate and
   receives a 403.

 -----------------------------------------------------------------------------
 Metadata block — plain Card, not DetailCard
 -----------------------------------------------------------------------------
 The metadata block is rendered as a plain Card with a custom header
 and an inline <dl>. DetailCard was rejected here for the same reason
 as in ShareholderDetailView: DetailCard's required `fields:
 readonly MetaListItem[]` prop is incompatible with the metadata
 block's status badge (MetaList renders values as text and does not
 forward a value slot, so a StatusBadge cannot be rendered through
 DetailCard).

 -----------------------------------------------------------------------------
 Delete confirmation — typed-confirmation flow
 -----------------------------------------------------------------------------
 ConfirmDeleteDialog requires:
   - entityLabel, entityName: the dialog interposes these into the
     title and message templates via {entityLabel} / {entityName}
     tokens;
   - labels: a composed object of six translated strings;
   - confirmationText (optional): when supplied, the user must type
     the exact string before the Delete button enables. Both dialogs
     pass the file's original name.

 ConfirmDeleteDialog has no `cancel` emit. Cancel is signalled by
 `update:open(false)` on every close path (Cancel button, Escape,
 backdrop, X). The onDeleteDialogClose / onForceDialogClose handlers
 are bound to @update:open for completeness but perform no additional
 cleanup — the dialogs own their state.

 -----------------------------------------------------------------------------
 Header actions menu — single-instance controlled state
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop and
 emits `update:open`. This is a single-instance menu (one per page), so
 it is bound with `v-model:open` to a plain boolean ref.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The component
 fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding, min-width, min-height,
 position, list-style, text-decoration, border-block-start width).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="file-detail-view-root"        on the outer <div>
 data-testid="file-detail-view-loading"     on the LoadingState
 data-testid="file-detail-view-error"       on the ErrorState
 data-testid="file-detail-view-preview"     on the FilePreview
                                            wrapper
 data-testid="file-detail-view-metadata"    on the metadata Card
 data-testid="file-detail-view-status"      on the StatusBadge
 data-testid="file-detail-view-download"    on the DownloadButton
 data-testid="file-detail-view-actions"     on the actions DropdownMenu
                                            trigger button
 data-testid="file-detail-view-versions"    on the versions Card
 data-testid="file-detail-view-versions-list" on the versions <ul>
 data-testid="file-detail-view-version"     on each version <li>
 data-testid="file-detail-view-empty"       on the EmptyState
                                            (404 case)
 data-testid="file-detail-view-delete-dialog"        on the
                                                     ConfirmDeleteDialog
                                            (soft delete)
 data-testid="file-detail-view-force-dialog"         on the second
                                                     ConfirmDeleteDialog
                                            (force delete)

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - PageHeader renders the h1.
   - FilePreview, DownloadButton, Card, StatusBadge, and the dialogs
     own their own accessibility contracts.
   - The version history is a <ul> of <li> elements.
   - The preview blob URL is revoked on unmount; no leaks.
   - The actions trigger button receives its accessible name from
     labels.actionsTriggerLabel; DropdownMenu supplies aria-haspopup,
     aria-expanded, and aria-controls through the scoped slot.
   - The ConfirmDeleteDialog's typed-confirmation inputs carry
     aria-invalid and aria-describedby when the typed value does not
     match.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
import { formatCalendarDate } from '@/core/dates/calendar';
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
export interface FileDetailViewLabels {
  /* PageHeader (title is the file name, filled by the page) */
  readonly pageDescription: string;

  /* Loading / error / empty */
  readonly loadingMessage: string;
  readonly errorMessage: string;
  readonly errorRetryLabel: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;

  /* Metadata card */
  readonly metadataTitle: string;
  readonly metadataName: string;
  readonly metadataType: string;
  readonly metadataSize: string;
  readonly metadataUploaded: string;
  readonly metadataUpdated: string;
  readonly metadataStatus: string;

  /* Status labels */
  readonly statusPublished: string;
  readonly statusArchived: string;
  readonly statusDeleted: string;

  /* Preview */
  readonly previewTitle: string;
  readonly previewLoading: string;
  readonly previewError: string;
  readonly previewUnsupported: string;
  readonly previewPdfFallback: string;

  /* Actions */
  readonly downloadLabel: string;
  readonly downloadSuccessLabel: string;
  readonly downloadErrorLabel: string;
  readonly downloadRetryLabel: string;
  readonly actionsTriggerLabel: string;
  readonly actionDelete: string;
  readonly actionForceDelete: string;

  /* Version history */
  readonly versionsTitle: string;
  readonly versionsEmptyMessage: string;
  readonly versionLabel: string;
  readonly versionCurrentLabel: string;

  /* Delete dialog (soft) */
  readonly deleteDialogTitle: string;
  readonly deleteDialogMessage: string;
  readonly deleteConfirmLabel: string;
  readonly deleteCancelLabel: string;
  /*
   * ConfirmDeleteDialog (soft) requires three additional strings
   * beyond the four above: the entity label and the two
   * typed-confirmation strings.
   */
  readonly deleteDialogEntityLabel: string;
  readonly deleteDialogConfirmationPrompt: string;
  readonly deleteDialogConfirmationMismatch: string;

  /* Force delete dialog */
  readonly forceDialogTitle: string;
  readonly forceDialogMessage: string;
  readonly forceConfirmLabel: string;
  readonly forceCancelLabel: string;
  /*
   * ConfirmDeleteDialog (force) requires three additional strings
   * beyond the four above.
   */
  readonly forceDialogEntityLabel: string;
  readonly forceDialogConfirmationPrompt: string;
  readonly forceDialogConfirmationMismatch: string;
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import StatusBadge from '@/components/patterns/StatusBadge';
import PermissionGate from '@/components/patterns/PermissionGate';
import ConfirmDeleteDialog from '@/components/patterns/ConfirmDeleteDialog';
import type { ConfirmDeleteDialogLabels } from '@/components/patterns/ConfirmDeleteDialog';
import FilePreview from '@/components/patterns/FilePreview';
import DownloadButton from '@/components/patterns/DownloadButton';
import DropdownMenu from '@/components/composites/DropdownMenu';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import {
  getFile,
  listVersions,
  removeFile,
  forceRemoveFile,
  downloadToDisk,
} from '@/features/files/service';
import { downloadFile as downloadBlob } from '@/features/files/api';
import type { FileResource } from '@/features/files/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: FileDetailViewLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user deletes (soft or force) the file and the
   * operation succeeds. The consumer (the route component) decides
   * where to navigate — typically back to /files.
   */
  (event: 'deleted'): void;
}>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
/*
 * The :id segment is a required path parameter. Vue Router will not
 * match /files without it, so routeId is only '' in pathological
 * cases. A parse failure produces a 404-style presentation via the
 * existing error path.
 */
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

const file = ref<FileResource | null>(null);
const versions = ref<readonly FileResource[]>([]);
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);

const state = computed<ViewState>(() => {
  if (isLoading.value) return 'loading';
  if (loadError.value !== null) return 'error';
  if (file.value === null) return 'empty';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
async function load(): Promise<void> {
  if (routeId.value === null) {
    /*
     * Without a valid id, we cannot fetch. Present the empty state
     * (which the labels describe as "the file could not be found").
     */
    file.value = null;
    versions.value = [];
    loadError.value = null;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;

  try {
    const [resource, history] = await Promise.all([
      getFile(routeId.value),
      listVersions(routeId.value),
    ]);
    file.value = resource;
    versions.value = history;
  } catch (err) {
    loadError.value = err;
    file.value = null;
    versions.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Preview blob URL
// -----------------------------------------------------------------------------
/*
 * See the response preamble §"The FilePreview src problem".
 *
 * A blob URL is created once per file and revoked on unmount or when
 * the file id changes. The preview is only fetched when the file's
 * MIME type is previewable — for non-previewable types (e.g. a .zip),
 * the blob is not fetched and FilePreview renders its unsupported
 * fallback.
 */
const previewBlobUrl = ref<string | null>(null);

function revokePreviewBlobUrl(): void {
  if (previewBlobUrl.value !== null) {
    URL.revokeObjectURL(previewBlobUrl.value);
    previewBlobUrl.value = null;
  }
}

function isPreviewable(resource: FileResource): boolean {
  const mime = resource.mime_type ?? '';
  if (mime.startsWith('image/')) return true;
  if (mime === 'application/pdf') return true;
  if (mime.startsWith('text/')) return true;
  return false;
}

async function loadPreviewBlob(): Promise<void> {
  revokePreviewBlobUrl();
  const resource = file.value;
  if (resource === null) return;
  if (!isPreviewable(resource)) return;

  try {
    const blob = await downloadBlob(resource.id);
    /*
     * A race: if the file changed (route param) between the fetch and
     * the URL creation, revoke immediately and skip.
     */
    if (file.value?.id !== resource.id) {
      return;
    }
    previewBlobUrl.value = URL.createObjectURL(blob);
  } catch {
    /*
     * Preview failure is not a page failure. FilePreview will render
     * its own error fallback when src is empty. The user can still
     * download the file via the DownloadButton.
     */
  }
}

watch(file, () => {
  void loadPreviewBlob();
});

onBeforeUnmount(() => {
  revokePreviewBlobUrl();
});

// -----------------------------------------------------------------------------
// Presentation helpers (same as FilesListView)
// -----------------------------------------------------------------------------
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

function formatDate(iso: string | undefined): string {
  return formatCalendarDate(iso, { dateStyle: 'medium' });
}

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

// -----------------------------------------------------------------------------
// Status badge mapping
// -----------------------------------------------------------------------------
/*
 * Maps the file's lifecycle status to a valid BadgeVariant token.
 *
 * The BadgeVariant union is:
 *   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'
 *
 *   published  →  success   (standard positive-status palette)
 *   archived   →  neutral   (de-emphasized; the file is stored but
 *                            not the active version)
 *   (fallback) →  neutral
 */
function statusVariant(status: string | undefined): 'success' | 'neutral' {
  if (status === 'published') return 'success';
  return 'neutral';
}

function statusLabel(status: string | undefined): string {
  if (status === 'published') return props.labels.statusPublished;
  if (status === 'archived') return props.labels.statusArchived;
  return props.labels.statusDeleted;
}

// -----------------------------------------------------------------------------
// Download
// -----------------------------------------------------------------------------
async function onDownload(): Promise<void> {
  const resource = file.value;
  if (resource === null) return;
  await downloadToDisk(resource);
}

// -----------------------------------------------------------------------------
// FilePreview labels
// -----------------------------------------------------------------------------
const previewLabels = computed(() => ({
  loading: props.labels.previewLoading,
  error: props.labels.previewError,
  unsupported: props.labels.previewUnsupported,
  pdfFallback: props.labels.previewPdfFallback,
}));

// -----------------------------------------------------------------------------
// Download button labels
// -----------------------------------------------------------------------------
const downloadLabels = computed(() => ({
  download: props.labels.downloadLabel,
  downloading: props.labels.previewLoading,
  success: props.labels.downloadSuccessLabel,
  retry: props.labels.downloadRetryLabel,
}));

// -----------------------------------------------------------------------------
// Header actions menu (single-instance controlled state)
// -----------------------------------------------------------------------------
/*
 * DropdownMenu is a controlled component: it requires an `open` prop
 * and emits `update:open`. This is a single-instance menu, so it is
 * bound with `v-model:open` to a plain boolean ref.
 */
const actionsOpen = ref<boolean>(false);

/*
 * The actions menu items. Each item's identifier is passed as `key`,
 * matching DropdownMenu's MenuItem contract.
 */
function actionsFor() {
  return [
    {
      key: 'delete',
      label: props.labels.actionDelete,
      icon: 'close',
      variant: 'danger' as const,
    },
    {
      key: 'force-delete',
      label: props.labels.actionForceDelete,
      icon: 'close',
      variant: 'danger' as const,
    },
  ];
}

const deleteDialogOpen = ref<boolean>(false);
const forceDialogOpen = ref<boolean>(false);

function onActionSelect(actionKey: string): void {
  if (actionKey === 'delete') {
    deleteDialogOpen.value = true;
  } else if (actionKey === 'force-delete') {
    forceDialogOpen.value = true;
  }
}

// -----------------------------------------------------------------------------
// Delete (soft) — ConfirmDeleteDialog
// -----------------------------------------------------------------------------
const deleteDialogLabels = computed<ConfirmDeleteDialogLabels>(() => ({
  title: props.labels.deleteDialogTitle,
  message: props.labels.deleteDialogMessage,
  confirmLabel: props.labels.deleteConfirmLabel,
  cancelLabel: props.labels.deleteCancelLabel,
  confirmationPrompt: props.labels.deleteDialogConfirmationPrompt,
  confirmationMismatch: props.labels.deleteDialogConfirmationMismatch,
}));

async function onDeleteConfirm(): Promise<void> {
  const resource = file.value;
  if (resource === null) return;
  deleteDialogOpen.value = false;
  try {
    await removeFile(resource.id);
    emit('deleted');
    await router.push('/files');
  } catch {
    /*
     * Failure is surfaced by the composed dialog's error handling or
     * by a future toast host. This unit does not duplicate that.
     */
  }
}

/*
 * Handles every close path of the soft-delete dialog (Cancel button,
 * Escape, backdrop, X) via `update:open`. No cleanup is required —
 * the dialog owns its own state.
 */
function onDeleteDialogClose(_value: boolean): void {
  // No pending state to clear; the confirm handler already handles
  // its own cleanup.
}

// -----------------------------------------------------------------------------
// Force delete — ConfirmDeleteDialog
// -----------------------------------------------------------------------------
const forceDialogLabels = computed<ConfirmDeleteDialogLabels>(() => ({
  title: props.labels.forceDialogTitle,
  message: props.labels.forceDialogMessage,
  confirmLabel: props.labels.forceConfirmLabel,
  cancelLabel: props.labels.forceCancelLabel,
  confirmationPrompt: props.labels.forceDialogConfirmationPrompt,
  confirmationMismatch: props.labels.forceDialogConfirmationMismatch,
}));

async function onForceConfirm(): Promise<void> {
  const resource = file.value;
  if (resource === null) return;
  forceDialogOpen.value = false;
  try {
    await forceRemoveFile(resource.id);
    emit('deleted');
    await router.push('/files');
  } catch {
    /* see onDeleteConfirm */
  }
}

/*
 * Handles every close path of the force-delete dialog.
 */
function onForceDialogClose(_value: boolean): void {
  // No pending state to clear.
}

// -----------------------------------------------------------------------------
// Page title
// -----------------------------------------------------------------------------
const pageTitle = computed<string>(
  () => file.value?.original_name ?? '',
);
</script>

<template>
  <div
    class="file-detail-view"
    :data-state="state"
    data-testid="file-detail-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="file-detail-view-loading"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="file-detail-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (file not found)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.emptyTitle"
      :description="labels.emptyDescription"
      data-testid="file-detail-view-empty"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="file !== null">
      <!-- PageHeader with actions -->
      <PageHeader
        :title="pageTitle"
        :description="labels.pageDescription"
      >
        <div class="file-detail-view__header-actions">
          <DownloadButton
            :download="onDownload"
            :labels="downloadLabels"
            variant="primary"
            data-testid="file-detail-view-download"
          />

          <!--
            Header actions menu.

            DropdownMenu is controlled: `v-model:open` binds both the
            `open` prop and the `update:open` emit to `actionsOpen`.
            This is a single-instance menu, so no per-row state
            coordination is needed.

            The trigger element is supplied via the `#default` scoped
            slot. The slot exposes the trigger's id, its ARIA
            attributes, and the toggle function; the button binds them
            all so the menu's aria-labelledby resolves, the
            aria-expanded state reflects `open`, and clicks toggle the
            menu.
          -->
          <DropdownMenu
            v-model:open="actionsOpen"
            :items="actionsFor()"
            @select="onActionSelect"
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
                class="file-detail-view__actions-trigger"
                :aria-haspopup="ariaHaspopup"
                :aria-expanded="ariaExpanded"
                :aria-controls="ariaControls"
                :aria-label="labels.actionsTriggerLabel"
                data-testid="file-detail-view-actions"
                @click="toggle"
              >
                ⋯
              </button>
            </template>
          </DropdownMenu>
        </div>
      </PageHeader>

      <!-- Two-column layout: preview + metadata -->
      <div class="file-detail-view__grid">
        <!-- Preview column -->
        <div
          class="file-detail-view__preview"
          data-testid="file-detail-view-preview"
        >
          <FilePreview
            v-if="previewBlobUrl !== null"
            :src="previewBlobUrl"
            :name="file.original_name"
            :mime-type="file.mime_type"
            :alt="file.original_name"
            size="lg"
            :labels="previewLabels"
          />
          <!-- Fallback when no blob is available (non-previewable type,
               or the preview fetch failed). FilePreview's `unsupported`
               overlay is not rendered because there is no src to pass;
               a plain message is shown instead. -->
          <div
            v-else
            class="file-detail-view__preview-fallback"
            role="status"
          >
            <p class="file-detail-view__preview-fallback-text">
              {{ labels.previewUnsupported }}
            </p>
          </div>
        </div>

        <!-- Metadata column -->
        <Card data-testid="file-detail-view-metadata">
          <template #header>
            <h2 class="file-detail-view__section-title">
              {{ labels.metadataTitle }}
            </h2>
          </template>

          <dl class="file-detail-view__metadata-list">
            <div class="file-detail-view__metadata-row">
              <dt>{{ labels.metadataName }}</dt>
              <dd>{{ file.original_name }}</dd>
            </div>
            <div class="file-detail-view__metadata-row">
              <dt>{{ labels.metadataType }}</dt>
              <dd>{{ formatType(file) }}</dd>
            </div>
            <div class="file-detail-view__metadata-row">
              <dt>{{ labels.metadataSize }}</dt>
              <dd>{{ formatSize(file.size) }}</dd>
            </div>
            <div class="file-detail-view__metadata-row">
              <dt>{{ labels.metadataUploaded }}</dt>
              <dd>{{ formatDate(file.created_at) }}</dd>
            </div>
            <div class="file-detail-view__metadata-row">
              <dt>{{ labels.metadataUpdated }}</dt>
              <dd>{{ formatDate(file.updated_at) }}</dd>
            </div>
            <div class="file-detail-view__metadata-row">
              <dt>{{ labels.metadataStatus }}</dt>
              <dd>
                <StatusBadge
                  :status="file.status ?? ''"
                  :variant="statusVariant(file.status)"
                  :label="statusLabel(file.status)"
                  data-testid="file-detail-view-status"
                />
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <!-- Version history -->
      <Card data-testid="file-detail-view-versions">
        <template #header>
          <h2 class="file-detail-view__section-title">
            {{ labels.versionsTitle }}
          </h2>
        </template>

        <ul
          v-if="versions.length > 0"
          class="file-detail-view__versions"
          data-testid="file-detail-view-versions-list"
        >
          <li
            v-for="version in versions"
            :key="version.id"
            class="file-detail-view__version"
            data-testid="file-detail-view-version"
          >
            <span class="file-detail-view__version-label">
              {{ labels.versionLabel }} {{ version.version ?? 1 }}
            </span>
            <span
              v-if="file !== null && version.id === file.id"
              class="file-detail-view__version-current"
            >
              {{ labels.versionCurrentLabel }}
            </span>
            <span class="file-detail-view__version-date">
              {{ formatDate(version.created_at) }}
            </span>
          </li>
        </ul>

        <p
          v-else
          class="file-detail-view__versions-empty"
        >{{ labels.versionsEmptyMessage }}</p>
      </Card>
    </template>

    <!-- ============================================================
         Delete (soft) confirmation
         ============================================================ -->
    <PermissionGate permission="file.delete">
      <ConfirmDeleteDialog
        v-model:open="deleteDialogOpen"
        :entity-label="labels.deleteDialogEntityLabel"
        :entity-name="file?.original_name ?? ''"
        :confirmation-text="file?.original_name ?? ''"
        :labels="deleteDialogLabels"
        data-testid="file-detail-view-delete-dialog"
        @update:open="onDeleteDialogClose"
        @confirm="onDeleteConfirm"
      />
    </PermissionGate>

    <!-- ============================================================
         Force-delete confirmation
         ============================================================ -->
    <PermissionGate permission="file.force_delete">
      <ConfirmDeleteDialog
        v-model:open="forceDialogOpen"
        :entity-label="labels.forceDialogEntityLabel"
        :entity-name="file?.original_name ?? ''"
        :confirmation-text="file?.original_name ?? ''"
        :labels="forceDialogLabels"
        data-testid="file-detail-view-force-dialog"
        @update:open="onForceDialogClose"
        @confirm="onForceConfirm"
      />
    </PermissionGate>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.file-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Header actions
   ============================================================================ */
.file-detail-view__header-actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
}

/* ============================================================================
   Actions trigger
   ---------------------------------------------------------------------------
   A minimal button containing the ellipsis glyph. DropdownMenu owns the
   open/close logic and the menu; this button is the trigger it wires
   with the id, aria-haspopup, aria-expanded, aria-controls, and toggle
   callback exposed by the scoped slot.
   ============================================================================ */
.file-detail-view__actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mases-space-8);
  height: var(--mases-space-8);
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

.file-detail-view__actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.file-detail-view__actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Two-column grid (preview + metadata)
   ---------------------------------------------------------------------------
   Desktop: preview (2fr) and metadata (1fr) side by side.
   Mobile: stacked.
   ============================================================================ */
.file-detail-view__grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--mases-space-4);
  align-items: start;
}

/* ============================================================================
   Preview column
   ============================================================================ */
.file-detail-view__preview {
  min-width: 0;
}

.file-detail-view__preview-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--mases-space-6);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-sunken);
  color: var(--mases-color-text-secondary);
}

.file-detail-view__preview-fallback-text {
  margin: 0;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Metadata list
   ---------------------------------------------------------------------------
   A two-column definition list. <dt> on the left, <dd> on the right.
   ============================================================================ */
.file-detail-view__metadata-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.file-detail-view__metadata-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--mases-space-3);
  align-items: baseline;
}

.file-detail-view__metadata-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.file-detail-view__metadata-row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Version history
   ============================================================================ */
.file-detail-view__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.file-detail-view__versions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.file-detail-view__version {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  padding-block: var(--mases-space-2);
  border-block-end: 1px solid var(--mases-color-border-subtle);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

.file-detail-view__version:last-child {
  border-block-end: 0;
}

.file-detail-view__version-label {
  font-weight: var(--mases-font-weight-medium);
  color: var(--mases-color-text-primary);
}

.file-detail-view__version-current {
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-2);
  border-radius: var(--mases-radius-sm);
  background-color: var(--mases-color-surface-accent);
  color: var(--mases-color-text-accent);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
}

.file-detail-view__version-date {
  margin-inline-start: auto;
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
}

.file-detail-view__versions-empty {
  margin: 0;
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Mobile (<768px)
   ---------------------------------------------------------------------------
   The two-column grid stacks. The metadata row collapses to a single
   column with the label above the value, which is the correct
   presentation at narrow widths.
   ============================================================================ */
@media (max-width: 767px) {
  .file-detail-view__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .file-detail-view__metadata-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .file-detail-view {
    /* no-op placeholder */
  }
}
</style>