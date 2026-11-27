<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import EmptyState from '@/components/composites/EmptyState';
import {
  createElectionSourceSnapshot,
  listElectionSourceSnapshots,
  reconcileElectionSourceSnapshot,
} from '@/features/governance/electionSourceSnapshotsApi';
import type { GovernanceElectionSourceSnapshot } from '@/features/governance/electionSourceSnapshotsApi';
import { electionSourceSnapshotLabels as labels } from '@/features/governance/electionLabels';

type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const route = useRoute();
const auth = useAuthStore();
const appName: string = import.meta.env.VITE_APP_NAME;
const electionId = computed(() => Number(route.params.electionId));
const snapshots = ref<readonly GovernanceElectionSourceSnapshot[]>([]);
const state = ref<ViewState>('loading');
const loadError = ref<string | null>(null);
const actionMessage = ref<string | null>(null);
const actionError = ref<string | null>(null);
const recordDateTime = ref('');
const reasons = reactive<Record<number, string>>({});
const busyAction = ref<string | null>(null);
const canPrepare = computed(() => auth.hasPermission('governance.election.register.prepare'));
const canReconcile = computed(() => auth.hasPermission('governance.election.register.reconcile'));

function shortDigest(value: string): string {
  return value.length > 18 ? `${value.slice(0, 18)}…` : value;
}

async function load(): Promise<void> {
  if (!Number.isSafeInteger(electionId.value) || electionId.value < 1) {
    state.value = 'error';
    loadError.value = 'Invalid election identifier.';
    return;
  }

  state.value = 'loading';
  loadError.value = null;
  try {
    snapshots.value = await listElectionSourceSnapshots(electionId.value);
    state.value = snapshots.value.length === 0 ? 'empty' : 'ready';
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : labels.loadError;
    state.value = 'error';
  }
}

async function capture(): Promise<void> {
  actionError.value = null;
  actionMessage.value = null;
  if (recordDateTime.value.trim() === '') {
    actionError.value = labels.recordDateHint;
    return;
  }
  busyAction.value = 'capture';
  try {
    const created = await createElectionSourceSnapshot(electionId.value, recordDateTime.value.trim());
    actionMessage.value = `Source snapshot v${created.version} captured. Electorate remains blocked.`;
    recordDateTime.value = '';
    await load();
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : labels.loadError;
  } finally {
    busyAction.value = null;
  }
}

