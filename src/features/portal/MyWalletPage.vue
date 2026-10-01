<!--
=============================================================================
 CHANGE VERIFICATION — CR-W2
=============================================================================

 File:      mase_app/src/features/portal/MyWalletPage.vue  (NEW)
 Unit:      CR-W2 — Portal self-service wallet page
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The portal had three pages — PortalHomePage,
   MyShareholdingsPage, MyCertificatesPage — and no wallet page. The
   caller had no way to see their own wallet through the portal, even
   after CR-W1 delivered GET /api/wallets/me, because no frontend page
   consumed it.

 After:
   A single-object page rendering the authenticated caller's own
   wallet. Reads its identity from the shared useMyShareholder state
   (provided by PortalLayout), fetches the wallet via getMyWallet()
   from @/features/wallet/service, and renders a plain Card with an
   inline <dl> of wallet fields — the same structural pattern
   PortalHomePage.vue's identity card uses.

   The page is a leaf: it does not fetch identity itself, does not
   accept a shareholder id, does not fall back to any other endpoint.

   Five states (the A2 decision):
     loading    — identity loading OR wallet idle/loading
     unlinked   — identity unlinked (shared unlinked panel)
     error      — identity error OR wallet error; retry is state-aware
     no-wallet  — identity linked, wallet endpoint returned linked:false
     ready      — identity linked, wallet endpoint returned linked:true

   The no-wallet state is distinct from unlinked. See the page docblock
   §"The five states" and the labels module's MyWalletPageLabels
   docblock for the distinction and its rationale.

 Dependency note:
   · Depends on getMyWallet() in @/features/wallet/service (CR-W2
     file 2, service v1.0.4). Until that file is deployed, this page
     will not compile.
   · Depends on MyWalletPageLabels and myWalletPageLabels in ./labels
     (CR-W2 file 3, labels v2.2.0). Until that file is deployed, this
     page will not compile.
   · Depends on the CR-W1 backend endpoint GET /api/wallets/me at
     runtime. Until CR-W1 files 1 and 2 are deployed, a call to
     getMyWallet() will 404, and the page will render its error state.
   · Depends on the amended WalletResource (CR-W1 file 3) plus the
     RendersLocalizedDates trait and composer dump-autoload (Track A
     steps 1 and 3) for the four `_display` date fields to be present
     at runtime. Until Track A is closed, those four fields will be
     undefined and the page will render empty cells for them — the
     formatAmount nullish guard's documented failure mode, chosen
     deliberately so a missing field renders as empty rather than
     breaking the whole card.

   · No new class, no config change. The page is a Vue SFC consumed by
     the frontend build.

 Files modified:            none (routes and nav are CR-W2 files 5–7)
 Files added:               this file only
 Files deleted:             none
 Routes registered:         none (declared by CR-W2 file 5)
 Nav entry:                 none (declared by CR-W2 file 6)
 Labels modified:           none (declared by CR-W2 file 3)

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — MyWalletPage
=============================================================================

 File:      mase_app/src/features/portal/MyWalletPage.vue
 Layer:     Features (Portal)
 Version:   1.0.0
 Status:    FROZEN
 Authority: CR-W1 (/api/wallets/me contract)
            CR-W2 (this delivery)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §13.3

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the authenticated caller's own wallet — a single-object view,
 not a list. One wallet per shareholder is enforced by the Wallet
 domain's composite UNIQUE constraint on (tenant_id, shareholder_id);
 the endpoint returns either the caller's wallet or the two-outcome
 no-wallet branch.

 The page reads its identity from the provided useMyShareholder state
 (the same shared instance PortalHomePage consumes) and calls
 getMyWallet() — a self-service endpoint that resolves the caller's
 wallet server-side, through the tenant → user → shareholder → wallet
 chain. The page does not call the API client directly and does not
 accept a wallet or shareholder id as input.

 -----------------------------------------------------------------------------
 The five states (A2)
 -----------------------------------------------------------------------------
   loading    — the identity composable is resolving, OR the wallet
                fetch is idle/in-flight
   unlinked   — identity contract returned { linked: false } — the
                caller has no own shareholder record. Renders the
                shared unlinked panel.
   error      — identity fetch failed, OR wallet fetch failed. Retry
                is state-aware: it reloads whichever layer failed.
   no-wallet  — identity linked, wallet endpoint returned
                { linked: false, wallet: null } — the caller has a
                shareholder record, but no wallet has been opened for
                them. Distinct copy from the unlinked state.
   ready      — identity linked, wallet endpoint returned
                { linked: true, wallet: … }. Renders the wallet card.

 The unlinked and no-wallet states are genuinely different: unlinked
 means "no shareholder record at all"; no-wallet means "shareholder
 record exists, no wallet opened yet". They render different copy from
 the labels module.

 -----------------------------------------------------------------------------
 Data shape
 -----------------------------------------------------------------------------
 The page owns two page-local refs — `wallet` and `dataState` — plus a
 `dataError` ref for diagnostic retention. This mirrors the pattern
 MyShareholdingsPage.vue uses for its holdings data. Per Freeze §13.3,
 the state lives in the page's ref; the service layer is stateless.

 -----------------------------------------------------------------------------
 The wallet card — plain Card, not DetailCard
 -----------------------------------------------------------------------------
 The wallet block is rendered as a plain Card with a custom header and
 an inline <dl>, mirroring the identity card on PortalHomePage.vue.
 DetailCard was rejected for the same reason recorded there: its
 required `fields: readonly MetaListItem[]` prop is incompatible with
 the status badge (MetaList renders values as text and does not forward
 a value slot, so a StatusBadge cannot be rendered through DetailCard).

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 The four date rows — opened_at, closed_at, created_at, updated_at —
 render the backend-supplied `_display` sibling fields, not the raw ISO
 fields. The backend produces each `_display` value via
 LocalizationService::formatEthiopianDateMedium() using the current
 request's locale. The frontend does no date formatting of its own.

 The closed_at row is conditional: rendered only when `closed_at` is
 non-null. Phase 2B does not produce closed wallets; the row is
 declared so the card renders correctly the day the closure workflow
 ships.

 -----------------------------------------------------------------------------
 Monetary rendering
 -----------------------------------------------------------------------------
 The balance is rendered via formatAmount(current_balance, currency),
 imported from @/features/wallet/service. formatAmount renders the
 backend's decimal string at a fixed two-decimal precision and appends
 the currency code. It performs no arithmetic and never converts the
 string to a JavaScript number. See that helper's own docblock for the
 rationale.

 -----------------------------------------------------------------------------
 Status badge derivation
 -----------------------------------------------------------------------------
 The WalletResource does not emit a `status_label` the way the
 ShareholderResource does. The badge's label and variant are therefore
 derived from the wallet's two booleans:
 
     is_closed === true                       →  statusClosedLabel   / neutral
     is_closed === false && is_active === false →  statusInactiveLabel / neutral
     is_closed === false && is_active === true  →  statusActiveLabel   / success

 Phase 2B does not produce closed wallets; the closed branch is
 declared so the badge renders correctly the day the closure workflow
 ships. The three labels live in the labels module.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
