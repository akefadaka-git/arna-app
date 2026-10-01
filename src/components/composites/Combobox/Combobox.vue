<!--
=============================================================================
 MASES Phase 2 UI — Combobox
=============================================================================

 File:      mase_app/src/components/composites/Combobox/Combobox.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.4
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A searchable single/multi select. Renders an input that filters a
 listbox of options; typing narrows the list; selecting adds or replaces
 the current value.

 -----------------------------------------------------------------------------
 ARIA pattern
 -----------------------------------------------------------------------------
 The component implements the ARIA combobox pattern:

     input     role="combobox"  aria-expanded  aria-controls
                                aria-activedescendant  aria-autocomplete
     popup     role="listbox"   aria-multiselectable (when multiple)
     option    role="option"    aria-selected  aria-disabled

 Focus stays on the input while the dropdown is open. The visually
 highlighted option is indicated via aria-activedescendant on the input;
 DOM focus is not moved to the option.

 See the file header comment §"The two combobox patterns" (below) for
 the searchable=true / searchable=false distinction.

 -----------------------------------------------------------------------------
 Close triggers — see the response preamble
 -----------------------------------------------------------------------------
 Closes on: outside mousedown, Escape, Tab, and (in single-select) on
 option selection. Does NOT close on blur.

 -----------------------------------------------------------------------------
 Multi-select chips
 -----------------------------------------------------------------------------
 Selected items render as BaseChip instances inline in the control.
 Chips are removable via their X button when the consumer supplies
 `chipRemoveLabel`. See the response preamble §"Design note — chip
 removal".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - the consumer's `placeholder` (translated);
   - the consumer's option labels (from the options prop);
   - the consumer's `chipRemoveLabel` (translated) when removing chips;
   - no other text.

 The empty-results state has no default text; the consumer supplies it
 via the `empty` slot.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="combobox-root"       on the outer wrapper
 data-testid="combobox-control"    on the visual control <div>
 data-testid="combobox-input"      on the native <input>
 data-testid="combobox-chip"       on each chip (multi-select)
 data-testid="combobox-indicator"  on the chevron wrapper
 data-testid="combobox-listbox"    on the popup <ul>
 data-testid="combobox-option"     on each option <li>
 data-testid="combobox-empty"      on the empty-state <li>

 The root also carries:
   data-open="true"            (present only while the popup is open)
   data-invalid="true"         (present only when invalid)
   data-disabled="true"        (present only when disabled)
   data-multiple="true"        (present only in multi-select mode)
   data-searchable="false"     (present only when searchable=false)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - ARIA combobox pattern (see above).
   - Keyboard:
       ArrowDown / ArrowUp     navigate options
       Home / End              first / last option
       Enter                   select highlighted option
       Escape                  close dropdown
       Tab                     close dropdown and move focus naturally
       Backspace (multi,       remove the last chip
        empty input)
   - Focus returns to the input on close (it never left, in fact — the
     input retains focus throughout).
   - The chevron indicator is decorative (aria-hidden).
   - All colors are Tier 2 tokens; no color-only state.
   - Invalid state uses the danger border on the control; the input
     itself carries aria-invalid.
   - Disabled state disables the native input; the control is muted.
   - Reduced motion: the popup's appearance transition becomes
     effectively instant.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts). Types declared inside
 * <script setup> are not addressable from outside the SFC.
 */

/**
 * A single option in the combobox.
 *
 * `value` is the identifier emitted on selection; `label` is the
 * human-readable text. The type of `value` (string | number) is
 * preserved verbatim on emit.
 */
export interface ComboboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * The combobox's bound value.
 *
 * Single-select: `string | number | null`
 * Multi-select:  `Array<string | number>`
 *
 * The `multiple` prop determines which shape is expected. This union
 * covers both; runtime validation is the consumer's responsibility.
 */
export type ComboboxValue = string | number | Array<string | number> | null;

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesComboboxWarned = new Set<string>();

