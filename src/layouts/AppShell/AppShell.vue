<!--
=============================================================================
 MASES UI — AppShell
=============================================================================

 File:      mase_app/src/layouts/AppShell/AppShell.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.2.0
 Status:    ENHANCEMENT — forced-colors shell accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §18, §22
            CR-FOOTER1 (this delivery)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — type-check fix:
          · Dropped the unused `const props = ` binding. The component's
            template accesses every prop by bare name (Vue auto-unwraps
            them), and the `<script setup>` body never reads `props.`.
            The `withDefaults(defineProps<Props>(), { … })` call is
            retained as a bare expression so the default values still
            apply. No behavior change.

 1.0.2  — comment strengthening (documentation only):
          · The comment above the `withDefaults(defineProps<Props>(),
            { … })` call is expanded with an explicit prohibition on
            re-adding `const props = `. The v1.0.1 fix removed the
            binding because `noUnusedLocals` flagged it; a future
            contributor who needs `props.x` inside `<script setup>`
            would re-add the binding, hit the same failure, and have
            to rediscover the cause. The new text states the
            condition under which re-adding the binding is legitimate
            (a function in `<script setup>` actually reads a prop
            through `props.`) and the failure it produces otherwise.
          · No code lines changed. The `withDefaults` call, the
            `defineEmits` block, the `defineSlots` block, the tenant
            handler, the mobile-drawer state, and the event-forwarding
            functions are byte-for-byte identical to v1.0.1.
          · No template, style, or exported-type change. The file's
            runtime behavior is unchanged.

 1.0.3  — brand slot fallback (CR-BRAND1):
          · The `#brand` forwarding slot now renders <MASESBrand /> as
            its fallback content when no consumer supplies the slot.
            Previously the region rendered empty for both current
            consumers (AuthenticatedLayout.vue v1.0.3, PortalLayout.vue
            v1.1.0), producing a header with no visible brand.
          · The `<slot name="brand" />` in the AppHeader forwarding
            block becomes `<slot name="brand"><MASESBrand /></slot>`.
            Vue's standard slot-fallback semantics apply: if a
            consumer of AppShell supplies `#brand` content, that
            content wins and MASESBrand is not rendered. This is the
            intended extension point for future white-label or
            embedded shells — the default brand is a convenience, not
            a lock-in.
          · A new import:
              import MASESBrand from '@/layouts/AppShell/MASESBrand';
            The barrel (MASESBrand/index.ts, v1.0.0) is the companion
            file in this CR.
          · The `defineSlots` comment for `brand` is updated to
            document the fallback. The slot's type signature
            (`brand?(): unknown`) is unchanged — slot fallback does
            not affect the declared type; the same contract holds.
          · The companion change in @/router/shell-labels (v1.9.0)
            adds `masesBrandLabels`, which MASESBrand.vue imports as
            its only dependency. That file is also part of CR-BRAND1.
          · No change to any other slot, prop, emit, or DOM region.
            The `nav`, `actions`, `header-actions`, `footer`, and
            `default` slots are untouched. `AppHeader.vue` is not
            modified — it receives whatever AppShell forwards, as
            before.
          · No change to either FROZEN consumer. AuthenticatedLayout.vue
            and PortalLayout.vue continue to supply no `#brand` and
            now inherit the default brand automatically.

 1.0.4  — footer slot fallback (CR-FOOTER1):
          · The `#footer` forwarding slot now renders
            <MASESFooterContent /> as its fallback content when no
            consumer supplies the slot. Previously the region rendered
            empty for both current consumers (AuthenticatedLayout.vue
            v1.0.3, PortalLayout.vue v1.1.0), producing a footer with
            only the version string in its end region.
          · The `<slot name="footer" />` in the AppFooter forwarding
            block becomes
              <slot name="footer"><MASESFooterContent /></slot>.
            Vue's standard slot-fallback semantics apply: a consumer
            that supplies `#footer` content wins; MASESFooterContent
            is not rendered in that case. This preserves the extension
            point for white-label shells and test harnesses.
          · A new import:
              import MASESFooterContent
                from '@/layouts/AppShell/MASESFooterContent';
            The barrel (MASESFooterContent/index.ts, v1.0.0) is the
            companion file in this CR.
          · The `defineSlots` comment for `footer` is updated to
            document the fallback. The slot's type signature
            (`footer?(): unknown`) is unchanged.
          · The companion change in @/router/shell-labels (v1.10.0)
            adds `masesFooterLabels`, which MASESFooterContent.vue
            imports. That file is also part of CR-FOOTER1.
          · `footerVersion` and `footerCopyright` props flow to
            AppFooter unchanged. AppFooter's `version` region
            continues to render the version string at the footer's
            end position. MASESFooterContent renders the copyright
            and the link row in the footer's middle region; the
            `footerCopyright` prop is therefore unused by MASES (the
            layouts pass no value for it) but remains available to
            other consumers of AppShell.
          · No change to any other slot, prop, emit, or DOM region.
            The `brand`, `nav`, `actions`, `header-actions`, and
            `default` slots are untouched. `AppFooter.vue` is not
            modified by this revision — it receives whatever AppShell
            forwards, as before. (A documentation-only PATCH to
            AppFooter.vue follows as File 5 of this CR.)
          · No change to either FROZEN consumer. AuthenticatedLayout.vue
            and PortalLayout.vue continue to supply no `#footer` and
            now inherit the default footer content automatically.

 1.1.0 — ARNA palette alignment and focus-target refinement:
          · The persistent desktop/tablet sidebar now uses the semantic
            raised-surface token, separating navigation from the page
            canvas while remaining compatible with active brand themes.
          · The main landmark no longer suppresses its focus outline.
            Keyboard skip-link focus receives a visible token-based
            focus indicator using the semantic focus-ring token.
          · No props, slots, events, navigation behavior, store
            integration, or test hooks changed.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The top-level authenticated application frame. Every authenticated
 page renders inside this component's default slot.

 Structure:
   ┌────────────────────────────────────────────────┐
   │ SkipToContent (off-screen; first focusable)     │
   │ MaintenanceBanner (optional, per shell state)   │
   │ AppHeader (sticky, full width)                  │
   │   ├── #brand     → MASESBrand (default)         │
   │   ├── #nav       → consumer-supplied            │
   │   └── #actions   → NotificationsBell,           │
   │                    TenantSwitcher, UserMenu     │
   ├──────────────────────┬──────────────────────────┤
   │ AppSidebar           │ <main>                   │
   │ + CalendarContext    │   <slot />               │
   ├──────────────────────┴──────────────────────────┤
   │ AppFooter (full width)                          │
   │   ├── start      → footerCopyright prop         │
   │   ├── middle     → MASESFooterContent (default) │
   │   └── end        → footerVersion prop           │
   └────────────────────────────────────────────────┘

 Plus, at the document level:
   AppMobileDrawer (Teleport to <body>, opened by the header toggle)

 -----------------------------------------------------------------------------
 What AppShell does NOT do
 -----------------------------------------------------------------------------
   - It does NOT fetch data. The launcher list, notifications, and the
     user summary are fetched by services driven by the router guard or
     by feature pages — not by the shell.
   - It does NOT subscribe to the tenant store's $onAction. That
     bootstrap wiring is documented in Units 11.5–11.8 and belongs in
     main.ts (Stage 12).
   - It does NOT register the auth service, the API client, or the
     router. All of those are Stage 12+ work.
   - It does NOT render the LanguageSelector — Freeze §9.3 / §20.3.
   - It does NOT navigate. The header slot content and the launcher
     route handle navigation; AppShell only re-emits.

 -----------------------------------------------------------------------------
 Brand slot — default content (CR-BRAND1)
 -----------------------------------------------------------------------------
 The `#brand` forwarding slot renders <MASESBrand /> as its fallback
 content when the consumer of AppShell supplies nothing:

     <template #brand>
       <slot name="brand">
         <MASESBrand />
       </slot>
     </template>

 The fallback is deliberate and has three consequences:

   1. Every consumer of AppShell gets the corporate brand mark
      automatically. Branding is shell chrome; it should not require
      opt-in from each layout.

   2. A consumer that wants a different brand — a white-label build,
      an embedded surface, a test harness that asserts on a stable
      string, a future product variant — supplies its own `#brand`
      content and it wins, per Vue's standard slot-fallback
      semantics. No override mechanism beyond the existing slot is
      required.

   3. The two current consumers (AuthenticatedLayout.vue,
      PortalLayout.vue) supply no `#brand` and therefore inherit the
      default. Neither file is modified by CR-BRAND1.

 The brand strings live in @/router/shell-labels (v1.9.0) as
 `masesBrandLabels`. The component is
 layouts/AppShell/MASESBrand/MASESBrand.vue. See that file and the
 CR-BRAND1 block in shell-labels.ts for the derivation of the
 header's short form (ማሌ ዓርና + ማሴስ) and for why the corporate
 emblem is not rendered in the header.

 -----------------------------------------------------------------------------
 Footer slot — default content (CR-FOOTER1)
 -----------------------------------------------------------------------------
 The `#footer` forwarding slot renders <MASESFooterContent /> as its
 fallback content when the consumer of AppShell supplies nothing:

     <template #footer>
       <slot name="footer">
         <MASESFooterContent />
       </slot>
     </template>

 The same three consequences apply:

   1. Every consumer of AppShell gets the footer content (copyright
      line + legal/support links) automatically.

   2. A consumer that wants different footer content supplies its
      own `#footer` content and it wins.

   3. The two current consumers supply no `#footer` and therefore
      inherit the default.

 What the fallback renders, and where it sits in AppFooter's three
 regions:

   · AppFooter's `start` region is driven by its `copyright` prop.
     MASES does not supply that prop — the copyright line is rendered
     by MASESFooterContent inside the middle region instead. The
     `copyright` prop remains available to other consumers of
     AppShell.

   · AppFooter's `middle` region receives MASESFooterContent. Inside
     that region the content lays out as a mobile stack and a desktop
     row — copyright at the left edge, link row at the right edge.

   · AppFooter's `end` region is driven by its `version` prop, which
     the layouts pass through `:footer-version`. The version string
     renders at the footer's far right, as it did before this CR.

 The footer content strings live in @/router/shell-labels (v1.10.0)
 as `masesFooterLabels`. The component is
 layouts/AppShell/MASESFooterContent/MASESFooterContent.vue. See
 that file and the CR-FOOTER1 block in shell-labels.ts for the
 derivation of the copyright template, the choice of the Ethiopic
 colon, and the reasons social link labels are deferred.

 -----------------------------------------------------------------------------
 Placement of CalendarContext — see the response preamble
 -----------------------------------------------------------------------------
 At the bottom of the sidebar column, in a dedicated sub-region.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   SkipToContent       (11.1)  — first focusable element
   MaintenanceBanner   (11.3)  — conditional, per `maintenance` prop
   AppHeader           (11.10) — with slots populated below
   MASESBrand      (CR-BRAND1) — default content of the #brand slot
   UserMenu            (11.11) — in the header's actions region
   NotificationsBell   (11.12) — in the header's actions region;
                                 disabled per §20.2
   TenantSwitcher      (11.14) — in the header's actions region
   AppSidebar          (11.16) — in the aside column
   CalendarContext     (11.15) — below the sidebar
   AppFooter           (11.2)  — bottom
   MASESFooterContent
                   (CR-FOOTER1)— default content of the #footer slot
   AppMobileDrawer     (11.17) — teleported to <body>; state-owned

 -----------------------------------------------------------------------------
 Sticky positioning and z-index
 -----------------------------------------------------------------------------
 The header is sticky (via AppHeader's own `sticky=true` default), using
 --mases-z-raised (10). The sidebar is also sticky (top: header height).
 The SkipToContent link uses --mases-z-sticky (200), which is above
 both. AppMobileDrawer uses the native top-layer of <dialog>, above
 everything.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string is consumer-supplied via `labels`, or via the
 composed units' own labels (all forwarded from `labels` here, except
 MASESBrand and MASESFooterContent, which read their own strings from
 @/router/shell-labels). The only string literal in this file is the
 default `skipToContentTargetId` (`'mases-main-content'`), which is a
 DOM id — not user-facing text.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 position, top, height / min-height, overflow, gap via tokens,
 padding via tokens, and the calc() expressions built from those
 tokens).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="app-shell-root"           on the outer <div>
 data-testid="app-shell-body"           on the body grid (aside + main)
 data-testid="app-shell-aside"          on the <aside>
 data-testid="app-shell-aside-calendar" on the CalendarContext wrapper
 data-testid="app-shell-main"           on the <main>
 data-testid="app-shell-content"        on the inner content wrapper

 The root <div> carries:
   data-has-maintenance="true"  (present only when `maintenance` is
                                 non-null)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - SkipToContent is the first element in DOM order. Its target is the
     <main> with id `mases-main-content` and tabindex="-1" — see the
     response preamble §"Skip target".
   - <main id="mases-main-content" tabindex="-1"> is the page's primary
     landmark. tabindex="-1" is required so keyboard focus follows the
     skip-link's hash navigation.
   - <aside> wraps the sidebar column: complementary-landmark semantics.
   - Consumers MUST NOT nest this component inside another
     <main>-rendering layout. Documented.
   - The composed units carry their own semantics (AppHeader has
     role="banner"; AppFooter has role="contentinfo"; AppMobileDrawer
     is a native <dialog>).
   - MASESBrand contributes text inside the banner landmark as its
     first content — screen readers reach it first when navigating by
     landmark. Its own accessibility notes live in that file.
   - MASESFooterContent contributes text and links inside the
     contentinfo landmark. Its own accessibility notes live in that
     file.
   - Reduced motion: the only animated element in this file is the
     AppShell itself, which has no animation. A defensive no-op block
     is kept for future revisions.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { NavItem, AppSidebarLabels } from '@/layouts/AppShell/AppSidebar';
