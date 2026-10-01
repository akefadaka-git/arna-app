<!--
=============================================================================
 MASES Phase 2 UI — FileUploader
=============================================================================

 File:      mase_app/src/components/patterns/FileUploader/FileUploader.vue
 Layer:     3 (Patterns)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.10
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — type-check fix:
          · The drop-zone labels computed now produces a full
            FileInputLabels object. FileInput's `labels` prop requires
            four fields (chooseFile, chooseFiles, dropHere, dropZone);
            FileUploaderLabels exposes only two relevant ones (drop,
            browse). The mapping bridges the difference without
            changing FileUploader's public API:
              chooseFile  ← browse
              chooseFiles ← browse
              dropHere    ← drop
              dropZone    ← drop
            Consumers continue to pass `drop` and `browse` exactly as
            before; the translation is internal to this file.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A multi-file upload pattern. Composes the FileInput composite (Unit 9.16)
 for selection, then owns a per-file queue with progress, cancellation,
 retry, and removal.

 The pattern itself issues NO HTTP requests. The consumer supplies an
 `upload` function; the pattern calls it and drives the UI state from the
 returned promise and its progress callback.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   FileInput       (Unit 9.16) — the drop zone and hidden file picker
   BaseButton      (Unit  8.2) — retry / cancel / remove actions
   BaseIcon        (Unit 8.19) — per-item status icon
   BaseProgressBar (Unit 8.23) — per-item upload progress
 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 Consumer contract
 -----------------------------------------------------------------------------
 The consumer supplies:

   upload: (file, { onProgress, signal }) => Promise<UploadedFile>

 `onProgress(percent)` accepts a 0–100 number; the pattern clamps it.
 `signal` is an AbortSignal the pattern aborts when the user cancels.
 The returned promise resolves with an UploadedFile on success, or
 rejects with any error on failure.

 The consumer is expected to wire `upload` to the shared file service
 (which enforces size, type, extension, tenant ownership, and auth on
 the server). Client-side validation in this component is UX only.

 -----------------------------------------------------------------------------
 Drop-zone labels — mapping to FileInputLabels
 -----------------------------------------------------------------------------
 FileInput's default presentation consumes four translated strings
 (chooseFile, chooseFiles, dropHere, dropZone). FileUploaderLabels
 exposes two (drop, browse). Rather than rename FileUploader's public
 label keys — which would cascade into every consumer — this component
 maps the two fields onto FileInput's four at the binding point:

   chooseFile  ← browse   ("Browse" — used when multiple=false)
   chooseFiles ← browse   ("Browse" — used when multiple=true)
   dropHere    ← drop     ("Drop files here" — the visible hint)
   dropZone    ← drop     ("Drop files here" — the region's aria-label)

 Both `chooseFile` and `chooseFiles` receive the same string because
 FileUploader's `browse` label is not pluralized. Consumers that want
 different singular/plural strings should extend FileUploaderLabels
 via a CR.

 The `dropZone` reuse of the `drop` value is intentional: the visible
 hint text ("Drop files here") is also a meaningful region label. A
 future CR that adds a distinct region name would extend
 FileUploaderLabels with a dedicated field.

 See the file header comment in FileInput for the FileInputLabels
 contract.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every label, aria-label, and status string comes from the `labels` prop.
 The only text the component renders from its own state is the filename
 taken from the File object, which the consumer owns.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (flex/grid, gap, min-width,
 overflow-wrap, position, and the pointer-events none on decorative
 elements).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="file-uploader-root"           on the outer <div>
 data-testid="file-uploader-queue"          on the <ul> (rendered only
                                            when the queue is non-empty)
 data-testid="file-uploader-item"           on each <li>
 data-testid="file-uploader-filename"       on the filename <span>
 data-testid="file-uploader-status-icon"    on the per-item BaseIcon
 data-testid="file-uploader-progress"       on the per-item
                                            BaseProgressBar (rendered
                                            only while uploading)
 data-testid="file-uploader-retry"          on the retry BaseButton
                                            (rendered only when the
                                            item is in error state)
 data-testid="file-uploader-cancel"         on the cancel BaseButton
                                            (rendered only while
                                            uploading)
 data-testid="file-uploader-remove"         on the remove BaseButton

 Each <li> carries:
   data-status="pending|uploading|success|error|cancelled"
   data-local-id="<localId>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - The queue is a semantic <ul> of <li> elements.
   - Each item's status is announced via the BaseIcon's aria-label,
     sourced from labels.status*.
   - The progress bar carries its own accessibility from BaseProgressBar
     (aria-label resolved from labels.statusUploading).
   - Every action button carries an explicit aria-label from `labels`,
     because the visible text may be visually truncated in narrow layouts.
   - The remove button is disabled while an upload is in flight; the
     cancel button is offered instead, so the user can abort without
     losing the queue row.
   - No keyboard traps, no forced focus. Full keyboard operation comes
     from the composed FileInput and BaseButton primitives.
   - Reduced motion: the only transition in this file is the
     BaseProgressBar's own; this component contributes none.
   - The status icon's name is visual only; semantic status is exposed
     via the icon's aria-label and the item's data-status attribute.
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
 * The lifecycle status of a single queue item.
 */
export type FileUploaderStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'error'
  | 'cancelled';

/**
 * The value the consumer's `upload` function resolves with on success.
 * Kept minimal — this is the contract between the pattern and the
 * consumer; the server's actual payload may carry more fields, which
 * the consumer may attach here.
 */
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url?: string;
}