function __masesComboboxWarnOnce(key: string, message: string): void {
  if (__masesComboboxWarned.has(key)) {
    return;
  }
  __masesComboboxWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Module-level counter for auto-generated ids.
 * Distinct prefix from the other components' counters.
 */
let __masesComboboxIdCounter = 0;
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import BaseChip from '../../primitives/BaseChip';

interface Props {
  /**
   * The bound value.
   *
   * Single-select: string | number | null.
   * Multi-select:  Array<string | number>.
   */
  modelValue?: ComboboxValue;

  /**
   * The options list. Order is preserved as supplied.
   */
  options: ReadonlyArray<ComboboxOption>;

  /**
   * Multi-select mode. Defaults to false.
   *
   * When true, the value is an array, selections accumulate, and the
   * dropdown stays open after each selection.
   */
  multiple?: boolean;

  /**
   * Whether the input is searchable. Defaults to true.
   *
   * When false, the input is readonly and the component behaves as a
   * select-only combobox. See the file header comment.
   */
  searchable?: boolean;

  /** Placeholder text. Consumer-supplied, translated. */
  placeholder?: string;

  /** Disabled state. */
  disabled?: boolean;

  /** Invalid state. Applied visually and via aria-invalid. */
  invalid?: boolean;

  /**
   * Maximum options to render at once. Defaults to 50.
   *
   * Options beyond this limit are truncated in the visible listbox.
   * Consumers with large option sets supply a smaller `maxVisible` and
   * use the `search` emit to fetch narrower results.
   */
  maxVisible?: number;

  /**
   * Accessible name prefix for chip remove buttons in multi-select.
   *
   * Example: "Remove" (English) / "አስወግድ" (Amharic).
   *
   * When supplied, chips are removable; each chip's remove button has
   * an aria-label of `"${chipRemoveLabel} ${option.label}"`.
   *
   * When absent, chips are NOT removable via a button; users can still
   * remove them via Backspace in the empty input. See the response
   * preamble §"Design note — chip removal".
   */
  chipRemoveLabel?: string;

  /**
   * aria-describedby target id. Forwarded verbatim to the input.
   */
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  multiple: false,
  searchable: true,
  placeholder: undefined,
  disabled: false,
  invalid: false,
  maxVisible: 50,
  chipRemoveLabel: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: ComboboxValue): void;
  (event: 'search', query: string): void;
}>();

/**
 * Scoped slots.
 *
 * option  — custom option rendering. Receives { option, selected,
 *           highlighted }. Falls back to the option's label.
 * empty   — the no-results state. No scoped data. If not supplied, an
 *           empty listbox is rendered when there are no matches.
 */
defineSlots<{
  option(props: {
    option: ComboboxOption;
    selected: boolean;
    highlighted: boolean;
  }): unknown;
  empty(): unknown;
}>();

// -----------------------------------------------------------------------------
// Generated ids
// -----------------------------------------------------------------------------
const componentId = `mases-combobox-${++__masesComboboxIdCounter}`;
const listboxId = `${componentId}-listbox`;
function optionId(index: number): string {
  return `${componentId}-option-${index}`;
}

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const isOpen = ref(false);
const query = ref('');
const highlightedIndex = ref(-1);

/*
 * Development-time guard: multi-select without chipRemoveLabel means
 * chips are not removable via a button. Warn once.
 */
if (import.meta.env.DEV && props.multiple && !props.chipRemoveLabel) {
  __masesComboboxWarnOnce(
    'combobox:multi-no-chip-remove-label',
    '[Combobox] multiple=true without chipRemoveLabel. Chips will not ' +
      'render a remove button. Supply a translated verb (e.g., "Remove") ' +
      'to enable chip removal via button.',
  );
}

// -----------------------------------------------------------------------------
// Computed — selected values and options
// -----------------------------------------------------------------------------
const selectedValues = computed<Array<string | number>>(() => {
  const mv = props.modelValue;
  if (mv === null || mv === undefined) {
    return [];
  }
  if (Array.isArray(mv)) {
    return mv;
  }
  return [mv];
});

const selectedValuesSet = computed<Set<string>>(() => {
  return new Set(selectedValues.value.map(String));
});

const selectedOptions = computed<Array<ComboboxOption>>(() => {
  const set = selectedValuesSet.value;
  return props.options.filter((o) => set.has(String(o.value)));
});

const singleSelectedOption = computed<ComboboxOption | null>(() => {
  if (props.multiple) {
    return null;
  }
  return selectedOptions.value[0] ?? null;
});

