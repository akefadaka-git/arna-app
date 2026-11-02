<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import {
  authorizeMeetingAbsence, closeMeeting, createMeeting, getMeeting, listMeetings,
  recordMeetingArrival, recordMeetingPenaltyPayment, requestMeetingDividendSettlement, disputeMeetingPenalty,
  reviewMeetingPenalty, reviewMeetingProxy, startMeeting, submitMeetingProxy,
} from './meetings-api';
import type { GovernanceMeeting, MeetingDetail } from './meetings-api';

const isEnglish = computed(() => document.documentElement.lang.toLowerCase().startsWith('en'));
const t = (am: string, en: string) => isEnglish.value ? en : am;
const appName = import.meta.env.VITE_APP_NAME;
const meetings = ref<GovernanceMeeting[]>([]);
const detail = ref<MeetingDetail | null>(null);
const selectedId = ref<number | null>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const createForm = ref({ governance_body_id: '', meeting_kind: 'ga', scheduled_at: '', timezone: 'Africa/Addis_Ababa', title_am: '', title_en: '' });
const arrivalForm = ref({ membership_id: '', proxy_id: '' });
const proxyForm = ref({ principal_membership_id: '', representative_membership_id: '', representative_name: '', instrument_reference: '', appointed_at: '' });
const excuseForm = ref({ membership_id: '', authorization_reference: '', reason: '' });
const paymentForm = ref({ penalty_id: '', amount: '', payment_method: 'cash', receipt_reference: '' });\nconst disputeForm = ref({ penalty_id: '', reason: '' });
const offsetForm = ref({ penalty_id: '', shareholder_id: '', dividend_reference: '', requested_amount: '' });
const selectedMeeting = computed(() => detail.value?.meeting ?? null);

