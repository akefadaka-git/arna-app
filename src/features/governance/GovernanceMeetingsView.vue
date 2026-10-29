<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import {
  approveGovernanceMeeting,
  createGovernanceMeeting,
  listGovernanceMeetings,
  type GovernanceMeeting,
} from './meetings';

const appName = import.meta.env.VITE_APP_NAME;
const meetings = ref<readonly GovernanceMeeting[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');
const currentPage = ref(1);
const lastPage = ref(1);
const total = ref(0);
const titleAm = ref('');
const titleEn = ref('');
const bodyId = ref('');
const scheduledAt = ref('');
const location = ref('');
const meetingMode = ref<'in_person' | 'remote' | 'hybrid'>('in_person');

async function load(): Promise<void> {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const result = await listGovernanceMeetings(currentPage.value);
    meetings.value = result.data;
    currentPage.value = result.current_page;
    lastPage.value = Math.max(1, result.last_page);
    total.value = result.total;
  } catch {
    meetings.value = [];
    errorMessage.value = 'የስብሰባ መረጃ መጫን አልተቻለም። ፈቃድዎን እና የግንኙነት ሁኔታውን ያረጋግጡ።';
  } finally {
    isLoading.value = false;
  }
}

async function createMeeting(): Promise<void> {
  errorMessage.value = '';
  const parsedBodyId = Number(bodyId.value);
  if (!Number.isSafeInteger(parsedBodyId) || parsedBodyId < 1) {
    errorMessage.value = 'ትክክለኛ የአስተዳደር አካል መለያ ያስገቡ።';
    return;
  }
  if (!titleAm.value.trim() && !titleEn.value.trim()) {
    errorMessage.value = 'የስብሰባ ርዕስ በአማርኛ ወይም በእንግሊዝኛ ያስገቡ።';
    return;
  }
  isSaving.value = true;
  try {
    await createGovernanceMeeting({
      governance_body_id: parsedBodyId,
      ...(titleAm.value.trim() ? { title_am: titleAm.value.trim() } : {}),
      ...(titleEn.value.trim() ? { title_en: titleEn.value.trim() } : {}),
      ...(scheduledAt.value ? { scheduled_at: new Date(scheduledAt.value).toISOString() } : {}),
      ...(location.value.trim() ? { location: location.value.trim() } : {}),
      meeting_mode: meetingMode.value,
    });
    titleAm.value = '';
    titleEn.value = '';
    scheduledAt.value = '';
    location.value = '';
    currentPage.value = 1;
    await load();
  } catch {
    errorMessage.value = 'ስብሰባውን መመዝገብ አልተቻለም። የመዳረሻ ፈቃድ፣ የአካል መለያ እና የግዴታ መስኮችን ያረጋግጡ።';
  } finally {
    isSaving.value = false;
  }
}

async function approveMeeting(meeting: GovernanceMeeting): Promise<void> {
  errorMessage.value = '';
  try {
    await approveGovernanceMeeting(meeting.id);
    await load();
  } catch {
    errorMessage.value = 'ስብሰባውን ማጽደቅ አልተቻለም። የማጽደቅ ፈቃድ እና የስብሰባውን ሁኔታ ያረጋግጡ።';
  }
}

function changePage(page: number): void {
  if (page < 1 || page > lastPage.value || page === currentPage.value) return;
  currentPage.value = page;
  void load();
}
onMounted(() => void load());
</script>

