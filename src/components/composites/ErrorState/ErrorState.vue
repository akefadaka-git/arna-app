<!--
=============================================================================
 MASES Phase 2 UI — ErrorState
=============================================================================

 File:      mase_app/src/components/composites/ErrorState/ErrorState.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.22
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 An inline error presentation for a region. Replaces a region's content
 when a load or action failed; offers an optional retry action and an
 optional expandable details section.

 Distinct from Alert, EmptyState, and ErrorPage — see the response
 preamble §"Design note — ErrorState versus Alert, EmptyState, and
 ErrorPage".

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 Composes BaseIcon (variant-default icon) and PrimaryButton (action).
 Does not reimplement either.

 -----------------------------------------------------------------------------
 Icon resolution — see the response preamble
 -----------------------------------------------------------------------------
 Three cases: undefined (variant default), non-empty string (override),
 empty string (suppressed).

 -----------------------------------------------------------------------------
 The details slot and the detailsLabel prop — see the response preamble
 -----------------------------------------------------------------------------
 Native <details>/<summary> disclosure. When the consumer supplies the
 slot AND a non-empty detailsLabel, the disclosure renders. When the
 slot is supplied without detailsLabel, the content renders directly
 and a deduplicated dev warning fires.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - title, description, actionLabel, detailsLabel (all consumer-
     supplied, translated);
   - the details slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, text
 alignment, border width, readability max-widths).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-state-root"            on the wrapper <div>
 data-testid="error-state-icon"            on the BaseIcon
                                           (rendered only when the icon
                                           region is not suppressed)
 data-testid="error-state-title"           on the title <p>
 data-testid="error-state-description"     on the description <p>
                                           (rendered only when
                                           description is supplied)
 data-testid="error-state-action"          on the action region <div>
                                           (rendered only when an
                                           action is present)
 data-testid="error-state-action-button"   on the retry button
 data-testid="error-state-details"         on the <details> wrapper
                                           (rendered only when the
                                           slot is supplied AND
                                           detailsLabel has content)
 data-testid="error-state-details-summary" on the <summary>
 data-testid="error-state-details-body"    on the details body <div>
                                           (rendered when the slot is
                                           supplied; inside <details>
                                           when the label is present,
                                           standalone otherwise)

 The wrapper carries:
   data-variant="danger" | "warning"
   role="alert"   (when variant is danger)
   role="status"  (when variant is warning)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT (per the catalog):

   - Live region on the wrapper:
       danger   →  role="alert"   (assertive)
       warning  →  role="status"  (polite)
     The mapping mirrors the Alert composite (Unit 9.12). A consumer
     must mount the ErrorState when the failure occurs (via v-if or a
     conditional render) for the live region to announce correctly.
   - The icon is decorative (BaseIcon's default aria-hidden); the title
     and description carry the meaning.
   - The title is rendered as a <p> with the heading-4 type scale, NOT
     as an <h*>. Same rationale as EmptyState (Unit 9.20) — an inline
     region-replacement state should not pollute the document outline.
   - The action button inherits PrimaryButton's accessibility contract
     (native <button>, focus ring, disabled behavior).
   - The <details>/<summary> disclosure is keyboard-operable via native
     browser behavior. The summary text is the accessible name.
   - Reduced motion: no animation in this component. The <details>
     open/close uses the browser's native disclosure behavior.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */
export type ErrorStateVariant = 'danger' | 'warning';

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesErrorStateWarned = new Set<string>();

function __masesErrorStateWarnOnce(key: string, message: string): void {
  if (__masesErrorStateWarned.has(key)) {
    return;
  }
  __masesErrorStateWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/**
 * Variant → default icon mapping.
 *
 * Frozen by this unit. The mapping is identical to the Alert composite
 * (Unit 9.12) so that the same error semantic renders with the same
 * glyph across the two components.
 */
const DEFAULT_ICON_BY_VARIANT = {
  danger: 'alert-circle',
  warning: 'alert-triangle',
} as const;
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';
import PrimaryButton from '../../primitives/PrimaryButton';

interface Props {
  /**
   * The error's semantic variant. Defaults to 'danger'.
   *
   *   'danger'   →  role="alert"   + danger palette + alert-circle icon
   *   'warning'  →  role="status"  + warning palette + alert-triangle icon
   *
   * See the file header comment §"Accessibility".
   */
  variant?: ErrorStateVariant;

  /**
   * Title text. Required. A translated string.
   *
   * Rendered as a <p> with the heading-4 type scale. An empty string
   * suppresses the title element entirely.
   */
  title: string;

  /**
   * Optional description. A translated string.
   *
   * An empty string suppresses the description element.
   */
  description?: string;

  /**
   * Optional icon override.
   *
   *   undefined     → the variant's default icon (see the response
   *                    preamble §"Icon resolution")
   *   ''            → suppress the icon (no visual)
   *   any string    → use the provided icon name
   *
   * The string is passed to BaseIcon; an unregistered name triggers
   * BaseIcon's own deduplicated dev warning.
   */
  icon?: string;

  /**
   * Label for the retry action button. A translated string.
   *
   * An empty string (or absence) suppresses the action button.
   */
  actionLabel?: string;

  /**
   * Label for the details disclosure's <summary>.
   *
   * Required when the `details` slot is supplied. See the response
   * preamble §"Design note — the details slot and the added detailsLabel
   * prop".
   */
  detailsLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'danger',
  description: undefined,
  icon: undefined,
  actionLabel: undefined,
  detailsLabel: undefined,
});

const emit = defineEmits<{
  (event: 'action'): void;
}>();

/**
 * Slots.
 *
 * details — the expandable content of the <details> disclosure.
 *           Unscoped; the consumer supplies arbitrary content
 *           (request ID, recovery instructions, redacted stack trace).
 */
defineSlots<{
  details(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Slot detection
// -----------------------------------------------------------------------------
const hasDetailsSlot = computed<boolean>(() => slots.details !== undefined);

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: details slot supplied without detailsLabel.
 */
if (
  import.meta.env.DEV &&
  hasDetailsSlot.value &&
  (props.detailsLabel === undefined || props.detailsLabel.trim() === '')
) {
  __masesErrorStateWarnOnce(
    'error-state:missing-details-label',
    '[ErrorState] the `details` slot is supplied but `detailsLabel` is ' +
      'empty or missing. The details content will render without the ' +
      '<details> disclosure wrapper (no toggle, always visible). ' +
      'Supply a translated string such as "Technical details" to ' +
      'enable the disclosure.',
  );
}

// -----------------------------------------------------------------------------
// Computed — title and description
// -----------------------------------------------------------------------------
const hasTitle = computed<boolean>(() => props.title.trim().length > 0);

const hasDescription = computed<boolean>(() => {
  const d = props.description;
  return d !== undefined && d.trim().length > 0;
});

// -----------------------------------------------------------------------------
// Computed — icon resolution
// -----------------------------------------------------------------------------
/**
 * Whether the icon region renders at all.
 *
 * False when `icon` is the empty string (explicit suppression).
 */
const showIcon = computed<boolean>(() => props.icon !== '');

/**
 * The icon name to render.
 *
 * Resolution:
 *   - non-empty `icon` string        → that name
 *   - empty/undefined `icon` string  → the variant's default
 */
const resolvedIconName = computed<IconName>(() => {
  const i = props.icon;
  if (i !== undefined && i !== '') {
    return i as IconName;
  }
  return DEFAULT_ICON_BY_VARIANT[props.variant] as IconName;
});

// -----------------------------------------------------------------------------
// Computed — action
// -----------------------------------------------------------------------------
const actionLabelTrimmed = computed<string>(
  () => props.actionLabel?.trim() ?? '',
);

const showAction = computed<boolean>(
  () => actionLabelTrimmed.value.length > 0,
);

// -----------------------------------------------------------------------------
// Computed — details
// -----------------------------------------------------------------------------
const detailsLabelTrimmed = computed<string>(
  () => props.detailsLabel?.trim() ?? '',
);

/**
 * Whether the details region renders at all.
 */
const showDetails = computed<boolean>(() => hasDetailsSlot.value);

/**
 * Whether the details region renders as a native <details> disclosure.
 *
 * True when the slot is supplied AND detailsLabel has content.
 * Otherwise the details content renders directly (no toggle).
 * See the response preamble.
 */
const renderDetailsAsDisclosure = computed<boolean>(
  () => hasDetailsSlot.value && detailsLabelTrimmed.value.length > 0,
);

// -----------------------------------------------------------------------------
// Computed — ARIA and classes
// -----------------------------------------------------------------------------
const role = computed<'alert' | 'status'>(() =>
  props.variant === 'danger' ? 'alert' : 'status',
);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'error-state',
  `error-state--${props.variant}`,
]);

// -----------------------------------------------------------------------------
// Emit
// -----------------------------------------------------------------------------
function onActionClick(): void {
  emit('action');
}
</script>

<template>
  <div
    :role="role"
    :class="classes"
    :data-variant="variant"
    data-testid="error-state-root"
  >
    <!-- ============================================================
         Icon
         ============================================================ -->
    <span
      v-if="showIcon"
      class="error-state__icon"
      aria-hidden="true"
    >
      <BaseIcon
        :name="resolvedIconName"
        size="2xl"
        data-testid="error-state-icon"
      />
    </span>

    <!-- ============================================================
         Title
         ============================================================ -->
    <p
      v-if="hasTitle"
      class="error-state__title"
      data-testid="error-state-title"
    >{{ title }}</p>

    <!-- ============================================================
         Description
         ============================================================ -->
    <p
      v-if="hasDescription"
      class="error-state__description"
      data-testid="error-state-description"
    >{{ description }}</p>

    <!-- ============================================================
         Action
         ============================================================ -->
    <div
      v-if="showAction"
      class="error-state__action"
      data-testid="error-state-action"
    >
      <PrimaryButton
        data-testid="error-state-action-button"
        @click="onActionClick"
      >
        {{ actionLabelTrimmed }}
      </PrimaryButton>
    </div>

    <!-- ============================================================
         Details — native disclosure when the label is present
         ============================================================ -->
    <details
      v-if="showDetails && renderDetailsAsDisclosure"
      class="error-state__details"
      data-testid="error-state-details"
    >
      <summary
        class="error-state__details-summary"
        data-testid="error-state-details-summary"
      >{{ detailsLabelTrimmed }}</summary>

      <div
        class="error-state__details-body"
        data-testid="error-state-details-body"
      >
        <slot name="details" />
      </div>
    </details>

    <!-- ============================================================
         Details — fallback (no label; content always visible)
         ============================================================ -->
    <div
      v-else-if="showDetails"
      class="error-state__details-body error-state__details-body--standalone"
      data-testid="error-state-details-body"
    >
      <slot name="details" />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-2);
  width: 100%;
  padding-block: var(--mases-space-10);
  padding-inline: var(--mases-space-6);
  border: 1px solid transparent;
  border-radius: var(--mases-radius-md);
  text-align: center;
  font-family: inherit;
}