async function loadMeetings(): Promise<void> {
  loading.value = true; error.value = null;
  try {
    const page = await listMeetings({ per_page: 100 });
    meetings.value = page.data ?? [];
    if (selectedId.value && meetings.value.some((m) => m.id === selectedId.value)) await selectMeeting(selectedId.value);
  } catch (e) { error.value = e instanceof Error ? e.message : t('ስብሰባዎችን ማምጣት አልተቻለም።', 'Could not load meetings.'); }
  finally { loading.value = false; }
}
async function selectMeeting(id: number): Promise<void> {
  selectedId.value = id; error.value = null;
  try { detail.value = await getMeeting(id); }
  catch (e) { error.value = e instanceof Error ? e.message : t('የስብሰባ ዝርዝር አልተገኘም።', 'Could not load meeting details.'); }
}
async function runAction(action: () => Promise<unknown>, message: string): Promise<void> {
  saving.value = true; error.value = null; success.value = null;
  try { await action(); success.value = message; if (selectedId.value) await selectMeeting(selectedId.value); await loadMeetings(); }
  catch (e) { error.value = e instanceof Error ? e.message : t('ተግባሩ አልተሳካም።', 'The operation failed.'); }
  finally { saving.value = false; }
}
async function submitMeeting(): Promise<void> {
  await runAction(async () => {
    const created = await createMeeting({
      governance_body_id: Number(createForm.value.governance_body_id),
      meeting_kind: createForm.value.meeting_kind as 'ga' | 'board',
      scheduled_at: createForm.value.scheduled_at,
      timezone: createForm.value.timezone,
      title_am: createForm.value.title_am || undefined,
      title_en: createForm.value.title_en || undefined,
    });
    selectedId.value = created.id;
  }, t('ስብሰባው ተመዝግቧል።', 'Meeting created.'));
}
async function startSelected(): Promise<void> { if (selectedId.value) await runAction(() => startMeeting(selectedId.value!), t('ስብሰባው ተጀምሯል።', 'Meeting started.')); }
async function closeSelected(): Promise<void> { if (selectedId.value) await runAction(() => closeMeeting(selectedId.value!), t('ስብሰባው ተዘግቷል፤ የቅጣት እጩዎች ለግምገማ ተፈጥረዋል።', 'Meeting closed; penalty candidates await review.')); }
async function recordArrival(): Promise<void> {
  if (!selectedId.value) return;
  await runAction(() => recordMeetingArrival(selectedId.value!, { membership_id: Number(arrivalForm.value.membership_id), ...(arrivalForm.value.proxy_id ? { proxy_id: Number(arrivalForm.value.proxy_id) } : {}) }), t('መገኘት ተመዝግቧል።', 'Attendance recorded.'));
}
async function submitProxy(): Promise<void> {
  if (!selectedId.value) return;
  await runAction(() => submitMeetingProxy(selectedId.value!, {
    principal_membership_id: Number(proxyForm.value.principal_membership_id),
    ...(proxyForm.value.representative_membership_id ? { representative_membership_id: Number(proxyForm.value.representative_membership_id) } : {}),
    representative_name: proxyForm.value.representative_name,
    instrument_reference: proxyForm.value.instrument_reference,
    appointed_at: proxyForm.value.appointed_at,
  }), t('የውክልና ማመልከቻ ተመዝግቧል።', 'Proxy submitted for review.'));
}
async function reviewProxy(proxyId: number, decision: 'accept' | 'reject'): Promise<void> {
  if (selectedId.value) await runAction(() => reviewMeetingProxy(selectedId.value!, proxyId, { decision, reason: decision === 'accept' ? 'Validated by authorized reviewer.' : 'Rejected by authorized reviewer.' }), t('የውክልና ውሳኔ ተመዝግቧል።', 'Proxy decision recorded.'));
}
async function authorizeAbsence(): Promise<void> {
  if (selectedId.value) await runAction(() => authorizeMeetingAbsence(selectedId.value!, { membership_id: Number(excuseForm.value.membership_id), authorization_reference: excuseForm.value.authorization_reference, reason: excuseForm.value.reason }), t('የመቅረት ፈቃድ ተመዝግቧል።', 'Absence authorization recorded.'));
}
async function reviewPenalty(id: number, decision: 'assess' | 'waive'): Promise<void> {
  if (selectedId.value) await runAction(() => reviewMeetingPenalty(selectedId.value!, id, { decision, reason: decision === 'assess' ? 'Attendance evidence reviewed.' : 'Waived by authorized reviewer.' }), t('የቅጣት ውሳኔ ተመዝግቧል።', 'Penalty decision recorded.'));
}
async function disputePenalty(): Promise<void> {
  if (selectedId.value) await runAction(() => disputeMeetingPenalty(selectedId.value!, Number(disputeForm.value.penalty_id), { reason: disputeForm.value.reason }), t('የቅጣት ተቃውሞ ተመዝግቧል።', 'Penalty dispute recorded.'));
}
async function recordPayment(): Promise<void> {
  if (selectedId.value) await runAction(() => recordMeetingPenaltyPayment(selectedId.value!, Number(paymentForm.value.penalty_id), { amount: Number(paymentForm.value.amount), payment_method: paymentForm.value.payment_method, receipt_reference: paymentForm.value.receipt_reference }), t('ክፍያው ተመዝግቧል፤ የFinance ማስታረቅ ይጠብቃል።', 'Payment recorded; Finance reconciliation is pending.'));
}
async function requestOffset(): Promise<void> {
  if (selectedId.value) await runAction(() => requestMeetingDividendSettlement(selectedId.value!, Number(offsetForm.value.penalty_id), { shareholder_id: Number(offsetForm.value.shareholder_id), dividend_reference: offsetForm.value.dividend_reference, requested_amount: Number(offsetForm.value.requested_amount) }), t('የዲቪደንድ ማካካሻ ጥያቄ ለFinance/Legal ግምገማ ተልኳል።', 'Dividend settlement request submitted for Finance/Legal review.'));
}
onMounted(() => { void loadMeetings(); });
</script>

