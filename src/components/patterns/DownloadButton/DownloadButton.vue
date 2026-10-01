<!--
=============================================================================
 MASES Phase 2 UI — DownloadButton
=============================================================================

 File:      mase_app/src/components/patterns/DownloadButton/DownloadButton.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.12
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A button that requests an authorized file download and reflects the
 download's lifecycle: idle → downloading → success (transient) or
 error (sticky). Composes BaseButton (Unit 8.2) for the chrome and
 BaseIcon (Unit 8.19) for the state glyph.

 -----------------------------------------------------------------------------
 Security posture
 -----------------------------------------------------------------------------
 The pattern issues NO HTTP requests, constructs NO URLs, and inspects
 NO error codes. It calls a consumer-supplied `download` function and
 drives its own state machine from the promise. Safe handling of
 expired URLs, denied access, and network failures is the consumer's
 responsibility (see the file's design notes in the response preamble).

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   BaseButton (Unit  8.2)  — the button element, variants, focus ring
   BaseIcon   (Unit 8.19)  — the state glyph (download / loader /
                             check-circle / alert-circle)

 Does not reimplement either primitive.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible label, aria-label, and state message comes from the
 `labels` prop. The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, align, gap, min-width,
 overflow-wrap, animation timing function).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="download-button-root"   on the BaseButton (falls through
                                      to the <button> element)
 data-testid="download-button-icon"   on the current BaseIcon
                                      (falls through to the <svg>)
 data-testid="download-button-label"  on the label <span>

 The root carries:
   data-status="idle|downloading|success|error"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + INTERACTIVE (via BaseButton):

   - Native <button> semantics from BaseButton.
   - Keyboard activation (Enter / Space) inherited from BaseButton.
   - Visible focus ring inherited from BaseButton.
   - aria-busy="true" while downloading.
   - The accessible name changes at each transition; a focused button's
     name change is announced by NVDA and VoiceOver (see the response
     preamble §"Design note — accessibility announcement").
   - The state glyph is decorative: BaseIcon is rendered without an
     aria-label, so it is removed from the accessibility tree and the
     label span carries the meaning.
   - Reduced motion: the spinner's rotation is disabled.
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
 * The button's lifecycle status.
 */
export type DownloadButtonStatus =
  | 'idle'
  | 'downloading'
  | 'success'
  | 'error';

/**
 * Visual variant, passed through to BaseButton.
 */
export type DownloadButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'link';

/**
 * Size, passed through to BaseButton.
 */
export type DownloadButtonSize = 'sm' | 'md' | 'lg';

/**
 * The consumer-supplied download function.
 *
 * Must resolve when the download has completed (including, if the
 * consumer chooses, the browser-side save). Must reject on any
 * failure — network, authorization, expired URL, or otherwise. The
 * pattern does not interpret the rejection; it emits it verbatim.
 */
export type DownloadFn = () => Promise<void>;

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface DownloadButtonLabels {
  /** Idle state. The primary call to action. */
  download: string;

  /** Downloading state. Button is disabled. */
  downloading: string;

  /** Transient confirmation shown after a successful download. */
  success: string;

  /** Error state. The button now retries on click. */
  retry: string;
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import BaseButton from '../../primitives/BaseButton';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';

interface Props {
  /**
   * The consumer-supplied download function. Required.
   *
   * The consumer is expected to supply a STABLE reference (a module
   * function, a Pinia action, or a memoized closure). The pattern
   * stores the reference as-is and calls it on each click.
   */
  download: DownloadFn;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: DownloadButtonLabels;

  /**
   * Visual variant, passed through to BaseButton.
   * Defaults to 'primary'.
   */
  variant?: DownloadButtonVariant;

  /**
   * Size, passed through to BaseButton.
   * Defaults to 'md'.
   */
  size?: DownloadButtonSize;

  /**
   * Whether the button fills its container's width.
   * Defaults to false.
   */
  block?: boolean;

  /**
   * Whether the button is disabled by the consumer. When true, clicks
   * are ignored and the button is rendered in the disabled style.
   * Defaults to false.
   *
   * Independent of the pattern's own disabling during 'downloading'.
   */
  disabled?: boolean;

  /**
   * Duration, in milliseconds, of the transient success state.
   * Defaults to 2000.
   *
   * When set to 0 or a negative number, the `downloaded` event still
   * fires but the button transitions straight back to idle. Use this
   * when the consumer surfaces success via a toast or other UI instead
   * of via the button state.
   */
  successDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  successDuration: 2000,
});