import type { UserMenuItem, UserMenuLabels } from '@/layouts/AppShell/UserMenu';
import type { NotificationsBellLabels } from '@/layouts/AppShell/NotificationsBell';
import type { TenantSwitcherLabels } from '@/layouts/AppShell/TenantSwitcher';
import type { AppMobileDrawerLabels } from '@/layouts/AppShell/AppMobileDrawer';
import type { MaintenanceBannerVariant } from '@/layouts/AppShell/MaintenanceBanner';

/**
 * Shell-wide announcement state. `null` means no banner renders.
 */
export interface AppShellMaintenanceState {
  readonly variant: MaintenanceBannerVariant;
  readonly title?: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly dismissible?: boolean;
  readonly dismissLabel?: string;
}

/**
 * Consumer-supplied, translated labels for every shell-region
 * component. Grouped here so AppShell has a single labels prop.
 */
export interface AppShellLabels {
  /** Skip-link text. E.g. "Skip to content" / "ወደ ዋና ይዘት ዝለል". */
  readonly skipToContent: string;
  /** Header mobile-menu toggle aria-label. E.g. "Open navigation menu". */
  readonly mobileMenu: string;
  readonly userMenu: UserMenuLabels;
  readonly notificationsBell: NotificationsBellLabels;
  readonly tenantSwitcher: TenantSwitcherLabels;
  readonly sidebar: AppSidebarLabels;
  readonly drawer: AppMobileDrawerLabels;
}

