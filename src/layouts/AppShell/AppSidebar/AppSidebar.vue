<!--
=============================================================================
 MASES Phase 2 UI — AppSidebar
=============================================================================

 File:      mase_app/src/layouts/AppShell/AppSidebar/AppSidebar.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §7.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7, §15.1, §18.2, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — type-check fix:
          · The three BaseIcon `:name` bindings (group toggle, child
            leaf, top-level leaf) received `string` from the item
            definitions, but BaseIcon's `name` prop is typed
            `IconName`. Added an `iconName()` helper that casts at the
            binding point — same pattern as DropdownMenu's icon
            handling. The runtime registry check inside BaseIcon still
            runs unchanged.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell's primary navigation sidebar. Renders a vertical tree of
 leaves and groups, filtered by the current user's permissions (read
 from @/stores/auth, Unit 11.4). Active state is delegated to
 RouterLink's own classes.

 Composed by AppShell as the shell's left region on desktop and tablet.
 On mobile, the shell renders AppMobileDrawer (Unit 11.17) instead.

 -----------------------------------------------------------------------------
 Permission filtering (Catalog §7.2)
 -----------------------------------------------------------------------------
 Items may carry an optional `permission` field:

   permission: 'wallet.view'                    → single slug
   permission: ['wallet.view', 'wallet.view_own'] → array
   permissionMode: 'any' (default) | 'all'      → for arrays

 The component calls authStore.hasPermission / hasAnyPermission /
 hasAllPermissions (Unit 11.4) to decide visibility. Items without a
 permission field are always visible.

 This is UX gating only. See the file header's §"Composition" of the
 response preamble and Architecture Freeze §7.1 / §29.1. The backend
 remains the sole authorization authority.

 Groups whose children are all filtered out are themselves hidden.

 -----------------------------------------------------------------------------
 Collapsed mode (Freeze §18.2 — tablet)
 -----------------------------------------------------------------------------
 collapsed=true hides labels (icon-only) and does NOT render group
 children. The group button remains in the DOM but is a no-op; it is
 marked aria-disabled="true" and does not carry aria-expanded (see
 the template below). A future CR may add an icon-only group popover;
 not delivered here.

 -----------------------------------------------------------------------------
 Border ownership
 -----------------------------------------------------------------------------
 The sidebar does NOT declare its own border-inline-end. The aside in
 AppShell.vue declares the border, so that the rule spans both the
 sidebar column and the calendar sub-region below it. A single author
 for a single border.

 -----------------------------------------------------------------------------
 Icon-name typing — see the file header comment §"Revision history"
 -----------------------------------------------------------------------------
 The item `icon` fields are typed `string` (not `IconName`) so consumers
 can populate them from arbitrary data — a nav config file, a backend
 payload — without a compile-time cast. The `iconName()` helper below
 performs a TypeScript-only narrowing at the binding point; the
 runtime registry check inside BaseIcon still guards against
 unregistered names and emits a dev warning when one is supplied.

 This matches the pattern used by DropdownMenu (Unit 9.11) for its
 `MenuItem.icon` field.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible label comes from `items[].label` or `items[].children[].label`.
 The single a11y string (navigationAriaLabel) comes from `labels`. The
 component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, align-items, gap
 via tokens, padding via tokens, width via a token, overflow, position,
 transition property names, transform).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="app-sidebar-root"          on the <nav>
 data-testid="app-sidebar-list"          on the top-level <ul>
 data-testid="app-sidebar-leaf"          on each leaf <li>
 data-testid="app-sidebar-leaf-link"     on each leaf's RouterLink
 data-testid="app-sidebar-group"         on each group <li>
 data-testid="app-sidebar-group-toggle"  on each group's <button>
 data-testid="app-sidebar-group-list"    on each group's nested <ul>
                                         (rendered only when the group
                                         is expanded and not collapsed)
 data-testid="app-sidebar-icon"          on each item's BaseIcon

 Each <li> carries:
   data-item-id="<id>"

 Each group <li> carries:
   data-expanded="true" | "false"

 The <nav> carries:
   data-collapsed="true"  (present only when collapsed)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Root is <nav role="navigation"> with aria-label from
     labels.navigationAriaLabel. Explicit role so the landmark survives
     AppShell's wrapper element.
   - Leaves are <RouterLink> rendered as <a>. Vue Router applies
     aria-current="page" on the exact-active link; screen readers
     announce it. The component styles the router-link-active class
     for the visual indicator. Leaf links carry an explicit
     :focus-visible outline (matching the group toggle's ring).
   - Groups use a <button>. In expanded mode the button carries
     aria-expanded="true|false"; aria-controls references the nested
     <ul>'s id only when that <ul> is rendered (the WAI-ARIA guidance
     for controlled elements whose target may be absent). In collapsed
     mode the button carries aria-disabled="true" and omits both
     aria-expanded and aria-controls, because the toggle is a no-op
     in that state.
   - Icons are decorative (no aria-label on BaseIcon); the label is
     the accessible name.
   - In collapsed mode, labels are hidden via CSS (display: none) and
     removed from the accessibility tree; the RouterLink's `aria-label`
     is set from the item's label so the link remains named. This is
     the same technique as NotificationsBell's badge (aria-hidden) and
     TenantSwitcher's name (display: none).
   - Reduced motion: this file defines no animation.
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
 * Permission check mode for array-valued `permission` fields.
 */
