<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailRoute.vue  (AMEND)
 Unit:      CR-LW3 — Workspace loan sub-resources (route wrapper)
 Delivery type:  Amendment — three dialog imports, one type import,
                 four new refs (three open-state booleans + one target),
                 three new event handlers, one watcher, three new
                 dialog components in the template, three new emit
                 listeners on the content view.
 Net lines:      +4 imports; +4 refs; +3 handlers; +1 watcher;
                 +~55 lines template; ~75 lines docblock.

 Before (v1.1.0):
   The wrapper owned the five CR-LW2 lifecycle dialogs. It listened
   for the detail view's five lifecycle emits, held one open-state ref
   per dialog, and reloaded the view after each `submitted` event via
   the view's exposed `reload()` method. Its template ref into the
   detail view (`detailRef`) and its `loanState` computed were in
   place. The wrapper had no knowledge of the sub-resource surface.

 After (v1.2.0):
   Three additional dialogs are owned by the wrapper, matching the
   three new emits the detail view gained in CR-LW3:

     · LoanRepaymentForm          — opened by the view's `@repay`
                                    intent. Submits to
                                    POST /api/loans/{loan}/repay.
     · LoanCollateralForm         — opened by the view's
                                    `@register-collateral` intent.
                                    Submits to
                                    POST /api/loans/{loan}/collateral.
     · LoanCollateralReleaseForm  — opened by the view's
                                    `@release-collateral` intent, whose
                                    payload carries the target
                                    collateral. Submits to
                                    POST /api/loans/{loan}/collateral/
                                    {collateral}/release.

   The wrapper:
     · holds three additional open-state refs,
     · holds a `releaseCollateralTarget: LoanCollateral | null` ref
       populated by the `@release-collateral` handler and cleared by a
       watcher on the release dialog's open flag,
     · renders the release dialog only when both `loanState !== null`
       and `releaseCollateralTarget !== null`,
     · calls the existing `reloadAfterWrite()` after every successful
       mutation, including the release.

   The two navigation controls the detail view gained in CR-LW3
   (schedule and statement links) are handled entirely inside the
   view via `useRouter`. The wrapper does not listen for them and
   requires no change for them.

 -----------------------------------------------------------------------------
 What is preserved
 -----------------------------------------------------------------------------
   · The five CR-LW2 dialog blocks in the template are byte-for-byte
     unchanged.
   · The `detailRef` template ref, the `loanState` computed, and the
     five CR-LW2 open-state refs are unchanged.
   · The five CR-LW2 event handlers and the `reloadAfterWrite()`
     helper are unchanged.
   · The wrapper's root element and its `data-testid` are unchanged.

 -----------------------------------------------------------------------------
 The release emit's payload
 -----------------------------------------------------------------------------
 The `@release-collateral` emit is the only CR-LW3 intent that carries
 a payload: `{ collateral: LoanCollateral }`. The wrapper captures the
 collateral into `releaseCollateralTarget` and passes it to the release
 dialog's `:collateral` prop. The prop is required and non-nullable on
 the dialog, so the template's `v-if` guards on the ref's non-null
 state in addition to the standard `loanState !== null` guard.

 The target ref is cleared by a watcher on `isReleaseCollateralOpen`:
 whenever the release dialog closes — after a successful submit, or
 after an Escape/backdrop dismissal — the target is reset. A stale
 target cannot survive into the next open.

 -----------------------------------------------------------------------------
 The reload path is unified
 -----------------------------------------------------------------------------
 `reloadAfterWrite()` remains the single `submitted` handler for all
 eight dialogs. The release dialog's `submitted` payload is ignored by
 the wrapper — the target-ref watcher handles the cleanup, and the
 reload itself does not need to know which dialog emitted. Vue's
 template type-checker accepts a zero-argument handler bound to an
 event with a payload (standard TypeScript function assignability: a
 function of fewer parameters is assignable to one of more).

 -----------------------------------------------------------------------------
 Navigation is not the wrapper's concern
 -----------------------------------------------------------------------------
 The detail view routes to `/loans/:id/schedule` and
 `/loans/:id/statement` directly. The wrapper neither intercepts the
 navigation nor remounts the view on route change — the two sub-resource
 routes are separate route registrations (CR-LW3 file 29) that mount
 their own views. The wrapper's lifetime is tied to `/loans/:id`.

 Dependency note:
   · Depends on the amended LoanDetailView.vue (CR-LW3 file 27) which
     emits the three new intents and navigates via `useRouter`.
   · Depends on the three new dialog components (CR-LW3 files 23–25).
   · Depends on the three new dialog label objects from `./labels`
     (CR-LW3 file 1): `loanRepaymentFormLabels`,
     `loanCollateralFormLabels`, `loanCollateralReleaseFormLabels`.
   · Depends on the `LoanCollateral` type from `./api` (v1.1.0,
     deployed).
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            this file only
 Files added:               none
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailRoute.vue  (AMEND)
 Unit:      CR-LW2 — Workspace loan dialogs (route wrapper)
 Delivery type:  Amendment — five dialog imports, five dialog
                 open-state refs, a template ref into the detail view,
                 five event handlers, a reload helper, five dialog
                 components in the template.
 Net lines:      +5 imports; +1 template ref; +1 computed; +5 refs;
                 +5 handlers; +1 reload helper; +~80 lines template;
                 ~40 lines docblock.

 Before (v1.0.0):
   A minimal pass-through wrapper. Its entire body:
     - imports `LoanDetailView` and `loanDetailViewLabels`,
     - renders the view with those labels.

   The wrapper owned NO dialogs. The detail view emitted nothing
   (CR-LW1 file 5's header §"No action buttons yet" recorded the
   reasoning). The wrapper's role over its lifetime was documented in
   its header as the extension point CR-LW2 would fill.

 After (v1.1.0):
   The wrapper owns the five lifecycle dialogs the detail view emits
   into:

     · LoanApproveForm      — approve
     · LoanRejectForm       — reject
     · LoanDisburseForm     — disburse
     · LoanRestructureForm  — restructure
     · LoanWriteOffForm     — write-off

   The wrapper:
     · holds a template ref to the detail view (`detailRef`),
     · reads the view's exposed `loan` through a `loanState` computed,
     · holds one open-state ref per dialog,
     · listens for the view's five emits and opens the matching dialog,
     · calls the view's exposed `reload()` after each dialog's
       `submitted` event.

   The pattern matches WalletDetailRoute.vue (v1.0.3) exactly:
   content view + wrapper owns dialogs + wrapper reads the view's
   exposed refs to feed the dialogs' props + wrapper reloads the view
   after each successful mutation.

 =============================================================================
 The five dialogs, not six
 =============================================================================
 This wrapper owns the five LIFECYCLE dialogs. The sixth dialog
 CR-LW2 delivers — LoanApplicationForm — is a list-page concern (it
 creates a new loan, which is not an operation on an existing loan).
 It is owned by LoanListView.vue (CR-LW2 file 10), not by this
 wrapper.

 The distinction follows the wallet feature's split:
   · WalletListView owns the wallet-open dialog (creates a new
     wallet).
   · WalletDetailRoute owns the five lifecycle dialogs (adjust,
     obligation, payment, allocation, allocation-reverse).

 See WalletListView.vue's header §"Purpose" and WalletDetailRoute.vue's
 header §"Purpose" for the two-part split's rationale.

 =============================================================================
 The wrapper's ref into the detail view
 =============================================================================
 The detail view's `defineExpose({ reload, loan })` (CR-LW2 file 8)
 exposes two members:
   · reload — the load function, called after each dialog succeeds.
   · loan   — the loan ref, read to feed each dialog's `:loan` prop.

 The wrapper's `loanState` computed reads `detailRef.value?.loan` and
 returns `null` until the view is mounted and the loan has loaded. The
 template's `v-if="loanState !== null"` guard on each dialog ensures no
 dialog renders until the loan value exists.

 The `reload` call is not awaited — see the header §"The reload call".

 =============================================================================
 The reload call
 =============================================================================
 `detailRef.value?.reload()` returns the promise from the detail
 view's `load()` function. The wrapper does NOT await it: the dialog's
 `submitted` event already fired, the dialog already closed itself,
 and the reload runs in the background. A user who immediately
 navigates away does not need to wait for the reload to complete.

 This matches WalletDetailRoute.vue's v1.0.2 behaviour (the
 `reloadAfterWrite` helper's docblock records the same reasoning).

 Dependency note:
   · Depends on the amended LoanDetailView.vue (CR-LW2 file 8) which
     exposes `{ reload, loan }` and emits the five lifecycle events.
   · Depends on the five dialog components (CR-LW2 files 3–7).
   · Depends on `loanDetailViewLabels` from `./labels` (CR-LW1
     file 3).
   · Depends on the five dialog label objects from `./labels`
     (CR-LW2 file 1).
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            this file only
 Files added:               none
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW1
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailRoute.vue  (NEW)
 Unit:      CR-LW1 — Workspace loan views (route wrapper)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The route tree (CR-LW1 file 7) will point
   the loan detail route at this path, matching the wallet feature's
   `WalletDetailRoute.vue` convention: every workspace detail route
   goes through a wrapper file that composes the content view and
   owns its dialogs.

 After (CR-LW1):
   A minimal route wrapper. Its entire body:
     - imports `LoanDetailView` and `loanDetailViewLabels`,
     - renders the view with those labels.

   The wrapper owns NO dialogs in CR-LW1. The detail view emits
   nothing (see CR-LW1 file 5's header §"No action buttons yet"), so
   there is nothing for the wrapper to listen for.

   The pattern matches WalletDetailRoute.vue's own evolution: it was
   delivered with five dialogs; the file was corrected once (1.0.1)
   to expose more of the detail view's refs, and once more (1.0.2)
   when its content was accidentally overwritten. This wrapper starts
   with zero dialogs by design and accumulates them in CR-LW2 (this
   file's 1.1.0 revision).

 Dependency note:
   · Depends on `LoanDetailView.vue` (CR-LW1 file 5).
   · Depends on `loanDetailViewLabels` from `./labels` (CR-LW1 file 3).
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none
 Routes registered:         none (declared by CR-LW1 file 7)

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanDetailRoute
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailRoute.vue
 Layer:     Features (Loan domain) — route wrapper
 Version:   1.2.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §22
            Loan domain Routes/api.php (A.84, verified against source)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.2.0  — sub-resource dialogs (CR-LW3):
          · The wrapper now also owns three sub-resource dialogs the
            detail view emits into: repayment, collateral register,
            collateral release.
          · A `releaseCollateralTarget` ref captures the payload of
            the `@release-collateral` emit.
          · A watcher clears the target when the release dialog
            closes.
          · No change to the five CR-LW2 dialogs, their refs, their
            handlers, or the `reloadAfterWrite()` helper.
          · No change to the wrapper's exports, its root element, or
            its test hooks.

 1.1.0  — lifecycle dialogs (CR-LW2):
          · The wrapper now owns the five lifecycle dialogs the detail
            view emits into: approve, reject, disburse, restructure,
            write-off.
          · A template ref to the detail view (`detailRef`) is
            introduced.
          · A `loanState` computed reads the view's exposed `loan`.
          · Five open-state refs — one per dialog.
          · Five event handlers matching the view's emits.
          · A `reloadAfterWrite` helper calls the view's exposed
            `reload()` after each dialog's `submitted` event.
          · No change to the wrapper's exports, its route registration
            path, or its root element's data-testid.

 1.0.0  — initial delivery (CR-LW1). A minimal pass-through wrapper with
          no dialogs. The detail view emitted nothing.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route-level component registered at `/loans/:id`. It composes
 the content view (LoanDetailView) with the eight dialogs that view
 emits into:

   · five lifecycle dialogs (CR-LW2): approve, reject, disburse,
     restructure, write-off;
   · three sub-resource dialogs (CR-LW3): repayment, collateral
     register, collateral release.

 Content and dialog ownership are deliberately separated:

   · LoanDetailView renders the page and emits *intents* — "the user
     clicked Approve", "the user clicked Write off".
   · LoanDetailRoute owns the dialogs' open/closed state and listens
     for the intents.

 That split lets LoanDetailView remain a pure content component (no
 modal lifecycle), and lets each dialog remain a pure form (no route
 coupling). The wrapper is the only place those two halves meet.

 -----------------------------------------------------------------------------
 The eight dialogs
 -----------------------------------------------------------------------------
 Each dialog is a controlled component: its `open` prop is a boolean
 ref owned here, and its `update:open` event flips that ref. On a
 successful submission the dialog emits `submitted`; the wrapper then
 asks the detail view to reload — reading its exposed `reload()` method
 via a template ref.

 The reload is what refreshes the sections (loan card, schedule card,
 collaterals card) after a write. Without it, a successful approval,
 repayment, or collateral change would leave the visible cards stale
 until a manual refresh.

 -----------------------------------------------------------------------------
 The release dialog's required collateral prop
 -----------------------------------------------------------------------------
 `LoanCollateralReleaseForm` requires a non-null `collateral` prop — it
 reads the collateral's id for the API call. The wrapper captures the
 target from the `@release-collateral` emit's payload into a
 `releaseCollateralTarget` ref and renders the dialog only when both
 the loan and the target are non-null.

 The target is cleared whenever the release dialog closes, so no stale
 collateral can survive into the next open. See the CR-LW3 change-
 verification block §"The release emit's payload".

 -----------------------------------------------------------------------------
 The sixth CR-LW2 dialog is owned elsewhere
 -----------------------------------------------------------------------------
 LoanApplicationForm — the sixth dialog CR-LW2 delivered — is owned by
 LoanListView.vue, not by this wrapper. It creates a new loan, which is
 not an operation on an existing loan. The same split governs the
 wallet feature: WalletListView owns the wallet-open dialog;
 WalletDetailRoute owns the wallet's lifecycle dialogs.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the labels module. The wrapper does
 not render strings of its own; it passes label objects down to the
 content view and to each dialog.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="loan-detail-route-root"     on the wrapper <div>
 data-testid="loan-detail-route-content"  on the LoanDetailView

 Each dialog carries its own root data-testid (see the CR-LW2 and
 CR-LW3 dialog files).

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 The wrapper renders a plain <div> and defers all accessibility to its
 children. LoanDetailView owns the page's <h1>, the three section
 cards, and their internal semantics. Each dialog (Modal-based) owns
 its focus trap and Escape handling.

 -----------------------------------------------------------------------------
 Reduced motion
 -----------------------------------------------------------------------------
 The wrapper defines no animation. Modal and Alert own their motion
 contracts.
=============================================================================
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import LoanDetailView from './LoanDetailView.vue';
import LoanApproveForm from './LoanApproveForm.vue';
import LoanRejectForm from './LoanRejectForm.vue';
import LoanDisburseForm from './LoanDisburseForm.vue';
import LoanRestructureForm from './LoanRestructureForm.vue';
import LoanWriteOffForm from './LoanWriteOffForm.vue';
import LoanRepaymentForm from './LoanRepaymentForm.vue';
import LoanCollateralForm from './LoanCollateralForm.vue';
import LoanCollateralReleaseForm from './LoanCollateralReleaseForm.vue';

import type { LoanCollateral } from './api';

import {
  loanDetailViewLabels,
  loanApproveFormLabels,
  loanRejectFormLabels,
  loanDisburseFormLabels,
  loanRestructureFormLabels,
  loanWriteOffFormLabels,
  loanRepaymentFormLabels,
  loanCollateralFormLabels,
  loanCollateralReleaseFormLabels,
} from './labels';

// -----------------------------------------------------------------------------
// Refs into the content view
// -----------------------------------------------------------------------------
/*
 * The detail view's `defineExpose({ reload, loan })` unwraps its refs,
 * so the wrapper reads plain values through the instance (not `Ref`
 * wrappers).
 *
 * `loanState` is `null` until the view is mounted and the loan has
 * loaded. The template's `v-if="loanState !== null"` guard on each
 * dialog ensures no dialog renders before the loan value exists.
 */
const detailRef = ref<InstanceType<typeof LoanDetailView> | null>(null);

const loanState = computed(() => detailRef.value?.loan ?? null);

// -----------------------------------------------------------------------------
// Dialog open state — one ref per dialog
// -----------------------------------------------------------------------------
// CR-LW2 lifecycle dialogs.
const isApproveOpen = ref(false);
const isRejectOpen = ref(false);
const isDisburseOpen = ref(false);
const isRestructureOpen = ref(false);
const isWriteOffOpen = ref(false);

// CR-LW3 sub-resource dialogs.
const isRepayOpen = ref(false);
const isRegisterCollateralOpen = ref(false);
const isReleaseCollateralOpen = ref(false);

/*
 * The release dialog requires a non-null collateral prop. The target
 * is captured from the `@release-collateral` emit's payload and
 * cleared whenever the dialog closes. See the file header
 * §"The release dialog's required collateral prop".
 */
const releaseCollateralTarget = ref<LoanCollateral | null>(null);

// -----------------------------------------------------------------------------
// Detail-view event handlers — open the matching dialog
// -----------------------------------------------------------------------------
function onApprove(): void {
  isApproveOpen.value = true;
}

function onReject(): void {
  isRejectOpen.value = true;
}

function onDisburse(): void {
  isDisburseOpen.value = true;
}

function onRestructure(): void {
  isRestructureOpen.value = true;
}

function onWriteOff(): void {
  isWriteOffOpen.value = true;
}

function onRepay(): void {
  isRepayOpen.value = true;
}

function onRegisterCollateral(): void {
  isRegisterCollateralOpen.value = true;
}

function onReleaseCollateral(payload: { collateral: LoanCollateral }): void {
  releaseCollateralTarget.value = payload.collateral;
  isReleaseCollateralOpen.value = true;
}

// -----------------------------------------------------------------------------
// Clear the release target when the release dialog closes
// -----------------------------------------------------------------------------
/*
 * Fires whether the dialog closed after a successful submit, after an
 * Escape/backdrop dismissal, or after any other close path. A stale
 * target cannot survive into the next open.
 */
watch(isReleaseCollateralOpen, (open) => {
  if (!open) releaseCollateralTarget.value = null;
});

// -----------------------------------------------------------------------------
// Reload after every successful mutation
// -----------------------------------------------------------------------------
/*
 * On any successful write the detail view is asked to reload. The
 * dialogs have already emitted `update:open: false` (each dialog
 * closes itself after `submitted`), so the wrapper only needs to
 * trigger the reload.
 *
 * `detailRef.value?.reload()` is called, not awaited: the reload runs
 * in the background. A user who immediately navigates away does not
 * need to wait for the reload to complete.
 *
 * The handler is bound to every dialog's `submitted` event. Vue's
 * template type-checker accepts a zero-argument handler bound to an
 * event that carries a payload (standard TypeScript function
 * assignability: fewer parameters is assignable to more).
 */
function reloadAfterWrite(): void {
  void detailRef.value?.reload();
}
</script>

<template>
  <div
    class="loan-detail-route"
    data-testid="loan-detail-route-root"
  >
    <!-- ============================================================
         Content view
         ============================================================ -->
    <LoanDetailView
      ref="detailRef"
      :labels="loanDetailViewLabels"
      data-testid="loan-detail-route-content"
      @approve="onApprove"
      @reject="onReject"
      @disburse="onDisburse"
      @restructure="onRestructure"
      @write-off="onWriteOff"
      @repay="onRepay"
      @register-collateral="onRegisterCollateral"
      @release-collateral="onReleaseCollateral"
    />

    <!-- ============================================================
         Dialog 1 — Approve (CR-LW2 file 3)
         ============================================================ -->
    <LoanApproveForm
      v-if="loanState !== null"
      v-model:open="isApproveOpen"
      :loan="loanState"
      :labels="loanApproveFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 2 — Reject (CR-LW2 file 4)
         ============================================================ -->
    <LoanRejectForm
      v-if="loanState !== null"
      v-model:open="isRejectOpen"
      :loan="loanState"
      :labels="loanRejectFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 3 — Disburse (CR-LW2 file 5)
         ============================================================ -->
    <LoanDisburseForm
      v-if="loanState !== null"
      v-model:open="isDisburseOpen"
      :loan="loanState"
      :labels="loanDisburseFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 4 — Restructure (CR-LW2 file 6)
         ============================================================ -->
    <LoanRestructureForm
      v-if="loanState !== null"
      v-model:open="isRestructureOpen"
      :loan="loanState"
      :labels="loanRestructureFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 5 — Write off (CR-LW2 file 7)
         ============================================================ -->
    <LoanWriteOffForm
      v-if="loanState !== null"
      v-model:open="isWriteOffOpen"
      :loan="loanState"
      :labels="loanWriteOffFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 6 — Record repayment (CR-LW3)
         ============================================================ -->
    <LoanRepaymentForm
      v-if="loanState !== null"
      v-model:open="isRepayOpen"
      :loan="loanState"
      :labels="loanRepaymentFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 7 — Register collateral (CR-LW3)
         ============================================================ -->
    <LoanCollateralForm
      v-if="loanState !== null"
      v-model:open="isRegisterCollateralOpen"
      :loan="loanState"
      :labels="loanCollateralFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 8 — Release collateral (CR-LW3)
         ============================================================ -->
    <LoanCollateralReleaseForm
      v-if="loanState !== null && releaseCollateralTarget !== null"
      v-model:open="isReleaseCollateralOpen"
      :loan="loanState"
      :collateral="releaseCollateralTarget"
      :labels="loanCollateralReleaseFormLabels"
      @submitted="reloadAfterWrite"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.loan-detail-route {
  display: block;
  width: 100%;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-detail-route {
    /* no-op placeholder */
  }
}
</style>