/*
 * The page's labels type is imported from ./labels and re-exported here
 * for consumers that import the type from the component module. The
 * source of truth remains ./labels.
 */
import type { MyWalletPageLabels } from './labels';
export type { MyWalletPageLabels };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import StatusBadge from '@/components/patterns/StatusBadge';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { useMyShareholder } from './useMyShareholder';
import { getMyWallet, formatAmount } from '@/features/wallet/service';
import type { Wallet } from '@/features/wallet/api';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: MyWalletPageLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Identity state (provided by PortalLayout)
// -----------------------------------------------------------------------------
const { state: identityState, shareholder, load: loadIdentity } =
  useMyShareholder();

// -----------------------------------------------------------------------------
// Wallet data state (page-local)
// -----------------------------------------------------------------------------
/*
 * The dataState union includes 'no-wallet' as its own value (the A2
 * decision). The alternative — a separate `walletLinked` boolean —
 * would spread the same information across two refs; folding it into
 * the state machine keeps the outcome a single source of truth.
 *
 * When dataState === 'no-wallet', `wallet` is null. When dataState
 * === 'ready', `wallet` is non-null. The two invariants are maintained
 * by loadWallet(); no other code writes to these refs.
 */
type DataState = 'idle' | 'loading' | 'ready' | 'no-wallet' | 'error';

const wallet = ref<Wallet | null>(null);
const dataState = ref<DataState>('idle');
const dataError = ref<unknown | null>(null);

