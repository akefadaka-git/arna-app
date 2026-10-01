<!--
=============================================================================
 MASES Phase 2 UI — PermissionGate
=============================================================================

 File:      mase_app/src/components/patterns/PermissionGate/PermissionGate.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.7
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md v1.0.0 §7.2, §15.4

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Conditional rendering based on the authenticated user's permissions.
 The component is the shared pattern for UX gating: hiding or disabling
 a UI element when the user does not hold a required permission.

 -----------------------------------------------------------------------------
 UX gating is NOT security
 -----------------------------------------------------------------------------
 Per Architecture Freeze §7.2 and §15.4:
   - The backend is the sole authority for every authorization decision.
   - PermissionGate is UX only. It hides or disables elements for
     clarity; it does not enforce access.
   - On 403 from the backend, the ErrorPage renders regardless of what
     the gate believed.
   - The gate never suppresses a backend call that would otherwise be
     made; it only hides the trigger.

 Consumers must never rely on PermissionGate as a security boundary.

 -----------------------------------------------------------------------------
 The store interface — see the response preamble
 -----------------------------------------------------------------------------
 The component imports useAuthStore from '@/stores/auth' and reads
 exactly ONE member:

   state.permissions:  string[]

 The store is delivered in Stage 12 (Authentication UI). Until then,
 the module import fails; documented as a forward dependency.

 -----------------------------------------------------------------------------
 The mode prop — see the response preamble
 -----------------------------------------------------------------------------
   mode='any' (default)  →  renders default if the user holds at least
                            one of the `permission` entries.
   mode='all'            →  renders default if the user holds every
                            entry.

 An empty `permission` array denies in both modes and triggers a
 deduplicated dev warning.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - the default slot content (consumer-supplied);
   - the fallback slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 This component declares no design tokens and no CSS. It is a pure
 conditional render — it produces either the default slot or the
 fallback slot, nothing else. No wrapper element is emitted.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 None at the component level. Because the component renders no wrapper
 element, consumers attach their own test hooks to the rendered content
 inside the default or fallback slot.

 A consumer that needs a stable test hook for "the gate rendered the
 default content" places a data-testid on their own content; the same
 for the fallback. This keeps the component transparent to the DOM.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 No accessibility contract of its own — the component is a pure
 conditional render and produces no DOM wrapper, no role, and no
 ARIA attribute. The rendered content carries whatever accessibility
 contract the consumer supplied.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */
export type PermissionGateMode = 'any' | 'all';

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesPermissionGateWarned = new Set<string>();

function __masesPermissionGateWarnOnce(key: string, message: string): void {
  if (__masesPermissionGateWarned.has(key)) {
    return;
  }
  __masesPermissionGateWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

interface Props {
  /**
   * The permission slug (or slugs) required to render the default slot.
   *
   * Each slug must be one of the 60 verified MASES permission slugs
   * (see the Implementation Evidence Report §18). An unverified slug
   * cannot grant access — the backend will never include it in the
   * user's permission list, so the gate would always deny. A
   * deduplicated dev warning fires once per module load when an
   * unknown-to-the-frontend slug is used.
   */
  permission: string | ReadonlyArray<string>;

  /**
   * The matching mode. Defaults to 'any'.
   *
   *   'any'  →  render if the user holds AT LEAST ONE permission.
   *   'all'  →  render if the user holds EVERY permission.
   *
   * See the response preamble §"Design note — the three-valued mode
   * prop".
   */
  mode?: PermissionGateMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'any',
});

/**
 * Slots.
 *
 * default   — rendered when the user is authorized.
 * fallback  — rendered when the user is NOT authorized (optional).
 */
defineSlots<{
  default(): unknown;
  fallback(): unknown;
}>();

// -----------------------------------------------------------------------------
// Store access
// -----------------------------------------------------------------------------
const authStore = useAuthStore();

/**
 * Normalize `permission` to a non-empty array.
 */
const permissions = computed<string[]>(() => {
  const p = props.permission;
  if (typeof p === 'string') {
    return p.trim() === '' ? [] : [p];
  }
  return p.filter((s) => s.trim() !== '');
});

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && permissions.value.length === 0) {
  __masesPermissionGateWarnOnce(
    'permission-gate:empty-permission',
    '[PermissionGate] `permission` is empty or contains only empty ' +
      'strings. The gate will always deny. Supply at least one ' +
      'permission slug.',
  );
}

// -----------------------------------------------------------------------------
// Authorization check
// -----------------------------------------------------------------------------
/**
 * The user's permission set, as a Set for O(1) lookup.
 *
 * `authStore.permissions` is a `string[]` from the store. The Set is
 * recomputed when the underlying array changes (Pinia's reactivity
 * ensures this).
 */
const userPermissions = computed<Set<string>>(
  () => new Set(authStore.permissions),
);

const isAuthorized = computed<boolean>(() => {
  const required = permissions.value;
  if (required.length === 0) {
    return false;
  }

  if (props.mode === 'all') {
    return required.every((slug) => userPermissions.value.has(slug));
  }

  // mode === 'any'
  return required.some((slug) => userPermissions.value.has(slug));
});
</script>

<template>
  <!--
    Conditional render.
    The component emits either the default slot or the fallback slot.
    It produces NO wrapper element.
  -->
  <slot v-if="isAuthorized" />

  <slot
    v-else
    name="fallback"
  />
</template>

<!--
 No <style> block.
 The component is a pure conditional render. It has no visual identity
 of its own; the rendered slot content carries all visual properties.
-->