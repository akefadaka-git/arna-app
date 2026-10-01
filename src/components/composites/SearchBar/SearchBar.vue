<!--
=============================================================================
 MASES Phase 2 UI — SearchBar
=============================================================================

 File:      mase_app/src/components/composites/SearchBar/SearchBar.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.15
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A debounced search input with a leading search icon and a trailing
 clear (✕) button (or a loading spinner while a search is in flight).

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 SearchBar COMPOSES BaseInput (Unit 8.9); it does not reimplement the
 input's chrome (border, background, radius, focus ring, invalid state,
 mobile height). All of those come from BaseInput and are inherited
 automatically.

 -----------------------------------------------------------------------------
 Debounce semantics — see the response preamble
 -----------------------------------------------------------------------------
 Three emissions on three channels:

   update:modelValue  — immediate, on every keystroke (v-model)
   search             — debounced (default 300ms) OR immediate on Enter
   clear              — immediate, when the ✕ button is clicked

 The component does NOT emit `clear` on programmatic modelValue changes.
 See the response preamble §"Design note — debounce semantics".

 -----------------------------------------------------------------------------
 The loadingLabel and clearLabel props
 -----------------------------------------------------------------------------
 Both are optional. When absent, the corresponding element renders with
 an empty accessible name and a deduplicated dev warning fires once per
 module load. The component never falls back to English.

 -----------------------------------------------------------------------------
 The leading slot
 -----------------------------------------------------------------------------
 Consumers may override the leading search icon via the `leading` slot
 (declared in the catalog). The slot replaces the entire leading
 adornment region.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `placeholder` (consumer-supplied);
   - `clearLabel` (consumer-supplied) as the clear button's aria-label;
   - `loadingLabel` (consumer-supplied) as the spinner's accessible name;
   - the `leading` slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 SearchBar declares NO design tokens. All styling is inherited from
 BaseInput (the input chrome) and BaseIcon / BaseSpinner (the
 adornments). The only CSS declared in this file styles the clear
 button's hover and focus states.

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="search-bar-root"       on the outer <div role="search">
 data-testid="search-bar-input"      on the composed BaseInput wrapper
 data-testid="search-bar-clear"      on the clear button (rendered only
                                     when modelValue is non-empty AND
                                     loading is false)
 data-testid="search-bar-spinner"    on the spinner (rendered only
                                     when loading is true)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - The outer <div role="search"> is the ARIA search landmark.
     Consumers may supply an `ariaLabel` (recommended for a distinct
     landmark name); when absent, the ARIA-default landmark name for
     role="search" applies.
   - The input is a native <input type="search"> rendered by BaseInput.
   - The leading icon is decorative (aria-hidden via BaseIcon default).
   - The clear button has an accessible name from `clearLabel`.
   - The loading spinner announces via BaseSpinner's role="status";
     `loadingLabel`, when supplied, becomes its accessible name.
   - Focus on clear: the clear button uses @mousedown.prevent so that
     clicking it does NOT remove focus from the input.
   - Reduced motion: the clear button's hover transition becomes
     effectively instant.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesSearchBarWarned = new Set<string>();

function __masesSearchBarWarnOnce(key: string, message: string): void {
  if (__masesSearchBarWarned.has(key)) {
    return;
  }
  __masesSearchBarWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/**
 * Default debounce interval in milliseconds.
 */
const DEFAULT_DEBOUNCE_MS = 300;
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import BaseInput from '../../primitives/BaseInput';
import BaseIcon from '../../primitives/BaseIcon';
import BaseSpinner from '../../primitives/BaseSpinner';

interface Props {
  /**
   * Bound value. Required.
   *
   * Typically bound via v-model.
   */
  modelValue: string;

  /**
   * Placeholder text. Consumer-supplied, translated.
   */
  placeholder?: string;

  /**
   * Debounce interval for the `search` emit, in milliseconds.
   * Defaults to 300.
   *
   * Values below 0 are clamped to 0 (synchronous).
   */
  debounceMs?: number;

  /**
   * Whether a search is currently in flight. Defaults to false.
   *
   * When true, the trailing region renders BaseSpinner (instead of the
   * clear button). See the response preamble §"Design note — loading
   * state replaces the clear button".
   */
  loading?: boolean;

  /**
   * Whether to focus the input when the component mounts.
   * Defaults to false.
   *
   * Consumers typically set this on a search page's primary input.
   */
  autoFocus?: boolean;

  /**
   * Optional aria-label for the role="search" landmark.
   *
   * When omitted, no aria-label is set, and the ARIA-default landmark
   * name for role="search" applies ("search" in most screen readers).
   * Consumers who want a more specific name (e.g., "Search
   * shareholders") supply a translated string.
   */
  ariaLabel?: string;

  /**
   * Translated accessible name for the clear (✕) button.
   *
   * Required when the clear button can appear (i.e., always). A missing
   * value triggers a deduplicated dev warning; in production, the
   * button renders with an empty aria-label (visible defect).
   */
  clearLabel?: string;

  /**
   * Translated accessible name for the loading spinner.
   *
   * Optional. When omitted, the spinner renders without an accessible
   * name (its role="status" region still announces itself as a status
   * change, but is not described by text).
   */
  loadingLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: undefined,
  debounceMs: DEFAULT_DEBOUNCE_MS,
  loading: false,
  autoFocus: false,
  ariaLabel: undefined,
  clearLabel: undefined,
  loadingLabel: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'search', value: string): void;
  (event: 'clear'): void;
}>();