function isSelected(option: ComboboxOption): boolean {
  return selectedValuesSet.value.has(String(option.value));
}

// -----------------------------------------------------------------------------
// Computed — filtered and visible options
// -----------------------------------------------------------------------------
const filteredOptions = computed<Array<ComboboxOption>>(() => {
  const q = query.value.trim().toLowerCase();
  if (q.length === 0) {
    return [...props.options];
  }
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

const visibleOptions = computed<Array<ComboboxOption>>(() =>
  filteredOptions.value.slice(0, props.maxVisible),
);

// -----------------------------------------------------------------------------
// Computed — input display
// -----------------------------------------------------------------------------
const inputDisplayValue = computed<string>(() => {
  // While the user has typed something, show the query.
  if (query.value.length > 0) {
    return query.value;
  }
  // In single-select with a selection, show the selected label so the
  // user sees what is currently chosen.
  if (!props.multiple && singleSelectedOption.value !== null) {
    return singleSelectedOption.value.label;
  }
  return '';
});

// -----------------------------------------------------------------------------
// Computed — ARIA
// -----------------------------------------------------------------------------
const highlightedOptionId = computed<string | undefined>(() => {
  if (!isOpen.value || highlightedIndex.value < 0) {
    return undefined;
  }
  return optionId(highlightedIndex.value);
});

const resolvedAriaInvalid = computed<boolean | undefined>(() => {
  return props.invalid ? true : undefined;
});

// -----------------------------------------------------------------------------
// Computed — classes and attributes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'combobox',
  {
    'combobox--open': isOpen.value,
    'combobox--disabled': props.disabled,
    'combobox--invalid': props.invalid,
    'combobox--multiple': props.multiple,
  },
]);

// -----------------------------------------------------------------------------
// Highlight helpers
// -----------------------------------------------------------------------------
function findFirstEnabledIndex(options: Array<ComboboxOption>): number {
  for (let i = 0; i < options.length; i++) {
    if (!options[i].disabled) {
      return i;
    }
  }
  return -1;
}

async function scrollHighlightedIntoView(): Promise<void> {
  await nextTick();
  if (!listboxRef.value || highlightedIndex.value < 0) {
    return;
  }
  const el = listboxRef.value.querySelector<HTMLElement>(
    '[data-highlighted="true"]',
  );
  el?.scrollIntoView({ block: 'nearest' });
}

// -----------------------------------------------------------------------------
// Open / close
// -----------------------------------------------------------------------------
function open(): void {
  if (props.disabled || isOpen.value) {
    return;
  }
  isOpen.value = true;
  // Highlight the first enabled option by default.
  highlightedIndex.value = findFirstEnabledIndex(visibleOptions.value);
}

function close(): void {
  if (!isOpen.value) {
    return;
  }
  isOpen.value = false;
  highlightedIndex.value = -1;
  query.value = '';
}

function _toggle(): void {
  if (isOpen.value) {
    close();
  } else {
    open();
  }
}

// -----------------------------------------------------------------------------
// Input handlers
// -----------------------------------------------------------------------------
function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  query.value = target.value;
  emit('search', target.value);
  if (!isOpen.value) {
    isOpen.value = true;
  }
  // Reset highlight to the first enabled option after a query change.
  highlightedIndex.value = findFirstEnabledIndex(visibleOptions.value);
}

function onFocus(): void {
  if (props.disabled) {
    return;
  }
  // In single-select, select all text so the user's first keystroke
  // replaces the selected label rather than appending to it.
  if (!props.multiple && inputRef.value !== null) {
    inputRef.value.select();
  }
  if (!isOpen.value) {
    open();
  }
}