export type {
  NavItem,
  AppSidebarLabels,
  UserMenuItem,
  UserMenuLabels,
  NotificationsBellLabels,
  TenantSwitcherLabels,
  AppMobileDrawerLabels,
  MaintenanceBannerVariant,
};
</script>

<script setup lang="ts">
import { ref } from 'vue';
import { useTenantStore } from '@/stores/tenant';

import SkipToContent from '@/layouts/AppShell/SkipToContent';
import MaintenanceBanner from '@/layouts/AppShell/MaintenanceBanner';
import AppHeader from '@/layouts/AppShell/AppHeader';
import MASESBrand from '@/layouts/AppShell/MASESBrand';
import UserMenu from '@/layouts/AppShell/UserMenu';
import NotificationsBell from '@/layouts/AppShell/NotificationsBell';
import TenantSwitcher from '@/layouts/AppShell/TenantSwitcher';
import AppSidebar from '@/layouts/AppShell/AppSidebar';
import CalendarContext from '@/layouts/AppShell/CalendarContext';
import AppFooter from '@/layouts/AppShell/AppFooter';
import MASESFooterContent from '@/layouts/AppShell/MASESFooterContent';
import AppMobileDrawer from '@/layouts/AppShell/AppMobileDrawer';

interface Props {
  /**
   * The navigation tree. Required. Rendered by both AppSidebar (desktop
   * / tablet) and AppMobileDrawer (mobile).
   */
  navItems: ReadonlyArray<NavItem>;