/**
 * The context object the pattern passes to the consumer's `upload`
 * function.
 */
export interface UploadContext {
  /**
   * Report progress for the current upload.
   * @param percent a 0–100 number; the pattern clamps to [0, 100].
   */
  onProgress: (percent: number) => void;

  /**
   * An AbortSignal the pattern aborts when the user cancels the item
   * or when the component unmounts. The consumer's upload function
   * should forward this to the underlying request.
   */
  signal: AbortSignal;
}

/**
 * The consumer-supplied upload function.
 */
export type UploadFn = (
  file: File,
  context: UploadContext,
) => Promise<UploadedFile>;

/**
 * A single entry in the uploader's internal queue.
 *
 * Exposed so that the scoped `item` slot can render it.
 */
export interface FileUploaderQueueItem {
  /** Stable local identifier, unique within this component instance. */
  localId: string;

  /** The original File object. */
  file: File;

  /** The current lifecycle status. */
  status: FileUploaderStatus;

  /** The current progress, 0–100. Meaningful while uploading. */
  progress: number;

  /** The error that caused a failure. Present only when status === 'error'. */
  error?: unknown;

  /** The successful upload result. Present only when status === 'success'. */
  uploaded?: UploadedFile;
}

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 *
 * The `drop` and `browse` fields are mapped onto FileInput's four
 * label fields at the binding point; see the file header comment
 * §"Drop-zone labels — mapping to FileInputLabels" for the mapping.
 */
export interface FileUploaderLabels {
  /** Drop zone main line (mapped to FileInput's `dropHere` and `dropZone`). */
  drop: string;

  /** Drop zone browse action (mapped to FileInput's `chooseFile` and `chooseFiles`). */
  browse: string;

  /** aria-label + text for the retry action. */
  retry: string;

  /** aria-label + text for the remove action. */
  remove: string;

  /** aria-label + text for the cancel action. */
  cancel: string;

  /** Status text (aria-label) for a pending item. */
  statusPending: string;

  /** Status text (aria-label) for an uploading item. */
  statusUploading: string;

  /** Status text (aria-label) for a succeeded item. */
  statusSuccess: string;

  /** Status text (aria-label) for a failed item. */
  statusError: string;

  /** Status text (aria-label) for a cancelled item. */
  statusCancelled: string;
}