const emit = defineEmits<{
  /** Fires when a download begins (status transitions to 'downloading'). */
  (event: 'started'): void;

  /** Fires when a download resolves successfully. */
  (event: 'downloaded'): void;

  /** Fires when a download rejects. */
  (event: 'failed', payload: { error: unknown }): void;
}>();

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const status = ref<DownloadButtonStatus>('idle');

/*
 * The success timer handle. Held in a plain variable (not a ref) so
 * the timer id is not wrapped in reactivity and cannot cause
 * unnecessary re-renders.
 */
let successTimer: ReturnType<typeof setTimeout> | null = null;

// -----------------------------------------------------------------------------
// Timer management
// -----------------------------------------------------------------------------
function clearSuccessTimer(): void {
  if (successTimer !== null) {
    clearTimeout(successTimer);
    successTimer = null;
  }
}

function scheduleReturnToIdle(): void {
  if (props.successDuration <= 0) {
    // No transient state requested; return to idle synchronously.
    status.value = 'idle';
    return;
  }
  successTimer = setTimeout(() => {
    successTimer = null;
    status.value = 'idle';
  }, props.successDuration);
}

// -----------------------------------------------------------------------------
// Click handler
// -----------------------------------------------------------------------------
async function onClick(): Promise<void> {
  // Defence in depth: the button is disabled while downloading, so
  // this branch should not be reachable from a user interaction.
  if (props.disabled) return;
  if (status.value === 'downloading') return;

  // A new click supersedes any pending success-confirmation timer.
  clearSuccessTimer();

  status.value = 'downloading';
  emit('started');

  try {
    await props.download();
    status.value = 'success';
    emit('downloaded');
    scheduleReturnToIdle();
  } catch (error) {
    /*
     * The pattern does not inspect the error. It emits it verbatim so
     * the consumer can classify it (expired URL, denied access,
     * network failure) against the shared error vocabulary and route
     * appropriately.
     */
    status.value = 'error';
    emit('failed', { error });
  }
}

// -----------------------------------------------------------------------------
// Lifecycle
// -----------------------------------------------------------------------------
onBeforeUnmount(() => {
  clearSuccessTimer();
});

// -----------------------------------------------------------------------------
// Computed presentation
// -----------------------------------------------------------------------------
const isDisabled = computed<boolean>(
  () => props.disabled || status.value === 'downloading',
);

const isBusy = computed<boolean>(() => status.value === 'downloading');

const currentLabel = computed<string>(() => {
  switch (status.value) {
    case 'downloading':
      return props.labels.downloading;
    case 'success':
      return props.labels.success;
    case 'error':
      return props.labels.retry;
    case 'idle':
    default:
      return props.labels.download;
  }
});

const currentIcon = computed<IconName>(() => {
  switch (status.value) {
    case 'downloading':
      return 'loader';
    case 'success':
      return 'check-circle';
    case 'error':
      return 'alert-circle';
    case 'idle':
    default:
      return 'download';
  }
});
</script>

<template>
  <BaseButton
    :variant="variant"
    :size="size"
    :block="block"
    :disabled="isDisabled"
    :aria-busy="isBusy ? 'true' : undefined"
    :data-status="status"
    data-testid="download-button-root"
    @click="onClick"
  >
    <span class="download-button__content">
      <BaseIcon
        :name="currentIcon"
        size="sm"
        :class="{ 'download-button__spinner': isBusy }"
        data-testid="download-button-icon"
      />
      <span
        class="download-button__label"
        data-testid="download-button-label"
      >{{ currentLabel }}</span>
    </span>
  </BaseButton>
</template>

<style scoped>
/* ============================================================================
   Content wrapper
   ---------------------------------------------------------------------------
   A neutral inline-flex row containing the state icon and the label.
   Kept as a local class rather than relying on BaseButton's internal
   gap so that the icon-to-label spacing is owned by this pattern.
   ============================================================================ */
.download-button__content {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  min-width: 0;
}

/* ============================================================================
   Label
   ============================================================================ */
.download-button__label {
  /*
   * Amharic-safe wrapping. The button's chrome (from BaseButton) owns
   * the horizontal padding; this rule only ensures the label does not
   * force horizontal overflow of the button itself.
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Spinner
   ---------------------------------------------------------------------------
   The loader icon rotates while a download is in flight. Under
   prefers-reduced-motion the rotation is disabled; the icon remains
   visible as a static glyph so the loading state is still conveyed
   visually and (via the label) textually.
   ============================================================================ */
.download-button__spinner {
  animation: download-button-spin 1.5s linear infinite;
}

@keyframes download-button-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .download-button__spinner {
    animation: none;
  }
}
</style>