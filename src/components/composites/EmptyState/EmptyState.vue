<!--
=============================================================================
 MASES Phase 2 UI — EmptyState
=============================================================================

 File:      mase_app/src/components/composites/EmptyState/EmptyState.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.21
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A standard empty presentation for a region. Renders a centered layout
 of (optional icon) + title + description + (optional action). Two
 slots allow the consumer to override the visual and the action
 entirely.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 EmptyState COMPOSES BaseIcon and one of the three button primitives
 (PrimaryButton / SecondaryButton / GhostButton). It does not
 reimplement any of them.

 -----------------------------------------------------------------------------
 The icon and the illustration slot — see the response preamble
 -----------------------------------------------------------------------------
 Two mutually exclusive render paths for the visual:

   icon prop supplied, no illustration slot   → BaseIcon at 2xl (48px)
   illustration slot supplied                 → the slot's content
   neither supplied                           → no visual

 When both are supplied, the slot wins and a deduplicated dev warning
 fires once per module load.

 -----------------------------------------------------------------------------
 The action and the action slot — see the response preamble
 -----------------------------------------------------------------------------
 Two mutually exclusive render paths for the action:

   actionLabel supplied, no action slot       → a button primitive
                                                selected by actionVariant
   action slot supplied                       → the slot's content
   neither supplied                           → no action

 When both are supplied, the slot wins and a deduplicated dev warning
 fires once per module load.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied, translated);
   - `description` (consumer-supplied, translated);
   - `actionLabel` (consumer-supplied, translated);
   - the illustration and action slots (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, text
 alignment, max-width readability bound).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="empty-state-root"          on the wrapper <div>
 data-testid="empty-state-visual"        on the visual wrapper <div>
                                         (rendered only when the
                                         visual region is present)
 data-testid="empty-state-icon"          on the default BaseIcon
                                         (rendered only when icon is
                                         used, not the slot)
 data-testid="empty-state-title"         on the title <p>
 data-testid="empty-state-description"   on the description <p>
                                         (rendered only when
                                         description is supplied)
 data-testid="empty-state-action"        on the action region <div>
                                         (rendered only when there is
                                         an action)
 data-testid="empty-state-action-button" on the default action button
                                         (rendered only when the
                                         action is a button, not the
                                         slot)

 The wrapper carries:
   data-action-variant="primary" | "secondary" | "ghost"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a <div> with no landmark role; the surrounding page
     provides the semantic context (section, main, card).
   - The visual (BaseIcon or slot) is decorative: BaseIcon renders
     aria-hidden by default; the illustration slot's content is the
     consumer's responsibility (they should mark decorative content
     aria-hidden).
   - The title uses the heading-4 type scale but is rendered as a <p>,
     not a heading element. This is deliberate: empty states often
     appear inside cards or table bodies where introducing a heading
     would pollute the document outline. Consumers that need a heading
     supply their own and use the description-only mode with an empty
     title.
   - The description is plain text.
   - The action button (default) is a native <button> from the button
     primitives and inherits their accessibility contract.
   - No focus is moved by the component.
   - No color-only state; there are no states.
   - Reduced motion: no animation in this component.
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
 * The visual variant of the default action button.
 */
export type EmptyStateActionVariant = 'primary' | 'secondary' | 'ghost';

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesEmptyStateWarned = new Set<string>();

function __masesEmptyStateWarnOnce(key: string, message: string): void {
  if (__masesEmptyStateWarned.has(key)) {
    return;
  }
  __masesEmptyStateWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';
import PrimaryButton from '../../primitives/PrimaryButton';
import SecondaryButton from '../../primitives/SecondaryButton';
import GhostButton from '../../primitives/GhostButton';

interface Props {
  /**
   * Title text. Required. A translated string.
   *
   * Rendered as a <p> with the heading-4 type scale (see the file
   * header comment §"Accessibility"). The component does not fabricate
   * a default; a consumer that wants no title passes an empty string
   * and only the description renders.
   *
   * An empty string suppresses the title element entirely.
   */
  title: string;

  /**
   * Optional descriptive paragraph. A translated string.
   *
   * Empty string suppresses the description element.
   */
  description?: string;

  /**
   * Lucide icon name. Rendered at size 2xl (48px) when no illustration
   * slot is supplied. See the response preamble §"Design note — the
   * icon prop and the illustration slot".
   */
  icon?: string;

  /**
   * Label for the default action button. A translated string.
   *
   * Empty string (or absence) suppresses the default action button.
   * Consumers who want an action supplied via the `action` slot
   * leave this prop unset.
   */
  actionLabel?: string;

  /**
   * Visual variant of the default action button. Defaults to
   * 'primary'. See the response preamble §"Design note — the
   * actionVariant mapping and the default".
   */
  actionVariant?: EmptyStateActionVariant;
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  icon: undefined,
  actionLabel: undefined,
  actionVariant: 'primary',
});

