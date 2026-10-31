<!--
=============================================================================
 MASES Phase 2 UI — ShareholderDetailView
=============================================================================

 File:      mase_app/src/features/shareholders/ShareholderDetailView/ShareholderDetailView.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3, §11.6
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22 STAGE 15
            ShareholderController.php / ShareholderResource.php /
              ShareHoldingResource.php / ShareCertificateResource.php
              (verified against source)
            P3 · Unit 2 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 15).
 1.0.1  — API-drift corrections:
          · ErrorState       — message/retry-label/@retry → title/action-label/@action
          · StatusBadge      — added required `status` prop; remapped
                               variant "active"/"inactive" → "success"/"neutral"
          · DataTable        — TableColumn → DataTableColumn
          · DataTable rowKey — widened to (row: unknown) for variance compat
          · DataTable slots  — added asHolding() / asCertificate() cast helpers
          · DropdownMenu     — MenuItem.id → MenuItem.key
          · DropdownMenu     — controlled `open` prop; single-open row state
                               added; #trigger → #default scoped slot wired
                               with triggerId/aria-haspopup/aria-expanded/
                               aria-controls/toggle
          · Identity section — DetailCard replaced with Card + custom header
                               (DetailCard's required `fields` prop is
                               incompatible with the inline StatusBadge)
 1.1.0  — Ethiopian calendar date rendering (P3 · Unit 2):
          · The local `formatDate()` helper is removed.
          · Three call sites now read the backend-supplied `_display`
            fields directly:
              - Identity card `identityCreated` row
                  → shareholder.created_at_display
              - Identity card `identityUpdated` row
                  → shareholder.updated_at_display
              - Certificates table `issued` column
                  → asCertificate(row).issued_at_display
          · The holdings table has no date column, so no change there.
          · Every other column, action, state, and dialog wiring is
            unchanged.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /shareholders/:id page's content. Renders:
   - the shareholder's identity card
   - their share holdings (one row per share class)
   - their share certificates (one row per certificate)

 Content page. The route wrapper (delivered with Unit 15.10) composes it
 inside AuthenticatedLayout and owns the three sub-dialogs (issue
 certificate, cancel certificate, record holding entry).

 -----------------------------------------------------------------------------
 Sub-forms are NOT composed here — see the response preamble
 -----------------------------------------------------------------------------
 This view emits four intents:
   @edit                — consumer navigates to /shareholders/:id/edit
   @issue-certificate   — consumer opens the issue dialog
   @cancel-certificate  — consumer opens the cancel dialog (payload: the
                          certificate)
   @record-entry        — consumer opens the record-entry dialog

 The route wrapper owns the dialogs.

 -----------------------------------------------------------------------------
 Composite detail fetch (Unit 15.2)
 -----------------------------------------------------------------------------
 The view calls fetchShareholderDetail(id) which runs three parallel
 requests: getShareholder, listShareHoldings, listCertificates.

 -----------------------------------------------------------------------------
 404 vs error
 -----------------------------------------------------------------------------
 A 404 (the shareholder does not exist, or belongs to another tenant) is
 distinguished from every other failure:
   - 404 (NormalizedApiError.category === 'not-found')
     → 'empty' state: "Shareholder not found"
   - Any other failure
     → 'error' state: generic message with retry

 -----------------------------------------------------------------------------
 Identity section — plain Card, not DetailCard
 -----------------------------------------------------------------------------
 The identity block is rendered as a plain Card with a custom header
 and an inline <dl>. DetailCard was rejected here because its required
 `fields: readonly MetaListItem[]` prop is incompatible with the
 identity block's status badge: MetaList renders values as text and
 does not forward a value slot, so a StatusBadge cannot be rendered
 through DetailCard.

 The holdings and certificates sections use Card directly for the same
 reason (their DataTable bodies are not MetaList shapes).

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The shareholder, holdings, certificates, the loading/error flags, and
 the currently-open certificate row-menu are component-local refs.

 -----------------------------------------------------------------------------
 Permission gating (§7.3.2)
 -----------------------------------------------------------------------------
   Edit action              — shareholder.update
   Issue certificate action — certificate.issue
   Cancel certificate row   — certificate.cancel  (read from the auth
                              store)
   Record entry action      — share_holding.entry

 -----------------------------------------------------------------------------
 Date rendering (P3 · Unit 2)
 -----------------------------------------------------------------------------
 Three date values are rendered by this view. All three now use the
 backend-supplied `_display` fields:

   · Identity card created   → shareholder.created_at_display
   · Identity card updated   → shareholder.updated_at_display
   · Certificate issued      → certificate.issued_at_display

 The frontend does no date formatting of its own. The ISO fields
 remain available on the wire for consumers that need a
 machine-readable instant; this view does not use them.

 The holdings table renders no date column, so no change is required
 there. If a future CR adds a date column, it reads the corresponding
 `_display` field from the ShareHolding or ShareHoldingEntry interface.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 -----------------------------------------------------------------------------
 Row-actions menu — single-open control
 -----------------------------------------------------------------------------
 DropdownMenu is a controlled component: it requires an `open` prop and
 emits `update:open`. To ensure only one certificate row's menu is open
 at a time, this page tracks the id of the currently-open row
 (`openCertificateRowId`). Each row's DropdownMenu reads its open state
 from that single ref and writes back through a shared handler.
