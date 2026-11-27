<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
  listMeetingAgenda, addMeetingAgendaItem, listMeetingAttendance, recordMeetingAttendance,
  evaluateMeetingQuorum, listMeetingAuditEvents,
  type GovernanceMeeting, type GovernanceAgendaItem, type GovernanceMeetingAttendance,
  type GovernanceMeetingAuditEvent, type GovernanceQuorumSnapshot,
} from './meetings';

const props = defineProps<{ meeting: GovernanceMeeting }>();
const emit = defineEmits<{ close: [] }>();
const agenda = ref<readonly GovernanceAgendaItem[]>([]);
const attendance = ref<readonly GovernanceMeetingAttendance[]>([]);
const audit = ref<readonly GovernanceMeetingAuditEvent[]>([]);
const quorum = ref<GovernanceQuorumSnapshot | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const titleAm = ref('');
const titleEn = ref('');
const position = ref('1');
const membershipId = ref('');
const attendanceStatus = ref<GovernanceMeetingAttendance['attendance_status']>('present');
let requestSequence = 0;

async function load(): Promise<void> {
  const sequence = ++requestSequence;
  loading.value = true; error.value = ''; quorum.value = null;
  try {
    const [agendaRows, attendanceRows, auditRows] = await Promise.all([
      listMeetingAgenda(props.meeting.id), listMeetingAttendance(props.meeting.id), listMeetingAuditEvents(props.meeting.id),
    ]);
    if (sequence !== requestSequence) return;
    agenda.value = agendaRows; attendance.value = attendanceRows; audit.value = auditRows;
  } catch {
    if (sequence === requestSequence) error.value = 'የስብሰባ ዝርዝር መጫን አልተቻለም።';
  } finally { if (sequence === requestSequence) loading.value = false; }
}
async function addAgenda(): Promise<void> {
  const order = Number(position.value);
  if (!Number.isSafeInteger(order) || order < 1 || (!titleAm.value.trim() && !titleEn.value.trim())) {
    error.value = 'የአጀንዳ ቅደም ተከተልና ርዕስ ያስገቡ።'; return;
  }
  saving.value = true; error.value = '';
  try {
    await addMeetingAgendaItem(props.meeting.id, { position: order, ...(titleAm.value.trim() ? { title_am: titleAm.value.trim() } : {}), ...(titleEn.value.trim() ? { title_en: titleEn.value.trim() } : {}) });
    titleAm.value = ''; titleEn.value = ''; await load();
  } catch { error.value = 'አጀንዳ መጨመር አልተቻለም። ስብሰባው በረቂቅ ሁኔታ መሆኑን ያረጋግጡ።'; }
  finally { saving.value = false; }
}
async function saveAttendance(): Promise<void> {
  const id = Number(membershipId.value);
  if (!Number.isSafeInteger(id) || id < 1) { error.value = 'ትክክለኛ የአባልነት መለያ ያስገቡ።'; return; }
  saving.value = true; error.value = '';
  try { await recordMeetingAttendance(props.meeting.id, { governance_membership_id: id, attendance_status: attendanceStatus.value }); membershipId.value = ''; await load(); }
  catch { error.value = 'የተሳትፎ መዝገብ ማስቀመጥ አልተቻለም።'; }
  finally { saving.value = false; }
}
async function evaluate(): Promise<void> {
  error.value = '';
  try { quorum.value = await evaluateMeetingQuorum(props.meeting.id); audit.value = await listMeetingAuditEvents(props.meeting.id); }
  catch { error.value = 'የኮረም ስሌት አልተሳካም። የድምፅ መብት ያላቸውን አባላት ያረጋግጡ።'; }
}
onMounted(() => void load());
watch(() => props.meeting.id, () => void load());
</script>