<template>
  <PageTitle :title="t('የጉባኤ መገኘትና ቅጣት', 'Meeting attendance and penalties')" :suffix="appName" />
  <main class="meeting-attendance" data-testid="meeting-attendance-root">
    <PageHeader :title="t('የጉባኤ መገኘትና ቅጣት', 'Meeting attendance and penalties')" :description="t('የቦርድና የጠቅላላ ጉባኤ ስብሰባ፣ ውክልና፣ መገኘት፣ ቅጣትና ክፍያ በኦዲት ማስረጃ ይቆጣጠሩ።', 'Manage Board and General Assembly meetings, proxies, attendance, penalties and payments with an auditable record.')" />
    <p v-if="success" class="notice notice--success" role="status">{{ success }}</p>
    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>

    <section class="meeting-grid">
      <Card class="meeting-card">
        <h2>{{ t('አዲስ ስብሰባ መመዝገብ', 'Create a meeting') }}</h2>
        <form class="meeting-form" @submit.prevent="submitMeeting">
          <label>{{ t('የGovernance Body ID', 'Governance body ID') }}<input v-model="createForm.governance_body_id" type="number" min="1" required /></label>
          <label>{{ t('የስብሰባ ዓይነት', 'Meeting type') }}<select v-model="createForm.meeting_kind"><option value="ga">GA</option><option value="board">Board</option></select></label>
          <label>{{ t('የመጀመሪያ ቀንና ሰዓት', 'Scheduled date and time') }}<input v-model="createForm.scheduled_at" type="datetime-local" required /></label>
          <label>{{ t('የሰዓት ክልል', 'Timezone') }}<input v-model="createForm.timezone" required /></label>
          <label>{{ t('ርዕስ (አማርኛ)', 'Title (Amharic)') }}<input v-model="createForm.title_am" /></label>
          <label>{{ t('ርዕስ (English)', 'Title (English)') }}<input v-model="createForm.title_en" /></label>
          <button type="submit" :disabled="saving">{{ t('ስብሰባ መፍጠር', 'Create meeting') }}</button>
        </form>
      </Card>
      <Card class="meeting-card">
        <h2>{{ t('የተመዘገቡ ስብሰባዎች', 'Meetings') }}</h2>
        <LoadingState v-if="loading" :label="t('በመጫን ላይ…', 'Loading…')" />
        <ErrorState v-else-if="!meetings.length" :title="t('ስብሰባ የለም', 'No meetings')" :description="t('አዲስ ስብሰባ ይፍጠሩ።', 'Create the first meeting.')" />
        <ul v-else class="meeting-list">
          <li v-for="meeting in meetings" :key="meeting.id">
            <button type="button" class="meeting-select" :aria-pressed="selectedId === meeting.id" @click="selectMeeting(meeting.id)">
              <strong>#{{ meeting.id }} · {{ meeting.meeting_kind.toUpperCase() }}</strong>
              <span>{{ meeting.title_am || meeting.title_en || '—' }}</span>
              <small>{{ meeting.scheduled_at }} · {{ meeting.status }}</small>
            </button>
          </li>
        </ul>
      </Card>
    </section>

    <Card v-if="detail && selectedMeeting" class="meeting-card meeting-detail">
      <div class="meeting-detail__heading">
        <div><h2>{{ selectedMeeting.title_am || selectedMeeting.title_en || (selectedMeeting.meeting_kind.toUpperCase() + ' #' + selectedMeeting.id) }}</h2><p>{{ selectedMeeting.scheduled_at }} · {{ selectedMeeting.timezone }} · {{ selectedMeeting.status }}</p></div>
        <div class="meeting-actions">
          <button v-if="selectedMeeting.status === 'scheduled'" type="button" :disabled="saving" @click="startSelected">{{ t('ስብሰባ ጀምር', 'Start meeting') }}</button>
          <button v-if="selectedMeeting.status === 'open'" type="button" :disabled="saving" @click="closeSelected">{{ t('ስብሰባ ዝጋ', 'Close meeting') }}</button>
        </div>
      </div>
      <div class="meeting-stats">
        <span>{{ t('መገኘት', 'Attendance') }}: {{ detail.attendance.length }}</span>
        <span>{{ t('ውክልና', 'Proxies') }}: {{ detail.proxies.length }}</span>
        <span>{{ t('ቅጣት እጩዎች', 'Penalty candidates') }}: {{ detail.penalties.length }}</span>
      </div>

      <div class="meeting-grid meeting-grid--three">
        <section><h3>{{ t('መድረስ መመዝገብ', 'Record arrival') }}</h3>
          <form class="meeting-form" @submit.prevent="recordArrival">
            <label>{{ t('Membership ID', 'Membership ID') }}<input v-model="arrivalForm.membership_id" type="number" min="1" required /></label>
            <label>{{ t('Proxy ID (ካለ)', 'Proxy ID (optional)') }}<input v-model="arrivalForm.proxy_id" type="number" min="1" /></label>
            <button :disabled="saving || selectedMeeting.status !== 'open'">{{ t('መገኘት መዝግብ', 'Record attendance') }}</button>
          </form>
        </section>
        <section><h3>{{ t('ውክልና ማስገባት', 'Submit proxy') }}</h3>
          <form class="meeting-form" @submit.prevent="submitProxy">
            <label>{{ t('የሚወከለው Membership ID', 'Principal membership ID') }}<input v-model="proxyForm.principal_membership_id" type="number" min="1" required /></label>
            <label v-if="selectedMeeting.meeting_kind === 'board'">{{ t('የተወካይ Director Membership ID', 'Representative director membership ID') }}<input v-model="proxyForm.representative_membership_id" type="number" min="1" required /></label>
            <label>{{ t('የተወካይ ስም', 'Representative name') }}<input v-model="proxyForm.representative_name" required /></label>
            <label>{{ t('የማስረጃ ቁጥር', 'Instrument reference') }}<input v-model="proxyForm.instrument_reference" required /></label>
            <label>{{ t('የተሾመበት ቀን/ሰዓት', 'Appointment date/time') }}<input v-model="proxyForm.appointed_at" type="datetime-local" required /></label>
            <button :disabled="saving || selectedMeeting.status !== 'scheduled'">{{ t('ውክልና አስገባ', 'Submit proxy') }}</button>
          </form>
        </section>
        <section><h3>{{ t('የመቅረት ፈቃድ', 'Absence authorization') }}</h3>
          <form class="meeting-form" @submit.prevent="authorizeAbsence">
            <label>{{ t('Membership ID', 'Membership ID') }}<input v-model="excuseForm.membership_id" type="number" min="1" required /></label>
            <label>{{ t('የፈቃድ ማጣቀሻ', 'Authorization reference') }}<input v-model="excuseForm.authorization_reference" required /></label>
            <label>{{ t('ምክንያት', 'Reason') }}<input v-model="excuseForm.reason" required /></label>
            <button :disabled="saving">{{ t('ፈቃድ መዝግብ', 'Record authorization') }}</button>
          </form>
        </section>
      </div>

      <section class="meeting-section"><h3>{{ t('ውክልናዎች', 'Proxies') }}</h3>
        <div v-for="proxy in detail.proxies" :key="proxy.id" class="record-row">
          <span>#{{ proxy.id }} · {{ proxy.representative_name }} · {{ proxy.status }} · {{ proxy.instrument_reference }}</span>
          <span v-if="proxy.status === 'submitted'" class="inline-actions"><button @click="reviewProxy(proxy.id, 'accept')">{{ t('ተቀበል', 'Accept') }}</button><button class="button-muted" @click="reviewProxy(proxy.id, 'reject')">{{ t('ከልክል', 'Reject') }}</button></span>
        </div>
        <p v-if="!detail.proxies.length">{{ t('ውክልና አልተመዘገበም።', 'No proxies submitted.') }}</p>
      </section>

      <section class="meeting-section"><h3>{{ t('የመገኘት መዝገብ', 'Attendance register') }}</h3>
        <div v-for="entry in detail.attendance" :key="entry.id" class="record-row"><span>Membership #{{ entry.membership_id }}</span><span>{{ entry.status }}</span><span>{{ entry.arrived_at || '—' }}</span></div>
      </section>

      <section class="meeting-section"><h3>{{ t('ቅጣቶችና ክፍያ', 'Penalties and payments') }}</h3>
        <div v-for="penalty in detail.penalties" :key="penalty.id" class="record-row penalty-row">
          <span>#{{ penalty.id }} · Membership #{{ penalty.membership_id }} · {{ penalty.penalty_type }} · {{ penalty.amount }} ETB · {{ penalty.status }}</span>
          <span v-if="penalty.status === 'pending_review'" class="inline-actions"><button @click="reviewPenalty(penalty.id, 'assess')">{{ t('አጽድቅ', 'Assess') }}</button><button class="button-muted" @click="reviewPenalty(penalty.id, 'waive')">{{ t('ሰርዝ', 'Waive') }}</button></span>
        </div>
        <p v-if="!detail.penalties.length">{{ t('ቅጣት አልተመዘገበም።', 'No penalty candidates.') }}</p>
        <div class="meeting-grid meeting-grid--three">
          <form class="meeting-form" @submit.prevent="disputePenalty">
            <h4>{{ t('ቅጣት መቃወም', 'Dispute a penalty') }}</h4>
            <label>{{ t('Penalty ID', 'Penalty ID') }}<input v-model="disputeForm.penalty_id" type="number" min="1" required /></label>
            <label>{{ t('የተቃውሞ ምክንያት', 'Dispute reason') }}<input v-model="disputeForm.reason" required /></label>
            <button :disabled="saving">{{ t('ተቃውሞ አስገባ', 'Submit dispute') }}</button>
          </form>
          <form class="meeting-form" @submit.prevent="recordPayment">
            <h4>{{ t('በዚያው ቀን ክፍያ', 'Same-day payment') }}</h4>
            <label>{{ t('Penalty ID', 'Penalty ID') }}<input v-model="paymentForm.penalty_id" type="number" min="1" required /></label>
            <label>{{ t('መጠን (ETB)', 'Amount (ETB)') }}<input v-model="paymentForm.amount" type="number" min="0.01" step="0.01" required /></label>
            <label>{{ t('የክፍያ ዘዴ', 'Payment method') }}<select v-model="paymentForm.payment_method"><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="mobile_money">Mobile money</option><option value="other">Other</option></select></label>
            <label>{{ t('ደረሰኝ ቁጥር', 'Receipt reference') }}<input v-model="paymentForm.receipt_reference" required /></label>
            <button :disabled="saving">{{ t('ክፍያ መዝግብ', 'Record payment') }}</button>
          </form>
          <form class="meeting-form" @submit.prevent="requestOffset">
            <h4>{{ t('የዲቪደንድ ማካካሻ ጥያቄ', 'Dividend settlement request') }}</h4>
            <label>{{ t('Penalty ID', 'Penalty ID') }}<input v-model="offsetForm.penalty_id" type="number" min="1" required /></label>
            <label>{{ t('Shareholder ID', 'Shareholder ID') }}<input v-model="offsetForm.shareholder_id" type="number" min="1" required /></label>
            <label>{{ t('Dividend reference', 'Dividend reference') }}<input v-model="offsetForm.dividend_reference" required /></label>
            <label>{{ t('Requested amount (ETB)', 'Requested amount (ETB)') }}<input v-model="offsetForm.requested_amount" type="number" min="0.01" step="0.01" required /></label>
            <p class="form-note">{{ t('ይህ ጥያቄ ብቻ ነው፤ ራስ-ሰር ቅናሽ አይፈጽምም።', 'Request only: no automatic dividend deduction is made.') }}</p>
            <button :disabled="saving">{{ t('ለFinance/Legal ላክ', 'Submit for Finance/Legal review') }}</button>
          </form>
        </div>
      </section>
    </Card>
  </main>