export type NavPermissionMode = 'any' | 'all';

/**
 * A navigation leaf — a single routable item.
 */
export interface NavLeaf {
  readonly id: string;
  readonly label: string;
  /**
   * A Vue Router path (e.g. '/wallet'). The component renders this as
   * a <RouterLink :to="path">. External URLs are not supported — if a
   * consumer needs them, that is a CR.
   */
  readonly to: string;
  /**
   * An optional Lucide icon name. Must be one of the frozen 56-icon
   * registry keys (Unit 8.19) at runtime; typed as `string` so it can
   * be populated from arbitrary consumer data. See the file header
   * comment §"Icon-name typing".
   */
  readonly icon?: string;
  /**
   * An optional permission requirement. When the field is absent, the
   * item is always visible. When present, the check depends on the
   * field's shape:
   *   - string          →  authStore.hasPermission
   *   - readonly string[] →  hasAnyPermission or hasAllPermissions,
   *                          per permissionMode
   */
  readonly permission?: string | readonly string[];
  /**
   * For array `permission`, whether the user needs any (default) or
   * all of the listed permissions.
   */
  readonly permissionMode?: NavPermissionMode;
}

/**
 * A navigation group — a non-navigating container of leaves.
 */
export interface NavGroup {
  readonly id: string;
  readonly label: string;
  /**
   * An optional Lucide icon name. Typed as `string` for the same
   * reason as NavLeaf.icon. See the file header comment §"Icon-name
   * typing".
   */
  readonly icon?: string;
  /**
   * The group's children. A group whose children are all filtered out
   * by permissions is itself hidden.
   */
  readonly children: ReadonlyArray<NavLeaf>;
  /**
   * An optional permission requirement on the group itself. When
   * present, the group is hidden entirely if the check fails,
   * regardless of the children.
   */
  readonly permission?: string | readonly string[];
  readonly permissionMode?: NavPermissionMode;
}

/**
 * A navigation item — either a leaf or a group.
 */
export type NavItem = NavLeaf | NavGroup;

/**
 * Type guard: is the given item a group?
 */
export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

/**
 * Consumer-supplied, translated labels.
 */
export interface AppSidebarLabels {
  /**
   * The <nav> element's aria-label. Typically "Primary navigation" /
   * "ዋና ዳሰሳ".
   */
  readonly navigationAriaLabel: string;
}

/*
 * Module-level counter for group disclosure ids. Ensures each
 * aria-controls value is unique even when the same component renders
 * twice (e.g. AppShell + AppMobileDrawer).
 */
let __masesSidebarIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseIcon from '@/components/primitives/BaseIcon';
import type { IconName } from '@/components/primitives/BaseIcon';

interface Props {
  /**
   * The navigation tree. Required. Consumer-supplied — see the
   * response preamble §"Design note — items are consumer-supplied".
   */
  items: ReadonlyArray<NavItem>;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: AppSidebarLabels;

  /**
   * Icon-only mode (Freeze §18.2, tablet). Defaults to false.
   *
   * When true: labels are hidden, and group children are not rendered.
   * See the response preamble §"Notice 2".
   */
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
});

// -----------------------------------------------------------------------------
// Auth store
// -----------------------------------------------------------------------------
const auth = useAuthStore();