const emit = defineEmits<{
  (event: 'action'): void;
}>();

/**
 * Slots.
 *
 * illustration — replaces the default icon.
 * action       — replaces the default action button.
 *
 * Both are unscoped. See the file header comment for the override rules.
 */
defineSlots<{
  illustration(): unknown;
  action(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Slot detection
// -----------------------------------------------------------------------------
const hasIllustrationSlot = computed<boolean>(
  () => slots.illustration !== undefined,
);
const hasActionSlot = computed<boolean>(() => slots.action !== undefined);

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: both `icon` and the `illustration` slot supplied.
 */
if (import.meta.env.DEV && props.icon !== undefined && hasIllustrationSlot.value) {
  __masesEmptyStateWarnOnce(
    'empty-state:icon-and-illustration',
    '[EmptyState] both `icon` and the `illustration` slot are supplied. ' +
      'The slot takes precedence; `icon` is ignored. Supply only one.',
  );
}

/**
 * Guard: both `actionLabel` and the `action` slot supplied.
 */
if (
  import.meta.env.DEV &&
  props.actionLabel !== undefined &&
  props.actionLabel.trim() !== '' &&
  hasActionSlot.value
) {
  __masesEmptyStateWarnOnce(
    'empty-state:action-label-and-slot',
    '[EmptyState] both `actionLabel` and the `action` slot are ' +
      'supplied. The slot takes precedence; the default button is not ' +
      'rendered. Supply only one.',
  );
}

// -----------------------------------------------------------------------------
// Icon resolution
// -----------------------------------------------------------------------------
/**
 * The icon name passed to BaseIcon.
 *
 * The prop is typed as `string` (not `IconName`) so consumers can
 * populate it from arbitrary data. BaseIcon performs the runtime check
 * and emits a dev warning for unregistered names.
 */
const iconName = computed<IconName>(() => props.icon as IconName);

/**
 * Whether the default icon renders.
 *
 * Renders only when the `icon` prop is supplied AND the `illustration`
 * slot is NOT supplied. See the file header comment.
 */
const showDefaultIcon = computed<boolean>(() => {
  if (hasIllustrationSlot.value) return false;
  if (props.icon === undefined) return false;
  return props.icon.trim() !== '';
});

/**
 * Whether the visual region renders at all (either the default icon or
 * the illustration slot).
 */
const showVisual = computed<boolean>(
  () => showDefaultIcon.value || hasIllustrationSlot.value,
);

// -----------------------------------------------------------------------------
// Text resolution
// -----------------------------------------------------------------------------
const hasTitle = computed<boolean>(() => props.title.trim().length > 0);

const hasDescription = computed<boolean>(() => {
  const d = props.description;
  return d !== undefined && d.trim().length > 0;
});

// -----------------------------------------------------------------------------
// Action resolution
// -----------------------------------------------------------------------------
/**
 * Whether the default action button renders.
 *
 * Renders only when `actionLabel` has content AND the `action` slot is
 * NOT supplied.
 */
const showDefaultActionButton = computed<boolean>(() => {
  if (hasActionSlot.value) return false;
  const l = props.actionLabel;
  return l !== undefined && l.trim().length > 0;
});

/**
 * Whether the action region renders at all.
 */
const showAction = computed<boolean>(
  () => showDefaultActionButton.value || hasActionSlot.value,
);

const actionLabelTrimmed = computed<string>(
  () => props.actionLabel?.trim() ?? '',
);

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------
const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'empty-state',
  {
    'empty-state--has-visual': showVisual.value,
  },
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
    :class="classes"
    :data-action-variant="actionVariant"
    data-testid="empty-state-root"
  >
    <!-- ============================================================
         Visual region
         ============================================================ -->
    <div
      v-if="showVisual"
      class="empty-state__visual"
      data-testid="empty-state-visual"
    >
      <!--
        Default icon.
        Rendered only when the icon prop is supplied AND the
        illustration slot is NOT supplied. The icon is decorative
        (aria-hidden via BaseIcon default).
      -->
      <BaseIcon
        v-if="showDefaultIcon"
        :name="iconName"
        size="2xl"
        data-testid="empty-state-icon"
      />

      <!--
        Illustration slot.
        Replaces the default icon entirely.
      -->
      <slot
        v-if="hasIllustrationSlot"
        name="illustration"
      />
    </div>

    <!-- ============================================================
         Text region
         ============================================================ -->
    <p
      v-if="hasTitle"
      class="empty-state__title"
      data-testid="empty-state-title"
    >{{ title }}</p>

    <p
      v-if="hasDescription"
      class="empty-state__description"
      data-testid="empty-state-description"
    >{{ description }}</p>

    <!-- ============================================================
         Action region
         ============================================================ -->
    <div
      v-if="showAction"
      class="empty-state__action"
      data-testid="empty-state-action"
    >
      <!--
        Default action button.
        The variant selects the button primitive; all three accept the
        same props and emit `click` identically.
      -->
      <PrimaryButton
        v-if="showDefaultActionButton && actionVariant === 'primary'"
        data-testid="empty-state-action-button"
        @click="onActionClick"
      >
        {{ actionLabelTrimmed }}
      </PrimaryButton>

      <SecondaryButton
        v-else-if="showDefaultActionButton && actionVariant === 'secondary'"
        data-testid="empty-state-action-button"
        @click="onActionClick"
      >
        {{ actionLabelTrimmed }}
      </SecondaryButton>

      <GhostButton
        v-else-if="showDefaultActionButton"
        data-testid="empty-state-action-button"
        @click="onActionClick"
      >
        {{ actionLabelTrimmed }}
      </GhostButton>

      <!--
        Action slot.
        Replaces the default button entirely.
      -->
      <slot
        v-if="hasActionSlot"
        name="action"
      />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-2);
  width: 100%;
  padding-block: var(--mases-space-8);
  padding-inline: var(--mases-space-6);
  text-align: center;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
}