/**
 * The reason a file was rejected before it entered the queue.
 */
export type FileUploaderRejectReason = 'size' | 'type' | 'count';

/*
 * Module-level counter for localId generation.
 * Deterministic, monotonically increasing, and collision-free within a
 * session. Combined with a Date.now() suffix so that ids are not
 * predictable across component instances.
 */
let __masesFileUploaderIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import FileInput from '../../composites/FileInput';
import type { FileInputLabels } from '../../composites/FileInput';
import BaseButton from '../../primitives/BaseButton';
import BaseIcon from '../../primitives/BaseIcon';
import BaseProgressBar from '../../primitives/BaseProgressBar';
import type { IconName } from '../../primitives/BaseIcon';

interface Props {
  /**
   * The consumer-supplied upload function. Required.
   *
   * The pattern calls this function once per queued file. It must not
   * be re-created on every render by the consumer (a stable reference
   * avoids stale-closure surprises in retries); Pinia actions, module
   * functions, and `useCallback`-style stable refs are all fine.
   */
  upload: UploadFn;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: FileUploaderLabels;

  /**
   * The accepted MIME types or extensions, e.g.
   *   ['.pdf', 'image/*', 'application/json']
   * Passed through to the underlying <input type="file">. Also used
   * for client-side pre-validation.
   */
  accept?: string[];

  /**
   * Whether to allow selecting more than one file at a time.
   * Defaults to true.
   */
  multiple?: boolean;

  /**
   * Maximum size, in bytes, of a single file.
   * Files exceeding this are rejected before entering the queue.
   * Defaults to undefined (no limit).
   */
  maxSizeBytes?: number;

  /**
   * Maximum number of files allowed in the queue at once.
   * Files beyond this are rejected.
   * Defaults to undefined (no limit).
   */
  maxFiles?: number;

  /**
   * Whether the whole pattern is disabled. When true, the drop zone is
   * inert and file selection is blocked. Defaults to false.
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  accept: undefined,
  multiple: true,
  maxSizeBytes: undefined,
  maxFiles: undefined,
  disabled: false,
});

const emit = defineEmits<{
  /** Fires once per file that uploads successfully. */
  (event: 'uploaded', payload: { localId: string; uploaded: UploadedFile }): void;

  /** Fires once per file whose upload rejects. */
  (event: 'failed', payload: { localId: string; error: unknown }): void;

  /** Fires once per queue item the user removes. */
  (event: 'removed', payload: { localId: string }): void;

  /**
   * Fires once, after the last queued item reaches a terminal state,
   * with every successful upload. Does not fire when the queue was
   * emptied by user removal alone.
   */
  (event: 'completed', payload: { uploaded: UploadedFile[] }): void;

  /** Fires for every file rejected by client-side pre-validation. */
  (
    event: 'rejected',
    payload: { file: File; reason: FileUploaderRejectReason },
  ): void;
}>();

defineSlots<{
  /**
   * Per-item override. When supplied, replaces the default row inside
   * each <li>. The <li> wrapper, its data-status attribute, and its
   * :key remain the pattern's responsibility.
   */
  item?(props: { item: FileUploaderQueueItem }): unknown;
}>();

// -----------------------------------------------------------------------------
// Local state
// -----------------------------------------------------------------------------
const items = ref<FileUploaderQueueItem[]>([]);

/*
 * Abort handles live OUTSIDE the reactive array. A Map<string,
 * AbortController> keeps the Proxy tree shallow and avoids the subtle
 * "identity churn" problem of storing non-plain objects in reactive
 * state.
 */
const abortControllers = new Map<string, AbortController>();

// -----------------------------------------------------------------------------
// Computed
// -----------------------------------------------------------------------------
const acceptAttribute = computed<string | undefined>(() => {
  if (props.accept === undefined || props.accept.length === 0) {
    return undefined;
  }
  return props.accept.join(',');
});

