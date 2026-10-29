<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import {
  listGovernanceElections, createGovernanceElection, transitionGovernanceElection,
  listElectionNominations, listElectionVoters, nominateForElection, reviewElectionNomination,
  registerElectionVoter, castElectionBallot, getElectionResults, listElectionAuditEvents,
  type GovernanceElection, type GovernanceElectionNomination, type GovernanceElectionResult,
  type GovernanceElectionAuditEvent, type GovernanceElectionVoter,
} from './elections';

const appName = import.meta.env.VITE_APP_NAME;
const elections = ref<readonly GovernanceElection[]>([]);
const selected = ref<GovernanceElection | null>(null);
const nominations = ref<readonly GovernanceElectionNomination[]>([]);
const voters = ref<readonly GovernanceElectionVoter[]>([]);
const results = ref<readonly GovernanceElectionResult[]>([]);
const audit = ref<readonly GovernanceElectionAuditEvent[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const bodyId = ref('');
const titleAm = ref('');
const titleEn = ref('');
const mandate = ref('');
const nominationsOpenAt = ref('');
const nominationsCloseAt = ref('');
const votingOpenAt = ref('');
const votingCloseAt = ref('');
const candidateMembershipId = ref('');
const voterMembershipId = ref('');
const nominationStatement = ref('');
const ballotMembershipId = ref('');
const ballotNominationId = ref('');
const receipt = ref('');

async function load(): Promise<void> {
  loading.value = true; error.value = '';
  try { elections.value = (await listGovernanceElections()).data; }
  catch { error.value = 'የምርጫ መረጃ መጫን አልተቻለም። የምርጫ ፈቃዶችን ያረጋግጡ።'; }
  finally { loading.value = false; }
}
async function create(): Promise<void> {
  const body = Number(bodyId.value);
  if (!Number.isSafeInteger(body) || body < 1 || !mandate.value.trim() || !nominationsOpenAt.value || !nominationsCloseAt.value || !votingOpenAt.value || !votingCloseAt.value) {
    error.value = 'የአስተዳደር አካል፣ ሥልጣን እና የምርጫ ጊዜዎችን ያሟሉ።'; return;
  }
  saving.value = true; error.value = '';
  try {
    await createGovernanceElection({
      governance_body_id: body, mandate: mandate.value.trim(),
      ...(titleAm.value.trim() ? { title_am: titleAm.value.trim() } : {}),
      ...(titleEn.value.trim() ? { title_en: titleEn.value.trim() } : {}),
      nominations_open_at: new Date(nominationsOpenAt.value).toISOString(),
      nominations_close_at: new Date(nominationsCloseAt.value).toISOString(),
      voting_open_at: new Date(votingOpenAt.value).toISOString(),
      voting_close_at: new Date(votingCloseAt.value).toISOString(),
    });
    bodyId.value = ''; titleAm.value = ''; titleEn.value = ''; mandate.value = '';
    await load();
  } catch { error.value = 'ምርጫውን መመዝገብ አልተቻለም። የቀኖችን ቅደም ተከተልና ፈቃድ ያረጋግጡ።'; }
  finally { saving.value = false; }
}
async function openElection(election: GovernanceElection): Promise<void> {
  selected.value = election; error.value = ''; results.value = []; receipt.value = '';
  await refreshSelected();
}
async function refreshSelected(): Promise<void> {
  if (!selected.value) return;
  try {
    const id = selected.value.id;
    const [nominationRows, voterRows, auditRows] = await Promise.all([listElectionNominations(id), listElectionVoters(id), listElectionAuditEvents(id)]);
    nominations.value = nominationRows; voters.value = voterRows; audit.value = auditRows;
    if (['voting_closed', 'certified'].includes(selected.value.status)) results.value = await getElectionResults(id);
    else results.value = [];
    await load();
    selected.value = elections.value.find(item => item.id === selected.value?.id) || selected.value;
  } catch { error.value = 'የምርጫ ዝርዝር መጫን አልተቻለም።'; }
}
async function transition(action: 'open_nominations' | 'close_nominations' | 'open_voting' | 'close_voting' | 'certify' | 'cancel'): Promise<void> {
  if (!selected.value) return;
  saving.value = true; error.value = '';
  try { selected.value = await transitionGovernanceElection(selected.value.id, action); await refreshSelected(); }
  catch { error.value = 'የምርጫ ደረጃ መቀየር አልተቻለም። የጊዜ መስፈርቶችንና የፈቃድ ሁኔታን ያረጋግጡ።'; }
  finally { saving.value = false; }
}
async function nominate(): Promise<void> {
  if (!selected.value) return;
  const id = Number(candidateMembershipId.value);
  if (!Number.isSafeInteger(id) || id < 1) { error.value = 'ትክክለኛ የአባልነት መለያ ያስገቡ።'; return; }
  saving.value = true; error.value = '';
  try { await nominateForElection(selected.value.id, id, nominationStatement.value.trim()); candidateMembershipId.value = ''; nominationStatement.value = ''; await refreshSelected(); }
  catch { error.value = 'እጩነትን ማስገባት አልተቻለም።'; }
  finally { saving.value = false; }
}
async function review(nomination: GovernanceElectionNomination, status: 'accepted' | 'rejected'): Promise<void> {
  if (!selected.value) return;
  try { await reviewElectionNomination(selected.value.id, nomination.id, status); await refreshSelected(); }
  catch { error.value = 'እጩነትን መገምገም አልተቻለም።'; }
}
async function registerVoter(): Promise<void> {
  if (!selected.value) return;
  const id = Number(voterMembershipId.value);
  if (!Number.isSafeInteger(id) || id < 1) { error.value = 'ትክክለኛ የአባልነት መለያ ያስገቡ።'; return; }
  try { await registerElectionVoter(selected.value.id, id); voterMembershipId.value = ''; await refreshSelected(); }
  catch { error.value = 'መራጩን መመዝገብ አልተቻለም።'; }
}
async function castBallot(): Promise<void> {
  if (!selected.value) return;
  const voter = Number(ballotMembershipId.value), nomination = Number(ballotNominationId.value);
  if (!Number.isSafeInteger(voter) || voter < 1 || !Number.isSafeInteger(nomination) || nomination < 1) { error.value = 'የአባልነት እና የእጩነት መለያዎችን ያስገቡ።'; return; }
  try { const response = await castElectionBallot(selected.value.id, voter, nomination); receipt.value = response.receipt; ballotMembershipId.value = ''; ballotNominationId.value = ''; await refreshSelected(); }
  catch { error.value = 'ድምፅ መስጠት አልተቻለም። መራጩ በመዝገብ ውስጥ መኖሩንና እስካሁን ድምፅ እንዳልሰጠ ያረጋግጡ።'; }
}
onMounted(() => void load());
</script>

<template>
  <main class="governance-elections">
    <PageTitle title="የአስተዳደር ምርጫዎች" :suffix="appName" />
    <PageHeader title="የአስተዳደር ምርጫዎች" description="የምርጫ ሥልጣንን፣ እጩነትን፣ የመራጮች መዝገብን፣ ሚስጥራዊ ድምፅንና ውጤት ማረጋገጥን በተለየ የGovernance ሥርዓት ያስተዳድሩ።" />
    <section class="governance-elections__panel">
      <h2>አዲስ ምርጫ መመዝገብ</h2>
      <form class="governance-elections__form" @submit.prevent="create">
        <label>የአስተዳደር አካል መለያ<input v-model="bodyId" inputmode="numeric" required /></label>
        <label>ርዕስ (አማርኛ)<input v-model="titleAm" maxlength="200" /></label>
        <label>Title (English)<input v-model="titleEn" maxlength="200" /></label>
        <label>ሥልጣን / የምርጫ መሠረት<input v-model="mandate" maxlength="255" required /></label>
        <label>የእጩነት መጀመሪያ<input v-model="nominationsOpenAt" type="datetime-local" required /></label>
        <label>የእጩነት መጨረሻ<input v-model="nominationsCloseAt" type="datetime-local" required /></label>
        <label>የድምፅ መስጫ መጀመሪያ<input v-model="votingOpenAt" type="datetime-local" required /></label>
        <label>የድምፅ መስጫ መጨረሻ<input v-model="votingCloseAt" type="datetime-local" required /></label>
        <button type="submit" :disabled="saving">ምርጫ መመዝገብ</button>
      </form>
    </section>
    <p v-if="error" role="alert">{{ error }} <button type="button" @click="load">እንደገና ሞክር</button></p>
    <p v-if="loading" role="status">በመጫን ላይ…</p>
    <section v-else class="governance-elections__panel">
      <h2>የምርጫ ዝርዝር</h2>
      <p v-if="!elections.length">ምርጫ አልተመዘገበም።</p>
      <table v-else><thead><tr><th>ርዕስ</th><th>ሥልጣን</th><th>ሁኔታ</th><th>ዝርዝር</th></tr></thead>
        <tbody><tr v-for="election in elections" :key="election.id"><td>{{ election.title_am || election.title_en || ('#' + election.id) }}</td><td>{{ election.mandate }}</td><td>{{ election.status }}</td><td><button type="button" @click="openElection(election)">ክፈት</button></td></tr></tbody>
      </table>
    </section>
    <section v-if="selected" class="governance-elections__panel">
      <header class="governance-elections__header"><h2>{{ selected.title_am || selected.title_en || ('ምርጫ #' + selected.id) }} — {{ selected.status }}</h2><button type="button" @click="selected = null">ዝጋ</button></header>
      <div class="governance-elections__actions">
        <button v-if="selected.status === 'draft'" type="button" :disabled="saving" @click="transition('open_nominations')">እጩነት ክፈት</button>
        <button v-if="selected.status === 'nominations_open'" type="button" :disabled="saving" @click="transition('close_nominations')">እጩነት ዝጋ</button>
        <button v-if="selected.status === 'nominations_closed'" type="button" :disabled="saving" @click="transition('open_voting')">ድምፅ መስጠት ክፈት</button>
        <button v-if="selected.status === 'voting_open'" type="button" :disabled="saving" @click="transition('close_voting')">ድምፅ መስጠት ዝጋ</button>
        <button v-if="selected.status === 'voting_closed'" type="button" :disabled="saving" @click="transition('certify')">ውጤት አረጋግጥ</button>
        <button v-if="['draft','nominations_open','nominations_closed','voting_open'].includes(selected.status)" type="button" :disabled="saving" @click="transition('cancel')">ምርጫ ሰርዝ</button>
      </div>
      <section v-if="selected.status === 'nominations_open'">
        <h3>እጩነት ማስገባት</h3>
        <form class="governance-elections__form" @submit.prevent="nominate"><label>የአባልነት መለያ<input v-model="candidateMembershipId" inputmode="numeric" required /></label><label>መግለጫ<input v-model="nominationStatement" maxlength="10000" /></label><button type="submit" :disabled="saving">እጩነት አስገባ</button></form>
      </section>
      <section v-if="['draft','nominations_open','nominations_closed'].includes(selected.status)">
        <h3>የመራጮች መዝገብ</h3><form class="governance-elections__form" @submit.prevent="registerVoter"><label>የድምፅ መብት ያለው የአባልነት መለያ<input v-model="voterMembershipId" inputmode="numeric" required /></label><button type="submit">መራጭ መዝግብ</button></form>
      </section>
      <section><h3>እጩዎች</h3><p v-if="!nominations.length">እጩነት አልተመዘገበም።</p>
        <table v-else><thead><tr><th>የእጩነት መለያ</th><th>የአባልነት መለያ</th><th>ሁኔታ</th><th>ግምገማ</th></tr></thead><tbody><tr v-for="item in nominations" :key="item.id"><td>{{ item.id }}</td><td>{{ item.governance_membership_id }}</td><td>{{ item.status }}</td><td><button v-if="item.status === 'pending' && ['nominations_open','nominations_closed'].includes(selected.status)" type="button" @click="review(item, 'accepted')">ተቀበል</button> <button v-if="item.status === 'pending' && ['nominations_open','nominations_closed'].includes(selected.status)" type="button" @click="review(item, 'rejected')">አትቀበል</button></td></tr></tbody></table>
      </section>
      <section v-if="selected.status === 'voting_open'"><h3>ሚስጥራዊ ድምፅ መስጠት</h3><form class="governance-elections__form" @submit.prevent="castBallot"><label>የራስዎ የአባልነት መለያ<input v-model="ballotMembershipId" inputmode="numeric" required /></label><label>የተቀባይነት ያገኘ የእጩነት መለያ<input v-model="ballotNominationId" inputmode="numeric" required /></label><button type="submit">ድምፅ ስጥ</button></form><p v-if="receipt" role="status">የድምፅ ደረሰኝ: <code>{{ receipt }}</code></p></section>
      <section v-if="['voting_closed','certified'].includes(selected.status)"><h3>የድምፅ ውጤት</h3><table><thead><tr><th>እጩነት</th><th>የአባልነት መለያ</th><th>ድምፅ</th></tr></thead><tbody><tr v-for="row in results" :key="row.nomination_id"><td>{{ row.nomination_id }}</td><td>{{ row.governance_membership_id }}</td><td>{{ row.vote_count }}</td></tr></tbody></table></section>
      <section><h3>የተመዘገቡ መራጮች</h3>
        <p v-if="!voters.length">መራጭ አልተመዘገበም።</p>
        <table v-else><thead><tr><th>የአባልነት መለያ</th><th>መራጭ</th><th>ድምፅ ተሰጥቷል?</th></tr></thead>
          <tbody><tr v-for="voter in voters" :key="voter.id"><td>{{ voter.governance_membership_id }}</td><td>{{ voter.member_name_am || voter.member_name_en || voter.user_id || '—' }}</td><td>{{ voter.cast_at ? 'አዎ' : 'አይደለም' }}</td></tr></tbody></table>
      </section>
      <section><h3>የምርጫ ኦዲት</h3><ol><li v-for="event in audit" :key="event.id">{{ event.occurred_at }} — {{ event.event_type }} <small>{{ event.metadata ? JSON.stringify(event.metadata) : '' }}</small></li></ol></section>
    </section>
  </main>
</template>

<style scoped>
.governance-elections { display: grid; gap: 1rem; }
.governance-elections__panel { padding: 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.governance-elections__form { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .8rem; }
.governance-elections__form label { display: grid; gap: .35rem; }
.governance-elections__form input, .governance-elections button { max-width: 100%; min-height: 2.4rem; padding: .4rem .65rem; }
.governance-elections__header, .governance-elections__actions { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; justify-content: space-between; }
.governance-elections table { width: 100%; border-collapse: collapse; }
.governance-elections th, .governance-elections td { text-align: start; padding: .65rem; border-bottom: 1px solid var(--color-border, #e2e8f0); }
</style>
