<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/patterns/PageHeader';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { listGovernanceElections, type GovernanceElection } from './api';

const appName = import.meta.env.VITE_APP_NAME;
const loading = ref(true);
const error = ref<unknown | null>(null);
const elections = ref<readonly GovernanceElection[]>([]);

async function load(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    elections.value = (await listGovernanceElections()).items;
  } catch (cause) {
    error.value = cause;
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <PageTitle title="የቦርድ ምርጫ | Board elections" :suffix="appName" />
  <main class="election-list" data-testid="governance-election-list">
    <PageHeader
      title="የቦርድ ምርጫ | Board elections"
      description="የምርጫ ሂደቶችን፣ የሥልጣን ማረጋገጫን እና የመራጮች መዝገብ ሁኔታን ይከታተሉ።"
    />
    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :error="error" @retry="load" />
    <section v-else aria-live="polite">
      <p class="election-list__notice">
        ዲጂታል ድምፅ አሰጣጥ አልተፈቀደም። የአካል ምርጫ ብቻ በዚህ ደረጃ ይደገፋል።
        Electronic voting is disabled. This stage supports physical-election administration only.
      </p>
      <p v-if="elections.length === 0" class="election-list__empty">
        ገና ምርጫ አልተመዘገበም። No elections have been registered.
      </p>
      <ul v-else class="election-list__items">
        <li v-for="election in elections" :key="election.id" class="election-list__item">
          <div>
            <h2>{{ election.title }}</h2>
            <p>{{ election.code }} · {{ election.status }}</p>
          </div>
          <span :data-status="election.authority_verified_at ? 'verified' : 'pending'">
            {{ election.authority_verified_at ? 'Authority verified' : 'Authority pending' }}
          </span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.election-list { display: grid; gap: var(--mases-space-4); }
.election-list__notice { padding: var(--mases-space-3); border-inline-start: 3px solid var(--mases-color-border-brand); background: var(--mases-color-surface-subtle); }
.election-list__empty { color: var(--mases-color-text-secondary); }
.election-list__items { display: grid; gap: var(--mases-space-3); padding: 0; list-style: none; }
.election-list__item { display: flex; justify-content: space-between; align-items: center; gap: var(--mases-space-3); padding: var(--mases-space-4); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-md); }
.election-list__item h2, .election-list__item p { margin: 0; }
.election-list__item p { color: var(--mases-color-text-secondary); }
@media (max-width: 639px) { .election-list__item { align-items: flex-start; flex-direction: column; } }
</style>