const atMaxFiles = computed<boolean>(() => {
  if (props.maxFiles === undefined) return false;
  return items.value.length >= props.maxFiles;
});

const isDisabled = computed<boolean>(
  () => props.disabled || atMaxFiles.value,
);

/*
 * The drop-zone labels FileInput consumes.
 *
 * FileInput's `labels` prop requires a full FileInputLabels object
 * (chooseFile, chooseFiles, dropHere, dropZone). FileUploaderLabels
 * exposes only two relevant fields (drop, browse); this computed
 * bridges the naming difference without changing FileUploader's
 * public contract.
 *
 *   chooseFile  ← browse   (FileInput's singular-mode button text)
 *   chooseFiles ← browse   (FileInput's plural-mode button text;
 *                           FileUploader's `browse` is not pluralized,
 *                           so both modes receive the same string)
 *   dropHere    ← drop     (FileInput's visible drop hint)
 *   dropZone    ← drop     (FileInput's region aria-label; the visible
 *                           hint is also a meaningful region name)
 *
 * See the file header comment §"Drop-zone labels — mapping to
 * FileInputLabels" for the rationale.
 */
const dropZoneLabels = computed<FileInputLabels>(() => ({
  chooseFile: props.labels.browse,
  chooseFiles: props.labels.browse,
  dropHere: props.labels.drop,
  dropZone: props.labels.drop,
}));

// -----------------------------------------------------------------------------
// Local id generation
// -----------------------------------------------------------------------------
function nextLocalId(): string {
  __masesFileUploaderIdCounter += 1;
  return `mases-file-uploader-${__masesFileUploaderIdCounter}-${Date.now()}`;
}

// -----------------------------------------------------------------------------
// Client-side acceptance (UX only — not a security boundary)
// -----------------------------------------------------------------------------
function matchesAccept(file: File, pattern: string): boolean {
  const p = pattern.trim();
  if (p === '' || p === '*') return true;

  if (p.startsWith('.')) {
    return file.name.toLowerCase().endsWith(p.toLowerCase());
  }

  if (p.endsWith('/*')) {
    const prefix = p.slice(0, -1); // 'image/*' -> 'image/'
    return file.type.startsWith(prefix);
  }

  return file.type === p;
}

function isAccepted(file: File): boolean {
  if (props.accept === undefined || props.accept.length === 0) return true;
  return props.accept.some((pattern) => matchesAccept(file, pattern));
}

// -----------------------------------------------------------------------------
// Upload lifecycle
// -----------------------------------------------------------------------------
function startUpload(item: FileUploaderQueueItem): void {
  // Reset any prior attempt's bookkeeping before starting fresh.
  item.status = 'uploading';
  item.progress = 0;
  item.error = undefined;
  item.uploaded = undefined;

  const controller = new AbortController();
  abortControllers.set(item.localId, controller);

  props
    .upload(item.file, {
      onProgress: (percent: number) => {
        if (controller.signal.aborted) return;
        // Clamp defensively: consumer callbacks sometimes overshoot
        // by a frame during teardown.
        const clamped = Math.max(0, Math.min(100, percent));
        item.progress = clamped;
      },
      signal: controller.signal,
    })
    .then((uploaded: UploadedFile) => {
      abortControllers.delete(item.localId);
      // A user cancellation that raced the resolve wins — the item
      // stays cancelled rather than flipping to success.
      if (controller.signal.aborted) {
        item.status = 'cancelled';
        return;
      }
      item.status = 'success';
      item.progress = 100;
      item.uploaded = uploaded;
      emit('uploaded', { localId: item.localId, uploaded });
      maybeEmitCompleted();
    })
    .catch((error: unknown) => {
      abortControllers.delete(item.localId);
      if (controller.signal.aborted) {
        item.status = 'cancelled';
        return;
      }
      item.status = 'error';
      item.error = error;
      emit('failed', { localId: item.localId, error });
      maybeEmitCompleted();
    });
}

