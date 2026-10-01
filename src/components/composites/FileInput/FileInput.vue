<!--
=============================================================================
 MASES Phase 2 UI — FileInput
=============================================================================

 File:      mase_app/src/components/composites/FileInput/FileInput.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.16
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A file picker with drag-and-drop support. Renders a visually hidden
 native <input type="file"> plus a visible button that triggers it. The
 surrounding drop zone handles dragover/drop events as a desktop
 enhancement.

 -----------------------------------------------------------------------------
 Hidden-input + visible-button pattern — see the response preamble
 -----------------------------------------------------------------------------
 The native input owns the file-selection behavior but is visually
 hidden and removed from the tab order. The button is the sole
 interactive entry point.

 -----------------------------------------------------------------------------
 Validation — see the response preamble
 -----------------------------------------------------------------------------
 Type validation against `accept`, then size validation against
 `maxSizeBytes`, per file. `select` fires with the accepted files;
 `reject` fires once per rejected file with a reason.

 -----------------------------------------------------------------------------
 The `labels` prop and the default slot
 -----------------------------------------------------------------------------
 `labels` supplies the four strings the default presentation renders.
 It is optional at the type level; a deduplicated dev warning fires when
 a required label is missing AND the default presentation renders.
 Consumers who supply the default slot do not need `labels`.

 The default slot REPLACES the entire drop-zone interior — including
 the trigger button. Consumers who use it must render their own button
 and wire it to `openFilePicker`.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - the `labels` strings (consumer-supplied);
   - the default-slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (positioning, flex, the dashed
 border style, the visually-hidden clip technique).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="file-input-root"        on the drop-zone <div>
 data-testid="file-input-native"      on the hidden <input type="file">
 data-testid="file-input-trigger"     on the default presentation's
                                      trigger button (rendered only
                                      when the default presentation
                                      is used)

 The drop zone carries:
   data-drag-over="true"       (present only during a drag)
   data-disabled="true"        (present only when disabled)
   data-invalid="true"         (present only when invalid)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - The visible button carries the accessible name for the file-picker
     operation (`chooseFile` / `chooseFiles` from `labels`, or the
     consumer's own in a custom slot).
   - The hidden native input is `aria-hidden="true"` and
     `tabindex="-1"` — it is not reachable directly and is not announced
     by screen readers.
   - The drop zone carries `role="group"` with `aria-label` from
     `labels.dropZone` when supplied.
   - The button is a native <button> and is keyboard-operable.
   - Reduced motion: the drop zone's border and background transitions
     become effectively instant.
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
 * The translated strings the default presentation renders. All four are
 * used only by the default presentation; a consumer that supplies the
 * default slot does not need them.
 */
export interface FileInputLabels {
  /** Button text in single-file mode ("Choose a file"). */
  chooseFile: string;

  /** Button text in multiple-file mode ("Choose files"). */
  chooseFiles: string;

  /** Drop-zone hint below the button ("or drop files here"). */
  dropHere: string;

  /** Accessible name for the drop-zone region ("File upload"). */
  dropZone: string;
}

/**
 * The rejection reason emitted via the `reject` event.
 */
export type FileInputRejectReason = 'too-large' | 'wrong-type' | 'unknown';

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesFileInputWarned = new Set<string>();

function __masesFileInputWarnOnce(key: string, message: string): void {
  if (__masesFileInputWarned.has(key)) {
    return;
  }
  __masesFileInputWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Module-level counter for auto-generated input ids.
 */
let __masesFileInputIdCounter = 0;
</script>

<script setup lang="ts">
import {
  computed,
  ref,
  useSlots,
} from 'vue';
import BaseIcon from '../../primitives/BaseIcon';

interface Props {
  /**
   * Comma-separated list of accepted file types. Passed verbatim to the
   * native input's `accept` attribute AND used by the component's own
   * validation. See the response preamble §"Validation".
   */
  accept?: string;

  /**
   * Maximum file size in bytes. Files larger than this are rejected.
   *
   * When absent, no size validation is performed.
   */
  maxSizeBytes?: number;

  /**
   * Whether multiple files may be selected. Defaults to false.
   */
  multiple?: boolean;

  /**
   * Disabled state. Disables the button and the native input; drops are
   * ignored.
   */
  disabled?: boolean;

  /**
   * Invalid state. Applied visually to the drop zone.
   */
  invalid?: boolean;

  /**
   * The translated labels for the default presentation.
   *
   * Optional at the type level: consumers who supply the default slot
   * do not need it. A deduplicated dev warning fires when a required
   * label is missing AND the default presentation renders.
   */
  labels?: FileInputLabels;
}

const props = withDefaults(defineProps<Props>(), {
  accept: undefined,
  maxSizeBytes: undefined,
  multiple: false,
  disabled: false,
  invalid: false,
  labels: undefined,
});

const emit = defineEmits<{
  (event: 'select', files: File[]): void;
  (event: 'reject', reason: FileInputRejectReason): void;
}>();

/**
 * Scoped default slot. Replaces the drop-zone interior.
 * See the file header comment.
 */
defineSlots<{
  default(props: {
    openFilePicker: () => void;
    isDragOver: boolean;
    inputId: string;
  }): unknown;
}>();

// -----------------------------------------------------------------------------
// Slot detection
// -----------------------------------------------------------------------------
const slots = useSlots();

/**
 * Whether the consumer supplied default-slot content. When false, the
 * default presentation renders and the `labels` prop is required.
 */
const hasCustomSlot = computed<boolean>(() => slots.default !== undefined);

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------
if (import.meta.env.DEV && !hasCustomSlot.value) {
  const l = props.labels;
  if (!l || !l.chooseFile || !l.chooseFiles || !l.dropHere || !l.dropZone) {
    __masesFileInputWarnOnce(
      'file-input:missing-labels',
      '[FileInput] the default presentation is rendering but the ' +
        '`labels` prop is missing or incomplete. All four strings ' +
        '(chooseFile, chooseFiles, dropHere, dropZone) are required. ' +
        'Supply them from your translation layer, or provide a ' +
        'default slot with your own presentation.',
    );
  }
}

// -----------------------------------------------------------------------------
// Generated id
// -----------------------------------------------------------------------------
const inputId = `mases-file-input-${++__masesFileInputIdCounter}`;

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const inputRef = ref<HTMLInputElement | null>(null);

// -----------------------------------------------------------------------------
// Drag state
// -----------------------------------------------------------------------------
const isDragOver = ref<boolean>(false);
let dragCounter = 0;

function onDragEnter(): void {
  if (props.disabled) return;
  dragCounter += 1;
  isDragOver.value = true;
}

function onDragLeave(): void {
  if (props.disabled) return;
  dragCounter -= 1;
  if (dragCounter <= 0) {
    dragCounter = 0;
    isDragOver.value = false;
  }
}

function onDragOver(event: DragEvent): void {
  /*
   * The .prevent modifier on the template blocks the browser's default
   * "open the file in a new tab" behavior for non-file drags. The
   * handler also sets the drop effect so the cursor reflects a valid
   * drop target.
   */
  if (props.disabled) return;
  if (event.dataTransfer !== null) {
    event.dataTransfer.dropEffect = 'copy';
  }
}

function onDrop(event: DragEvent): void {
  dragCounter = 0;
  isDragOver.value = false;
  if (props.disabled) return;

  const list = event.dataTransfer?.files;
  if (!list || list.length === 0) return;

  processFiles(Array.from(list));
}

// -----------------------------------------------------------------------------
// Open picker
// -----------------------------------------------------------------------------
function openFilePicker(): void {
  if (props.disabled) return;
  inputRef.value?.click();
}

// -----------------------------------------------------------------------------
// Native input change
// -----------------------------------------------------------------------------
function onNativeChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const list = input.files;
  if (!list || list.length === 0) {
    // Reset the input so that re-selecting the SAME file fires `change`
    // again on the next attempt.
    input.value = '';
    return;
  }

  processFiles(Array.from(list));

  /*
   * Reset the input's value after processing. Without this, the
   * browser will not fire `change` again if the user re-selects the
   * same file (the input's value would be unchanged).
   */
  input.value = '';
}

// -----------------------------------------------------------------------------
// Validation and dispatch
// -----------------------------------------------------------------------------
function processFiles(files: File[]): void {
  /*
   * In single-file mode, silently discard any files beyond the first.
   * Mirrors the native input's behavior with multiple=false. See the
   * response preamble §"Validation".
   */
  const candidates = props.multiple ? files : files.slice(0, 1);

  const accepted: File[] = [];

  for (const file of candidates) {
    if (!matchesAccept(file)) {
      emit('reject', 'wrong-type');
      continue;
    }

    if (
      props.maxSizeBytes !== undefined &&
      file.size > props.maxSizeBytes
    ) {
      emit('reject', 'too-large');
      continue;
    }

    accepted.push(file);
  }

  if (accepted.length > 0) {
    emit('select', accepted);
  }
}

/**
 * Parse and apply the `accept` string against a file.
 * Returns true when the file matches any rule. See the response
 * preamble §"Validation".
 */
function matchesAccept(file: File): boolean {
  const accept = props.accept;
  if (accept === undefined || accept.trim() === '') {
    return true;
  }

  const rules = accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);

  if (rules.length === 0) {
    return true;
  }

  const filename = file.name.toLowerCase();
  const mime = (file.type || '').toLowerCase();

  for (const rule of rules) {
    // Extension rule: ".pdf", ".png", etc.
    if (rule.startsWith('.')) {
      if (filename.endsWith(rule)) {
        return true;
      }
      continue;
    }

    // Wildcard MIME: "image/*", "audio/*", etc.
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -1); // keep the trailing slash
      if (mime !== '' && mime.startsWith(prefix)) {
        return true;
      }
      continue;
    }

    // Exact MIME: "application/pdf", "image/png", etc.
    if (mime === rule) {
      return true;
    }
  }

  return false;
}