// -----------------------------------------------------------------------------
// Icon-name narrowing
// -----------------------------------------------------------------------------
/*
 * The NavItem `icon` fields are typed `string` so consumers can pass
 * values sourced from arbitrary data — a config file, a backend
 * payload — without a compile-time cast. BaseIcon's `name` prop is
 * typed `IconName` (the frozen 56-icon registry union). This helper
 * performs a TypeScript-only assertion at the binding point.
 *
 * BaseIcon's own runtime check still runs and emits a deduplicated dev
 * warning for unregistered names, so an invalid value degrades
 * gracefully (icon missing, warning logged) rather than throwing.
 *
 * Mirrors the pattern used by DropdownMenu (Unit 9.11) for its
 * MenuItem.icon field.
 */
function iconName(value: string): IconName {
  return value as IconName;
}

// -----------------------------------------------------------------------------
// Permission filtering
// -----------------------------------------------------------------------------
function passesPermissionCheck(
  permission: string | readonly string[] | undefined,
  mode: NavPermissionMode = 'any',
): boolean {
  if (permission === undefined) return true;
  if (typeof permission === 'string') return auth.hasPermission(permission);
  // Array
  return mode === 'all'
    ? auth.hasAllPermissions(permission)
    : auth.hasAnyPermission(permission);
}

function isLeafVisible(leaf: NavLeaf): boolean {
  return passesPermissionCheck(leaf.permission, leaf.permissionMode);
}

/*
 * A group is visible when:
 *   - its own permission passes (if any), AND
 *   - at least one of its children is visible.
 */
function groupVisibleChildren(group: NavGroup): ReadonlyArray<NavLeaf> {
  return group.children.filter(isLeafVisible);
}

function isGroupVisible(group: NavGroup): boolean {
  if (!passesPermissionCheck(group.permission, group.permissionMode)) {
    return false;
  }
  return groupVisibleChildren(group).length > 0;
}

/*
 * The filtered tree — what actually renders. A computed so it
 * re-evaluates when the user's permission list changes (login,
 * logout, role change).
 */
interface FilteredGroup extends NavGroup {
  readonly visibleChildren: ReadonlyArray<NavLeaf>;
}

const filteredItems = computed<
  ReadonlyArray<NavLeaf | FilteredGroup>
>(() => {
  const out: Array<NavLeaf | FilteredGroup> = [];
  for (const item of props.items) {
    if (isNavGroup(item)) {
      if (!isGroupVisible(item)) continue;
      out.push({
        ...item,
        visibleChildren: groupVisibleChildren(item),
      });
    } else {
      if (!isLeafVisible(item)) continue;
      out.push(item);
    }
  }
  return out;
});

// -----------------------------------------------------------------------------
// Group expansion state (local, not persisted)
// -----------------------------------------------------------------------------
const expandedGroups = ref<Set<string>>(new Set());

function isGroupExpanded(id: string): boolean {
  return expandedGroups.value.has(id);
}