  /**
   * The user-menu items. Required. Rendered by UserMenu in the header's
   * actions region; selection is re-emitted as `user-menu-select`.
   */
  userMenuItems: ReadonlyArray<UserMenuItem>;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: AppShellLabels;

  /**
   * Shell-wide announcement state. `null` (the default) means no banner
   * renders. Dismissal is emitted; the consumer controls visibility.
   */
  maintenance?: AppShellMaintenanceState | null;

  /**
   * Footer copyright text. Passed through to AppFooter. Unused by
   * MASES today — the copyright line is rendered by
   * MASESFooterContent in the footer's middle region. Available to
   * other consumers of AppShell.
   */
  footerCopyright?: string;

  /**
   * Footer version string. Passed through to AppFooter.
   */
  footerVersion?: string;

  /**
   * The id of the skip-link's target element. Defaults to
   * 'mases-main-content' — the id this component assigns to its
   * <main>. Consumers should not override this unless they are also
   * rendering their own <main> (see the file header comment
   * §"Accessibility").
   */
  skipToContentTargetId?: string;
}

/*
 * The `defineProps` call is retained as a bare expression (no `const`
 * binding) because the `<script setup>` body never reads `props.` — the
 * component's template accesses every prop by bare name and Vue
 * unwraps them there. Dropping the binding satisfies `noUnusedLocals`
 * without changing the runtime: `withDefaults` still applies the
 * defaults below.
 *
 * DO NOT re-add `const props = ` unless a function in THIS
 * `<script setup>` block actually reads a prop through `props.`. The
 * v1.0.1 revision removed the binding precisely because no such read
 * existed, and `noUnusedLocals` (tsconfig.json v1.0.1) failed the
 * build on the unused identifier. Re-adding the binding without
 * introducing a `props.` read re-introduces that error.
 *
 * Legitimate reasons to re-add the binding:
 *   · a `watch(() => props.x, …)` — reads a prop to observe it
 *   · a helper that takes `props.y` as an argument
 *   · a computed that forwards `props.z` without using it in the
 *     template
 * If none of those applies, leave the call as a bare expression.
 */