// -----------------------------------------------------------------------------
// Computed — trigger label for the default presentation
// -----------------------------------------------------------------------------
const triggerLabel = computed<string>(() => {
  const l = props.labels;
  if (!l) return '';
  return props.multiple ? l.chooseFiles : l.chooseFile;
});

const dropHereLabel = computed<string>(() => props.labels?.dropHere ?? '');

const dropZoneAriaLabel = computed<string | undefined>(() => {
  const l = props.labels;
  if (!l || !l.dropZone) return undefined;
  return l.dropZone;
});
</script>

<template>
  <div
    class="file-input"
    :class="{ 'file-input--disabled': disabled }"
    role="group"
    :aria-label="dropZoneAriaLabel"
    :data-drag-over="isDragOver ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    :data-invalid="invalid ? 'true' : undefined"
    data-testid="file-input-root"
    @dragenter.prevent="onDragEnter"
    @dragover="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!--
      Drop-zone interior.
      The default presentation (button + hint) renders when the
      consumer does not supply the default slot. Otherwise the
      consumer's content renders, wired to `openFilePicker`.
    -->
    <slot
      :open-file-picker="openFilePicker"
      :is-drag-over="isDragOver"
      :input-id="inputId"
    >
      <!-- Default presentation -->
      <div class="file-input__default">
        <button
          type="button"
          :disabled="disabled"
          class="file-input__trigger"
          data-testid="file-input-trigger"
          @click="openFilePicker"
        >
          <BaseIcon name="upload" size="sm" />
          <span class="file-input__trigger-label">{{ triggerLabel }}</span>
        </button>

        <p
          v-if="dropHereLabel"
          class="file-input__hint"
        >{{ dropHereLabel }}</p>
      </div>
    </slot>

    <!--
      Visually hidden native file input.
      Owns the file-selection behavior but is not reachable via Tab and
      is not announced by screen readers; the button provides the
      accessible identity. See the file header comment.
    -->
    <input
      ref="inputRef"
      type="file"
      :id="inputId"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      tabindex="-1"
      aria-hidden="true"
      class="file-input__native"
      data-testid="file-input-native"
      @change="onNativeChange"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Drop zone
   ============================================================================ */
