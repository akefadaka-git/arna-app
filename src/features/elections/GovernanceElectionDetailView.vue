<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PageHeader from '@/components/patterns/PageHeader';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import {
  getGovernanceElection,
  getElectionRegisterSnapshot,
  listElectionAuthorityEvidence,
  listElectionCandidates,
  listElectionCommitteeMembers,
  listElectionManualCountEvidence,
  type ElectionAuthorityEvidenceRecord,
  type ElectionCandidateRecord,
  type ElectionCommitteeMemberRecord,
  type ElectionManualCountBatch,
  type ElectionRegisterSnapshot,
  type GovernanceElection,
} from './api';

const route = useRoute();
const appName = import.meta.env.VITE_APP_NAME;
const loading = ref(true);
const error = ref('');
const election = ref<GovernanceElection | null>(null);
const candidates = ref<readonly ElectionCandidateRecord[]>([]);
const committee = ref<readonly ElectionCommitteeMemberRecord[]>([]);
const authorityEvidence = ref<readonly ElectionAuthorityEvidenceRecord[]>([]);
const registerSnapshot = ref<ElectionRegisterSnapshot | null>(null);
const countBatches = ref<readonly ElectionManualCountBatch[]>([]);
const countAccessMessage = ref('');

function electionTitle(record: GovernanceElection): string {
  return record.title_am || record.title_en || record.code;
}

async function load(): Promise<void> {
  const electionId = Number(route.params.id);
  if (!Number.isSafeInteger(electionId) || electionId < 1) {
    error.value = 'የምርጫ መለያው ትክክል አይደለም | Invalid election identifier.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    election.value = await getGovernanceElection(electionId);
  } catch {
    error.value = 'የምርጫ መረጃ ማምጣት አልተቻለም | Unable to load this election.';
    loading.value = false;
    return;
  }

  const results = await Promise.allSettled([
    listElectionCandidates(electionId),
    listElectionCommitteeMembers(electionId),
    listElectionAuthorityEvidence(electionId),
    getElectionRegisterSnapshot(electionId),
    listElectionManualCountEvidence(electionId),
  ]);

  candidates.value = results[0].status === 'fulfilled' ? results[0].value : [];
  committee.value = results[1].status === 'fulfilled' ? results[1].value : [];
  authorityEvidence.value = results[2].status === 'fulfilled' ? results[2].value : [];
  registerSnapshot.value = results[3].status === 'fulfilled' ? results[3].value : null;

  if (results[4].status === 'fulfilled') {
    countBatches.value = results[4].value.batches;
    countAccessMessage.value = '';
  } else {
    countBatches.value = [];
    countAccessMessage.value = 'የቆጠራ ማስረጃ ለተፈቀደላቸው የምርጫ ኮሚቴ አባላት ብቻ ይታያል | Count evidence is restricted to authorized election committee members.';
  }

  loading.value = false;
}

onMounted(() => { void load(); });
</script>

<template>
  <PageTitle title="የምርጫ ዝርዝር | Election detail" :suffix="appName" />
  <main class="election-detail" data-testid="governance-election-detail">
    <p><RouterLink to="/governance/elections">← ወደ ምርጫዎች | Back to elections</RouterLink></p>
    <LoadingState v-if="loading" />
    <ErrorState
      v-else-if="error"
      title="የምርጫ መረጃ አልተገኘም | Election unavailable"
      :description="error"
      action-label="እንደገና ይሞክሩ | Retry"
      @action="load"
    />
    <template v-else-if="election">
      <PageHeader
        :title="electionTitle(election)"
        :description="election.code + ' · ' + election.election_scope + ' · ' + election.election_type"
      />
      <section class="election-detail__summary">
        <div><span>ሁኔታ | Status</span><strong>{{ election.status }}</strong></div>
        <div><span>ስሪት | Version</span><strong>{{ election.version }}</strong></div>
        <div><span>የሥልጣን ማረጋገጫ | Authority</span><strong>{{ election.authority_verified_at ? 'Verified' : 'Pending' }}</strong></div>
      </section>

      <section>
        <h2>እጩዎች | Candidates</h2>
        <p v-if="!candidates.length">ምንም እጩ አልተመዘገበም | No candidates recorded.</p>
        <ul v-else>
          <li v-for="candidate in candidates" :key="candidate.id">
            <strong>{{ candidate.candidate_name_snapshot || ('Person #' + candidate.candidate_person_id) }}</strong>
            <span>{{ candidate.committee_status || candidate.status || '—' }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2>የምርጫ ኮሚቴ | Election committee</h2>
        <p v-if="!committee.length">የኮሚቴ አባላት አልተመዘገቡም | No committee appointments recorded.</p>
        <ul v-else>
          <li v-for="member in committee" :key="member.id">
            <strong>{{ member.member_role }}</strong>
            <span>Person #{{ member.person_id }} · {{ member.status }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2>የሥልጣን ማስረጃ | Authority evidence</h2>
        <p v-if="!authorityEvidence.length">የሥልጣን ማስረጃ አልተመዘገበም | No authority evidence recorded.</p>
        <ul v-else>
          <li v-for="evidence in authorityEvidence" :key="evidence.id">
            <strong>{{ evidence.instrument_type }}</strong>
            <span>{{ evidence.instrument_reference }} · {{ evidence.status }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2>የመራጮች መዝገብ | Voter register</h2>
        <p v-if="!registerSnapshot">የመራጮች መዝገብ ገና አልተዘጋጀም | No register snapshot prepared.</p>
        <div v-else class="election-detail__record">
          <strong>{{ registerSnapshot.status }}</strong>
          <span>Record date: {{ registerSnapshot.record_date }}</span>
          <span>Source: {{ registerSnapshot.source_reference }}</span>
          <span v-if="registerSnapshot.frozen_at">Frozen: {{ registerSnapshot.frozen_at }}</span>
        </div>
      </section>

      <section>
        <h2>የአካል ድምፅ ቆጠራ | Physical count evidence</h2>
        <p v-if="countAccessMessage" role="note">{{ countAccessMessage }}</p>
        <p v-else-if="!countBatches.length">የቆጠራ ማስረጃ አልተመዘገበም | No count batches recorded.</p>
        <ul v-else>
          <li v-for="batch in countBatches" :key="batch.id">
            <strong>{{ batch.batch_reference }}</strong>
            <span>{{ batch.polling_station || '—' }} · {{ batch.status }} · {{ batch.ballots_received }} ballots</span>
            <span>{{ batch.witnessed_by ? 'Independently witnessed' : 'Awaiting witness' }}</span>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>

<style scoped>
.election-detail { display: grid; gap: var(--mases-space-4); }
.election-detail section { padding: var(--mases-space-4); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-md); }
.election-detail h2 { margin-block: 0 var(--mases-space-3); }
.election-detail ul { display: grid; gap: var(--mases-space-2); padding: 0; list-style: none; }
.election-detail li, .election-detail__record { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--mases-space-2); }
.election-detail__summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--mases-space-3); }
.election-detail__summary div { display: grid; gap: .25rem; }
.election-detail__summary span, .election-detail li span, .election-detail__record span { color: var(--mases-color-text-secondary); }
</style>