// -----------------------------------------------------------------------------
// Keyboard
// -----------------------------------------------------------------------------
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) {
    return;
  }

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      if (!isOpen.value) {
        open();
        return;
      }
      moveHighlight(1);
      return;
    }
    case 'ArrowUp': {
      event.preventDefault();
      if (!isOpen.value) {
        open();
        return;
      }
      moveHighlight(-1);
      return;
    }
    case 'Home': {
      if (isOpen.value && visibleOptions.value.length > 0) {
        event.preventDefault();
        highlightedIndex.value = findFirstEnabledIndex(visibleOptions.value);
        void scrollHighlightedIntoView();
      }
      return;
    }
    case 'End': {
      if (isOpen.value && visibleOptions.value.length > 0) {
        event.preventDefault();
        highlightedIndex.value = findLastEnabledIndex(visibleOptions.value);
        void scrollHighlightedIntoView();
      }
      return;
    }
    case 'Enter': {
      if (isOpen.value && highlightedIndex.value >= 0) {
        event.preventDefault();
        const option = visibleOptions.value[highlightedIndex.value];
        if (option !== undefined && !option.disabled) {
          selectOption(option);
        }
      }
      return;
    }
    case 'Escape': {
      if (isOpen.value) {
        event.preventDefault();
        close();
      }
      return;
    }
    case 'Tab': {
      // Close the dropdown and let focus move naturally.
      if (isOpen.value) {
        close();
      }
      return;
    }
    case 'Backspace': {
      // Multi-select: Backspace in an empty input removes the last chip.
      if (
        props.multiple &&
        query.value.length === 0 &&
        selectedValues.value.length > 0
      ) {
        const lastValue =
          selectedValues.value[selectedValues.value.length - 1];
        removeSelected(lastValue);
      }
      return;
    }
    default:
      return;
  }
}

function moveHighlight(direction: 1 | -1): void {
  const options = visibleOptions.value;
  if (options.length === 0) {
    return;
  }
  let next = highlightedIndex.value;
  // If nothing is highlighted yet, start from the top (direction 1) or
  // bottom (direction -1).
  if (next < 0) {
    next = direction === 1 ? 0 : options.length - 1;
  } else {
    next = next + direction;
  }
  // Skip disabled options; wrap at the ends.
  let attempts = 0;
  while (attempts < options.length) {
    if (next < 0) {
      next = options.length - 1;
    } else if (next >= options.length) {
      next = 0;
    }
    if (!options[next].disabled) {
      highlightedIndex.value = next;
      void scrollHighlightedIntoView();
      return;
    }
    next += direction;
    attempts += 1;
  }
  // All options disabled: leave highlight where it is.
}

function findLastEnabledIndex(options: Array<ComboboxOption>): number {
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i].disabled) {
      return i;
    }
  }
  return -1;
}

// -----------------------------------------------------------------------------
// Selection
// -----------------------------------------------------------------------------
function selectOption(option: ComboboxOption): void {
  if (option.disabled) {
    return;
  }
  if (props.multiple) {
    const current = selectedValues.value.slice();
    const valueStr = String(option.value);
    const existingIndex = current.findIndex((v) => String(v) === valueStr);
    if (existingIndex >= 0) {
      // Toggle off: remove from the selection.
      current.splice(existingIndex, 1);
    } else {
      current.push(option.value);
    }
    emit('update:modelValue', current);
    // Multi-select keeps the dropdown open for further selection;
    // reset query so the full list is visible again.
    query.value = '';
    highlightedIndex.value = findFirstEnabledIndex(visibleOptions.value);
    // Keep focus in the input.
    inputRef.value?.focus();
  } else {
    // Single-select: replace the value and close.
    emit('update:modelValue', option.value);
    query.value = '';
    close();
    inputRef.value?.focus();
  }
}

function removeSelected(value: string | number): void {
  if (!props.multiple) {
    return;
  }
  const valueStr = String(value);
  const next = selectedValues.value.filter((v) => String(v) !== valueStr);
  emit('update:modelValue', next);
}

function chipRemoveAriaLabel(option: ComboboxOption): string {
  const prefix = props.chipRemoveLabel ?? '';
  return `${prefix} ${option.label}`.trim();
}

// -----------------------------------------------------------------------------
// Wrapper mousedown — focus the input when clicking padding
// -----------------------------------------------------------------------------
function onControlMousedown(event: MouseEvent): void {
  if (props.disabled) {
    return;
  }
  // Only handle clicks that target the control region itself, not its
  // children (chips, chip buttons, or the input).
  const target = event.target as HTMLElement;
  if (
    target === rootRef.value ||
    target.classList.contains('combobox__control')
  ) {
    event.preventDefault();
    inputRef.value?.focus();
    if (!isOpen.value) {
      open();
    }
  }
}