/* ============================================================================
   Variants — same surface + border + text triples as Alert (Unit 9.12)
   ============================================================================ */
.error-state--danger {
  background-color: var(--mases-color-surface-danger);
  border-color: var(--mases-color-border-danger);
  color: var(--mases-color-text-danger);
}

.error-state--warning {
  background-color: var(--mases-color-surface-warning);
  border-color: var(--mases-color-border-warning);
  color: var(--mases-color-text-warning);
}

/* ============================================================================
   Icon
   ============================================================================ */
.error-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-block-end: var(--mases-space-4);
  /* Inherits the variant's text color via currentColor. */
  color: currentColor;
}

/* ============================================================================
   Title
   ============================================================================ */
.error-state__title {
  margin: 0;
  max-width: 32em;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-4);
  line-height: var(--mases-line-height-heading-4);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Description
   ============================================================================ */
.error-state__description {
  margin: 0;
  max-width: 40em;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Action
   ============================================================================ */
.error-state__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  margin-block-start: var(--mases-space-4);
}

/* ============================================================================
   Details — <details> disclosure
   ============================================================================ */
.error-state__details {
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

.error-state__details-summary {
  cursor: pointer;
  padding-block: var(--mases-space-1);
  color: inherit;
  font-weight: var(--mases-font-weight-medium);
  /*
   * The browser's default disclosure triangle is retained (browser
   * native, accessible, no JS). Customising it is deferred to a future
   * CR; the design system does not declare a marker glyph for
   * disclosures.
   */
}

.error-state__details-summary:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Details — body
   ============================================================================ */
.error-state__details-body {
  margin-block-start: var(--mases-space-2);
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  background-color: var(--mases-color-surface-overlay);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-text-secondary);
  /*
   * Content is consumer-supplied. Long content (a stack trace, a
   * request id) may exceed the width; a scroll on overflow is the
   * safe default. Amharic truncation rules apply to inline text
   * through the design system's inherited overflow-wrap rules.
   */
  overflow-wrap: anywhere;
}

/* The standalone (no-disclosure) body uses the same visual; the
   modifying class exists only for the standalone layout's spacing
   adjustment. */
.error-state__details-body--standalone {
  width: 100%;
  max-width: 40em;
  margin-block-start: var(--mases-space-4);
  text-align: start;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .error-state {
    padding-block: var(--mases-space-8);
    padding-inline: var(--mases-space-4);
  }

  /* Stretch the action to full-width on mobile, matching EmptyState
     (Unit 9.20). Scoped to the default button via its test hook so
     the region's layout does not affect consumer-supplied content. */
  .error-state__action {
    align-self: stretch;
  }

  .error-state__action :deep([data-testid='error-state-action-button']) {
    width: 100%;
  }
}
</style>