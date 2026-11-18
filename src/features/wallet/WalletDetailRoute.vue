<!--
=============================================================================
 MASES Phase 2 UI — WalletDetailRoute
=============================================================================

 File:      mase_app/src/features/wallet/WalletDetailRoute.vue
 Layer:     Features (Wallet domain) — route wrapper
 Version:   1.0.3
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §22
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (WF-9b). Route wrapper for /wallets/:id.
          Owns the five dialogs the WalletDetailView emits into:
          adjust, obligation, payment, allocation, allocation-reverse.

 1.0.1  — re-issued. Wider defineExpose contract on WalletDetailView:
          the wrapper reads `wallet`, `payments`, `obligations` (in
          addition to `reload`) to feed the dialogs' props.

 1.0.2  — reconstruction. The file on disk was overwritten during the
          Phase 2 UI session with the contents of WalletAdjustForm.vue,
          which caused a TypeError at setup
          (`can't access property "dialogTitle", e.labels is undefined`)
          on every /wallets/:id navigation. This revision re-issued the
          file to match the contracts declared by WalletDetailView.vue
          (WF-9 1.0.2) and each dialog (WF-7, WF-8, WF-10, WF-11,
          WF-12, WF-13).

 1.0.3  — compile fix. The 1.0.2 reconstruction included a top
          `<script lang="ts">` block whose sole content was:

              export type { WalletDetailRouteLabels } from './labels';

          The `WalletDetailRouteLabels` symbol does not exist in
          `./labels` — that module exports the nine per-surface label
          interfaces (WalletSharedLabels, WalletListViewLabels,
          WalletDetailViewLabels, WalletOpenFormLabels,
          WalletAdjustFormLabels, WalletObligationFormLabels,
          WalletPaymentFormLabels, WalletAllocationFormLabels,
          WalletAllocationReverseDialogLabels,
          WalletStatementViewLabels) and their concrete value objects,
          but no composite "route" label type.

          The re-export caused `vue-tsc --noEmit` to fail the build
          with TS2305, which prevented Vite from emitting a new
          `dist/`, which in turn caused the previous build's chunks
          (including the broken WalletDetailRoute chunk) to be
          redeployed unchanged.

          The fix removes the top `<script lang="ts">` block entirely.
          A route wrapper that owns only dialogs has no exported type
          of its own; consumers of this module import from `./labels`
          directly. The `<script setup>` block below is unchanged.

          No other change. The imports from `./labels`, the dialog
          wiring, the reload contract, the template, and the styles
          are byte-for-byte identical to 1.0.2.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route-level component registered at `/wallets/:id`. Its single
 responsibility is to compose the content view (WalletDetailView,
 WF-9) with the five dialogs that view emits into (WF-7, WF-8, WF-10,
 WF-11, WF-12, WF-13).

 Content and dialog ownership are deliberately separated:

   · WalletDetailView renders the page and emits *intents* — "the user
     clicked Adjust", "the user clicked Reverse on allocation 7".
   · WalletDetailRoute owns the dialogs' open/closed state and the
     reverse target, listens for the intents, and opens the matching
     dialog.

 That split lets WalletDetailView remain a pure content component (no
 modal lifecycle), and lets each dialog remain a pure form (no route
 coupling). The wrapper is the only place those two halves meet.

 -----------------------------------------------------------------------------
 Dialog lifecycle
 -----------------------------------------------------------------------------
 Each dialog is a controlled component: its `open` prop is a boolean ref
 owned here, and its `update:open` event flips that ref. On a successful
 submission the dialog emits `submitted`; the wrapper:

   1. closes the dialog, and
   2. asks the detail view to reload — reading its exposed `reload()`
      method via a template ref.

 The reload is what refreshes the sections (balance, obligations,
 payments, allocations, entries) after a write. Without it, a successful
 adjustment would leave the visible balance stale until a manual refresh.

 -----------------------------------------------------------------------------
 Reverse-allocation target
 -----------------------------------------------------------------------------
 The reverse emit carries the target allocation, because a reverse
 dialog is scoped to one allocation and cannot be opened without one.
 The wrapper stashes the payload in a local ref and passes it to
 WalletAllocationReverseDialog's `:allocation` prop. The dialog is
 rendered only when both `isReverseOpen` is true and a target is set —
 see the v-if guard on the dialog's mount.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the labels module. The wrapper does
 not render strings of its own; it passes label objects down to the
 content view and to each dialog.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="wallet-detail-route-root"     on the wrapper <div>
 data-testid="wallet-detail-route-content"  on the WalletDetailView

 Each dialog carries its own root data-testid (see WF-7, WF-8, WF-10,
 WF-11, WF-12, WF-13).

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 The wrapper renders a plain <div> and defers all accessibility to
 its children. WalletDetailView owns the page's <h1>, sections, and
 tables. Each dialog (Modal-based) owns its focus trap and Escape
 handling.

 -----------------------------------------------------------------------------
 Reduced motion
 -----------------------------------------------------------------------------
 The wrapper defines no animation. Modal and Alert own their motion
 contracts.
=============================================================================
-->

<script setup lang="ts">
import { computed, ref } from 'vue';

