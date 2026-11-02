<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getElectionCandidateReview, saveCandidatePreference, submitCandidateFeedback, submitElectionNomination, type ElectionCandidate } from './api';
const route=useRoute(); const electionId=Number(route.params.id);
const candidates=ref<readonly ElectionCandidate[]>([]); const candidatePersonId=ref(''); const statement=ref('');
const ratings=ref<Record<number,number>>({}); const comments=ref<Record<number,string>>({});
const message=ref(''); const error=ref(''); const busy=ref(false);
async function load(){busy.value=true;error.value='';try{candidates.value=await getElectionCandidateReview(electionId)}catch{error.value='የታጩ እጩዎችን ማምጣት አልተቻለም | Unable to load approved candidates.'}finally{busy.value=false}}
async function nominate(self:boolean){const id=Number(candidatePersonId.value);if(!Number.isSafeInteger(id)||id<1){error.value='ትክክለኛ የሰው መለያ ያስገቡ | Enter a valid person ID.';return}busy.value=true;try{await submitElectionNomination(electionId,{candidate_person_id:id,self_nomination:self,statement:statement.value});message.value='እጩነት ተልኳል | Nomination submitted.';candidatePersonId.value='';statement.value=''}catch{error.value='እጩነት አልተላከም | Nomination could not be submitted.'}finally{busy.value=false}}
async function feedback(c:ElectionCandidate){busy.value=true;try{await submitCandidateFeedback(electionId,c.id,{rating:ratings.value[c.id]??3,comment:comments.value[c.id]});message.value='ግብረመልስ ተመዝግቧል | Feedback saved.'}catch{error.value='ግብረመልስ አልተመዘገበም | Feedback could not be saved.'}finally{busy.value=false}}
async function prefer(c:ElectionCandidate){busy.value=true;try{await saveCandidatePreference(electionId,c.id);message.value='ምርጫዎ ተመዝግቧል | Preference saved.'}catch{error.value='ምርጫዎ አልተመዘገበም | Preference could not be saved.'}finally{busy.value=false}}
onMounted(()=>{if(Number.isSafeInteger(electionId)&&electionId>0)void load();else error.value='Invalid election identifier.'});
</script>
<template>
<main class="candidate-review">
<header><p>ARNA · ባለአክሲዮኖች</p><h1>እጩዎችን ይገምግሙ | Shareholder candidate review</h1><p>እርስዎን ወይም ሌላ ብቁ ሰው መሾም፣ እጩዎችን መገምገምና ምርጫ ማሳየት ይችላሉ።</p></header>
<p v-if="error" role="alert">{{error}}</p><p v-if="message" role="status">{{message}}</p>
<section><h2>እጩ ይሹሙ | Nominate a candidate</h2><label for="candidate-person">የሰው መለያ | Person ID</label><input id="candidate-person" v-model="candidatePersonId" inputmode="numeric" /><label for="statement">የሹመት ምክንያት | Statement</label><textarea id="statement" v-model="statement" rows="3" maxlength="10000"/><div class="actions"><button :disabled="busy" @click="nominate(true)">ራሴን እሾማለሁ | Nominate myself</button><button :disabled="busy" @click="nominate(false)">ሌላ ሰው እሾማለሁ | Nominate another</button></div></section>
<section><h2>የጸደቁ እጩዎች | Approved candidates</h2><p v-if="busy">በመጫን ላይ | Loading…</p><p v-else-if="!candidates.length">ለግምገማ የተጸደቀ እጩ የለም | No approved candidates are available.</p>
<article v-for="candidate in candidates" :key="candidate.id"><h3>{{candidate.candidate_name_snapshot||('Person #'+candidate.candidate_person_id)}}</h3><p>{{candidate.nomination_statement}}</p><label :for="'rating-'+candidate.id">ደረጃ (1–5) | Rating</label><select :id="'rating-'+candidate.id" v-model.number="ratings[candidate.id]"><option v-for="n in 5" :key="n" :value="n">{{n}}</option></select><label :for="'comment-'+candidate.id">አስተያየት | Comment</label><textarea :id="'comment-'+candidate.id" v-model="comments[candidate.id]" rows="2" maxlength="5000"/><div class="actions"><button :disabled="busy" @click="feedback(candidate)">ግብረመልስ ላክ | Submit feedback</button><button :disabled="busy" @click="prefer(candidate)">እመርጣለሁ | Mark preference</button></div></article></section>
<p class="notice">ይህ ግምገማና ምርጫ አስተያየታዊ ነው፤ የሕጋዊ ድምፅ አሰጣጥ አይደለም። | Ratings and preferences are advisory, not the binding election ballot.</p>
</main></template>
<style scoped>
.candidate-review{display:grid;gap:1rem;max-width:70rem;margin:auto}.candidate-review section,.candidate-review article{border:1px solid var(--mases-color-border-subtle);border-radius:var(--mases-radius-md);padding:1rem}.candidate-review article{margin-block:.75rem}.candidate-review label,.candidate-review textarea,.candidate-review input,.candidate-review select{display:block;width:100%;margin-block:.5rem}.actions{display:flex;flex-wrap:wrap;gap:.5rem}.actions button{min-height:2.75rem;padding:.5rem .8rem}.notice{padding:1rem;background:var(--mases-color-surface-subtle)}@media(max-width:640px){.actions{display:grid}.actions button{width:100%}}
</style>