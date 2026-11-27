<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

interface Integration {
  readonly provider_key: string;
  readonly provider_type: string;
  readonly display_name: string;
  readonly category: string;
  readonly registered: boolean;
  readonly endpoint_url: string | null;
  readonly auth_mode: string;
  readonly credentials_configured: boolean;
  readonly connection_state: string;
  readonly last_observed_at: string | null;
  readonly live_mutations_enabled: boolean;
}
interface IntegrationResponse {
  readonly items: readonly Integration[];
  readonly capabilities: {
    readonly provider_registry: boolean;
    readonly credential_values_exposed: boolean;
    readonly provider_health_probes_enabled: boolean;
    readonly provider_mutations_enabled: boolean;
  };
}
const rows = ref<readonly Integration[]>([]);
const loading = ref(false);
const error = ref('');
const capabilities = ref<IntegrationResponse['capabilities'] | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await api.get<IntegrationResponse>('/api/admin/platform/integrations');
    rows.value = result.items;
    capabilities.value = result.capabilities;
  } catch {
    error.value = 'የአቅራቢ መዝገቡን ማምጣት አልተቻለም። የፈቃድና የAPI ግንኙነት ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}
onMounted(() => { void load(); });
</script>

<template>
  <main class="integrations-page">
    <PageHeader title="የአቅራቢ ግንኙነቶች" description="የDNS፣ Registrar፣ SSL/TLS፣ Hosting እና የኦፕሬሽን አቅራቢዎች መዝገብ።" />
    <Card>
      <div class="toolbar">
        <h2>Integration / Provider Registry</h2>
        <button type="button" :disabled="loading" @click="load">{{ loading ? '…' : 'አድስ' }}</button>
      </div>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <p v-else-if="loading" role="status">መረጃ በመጫን ላይ…</p>
      <p v-else-if="rows.length === 0">የአቅራቢ መዝገብ አልተገኘም።</p>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>አቅራቢ</th><th>ምድብ</th><th>ግንኙነት</th><th>Credentials</th><th>Endpoint</th></tr></thead>
          <tbody>
            <tr v-for="item in rows" :key="item.provider_key">
              <td><strong>{{ item.display_name }}</strong><small>{{ item.provider_key }}</small></td>
              <td>{{ item.category }}</td>
              <td>{{ item.connection_state }}</td>
              <td>{{ item.credentials_configured ? 'Configured' : 'Not configured' }}</td>
              <td>{{ item.endpoint_url || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="notice">Credential values are never returned. Provider health probes and live mutations remain disabled until provider adapters and approval gates are completed.</p>
      <ul class="capabilities">
        <li>Credential values exposed: {{ capabilities?.credential_values_exposed ? 'Yes' : 'No' }}</li>
        <li>Health probes enabled: {{ capabilities?.provider_health_probes_enabled ? 'Yes' : 'No' }}</li>
        <li>Provider mutations enabled: {{ capabilities?.provider_mutations_enabled ? 'Yes' : 'No' }}</li>
      </ul>
    </Card>
  </main>
</template>

<style scoped>
.integrations-page { display: grid; gap: 1.25rem; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; }
.toolbar h2 { margin: 0; font-size: 1.05rem; }
button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
button:disabled { opacity: .6; cursor: wait; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; }
th { font-size: .8rem; }
td small { display: block; color: var(--color-text-muted, #666); }
.notice { padding: .75rem; border-inline-start: 3px solid var(--color-warning, #b7791f); background: var(--color-surface-subtle, #f7f4ec); }
.capabilities { display: grid; gap: .35rem; }
.error { color: var(--color-danger, #b42318); }
</style>