function toggleGroup(id: string): void {
  if (props.collapsed) return; // no-op in collapsed mode
  const next = new Set(expandedGroups.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  expandedGroups.value = next;
}

// -----------------------------------------------------------------------------
// Stable aria-controls ids
// -----------------------------------------------------------------------------
const groupListIdPrefix = `mases-sidebar-groups-${++__masesSidebarIdCounter}`;

function groupListId(groupId: string): string {
  return `${groupListIdPrefix}-${groupId}`;
}

// -----------------------------------------------------------------------------
// Collapsed-state labels for a11y
// -----------------------------------------------------------------------------
/*
 * In collapsed mode, the leaf label is hidden visually (display: none)
 * so the RouterLink would otherwise have no accessible name. We set
 * aria-label from the item's own label in that case. This mirrors the
 * technique used by NotificationsBell (badge is aria-hidden; the
 * accessible name is on the button) and TenantSwitcher (name is
 * display: none on mobile; the trigger has an aria-label).
 */
function leafAriaLabel(label: string): string | undefined {
  return props.collapsed ? label : undefined;
}

// -----------------------------------------------------------------------------
// Group-toggle ARIA helpers
// -----------------------------------------------------------------------------
/*
 * The nested <ul> for a group renders only when the group is expanded
 * AND the sidebar is not collapsed. aria-controls must reference a
 * present element, so it is emitted only when that condition holds.
 * See the file header comment §"Accessibility".
 */
function groupToggleAriaExpanded(groupId: string): 'true' | 'false' | undefined {
  if (props.collapsed) return undefined;
  return isGroupExpanded(groupId) ? 'true' : 'false';
}

function groupToggleAriaControls(groupId: string): string | undefined {
  if (props.collapsed) return undefined;
  if (!isGroupExpanded(groupId)) return undefined;
  return groupListId(groupId);
}

function groupToggleAriaDisabled(): 'true' | undefined {
  return props.collapsed ? 'true' : undefined;
}
</script>

<template>
  <nav
    class="app-sidebar"
    role="navigation"
    :aria-label="labels.navigationAriaLabel"
    :data-collapsed="collapsed ? 'true' : undefined"
    data-testid="app-sidebar-root"
  >
    <ul
      class="app-sidebar__list"
      data-testid="app-sidebar-list"
    >
      <li
        v-for="item in filteredItems"
        :key="item.id"
        class="app-sidebar__item"
        :data-item-id="item.id"
        :data-expanded="isNavGroup(item) ? String(isGroupExpanded(item.id)) : undefined"
        :data-testid="isNavGroup(item) ? 'app-sidebar-group' : 'app-sidebar-leaf'"
      >
        <!-- ============================================================
             Group
             ============================================================ -->
        <template v-if="isNavGroup(item)">
          <button
            type="button"
            class="app-sidebar__group-toggle"
            :aria-expanded="groupToggleAriaExpanded(item.id)"
            :aria-controls="groupToggleAriaControls(item.id)"
            :aria-disabled="groupToggleAriaDisabled()"
            :aria-label="collapsed ? item.label : undefined"
            data-testid="app-sidebar-group-toggle"
            @click="toggleGroup(item.id)"
          >
            <BaseIcon
              v-if="item.icon"
              :name="iconName(item.icon)"
              size="sm"
              class="app-sidebar__icon"
              data-testid="app-sidebar-icon"
            />
            <span class="app-sidebar__label">{{ item.label }}</span>
            <BaseIcon
              v-if="!collapsed"
              name="chevron-down"
              size="xs"
              class="app-sidebar__group-chevron"
            />
          </button>

          <ul
            v-if="!collapsed && isGroupExpanded(item.id)"
            :id="groupListId(item.id)"
            class="app-sidebar__group-list"
            data-testid="app-sidebar-group-list"
          >
            <li
              v-for="child in item.visibleChildren"
              :key="child.id"
              class="app-sidebar__leaf"
              :data-item-id="child.id"
              data-testid="app-sidebar-leaf"
            >
              <RouterLink
                class="app-sidebar__link"
                :to="child.to"
                :aria-label="leafAriaLabel(child.label)"
                data-testid="app-sidebar-leaf-link"
              >
                <BaseIcon
                  v-if="child.icon"
                  :name="iconName(child.icon)"
                  size="sm"
                  class="app-sidebar__icon"
                  data-testid="app-sidebar-icon"
                />
                <span class="app-sidebar__label">{{ child.label }}</span>
              </RouterLink>
            </li>
          </ul>
        </template>

        <!-- ============================================================
             Leaf
             ============================================================ -->
        <template v-else>
          <RouterLink
            class="app-sidebar__link"
            :to="item.to"
            :aria-label="leafAriaLabel(item.label)"
            data-testid="app-sidebar-leaf-link"
          >
            <BaseIcon
              v-if="item.icon"
              :name="iconName(item.icon)"
              size="sm"
              class="app-sidebar__icon"
              data-testid="app-sidebar-icon"
            />
            <span class="app-sidebar__label">{{ item.label }}</span>
          </RouterLink>
        </template>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* ============================================================================
   Root <nav>
   ---------------------------------------------------------------------------
   No border-inline-end. The aside in AppShell.vue owns the border so
   that the rule spans both the sidebar column and the calendar
   sub-region below it. See the file header comment §"Border
   ownership".
   ============================================================================ */
.app-sidebar {
  display: flex;
  flex-direction: column;
  width: var(--mases-shell-sidebar-width);
  height: 100%;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-2);
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  font-family: inherit;
  overflow-y: auto;
}