import WalletDetailView from './WalletDetailView.vue';
import WalletAdjustForm from './WalletAdjustForm.vue';
import WalletObligationForm from './WalletObligationForm.vue';
import WalletPaymentForm from './WalletPaymentForm.vue';
import WalletAllocationForm from './WalletAllocationForm.vue';
import WalletAllocationReverseDialog from './WalletAllocationReverseDialog.vue';

import type { WalletAllocation } from './api';
import {
  walletDetailViewLabels,
  walletAdjustFormLabels,
  walletObligationFormLabels,
  walletPaymentFormLabels,
  walletAllocationFormLabels,
  walletAllocationReverseDialogLabels,
} from './labels';

// -----------------------------------------------------------------------------
// Refs into the content view
// -----------------------------------------------------------------------------
/*
 * The detail view's `defineExpose` unwraps its refs, so the wrapper
 * reads plain values through the instance (not `Ref` wrappers). See
 * WalletDetailView 1.0.2 §"Expose the reload action AND the three
 * state refs".
 */
const detailRef = ref<InstanceType<typeof WalletDetailView> | null>(null);

const walletState = computed(() => detailRef.value?.wallet ?? null);
const paymentsState = computed(() => detailRef.value?.payments ?? []);
const obligationsState = computed(() => detailRef.value?.obligations ?? []);

// -----------------------------------------------------------------------------
// Dialog open state
// -----------------------------------------------------------------------------
const isAdjustOpen = ref(false);
const isObligationOpen = ref(false);
const isPaymentOpen = ref(false);
const isAllocationOpen = ref(false);
const isReverseOpen = ref(false);

/*
 * The reverse dialog's target. Set when the detail view emits
 * `reverse-allocation`; cleared when the dialog closes so a future
 * open does not flash a stale allocation.
 */
const reverseTarget = ref<WalletAllocation | null>(null);

// -----------------------------------------------------------------------------
// Detail-view event handlers
// -----------------------------------------------------------------------------
function onAdjust(): void {
  isAdjustOpen.value = true;
}

function onRecordObligation(): void {
  isObligationOpen.value = true;
}

function onRecordPayment(): void {
  isPaymentOpen.value = true;
}

function onRecordAllocation(): void {
  isAllocationOpen.value = true;
}

function onReverseAllocation(payload: { allocation: WalletAllocation }): void {
  reverseTarget.value = payload.allocation;
  isReverseOpen.value = true;
}

// -----------------------------------------------------------------------------
// Dialog lifecycle handlers
// -----------------------------------------------------------------------------
/*
 * On any successful write the detail view is asked to reload. The
 * dialogs have already emitted `update:open: false` (each dialog
 * closes itself after `submitted` — see the dialog docblocks), so the
 * wrapper only needs to trigger the reload.
 *
 * `detailRef.value?.reload()` is a call, not an awaited promise, because
 * WalletDetailView's `reload` is `load()` — an async function whose
 * promise is not awaited by `defineExpose`. A caller that wants to
 * observe the reload's completion should use the promise the exposed
 * method returns; the wrapper does not.
 */
function reloadAfterWrite(): void {
  void detailRef.value?.reload();
}

function onReverseClosed(value: boolean): void {
  isReverseOpen.value = value;
  if (!value) {
    reverseTarget.value = null;
  }
}
</script>

<template>
  <div
    class="wallet-detail-route"
    data-testid="wallet-detail-route-root"
  >
    <!-- ============================================================
         Content view (WF-9)
         ============================================================ -->
    <WalletDetailView
      ref="detailRef"
      :labels="walletDetailViewLabels"
      data-testid="wallet-detail-route-content"
      @adjust="onAdjust"
      @record-obligation="onRecordObligation"
      @record-payment="onRecordPayment"
      @record-allocation="onRecordAllocation"
      @reverse-allocation="onReverseAllocation"
    />

    <!-- ============================================================
         Dialog 1 — Adjust balance (WF-8)
         ============================================================ -->
    <WalletAdjustForm
      v-if="walletState !== null"
      v-model:open="isAdjustOpen"
      :wallet="walletState"
      :labels="walletAdjustFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 2 — Record obligation (WF-10)
         ============================================================ -->
    <WalletObligationForm
      v-if="walletState !== null"
      v-model:open="isObligationOpen"
      :wallet="walletState"
      :labels="walletObligationFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 3 — Record payment (WF-11)
         ============================================================ -->
    <WalletPaymentForm
      v-if="walletState !== null"
      v-model:open="isPaymentOpen"
      :wallet="walletState"
      :labels="walletPaymentFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 4 — Record allocation (WF-12)
         ============================================================ -->
    <WalletAllocationForm
      v-if="walletState !== null"
      v-model:open="isAllocationOpen"
      :wallet="walletState"
      :payments="paymentsState"
      :obligations="obligationsState"
      :labels="walletAllocationFormLabels"
      @submitted="reloadAfterWrite"
    />

    <!-- ============================================================
         Dialog 5 — Reverse allocation (WF-13)
         ============================================================ -->
    <WalletAllocationReverseDialog
      v-if="walletState !== null && reverseTarget !== null"
      :open="isReverseOpen"
      :wallet="walletState"
      :allocation="reverseTarget"
      :labels="walletAllocationReverseDialogLabels"
      @update:open="onReverseClosed"
      @submitted="reloadAfterWrite"
    />
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.wallet-detail-route {
  display: block;
  width: 100%;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-detail-route {
    /* no-op placeholder */
  }
}
</style>