<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

interface PlatformApplication {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly domain: string | null;
  readonly category: string | null;
  readonly is_active: boolean;
  readonly frontend_ready: boolean;
  readonly display_order: number;
}
interface Page<T> {
  readonly data: T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

const rows = ref<PlatformApplication[]>([]);
const search = ref('');
const status = ref<'all' | 'active' | 'inactive'>('all');
const loading = ref(false);
const error = ref('');
const total = ref(0);

const labels = {
  title: 'የመድረክ አስተዳደር',
  description: 'በARNA ውስጥ የተመዘገቡ መተግበሪያዎችና የፊት-ገጽ ዝግጁነት።',
  registry: 'የመተግበሪያ መዝገብ',
  search: 'በስም፣ slug ወይም domain ፈልግ',
  all: 'ሁሉም',
  active: 'ንቁ',
  inactive: 'የቦዘነ',
  status: 'ሁኔታ',
  name: 'መተግበሪያ',
  domain: 'ዶሜይን',
  category: 'ምድብ',
  enabled: 'ንቁ',
  disabled: 'የቦዘነ',
  ready: 'የፊት-ገጽ ዝግጁ',
  notReady: 'የፊት-ገጽ ዝግጁ አይደለም',
  refresh: 'አድስ',
  empty: 'የመተግበሪያ መዝገብ ባዶ ነው።',
  loadError: 'የመተግበሪያ መዝገቡን ማምጣት አልተቻለም። የplatform.applications.read ፈቃድ ያረጋግጡ።',
  note: 'ይህ ገጽ የመድረኩን የመተግበሪያ መዝገብ ብቻ ያሳያል፤ የአገልጋይ ጤናን ወይም የውጭ የhosting ሁኔታን አያረጋግጥም።',
} as const;

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await api.get<Page<PlatformApplication>>('/api/admin/platform/applications', {
      params: { search: search.value.trim() || undefined, status: status.value, per_page: 100 },
    });
    rows.value = result.data;
    total.value = result.total;
  } catch {
    error.value = labels.loadError;
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="platform-applications-page">
    <PageHeader :title="labels.title" :description="labels.description" />
    <Card>
      <div class="registry-heading">
        <h2>{{ labels.registry }}</h2>
        <form class="registry-filters" @submit.prevent="load">
          <label>
            <span>{{ labels.search }}</span>
            <input v-model="search" type="search" autocomplete="off" />
          </label>
          <label>
            <span>{{ labels.status }}</span>
            <select v-model="status">
              <option value="all">{{ labels.all }}</option>
              <option value="active">{{ labels.active }}</option>
              <option value="inactive">{{ labels.inactive }}</option>
            </select>
          </label>
          <button type="submit" :disabled="loading">{{ loading ? '…' : labels.refresh }}</button>
        </form>
      </div>
      <p class="registry-note">{{ labels.note }}</p>
      <p v-if="error" role="alert" class="registry-error">{{ error }}</p>
      <p v-else-if="loading" role="status">{{ labels.refresh }}…</p>
      <p v-else-if="rows.length === 0" class="registry-empty">{{ labels.empty }}</p>
      <div v-else class="registry-table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ labels.name }}</th>
              <th>{{ labels.domain }}</th>
              <th>{{ labels.category }}</th>
              <th>{{ labels.status }}</th>
              <th>{{ labels.ready }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="application in rows" :key="application.id">
              <td><strong>{{ application.name }}</strong><small>{{ application.slug }}</small></td>
              <td>{{ application.domain ?? '—' }}</td>
              <td>{{ application.category ?? '—' }}</td>
              <td>{{ application.is_active ? labels.enabled : labels.disabled }}</td>
              <td>{{ application.frontend_ready ? labels.ready : labels.notReady }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="registry-total">{{ total }} {{ labels.name }}</p>
    </Card>
  </main>
</template>

<style scoped>
.platform-applications-page { display: grid; gap: 1.25rem; }
.registry-heading { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; }
.registry-heading h2 { margin: 0; font-size: 1.05rem; }
.registry-filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; }
.registry-filters label { display: grid; gap: .25rem; font-size: .875rem; }
.registry-filters input, .registry-filters select { min-height: 2.5rem; padding: .4rem .6rem; border: 1px solid var(--color-border, #aaa); border-radius: .375rem; background: var(--color-surface, white); color: inherit; }
.registry-filters button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.registry-filters button:disabled { cursor: wait; opacity: .6; }
.registry-note { padding: .75rem; border-inline-start: 3px solid var(--color-border, #888); background: var(--color-surface-subtle, #f6f6f6); border-radius: .25rem; }
.registry-error { color: var(--color-danger, #b42318); }
.registry-empty { padding: 1.5rem 0; text-align: center; }
.registry-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; white-space: nowrap; }
th { font-size: .8rem; font-weight: 600; }
td small { display: block; margin-top: .2rem; color: var(--color-text-muted, #666); }
.registry-total { color: var(--color-text-muted, #666); font-size: .85rem; }
</style>
