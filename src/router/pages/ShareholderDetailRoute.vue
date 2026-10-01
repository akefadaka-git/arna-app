<!--
=============================================================================
 MASES Phase 2 UI — ShareholderDetailRoute
=============================================================================

 File:      mase_app/src/router/pages/ShareholderDetailRoute.vue
 Layer:     Core (router page)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §14.3

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /shareholders/:id. Composes
 ShareholderDetailView (Unit 15.4) with the three dialogs it opens via
 emits:

   @edit                →  router.push(`/shareholders/:id/edit`)
   @issue-certificate   →  opens CertificateIssueForm (Unit 15.7)
   @cancel-certificate  →  opens CertificateCancelDialog (Unit 15.8)
   @record-entry        →  opens HoldingEntryForm (Unit 15.9)

 On a successful dialog submission or cancellation, the wrapper calls
 the detail view's exposed reload() to refresh the affected sections.

 -----------------------------------------------------------------------------
 Why a wrapper
 -----------------------------------------------------------------------------
 ShareholderDetailView (Unit 15.4) and the three dialogs (15.7–15.9) are
 designed with an emit contract rather than a navigation contract.
 Composing them here keeps the view and the dialogs each focused on
 their own concern; the wrapper owns the flow between them.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 This wrapper renders no visible strings of its own. The composed
 components supply all their strings via their own `labels` props.
=============================================================================
-->

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ShareholderDetailView from '@/features/shareholders/ShareholderDetailView';
import CertificateIssueForm from '@/features/shareholders/CertificateIssueForm';
import CertificateCancelDialog from '@/features/shareholders/CertificateCancelDialog';
import HoldingEntryForm from '@/features/shareholders/HoldingEntryForm';

import {
  shareholderDetailViewLabels,
  certificateIssueFormLabels,
  certificateCancelDialogLabels,
  holdingEntryFormLabels,
} from '@/features/shareholders/labels';

import type { ShareCertificate } from '@/features/shareholders/api';

const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
/*
 * The :id path parameter is guaranteed by the route definition — Vue
 * Router does not match /shareholders/:id without a value. Parse to a
 * number for the dialogs, which take a numeric prop.
 */
function parseRouteId(): number | null {
  const raw = route.params.id;
  const s = typeof raw === 'string' ? raw : '';
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const shareholderId = ref<number | null>(parseRouteId());

// -----------------------------------------------------------------------------
// Detail view ref — the wrapper calls the view's exposed reload() after
// a successful dialog.
// -----------------------------------------------------------------------------
const detailRef = ref<{ reload: () => void } | null>(null);

function reloadDetail(): void {
  detailRef.value?.reload();
}

// -----------------------------------------------------------------------------
// Dialog open state
// -----------------------------------------------------------------------------
const issueOpen = ref<boolean>(false);
const recordOpen = ref<boolean>(false);
const cancelOpen = ref<boolean>(false);
const cancelTarget = ref<ShareCertificate | null>(null);

// -----------------------------------------------------------------------------
// Emit handlers
// -----------------------------------------------------------------------------
async function onEdit(): Promise<void> {
  if (shareholderId.value === null) return;
  await router.push(`/shareholders/${shareholderId.value}/edit`);
}

function onIssueCertificate(): void {
  issueOpen.value = true;
}

function onCancelCertificate(payload: { certificate: ShareCertificate }): void {
  cancelTarget.value = payload.certificate;
  cancelOpen.value = true;
}

function onRecordEntry(): void {
  recordOpen.value = true;
}

// -----------------------------------------------------------------------------
// Dialog success handlers — refresh the detail view, close the dialog
// -----------------------------------------------------------------------------
function onCertificateIssued(): void {
  reloadDetail();
}

function onCertificateCancelled(): void {
  reloadDetail();
  cancelTarget.value = null;
}

function onEntryRecorded(): void {
  reloadDetail();
}
</script>

<template>
  <div data-testid="shareholder-detail-route-root">
    <ShareholderDetailView
      v-if="shareholderId !== null"
      ref="detailRef"
      :labels="shareholderDetailViewLabels"
      @edit="onEdit"
      @issue-certificate="onIssueCertificate"
      @cancel-certificate="onCancelCertificate"
      @record-entry="onRecordEntry"
    />

    <!-- ============================================================
         Dialogs — only rendered when a valid shareholder id exists
         ============================================================ -->
    <template v-if="shareholderId !== null">
      <CertificateIssueForm
        v-model:open="issueOpen"
        :shareholder-id="shareholderId"
        :labels="certificateIssueFormLabels"
        @submitted="onCertificateIssued"
      />

      <HoldingEntryForm
        v-model:open="recordOpen"
        :shareholder-id="shareholderId"
        :labels="holdingEntryFormLabels"
        @submitted="onEntryRecorded"
      />

      <CertificateCancelDialog
        v-if="cancelTarget !== null"
        v-model:open="cancelOpen"
        :certificate="cancelTarget"
        :labels="certificateCancelDialogLabels"
        @cancelled="onCertificateCancelled"
      />
    </template>
  </div>
</template>