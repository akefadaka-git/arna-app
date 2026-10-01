<!--
=============================================================================
 MASES Phase 2 UI — ErrorSupportPanel
=============================================================================

 File:      mase_app/src/components/composites/ErrorSupportPanel/ErrorSupportPanel.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.27
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_AMENDMENT_A1_REVISION_2.md §A1R4.7

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A collapsible support block for error pages. Renders a native <details>
 disclosure whose body carries a labeled field list (error code, request
 ID, timestamp, localized occurrence), a copy-to-clipboard button, and —
 on copy failure — a selectable plain-text block with a manual-copy
 instruction.

 -----------------------------------------------------------------------------
 The labels object — see the response preamble
 -----------------------------------------------------------------------------
 Required. Eight translated strings. The component does NOT fabricate
 any of them, including the fallback instruction.

 -----------------------------------------------------------------------------
 The copy state machine — see the response preamble
 -----------------------------------------------------------------------------
 Three states: idle, copied (auto-reverts after 3s), failed. No second
 copy attempt is offered; the failure path is a manual select-and-copy.

 -----------------------------------------------------------------------------
 The plain-text block — see the response preamble
 -----------------------------------------------------------------------------
 One field per line, using the field labels from `labels`. Undefined
 fields are omitted.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `labels.toggle`              (disclosure summary)
   - `labels.errorCode` etc.       (field labels)
   - `labels.copy`                 (copy button text)
   - `labels.copied`               (success message)
   - `labels.copyFallbackInstruction` (failure instruction)
   - the field VALUES from props (code, requestId, timestamp, occurredAt)
   - the plain-text block, built from `labels` + values
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, grid, gap, borders,
 text alignment, readability max-widths, the textarea's monospace
 behavior comes from a Tier 2 font token).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-support-panel-root"     on the <details>
 data-testid="error-support-panel-summary"  on the <summary>
 data-testid="error-support-panel-body"     on the body <div>
 data-testid="error-support-panel-fields"   on the field-list <dl>
 data-testid="error-support-panel-field"    on each field row <div>
 data-testid="error-support-panel-copy"     on the copy <button>
 data-testid="error-support-panel-copied"   on the success message
                                            <span> (rendered only when
                                            state is 'copied')
 data-testid="error-support-panel-fallback" on the failure region <div>
                                            (rendered only when state
                                            is 'failed')
 data-testid="error-support-panel-fallback-textarea"
                                            on the selectable
                                            <textarea> inside the
                                            failure region

 The <details> carries:
   data-copy-state="idle" | "copied" | "failed"

 Each field row carries:
   data-field-key="errorCode" | "requestId" | "timestamp" | "occurredAt"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - The <details>/<summary> disclosure is keyboard-operable via native
     browser behavior. The summary's text is the toggle's accessible
     name; no additional aria-label is needed.
   - The summary has a focus ring for keyboard users (styled below).
   - The field list is a native <dl>; each <dt>/<dd> pair is wrapped
     in a <div> (HTML 5.1).
   - The copy button is a native <button> with an accessible name from
     labels.copy.
   - On copy success, the message is announced via role="status" +
     aria-live="polite". The message is text; color is not the sole
     signal.
   - On copy failure, the fallback <textarea> is labelled via
     aria-labelledby pointing at the visible instruction paragraph.
     The instruction paragraph carries an id, generated per instance.
   - The textarea is readonly; its content is a plain-text block that
     a sighted user can select and copy manually.
   - No focus movement by the component; the disclosure's native
     toggle behavior handles focus normally.
   - Reduced motion: the auto-revert of the 'copied' state is a state
     change, not an animation. The panel itself has no animation.
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
 * The eight translated strings the panel renders.
 * See the response preamble §"Design note — the labels object".
 */
export interface ErrorSupportPanelLabels {
  /** The disclosure summary's text, e.g. "Show details". */
  toggle: string;

  /** Field label for the error code. */
  errorCode: string;

  /** Field label for the request identifier. */
  requestId: string;

  /** Field label for the ISO 8601 timestamp. */
  timestamp: string;

  /** Field label for the localized occurrence time. */
  occurredAt: string;

  /** Copy button text, e.g. "Copy support info". */
  copy: string;

