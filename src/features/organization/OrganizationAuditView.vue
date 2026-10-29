<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import { listOrganizationAuditEvents, type OrganizationAuditEvent } from './api';

const am = typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('am');
const title = am ? 'የድርጅት የኦዲት ታሪክ' : 'Organization audit history';
const description = am ? 'የድርጅት ምደባና መዋቅር ለውጦችን ይመልከቱ።' : 'Review append-only organization lifecycle events.';
const events = ref<readonly OrganizationAuditEvent[]>([]);
const isLoading = ref(true);
const error = ref('');
const subjectType = ref('');
const subjectId = ref('');
const action = ref('');
const page = ref(1);
const lastPage = ref(1);
async function load(): Promise<void> {
  isLoading.value = true; error.value = '';
  try {
    const result = await listOrganizationAuditEvents({
      page: page.value, per_page: 50,
      ...(subjectType.value.trim() ? { subject_type: subjectType.value.trim() } : {}),
      ...(subjectId.value && Number.isSafeInteger(Number(subjectId.value)) ? { subject_id: Number(subjectId.value) } : {}),
      ...(action.value.trim() ? { action: action.value.trim() } : {}),
    });
    events.value = result.data; page.value = result.current_page; lastPage.value = Math.max(1, result.last_page);
  } catch { error.value = am ? 'የኦዲት ታሪክን መጫን አልተቻለም።' : 'Unable to load audit history. Check your audit permission.'; }
  finally { isLoading.value = false; }
}
function applyFilters(): void { page.value = 1; void load(); }
onMounted(() => void load());
</script>

<template>
  <main class="organization-audit">
    <PageTitle :title="title" :suffix="import.meta.env.VITE_APP_NAME" />
    <PageHeader :title="title" :description="description" />
    <form class="organization-audit__filters" @submit.prevent="applyFilters">
      <label>{{ am ? 'የመዝገብ ዓይነት' : 'Subject type' }}<input v-model="subjectType" placeholder="unit / assignment" /></label>
      <label>{{ am ? 'የመዝገብ መለያ' : 'Subject ID' }}<input v-model="subjectId" inputmode="numeric" /></label>
      <label>{{ am ? 'እርምጃ' : 'Action' }}<input v-model="action" placeholder="created / updated / archived" /></label>
      <button type="submit">{{ am ? 'ማጣሪያ ተግብር' : 'Apply filters' }}</button>
    </form>
    <p v-if="isLoading" role="status">{{ am ? 'በመጫን ላይ…' : 'Loading…' }}</p>
    <p v-else-if="error" role="alert">{{ error }} <button type="button" @click="load">{{ am ? 'እንደገና ሞክር' : 'Retry' }}</button></p>
    <p v-else-if="!events.length">{{ am ? 'የኦዲት መዝገብ አልተገኘም።' : 'No audit events found.' }}</p>
    <div v-else class="organization-audit__table-wrap">
      <table><thead><tr><th>{{ am ? 'ቀን' : 'When' }}</th><th>{{ am ? 'ዓይነት' : 'Subject' }}</th><th>{{ am ? 'መለያ' : 'ID' }}</th><th>{{ am ? 'እርምጃ' : 'Action' }}</th><th>{{ am ? 'ምክንያት' : 'Reason' }}</th><th>{{ am ? 'ተጠቃሚ' : 'Actor' }}</th></tr></thead>
      <tbody><tr v-for="event in events" :key="event.id"><td>{{ event.created_at }}</td><td>{{ event.subject_type }}</td><td>{{ event.subject_id }}</td><td>{{ event.action }}</td><td>{{ event.reason || '—' }}</td><td>{{ event.actor_user_id ?? '—' }}</td></tr></tbody></table>
    </div>
    <nav v-if="lastPage > 1" class="organization-audit__pagination">
      <button type="button" :disabled="page <= 1" @click="page -= 1; load()">{{ am ? 'ቀዳሚ' : 'Previous' }}</button><span>{{ page }} / {{ lastPage }}</span>
      <button type="button" :disabled="page >= lastPage" @click="page += 1; load()">{{ am ? 'ቀጣይ' : 'Next' }}</button>
    </nav>
  </main>
</template>

<style scoped>
.organization-audit { display: grid; gap: 1rem; }
.organization-audit__filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; }
.organization-audit__filters label { display: grid; gap: .35rem; }
.organization-audit__table-wrap { overflow-x: auto; }
.organization-audit table { width: 100%; border-collapse: collapse; }
.organization-audit th, .organization-audit td { padding: .65rem; border-bottom: 1px solid var(--border-color, #d8dee8); text-align: start; }
.organization-audit__pagination { display: flex; gap: 1rem; align-items: center; }
</style>