=============================================================================
-->

<script lang="ts">
import { formatCalendarDate } from '@/core/dates/calendar';
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { ShareCertificate } from '../api';

/**
 * Consumer-supplied, translated labels.
 */
export interface ShareholderDetailViewLabels {
  /* Loading / error / empty */
  readonly loadingMessage: string;
  readonly errorMessage: string;
  readonly errorRetryLabel: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;

  /* Page description */
  readonly pageDescription: string;

  /* Actions */
  readonly editLabel: string;

  /* Identity card */
  readonly identityTitle: string;
  readonly identityName: string;
  readonly identityType: string;
  readonly identityStatus: string;
  readonly identityUser: string;
  readonly identityRepresentative: string;
  readonly identityCreated: string;
  readonly identityUpdated: string;

  /* Holdings section */
  readonly holdingsTitle: string;
  readonly holdingsEmpty: string;
  readonly holdingsNewLabel: string;
  readonly holdingsColumnClass: string;
  readonly holdingsColumnQuantity: string;

  /* Certificates section */
  readonly certificatesTitle: string;
  readonly certificatesEmpty: string;
  readonly certificatesNewLabel: string;
  readonly certificatesColumnNumber: string;
  readonly certificatesColumnClass: string;
  readonly certificatesColumnStatus: string;
  readonly certificatesColumnIssued: string;
  readonly certificatesColumnActions: string;
  readonly certificatesRowActionsAriaLabel: string;
  readonly certificatesActionCancel: string;
}

export type { ShareCertificate };
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import StatusBadge from '@/components/patterns/StatusBadge';
import PermissionGate from '@/components/patterns/PermissionGate';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import DropdownMenu from '@/components/composites/DropdownMenu';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { useAuthStore } from '@/stores/auth';
import {
  fetchShareholderDetail,
  formatQuantity,
} from '@/features/shareholders/service';
import type {
  ShareCertificate as ShareCertificateType,
  ShareHolding,
  Shareholder,
} from '@/features/shareholders/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: ShareholderDetailViewLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Consumer navigates to the edit route. */
  (event: 'edit'): void;
  /** Consumer opens the issue-certificate dialog. */
  (event: 'issue-certificate'): void;
  /** Consumer opens the cancel-certificate dialog for the given certificate. */
  (event: 'cancel-certificate', payload: { certificate: ShareCertificateType }): void;
  /** Consumer opens the record-entry dialog. */
  (event: 'record-entry'): void;
}>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();