  /** Success message, e.g. "Copied to clipboard". */
  copied: string;

  /**
   * Failure instruction, e.g. "Select the text below and copy it
   * manually." Also used as the accessible label of the fallback
   * textarea, via aria-labelledby.
   */
  copyFallbackInstruction: string;
}

/*
 * Internal copy state type.
 */
type CopyState = 'idle' | 'copied' | 'failed';

/*
 * The auto-revert timeout for the 'copied' state, in milliseconds.
 */
const COPIED_REVERT_MS = 3000;

/*
 * Module-level counter for auto-generated ids.
 */
let __masesErrorSupportPanelIdCounter = 0;
</script>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
} from 'vue';

interface Props {
  /**
   * The error code (SCREAMING_SNAKE_CASE). Required.
   *
   * Consumer-supplied. Typically the value of `error.code` from the
   * backend envelope.
   */
  code: string;

  /**
   * The request identifier. Optional.
   *
   * When absent, the field is not rendered and is not included in the
   * plain-text block.
   */
  requestId?: string;

  /**
   * The raw ISO 8601 timestamp. Optional.
   *
   * Consumer-supplied. When absent, the field is not rendered.
   */
  timestamp?: string;

  /**
   * The localized occurrence time, already formatted by the consumer.
   * Optional.
   *
   * Per the frontend's calendar policy, date formatting (Gregorian
   * and future Ethiopian) is performed by the consumer's
   * localization layer. The panel renders the string verbatim.
   */
  occurredAt?: string;

  /**
   * The eight translated strings the panel renders. Required.
   * See the response preamble.
   */
  labels: ErrorSupportPanelLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'copy'): void;
}>();

// -----------------------------------------------------------------------------
// Generated id
// -----------------------------------------------------------------------------
const baseId = `mases-error-support-panel-${++__masesErrorSupportPanelIdCounter}`;
const fallbackInstructionId = `${baseId}-fallback-instruction`;

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const copyState = ref<CopyState>('idle');

let revertTimer: ReturnType<typeof setTimeout> | null = null;

function clearRevertTimer(): void {
  if (revertTimer !== null) {
    clearTimeout(revertTimer);
    revertTimer = null;
  }
}

onBeforeUnmount(() => {
  clearRevertTimer();
});

// -----------------------------------------------------------------------------
// Field presence
// -----------------------------------------------------------------------------
const hasRequestId = computed<boolean>(() => {
  const v = props.requestId;
  return v !== undefined && v !== '';
});

const hasTimestamp = computed<boolean>(() => {
  const v = props.timestamp;
  return v !== undefined && v !== '';
});

const hasOccurredAt = computed<boolean>(() => {
  const v = props.occurredAt;
  return v !== undefined && v !== '';
});

// -----------------------------------------------------------------------------
// Plain-text block
// -----------------------------------------------------------------------------
/**
 * The plain-text rendering written to the clipboard (or shown in the
 * fallback textarea).
 *
 * Rules documented in the response preamble §"Design note — the
 * plain-text block".
 */
const formattedText = computed<string>(() => {
  const lines: string[] = [];
  lines.push(`${props.labels.errorCode}: ${props.code}`);
  if (hasRequestId.value) {
    lines.push(`${props.labels.requestId}: ${props.requestId}`);
  }
  if (hasTimestamp.value) {
    lines.push(`${props.labels.timestamp}: ${props.timestamp}`);
  }
  if (hasOccurredAt.value) {
    lines.push(`${props.labels.occurredAt}: ${props.occurredAt}`);
  }
  return lines.join('\n');
});

// -----------------------------------------------------------------------------
// Clipboard availability probe
// -----------------------------------------------------------------------------
/**
 * Whether `navigator.clipboard.writeText` is available in this context.
 *
 * The Clipboard API requires a secure context (HTTPS or localhost).
 * An HTTP page has `navigator.clipboard === undefined`.
 */
function clipboardIsAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.clipboard === 'undefined') return false;
  if (typeof navigator.clipboard.writeText !== 'function') return false;
  return true;
}

