<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/patterns/PageHeader';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { listGovernanceElections, type GovernanceElectionSummary } from './source-snapshot-api';

const appName = import.meta.env.VITE_APP_NAME;
const elections = ref<readonly GovernanceElectionSummary[]>([]);
const loading = ref(false);
const errorMessage = ref('');

async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';
  try {
    const page = await listGovernanceElections();
    elections.value = page.data;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ምርጫዎችን ማምጣት አልተቻለም | Unable to load elections.';
  } finally {
    loading.value = false;
  }
}

function title(election: GovernanceElectionSummary): string {
  return election.title_am || election.title_en || election.code;
}

onMounted(() => { void load(); });
</script>

<template>
  <PageTitle title="የቦርድ ምርጫዎች | Board elections" :suffix="appName" />
  <main class="elections-page" data-testid="board-election-list">
    <PageHeader
      title="የቦርድ ምርጫዎች | Board elections"
      description="የምርጫ ሥልጣንን፣ የሁኔታ ለውጦችን እና የባለአክሲዮን ምንጭ ማህደሮችን ይከታተሉ።"
    />
    <LoadingState v-if="loading" />
    <ErrorState
      v-else-if="errorMessage"
      title="ምርጫዎችን ማምጣት አልተቻለም | Unable to load elections"
      :description="errorMessage"
      action-label="እንደገና ይሞክሩ | Retry"
      @action="load"
    />
    <section v-else aria-live="polite">
      <p v-if="elections.length === 0" class="elections-page__empty">
        በዚህ ተቋም ምንም ምርጫ አልተመዘገበም። No elections are registered for this tenant.
      </p>
      <ul v-else class="elections-page__list">
        <li v-for="election in elections" :key="election.id" class="elections-page__item">
          <div class="elections-page__identity">
            <h2>{{ title(election) }}</h2>
            <p>{{ election.code }} · {{ election.election_scope }} · {{ election.status }}</p>
            <p :data-state="election.authority_verified_at ? 'verified' : 'blocked'">
              {{ election.authority_verified_at ? 'ሥልጣን ተረጋግጧል | Authority verified' : 'ሥልጣን አልተረጋገጠም | Authority not verified' }}
            </p>
          </div>
          <RouterLink
            class="elections-page__link"
            :to="{ name: 'governance-election-source-register', params: { id: election.id } }"
          >
            የባለአክሲዮን ምንጭ ማህደር | Shareholder source records
          </RouterLink>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.elections-page { display: grid; gap: var(--mases-space-4); }
.elections-page__empty { color: var(--mases-color-text-secondary); }
.elections-page__list { display: grid; gap: var(--mases-space-3); padding: 0; list-style: none; }
.elections-page__item { display: flex; justify-content: space-between; align-items: center; gap: var(--mases-space-4); padding: var(--mases-space-4); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-md); }
.elections-page__identity h2, .elections-page__identity p { margin: 0; }
.elections-page__identity p { color: var(--mases-color-text-secondary); }
.elections-page__identity [data-state='blocked'] { color: var(--mases-color-text-warning); }
.elections-page__link { color: var(--mases-color-text-link); font-weight: 600; }
@media (max-width: 639px) { .elections-page__item { align-items: flex-start; flex-direction: column; } }
</style>
