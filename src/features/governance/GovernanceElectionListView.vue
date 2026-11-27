<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import EmptyState from '@/components/composites/EmptyState';
import { listGovernanceElections } from '@/features/governance/electionSourceSnapshotsApi';
import type { GovernanceElectionSummary } from '@/features/governance/electionSourceSnapshotsApi';
import { governanceElectionListLabels as labels } from '@/features/governance/electionLabels';

type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const auth = useAuthStore();
const appName: string = import.meta.env.VITE_APP_NAME;
const elections = ref<readonly GovernanceElectionSummary[]>([]);
const state = ref<ViewState>('loading');
const loadError = ref<string | null>(null);
const canOpenSnapshots = computed(() => auth.hasPermission('governance.election.register.view'));
const isAmharic = computed(() => auth.userLocale === 'am');

function title(election: GovernanceElectionSummary): string {
  return (isAmharic.value ? election.title_am : election.title_en)
    || election.title_am
    || election.title_en
    || election.code;
}

async function load(): Promise<void> {
  state.value = 'loading';
  loadError.value = null;
  try {
    const page = await listGovernanceElections();
    elections.value = page.data;
    state.value = page.data.length === 0 ? 'empty' : 'ready';
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : labels.loadError;
    state.value = 'error';
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <PageTitle :title="labels.pageTitle" :suffix="appName" />
  <main class="election-list" data-testid="governance-election-list">
    <PageHeader :title="labels.pageTitle" :description="labels.pageDescription" />

    <section class="election-list__content" aria-live="polite">
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

      <div v-else class="election-list__table-wrap">
        <table class="election-list__table">
          <caption class="sr-only">{{ labels.englishTitle }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ labels.code }}</th>
              <th scope="col">{{ labels.title }}</th>
              <th scope="col">{{ labels.scope }}</th>
              <th scope="col">{{ labels.status }}</th>
              <th scope="col">{{ labels.authority }}</th>
              <th scope="col"><span class="sr-only">{{ labels.openSnapshots }}</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="election in elections" :key="election.id">
              <td class="election-list__code">{{ election.code }}</td>
              <td>{{ title(election) }}</td>
              <td>{{ election.election_scope }}</td>
              <td>{{ election.status }}</td>
              <td>
                <span :class="election.authority_verified_at ? 'election-list__verified' : 'election-list__blocked'">
                  {{ election.authority_verified_at ? labels.verified : labels.notVerified }}
                </span>
              </td>
              <td>
                <RouterLink
                  v-if="canOpenSnapshots"
                  class="election-list__link"
                  :to="`/governance/elections/${election.id}/shareholder-source-snapshots`"
                >
                  {{ labels.openSnapshots }}
                </RouterLink>
                <span v-else class="election-list__muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
.election-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
  min-width: 0;
}
.election-list__content {
  min-width: 0;
  padding: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background: var(--mases-color-surface-raised);
}
.election-list__table-wrap {
  overflow-x: auto;
}
.election-list__table {
  width: 100%;
  border-collapse: collapse;
  text-align: start;
}
.election-list__table th,
.election-list__table td {
  padding: var(--mases-space-3);
  border-bottom: 1px solid var(--mases-color-border-subtle);
  vertical-align: top;
}
.election-list__table th {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  font-weight: var(--mases-font-weight-semibold);
}
.election-list__code {
  font-variant-numeric: tabular-nums;
  font-weight: var(--mases-font-weight-semibold);
}
.election-list__link {
  color: var(--mases-color-text-brand);
  font-weight: var(--mases-font-weight-semibold);
  text-decoration: none;
}
.election-list__link:hover {
  text-decoration: underline;
}
.election-list__link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}
.election-list__verified,
.election-list__blocked,
.election-list__muted {
  font-size: var(--mases-font-size-body-sm);
}
.election-list__verified {
  color: var(--mases-color-status-success-text);
}
.election-list__blocked,
.election-list__muted {
  color: var(--mases-color-text-secondary);
}
</style>