<template>
  <section class="meeting-workspace" aria-labelledby="meeting-workspace-title">
    <header class="meeting-workspace__header">
      <div><h2 id="meeting-workspace-title">የስብሰባ ዝርዝር: {{ meeting.title_am || meeting.title_en || ('#' + meeting.id) }}</h2><p>አጀንዳ፣ ተሳትፎ፣ ኮረም እና የኦዲት ታሪክ</p></div>
      <button type="button" @click="emit('close')">ዝጋ</button>
    </header>
    <p v-if="error" role="alert">{{ error }} <button type="button" @click="load">እንደገና ሞክር</button></p>
    <p v-if="loading" role="status">በመጫን ላይ…</p>
    <div class="meeting-workspace__grid">
      <section><h3>የአጀንዳ ነጥቦች</h3>
        <form @submit.prevent="addAgenda">
          <label>ቅደም ተከተል<input v-model="position" type="number" min="1" required /></label>
          <label>ርዕስ (አማርኛ)<input v-model="titleAm" maxlength="200" /></label>
          <label>Title (English)<input v-model="titleEn" maxlength="200" /></label>
          <button type="submit" :disabled="saving || loading">አጀንዳ ጨምር</button>
        </form>
        <ol><li v-for="item in agenda" :key="item.id">{{ item.position }}. {{ item.title_am || item.title_en }} <small>({{ item.status }})</small></li></ol>
        <p v-if="!agenda.length && !loading">አጀንዳ ነጥብ አልተመዘገበም።</p>
      </section>
      <section><h3>ተሳትፎ መመዝገብ</h3>
        <form @submit.prevent="saveAttendance">
          <label>የአባልነት መለያ<input v-model="membershipId" inputmode="numeric" required /></label>
          <label>የተሳትፎ ሁኔታ<select v-model="attendanceStatus"><option value="present">ተገኝቷል</option><option value="remote">በመስመር ላይ</option><option value="absent">አልተገኘም</option><option value="excused">በፈቃድ ቀርቷል</option></select></label>
          <button type="submit" :disabled="saving || loading">ተሳትፎ መዝግብ</button>
        </form>
        <ul><li v-for="row in attendance" :key="row.id">{{ row.member_name_am || row.member_name_en || row.user_id || ('Membership #' + row.governance_membership_id) }} — {{ row.attendance_status }}</li></ul>
        <p v-if="!attendance.length && !loading">ተሳትፎ አልተመዘገበም።</p>
      </section>
      <section><h3>ኮረም</h3><p>በንቁ እና በግልጽ የድምፅ መብት ባላቸው አባላት ላይ 50% ዝቅተኛ ገደብ።</p>
        <button type="button" :disabled="loading" @click="evaluate">ኮረም አስላ</button>
        <p v-if="quorum" role="status">{{ quorum.quorum_met ? 'ኮረም ተሟልቷል' : 'ኮረም አልተሟላም' }} — {{ quorum.present_voting_members }} / {{ quorum.eligible_voting_members }} (የሚያስፈልግ: {{ quorum.threshold_count }})</p>
      </section>
      <section><h3>የኦዲት ታሪክ</h3>
        <ol><li v-for="event in audit" :key="event.id">{{ event.occurred_at }} — {{ event.event_type }} <small>{{ event.after_json ? JSON.stringify(event.after_json) : '' }}</small></li></ol>
        <p v-if="!audit.length && !loading">የኦዲት ክስተት አልተመዘገበም።</p>
      </section>
    </div>
  </section>
</template>

<style scoped>
.meeting-workspace { margin-top: 1rem; padding: 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.meeting-workspace__header { display: flex; justify-content: space-between; align-items: start; gap: 1rem; }
.meeting-workspace__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); gap: 1rem; }
.meeting-workspace__grid section { min-width: 0; }
.meeting-workspace form, .meeting-workspace label { display: grid; gap: .5rem; }
.meeting-workspace form { margin-block: .75rem; }
.meeting-workspace input, .meeting-workspace select, .meeting-workspace button { max-width: 100%; min-height: 2.3rem; }
</style>
