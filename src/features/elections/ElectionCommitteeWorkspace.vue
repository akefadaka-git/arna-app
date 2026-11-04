<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { appointElectionCommitteeMember, decideElectionNomination, decideElectionNominationSubmission, getElectionCommitteeQueue, recuseElectionCommitteeMember, type ElectionCandidate, type ElectionCommitteeQueue } from './api';

const route = useRoute();
const electionId = Number(route.params.id);
const queue = ref<ElectionCommitteeQueue>({ submissions: [], candidates: [], members: [] });
const busy = ref(false);
const error = ref('');
const reasons = ref<Record<number, string>>({});
const notices = ref<Record<number, string>>({});
const appointment = ref({ person_id: '', user_id: '', member_role: 'committee_member' as 'committee_member' | 'legal_advisor' | 'supervisory_member', ex_officio: false, appointment_reference: '' });
const appointmentNotice = ref('');

async function load() {
  busy.value = true; error.value = '';
  try { queue.value = await getElectionCommitteeQueue(electionId); }
  catch { error.value = 'የኮሚቴ ዝርዝር ማምጣት አልተቻለም | Unable to load committee queue.'; }
  finally { busy.value = false; }
}
async function appointMember() {
  const personId = Number(appointment.value.person_id);
  const userId = Number(appointment.value.user_id);
  if (!Number.isSafeInteger(personId) || personId < 1 || !Number.isSafeInteger(userId) || userId < 1 || appointment.value.appointment_reference.trim().length < 3) {
    error.value = 'የሰው እና የተጠቃሚ መለያ፣ የሹመት ማጣቀሻ ያስገቡ | Enter valid person/user IDs and an appointment reference.';
    return;
  }
  busy.value = true; error.value = ''; appointmentNotice.value = '';
  try {
    await appointElectionCommitteeMember(electionId, { ...appointment.value, person_id: personId, user_id: userId, appointment_reference: appointment.value.appointment_reference.trim() });
    appointmentNotice.value = 'የኮሚቴ ሹመት ተመዝግቧል | Committee appointment recorded.';
    appointment.value = { person_id: '', user_id: '', member_role: 'committee_member', ex_officio: false, appointment_reference: '' };
    await load();
  } catch { error.value = 'ሹመቱ አልተመዘገበም። ፈቃድና የተደጋጋሚ ሹመት ሁኔታ ያረጋግጡ። | Appointment failed; verify permission and duplicate membership.'; }
  finally { busy.value = false; }
}
async function decideSubmission(item: Record<string, unknown>, decision: 'approved' | 'rejected' | 'returned') {
  const submissionId = Number(item.id);
  const reason = reasons.value[submissionId]?.trim() ?? '';
  if (!Number.isSafeInteger(submissionId) || submissionId < 1 || reason.length < 10) {
    error.value = 'የማመልከቻ መለያና ቢያንስ 10 ፊደላት ያሉት ምክንያት ያስገቡ | Valid submission ID and a reason of at least 10 characters are required.';
    return;
  }
  busy.value = true; error.value = '';
  try {
    const result = await decideElectionNominationSubmission(electionId, submissionId, { decision, reason });
    notices.value[submissionId] = result.status === 'awaiting_committee_majority' ? 'ድምፅዎ ተመዝግቧል፤ የኮሚቴ አብላጫ ውሳኔ ይጠበቃል | Vote recorded; committee majority pending.' : 'ውሳኔው ተመዝግቧል | Committee decision recorded.';
    await load();
  } catch {
    error.value = 'የማመልከቻ ውሳኔ አልተመዘገበም | Submission decision failed; verify authority, quorum and recusal.';
  } finally { busy.value = false; }
}
async function recuseMember(memberId: number) {
  const scope = window.prompt('Recusal scope / የማግለል ወሰን (e.g. candidate nomination ID)');
  if (!scope?.trim()) return;
  busy.value = true; error.value = '';
  try {
    await recuseElectionCommitteeMember(electionId, memberId, scope.trim());
    await load();
  } catch {
    error.value = 'ማግለሉ አልተመዘገበም | Unable to record committee recusal.';
  } finally { busy.value = false; }
}
async function decide(candidate: ElectionCandidate, decision: 'approved' | 'rejected' | 'returned') {
  const reason = reasons.value[candidate.id]?.trim() ?? '';
  if (reason.length < 10) { error.value = 'የውሳኔ ምክንያት ቢያንስ 10 ፊደላት ይሁን | Enter a reason of at least 10 characters.'; return; }
  busy.value = true; error.value = '';
  try {
    await decideElectionNomination(electionId, candidate.id, { decision, reason, final_ballot_approved: decision === 'approved' });
    notices.value[candidate.id] = 'ውሳኔው ተመዝግቧል | Decision recorded.';
    await load();
  } catch { error.value = 'ውሳኔው አልተመዘገበም። የኮሚቴ ሥልጣን፣ ምልዓተ ጉባኤና የጥቅም ግጭት ያረጋግጡ። | Decision failed; verify committee authority, quorum and recusal.'; }
  finally { busy.value = false; }
}
onMounted(() => { if (Number.isSafeInteger(electionId) && electionId > 0) void load(); else error.value = 'Invalid election identifier.'; });
</script>