// -----------------------------------------------------------------------------
// Outside mousedown
// -----------------------------------------------------------------------------
function onDocumentMousedown(event: MouseEvent): void {
  if (!isOpen.value) {
    return;
  }
  if (rootRef.value === null) {
    return;
  }
  const target = event.target as Node | null;
  if (target !== null && rootRef.value.contains(target)) {
    return;
  }
  close();
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', onDocumentMousedown);
  } else {
    document.removeEventListener('mousedown', onDocumentMousedown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown);
});

// -----------------------------------------------------------------------------
// Watch query changes: reset highlight
// -----------------------------------------------------------------------------
watch(query, () => {
  if (isOpen.value) {
    highlightedIndex.value = findFirstEnabledIndex(visibleOptions.value);
  }
});

// -----------------------------------------------------------------------------
// Watch options prop (async search): reset highlight to a valid index
// -----------------------------------------------------------------------------
watch(
  () => props.options,
  () => {
    if (isOpen.value && highlightedIndex.value >= visibleOptions.value.length) {
      highlightedIndex.value = findFirstEnabledIndex(visibleOptions.value);
    }
  },
);

void _toggle;
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :data-open="isOpen ? 'true' : undefined"
    :data-invalid="invalid ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    :data-multiple="multiple ? 'true' : undefined"
    :data-searchable="searchable ? undefined : 'false'"
    data-testid="combobox-root"
  >
    <!-- ==================================================================
         CONTROL — the visual input box
         ================================================================== -->
    <div
      class="combobox__control"
      data-testid="combobox-control"
      @mousedown="onControlMousedown"
    >
      <!--
        Multi-select: chips for each selected option, rendered inline
        before the input. The `chip` slot allows consumers to override
        the default chip rendering.
      -->
      <template v-if="multiple && selectedOptions.length > 0">
        <BaseChip
          v-for="option in selectedOptions"
          :key="option.value"
          :removable="chipRemoveLabel !== undefined"
          :remove-aria-label="
            chipRemoveLabel !== undefined
              ? chipRemoveAriaLabel(option)
              : undefined
          "
          class="combobox__chip"
          data-testid="combobox-chip"
          @remove="removeSelected(option.value)"
        >
          {{ option.label }}
        </BaseChip>
      </template>

      <!--
        The native input.
      -->
      <input
        ref="inputRef"
        type="text"
        role="combobox"
        :id="`${componentId}-input`"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="listboxId"
        :aria-activedescendant="highlightedOptionId"
        :aria-autocomplete="searchable ? 'list' : 'none'"
        :aria-multiselectable="multiple ? 'true' : undefined"
        :aria-invalid="resolvedAriaInvalid"
        :aria-describedby="ariaDescribedBy"
        :disabled="disabled"
        :readonly="!searchable"
        :placeholder="placeholder"
        :value="inputDisplayValue"
        class="combobox__input"
        data-testid="combobox-input"
        autocomplete="off"
        spellcheck="false"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
      />

      <!--
        Chevron indicator.
        Decorative; indicates a dropdown is associated with the input.
      -->
      <span
        class="combobox__indicator"
        aria-hidden="true"
        data-testid="combobox-indicator"
      >
        <BaseIcon name="chevron-down" size="sm" />
      </span>
    </div>

    <!-- ==================================================================
         LISTBOX — the popup
         ================================================================== -->
    <ul
      v-if="isOpen && (visibleOptions.length > 0 || $slots.empty)"
      ref="listboxRef"
      :id="listboxId"
      role="listbox"
      :aria-multiselectable="multiple ? 'true' : undefined"
      class="combobox__listbox"
      data-testid="combobox-listbox"
      @mousedown.prevent
    >
      <li
        v-for="(option, index) in visibleOptions"
        :id="optionId(index)"
        :key="option.value"
        role="option"
        :aria-selected="isSelected(option) ? 'true' : 'false'"
        :aria-disabled="option.disabled ? 'true' : undefined"
        :data-highlighted="index === highlightedIndex ? 'true' : undefined"
        :data-selected="isSelected(option) ? 'true' : undefined"
        :data-disabled="option.disabled ? 'true' : undefined"
        class="combobox__option"
        data-testid="combobox-option"
        @click="selectOption(option)"
        @mousemove="
          !option.disabled && (highlightedIndex = index)
        "
      >
        <slot
          name="option"
          :option="option"
          :selected="isSelected(option)"
          :highlighted="index === highlightedIndex"
        >
          {{ option.label }}
        </slot>
      </li>

      <li
        v-if="visibleOptions.length === 0"
        class="combobox__empty"
        data-testid="combobox-empty"
      >
        <slot name="empty" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.combobox {
  position: relative;
  display: block;
  width: 100%;
}