/* Larger top padding when a visual is present so the visual reads as
   a distinct hero region rather than floating at the top edge. */
.empty-state--has-visual {
  padding-block-start: var(--mases-space-10);
}

/* ============================================================================
   Visual
   ============================================================================ */
.empty-state__visual {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mases-color-icon-secondary);
  /*
   * Bottom margin separates the visual from the title. Uses space-4
   * (16px) so it does not compete with the root's gap for rhythm; the
   * larger visual-to-text spacing is intentional.
   */
  margin-block-end: var(--mases-space-4);
}

/* ============================================================================
   Title
   ============================================================================ */
.empty-state__title {
  margin: 0;
  max-width: 32em;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-4);
  line-height: var(--mases-line-height-heading-4);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic truncates at word boundaries via the design system's
   * inherited overflow-wrap rules (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Description
   ============================================================================ */
.empty-state__description {
  margin: 0;
  /*
   * Wider cap than the title because a description often contains a
   * sentence or two and benefits from a longer measure; 40em is a
   * readability bound, not a design value.
   */
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
.empty-state__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  /*
   * Extra top margin separates the action from the text above it.
   * space-4 (16px) reads as a deliberate break without overwhelming
   * the tight rhythm of the text region.
   */
  margin-block-start: var(--mases-space-4);
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .empty-state {
    padding-block: var(--mases-space-6);
    padding-inline: var(--mases-space-4);
  }

  .empty-state--has-visual {
    padding-block-start: var(--mases-space-8);
  }

  /*
   * Stretch the action region horizontally and let the default button
   * fill it. Consumers who supply their own action via the slot
   * control their own layout; the wrapping <div class="...action">
   * remains a flex container, but the slot's content is not
   * automatically stretched (that is the consumer's choice).
   */
  .empty-state__action {
    align-self: stretch;
    flex-direction: column;
  }

  /*
   * Scope the stretch to the default button primitive wrapper.
   * The button primitives render a single <button> root; targeting
   * that root via the specific data-testid makes the stretch precise
   * and avoids affecting consumer-supplied content.
   */
  .empty-state__action :deep([data-testid='empty-state-action-button']) {
    width: 100%;
  }
}
</style>