<template>
  <main class="governance-meetings" data-testid="governance-meetings-view">
    <PageTitle title="የአስተዳደር ስብሰባዎች" :suffix="appName" />
    <PageHeader title="የአስተዳደር ስብሰባዎች" description="የቦርድ፣ የኮሚቴ እና የሌሎች የአስተዳደር አካላት ስብሰባዎችን ያስተዳድሩ።" />

    <section class="governance-meetings__panel" aria-labelledby="meeting-create-title">
      <h2 id="meeting-create-title">አዲስ ስብሰባ መመዝገብ</h2>
      <form class="governance-meetings__form" @submit.prevent="createMeeting">
        <label><span>የአስተዳደር አካል መለያ</span><input v-model="bodyId" inputmode="numeric" required /></label>
        <label><span>ርዕስ (አማርኛ)</span><input v-model="titleAm" maxlength="200" /></label>
        <label><span>Title (English)</span><input v-model="titleEn" maxlength="200" /></label>
        <label><span>የስብሰባ ቀን እና ሰዓት</span><input v-model="scheduledAt" type="datetime-local" /></label>
        <label><span>ቦታ</span><input v-model="location" maxlength="255" /></label>
        <label><span>የስብሰባ ዘዴ</span>
          <select v-model="meetingMode">
            <option value="in_person">በአካል</option>
            <option value="remote">በመስመር ላይ</option>
            <option value="hybrid">የተቀላቀለ</option>
          </select>
        </label>
        <button type="submit" :disabled="isSaving">{{ isSaving ? 'በመመዝገብ ላይ…' : 'ስብሰባ መመዝገብ' }}</button>
      </form>
    </section>

    <p v-if="errorMessage" role="alert" class="governance-meetings__error">{{ errorMessage }}</p>
    <p v-if="isLoading" role="status">በመጫን ላይ…</p>
    <section v-else class="governance-meetings__panel">
      <p>ጠቅላላ ስብሰባዎች: {{ total }}</p>
      <div class="governance-meetings__table-wrap">
        <table>
          <thead><tr><th scope="col">ርዕስ</th><th scope="col">አካል</th><th scope="col">ቀን</th><th scope="col">ሁኔታ</th><th scope="col">ተግባር</th></tr></thead>
          <tbody>
            <tr v-for="meeting in meetings" :key="meeting.id">
              <td>{{ meeting.title_am || meeting.title_en || meeting.display_title || ('Meeting #' + meeting.id) }}</td>
              <td>{{ meeting.body?.name_am || meeting.body?.name_en || meeting.body?.code || meeting.governance_body_id }}</td>
              <td>{{ meeting.scheduled_at ? new Date(meeting.scheduled_at).toLocaleString() : '—' }}</td>
              <td>{{ meeting.status }}</td>
              <td><button v-if="meeting.status === 'draft'" type="button" @click="approveMeeting(meeting)">ለማጽደቅ ላክ</button></td>
            </tr>
            <tr v-if="meetings.length === 0"><td colspan="5">ስብሰባ አልተመዘገበም።</td></tr>
          </tbody>
        </table>
      </div>
      <nav v-if="lastPage > 1" class="governance-meetings__pagination" aria-label="የስብሰባ ገጾች">
        <button type="button" :disabled="currentPage <= 1 || isLoading" @click="changePage(currentPage - 1)">ቀዳሚ</button>
        <span>ገጽ {{ currentPage }} / {{ lastPage }}</span>
        <button type="button" :disabled="currentPage >= lastPage || isLoading" @click="changePage(currentPage + 1)">ቀጣይ</button>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.governance-meetings { display: grid; gap: 1rem; }
.governance-meetings__panel { padding: 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.governance-meetings__form { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .8rem; }
.governance-meetings__form label { display: grid; gap: .35rem; }
.governance-meetings input, .governance-meetings select, .governance-meetings button { min-height: 2.4rem; padding: .4rem .65rem; border: 1px solid var(--color-border, #cbd5e1); border-radius: .35rem; color: inherit; background: var(--color-surface, white); }
.governance-meetings__table-wrap { overflow-x: auto; }
.governance-meetings table { width: 100%; border-collapse: collapse; }
.governance-meetings th, .governance-meetings td { text-align: start; padding: .65rem; border-bottom: 1px solid var(--color-border, #e2e8f0); }
.governance-meetings__pagination { display: flex; justify-content: end; align-items: center; gap: 1rem; padding-top: .8rem; }
.governance-meetings__error { padding: .8rem; border: 1px solid var(--color-danger, #b91c1c); border-radius: .4rem; }
</style>