withDefaults(defineProps<Props>(), {
  maintenance: null,
  footerCopyright: undefined,
  footerVersion: undefined,
  skipToContentTargetId: 'mases-main-content',
});

const emit = defineEmits<{
  /** Re-emitted from UserMenu's `select`. */
  (event: 'user-menu-select', payload: { id: string }): void;
  /** Re-emitted from NotificationsBell's `open`. */
  (event: 'notifications-open'): void;
  /** Re-emitted from MaintenanceBanner's `action`. */
  (event: 'maintenance-action'): void;
  /** Re-emitted from MaintenanceBanner's `dismiss`. */
  (event: 'maintenance-dismiss'): void;
}>();

defineSlots<{
  /**
   * The AppHeader brand region. Defaults to <MASESBrand /> when the
   * consumer supplies no content; supply content to override the
   * default (white-label builds, embedded surfaces, test harnesses).
   * See the file header §"Brand slot — default content (CR-BRAND1)".
   */
  brand?(): unknown;
  /** The AppHeader nav region. Typically breadcrumbs. */
  breadcrumbs?(): unknown;
  /**
   * Extra header actions rendered BEFORE the standard trio
   * (NotificationsBell, TenantSwitcher, UserMenu).
   */
  'header-actions'?(): unknown;
  /**
   * The AppFooter middle region. Defaults to <MASESFooterContent />
   * when the consumer supplies no content; supply content to override
   * the default (white-label builds, embedded surfaces, test
   * harnesses). See the file header §"Footer slot — default content
   * (CR-FOOTER1)".
   */
  footer?(): unknown;
  /** The page content. Rendered inside <main>. Required in practice. */
  default(): unknown;
}>();

// -----------------------------------------------------------------------------
// Tenant switching (internal — the shell updates the store directly)
// -----------------------------------------------------------------------------
const tenantStore = useTenantStore();

function onTenantSelect(payload: { id: number }): void {
  /*
   * The bootstrap $onAction subscription (Stage 12) listens for
   * setActiveTenant and invalidates tenant-scoped caches. AppShell
   * does not perform that invalidation itself.
   */
  tenantStore.setActiveTenant(payload.id);
}

// -----------------------------------------------------------------------------
// Mobile drawer open/close state (shell-owned)
// -----------------------------------------------------------------------------
const isMobileDrawerOpen = ref(false);

function openMobileDrawer(): void {
  isMobileDrawerOpen.value = true;
}

// -----------------------------------------------------------------------------
// Event forwarding
// -----------------------------------------------------------------------------
function onUserMenuSelect(payload: { id: string }): void {
  emit('user-menu-select', payload);
}

