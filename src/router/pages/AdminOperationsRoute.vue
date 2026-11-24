<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

interface HealthComponent {
  readonly key: string;
  readonly type: string;
  readonly name: string;
  readonly status: 'healthy' | 'unhealthy' | 'degraded' | 'not_observed' | string;
  readonly summary: string;
  readonly checked_at?: string | null;
  readonly duration_ms?: number | null;
  readonly source?: string;
}
interface HealthResponse {
  readonly items: readonly HealthComponent[];
  readonly generated_at: string;
  readonly capabilities: {
    readonly active_provider_probes: boolean;
    readonly automatic_remediation_enabled: boolean;
  };
}
const rows = ref<readonly HealthComponent[]>([]);
const generatedAt = ref('');
const loading = ref(false);
const error = ref('');
const capabilities = ref<HealthResponse['capabilities'] | null>(null);
function dateLabel(value?: string | null): string {
  return value ? formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}
async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await api.get<HealthResponse>('/api/admin/platform/operations/health');
    rows.value = result.items;
    generatedAt.value = result.generated_at;
    capabilities.value = result.capabilities;
  } catch {
    error.value = 'የኦፕሬሽን ጤና ሁኔታን ማምጣት አልተቻለም። የፈቃድና የAPI ግንኙነት ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}
onMounted(() => { void load(); });
</script>

<template>
  <main class="operations-page">
    <PageHeader title="የኦፕሬሽን ጤና" description="የARNA መድረክ አገልግሎቶች፣ የመረጃ ማከማቻና የአቅራቢ ሁኔታ።" />
    <Card>
      <div class="toolbar">
        <h2>Platform Health</h2>
        <button type="button" :disabled="loading" @click="load">{{ loading ? '…' : 'አድስ' }}</button>
      </div>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <p v-else-if="loading" role="status">ጤና በመፈተሽ ላይ…</p>
      <div v-else class="health-grid">
        <article v-for="item in rows" :key="item.key" class="health-item">
          <div class="health-heading"><strong>{{ item.name }}</strong><span :class="['status', item.status]">{{ item.status }}</span></div>
          <p>{{ item.summary }}</p>
          <small>Last observation: {{ dateLabel(item.checked_at) }} <span v-if="item.duration_ms !== null && item.duration_ms !== undefined">· {{ item.duration_ms }} ms</span></small>
        </article>
      </div>
      <p class="notice">Unknown or not-observed components are not treated as healthy. Provider probes and automatic remediation are disabled.</p>
      <p class="generated">Generated: {{ dateLabel(generatedAt) }}</p>
      <ul class="capabilities">
        <li>Active provider probes: {{ capabilities?.active_provider_probes ? 'Yes' : 'No' }}</li>
        <li>Automatic remediation: {{ capabilities?.automatic_remediation_enabled ? 'Enabled' : 'Disabled' }}</li>
      </ul>
    </Card>
  </main>
</template>

<style scoped>
.operations-page { display: grid; gap: 1.25rem; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; }
.toolbar h2 { margin: 0; font-size: 1.05rem; }
button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
button:disabled { opacity: .6; cursor: wait; }
.health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: .75rem; }
.health-item { min-width: 0; padding: .9rem; border: 1px solid var(--color-border, #ddd); border-radius: .5rem; }
.health-heading { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.health-item p { margin: .65rem 0; }
.health-item small, .generated { color: var(--color-text-muted, #666); }
.status { font-size: .75rem; border-radius: 999px; padding: .2rem .55rem; background: var(--color-surface-subtle, #eee); }
.status.healthy { color: var(--color-success, #18794e); }
.status.unhealthy { color: var(--color-danger, #b42318); }
.notice { padding: .75rem; border-inline-start: 3px solid var(--color-warning, #b7791f); background: var(--color-surface-subtle, #f7f4ec); }
.capabilities { display: grid; gap: .35rem; }
.error { color: var(--color-danger, #b42318); }
</style>