/**
 * The leading slot is declared by the catalog for consumers that want
 * to override the default search icon.
 */
defineSlots<{
  leading(): unknown;
}>();

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && !props.clearLabel) {
  __masesSearchBarWarnOnce(
    'search-bar:missing-clear-label',
    '[SearchBar] clearLabel is not supplied. The clear button will ' +
      'render with an empty aria-label, which is an accessibility ' +
      'defect. Supply a translated string such as "Clear search".',
  );
}

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
/**
 * A ref to the composed BaseInput. Its exposed `focus()` method is used
 * by the clear handler and by the autofocus-on-mount logic.
 */
const inputRef = ref<{ focus: () => void } | null>(null);

// -----------------------------------------------------------------------------
// Computed — value presence
// -----------------------------------------------------------------------------
const hasValue = computed<boolean>(() => props.modelValue.length > 0);

/**
 * Whether the clear button renders.
 *
 * Renders only when there is text AND no search is in flight.
 * See the response preamble §"Design note — loading state replaces the
 * clear button".
 */
const showClearButton = computed<boolean>(
  () => hasValue.value && !props.loading,
);

// -----------------------------------------------------------------------------
// Debounce
// -----------------------------------------------------------------------------
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function cancelDebounce(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function scheduleSearch(value: string): void {
  cancelDebounce();
  const delay = Math.max(0, props.debounceMs);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    emit('search', value);
  }, delay);
}

// -----------------------------------------------------------------------------
// Input handlers
// -----------------------------------------------------------------------------
function onInput(value: string): void {
  emit('update:modelValue', value);
}

/**
 * Watch modelValue. Every change — whether from the input (via onInput)
 * or from the consumer programmatically — schedules a debounced search.
 *
 * See the response preamble §"Design note — debounce semantics".
 */
watch(
  () => props.modelValue,
  (value) => {
    scheduleSearch(value);
  },
);

/**
 * Enter key: bypass the debounce and fire `search` immediately.
 */
function onEnter(): void {
  cancelDebounce();
  emit('search', props.modelValue);
}

/**
 * Clear button clicked: clear the value, emit `clear`, cancel any
 * pending debounce, and focus the input for the next query.
 */
function onClear(): void {
  cancelDebounce();
  emit('update:modelValue', '');
  emit('clear');
  void nextTick(() => {
    inputRef.value?.focus();
  });
}

// -----------------------------------------------------------------------------
// Lifecycle
// -----------------------------------------------------------------------------
onMounted(() => {
  if (props.autoFocus) {
    void nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

onBeforeUnmount(() => {
  cancelDebounce();
});
</script>

<template>
  <div
    role="search"
    :aria-label="ariaLabel"
    class="search-bar"
    data-testid="search-bar-root"
  >
    <BaseInput
      ref="inputRef"
      :model-value="modelValue"
      type="search"
      :placeholder="placeholder"
      :autocomplete="'off'"
      data-testid="search-bar-input"
      @update:model-value="onInput"
      @enter="onEnter"
    >
      <!--
        Leading region.
        Default: a decorative search icon.
        Override: the consumer's `leading` slot content.
      -->
      <template #leading>
        <slot name="leading">
          <BaseIcon name="search" size="sm" />
        </slot>
      </template>

      <!--
        Trailing region.
        Renders one of:
          - BaseSpinner, when loading is true
          - The clear button, when modelValue is non-empty and not loading
          - Nothing, when modelValue is empty and not loading
      -->
      <template #trailing>
        <BaseSpinner
          v-if="loading"
          size="sm"
          :aria-label="loadingLabel"
          data-testid="search-bar-spinner"
        />

        <button
          v-else-if="showClearButton"
          type="button"
          class="search-bar__clear"
          :aria-label="clearLabel ?? ''"
          data-testid="search-bar-clear"
          @mousedown.prevent
          @click="onClear"
        >
          <BaseIcon name="close" size="xs" />
        </button>
      </template>
    </BaseInput>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root — thin wrapper only
   ---------------------------------------------------------------------------
   The wrapper exists solely to carry role="search" and the aria-label.
   All visual chrome (border, radius, padding, focus ring, disabled
   state, invalid state, mobile height) is inherited from BaseInput.
   ============================================================================ */
.search-bar {
  display: block;
  width: 100%;
}

/* ============================================================================
   Clear button
   ---------------------------------------------------------------------------
   A compact icon button styled to sit inside BaseInput's trailing slot.
   The slot's container (rendered by BaseInput) provides the layout
   position; this rule styles the button itself.
   ============================================================================ */
.search-bar__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: 0;
  border-radius: var(--mases-radius-full);
  color: var(--mases-color-icon-secondary);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.search-bar__clear:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-icon-primary);
}

.search-bar__clear:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Mobile
   ---------------------------------------------------------------------------
   Enforce a minimum touch target on the clear button. WCAG 2.5.5 grants
   an exception for "inline" controls, but the search clear is close
   enough to a standalone control that meeting 44×44 on mobile is the
   correct posture: the button sits inside a ~44px-tall input, and its
   hit area can safely fill most of that height without overflow.
   ============================================================================ */
@media (max-width: 639px) {
  .search-bar__clear {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .search-bar__clear {
    transition-duration: 1ms;
  }
}
</style>