/* Collapsed (icon-only) mode — narrower width. */
.app-sidebar[data-collapsed='true'] {
  width: var(--mases-shell-sidebar-width-collapsed);
}

/* ============================================================================
   List
   ============================================================================ */
.app-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-sidebar__item {
  display: flex;
  flex-direction: column;
}

/* ============================================================================
   Leaf link
   ---------------------------------------------------------------------------
   RouterLink renders as <a>. The component styles the auto-applied
   router-link-active class for the current-section indicator.

   :focus-visible — parallel to the group toggle's own ring. Without
   this rule, focus lands on leaf links with only the UA default
   outline, which varies by browser and can be clipped by the aside's
   overflow.
   ============================================================================ */
.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-secondary);
  text-decoration: none;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.app-sidebar__link:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.app-sidebar__link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/*
 * Active state — Vue Router applies `router-link-active` on prefix
 * match (parent stays active while a child route is shown), and
 * `router-link-exact-active` on exact match. We style the broader
 * `router-link-active` so a section stays highlighted while the user
 * navigates within it.
 */
.app-sidebar__link.router-link-active {
  background-color: var(--mases-color-state-selected);
  color: var(--mases-color-text-brand);
}

/* ============================================================================
   Leaf wrapper in a group
   ============================================================================ */
.app-sidebar__leaf {
  display: flex;
  flex-direction: column;
}

/* ============================================================================
   Group toggle
   ---------------------------------------------------------------------------
   A button, not a link — the group does not navigate. See the
   response preamble §"Design note — why the group disclosure button
   is a <button>".
   ============================================================================ */
.app-sidebar__group-toggle {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  border: 0;
  border-radius: var(--mases-radius-md);
  background-color: transparent;
  color: var(--mases-color-text-secondary);
  cursor: pointer;
  text-align: start;
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-semibold);
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.app-sidebar__group-toggle:hover {
  background-color: var(--mases-color-state-hover);
}

.app-sidebar__group-toggle:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Group chevron
   ---------------------------------------------------------------------------
   Rotates 180° when the group is expanded. The transition duration is
   a token; the substrate collapses it under prefers-reduced-motion.
   ============================================================================ */
.app-sidebar__group-chevron {
  margin-inline-start: auto;
  color: var(--mases-color-icon-secondary);
  transition: transform var(--mases-duration-fast) var(--mases-easing-standard);
}

[data-expanded='true'] .app-sidebar__group-chevron {
  transform: rotate(180deg);
}

/* ============================================================================
   Group list (nested <ul>)
   ============================================================================ */
.app-sidebar__group-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  list-style: none;
  margin: 0;
  padding: 0;
  /*
   * A small inline padding-start indents the children relative to the
   * group toggle. The value is half of the icon width, which is the
   * amount of leading whitespace the child needs to visually align
   * under the group's own icon.
   */
  padding-inline-start: var(--mases-space-5);
}

/* ============================================================================
   Icon and label
   ============================================================================ */
.app-sidebar__icon {
  color: var(--mases-color-icon-secondary);
  flex-shrink: 0;
}

.app-sidebar__label {
  /*
   * Amharic-safe: the label can wrap in the full-width sidebar. In
   * collapsed mode the label is display: none, so wrapping is moot.
   */
  overflow-wrap: break-word;
  word-break: normal;
  min-width: 0;
}

/* ============================================================================
   Collapsed mode
   ---------------------------------------------------------------------------
   Labels are hidden. The RouterLink keeps its aria-label (set from the
   item's label in the template) so the link remains named for
   assistive technology. Group children are not rendered at all when
   collapsed — see the response preamble §"Notice 2".
   ============================================================================ */
.app-sidebar[data-collapsed='true'] .app-sidebar__label {
  display: none;
}

.app-sidebar[data-collapsed='true'] .app-sidebar__link,
.app-sidebar[data-collapsed='true'] .app-sidebar__group-toggle {
  justify-content: center;
  padding-inline: var(--mases-space-2);
}

.app-sidebar[data-collapsed='true'] .app-sidebar__group-chevron {
  display: none;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The link and group-toggle background transitions and the chevron's
   transform use token-driven durations, which the substrate collapses
   to 1ms under prefers-reduced-motion. No component-local media query
   is needed for those. This block is a defensive no-op placeholder.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .app-sidebar {
    /* no-op placeholder — see comment above */
  }
}
</style>