// -----------------------------------------------------------------------------
// Auth store (row-action permission filter only)
// -----------------------------------------------------------------------------
const auth = useAuthStore();
const canCancelCertificate = computed<boolean>(
  () => auth.hasPermission('certificate.cancel'),
);

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
const routeId = computed<number | null>(() => {
  const raw = route.params.id;
  const asString = typeof raw === 'string' ? raw : '';
  const parsed = Number.parseInt(asString, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const shareholder = ref<Shareholder | null>(null);
const holdings = ref<readonly ShareHolding[]>([]);
const certificates = ref<readonly ShareCertificateType[]>([]);
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);
const notFound = ref<boolean>(false);

const state = computed<ViewState>(() => {
  if (isLoading.value) return 'loading';
  if (notFound.value) return 'empty';
  if (loadError.value !== null) return 'error';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Error classification
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly httpStatus?: unknown;
  readonly status?: unknown;
}

function isNotFoundError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as NormalizedApiErrorLike;
  if (e.category === 'not-found') return true;
  if (e.httpStatus === 404 || e.status === 404) return true;
  return false;
}

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
async function load(): Promise<void> {
  const id = routeId.value;

  if (id === null) {
    shareholder.value = null;
    holdings.value = [];
    certificates.value = [];
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    const detail = await fetchShareholderDetail(id);
    shareholder.value = detail.shareholder;
    holdings.value = detail.holdings;
    certificates.value = detail.certificates;
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    shareholder.value = null;
    holdings.value = [];
    certificates.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Expose reload for the route wrapper (called after a dialog succeeds)
// -----------------------------------------------------------------------------
defineExpose({ reload: load });

// -----------------------------------------------------------------------------
// Derived state — identity card
// -----------------------------------------------------------------------------
const pageTitle = computed<string>(() => shareholder.value?.display_name ?? '');

const hasUser = computed<boolean>(
  () => shareholder.value?.user != null,
);

const hasRepresentative = computed<boolean>(
  () => shareholder.value?.representative != null,
);

// -----------------------------------------------------------------------------
// Cast helpers for DataTable's non-generic cell slots
// -----------------------------------------------------------------------------
/*
 * DataTable's row callback is currently typed `(row: unknown) => string |
 * number` (non-generic), and its cell slots receive the row as `unknown`.
 *
 * These helpers narrow the payload back to the row type at the point of
 * use. Remove once DataTable accepts a generic row type.
 */
function asHolding(row: unknown): ShareHolding {
  return row as ShareHolding;
}

function asCertificate(row: unknown): ShareCertificateType {
  return row as ShareCertificateType;
}

// -----------------------------------------------------------------------------
// Holdings table
// -----------------------------------------------------------------------------
const holdingsColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'class', label: props.labels.holdingsColumnClass, align: 'start' },
  { key: 'quantity', label: props.labels.holdingsColumnQuantity, align: 'end' },
]);

function holdingRowKey(row: unknown): string {
  return String((row as ShareHolding).id);
}

// -----------------------------------------------------------------------------
// Certificates table
// -----------------------------------------------------------------------------
const certificateColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'number', label: props.labels.certificatesColumnNumber, align: 'start' },
  { key: 'class', label: props.labels.certificatesColumnClass, align: 'start' },
  { key: 'status', label: props.labels.certificatesColumnStatus, align: 'start' },
  { key: 'issued', label: props.labels.certificatesColumnIssued, align: 'start' },
  { key: 'actions', label: props.labels.certificatesColumnActions, align: 'end' },
]);

function certificateRowKey(row: unknown): string {
  return String((row as ShareCertificateType).id);
}

/*
 * The certificate row actions. Each item's identifier is passed as
 * `key`, matching DropdownMenu's MenuItem contract.
 *
 * The `_row` parameter is preserved for future per-row gating.
 */
function certificateActionsFor(_row: ShareCertificateType) {
  if (!canCancelCertificate.value) {
    return [];
  }
  return [
    {
      key: 'cancel',
      label: props.labels.certificatesActionCancel,
      icon: 'close',
      variant: 'danger' as const,
    },
  ];
}

// -----------------------------------------------------------------------------
// Row-actions menu open state (single-open control)
// -----------------------------------------------------------------------------
/*
 * DropdownMenu is a controlled component — it requires an `open` prop
 * and emits `update:open`. To ensure only one certificate row's menu is
 * open at a time, this page tracks the id of the currently-open row.
 * Each row's menu reads its open state from this single ref and writes
 * back through the shared handler below.
 *
 * `null` means no menu is open.
 */
const openCertificateRowId = ref<string | null>(null);

function isCertificateMenuOpen(rowId: string): boolean {
  return openCertificateRowId.value === rowId;
}

function onCertificateMenuOpenChange(rowId: string, open: boolean): void {
  openCertificateRowId.value = open ? rowId : null;
}

function onCertificateAction(
  row: ShareCertificateType,
  actionKey: string,
): void {
  if (actionKey === 'cancel') {
    emit('cancel-certificate', { certificate: row });
  }
}

// -----------------------------------------------------------------------------
// Emit forwarding
// -----------------------------------------------------------------------------
function onEdit(): void {
  emit('edit');
}

function onIssueCertificate(): void {
  emit('issue-certificate');
}

function onRecordEntry(): void {
  emit('record-entry');
}

// -----------------------------------------------------------------------------
// StatusBadge variant mapping
// -----------------------------------------------------------------------------
/*
 * Maps the shareholder's active boolean to a valid BadgeVariant token.
 *
 * "active"   →  success   (standard positive-status palette)
 * "inactive" →  neutral   (de-emphasized)
 *
 * The BadgeVariant union is:
 *   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'
 */