function onNotificationsOpen(): void {
  emit('notifications-open');
}

function onMaintenanceAction(): void {
  emit('maintenance-action');
}

function onMaintenanceDismiss(): void {
  emit('maintenance-dismiss');
}
</script>

<template>
  <div
    class="app-shell"
    :data-has-maintenance="maintenance ? 'true' : undefined"
    data-testid="app-shell-root"
  >
    <!-- ============================================================
         Skip to content (first focusable element)
         ============================================================ -->
    <SkipToContent
      :target-id="skipToContentTargetId"
      :label="labels.skipToContent"
    />

    <!-- ============================================================
         Maintenance banner (conditional)
         ============================================================ -->
    <MaintenanceBanner
      v-if="maintenance"
      :variant="maintenance.variant"
      :title="maintenance.title"
      :message="maintenance.message"
      :action-label="maintenance.actionLabel"
      :dismissible="maintenance.dismissible"
      :dismiss-label="maintenance.dismissLabel"
      @action="onMaintenanceAction"
      @dismiss="onMaintenanceDismiss"
    />

    <!-- ============================================================
         Header
         ============================================================ -->
    <AppHeader
      :mobile-menu-label="labels.mobileMenu"
      @open-mobile-menu="openMobileDrawer"
    >
      <template #brand>
        <slot name="brand">
          <MASESBrand />
        </slot>
      </template>

      <template #nav>
        <slot name="breadcrumbs" />
      </template>

      <template #actions>
        <slot name="header-actions" />

        <!--
          NotificationsBell is DISABLED until the §20.2 endpoints
          exist. When they land, change `:disabled="true"` to
          `:disabled="false"` (or remove the prop entirely).
        -->
        <NotificationsBell
          :disabled="true"
          :labels="labels.notificationsBell"
          @open="onNotificationsOpen"
        />

        <!--
          LanguageSelector (Unit 11.13) is deliberately NOT rendered
          here — Freeze §9.3 / §20.3. Add its import and composition
          when POST /api/locale exists.
        -->

        <TenantSwitcher
          :labels="labels.tenantSwitcher"
          @select="onTenantSelect"
        />

        <UserMenu
          :items="userMenuItems"
          :labels="labels.userMenu"
          @select="onUserMenuSelect"
        />
      </template>
    </AppHeader>

    <!-- ============================================================
         Body: sidebar + main
         ============================================================ -->
    <div
      class="app-shell__body"
      data-testid="app-shell-body"
    >
      <!-- ==========================================================
           Aside (sidebar + calendar)
           ========================================================== -->
      <aside
        class="app-shell__aside"
        data-testid="app-shell-aside"
      >
        <div class="app-shell__aside-nav">
          <AppSidebar
            :items="navItems"
            :labels="labels.sidebar"
          />
        </div>

        <div
          class="app-shell__aside-calendar"
          data-testid="app-shell-aside-calendar"
        >
          <CalendarContext />
        </div>
      </aside>

      <!-- ==========================================================
           Main (page content)
           ========================================================== -->
      <main
        :id="skipToContentTargetId"
        class="app-shell__main"
        tabindex="-1"
        data-testid="app-shell-main"
      >
        <div
          class="app-shell__content"
          data-testid="app-shell-content"
        >
          <slot />
        </div>
      </main>
    </div>

    <!-- ============================================================
         Footer
         ============================================================ -->
    <AppFooter
      :copyright="footerCopyright"
      :version="footerVersion"
    >
      <slot name="footer">
        <MASESFooterContent />
      </slot>
    </AppFooter>

    <!-- ============================================================
         Mobile drawer (teleported to <body> by the component)
         ============================================================ -->
    <AppMobileDrawer
      v-model:open="isMobileDrawerOpen"
      :items="navItems"
      :sidebar-labels="labels.sidebar"
      :labels="labels.drawer"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   A flex column: [maintenance?] header, body, footer. min-height forces
   the footer to the bottom of the viewport when content is short.
   ============================================================================ */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  font-family: inherit;
}

/* ============================================================================
   Body (aside + main)
   ---------------------------------------------------------------------------
   A flex row. The aside has a fixed width (via AppSidebar), the main
   takes the remaining space.
   ============================================================================ */
.app-shell__body {
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
  min-height: 0;
}

