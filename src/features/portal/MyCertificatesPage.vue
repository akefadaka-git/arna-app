<!--
=============================================================================
 MASES Phase 2 UI — MyCertificatesPage
=============================================================================

 File:      mase_app/src/features/portal/MyCertificatesPage.vue
 Layer:     Features (Portal)
 Version:   1.1.0
 Status:    FROZEN
 Authority: Stage 15.12 (original); P3 · Unit 2 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-G). Four-column table
          (number, class, status, issued) with the five-state page machine.
 1.1.0  — Ethiopian calendar date rendering (P3 · Unit 2):
          · The local `formatDate()` helper is removed.
          · The certificate table's `issued` column now renders the
            backend-supplied `issued_at_display` field, which carries
            the locale-appropriate medium Ethiopian form
            (`ሐምሌ 9, 2018 ዓ.ም. (July 16, 2026)` for `am`,
             `Hamle 9, 2018 E.C. (July 16, 2026)` for `en`).
          · No structural change. No new labels. No new state. The
            table layout, states, and column set are unchanged.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the authenticated user's own share certificates — one row per
 certificate issued to them.

 Reads the shareholder id from the provided useMyShareholder state and
 calls `listCertificates(shareholderId)`. Same contract as
 MyShareholdingsPage: no re-fetch of identity, no client-supplied id,
 no direct API-client use.

 -----------------------------------------------------------------------------
 The five states — same shape as MyShareholdingsPage
 -----------------------------------------------------------------------------
   loading   — identity loading OR certificates idle/loading
   unlinked  — identity unlinked (shared unlinked panel)
   error     — identity error OR certificates error; retry is state-aware
   empty     — identity linked, certificates loaded, zero items
   ready     — identity linked, certificates loaded, one or more items

 -----------------------------------------------------------------------------
 Date rendering (P3 · Unit 2)
 -----------------------------------------------------------------------------
 The certificate table's `issued` column renders `issued_at_display`,
 the backend-supplied medium Ethiopian form. The frontend does no date
 formatting of its own. The ISO `issued_at` field remains available on
 the wire for consumers that need a machine-readable instant; this
 page does not use it.

 The page displays only the `issued_at` timestamp today. The certificate
 payload also carries `cancelled_at`, `created_at`, and `updated_at`,
 each with a `_display` sibling, but the current table does not render
 them. If a future CR adds columns for those fields, it reads the
 corresponding `_display` values directly — no frontend formatting is
 needed.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
import type { MyCertificatesPageLabels } from './labels';
export type { MyCertificatesPageLabels };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { useMyShareholder } from './useMyShareholder';
import { listCertificates } from '@/features/shareholders/service';
import type { ShareCertificate } from '@/features/shareholders/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: MyCertificatesPageLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Identity state (provided by PortalLayout)
// -----------------------------------------------------------------------------
const { state: identityState, shareholder, load: loadIdentity } =
  useMyShareholder();

// -----------------------------------------------------------------------------
// Certificates data state (page-local)
// -----------------------------------------------------------------------------
type DataState = 'idle' | 'loading' | 'ready' | 'error';

const certificates = ref<readonly ShareCertificate[]>([]);
const dataState = ref<DataState>('idle');
const dataError = ref<unknown | null>(null);

async function loadCertificates(shareholderId: number): Promise<void> {
  dataState.value = 'loading';
  dataError.value = null;

  try {
    certificates.value = await listCertificates(shareholderId);
    dataState.value = 'ready';
  } catch (err) {
    dataError.value = err;
    certificates.value = [];
    dataState.value = 'error';
  }
}

watch(
  shareholder,
  (s) => {
    if (s !== null && dataState.value === 'idle') {
      void loadCertificates(s.id);
    }
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Page state — the union of identity and data states
// -----------------------------------------------------------------------------
type PageState = 'loading' | 'unlinked' | 'error' | 'empty' | 'ready';

const pageState = computed<PageState>(() => {
  if (identityState.value === 'loading') return 'loading';
  if (identityState.value === 'unlinked') return 'unlinked';
  if (identityState.value === 'error') return 'error';

  // identity is 'linked' from here on
  if (dataState.value === 'idle' || dataState.value === 'loading') {
    return 'loading';
  }
  if (dataState.value === 'error') return 'error';
  if (certificates.value.length === 0) return 'empty';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Retry — state-aware
// -----------------------------------------------------------------------------
function retry(): void {
  if (shareholder.value === null) {
    void loadIdentity();
    return;
  }
  void loadCertificates(shareholder.value.id);
}

// -----------------------------------------------------------------------------
// Table columns
// -----------------------------------------------------------------------------
const columns = computed<readonly DataTableColumn[]>(() => [
  { key: 'number', label: props.labels.columnNumber, align: 'start' },
  { key: 'class', label: props.labels.columnClass, align: 'start' },
  { key: 'status', label: props.labels.columnStatus, align: 'start' },
  { key: 'issued', label: props.labels.columnIssued, align: 'start' },
]);

/*
 * DataTable's row callback is currently typed `(row: unknown) => string
 * | number` (non-generic). This function accepts `unknown` to match
 * and narrows internally to ShareCertificate.
 */
function rowKey(row: unknown): string {
  return String((row as ShareCertificate).id);
}

/*
 * Cast helper for DataTable's non-generic cell slots.
 *
 * DataTable currently types the slot payload's `row` as `unknown`. This
 * helper narrows it back to ShareCertificate at the point of use.
 * Remove once DataTable accepts a generic row type.
 */
function asCertificate(row: unknown): ShareCertificate {
  return row as ShareCertificate;
}

/*
 * The `formatDate` helper that existed in 1.0.0 was removed in 1.1.0.
 * The page's only date column now reads the backend-supplied
 * `issued_at_display` field directly. See the file header §"Date
 * rendering (P3 · Unit 2)".
 */
</script>

<template>
  <div
    class="my-certificates-page"
    :data-state="pageState"
    data-testid="my-certificates-page-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="pageState === 'loading'"
      :message="labels.loadingMessage"
      data-testid="my-certificates-page-loading"
    />

    <!-- ============================================================
         Unlinked
         ============================================================ -->
    <EmptyState
      v-else-if="pageState === 'unlinked'"
      :title="labels.unlinkedTitle"
      :description="labels.unlinkedDescription"
      data-testid="my-certificates-page-unlinked"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="pageState === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="my-certificates-page-error"
      @action="retry"
    />

    <!-- ============================================================
         Ready / empty (both under a page header)
         ============================================================ -->
    <template v-else>
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <EmptyState
        v-if="pageState === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
        data-testid="my-certificates-page-empty"
      />

      <Card
        v-else
        padding="none"
        data-testid="my-certificates-page-table-card"
      >
        <DataTable
          :columns="columns"
          :rows="certificates"
          :row-key="rowKey"
          data-testid="my-certificates-page-table"
        >
          <template #cell:number="{ row }">
            {{ asCertificate(row).certificate_number ?? '' }}
          </template>

          <template #cell:class="{ row }">
            {{ asCertificate(row).share_class?.display_name ?? '' }}
          </template>

          <template #cell:status="{ row }">
            {{ asCertificate(row).status_label }}
          </template>

          <template #cell:issued="{ row }">
            {{ asCertificate(row).issued_at_display ?? '' }}
          </template>
        </DataTable>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.my-certificates-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .my-certificates-page {
    /* no-op placeholder */
  }
}
</style>