// -----------------------------------------------------------------------------
// Copy handler
// -----------------------------------------------------------------------------
async function onCopyClick(): Promise<void> {
  emit('copy');

  // Reset any pending auto-revert before starting a new attempt.
  clearRevertTimer();

  if (!clipboardIsAvailable()) {
    copyState.value = 'failed';
    return;
  }

  try {
    await navigator.clipboard.writeText(formattedText.value);
    copyState.value = 'copied';
    revertTimer = setTimeout(() => {
      copyState.value = 'idle';
      revertTimer = null;
    }, COPIED_REVERT_MS);
  } catch {
    /*
     * The write rejected — likely a permission denial, an insecure
     * context that passed the availability probe, or a browser quirk.
     * Either way, the outcome is the same: the user must copy
     * manually. See the response preamble §"Design note — the
     * copy-to-clipboard state machine".
     */
    copyState.value = 'failed';
  }
}

// -----------------------------------------------------------------------------
// Reset on disclosure toggle
// -----------------------------------------------------------------------------
/**
 * Reset the copy state when the disclosure is closed. A subsequent
 * open presents a clean panel with the copy button in the idle state.
 */
function onToggle(event: Event): void {
  const details = event.currentTarget as HTMLDetailsElement;
  if (!details.open) {
    clearRevertTimer();
    copyState.value = 'idle';
  }
}
</script>

<template>
  <details
    class="error-support-panel"
    :data-copy-state="copyState"
    data-testid="error-support-panel-root"
    @toggle="onToggle"
  >
    <summary
      class="error-support-panel__summary"
      data-testid="error-support-panel-summary"
    >{{ labels.toggle }}</summary>

    <div
      class="error-support-panel__body"
      data-testid="error-support-panel-body"
    >
      <!-- ============================================================
           Field list
           ============================================================ -->
      <dl
        class="error-support-panel__fields"
        data-testid="error-support-panel-fields"
      >
        <div
          class="error-support-panel__field"
          data-field-key="errorCode"
          data-testid="error-support-panel-field"
        >
          <dt class="error-support-panel__field-label">
            {{ labels.errorCode }}
          </dt>
          <dd class="error-support-panel__field-value">
            {{ code }}
          </dd>
        </div>

        <div
          v-if="hasRequestId"
          class="error-support-panel__field"
          data-field-key="requestId"
          data-testid="error-support-panel-field"
        >
          <dt class="error-support-panel__field-label">
            {{ labels.requestId }}
          </dt>
          <dd class="error-support-panel__field-value">
            {{ requestId }}
          </dd>
        </div>

        <div
          v-if="hasTimestamp"
          class="error-support-panel__field"
          data-field-key="timestamp"
          data-testid="error-support-panel-field"
        >
          <dt class="error-support-panel__field-label">
            {{ labels.timestamp }}
          </dt>
          <dd class="error-support-panel__field-value">
            {{ timestamp }}
          </dd>
        </div>

        <div
          v-if="hasOccurredAt"
          class="error-support-panel__field"
          data-field-key="occurredAt"
          data-testid="error-support-panel-field"
        >
          <dt class="error-support-panel__field-label">
            {{ labels.occurredAt }}
          </dt>
          <dd class="error-support-panel__field-value">
            {{ occurredAt }}
          </dd>
        </div>
      </dl>

      <!-- ============================================================
           Copy region
           ============================================================ -->
      <div class="error-support-panel__actions">
        <button
          type="button"
          class="error-support-panel__copy"
          data-testid="error-support-panel-copy"
          @click="onCopyClick"
        >
          {{ labels.copy }}
        </button>

        <!--
          Success message.
          role="status" + aria-live="polite" so screen readers
          announce it as a status change (per the accessibility
          contract documented in the file header comment).
        -->
        <span
          v-if="copyState === 'copied'"
          class="error-support-panel__copied"
          role="status"
          aria-live="polite"
          data-testid="error-support-panel-copied"
        >{{ labels.copied }}</span>
      </div>

      <!-- ============================================================
           Failure fallback
           ============================================================ -->
      <div
        v-if="copyState === 'failed'"
        class="error-support-panel__fallback"
        data-testid="error-support-panel-fallback"
      >
        <p
          :id="fallbackInstructionId"
          class="error-support-panel__fallback-instruction"
        >{{ labels.copyFallbackInstruction }}</p>

        <textarea
          readonly
          class="error-support-panel__fallback-textarea"
          :aria-labelledby="fallbackInstructionId"
          :value="formattedText"
          rows="6"
          data-testid="error-support-panel-fallback-textarea"
        />
      </div>
    </div>
  </details>
