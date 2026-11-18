<!--
=============================================================================
 MASES Phase 2 UI — LauncherRoute
=============================================================================

 File:      mase_app/src/router/pages/LauncherRoute.vue
 Layer:     Core (router page)
 Version:   1.0.3
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §13.2, §14.3, §20.1

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 12, Unit 12.12)
 1.0.1  — refactored to a pure content page (Stage 14, Unit 14.5):
          · The AppShell composition, the nav tree, the user menu
            items, the shell labels, and the logout handler all moved
            to AuthenticatedLayout. This page now renders only its
            own content.
          · No behavior change: the launcher page still shows
            LauncherGrid inside the shell.

 1.0.2  — Amharic-first launcher labels (Unit L-2):
          · The five inline English grid labels are removed.
          · The labels are now imported from @/router/launcher-labels,
            which supplies them as Amharic constants matching the
            Amharic-first policy established by auth-labels.ts.
          · The `<script lang="ts">` block is removed. Its only
            purpose was to import the LauncherGridLabels type so the
            inline object could be annotated; now that the const
            lives in launcher-labels.ts, no type import is needed
            here.
          · No behavior change. No template change. No prop change.
          · LauncherGrid.vue is deliberately NOT modified. The
            LauncherGridLabels type it exports continues to be the
            contract both this file and launcher-labels.ts agree on.

 1.0.3  — launcher fetch state wired (Unit L-7):
          · The page now imports useLauncherFetchState from
            @/features/launcher/service and binds its three returns
            into LauncherGrid: :loading, :error, and @retry.
          · On mount, ensureLoaded() consults the store's cache
            freshness and fetches only when the cache is missing or
            stale. Navigating away and back within the 5-minute TTL
            renders the grid immediately from the cache.
          · @retry is bound to the composable's retry(), which
            bypasses the cache-freshness check and re-fetches
            unconditionally — the user's explicit action after the
            error state.
          · This closes launcher gap G4: before this revision, the
            page passed neither loading nor error to LauncherGrid, so
            the grid's loading and error render paths were
            unreachable at this call site. They are now reachable.
          · No prop shape change on LauncherGrid; the two new
            bindings use props and emits the grid already declares.
          · LauncherGrid.vue is deliberately NOT modified.
          · The 404-as-empty behavior for GET /api/launcher is
            implemented in the service (L-6), not here. See that
            file's header for the interim behavior while the backend
            endpoint is pending deployment.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /launcher route's content. Renders LauncherGrid (Unit 11.19)
 inside the shared AuthenticatedLayout (which provides AppShell).

 -----------------------------------------------------------------------------
 Where the grid labels live now
 -----------------------------------------------------------------------------
 Prior to 1.0.2, this file declared the five LauncherGridLabels values
 inline, in English. They now live in router/launcher-labels.ts as
 Amharic constants, in the same shape and with the same rationale as
 router/auth-labels.ts.

 The relocation is not a cosmetic refactor. It places the launcher's
 user-facing strings under the Amharic-first policy that the auth
 batch already implements, and it makes the launcher's label set
 discoverable alongside the auth label set — a maintainer looking for
 "where are the launcher's strings?" finds them in router/, next to
 auth-labels.ts, rather than embedded in a page component.

 -----------------------------------------------------------------------------
 Where the fetch state lives now
 -----------------------------------------------------------------------------
 The grid's :loading and :error props are supplied by the composable
 useLauncherFetchState (from @/features/launcher/service, L-6). That
 composable creates two refs, exposes them, and returns them together
 with the two async actions (ensureLoaded, retry) that drive them.

 The composable is a plain function, not a Pinia store. The store
 (mase_app/src/stores/launcher.ts) continues to own the list itself
 and its cache-freshness metadata; the composable owns the per-attempt
 loading/error state. This split is required by the store's own header
 comment, which explicitly assigns loading state to a per-call
 composable (§25.1) rather than to the store.

 -----------------------------------------------------------------------------
 Mount and retry — the two entry points
 -----------------------------------------------------------------------------
 ensureLoaded() (on mount):
   Consults the store's hasFetched and isStale getters. Fetches only
   when the cache is missing or stale. On a fresh mount after the TTL
   has expired, this performs a fetch; on a fresh mount within the
   TTL window, it is a no-op and the grid renders from the cache.

 retry() (bound to @retry):
   Fetches unconditionally. This is the user's explicit re-attempt
   after the error state, so the cache-freshness check is bypassed.

 Both paths funnel through the composable's shared doFetch() so the
 "clear error before fetch" and "clear loading after fetch" rules
 are expressed exactly once.

 -----------------------------------------------------------------------------
 The i18n gap — resolved for this file
 -----------------------------------------------------------------------------
 Prior to 1.0.2, this file was listed alongside AuthenticatedLayout.vue
 and auth-labels.ts as having inline English labels pending i18n
 migration. The Amharic-first pass covers the launcher grid labels.
 The remaining English surfaces (shell chrome, portal, files,
 shareholders) are addressed by their own units.

 When a full i18n service is introduced (a future CR), the change is
 confined to router/launcher-labels.ts — this file does not change,
 and neither does LauncherGrid.vue.

 -----------------------------------------------------------------------------
 What this file does NOT do
 -----------------------------------------------------------------------------
   - It does NOT fetch data directly. The fetch is performed by the
     service module (@/features/launcher/service); this file only
     calls the composable's two entry points and binds its refs.
   - It does NOT compose the shell. AuthenticatedLayout owns the
     AppShell composition.
   - It does NOT declare route metadata. The /launcher route is
     declared in router/routes-workspace.ts.
   - It does NOT classify errors. The composable stores whatever the
     service throws; LauncherGrid renders its error state for any
     non-null error value.
   - It does NOT declare user-facing strings. Every string the grid
     renders comes from router/launcher-labels.ts.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 This file contributes no user-facing text. The grid's strings come
 from launcherGridLabels (imported from router/launcher-labels.ts).
=============================================================================
-->

<script setup lang="ts">
import { onMounted } from 'vue';

import LauncherGrid from '@/layouts/AppShell/LauncherGrid';
import { launcherGridLabels } from '@/router/launcher-labels';
import { useLauncherFetchState } from '@/features/launcher/service';

// -----------------------------------------------------------------------------
// Fetch state
// -----------------------------------------------------------------------------
/*
 * The composable returns two refs the grid consumes as props and two
 * async actions this page wires to mount and to the grid's @retry
 * emit. See the file header comment §"Where the fetch state lives now".
 *
 * Destructured once, at setup. Vue's reactivity is preserved because
 * the composable returns refs, not plain values — destructuring a ref
 * from an object does not lose its reactivity.
 */
const { loading, error, ensureLoaded, retry } = useLauncherFetchState();

// -----------------------------------------------------------------------------
// Mount
// -----------------------------------------------------------------------------
/*
 * ensureLoaded() consults the store's cache freshness and fetches only
 * when the cache is missing or stale. The action is async; we do not
 * await it in onMounted because the mount itself does not need to
 * block — the composable's refs update as the fetch settles, and the
 * grid re-renders reactively.
 *
 * The `void` operator makes the non-awaited call explicit to linters
 * and readers, matching the pattern used by useMyShareholder.ts and
 * every page-level loader in the shareholders and files features.
 */
onMounted(() => {
  void ensureLoaded();
});
</script>

<template>
  <LauncherGrid
    :labels="launcherGridLabels"
    :loading="loading"
    :error="error"
    @retry="retry"
  />
</template>