/* ============================================================================
   Aside (sidebar + calendar)
   ---------------------------------------------------------------------------
   MOBILE BASE: not rendered. The AppMobileDrawer replaces the aside on
   phones (opened by the header's toggle); the shell reserves no space
   for a persistent sidebar below 640px.
   ============================================================================ */
.app-shell__aside {
  display: none;
}

/* ============================================================================
   Aside — tablet and up
   ---------------------------------------------------------------------------
   Sticky, positioned below the header. The height is the viewport minus
   the header, so the aside's bottom edge aligns with the viewport's
   bottom edge when scrolled to top. Interior scroll lives in the
   AppSidebar (which owns overflow-y: auto) and in this column's own
   overflow, so the aside itself never exceeds its allotted height.
   ============================================================================ */
@media (min-width: 640px) {
  .app-shell__aside {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-self: flex-start;
    width: var(--mases-shell-sidebar-width);
    height: calc(100dvh - var(--mases-shell-header-height));
    position: sticky;
    top: var(--mases-shell-header-height);
    border-inline-end: 1px solid var(--mases-color-border-subtle);
    background-color: var(--mases-color-surface-raised);
    /*
     * `overflow: clip` (with a `hidden` fallback) keeps the aside's
     * contents from spilling past its own box without creating a
     * scroll container. `overflow-clip-margin` extends the clip region
     * slightly so a focus ring on the sidebar's first or last
     * focusable item is not clipped at the aside's edge.
     */
    overflow: hidden; /* fallback */
    overflow: clip;
    overflow-clip-margin: var(--mases-space-2);
  }
}

/*
 * The nav region stretches to fill the aside's remaining height. The
 * AppSidebar it contains already has height: 100% and its own
 * overflow-y: auto; we override only its inline-end border here,
 * because the aside itself now provides that border (with the border
 * spanning the calendar sub-region too).
 */
.app-shell__aside-nav {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.app-shell__aside-nav :deep(.app-sidebar) {
  border-inline-end: 0;
}

.app-shell__aside-calendar {
  flex-shrink: 0;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Main (page content)
   ---------------------------------------------------------------------------
   MOBILE BASE: mobile padding. Tablet and desktop layer up at their
   respective min-width breakpoints below.
   ============================================================================ */
.app-shell__main {
  flex: 1 1 auto;
  min-width: 0;
  padding-block: var(--mases-shell-content-padding-mobile);
  padding-inline: var(--mases-shell-content-padding-mobile);
  /*
   * The main landmark is a skip-link target, so keep a visible focus
   * indicator when keyboard navigation transfers focus here. The
   * semantic focus-ring token follows the active brand/theme palette.
   */
  outline: 3px solid transparent;
  outline-offset: -3px;
  border-radius: var(--mases-radius-md);
}

/* Tablet and up: tablet content padding. */
@media (min-width: 640px) {
  .app-shell__main {
    padding-block: var(--mases-shell-content-padding-tablet);
    padding-inline: var(--mases-shell-content-padding-tablet);
  }
}

/* Desktop and up: desktop content padding. */
@media (min-width: 1024px) {
  .app-shell__main {
    padding-block: var(--mases-shell-content-padding-desktop);
    padding-inline: var(--mases-shell-content-padding-desktop);
  }
}

.app-shell__main:focus-visible {
  outline-color: var(--mases-color-state-focus-ring);
}

.app-shell__content {
  /*
   * A wide-but-bounded content column, centered within <main>. The
   * value comes from --mases-container-page-wide (1440px), which sits
   * between the standard page container (1280px) and unconstrained
   * full-width — a compromise that keeps tables and dashboards from
   * stretching indefinitely on ultra-wide monitors without clipping
   * data-heavy pages on standard desktops.
   */
  width: 100%;
  max-width: var(--mases-container-page-wide);
  margin-inline: auto;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions that might add one.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .app-shell {
    /* no-op placeholder — see comment above */
  }
}

/* ============================================================================
   Forced-colors mode
   ---------------------------------------------------------------------------
   Preserve a readable shell surface and visible main-content keyboard focus
   when the operating system replaces author colors with a high-contrast
   palette. Child controls retain their own forced-colors rules.
   ============================================================================ */
@media (forced-colors: active) {
  .app-shell {
    background-color: Canvas;
    color: CanvasText;
  }

  .app-shell__main:focus-visible {
    outline-color: Highlight;
  }
}

</style>