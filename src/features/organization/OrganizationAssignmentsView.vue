<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import {
  createOrganizationAssignment,
  listOrganizationAssignments,
  updateOrganizationAssignment,
  type OrganizationAssignment,
} from './api';

const route = useRoute();
const language = typeof navigator === 'undefined' ? 'am' : navigator.language.toLowerCase();
const am = language.startsWith('am');
const labels = computed(() => am ? {
  title: 'የሥራ ምደባዎች', description: 'በድርጅት ክፍሉ የተመዘገቡ የሥራ ምደባዎችን ይመልከቱና ያስተዳድሩ።',
  person: 'የሰው መለያ', type: 'የምደባ ዓይነት', titleAm: 'የሥራ ርዕስ (አማርኛ)', titleEn: 'የሥራ ርዕስ (English)',
  start: 'የመጀመሪያ ቀን', end: 'የመጨረሻ ቀን', reason: 'ምክንያት', create: 'ምደባ መመዝገብ',
  loading: 'በመጫን ላይ…', retry: 'እንደገና ሞክር', empty: 'ምደባ አልተገኘም', saveError: 'ምደባውን ማስቀመጥ አልተቻለም።',
  status: 'ሁኔታ', actions: 'እርምጃ', close: 'ማቋረጥ', cancel: 'ሰርዝ', previous: 'ቀዳሚ', next: 'ቀጣይ', page: 'ገጽ'
} : {
  title: 'Organization assignments', description: 'Review and manage assignments for this organization unit.',
  person: 'Person ID', type: 'Assignment type', titleAm: 'Title (Amharic)', titleEn: 'Title (English)',
  start: 'Start date', end: 'End date', reason: 'Reason', create: 'Create assignment',
  loading: 'Loading…', retry: 'Retry', empty: 'No assignments found', saveError: 'Unable to save the assignment.',
  status: 'Status', actions: 'Actions', close: 'End assignment', cancel: 'Cancel assignment', previous: 'Previous', next: 'Next', page: 'Page'
});
const unitId = computed(() => {
  const id = Number(route.params.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
});
const items = ref<readonly OrganizationAssignment[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref('');
const page = ref(1);
const lastPage = ref(1);
const personId = ref('');
const assignmentType = ref('primary');
const titleAm = ref('');
const titleEn = ref('');
const startsOn = ref(new Date().toISOString().slice(0, 10));
const endsOn = ref('');
const reason = ref('');
const statusFilter = ref<'' | OrganizationAssignment['status']>('');
const effectiveOn = ref('');
const personFilter = ref('');

async function load(): Promise<void> {
  if (unitId.value === null) { error.value = 'Invalid unit ID'; isLoading.value = false; return; }
  isLoading.value = true; error.value = '';
  try {
    const parsedPerson = Number(personFilter.value);
    const result = await listOrganizationAssignments(unitId.value, {
      page: page.value, per_page: 25,
      ...(statusFilter.value ? { status: statusFilter.value } : {}),
      ...(effectiveOn.value ? { effective_on: effectiveOn.value } : {}),
      ...(personFilter.value && Number.isSafeInteger(parsedPerson) && parsedPerson > 0 ? { person_id: parsedPerson } : {}),
    });
    items.value = result.data; page.value = result.current_page; lastPage.value = Math.max(1, result.last_page);
  } catch {
    error.value = labels.value.saveError;
  } finally { isLoading.value = false; }
}
async function create(): Promise<void> {
  if (unitId.value === null) return;
  const parsedPerson = Number(personId.value);
  if (!Number.isSafeInteger(parsedPerson) || parsedPerson < 1 || reason.value.trim().length < 5) {
    error.value = labels.value.saveError; return;
  }
  isSaving.value = true; error.value = '';
  try {
    await createOrganizationAssignment(unitId.value, {
      person_id: parsedPerson, assignment_type: assignmentType.value,
      ...(titleAm.value.trim() ? { title_am: titleAm.value.trim() } : {}),
      ...(titleEn.value.trim() ? { title_en: titleEn.value.trim() } : {}),
      starts_on: startsOn.value, ...(endsOn.value ? { ends_on: endsOn.value } : {}),
      reason: reason.value.trim(),
    });
    personId.value = ''; titleAm.value = ''; titleEn.value = ''; endsOn.value = ''; reason.value = '';
    page.value = 1; await load();
  } catch { error.value = labels.value.saveError; }
  finally { isSaving.value = false; }
}
async function transition(item: OrganizationAssignment, status: 'ended' | 'cancelled'): Promise<void> {
  error.value = '';
  try {
    await updateOrganizationAssignment(item.id, { status, ...(status === 'ended' ? { ends_on: new Date().toISOString().slice(0, 10) } : {}), reason: status === 'ended' ? 'Ended from Organization workspace' : 'Cancelled from Organization workspace' });
    await load();
  } catch { error.value = labels.value.saveError; }
}
function applyFilters(): void { page.value = 1; void load(); }
function changePage(next: number): void {
  if (next < 1 || next > lastPage.value || next === page.value) return;
  page.value = next; void load();
}
onMounted(() => void load());
watch(unitId, () => { page.value = 1; void load(); });
</script>

<template>
  <main class="organization-assignments">
    <PageTitle :title="labels.title" :suffix="import.meta.env.VITE_APP_NAME" />
    <PageHeader :title="labels.title" :description="labels.description" />
    <form class="organization-assignments__form" @submit.prevent="create">
      <label>{{ labels.person }}<input v-model="personId" inputmode="numeric" required /></label>
      <label>{{ labels.type }}<select v-model="assignmentType"><option value="primary">primary</option><option value="acting">acting</option><option value="delegated">delegated</option><option value="support">support</option></select></label>
      <label>{{ labels.titleAm }}<input v-model="titleAm" maxlength="160" /></label>
      <label>{{ labels.titleEn }}<input v-model="titleEn" maxlength="160" /></label>
      <label>{{ labels.start }}<input v-model="startsOn" type="date" required /></label>
      <label>{{ labels.end }}<input v-model="endsOn" type="date" /></label>
      <label class="organization-assignments__wide">{{ labels.reason }}<textarea v-model="reason" minlength="5" maxlength="2000" required /></label>
      <button type="submit" :disabled="isSaving">{{ isSaving ? labels.loading : labels.create }}</button>
    </form>
    <form class="organization-assignments__filters" @submit.prevent="applyFilters">
      <label>{{ labels.status }}<select v-model="statusFilter"><option value="">{{ am ? 'ሁሉም ሁኔታዎች' : 'All statuses' }}</option><option value="scheduled">scheduled</option><option value="active">active</option><option value="ended">ended</option><option value="cancelled">cancelled</option></select></label>
      <label>{{ am ? 'በተፈጻሚነት ቀን' : 'Effective on' }}<input v-model="effectiveOn" type="date" /></label>
      <label>{{ am ? 'የሰው መለያ' : 'Person ID' }}<input v-model="personFilter" inputmode="numeric" /></label>
      <button type="submit">{{ am ? 'ማጣሪያ ተግብር' : 'Apply filters' }}</button>
    </form>
    <p v-if="error" role="alert">{{ error }} <button type="button" @click="load">{{ labels.retry }}</button></p>
    <p v-if="isLoading" role="status">{{ labels.loading }}</p>
    <p v-else-if="!items.length">{{ labels.empty }}</p>
    <div v-else class="organization-assignments__table-wrap">
      <table>
        <thead><tr><th>{{ labels.person }}</th><th>{{ labels.type }}</th><th>{{ labels.start }}</th><th>{{ labels.end }}</th><th>{{ labels.status }}</th><th>{{ labels.actions }}</th></tr></thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ [item.person?.first_name_am, item.person?.father_name_am, item.person?.grandfather_name_am].filter(Boolean).join(' ') || [item.person?.first_name_en, item.person?.father_name_en, item.person?.grandfather_name_en].filter(Boolean).join(' ') || item.person_id }}</td>
            <td>{{ item.assignment_type }}</td><td>{{ item.starts_on }}</td><td>{{ item.ends_on || '—' }}</td><td>{{ item.status }}</td>
            <td><button v-if="item.status === 'active'" type="button" @click="transition(item, 'ended')">{{ labels.close }}</button><button v-if="['scheduled','active'].includes(item.status)" type="button" @click="transition(item, 'cancelled')">{{ labels.cancel }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <nav v-if="lastPage > 1" aria-label="Assignment pagination" class="organization-assignments__pagination">
      <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">{{ labels.previous }}</button>
      <span>{{ labels.page }} {{ page }} / {{ lastPage }}</span>
      <button type="button" :disabled="page >= lastPage" @click="changePage(page + 1)">{{ labels.next }}</button>
    </nav>
    <RouterLink :to="{ name: 'organization-unit-detail', params: { id: unitId } }">{{ am ? 'ወደ ድርጅት ክፍሉ ተመለስ' : 'Back to organization unit' }}</RouterLink>
  </main>
</template>

<style scoped>
.organization-assignments { display: grid; gap: 1rem; }
.organization-assignments__filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; }\n.organization-assignments__filters label { display: grid; gap: .35rem; }\n.organization-assignments__form { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .8rem; padding: 1rem; border: 1px solid var(--border-color, #d8dee8); border-radius: .5rem; }
.organization-assignments__form label { display: grid; gap: .35rem; }
.organization-assignments__form input, .organization-assignments__form select, .organization-assignments__form textarea { width: 100%; min-width: 0; }
.organization-assignments__wide { grid-column: 1 / -1; }
.organization-assignments__table-wrap { overflow-x: auto; }
.organization-assignments table { width: 100%; border-collapse: collapse; }
.organization-assignments th, .organization-assignments td { padding: .65rem; border-bottom: 1px solid var(--border-color, #d8dee8); text-align: start; }
.organization-assignments__pagination { display: flex; align-items: center; gap: 1rem; }
</style>