function maybeEmitCompleted(): void {
  const allTerminal = items.value.every(
    (it) =>
      it.status === 'success' ||
      it.status === 'error' ||
      it.status === 'cancelled',
  );
  if (!allTerminal) return;

  const uploaded: UploadedFile[] = items.value
    .filter(
      (it): it is FileUploaderQueueItem & { uploaded: UploadedFile } =>
        it.status === 'success' && it.uploaded !== undefined,
    )
    .map((it) => it.uploaded);

  // Only emit when at least one upload actually succeeded. An all-
  // error batch is reported via the per-item `failed` events; an
  // all-cancelled batch via state transitions the consumer can see.
  if (uploaded.length > 0) {
    emit('completed', { uploaded });
  }
}

// -----------------------------------------------------------------------------
// File selection
// -----------------------------------------------------------------------------
function onSelect(files: File[]): void {
  if (props.disabled) return;

  const maxAllowed = props.maxFiles ?? Number.POSITIVE_INFINITY;

  for (const file of files) {
    if (items.value.length >= maxAllowed) {
      emit('rejected', { file, reason: 'count' });
      continue;
    }

    if (
      props.maxSizeBytes !== undefined &&
      file.size > props.maxSizeBytes
    ) {
      emit('rejected', { file, reason: 'size' });
      continue;
    }

    if (!isAccepted(file)) {
      emit('rejected', { file, reason: 'type' });
      continue;
    }

    const item: FileUploaderQueueItem = {
      localId: nextLocalId(),
      file,
      status: 'pending',
      progress: 0,
    };

    items.value.push(item);
    startUpload(item);
  }
}

// -----------------------------------------------------------------------------
// User actions
// -----------------------------------------------------------------------------
function retry(item: FileUploaderQueueItem): void {
  if (item.status !== 'error') return;
  startUpload(item);
}

function cancel(item: FileUploaderQueueItem): void {
  if (item.status !== 'uploading') return;
  const controller = abortControllers.get(item.localId);
  if (controller !== undefined) {
    controller.abort();
    abortControllers.delete(item.localId);
  }
  // The rejection handler will not re-mark the item — we do it here
  // so the state is correct synchronously, before the microtask queue.
  item.status = 'cancelled';
}

function remove(item: FileUploaderQueueItem): void {
  // Removing an in-flight item would orphan its abort handle. The
  // template disables the button during upload; this guard is a
  // defence in depth for programmatic calls.
  if (item.status === 'uploading') return;

  const idx = items.value.findIndex((it) => it.localId === item.localId);
  if (idx < 0) return;

  items.value.splice(idx, 1);
  emit('removed', { localId: item.localId });
}

// -----------------------------------------------------------------------------
// Status → icon/label mapping
// -----------------------------------------------------------------------------
function statusIconName(status: FileUploaderStatus): IconName {
  switch (status) {
    case 'pending':
    case 'uploading':
      return 'loader';
    case 'success':
      return 'check-circle';
    case 'error':
      return 'alert-circle';
    case 'cancelled':
      return 'x-circle';
  }
}

function statusLabel(status: FileUploaderStatus): string {
  switch (status) {
    case 'pending':
      return props.labels.statusPending;
    case 'uploading':
      return props.labels.statusUploading;
    case 'success':
      return props.labels.statusSuccess;
    case 'error':
      return props.labels.statusError;
    case 'cancelled':
      return props.labels.statusCancelled;
  }
}

// -----------------------------------------------------------------------------
// Lifecycle
// -----------------------------------------------------------------------------
onBeforeUnmount(() => {
  /*
   * Abort every in-flight upload. The consumer's upload function
   * should forward the signal to its transport. Not aborting here
   * would leave orphaned requests whose rejection handlers dereference
   * a component that no longer exists.
   */
  for (const controller of abortControllers.values()) {
    controller.abort();
  }
  abortControllers.clear();
});
</script>