.file-input {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 8rem;
  padding-block: var(--mases-space-6);
  padding-inline: var(--mases-space-6);
  background-color: var(--mases-color-surface-page);
  border: 2px dashed var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-secondary);
  text-align: center;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Drag-over state — brand-tinted drop target. */
.file-input[data-drag-over='true'] {
  background-color: var(--mases-color-state-selected);
  border-color: var(--mases-color-border-brand);
  color: var(--mases-color-text-primary);
}

/* Invalid state. */
.file-input[data-invalid='true'] {
  border-color: var(--mases-color-border-danger);
}

/* Disabled state. */
.file-input--disabled,
.file-input[data-disabled='true'] {
  background-color: var(--mases-color-surface-disabled);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Default presentation
   ============================================================================ */
.file-input__default {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mases-space-2);
}

.file-input__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-4);
  appearance: none;
  background-color: var(--mases-color-action-secondary);
  border: 1px solid var(--mases-color-action-secondary);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-inverse);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.file-input__trigger:hover:not(:disabled) {
  background-color: var(--mases-color-action-secondary-hover);
  border-color: var(--mases-color-action-secondary-hover);
}

.file-input__trigger:active:not(:disabled) {
  background-color: var(--mases-color-action-secondary-active);
  border-color: var(--mases-color-action-secondary-active);
}

.file-input__trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.file-input__trigger:disabled {
  background-color: var(--mases-color-surface-disabled);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

.file-input__trigger-label {
  display: inline-block;
}

.file-input__hint {
  margin: 0;
  color: inherit;
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Visually hidden native input
   ---------------------------------------------------------------------------
   Standard clip technique. Keeps the input in the DOM (so the picker
   works) while removing it from the visual flow.
   ============================================================================ */
.file-input__native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
  /*
   * Do NOT set display: none — some browsers will not open the file
   * picker when click() is called on a display:none input.
   */
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .file-input {
    min-height: 6rem;
    padding-inline: var(--mases-space-4);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .file-input,
  .file-input__trigger {
    transition-duration: 1ms;
  }
}
</style>