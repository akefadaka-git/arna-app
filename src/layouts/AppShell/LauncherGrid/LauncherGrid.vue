<!--
=============================================================================
 MASES Phase 2 UI — LauncherGrid
=============================================================================

 File:      mase_app/src/layouts/AppShell/LauncherGrid/LauncherGrid.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §7.3, §9.1–§9.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §13.2, §15.1, §20.1, §22

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The launcher surface. Renders the authenticated user's accessible
 applications as a responsive grid of LauncherTiles (Unit 11.18).
 Handles the four data states: loading, error, empty, ready.

 Reads the applications list from @/stores/launcher (Unit 11.7). Takes
 loading and error as props — the store does not own those (see the
 response preamble §"Design note — why loading/error are props").

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   LauncherTile (Unit 11.18) — the per-application tile
   LoadingState (Unit  9.19) — the loading affordance
   EmptyState   (Unit  9.20) — the empty affordance
   ErrorState   (Unit  9.21) — the error affordance with retry

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 State precedence (loading > error > empty > ready)
 -----------------------------------------------------------------------------
 See the response preamble §"Design note — state precedence".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every string is consumer-supplied via `labels` (or via the composed
 state components' own labels, forwarded from `labels`). The component
 fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, grid, gap via tokens,
 auto-fill / minmax expressions, and the 280px grid minimum documented
 in the CSS comment).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="launcher-grid-root"    on the root <div>
 data-testid="launcher-grid-grid"    on the <ul> grid (rendered only
                                     when state is 'ready')
 data-testid="launcher-grid-item"    on each <li> in the grid

 The root carries:
   data-state="loading|error|empty|ready"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - The grid is a semantic <ul>, with each tile as an <li>. This is
     the correct structure for a list of destinations and gives screen
     readers a meaningful list length announcement.
   - The composed state components carry their own semantics:
       LoadingState — role="status"
       ErrorState   — role="alert"
       EmptyState   — plain panel (deterministic state)
   - Retry is emitted, not performed. The consumer (shell) refetches.
   - Reduced motion: no animation is defined in this file. The
     composed state components own their own motion contracts.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { IconName } from '@/components/primitives/BaseIcon';

/**
 * The data state of the launcher surface.
 */
export type LauncherGridState = 'loading' | 'error' | 'empty' | 'ready';

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the grid (and its composed state
 * components) comes from this object.
 */
export interface LauncherGridLabels {
  /** Loading affordance message. */
  readonly loadingMessage: string;

  /** Empty-state title. */
  readonly emptyTitle: string;

  /** Empty-state description. */
  readonly emptyDescription: string;

  /** Error-state message. */
  readonly errorMessage: string;

  /** Error-state retry button label. */
  readonly errorRetryLabel: string;
}

export type { IconName };
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useLauncherStore } from '@/stores/launcher';
import LauncherTile from '@/layouts/AppShell/LauncherTile';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

interface Props {
  /**
   * Whether a fetch is currently in flight. Supplied by the consumer's
   * useApiRequest. Not read from the launcher store — see the file
   * header comment §"Reads the applications list from ...".
   */
  loading?: boolean;

  /**
   * The most recent fetch error, or null/undefined when the last fetch
   * succeeded. Supplied by the consumer's useApiRequest.
   */
  error?: unknown;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LauncherGridLabels;

  /**
   * An optional per-application icon resolver. When supplied, the grid
   * calls it once per tile and forwards the result to LauncherTile.
   * When omitted, every tile uses LauncherTile's default glyph. See
   * the response preamble §"Design note — icon mapping is a prop".
   */
  iconForSlug?: (slug: string) => IconName;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: undefined,
  iconForSlug: undefined,
});

const emit = defineEmits<{
  /**
   * Fires when the user activates the retry action in the error state.
   * The consumer (shell) refetches and updates loading/error in
   * response.
   */
  (event: 'retry'): void;
}>();

// -----------------------------------------------------------------------------
// Store read
// -----------------------------------------------------------------------------
const launcher = useLauncherStore();

const applications = computed(() => launcher.applications);

// -----------------------------------------------------------------------------
// State derivation (loading > error > empty > ready)
// -----------------------------------------------------------------------------
const state = computed<LauncherGridState>(() => {
  if (props.loading) return 'loading';
  if (props.error !== undefined && props.error !== null) return 'error';
  if (applications.value.length === 0) return 'empty';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Icon resolution
// -----------------------------------------------------------------------------
function resolveIcon(slug: string): IconName | undefined {
  if (props.iconForSlug === undefined) return undefined;
  return props.iconForSlug(slug);
}

// -----------------------------------------------------------------------------
// Retry forwarding
// -----------------------------------------------------------------------------
function onRetry(): void {
  emit('retry');
}
</script>

<template>
  <div
    class="launcher-grid"
    :data-state="state"
    data-testid="launcher-grid-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      @action="onRetry"
    />

    <!-- ============================================================
         Empty
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.emptyTitle"
      :description="labels.emptyDescription"
    />

    <!-- ============================================================
         Ready — the tile grid
         ============================================================ -->
    <ul
      v-else
      class="launcher-grid__list"
      data-testid="launcher-grid-grid"
    >
      <li
        v-for="app in applications"
        :key="app.slug"
        class="launcher-grid__item"
        data-testid="launcher-grid-item"
      >
        <LauncherTile
          :application="app"
          :icon="resolveIcon(app.slug)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.launcher-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ============================================================================
   Grid
   ---------------------------------------------------------------------------
   Auto-fill with a 280px minimum. The value yields the target column
   counts across the design system's breakpoints without media queries:
     ~320px  →  1 column
     ~640px  →  2 columns
     ~960px  →  3 columns
     ~1280px →  4 columns

   auto-fill (not auto-fit) so a short list does not stretch its tiles
   to fill the row. See the response preamble §"Design note — auto-fill
   grid".
   ============================================================================ */
.launcher-grid__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--mases-space-4);
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

/* ============================================================================
   Item
   ---------------------------------------------------------------------------
   A wrapper <li>. The tile's own layout is owned by LauncherTile.
   ============================================================================ */
.launcher-grid__item {
  display: flex;
  min-width: 0;
}

/* The tile fills its <li> so tiles in the same row always match width,
   regardless of content length. */
.launcher-grid__item > :deep(.launcher-tile) {
  flex: 1 1 auto;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. The composed state components
   own their own motion contracts. A defensive no-op block is kept for
   future revisions.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .launcher-grid {
    /* no-op placeholder — see comment above */
  }
}
</style>