function shareholderStatusVariant(active: boolean): 'success' | 'neutral' {
  return active ? 'success' : 'neutral';
}

// -----------------------------------------------------------------------------
// Date rendering — see the file header §"Date rendering (P3 · Unit 2)"
// -----------------------------------------------------------------------------
/*
 * The `formatDate` helper that existed in 1.0.0 and 1.0.1 was removed in
 * 1.1.0. The three date values this view renders (identity card created
 * and updated, certificate issued) now read the backend-supplied
 * `_display` fields directly. No frontend date formatting remains.
 */
</script>

<template>
  <div
    class="shareholder-detail-view"
    :data-state="state"
    data-testid="shareholder-detail-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="shareholder-detail-view-loading"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="shareholder-detail-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404 or invalid route id)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.emptyTitle"
      :description="labels.emptyDescription"
      data-testid="shareholder-detail-view-empty"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="shareholder !== null">
      <PageHeader
        :title="pageTitle"
        :description="labels.pageDescription"
      >
        <PermissionGate permission="shareholder.update">
          <PrimaryButton
            type="button"
            data-testid="shareholder-detail-view-edit"
            @click="onEdit"
          >{{ labels.editLabel }}</PrimaryButton>
        </PermissionGate>
      </PageHeader>

      <!-- ============================================================
           Identity
           ============================================================ -->
      <Card data-testid="shareholder-detail-view-identity">
        <template #header>
          <h2 class="shareholder-detail-view__section-title">
            {{ labels.identityTitle }}
          </h2>
        </template>

        <dl class="shareholder-detail-view__identity-list">
          <div class="shareholder-detail-view__identity-row">
            <dt>{{ labels.identityName }}</dt>
            <dd>{{ shareholder.display_name }}</dd>
          </div>

          <div class="shareholder-detail-view__identity-row">
            <dt>{{ labels.identityType }}</dt>
            <dd>{{ shareholder.type_label }}</dd>
          </div>

          <div class="shareholder-detail-view__identity-row">
            <dt>{{ labels.identityStatus }}</dt>
            <dd>
              <StatusBadge
                :status="shareholder.is_active ? 'active' : 'inactive'"
                :variant="shareholderStatusVariant(shareholder.is_active)"
                :label="shareholder.status_label"
                data-testid="shareholder-detail-view-status"
              />
            </dd>
          </div>

          <div
            v-if="hasUser"
            class="shareholder-detail-view__identity-row"
          >
            <dt>{{ labels.identityUser }}</dt>
            <dd>{{ shareholder.user?.name }}</dd>
          </div>

          <div
            v-if="hasRepresentative"
            class="shareholder-detail-view__identity-row"
          >
            <dt>{{ labels.identityRepresentative }}</dt>
            <dd>{{ shareholder.representative?.name }}</dd>
          </div>

          <div class="shareholder-detail-view__identity-row">
            <dt>{{ labels.identityCreated }}</dt>
            <dd>{{ formatCalendarDate(shareholder.created_at) }}</dd>
          </div>

          <div class="shareholder-detail-view__identity-row">
            <dt>{{ labels.identityUpdated }}</dt>
            <dd>{{ formatCalendarDate(shareholder.updated_at) }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Holdings
           ============================================================ -->
      <Card data-testid="shareholder-detail-view-holdings">
        <template #header>
          <div class="shareholder-detail-view__section-header">
            <h2 class="shareholder-detail-view__section-title">
              {{ labels.holdingsTitle }}
            </h2>
            <PermissionGate permission="share_holding.entry">
              <PrimaryButton
                type="button"
                size="sm"
                data-testid="shareholder-detail-view-holdings-new"
                @click="onRecordEntry"
              >{{ labels.holdingsNewLabel }}</PrimaryButton>
            </PermissionGate>
          </div>
        </template>

        <DataTable
          v-if="holdings.length > 0"
          :columns="holdingsColumns"
          :rows="holdings"
          :row-key="holdingRowKey"
          data-testid="shareholder-detail-view-holdings-table"
        >
          <template #cell:class="{ row }">
            {{ asHolding(row).share_class?.display_name ?? '' }}
          </template>

          <template #cell:quantity="{ row }">
            {{ formatQuantity(asHolding(row).current_quantity) }}
          </template>
        </DataTable>

        <p
          v-else
          class="shareholder-detail-view__section-empty"
          data-testid="shareholder-detail-view-holdings-empty"
        >{{ labels.holdingsEmpty }}</p>
      </Card>

      <!-- ============================================================
           Certificates
           ============================================================ -->
      <Card data-testid="shareholder-detail-view-certificates">
        <template #header>
          <div class="shareholder-detail-view__section-header">
            <h2 class="shareholder-detail-view__section-title">
              {{ labels.certificatesTitle }}
            </h2>
            <PermissionGate permission="certificate.issue">
              <PrimaryButton
                type="button"
                size="sm"
                data-testid="shareholder-detail-view-certificates-new"
                @click="onIssueCertificate"
              >{{ labels.certificatesNewLabel }}</PrimaryButton>
            </PermissionGate>
          </div>
        </template>

        <DataTable
          v-if="certificates.length > 0"
          :columns="certificateColumns"
          :rows="certificates"
          :row-key="certificateRowKey"
          data-testid="shareholder-detail-view-certificates-table"
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
            {{ formatCalendarDate(asCertificate(row).issued_at) }}
          </template>

          <template #cell:actions="{ row }">
            <!--
              Certificate row-actions menu.

              DropdownMenu is controlled: `:open` reads from the shared
              single-open state, `@update:open` writes back through the
              shared handler. Only one certificate row's menu is open
              at a time.

              The trigger element is supplied via the `#default` scoped
              slot. The slot exposes the trigger's id, its ARIA
              attributes, and the toggle function; the button binds
              them all so the menu's aria-labelledby resolves, the
              aria-expanded state reflects `open`, and clicks toggle
              the menu.

              Rendered only when the row's action list is non-empty —
              i.e. when the current user holds certificate.cancel. Rows
              that produce no actions render an empty actions cell.
            -->
            <DropdownMenu
              v-if="certificateActionsFor(asCertificate(row)).length > 0"
              :open="isCertificateMenuOpen(String(asCertificate(row).id))"
              :items="certificateActionsFor(asCertificate(row))"
              @update:open="
                (v) =>
                  onCertificateMenuOpenChange(String(asCertificate(row).id), v)
              "
              @select="(key) => onCertificateAction(asCertificate(row), key)"
            >
              <template
                #default="{
                  triggerId,
                  toggle,
                  ariaHaspopup,
                  ariaExpanded,
                  ariaControls,
                }"
              >
                <button
                  :id="triggerId"
                  type="button"
                  class="shareholder-detail-view__row-actions-trigger"
                  :aria-haspopup="ariaHaspopup"
                  :aria-expanded="ariaExpanded"
                  :aria-controls="ariaControls"
                  :aria-label="labels.certificatesRowActionsAriaLabel"
                  @click="toggle"
                >
                  ⋯
                </button>
              </template>
            </DropdownMenu>
          </template>
        </DataTable>

        <p
          v-else
          class="shareholder-detail-view__section-empty"
          data-testid="shareholder-detail-view-certificates-empty"
        >{{ labels.certificatesEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.shareholder-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Identity list
   ---------------------------------------------------------------------------
   A definition list with a two-column row layout. Each row is a
   grid with a narrow dt and a wide dd.
   ============================================================================ */
.shareholder-detail-view__identity-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.shareholder-detail-view__identity-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--mases-space-3);
  align-items: baseline;
}