async function reconcile(snapshot: GovernanceElectionSourceSnapshot): Promise<void> {
  actionError.value = null;
  actionMessage.value = null;
  const reason = (reasons[snapshot.id] ?? '').trim();
  if (reason.length < 10) {
    actionError.value = 'Please provide an independent reconciliation reason of at least 10 characters.';
    return;
  }

  busyAction.value = `reconcile-${snapshot.id}`;
  try {
    const result = await reconcileElectionSourceSnapshot(electionId.value, snapshot.id, reason);
    actionMessage.value = result.message;
    reasons[snapshot.id] = '';
    await load();
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : labels.loadError;
  } finally {
    busyAction.value = null;
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <PageTitle :title="labels.pageTitle" :suffix="appName" />
  <main class="election-source" data-testid="election-source-snapshot-view">
    <div class="election-source__back">
      <RouterLink to="/governance/elections">{{ labels.back }}</RouterLink>
    </div>
    <PageHeader :title="labels.pageTitle" :description="labels.description" />

    <section class="election-source__warning" role="note" aria-labelledby="election-source-warning-title">
      <h2 id="election-source-warning-title">{{ labels.warningTitle }}</h2>
      <p>{{ labels.warning }}</p>
      <p>{{ labels.englishWarning }}</p>
    </section>

    <section v-if="canPrepare" class="election-source__capture" aria-labelledby="election-source-capture-title">
      <h2 id="election-source-capture-title">{{ labels.capture }}</h2>
      <label for="election-source-record-date">{{ labels.recordDate }}</label>
      <input
        id="election-source-record-date"
        v-model="recordDateTime"
        type="text"
        inputmode="text"
        autocomplete="off"
        :placeholder="labels.recordDatePlaceholder"
        aria-describedby="election-source-record-date-hint"
        :disabled="busyAction !== null"
      />
      <p id="election-source-record-date-hint">{{ labels.recordDateHint }}</p>
      <button
        type="button"
        class="election-source__primary"
        :disabled="busyAction !== null || recordDateTime.trim() === ''"
        @click="capture"
      >
        {{ busyAction === 'capture' ? labels.loading : labels.capture }}
      </button>
    </section>

    <p v-if="actionMessage" class="election-source__success" role="status" aria-live="polite">{{ actionMessage }}</p>
    <p v-if="actionError" class="election-source__error" role="alert">{{ actionError }}</p>

    <section class="election-source__list" aria-labelledby="election-source-list-title">
      <div class="election-source__list-heading">
        <h2 id="election-source-list-title">{{ labels.snapshots }}</h2>
        <button type="button" class="election-source__refresh" :disabled="state === 'loading'" @click="load">
          {{ labels.retry }}
        </button>
      </div>

      <LoadingState v-if="state === 'loading'" :message="labels.loading" />
      <ErrorState
        v-else-if="state === 'error'"
        :title="loadError ?? labels.loadError"
        :action-label="labels.retry"
        @action="load"
      />
      <EmptyState
        v-else-if="state === 'empty'"
        :title="labels.emptyTitle"
        :description="labels.emptyDescription"
      />

      <div v-else class="election-source__cards">
        <article v-for="snapshot in snapshots" :key="snapshot.id" class="election-source__card">
          <header class="election-source__card-header">
            <h3>{{ labels.version }} {{ snapshot.version }}</h3>
            <span class="election-source__blocked">{{ labels.electorateBlocked }}</span>
          </header>

          <dl class="election-source__facts">
            <div><dt>{{ labels.preparedAt }}</dt><dd>{{ snapshot.prepared_at_utc }}</dd></div>
            <div><dt>{{ labels.shareholders }}</dt><dd>{{ snapshot.shareholder_count }}</dd></div>
            <div><dt>{{ labels.holdings }}</dt><dd>{{ snapshot.holding_count }}</dd></div>
            <div><dt>{{ labels.entries }}</dt><dd>{{ snapshot.ledger_entry_count }}</dd></div>
            <div><dt>{{ labels.state }}</dt><dd>{{ snapshot.snapshot_state }} / {{ snapshot.electorate_state }}</dd></div>
          </dl>

          <p class="election-source__digest">
            {{ labels.digest }}:
            <code :title="snapshot.source_digest">{{ shortDigest(snapshot.source_digest) }}</code>
          </p>

          <div v-if="snapshot.reconciliations?.length" class="election-source__history">
            <h4>የማስታረቂያ ታሪክ / Reconciliation history</h4>
            <ul>
              <li v-for="item in snapshot.reconciliations" :key="item.id">
                {{ item.result === 'matched' ? labels.matched : labels.changed }}
                — {{ item.reconciled_at_utc }}
              </li>
            </ul>
          </div>

          <div v-if="canReconcile" class="election-source__reconcile">
            <label :for="`reconcile-reason-${snapshot.id}`">{{ labels.reconcileReason }}</label>
            <textarea
              :id="`reconcile-reason-${snapshot.id}`"
              v-model="reasons[snapshot.id]"
              rows="2"
              :placeholder="labels.reconcilePlaceholder"
              :disabled="busyAction !== null"
            />
            <button
              type="button"
              class="election-source__secondary"
              :disabled="busyAction !== null || (reasons[snapshot.id] ?? '').trim().length < 10"
              @click="reconcile(snapshot)"
            >
              {{ busyAction === `reconcile-${snapshot.id}` ? labels.loading : labels.reconcile }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.election-source {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
  min-width: 0;
}
.election-source__back a,
.election-source__refresh {
  color: var(--mases-color-text-brand);
  font: inherit;
  text-decoration: none;
}
.election-source__back a:hover {
  text-decoration: underline;
}
.election-source__warning {
  padding: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-warning, var(--mases-color-border-subtle));
  border-radius: var(--mases-radius-lg);
  background: var(--mases-color-surface-subtle);
}
.election-source__warning h2,
.election-source__capture h2,
.election-source__list h2 {
  margin: 0 0 var(--mases-space-2);
  font-size: var(--mases-font-size-heading-6);
}
.election-source__warning p {
  margin: var(--mases-space-2) 0 0;
  color: var(--mases-color-text-secondary);
  line-height: var(--mases-line-height-body);
}
.election-source__capture,
.election-source__card {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  padding: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background: var(--mases-color-surface-raised);
}
.election-source__capture label,
.election-source__reconcile label {
  font-weight: var(--mases-font-weight-semibold);
}
.election-source__capture input,
.election-source__reconcile textarea {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface-page);
  font: inherit;
}
.election-source__capture p {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}
.election-source__primary,
.election-source__secondary {
  align-self: flex-start;
  min-height: 2.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--mases-radius-md);
  font: inherit;
  font-weight: var(--mases-font-weight-semibold);
  cursor: pointer;
}
.election-source__primary {
  border: 1px solid var(--mases-color-action-primary);
  color: var(--mases-color-text-inverse);
  background: var(--mases-color-action-primary);
}
.election-source__secondary {
  border: 1px solid var(--mases-color-border-subtle);
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface-page);
}
.election-source__primary:disabled,
.election-source__secondary:disabled,
.election-source__refresh:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.election-source__list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
}
.election-source__list-heading,
.election-source__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}
.election-source__cards {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-3);
}
.election-source__card-header h3 {
  margin: 0;
  font-size: var(--mases-font-size-heading-6);
}
.election-source__blocked {
  padding: 0.2rem 0.55rem;
  border-radius: var(--mases-radius-full);
  color: var(--mases-color-text-secondary);
  background: var(--mases-color-surface-subtle);
  font-size: var(--mases-font-size-body-sm);
}
.election-source__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--mases-space-3);
  margin: 0;
}
.election-source__facts dt {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}
.election-source__facts dd {
  margin: 0.2rem 0 0;
  color: var(--mases-color-text-primary);
  font-variant-numeric: tabular-nums;
}
.election-source__digest {
  margin: 0;
  overflow-wrap: anywhere;
}
.election-source__history h4 {
  margin: 0 0 var(--mases-space-2);
}
.election-source__history ul {
  margin: 0;
  padding-inline-start: 1.25rem;
}
.election-source__success {
  color: var(--mases-color-status-success-text);
}
.election-source__error {
  color: var(--mases-color-status-danger-text);
}
.election-source__refresh:focus-visible,
.election-source__primary:focus-visible,
.election-source__secondary:focus-visible,
.election-source__back a:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}
@media (prefers-reduced-motion: reduce) {
  .election-source {
    scroll-behavior: auto;
  }
}
</style>