async function loadWallet(): Promise<void> {
  dataState.value = 'loading';
  dataError.value = null;
  wallet.value = null;

  try {
    const response = await getMyWallet();

    /*
     * Two well-formed outcomes. The defensive else-branch catches a
     * shape the endpoint should never produce, matching the pattern
     * useMyShareholder.ts uses for its own identity contract.
     */
    if (response.linked === true && response.wallet !== null) {
      wallet.value = response.wallet;
      dataState.value = 'ready';
      return;
    }

    if (response.linked === false && response.wallet === null) {
      dataState.value = 'no-wallet';
      return;
    }

    dataError.value = new Error(
      '[MyWalletPage] Unexpected wallet contract response shape. ' +
        'Expected either { linked: true, wallet: X } or ' +
        '{ linked: false, wallet: null }.',
    );
    dataState.value = 'error';
  } catch (err) {
    dataError.value = err;
    dataState.value = 'error';
  }
}

/*
 * Load the wallet once the identity has resolved to a linked
 * shareholder. The watcher fires on the null → record transition, or
 * immediately if the identity was already resolved when this page
 * mounted (navigating between portal pages reuses the layout's shared
 * instance). If the identity contract returns unlinked or errors, the
 * watcher's guard is false and no wallet fetch is issued — the page
 * renders the appropriate state without a wasted request.
 */