</template>

<style scoped>
.meeting-attendance { display: grid; gap: var(--mases-space-4); }
.meeting-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--mases-space-4); }
.meeting-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.meeting-grid--two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.meeting-card { min-width: 0; padding: var(--mases-space-4); }
.meeting-card h2, .meeting-card h3, .meeting-card h4 { margin: 0 0 var(--mases-space-3); }
.meeting-form { display: grid; gap: var(--mases-space-3); }
.meeting-form label { display: grid; gap: var(--mases-space-1); color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-sm); }
.meeting-form input, .meeting-form select { width: 100%; min-height: 2.6rem; padding: var(--mases-space-2); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface); color: var(--mases-color-text-primary); }
.meeting-form button, .meeting-actions button, .inline-actions button { min-height: 2.5rem; padding: var(--mases-space-2) var(--mases-space-3); border: 0; border-radius: var(--mases-radius-md); background: var(--mases-color-action-primary); color: var(--mases-color-text-on-action); cursor: pointer; }
button:disabled { opacity: .55; cursor: not-allowed; }
.meeting-list { display: grid; gap: var(--mases-space-2); padding: 0; margin: 0; list-style: none; }
.meeting-select { display: grid; gap: var(--mases-space-1); width: 100%; padding: var(--mases-space-3); text-align: start; border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface); color: var(--mases-color-text-primary); }
.meeting-select[aria-pressed="true"] { border-color: var(--mases-color-border-brand); background: var(--mases-color-surface-subtle); }
.meeting-select small, .meeting-detail p, .form-note { color: var(--mases-color-text-secondary); }
.meeting-detail { display: grid; gap: var(--mases-space-4); }
.meeting-detail__heading { display: flex; justify-content: space-between; gap: var(--mases-space-3); align-items: start; }
.meeting-actions, .inline-actions { display: flex; gap: var(--mases-space-2); flex-wrap: wrap; }
.meeting-stats { display: flex; gap: var(--mases-space-4); flex-wrap: wrap; color: var(--mases-color-text-secondary); }
.meeting-section { display: grid; gap: var(--mases-space-2); }
.record-row { display: flex; justify-content: space-between; align-items: center; gap: var(--mases-space-3); padding: var(--mases-space-2) 0; border-bottom: 1px solid var(--mases-color-border-subtle); }
.button-muted { background: var(--mases-color-surface-subtle) !important; color: var(--mases-color-text-primary) !important; }
.notice { padding: var(--mases-space-3); border-radius: var(--mases-radius-md); }
.notice--success { background: var(--mases-color-surface-subtle); color: var(--mases-color-text-primary); }
.notice--error { background: var(--mases-color-surface-subtle); color: var(--mases-color-text-danger); }
@media (max-width: 900px) { .meeting-grid, .meeting-grid--three, .meeting-grid--two { grid-template-columns: 1fr; } .meeting-detail__heading, .record-row { align-items: stretch; flex-direction: column; } }
</style>
