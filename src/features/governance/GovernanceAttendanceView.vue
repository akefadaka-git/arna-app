<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  assessGovernancePenalty,
  createGovernanceMeeting,
  getGovernanceMeeting,
  listGovernanceMeetings,
  recordGovernanceAttendance,
  requestGovernancePenaltySettlement,
  reviewGovernanceProxy,
  submitGovernanceProxy,
  type AttendanceStatus,
  type GovernanceMeeting,
} from '@/features/governance/attendance-api';

const meetings = ref<readonly GovernanceMeeting[]>([]);
const selected = ref<GovernanceMeeting | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const notice = ref('');

const createForm = ref({
  governance_body_id: '',
  meeting_code: '',
  meeting_kind: 'general_assembly' as 'general_assembly' | 'board',
  title_am: '',
  title_en: '',
  starts_at: '',
});
const attendanceForm = ref({
  subject_type: 'shareholder' as 'shareholder' | 'director',
  subject_id: '',
  attendance_status: 'present' as AttendanceStatus,
  arrived_at: '',
  notes: '',
});
const proxyForm = ref({
  principal_type: 'shareholder' as 'shareholder' | 'director',
  principal_id: '',
  proxy_user_id: '',
  instrument_reference: '',
});

const selectedLabel = computed(() => selected.value?.title_am || selected.value?.title_en || selected.value?.meeting_code || '');

