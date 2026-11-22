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
  recordElectionManualCountBatch,
  witnessElectionManualCountBatch,
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
const countBusy = ref(false);
const countError = ref('');
const countNotice = ref('');
const countForm = ref({
  batch_reference: '',
  polling_station: '',
  ballots_received: '',
  ballots_valid: '',
  ballots_rejected: '',
  sealed_box_reference: '',
  count_sheet_reference: '',
  candidate_id: '',
  ballot_count: '',
});

function electionTitle(record: GovernanceElection): string {
  return record.title_am || record.title_en || record.code;
}

function candidateName(candidate: ElectionCandidateRecord): string {
  const person = candidate.person;
  if (!person) return 'Person #' + candidate.person_id;
  const amharic = [person.first_name_am, person.father_name_am, person.grandfather_name_am].filter(Boolean).join(' ');
  const english = [person.first_name_en, person.father_name_en, person.grandfather_name_en].filter(Boolean).join(' ');
  return amharic || english || 'Person #' + candidate.person_id;
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

async function recordCount(): Promise<void> {
  const electionId = Number(route.params.id);
  const candidateId = Number(countForm.value.candidate_id);
  const received = Number(countForm.value.ballots_received);
  const valid = Number(countForm.value.ballots_valid);
  const rejected = Number(countForm.value.ballots_rejected);
  const candidateVotes = Number(countForm.value.ballot_count);

  countError.value = '';
  countNotice.value = '';
  if (!countForm.value.batch_reference.trim() || !countForm.value.sealed_box_reference.trim()
    || !countForm.value.count_sheet_reference.trim() || !Number.isSafeInteger(candidateId) || candidateId < 1
    || !Number.isSafeInteger(received) || !Number.isSafeInteger(valid) || !Number.isSafeInteger(rejected)
    || !Number.isSafeInteger(candidateVotes) || received < 0 || valid < 0 || rejected < 0
    || candidateVotes < 0 || received !== valid + rejected || candidateVotes > valid) {
    countError.value = 'የቆጠራ መረጃውን ያረጋግጡ፤ የተቀበሉ ድምፆች = ትክክለኛ + ውድቅ ድምፆች | Check required references and balanced ballot totals.';
    return;
  }

  countBusy.value = true;
  try {
    await recordElectionManualCountBatch(electionId, {
      batch_reference: countForm.value.batch_reference.trim(),
      polling_station: countForm.value.polling_station.trim() || undefined,
      ballots_received: received,
      ballots_valid: valid,
      ballots_rejected: rejected,
      sealed_box_reference: countForm.value.sealed_box_reference.trim(),
      count_sheet_reference: countForm.value.count_sheet_reference.trim(),
      lines: [{ candidate_id: candidateId, ballot_count: candidateVotes }],
    });
    countNotice.value = 'የቆጠራ ማስረጃ ተመዝግቧል፤ ገለልተኛ ምስክር ይጠበቃል | Count evidence recorded; independent witness required.';
    countForm.value = {
      batch_reference: '', polling_station: '', ballots_received: '', ballots_valid: '',
      ballots_rejected: '', sealed_box_reference: '', count_sheet_reference: '',
      candidate_id: '', ballot_count: '',
    };
    await load();
  } catch {
    countError.value = 'የቆጠራ ማስረጃ አልተመዘገበም። የኮሚቴ ፈቃድና የምርጫ ሁኔታ ያረጋግጡ | Count entry was rejected; verify committee authorization and election state.';
  } finally {
    countBusy.value = false;
  }
}

async function witnessCount(batchId: number): Promise<void> {
  countBusy.value = true;
  countError.value = '';
  countNotice.value = '';
  try {
    await witnessElectionManualCountBatch(Number(route.params.id), batchId);
    countNotice.value = 'የቆጠራ ማስረጃ በገለልተኛ ምስክር ተረጋግጧል | Count evidence independently witnessed.';
    await load();
  } catch {
    countError.value = 'ምስክርነቱ አልተቀበለም። መዝጋቢው ራሱን ሊመሰክር አይችልም | Witnessing failed; the recorder cannot witness their own batch.';
  } finally {
    countBusy.value = false;
  }
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
            <strong>{{ candidateName(candidate) }}</strong>
            <span>{{ candidate.status }} · Consent: {{ candidate.consent_status }} · v{{ candidate.version }}</span>
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
            <button v-if="!batch.witnessed_by && batch.status === 'pending_witness'" type="button" :disabled="countBusy" @click="witnessCount(batch.id)">ምስክርነት ስጥ | Witness</button>
          </li>
        </ul>
        <form v-if="candidates.length && !countAccessMessage && election.status === 'counting'" class="election-detail__count-form" @submit.prevent="recordCount">
          <h3>አዲስ የቆጠራ ማስረጃ | Record a physical count batch</h3>
          <label>የቆጠራ መለያ | Batch reference<input v-model="countForm.batch_reference" required maxlength="100" /></label>
          <label>የምርጫ ጣቢያ | Polling station<input v-model="countForm.polling_station" maxlength="120" /></label>
          <label>የተቀበሉ ድምፆች | Ballots received<input v-model="countForm.ballots_received" required inputmode="numeric" type="number" min="0" /></label>
          <label>ትክክለኛ ድምፆች | Valid ballots<input v-model="countForm.ballots_valid" required inputmode="numeric" type="number" min="0" /></label>
          <label>ውድቅ ድምፆች | Rejected ballots<input v-model="countForm.ballots_rejected" required inputmode="numeric" type="number" min="0" /></label>
          <label>የታሸገ ሳጥን ማጣቀሻ | Sealed-box reference<input v-model="countForm.sealed_box_reference" required maxlength="160" /></label>
          <label>የቆጠራ ሰነድ ማጣቀሻ | Count-sheet reference<input v-model="countForm.count_sheet_reference" required maxlength="160" /></label>
          <label>እጩ | Candidate
            <select v-model="countForm.candidate_id" required>
              <option value="" disabled>ይምረጡ | Select</option>
              <option v-for="candidate in candidates" :key="candidate.id" :value="String(candidate.id)">
                {{ candidate.candidate_name_snapshot || ('Person #' + candidate.candidate_person_id) }}
              </option>
            </select>
          </label>
          <label>የእጩው ድምፅ | Candidate ballot count<input v-model="countForm.ballot_count" required inputmode="numeric" type="number" min="0" /></label>
          <p v-if="countError" role="alert">{{ countError }}</p>
          <p v-if="countNotice" role="status">{{ countNotice }}</p>
          <button type="submit" :disabled="countBusy">ቆጠራ መዝግብ | Record count evidence</button>
        </form>
        <p v-else-if="election.status !== 'counting'">የቆጠራ ሂደት አልተከፈተም | Count entry is available only while the election is in counting state.</p>
        <p v-else-if="!candidates.length">የቆጠራ ማስረጃ ለመመዝገብ ብቁ እጩዎች ያስፈልጋሉ | Candidate records are required before count entry.</p>
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
.election-detail__count-form { display: grid; gap: var(--mases-space-3); margin-block-start: var(--mases-space-4); }
.election-detail__count-form label { display: grid; gap: .35rem; }
.election-detail__count-form input, .election-detail__count-form select { min-height: 2.75rem; width: 100%; }
.election-detail__summary span, .election-detail li span, .election-detail__record span { color: var(--mases-color-text-secondary); }
</style>