</template>

<style scoped>
/* ============================================================================
   Root <details>
   ============================================================================ */
.error-support-panel {
  width: 100%;
  max-width: 40em;
  margin-block-start: var(--mases-space-4);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  text-align: start;
}

/* ============================================================================
   Summary (the disclosure toggle)
   ============================================================================ */
.error-support-panel__summary {
  cursor: pointer;
  padding-block: var(--mases-space-1);
  color: inherit;
  font-weight: var(--mases-font-weight-medium);
  /*
   * The browser's default disclosure triangle is retained (browser
   * native, accessible, no JS). Customising it is deferred to a
   * future CR; the design system does not declare a marker glyph for
   * disclosures.
   */
}

.error-support-panel__summary:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Body
   ============================================================================ */
.error-support-panel__body {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin-block-start: var(--mases-space-2);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
  background-color: var(--mases-color-surface-overlay);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Field list <dl>
   ============================================================================ */
.error-support-panel__fields {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin: 0;
  padding: 0;
}

/* ============================================================================
   Field row <div>
   ============================================================================ */
.error-support-panel__field {
  display: grid;
  /*
   * A fixed-width label column keeps the value column aligned across
   * rows. max-content lets longer labels (e.g., a longer Amharic
   * translation) expand the column without wrapping awkwardly.
   */
  grid-template-columns: minmax(7rem, max-content) minmax(0, 1fr);
  column-gap: var(--mases-space-3);
  align-items: baseline;
  min-width: 0;
}

/* ============================================================================
   Field label <dt>
   ============================================================================ */
.error-support-panel__field-label {
  margin: 0;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Field value <dd>
   ============================================================================ */
.error-support-panel__field-value {
  margin: 0;
  min-width: 0;
  color: var(--mases-color-text-primary);
  /*
   * Mono font + tabular numerals are appropriate for identifiers
   * (error codes, UUIDs) and timestamps. Amharic text (in the
   * occurredAt field) falls back to Noto Sans Ethiopic through the
   * design system's font stack.
   */
  font-family: var(--mases-font-family-mono);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-regular);
  /*
   * Long values (UUIDs, base64 tokens) wrap at word boundaries via
   * overflow-wrap: anywhere, so the panel never forces horizontal
   * scroll.
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Copy region
   ============================================================================ */
.error-support-panel__actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
  padding-block-start: var(--mases-space-1);
}

/* ============================================================================
   Copy button
   ============================================================================ */
.error-support-panel__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  appearance: none;
  background-color: var(--mases-color-action-secondary);
  border: 1px solid var(--mases-color-action-secondary);
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-text-inverse);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
  font-weight: var(--mases-font-weight-medium);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.error-support-panel__copy:hover {
  background-color: var(--mases-color-action-secondary-hover);
  border-color: var(--mases-color-action-secondary-hover);
}

.error-support-panel__copy:active {
  background-color: var(--mases-color-action-secondary-active);
  border-color: var(--mases-color-action-secondary-active);
}

.error-support-panel__copy:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Copied success message
   ============================================================================ */
.error-support-panel__copied {
  color: var(--mases-color-text-success);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
}

/* ============================================================================
   Failure fallback
   ============================================================================ */
.error-support-panel__fallback {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  padding-block-start: var(--mases-space-1);
}

.error-support-panel__fallback-instruction {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

.error-support-panel__fallback-textarea {
  display: block;
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  appearance: none;
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-text-primary);
  font-family: var(--mases-font-family-mono);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-regular);
  resize: vertical;
  /*
   * The textarea is readonly. It remains selectable (the user's
   * manual-copy path) but is not editable.
   */
}

.error-support-panel__fallback-textarea:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .error-support-panel__field {
    /*
     * Stack label above value on mobile. The label column's fixed
     * minimum would otherwise push the value to the right edge with
     * very little room to render long values.
     */
    grid-template-columns: minmax(0, 1fr);
    row-gap: var(--mases-space-1);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .error-support-panel__copy {
    transition-duration: 1ms;
  }
}
</style>