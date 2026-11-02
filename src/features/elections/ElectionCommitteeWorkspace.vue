<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { decideElectionNomination, getElectionCommitteeQueue, type ElectionCandidate, type ElectionCommitteeQueue } from './api';

const route = useRoute();
const electionId = Number(route.params.id);
const queue = ref<ElectionCommitteeQueue>({ submissions: [], candidates: [] });
const busy = ref(false);
const error = ref('');
const reasons = ref<Record<number, string>>({});
const notices = ref<Record<number, string>>({});

async function load() {
  busy.value = true; error.value = '';
  try { queue.value = await getElectionCommitteeQueue(electionId); }
  catch { error.value = 'የኮሚቴ ዝርዝር ማምጣት አልተቻለም | Unable to load committee queue.'; }
  finally { busy.value = false; }
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
    <section><h2>የእጩነት ማመልከቻዎች | Nomination submissions</h2>
      <p v-if="!queue.submissions.length">ማመልከቻ የለም | No submissions.</p>
      <ul><li v-for="(item, index) in queue.submissions" :key="String(item.id ?? index)">{{ item.candidate_person_id }} · {{ item.status }} · {{ item.statement }}</li></ul>
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
.election-workspace{display:grid;gap:1.25rem;max-width:70rem;margin:auto}.election-workspace section,.election-workspace article{border:1px solid var(--mases-color-border-subtle);border-radius:var(--mases-radius-md);padding:1rem}.election-workspace article{margin-block:.75rem}.election-workspace label,.election-workspace textarea{display:block;width:100%;margin-block:.5rem}.actions{display:flex;flex-wrap:wrap;gap:.5rem}.actions button{min-height:2.75rem;padding:.5rem .8rem}.notice{background:var(--mases-color-surface-subtle);padding:1rem}@media(max-width:640px){.actions{display:grid}.actions button{width:100%}}
</style>