<template>
  <main class="election-workspace">
    <header><p>ARNA · አስመራጭ ኮሚቴ</p><h1>የኮሚቴ አስተዳደር | Electoral Committee</h1><p>እጩዎችን ይመርምሩ፣ ማስረጃ ያስመዝግቡ፣ ምክንያታዊ ውሳኔ ይስጡ።</p></header>
    <p v-if="error" role="alert">{{ error }}</p><p v-if="busy" aria-live="polite">በመጫን ላይ | Loading…</p>
    <section><h2>የኮሚቴ አባል ሹም | Appoint Committee member</h2>
      <p>ሹመቱ በአስተዳዳሪ ፈቃድ ይጠበቃል፤ የሕግ አማካሪ የድምፅ መብት እስኪረጋገጥ ድረስ አይገመትም። | Appointment is permission-controlled; Legal Advisor voting eligibility is not assumed.</p>
      <div class="appointment-grid">
        <label>የሰው መለያ | Person ID<input v-model="appointment.person_id" inputmode="numeric" /></label>
        <label>የተጠቃሚ መለያ | User ID<input v-model="appointment.user_id" inputmode="numeric" /></label>
        <label>ሚና | Role<select v-model="appointment.member_role"><option value="committee_member">Committee member</option><option value="legal_advisor">Legal Advisor (ex officio)</option><option value="supervisory_member">Supervisory member</option></select></label>
        <label>የሹመት ማጣቀሻ | Appointment reference<input v-model="appointment.appointment_reference" maxlength="160" /></label>
      </div>
      <label class="inline-check"><input v-model="appointment.ex_officio" type="checkbox" /> Ex officio appointment</label>
      <button :disabled="busy" @click="appointMember">ሹም | Appoint member</button><p v-if="appointmentNotice" role="status">{{ appointmentNotice }}</p>
    </section>
    <section><h2>የኮሚቴ አባላት | Committee roster</h2>
      <p v-if="!queue.members.length">No committee members recorded.</p>
      <ul><li v-for="member in queue.members" :key="member.id">
        Person #{{ member.person_id }} · {{ member.member_role }} · {{ member.status }}
        <span v-if="member.recused_at"> · Recused: {{ member.recusal_scope }}</span>
        <button v-else :disabled="busy || member.status !== 'active'" @click="recuseMember(member.id)">Record recusal</button>
      </li></ul>
    </section>
    <section><h2>የእጩነት ማመልከቻዎች | Nomination submissions</h2>
      <p v-if="!queue.submissions.length">ማመልከቻ የለም | No submissions.</p>
      <article v-for="(item, index) in queue.submissions" :key="String(item.id ?? index)">
        <h3>Person #{{ item.candidate_person_id }} · {{ item.status }}</h3>
        <p>{{ item.statement }}</p>
        <label :for="'submission-reason-' + item.id">የውሳኔ ምክንያት | Decision rationale</label>
        <textarea :id="'submission-reason-' + item.id" v-model="reasons[Number(item.id)]" rows="2" maxlength="10000" />
        <div class="actions">
          <button :disabled="busy || item.status !== 'submitted'" @click="decideSubmission(item, 'approved')">Approve candidate</button>
          <button :disabled="busy || item.status !== 'submitted'" @click="decideSubmission(item, 'returned')">Return</button>
          <button :disabled="busy || item.status !== 'submitted'" @click="decideSubmission(item, 'rejected')">Reject</button>
        </div>
        <p v-if="notices[Number(item.id)]" role="status">{{ notices[Number(item.id)] }}</p>
      </article>
    </section>
    <section><h2>የኮሚቴ እጩዎች | Committee candidates</h2>
      <article v-for="candidate in queue.candidates" :key="candidate.id">
        <h3>{{ candidate.candidate_name_snapshot || ('Person #' + candidate.candidate_person_id) }}</h3>
        <p>{{ candidate.nomination_statement }}</p><p>ሁኔታ | Status: {{ candidate.committee_status }}</p>
        <label :for="'reason-' + candidate.id">የውሳኔ ምክንያት | Decision rationale</label>
        <textarea :id="'reason-' + candidate.id" v-model="reasons[candidate.id]" rows="3" maxlength="10000" />
        <div class="actions">
          <button :disabled="busy" @click="decide(candidate, 'approved')">ለድምፅ ዝርዝር አጽድቅ | Approve for ballot</button>
          <button :disabled="busy" @click="decide(candidate, 'returned')">ለማሻሻያ መልስ | Return</button>
          <button :disabled="busy" @click="decide(candidate, 'rejected')">ውድቅ አድርግ | Reject</button>
        </div><p v-if="notices[candidate.id]" role="status">{{ notices[candidate.id] }}</p>
      </article>
    </section>
    <p class="notice">ውሳኔዎች በኮሚቴ ሥልጣን፣ በምልዓተ ጉባኤና በጥቅም ግጭት ማጣራት ይገደባሉ። | Decisions are subject to Committee authority, quorum and conflict-of-interest controls.</p>
  </main>
</template>
<style scoped>
.election-workspace{display:grid;gap:1.25rem;max-width:70rem;margin:auto}.election-workspace section,.election-workspace article{border:1px solid var(--mases-color-border-subtle);border-radius:var(--mases-radius-md);padding:1rem}.election-workspace article{margin-block:.75rem}.appointment-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:.75rem}.appointment-grid label{display:grid;gap:.35rem}.appointment-grid input,.appointment-grid select{min-height:2.75rem;width:100%}.inline-check{display:flex;align-items:center;gap:.5rem;margin-block:.75rem}.inline-check input{width:auto}.election-workspace label,.election-workspace textarea{display:block;width:100%;margin-block:.5rem}.actions{display:flex;flex-wrap:wrap;gap:.5rem}.actions button{min-height:2.75rem;padding:.5rem .8rem}.notice{background:var(--mases-color-surface-subtle);padding:1rem}@media(max-width:640px){.actions{display:grid}.actions button{width:100%}}
</style>