async function loadMeetings(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';
  try {
    meetings.value = await listGovernanceMeetings();
    if (selected.value) {
      await selectMeeting(selected.value.id);
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ጉባኤዎችን ማምጣት አልተቻለም / Could not load meetings.';
  } finally {
    loading.value = false;
  }
}

async function selectMeeting(id: number): Promise<void> {
  errorMessage.value = '';
  try {
    selected.value = await getGovernanceMeeting(id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'የጉባኤ መረጃ አልተገኘም / Could not load meeting.';
  }
}

async function createMeeting(): Promise<void> {
  saving.value = true;
  errorMessage.value = '';
  notice.value = '';
  try {
    const meeting = await createGovernanceMeeting({
      governance_body_id: Number(createForm.value.governance_body_id),
      meeting_code: createForm.value.meeting_code.trim(),
      meeting_kind: createForm.value.meeting_kind,
      title_am: createForm.value.title_am || undefined,
      title_en: createForm.value.title_en || undefined,
      starts_at: createForm.value.starts_at,
    });
    notice.value = 'ጉባኤው ተመዝግቧል / Meeting created.';
    createForm.value.meeting_code = '';
    await loadMeetings();
    await selectMeeting(meeting.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ጉባኤውን መመዝገብ አልተቻለም / Could not create meeting.';
  } finally {
    saving.value = false;
  }
}

async function saveAttendance(): Promise<void> {
  if (!selected.value) return;
  saving.value = true;
  errorMessage.value = '';
  notice.value = '';
  try {
    await recordGovernanceAttendance(selected.value.id, {
      subject_type: attendanceForm.value.subject_type,
      subject_id: Number(attendanceForm.value.subject_id),
      attendance_status: attendanceForm.value.attendance_status,
      arrived_at: attendanceForm.value.arrived_at || undefined,
      notes: attendanceForm.value.notes || undefined,
    });
    notice.value = 'የመገኘት መረጃ ተመዝግቧል / Attendance recorded.';
    attendanceForm.value.subject_id = '';
    await selectMeeting(selected.value.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'የመገኘት መረጃ አልተመዘገበም / Could not record attendance.';
  } finally {
    saving.value = false;
  }
}

async function saveProxy(): Promise<void> {
  if (!selected.value) return;
  saving.value = true;
  errorMessage.value = '';
  notice.value = '';
  try {
    await submitGovernanceProxy(selected.value.id, {
      principal_type: proxyForm.value.principal_type,
      principal_id: Number(proxyForm.value.principal_id),
      proxy_user_id: Number(proxyForm.value.proxy_user_id),
      instrument_reference: proxyForm.value.instrument_reference || undefined,
    });
    notice.value = 'የውክልና ጥያቄ ተልኳል / Proxy submitted for review.';
    proxyForm.value.principal_id = '';
    proxyForm.value.proxy_user_id = '';
    await selectMeeting(selected.value.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ውክልናውን መመዝገብ አልተቻለም / Could not submit proxy.';
  } finally {
    saving.value = false;
  }
}

async function reviewProxy(proxyId: number, decision: 'approved' | 'rejected'): Promise<void> {
  saving.value = true;
  errorMessage.value = '';
  try {
    await reviewGovernanceProxy(proxyId, decision);
    notice.value = decision === 'approved' ? 'ውክልናው ጸድቋል / Proxy approved.' : 'ውክልናው ውድቅ ተደርጓል / Proxy rejected.';
    if (selected.value) await selectMeeting(selected.value.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ውሳኔውን ማስቀመጥ አልተቻለም / Could not save proxy decision.';
  } finally {
    saving.value = false;
  }
}

async function assessPenalty(attendanceId: number, type: 'late' | 'absence'): Promise<void> {
  if (!selected.value) return;
  saving.value = true;
  errorMessage.value = '';
  try {
    await assessGovernancePenalty(selected.value.id, attendanceId, type);
    notice.value = type === 'late' ? '50 ብር ቅጣት ተመዝግቧል / ETB 50 late penalty assessed.' : '300 ብር ቅጣት ተመዝግቧል / ETB 300 absence penalty assessed.';
    await selectMeeting(selected.value.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ቅጣቱን መመዝገብ አልተቻለም / Could not assess penalty.';
  } finally {
    saving.value = false;
  }
}

async function requestSettlement(penaltyId: number, amountCents: number, method: 'cash' | 'dividend_offset'): Promise<void> {
  saving.value = true;
  errorMessage.value = '';
  try {
    await requestGovernancePenaltySettlement(penaltyId, method, amountCents);
    notice.value = method === 'cash'
      ? 'የገንዘብ ክፍያ ለፋይናንስ ተልኳል / Cash settlement sent to Finance.'
      : 'የዲቪደንድ ማካካሻ ጥያቄ ለሕግና ፋይናንስ ተልኳል / Dividend offset requested for legal and Finance review.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'የክፍያ ጥያቄውን ማስቀመጥ አልተቻለም / Could not record settlement request.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => { void loadMeetings(); });
</script>

<template>
  <main class="governance-attendance" aria-labelledby="attendance-title">
    <header class="page-header">
      <div>
        <p class="eyebrow">Governance · 001/2016</p>
        <h1 id="attendance-title">የጉባኤ መገኘትና ውክልና / Meeting Attendance</h1>
        <p>የቦርድና የጠቅላላ ጉባኤ መዝገብ፣ ውክልና፣ ቅጣት እና የፋይናንስ ማስተካከያ።</p>
      </div>
      <button type="button" class="secondary" :disabled="loading" @click="loadMeetings">Refresh</button>
    </header>

    <p v-if="notice" class="notice" role="status">{{ notice }}</p>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <section class="panel">
      <h2>ጉባኤ መመዝገብ / Create meeting</h2>
      <form class="form-grid" @submit.prevent="createMeeting">
        <label>Governance body ID
          <input v-model="createForm.governance_body_id" type="number" min="1" required />
        </label>
        <label>Meeting code
          <input v-model="createForm.meeting_code" maxlength="64" required />
        </label>
        <label>Meeting type
          <select v-model="createForm.meeting_kind">
            <option value="general_assembly">ጠቅላላ ጉባኤ / General Assembly</option>
            <option value="board">የዳይሬክተሮች ቦርድ / Board</option>
          </select>
        </label>
        <label>Meeting date and start time
          <input v-model="createForm.starts_at" type="datetime-local" required />
        </label>
        <label>ርዕስ በአማርኛ
          <input v-model="createForm.title_am" maxlength="190" />
        </label>
        <label>Title in English
          <input v-model="createForm.title_en" maxlength="190" />
        </label>
        <div class="form-actions">
          <button type="submit" :disabled="saving">Create meeting</button>
        </div>
      </form>
    </section>

    <section class="workspace-grid">
      <aside class="panel meeting-list">
        <h2>የተመዘገቡ ጉባኤዎች / Meetings</h2>
        <p v-if="loading">Loading…</p>
        <p v-else-if="meetings.length === 0">No meetings recorded yet.</p>
        <button
          v-for="meeting in meetings"
          :key="meeting.id"
          type="button"
          class="meeting-choice"
          :aria-pressed="selected?.id === meeting.id"
          @click="selectMeeting(meeting.id)"
        >
          <strong>{{ meeting.title_am || meeting.title_en || meeting.meeting_code }}</strong>
          <span>{{ meeting.meeting_kind === 'board' ? 'Board' : 'General Assembly' }} · {{ new Date(meeting.starts_at).toLocaleString() }}</span>
        </button>
      </aside>

      <section v-if="selected" class="panel meeting-detail">
        <h2>{{ selectedLabel }}</h2>
        <p class="muted">{{ selected.meeting_code }} · {{ selected.meeting_kind }} · {{ new Date(selected.starts_at).toLocaleString() }}</p>

        <div class="section-block">
          <h3>መገኘት መመዝገብ / Record attendance</h3>
          <form class="form-grid" @submit.prevent="saveAttendance">
            <label>Participant type
              <select v-model="attendanceForm.subject_type">
                <option value="shareholder">Shareholder</option>
                <option value="director">Director</option>
              </select>
            </label>
            <label>Participant ID
              <input v-model="attendanceForm.subject_id" type="number" min="1" required />
            </label>
            <label>Attendance
              <select v-model="attendanceForm.attendance_status">
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused / permitted</option>
                <option value="represented">Represented</option>
              </select>
            </label>
            <label>Arrival time (required for present / late)
              <input v-model="attendanceForm.arrived_at" type="datetime-local" />
            </label>
            <label class="wide">Notes / evidence reference
              <input v-model="attendanceForm.notes" maxlength="2000" />
            </label>
            <div class="form-actions"><button type="submit" :disabled="saving">Save attendance</button></div>
          </form>
        </div>

        <div class="section-block">
          <h3>ውክልና / Proxy submission</h3>
          <p class="muted">GA: deadline 3 days before the meeting. Board: deadline 3 hours before; proxy must be another active Board officer/member.</p>
          <form class="form-grid" @submit.prevent="saveProxy">
            <label>Principal type
              <select v-model="proxyForm.principal_type">
                <option value="shareholder">Shareholder</option>
                <option value="director">Director</option>
              </select>
            </label>
            <label>Principal ID
              <input v-model="proxyForm.principal_id" type="number" min="1" required />
            </label>
            <label>Proxy user ID
              <input v-model="proxyForm.proxy_user_id" type="number" min="1" required />
            </label>
            <label>Instrument / document reference
              <input v-model="proxyForm.instrument_reference" maxlength="2000" />
            </label>
            <div class="form-actions"><button type="submit" :disabled="saving">Submit proxy</button></div>
          </form>
        </div>

        <div class="section-block">
          <h3>Attendance register</h3>
          <div v-if="!selected.attendance?.length" class="empty">No attendance entries.</div>
          <div v-for="entry in selected.attendance" :key="entry.id" class="record-row">
            <span>{{ entry.subject_type }} #{{ entry.subject_id }}</span>
            <strong>{{ entry.attendance_status }}</strong>
            <span>{{ entry.arrived_at ? new Date(entry.arrived_at).toLocaleString() : '—' }}</span>
            <button v-if="entry.attendance_status === 'late'" class="text-button" :disabled="saving" @click="assessPenalty(entry.id, 'late')">Assess ETB 50</button>
            <button v-if="entry.attendance_status === 'absent'" class="text-button" :disabled="saving" @click="assessPenalty(entry.id, 'absence')">Assess ETB 300</button>
          </div>
        </div>

        <div class="section-block">
          <h3>Proxy register</h3>
          <div v-if="!selected.proxies?.length" class="empty">No proxies submitted.</div>
          <div v-for="proxy in selected.proxies" :key="proxy.id" class="record-row">
            <span>{{ proxy.principal_type }} #{{ proxy.principal_id }} → user #{{ proxy.proxy_user_id }}</span>
            <strong>{{ proxy.status }}</strong>
            <span>Deadline {{ new Date(proxy.deadline_at).toLocaleString() }}</span>
            <button v-if="proxy.status === 'submitted'" class="text-button" :disabled="saving" @click="reviewProxy(proxy.id, 'approved')">Approve</button>
            <button v-if="proxy.status === 'submitted'" class="text-button danger-text" :disabled="saving" @click="reviewProxy(proxy.id, 'rejected')">Reject</button>
          </div>
        </div>

        <div class="section-block">
          <h3>Penalty ledger and settlement requests</h3>
          <div v-if="!selected.penalties?.length" class="empty">No penalties assessed.</div>
          <div v-for="penalty in selected.penalties" :key="penalty.id" class="record-row penalty-row">
            <span>{{ penalty.penalty_type === 'late' ? 'Late arrival' : 'Unjustified absence' }} · ETB {{ (penalty.amount_cents / 100).toFixed(2) }}</span>
            <strong>{{ penalty.status }}</strong>
            <button :disabled="saving" class="text-button" @click="requestSettlement(penalty.id, penalty.amount_cents, 'cash')">Record cash payment</button>
            <button :disabled="saving" class="text-button" @click="requestSettlement(penalty.id, penalty.amount_cents, 'dividend_offset')">Request dividend offset</button>
          </div>
          <p class="muted">Settlement requests remain pending Finance review. Dividend offsets are not automatically deducted or posted to the ledger.</p>
        </div>
      </section>
      <section v-else class="panel empty-state">
        <h2>ጉባኤ ይምረጡ / Select a meeting</h2>
        <p>Choose a meeting to manage attendance, proxies, penalties and settlement requests.</p>
      </section>
    </section>
  </main>
</template>

<style scoped>
.governance-attendance { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.eyebrow, .muted { color: var(--mases-color-text-muted); }
h1 { margin: 0 0 .4rem; font-size: clamp(1.35rem, 2.5vw, 2rem); }
h2 { margin: 0 0 1rem; font-size: 1.1rem; }
h3 { margin: 0 0 .8rem; font-size: 1rem; }
.panel { min-width: 0; padding: 1.1rem; border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
label { display: flex; flex-direction: column; gap: .35rem; font-size: .9rem; }
input, select { width: 100%; min-height: 2.65rem; padding: .55rem .65rem; border: 1px solid var(--mases-color-border); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-raised); color: var(--mases-color-text); }
button { min-height: 2.5rem; padding: .5rem .85rem; border: 1px solid transparent; border-radius: var(--mases-radius-md); background: var(--mases-color-action-primary); color: white; cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
button.secondary, .text-button { border-color: var(--mases-color-border); background: transparent; color: var(--mases-color-text); }
.text-button { min-height: 2rem; padding: .25rem .5rem; }
.danger-text { color: var(--mases-color-state-danger); }
.form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; }
.wide { grid-column: 1 / -1; }
.workspace-grid { display: grid; grid-template-columns: minmax(220px, .75fr) minmax(0, 2fr); gap: 1rem; align-items: start; }
.meeting-list { display: flex; flex-direction: column; gap: .55rem; }
.meeting-choice { display: flex; flex-direction: column; align-items: flex-start; gap: .25rem; width: 100%; border: 1px solid var(--mases-color-border-subtle); background: transparent; color: var(--mases-color-text); text-align: left; }
.meeting-choice[aria-pressed="true"] { border-color: var(--mases-color-action-primary); background: var(--mases-color-surface-raised); }
.meeting-choice span { font-size: .8rem; color: var(--mases-color-text-muted); }
.section-block { padding-top: 1.1rem; margin-top: 1.1rem; border-top: 1px solid var(--mases-color-border-subtle); }
.record-row { display: flex; flex-wrap: wrap; align-items: center; gap: .65rem; padding: .65rem 0; border-bottom: 1px solid var(--mases-color-border-subtle); font-size: .88rem; }
.record-row > span:first-child { flex: 1 1 170px; }
.record-row strong { min-width: 80px; }
.empty, .empty-state { color: var(--mases-color-text-muted); }
.notice { padding: .7rem .9rem; border-radius: var(--mases-radius-md); background: var(--mases-color-state-success-subtle); }
.error { padding: .7rem .9rem; border-radius: var(--mases-radius-md); background: var(--mases-color-state-danger-subtle); color: var(--mases-color-state-danger); }
@media (max-width: 760px) { .workspace-grid { grid-template-columns: minmax(0, 1fr); } .form-grid { grid-template-columns: minmax(0, 1fr); } .page-header { flex-direction: column; } }
</style>