<template>
  <div
    class="file-uploader"
    data-testid="file-uploader-root"
  >
    <!-- ==============================================================
         Drop zone (composite)
         ============================================================== -->
    <FileInput
      :accept="acceptAttribute"
      :multiple="multiple"
      :disabled="isDisabled"
      :labels="dropZoneLabels"
      @select="onSelect"
    />

    <!-- ==============================================================
         Queue
         ============================================================== -->
    <ul
      v-if="items.length > 0"
      class="file-uploader__queue"
      data-testid="file-uploader-queue"
    >
      <li
        v-for="item in items"
        :key="item.localId"
        class="file-uploader__item"
        :data-status="item.status"
        :data-local-id="item.localId"
        data-testid="file-uploader-item"
      >
        <!-- Consumer override -->
        <slot
          v-if="$slots.item"
          name="item"
          :item="item"
        />

        <!-- Default row -->
        <template v-else>
          <div class="file-uploader__row">
            <span
              class="file-uploader__filename"
              data-testid="file-uploader-filename"
            >{{ item.file.name }}</span>

            <BaseIcon
              :name="statusIconName(item.status)"
              size="sm"
              :aria-label="statusLabel(item.status)"
              data-testid="file-uploader-status-icon"
            />

            <div class="file-uploader__actions">
              <BaseButton
                v-if="item.status === 'error'"
                variant="ghost"
                size="sm"
                :aria-label="labels.retry"
                data-testid="file-uploader-retry"
                @click="retry(item)"
              >{{ labels.retry }}</BaseButton>

              <BaseButton
                v-if="item.status === 'uploading'"
                variant="ghost"
                size="sm"
                :aria-label="labels.cancel"
                data-testid="file-uploader-cancel"
                @click="cancel(item)"
              >{{ labels.cancel }}</BaseButton>

              <BaseButton
                variant="ghost"
                size="sm"
                :aria-label="labels.remove"
                :disabled="item.status === 'uploading'"
                data-testid="file-uploader-remove"
                @click="remove(item)"
              >{{ labels.remove }}</BaseButton>
            </div>
          </div>

          <BaseProgressBar
            v-if="item.status === 'uploading'"
            :value="item.progress"
            :aria-label="labels.statusUploading"
            data-testid="file-uploader-progress"
          />
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.file-uploader {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  width: 100%;
}

/* ============================================================================
   Queue
   ============================================================================ */
.file-uploader__queue {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
}

.file-uploader__item {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-page);
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.file-uploader__item[data-status='success'] {
  border-color: var(--mases-color-border-success);
  background-color: var(--mases-color-surface-success);
}

.file-uploader__item[data-status='error'] {
  border-color: var(--mases-color-border-danger);
  background-color: var(--mases-color-surface-danger);
}

.file-uploader__item[data-status='cancelled'] {
  border-color: var(--mases-color-border-default);
  background-color: var(--mases-color-surface-sunken);
}

/* ============================================================================
   Row: filename / status / actions
   ============================================================================ */
.file-uploader__row {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  min-width: 0;
}

.file-uploader__filename {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic-safe wrapping. Filenames are the most likely place for a
   * long, unbroken Ethiopic string; overflow-wrap: anywhere ensures
   * the row never forces horizontal page scroll.
   */
  overflow-wrap: anywhere;
}

.file-uploader__actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-1);
  flex-shrink: 0;
}

/* ============================================================================
   Mobile
   ---------------------------------------------------------------------------
   The action row wraps below the filename + icon on narrow screens so
   the filename retains a usable width. The icon stays with the filename
   group; the buttons drop to a second line.
   ============================================================================ */
@media (max-width: 639px) {
  .file-uploader__row {
    flex-wrap: wrap;
  }

  .file-uploader__filename {
    flex-basis: 100%;
  }

  .file-uploader__actions {
    flex-basis: 100%;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .file-uploader__item {
    transition-duration: 1ms;
  }
}
</style>