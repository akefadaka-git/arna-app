<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

interface PlatformOverview {
  readonly generated_at: string;
  readonly counts: {
    readonly users: number;
    readonly tenants: number;
    readonly applications: number;
    readonly active_memberships: number;
    readonly roles: number;
    readonly permissions: number;
  };
}

const overview = ref<PlatformOverview | null>(null);
const loading = ref(false);
const error = ref('');

const metrics = [
  { key: 'users', label: 'ተጠቃሚዎች', english: 'Users' },
  { key: 'tenants', label: 'ቴናንቶች', english: 'Tenants' },
  { key: 'applications', label: 'መተግበሪያዎች', english: 'Applications' },
  { key: 'active_memberships', label: 'ንቁ አባልነቶች', english: 'Active memberships' },
  { key: 'roles', label: 'ሚናዎች', english: 'Roles' },
  { key: 'permissions', label: 'ፈቃዶች', english: 'Permissions' },
] as const;

const labels = {
  title: 'የARNA ዋና አስተዳደር ዳሽቦርድ',
  description: 'የመድረኩ አጠቃላይ ሁኔታና የተመዘገቡ ሀብቶች እይታ።',
  refresh: 'አድስ',
  loading: 'የመድረኩን መረጃ በማምጣት ላይ…',
  error: 'የዳሽቦርዱን መረጃ ማምጣት አልተቻለም። የplatform.overview.read ፈቃድና የAPI ግንኙነት ያረጋግጡ።',
  generated: 'መረጃው የተዘመነበት ጊዜ',
  source: 'የቀጥታ የAPI መረጃ፤ የተፈጠሩ ወይም የተገመቱ ቁጥሮች አይደሉም።',
} as const;

function formatDate(value: string): string {
  return formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    overview.value = await api.get<PlatformOverview>('/api/admin/platform/overview');
  } catch {
    error.value = labels.error;
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="admin-overview-page">
    <PageHeader :title="labels.title" :description="labels.description" />
    <div class="overview-toolbar">
      <p>{{ labels.source }}</p>
      <button type="button" :disabled="loading" @click="load">{{ loading ? '…' : labels.refresh }}</button>
    </div>
    <p v-if="loading && !overview" role="status">{{ labels.loading }}</p>
    <p v-if="error" role="alert" class="overview-error">{{ error }}</p>
    <template v-if="overview">
      <section class="overview-grid" aria-label="Platform totals">
        <Card v-for="metric in metrics" :key="metric.key">
          <div class="metric-card">
            <span>{{ metric.label }}</span>
            <strong>{{ overview.counts[metric.key].toLocaleString() }}</strong>
            <small>{{ metric.english }}</small>
          </div>
        </Card>
      </section>
      <p class="overview-updated">{{ labels.generated }}: {{ formatDate(overview.generated_at) }}</p>
    </template>
  </main>
</template>

<style scoped>
.admin-overview-page { display: grid; gap: 1.25rem; }
.overview-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; }
.overview-toolbar p, .overview-updated { margin: 0; color: var(--color-text-muted, #666); font-size: .875rem; }
.overview-toolbar button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.overview-toolbar button:disabled { cursor: wait; opacity: .6; }
.overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); gap: 1rem; }
.metric-card { display: grid; gap: .45rem; }
.metric-card span { font-weight: 600; }
.metric-card strong { font-size: 2rem; font-variant-numeric: tabular-nums; line-height: 1.15; }
.metric-card small { color: var(--color-text-muted, #666); }
.overview-error { color: var(--color-danger, #b42318); }
</style>
