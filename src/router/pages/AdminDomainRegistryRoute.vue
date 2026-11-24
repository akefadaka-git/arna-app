<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

type DomainSource = 'application' | 'tenant';
interface DomainInventoryItem {
  readonly id: string;
  readonly fqdn: string;
  readonly source: DomainSource;
  readonly source_id: number;
  readonly source_slug: string;
  readonly display_name: string;
  readonly is_active: boolean;
  readonly frontend_ready: boolean | null;
  readonly registry_state: 'catalogued';
  readonly ownership_state: 'not_verified';
  readonly dns_state: 'not_observed';
  readonly tls_state: 'not_observed';
  readonly hosting_state: 'not_observed';
  readonly last_observed_at: string | null;
}
interface DomainRegistryResponse {
  readonly items: DomainInventoryItem[];
  readonly pagination: { readonly page: number; readonly per_page: number; readonly total: number; readonly last_page: number };
  readonly capabilities: {
    readonly registry_inventory: boolean;
    readonly ownership_verification: boolean;
    readonly dns_provider_connected: boolean;
    readonly tls_provider_connected: boolean;
    readonly hosting_provider_connected: boolean;
    readonly live_mutations_enabled: boolean;
  };
}

const rows = ref<DomainInventoryItem[]>([]);
const search = ref('');
const source = ref<'all' | DomainSource>('all');
const loading = ref(false);
const error = ref('');
const total = ref(0);
const capabilities = ref<DomainRegistryResponse['capabilities'] | null>(null);

const labels = {
  title: 'የዶሜይን አስተዳደር',
  description: 'የARNA መተግበሪያዎችና ቴናንቶች የዶሜይን መዝገብ።',
  inventory: 'የዶሜይን መዝገብ (Domain Registry)',
  search: 'ዶሜይን ወይም ስም ፈልግ',
  all: 'ሁሉም ምንጮች',
  application: 'መተግበሪያ',
  tenant: 'ቴናንት',
  refresh: 'አድስ',
  domain: 'ዶሜይን',
  source: 'ምንጭ',
  owner: 'የመዝገብ ባለቤት',
  active: 'ንቁ',
  inactive: 'የቦዘነ',
  ownership: 'ባለቤትነት',
  dns: 'DNS',
  tls: 'SSL/TLS',
  hosting: 'ሆስቲንግ',
  observed: 'የመጨረሻ ምልከታ',
  notVerified: 'አልተረጋገጠም',
  notObserved: 'አልተመረመረም',
  noRows: 'በመዝገቡ ውስጥ ዶሜይን አልተገኘም።',
  warning: 'ይህ ዝርዝር ከARNA የመተግበሪያና የቴናንት መዝገቦች የተወሰደ ነው። የሬጂስትራር ባለቤትነት፣ DNS፣ SSL/TLS ወይም ሆስቲንግ ሁኔታን አያረጋግጥም።',
  providers: 'የአቅራቢ ግንኙነቶች',
  noProvider: 'አልተገናኘም',
  liveDisabled: 'ቀጥታ የDNS፣ SSL/TLS ወይም ሆስቲንግ ለውጦች በዚህ ደረጃ ተዘግተዋል።',
  loadError: 'የዶሜይን መዝገቡን ማምጣት አልተቻለም። የፈቃድና የAPI ግንኙነት ያረጋግጡ።',
} as const;