/* ============================================================================
   Control — the bordered input box
   ============================================================================ */
.combobox__control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mases-space-1);
  width: 100%;
  min-height: 40px;
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-2);
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  cursor: text;
  transition:
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Focus ring on the control when the input inside is focus-visible. */
.combobox__control:has(.combobox__input:focus-visible) {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Hover border — not disabled, not readonly. */
.combobox:not(.combobox--disabled):hover .combobox__control {
  border-color: var(--mases-color-border-strong);
}

/* Invalid state. */
.combobox--invalid .combobox__control {
  border-color: var(--mases-color-border-danger);
}

/* Disabled state. */
.combobox--disabled .combobox__control {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Chips (multi-select)
   ============================================================================ */
.combobox__chip {
  /* Prevent chips from being compressed below their intrinsic width. */
  flex-shrink: 0;
  /* Reserve a small right margin so chips do not touch the input's caret
     when the input is empty. The gap on the parent already provides 4px;
     no additional margin needed. */
}

/* ============================================================================
   Input
   ============================================================================ */
.combobox__input {
  flex: 1 1 auto;
  /* A minimal width prevents the input from collapsing to zero when the
     control is narrower than the chip row. */
  min-width: 4rem;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  /*
   * Trim the input's vertical box so that chips, input, and chevron all
   * share the same baseline. The control's own padding-block provides
   * the vertical rhythm.
   */
  align-self: center;
}

.combobox__input::placeholder {
  color: var(--mases-color-text-tertiary);
  opacity: 1;
}

.combobox__input:disabled {
  cursor: not-allowed;
}

/* ============================================================================
   Chevron indicator
   ============================================================================ */
.combobox__indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--mases-color-icon-secondary);
  /* Rotate the chevron when the dropdown is open (subtle affordance). */
  transition: transform var(--mases-duration-fast) var(--mases-easing-standard);
}

.combobox--open .combobox__indicator {
  transform: rotate(180deg);
}

.combobox--disabled .combobox__indicator {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Listbox
   ============================================================================ */
.combobox__listbox {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: var(--mases-z-dropdown);
  margin: var(--mases-space-1) 0 0 0;
  padding: var(--mases-space-1) 0;
  list-style: none;
  background-color: var(--mases-color-surface-overlay);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  box-shadow: var(--mases-shadow-elevation-2);
  max-height: 18rem;
  overflow-y: auto;
  /*
   * Entrance transition — a subtle opacity fade.
   * Reduced-motion makes this effectively instant.
   */
  opacity: 1;
  transition: opacity var(--mases-duration-fast) var(--mases-easing-standard);
}

/* ============================================================================
   Option
   ============================================================================ */
.combobox__option {
  display: flex;
  align-items: center;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  cursor: pointer;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.combobox__option[data-highlighted='true'] {
  background-color: var(--mases-color-state-hover);
}

.combobox__option[data-selected='true'] {
  background-color: var(--mases-color-state-selected);
  color: var(--mases-color-text-brand);
  font-weight: var(--mases-font-weight-medium);
}

.combobox__option[data-selected='true'][data-highlighted='true'] {
  background-color: var(--mases-color-state-selected);
}

.combobox__option[data-disabled='true'] {
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Empty state
   ============================================================================ */
.combobox__empty {
  display: block;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-style: normal;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .combobox__control {
    min-height: 44px;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .combobox__indicator {
    transition-duration: 1ms;
  }

  .combobox__listbox {
    transition-duration: 1ms;
  }
}
</style>