watch(
  shareholder,
  (s) => {
    if (s !== null && dataState.value === 'idle') {
      void loadWallet();
    }
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Page state — the union of identity and wallet data states
// -----------------------------------------------------------------------------
type PageState = 'loading' | 'unlinked' | 'error' | 'no-wallet' | 'ready';

const pageState = computed<PageState>(() => {
  if (identityState.value === 'loading') return 'loading';
  if (identityState.value === 'unlinked') return 'unlinked';
  if (identityState.value === 'error') return 'error';

  // identity is 'linked' from here on
  if (dataState.value === 'idle' || dataState.value === 'loading') {
    return 'loading';
  }
  if (dataState.value === 'error') return 'error';
  if (dataState.value === 'no-wallet') return 'no-wallet';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Page-level retry — state-aware
// -----------------------------------------------------------------------------
/*
 * Dispatches the retry at whichever layer failed. If the identity
 * never resolved, the identity fetch is retried; otherwise the wallet
 * fetch is retried. Mirrors MyShareholdingsPage.vue's retry().
 */
function retry(): void {
  if (shareholder.value === null) {
    void loadIdentity();
    return;
  }
  void loadWallet();
}

// -----------------------------------------------------------------------------
// Status badge derivation
// -----------------------------------------------------------------------------
/*
 * The WalletResource does not emit a `status_label` the way the
 * ShareholderResource does, so the label and the variant are both
 * derived here. See the page docblock §"Status badge derivation".
 *
 * The status token ('active' | 'inactive' | 'closed') is a stable
 * identifier for tests and any future consumer that keys off it; the
 * `label` carries the display text.
 */
function walletStatusToken(w: Wallet): 'active' | 'inactive' | 'closed' {
  if (w.is_closed) return 'closed';
  return w.is_active ? 'active' : 'inactive';
}

function walletStatusLabel(w: Wallet): string {
  const token = walletStatusToken(w);
  if (token === 'closed') return props.labels.statusClosedLabel;
  if (token === 'inactive') return props.labels.statusInactiveLabel;
  return props.labels.statusActiveLabel;
}

/*
 * Maps the status token to a valid BadgeVariant token.
 *
 * "active"   →  success
 * "inactive" →  neutral
 * "closed"   →  neutral
 *
 * The BadgeVariant union is:
 *   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'
 */
function walletStatusVariant(w: Wallet): 'success' | 'neutral' {
  return walletStatusToken(w) === 'active' ? 'success' : 'neutral';
}

// -----------------------------------------------------------------------------
// Derived — the conditional closed-at row
// -----------------------------------------------------------------------------
/*
 * The closed-at row renders only when the wallet is closed. Phase 2B
 * does not produce closed wallets, so in the current deployment this
 * is always false; the row is declared so the card renders correctly
 * the day the closure workflow ships.
 *
 * Reading `wallet.value?.closed_at !== null && wallet.value?.closed_at
 * !== undefined` is deliberate: the field is nullable, and the row's
 * visibility and the value's presence must agree.
 */
const hasClosedAt = computed<boolean>(
  () =>
    wallet.value !== null &&
    wallet.value.closed_at !== null &&
    wallet.value.closed_at !== undefined,
);
</script>

<template>
  <div
    class="my-wallet-page"
    :data-state="pageState"
    data-testid="my-wallet-page-root"
  >
    <!-- ============================================================
         Loading (identity OR wallet)
         ============================================================ -->
    <LoadingState
      v-if="pageState === 'loading'"
      :message="labels.loadingMessage"
      data-testid="my-wallet-page-loading"
    />

    <!-- ============================================================
         Unlinked — the caller has no own shareholder record.
         ============================================================ -->
    <EmptyState
      v-else-if="pageState === 'unlinked'"
      :title="labels.unlinkedTitle"
      :description="labels.unlinkedDescription"
      data-testid="my-wallet-page-unlinked"
    />

    <!-- ============================================================
         Error (page-level)
         ============================================================ -->
    <ErrorState
      v-else-if="pageState === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="my-wallet-page-error"
      @action="retry"
    />

    <!-- ============================================================
         No-wallet / Ready (both under a page header)
         ============================================================ -->
    <template v-else>
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <!--
        No-wallet — the caller has a shareholder record but no wallet
        has been opened for them. Distinct copy from the shared
        unlinked state. See the page docblock §"The five states".
      -->
      <EmptyState
        v-if="pageState === 'no-wallet'"
        :title="labels.noWalletTitle"
        :description="labels.noWalletDescription"
        data-testid="my-wallet-page-no-wallet"
      />

      <!--
        Ready — the wallet card. A plain Card with an inline <dl>,
        mirroring PortalHomePage.vue's identity card. See the page
        docblock §"The wallet card — plain Card, not DetailCard".
      -->
      <Card
        v-else-if="pageState === 'ready' && wallet !== null"
        data-testid="my-wallet-page-card"
      >
        <template #header>
          <h2 class="my-wallet-page__section-title">
            {{ labels.walletCardTitle }}
          </h2>
        </template>

        <dl class="my-wallet-page__wallet">
          <div class="my-wallet-page__row">
            <dt>{{ labels.currencyLabel }}</dt>
            <dd>{{ wallet.currency }}</dd>
          </div>

          <div class="my-wallet-page__row">
            <dt>{{ labels.balanceLabel }}</dt>
            <dd>{{ formatAmount(wallet.current_balance, wallet.currency) }}</dd>
          </div>

          <div class="my-wallet-page__row">
            <dt>{{ labels.statusLabel }}</dt>
            <dd>
              <StatusBadge
                :status="walletStatusToken(wallet)"
                :variant="walletStatusVariant(wallet)"
                :label="walletStatusLabel(wallet)"
                data-testid="my-wallet-page-status"
              />
            </dd>
          </div>

          <div class="my-wallet-page__row">
            <dt>{{ labels.openedAtLabel }}</dt>
            <dd>{{ wallet.opened_at_display }}</dd>
          </div>

          <div
            v-if="hasClosedAt"
            class="my-wallet-page__row"
          >
            <dt>{{ labels.closedAtLabel }}</dt>
            <dd>{{ wallet.closed_at_display }}</dd>
          </div>

          <div class="my-wallet-page__row">
            <dt>{{ labels.createdAtLabel }}</dt>
            <dd>{{ wallet.created_at_display }}</dd>
          </div>

          <div class="my-wallet-page__row">
            <dt>{{ labels.updatedAtLabel }}</dt>
            <dd>{{ wallet.updated_at_display }}</dd>
          </div>
        </dl>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.my-wallet-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Section title (inside a Card's header slot)
   ---------------------------------------------------------------------------
   Mirrors the same-named rule in PortalHomePage.vue, so the wallet card's
   header reads identically to the identity card's header on the landing
   page.
   ============================================================================ */
.my-wallet-page__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Wallet list
   ---------------------------------------------------------------------------
   The same two-column row layout PortalHomePage.vue uses for its
   identity card. See that file's scoped style §"Identity list" for the
   rationale; the pattern is deliberately duplicated rather than
   extracted, because the two pages are independent consumers of the
   same visual grammar and an extraction would couple them.
   ============================================================================ */
.my-wallet-page__wallet {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.my-wallet-page__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--mases-space-3);
  align-items: baseline;
}

.my-wallet-page__row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.my-wallet-page__row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   Below 640px the two-column row layout collapses to a single column:
   the label above the value. Matches the identical breakpoint in
   PortalHomePage.vue so the two pages stack identically on phones.
   ============================================================================ */
@media (max-width: 639px) {
  .my-wallet-page__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--mases-space-1);
  }
}
</style>