function dateLabel(value: string | null): string {
  return value ? formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await api.get<DomainRegistryResponse>('/api/admin/platform/domains', {
      params: {
        search: search.value.trim() || undefined,
        source: source.value === 'all' ? undefined : source.value,
        per_page: 100,
      },
    });
    rows.value = result.items;
    total.value = result.pagination.total;
    capabilities.value = result.capabilities;
  } catch {
    error.value = labels.loadError;
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="domain-registry-page">
    <PageHeader :title="labels.title" :description="labels.description" />

    <Card>
      <div class="registry-toolbar">
        <h2>{{ labels.inventory }}</h2>
        <form class="registry-filters" @submit.prevent="load">
          <label>
            <span>{{ labels.search }}</span>
            <input v-model="search" type="search" autocomplete="off" />
          </label>
          <label>
            <span>{{ labels.source }}</span>
            <select v-model="source">
              <option value="all">{{ labels.all }}</option>
              <option value="application">{{ labels.application }}</option>
              <option value="tenant">{{ labels.tenant }}</option>
            </select>
          </label>
          <button type="submit" :disabled="loading">{{ loading ? '…' : labels.refresh }}</button>
        </form>
      </div>

      <p class="registry-warning">{{ labels.warning }}</p>
      <p v-if="error" role="alert" class="registry-error">{{ error }}</p>
      <p v-else-if="loading" role="status">{{ labels.refresh }}…</p>
      <p v-else-if="rows.length === 0" class="registry-empty">{{ labels.noRows }}</p>

      <div v-else class="registry-table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ labels.domain }}</th>
              <th>{{ labels.source }}</th>
              <th>{{ labels.owner }}</th>
              <th>{{ labels.ownership }}</th>
              <th>{{ labels.dns }}</th>
              <th>{{ labels.tls }}</th>
              <th>{{ labels.hosting }}</th>
              <th>{{ labels.observed }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><strong>{{ row.fqdn }}</strong><small>{{ row.is_active ? labels.active : labels.inactive }}</small></td>
              <td>{{ row.source === 'application' ? labels.application : labels.tenant }}</td>
              <td>{{ row.display_name }}<small>{{ row.source_slug }}</small></td>
              <td>{{ labels.notVerified }}</td>
              <td>{{ labels.notObserved }}</td>
              <td>{{ labels.notObserved }}</td>
              <td>{{ labels.notObserved }}</td>
              <td>{{ dateLabel(row.last_observed_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="registry-total">{{ total }} {{ labels.domain }}</p>
    </Card>

    <Card>
      <h2>{{ labels.providers }}</h2>
      <ul class="provider-status">
        <li>Registrar / DNS: {{ capabilities?.dns_provider_connected ? 'Connected' : labels.noProvider }}</li>
        <li>SSL/TLS: {{ capabilities?.tls_provider_connected ? 'Connected' : labels.noProvider }}</li>
        <li>Hosting / Plesk: {{ capabilities?.hosting_provider_connected ? 'Connected' : labels.noProvider }}</li>
      </ul>
      <p class="registry-warning">{{ labels.liveDisabled }}</p>
    </Card>
  </main>
</template>

<style scoped>
.domain-registry-page { display: grid; gap: 1.25rem; }
.registry-toolbar { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; }
.registry-toolbar h2 { margin: 0; font-size: 1.05rem; }
.registry-filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; }
.registry-filters label { display: grid; gap: .25rem; font-size: .875rem; }
.registry-filters input, .registry-filters select { min-height: 2.5rem; padding: .4rem .6rem; border: 1px solid var(--color-border, #aaa); border-radius: .375rem; background: var(--color-surface, white); color: inherit; }
.registry-filters button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.registry-filters button:disabled { cursor: wait; opacity: .6; }
.registry-warning { padding: .75rem; border-inline-start: 3px solid var(--color-warning, #b7791f); background: var(--color-surface-subtle, #f7f4ec); border-radius: .25rem; }
.registry-error { color: var(--color-danger, #b42318); }
.registry-empty { padding: 1.5rem 0; text-align: center; }
.registry-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; white-space: nowrap; }
th { font-size: .8rem; font-weight: 600; }
td small { display: block; margin-top: .2rem; color: var(--color-text-muted, #666); }
.registry-total { color: var(--color-text-muted, #666); font-size: .85rem; }
.provider-status { display: grid; gap: .4rem; padding-inline-start: 1.25rem; }
</style>
