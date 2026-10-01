<!--
=============================================================================
 MASES Phase 2 UI — ShareholderFormRoute
=============================================================================

 File:      mase_app/src/router/pages/ShareholderFormRoute.vue
 Layer:     Core (router page)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §14.3

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The route wrapper for /shareholders/new and /shareholders/:id/edit.
 Composes ShareholderForm (Unit 15.5) and handles its two emits:

   @cancel     →  navigates back to the shareholder list (create mode)
                  or the shareholder detail (edit mode)
   @submitted  →  navigates to the shareholder detail for the created
                  or updated shareholder

 -----------------------------------------------------------------------------
 Why a wrapper
 -----------------------------------------------------------------------------
 ShareholderForm emits intents rather than navigating itself. The
 wrapper owns the navigation decisions, which differ by mode.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 This wrapper renders no visible strings of its own.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ShareholderForm from '@/features/shareholders/ShareholderForm';
import { shareholderFormLabels } from '@/features/shareholders/labels';
import type { Shareholder } from '@/features/shareholders/api';

const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Mode
// -----------------------------------------------------------------------------
const editId = computed<number | null>(() => {
  const raw = route.params.id;
  const s = typeof raw === 'string' ? raw : '';
  if (s === '') return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
});

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------
async function onCancel(): Promise<void> {
  if (editId.value !== null) {
    await router.push(`/shareholders/${editId.value}`);
  } else {
    await router.push('/shareholders');
  }
}

async function onSubmitted(payload: { shareholder: Shareholder }): Promise<void> {
  await router.push(`/shareholders/${payload.shareholder.id}`);
}
</script>

<template>
  <ShareholderForm
    :labels="shareholderFormLabels"
    @cancel="onCancel"
    @submitted="onSubmitted"
  />
</template>