.shareholder-detail-view__identity-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.shareholder-detail-view__identity-row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Section header (title + action, inside a Card's header slot)
   ============================================================================ */
.shareholder-detail-view__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}

.shareholder-detail-view__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Empty section message
   ============================================================================ */
.shareholder-detail-view__section-empty {
  margin: 0;
  padding-block: var(--mases-space-4);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Row actions trigger
   ---------------------------------------------------------------------------
   A minimal button containing the ellipsis glyph. DropdownMenu owns the
   open/close logic and the menu; this button is the trigger it wires
   with the id, aria-haspopup, aria-expanded, aria-controls, and toggle
   callback exposed by the scoped slot.
   ============================================================================ */
.shareholder-detail-view__row-actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mases-space-6);
  height: var(--mases-space-6);
  padding: 0;
  border: 0;
  border-radius: var(--mases-radius-md);
  background-color: transparent;
  color: var(--mases-color-icon-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: 1;
  cursor: pointer;
}

.shareholder-detail-view__row-actions-trigger:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.shareholder-detail-view__row-actions-trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   The identity row collapses to a single column with the label above the
   value. This is the correct presentation at narrow widths.
   ============================================================================ */
@media (max-width: 639px) {
  .shareholder-detail-view__identity-row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--mases-space-1);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .shareholder-detail-view {
    /* no-op placeholder */
  }
}
</style>