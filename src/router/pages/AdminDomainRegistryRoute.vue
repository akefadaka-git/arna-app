<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { api } from '@/core/api/client';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

type DomainSource = 'application' | 'tenant' | 'registry';
interface DomainInventoryItem {
  readonly id: string;
  readonly registry_id?: number;
  readonly fqdn: string;
  readonly source: DomainSource;
  readonly source_id?: number;
  readonly source_slug?: string;
  readonly owner_type?: 'platform' | 'application' | 'tenant';
  readonly owner_id?: number | null;
  readonly display_name: string | null;
  readonly environment?: string;
  readonly is_active: boolean;
  readonly frontend_ready?: boolean | null;
  readonly registry_state: string;
  readonly ownership_state: 'verified' | 'not_verified';
  readonly dns_state: string;
  readonly tls_state: string;
  readonly hosting_state: string;
  readonly last_observed_at: string | null;
}
interface DomainRegistryResponse {
  readonly items: DomainInventoryItem[];
  readonly pagination: { readonly page: number; readonly per_page: number; readonly total: number; readonly last_page: number };
  readonly capabilities: {
    readonly persistent_registry: boolean;
    readonly ownership_verification: boolean;
    readonly dns_provider_connected: boolean;
    readonly tls_provider_connected: boolean;
    readonly hosting_provider_connected: boolean;
    readonly live_provider_mutations_enabled: boolean;
  };
}
interface RegistrationResponse {
  readonly id: number;
  readonly fqdn: string;
  readonly lifecycle_status: string;
  readonly verification: { readonly method: string; readonly record_name: string; readonly record_value: string; readonly expires_at: string };
}
interface AuditEvent {
  readonly id: number;
  readonly action: string;
  readonly actor_id: number | null;
  readonly reason: string | null;
  readonly before_state: string | null;
  readonly after_state: string | null;
  readonly created_at: string;
}
const auth = useAuthStore();
const rows = ref<DomainInventoryItem[]>([]);
const search = ref('');
const source = ref<'all' | DomainSource>('all');
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const message = ref('');
const total = ref(0);
const capabilities = ref<DomainRegistryResponse['capabilities'] | null>(null);
const fqdn = ref('');
const ownerType = ref<'platform' | 'application' | 'tenant'>('platform');
const ownerId = ref('');
const displayName = ref('');
const environment = ref('production');
const reason = ref('');
const registration = ref<RegistrationResponse | null>(null);
const verificationId = ref('');
const verificationValue = ref('');
const editId = ref<number | null>(null);
const editName = ref('');
const editEnvironment = ref('production');
const editReason = ref('');
const auditRows = ref<readonly AuditEvent[]>([]);
const auditDomainId = ref<number | null>(null);

const labels = {
  title: 'የዶሜይን አስተዳደር',
  description: 'የARNA መተግበሪያዎች፣ ቴናንቶችና የመድረክ ዶሜይኖች የተቀናጀ መዝገብ።',
  inventory: 'የዶሜይን መዝገብ (Domain Registry)',
  search: 'ዶሜይን ወይም ስም ፈልግ',
  all: 'ሁሉም ምንጮች',
  application: 'መተግበሪያ',
  tenant: 'ቴናንት',
  registry: 'Persistent Registry',
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
  verified: 'ተረጋግጧል',
  notObserved: 'አልተመረመረም',
  noRows: 'በመዝገቡ ውስጥ ዶሜይን አልተገኘም።',
  providers: 'የአቅራቢ ግንኙነቶች',
  noProvider: 'አልተገናኘም',
  warning: 'የownership verification በDNS TXT ፈተና ብቻ ነው። DNS፣ TLS ወይም hosting ሁኔታ ከprovider ጋር እስኪገናኝ ድረስ አይታወቅም።',
  loadError: 'የዶሜይን መዝገቡን ማምጣት አልተቻለም። የፈቃድና የAPI ግንኙነት ያረጋግጡ።',
} as const;

function dateLabel(value: string | null): string {
  return value ? formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}
function sourceLabel(value: DomainSource): string {
  return value === 'application' ? labels.application : value === 'tenant' ? labels.tenant : labels.registry;
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await api.get<DomainRegistryResponse>('/api/admin/platform/domains', {
      params: { search: search.value.trim() || undefined, source: source.value === 'all' ? undefined : source.value, per_page: 100 },
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

async function registerDomain(): Promise<void> {
  if (!fqdn.value.trim() || reason.value.trim().length < 3) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  registration.value = null;
  try {
    registration.value = await api.post<RegistrationResponse>('/api/admin/platform/domains', {
      fqdn: fqdn.value.trim(),
      owner_type: ownerType.value,
      ...(ownerType.value === 'platform' ? {} : { owner_id: Number(ownerId.value) }),
      display_name: displayName.value.trim() || null,
      environment: environment.value,
      reason: reason.value.trim(),
    });
    verificationId.value = String(registration.value.id);
    message.value = 'ዶሜይኑ ተመዝግቧል። የTXT መዝገቡን በDNS ላይ ካስገቡ በኋላ ባለቤትነቱን ያረጋግጡ።';
    fqdn.value = '';
    ownerId.value = '';
    displayName.value = '';
    reason.value = '';
    await load();
  } catch {
    error.value = 'ዶሜይኑ አልተመዘገበም። የfqdn፣ owner reference፣ duplicate record እና permission ያረጋግጡ።';
  } finally {
    busy.value = false;
  }
}

async function verifyDomain(): Promise<void> {
  const id = Number(verificationId.value);
  if (!Number.isInteger(id) || id <= 0 || verificationValue.value.length < 16) return;
  busy.value = true;
  error.value = '';
  try {
    await api.post('/api/admin/platform/domains/' + id + '/verify', { record_value: verificationValue.value.trim() });
    message.value = 'የዶሜይን ባለቤትነት ተረጋግጧል።';
    verificationValue.value = '';
    registration.value = null;
    await load();
  } catch {
    error.value = 'የDNS TXT ፈተናው አልተረጋገጠም። የTXT መዝገብ፣ token እና expiry ያረጋግጡ።';
  } finally {
    busy.value = false;
  }
}

function beginEdit(item: DomainInventoryItem): void {
  if (!item.registry_id) return;
  editId.value = item.registry_id;
  editName.value = item.display_name ?? '';
  editEnvironment.value = item.environment ?? 'production';
  editReason.value = '';
}
async function saveEdit(): Promise<void> {
  if (editId.value === null || editReason.value.trim().length < 3) return;
  busy.value = true;
  error.value = '';
  try {
    await api.patch('/api/admin/platform/domains/' + editId.value, {
      display_name: editName.value.trim() || null,
      environment: editEnvironment.value,
      reason: editReason.value.trim(),
    });
    message.value = 'የዶሜይን መረጃ ተዘምኗል።';
    editId.value = null;
    await load();
  } catch {
    error.value = 'የዶሜይን መረጃ ማዘመን አልተቻለም።';
  } finally {
    busy.value = false;
  }
}
async function showHistory(id: number): Promise<void> {
  auditDomainId.value = id;
  try {
    const result = await api.get<{ data: readonly AuditEvent[] }>('/api/admin/platform/domains/' + id + '/history');
    auditRows.value = result.data;
  } catch {
    error.value = 'የAudit ታሪክ ማምጣት አልተቻለም።';
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="domain-registry-page">
    <PageHeader :title="labels.title" :description="labels.description" />

    <p v-if="error" role="alert" class="registry-error">{{ error }}</p>
    <p v-if="message" role="status" class="registry-message">{{ message }}</p>

    <Card v-if="auth.hasPermission('platform.domains.manage')">
      <h2>Register a domain</h2>
      <form class="domain-form" @submit.prevent="registerDomain">
        <label>FQDN<input v-model="fqdn" required maxlength="253" placeholder="admin.example.com" /></label>
        <label>Owner type<select v-model="ownerType"><option value="platform">Platform</option><option value="application">Application</option><option value="tenant">Tenant</option></select></label>
        <label v-if="ownerType !== 'platform'">Owner ID<input v-model="ownerId" inputmode="numeric" required /></label>
        <label>Display name<input v-model="displayName" maxlength="160" /></label>
        <label>Environment<select v-model="environment"><option>production</option><option>staging</option><option>development</option><option>testing</option></select></label>
        <label class="wide">Reason<input v-model="reason" required minlength="3" maxlength="500" /></label>
        <button type="submit" :disabled="busy">Register domain</button>
      </form>
    </Card>

    <Card v-if="registration">
      <h2>One-time DNS TXT verification challenge</h2>
      <p>Record name: <strong>{{ registration.verification.record_name }}</strong></p>
      <p>Record value: <code>{{ registration.verification.record_value }}</code></p>
      <p>Expires: {{ registration.verification.expires_at }}</p>
      <p class="registry-warning">The challenge is shown once. It is stored as a hash by the API. Add this TXT record before submitting the verification value.</p>
    </Card>

    <Card v-if="auth.hasPermission('platform.domains.verify')">
      <h2>Verify domain ownership</h2>
      <form class="domain-form" @submit.prevent="verifyDomain">
        <label>Registry ID<input v-model="verificationId" inputmode="numeric" required /></label>
        <label class="wide">DNS TXT value<input v-model="verificationValue" autocomplete="off" required /></label>
        <button type="submit" :disabled="busy">Verify ownership</button>
      </form>
    </Card>

    <Card>
      <div class="registry-toolbar">
        <h2>{{ labels.inventory }}</h2>
        <form class="registry-filters" @submit.prevent="load">
          <label><span>{{ labels.search }}</span><input v-model="search" type="search" autocomplete="off" /></label>
          <label><span>{{ labels.source }}</span>
            <select v-model="source">
              <option value="all">{{ labels.all }}</option><option value="registry">{{ labels.registry }}</option>
              <option value="application">{{ labels.application }}</option><option value="tenant">{{ labels.tenant }}</option>
            </select>
          </label>
          <button type="submit" :disabled="loading">{{ loading ? '…' : labels.refresh }}</button>
        </form>
      </div>
      <p class="registry-warning">{{ labels.warning }}</p>
      <p v-if="loading" role="status">{{ labels.refresh }}…</p>
      <p v-if="!loading && rows.length === 0" class="registry-empty">{{ labels.noRows }}</p>
      <div v-else-if="rows.length > 0" class="registry-table-wrap">
        <table>
          <thead><tr><th>{{ labels.domain }}</th><th>{{ labels.source }}</th><th>{{ labels.owner }}</th><th>{{ labels.ownership }}</th><th>{{ labels.dns }}</th><th>{{ labels.tls }}</th><th>{{ labels.hosting }}</th><th>{{ labels.observed }}</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><strong>{{ row.fqdn }}</strong><small>{{ row.registry_state }}</small></td>
              <td>{{ sourceLabel(row.source) }}</td>
              <td>{{ row.display_name || row.source_slug || row.owner_type || '—' }}<small>{{ row.owner_type }} {{ row.owner_id ?? row.source_id ?? '' }}</small></td>
              <td>{{ row.ownership_state === 'verified' ? labels.verified : labels.notVerified }}</td>
              <td>{{ row.dns_state }}</td><td>{{ row.tls_state }}</td><td>{{ row.hosting_state }}</td><td>{{ dateLabel(row.last_observed_at) }}</td>
              <td v-if="row.registry_id">
                <button v-if="auth.hasPermission('platform.domains.manage')" type="button" @click="beginEdit(row)">Edit</button>
                <button type="button" @click="showHistory(Number(row.registry_id))">History</button>
              </td>
              <td v-else>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="registry-total">{{ total }} {{ labels.domain }}</p>
      <div v-if="editId !== null" class="edit-panel">
        <h3>Update domain metadata · #{{ editId }}</h3>
        <form class="domain-form" @submit.prevent="saveEdit">
          <label>Display name<input v-model="editName" maxlength="160" /></label>
          <label>Environment<select v-model="editEnvironment"><option>production</option><option>staging</option><option>development</option><option>testing</option></select></label>
          <label class="wide">Reason<input v-model="editReason" required minlength="3" maxlength="500" /></label>
          <button type="submit" :disabled="busy">Save metadata</button>
          <button type="button" @click="editId = null">Cancel</button>
        </form>
      </div>
      <div v-if="auditDomainId !== null" class="edit-panel">
        <h3>Audit history · #{{ auditDomainId }}</h3>
        <ul><li v-for="event in auditRows" :key="event.id">{{ event.action }} · {{ event.reason }} · {{ dateLabel(event.created_at) }}</li></ul>
      </div>
    </Card>

    <Card>
      <h2>{{ labels.providers }}</h2>
      <ul class="provider-status">
        <li>Registrar / DNS: {{ capabilities?.dns_provider_connected ? 'Connected' : labels.noProvider }}</li>
        <li>SSL/TLS: {{ capabilities?.tls_provider_connected ? 'Connected' : labels.noProvider }}</li>
        <li>Hosting / Plesk: {{ capabilities?.hosting_provider_connected ? 'Connected' : labels.noProvider }}</li>
      </ul>
      <p class="registry-warning">Live DNS, SSL/TLS and hosting provider mutations remain disabled.</p>
    </Card>
  </main>
</template>

<style scoped>
.domain-registry-page { display: grid; gap: 1.25rem; }
.registry-toolbar { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; }
.registry-toolbar h2 { margin: 0; font-size: 1.05rem; }
.registry-filters, .domain-form { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; }
.domain-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); }
.registry-filters label, .domain-form label { display: grid; gap: .25rem; font-size: .875rem; }
.registry-filters input, .registry-filters select, .domain-form input, .domain-form select { min-height: 2.5rem; min-width: 0; padding: .4rem .6rem; border: 1px solid var(--color-border, #aaa); border-radius: .375rem; background: var(--color-surface, white); color: inherit; }
.registry-filters button, .domain-form button, td button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.registry-filters button:disabled, .domain-form button:disabled { cursor: wait; opacity: .6; }
.registry-warning, .edit-panel { padding: .75rem; border-inline-start: 3px solid var(--color-warning, #b7791f); background: var(--color-surface-subtle, #f7f4ec); border-radius: .25rem; }
.registry-error { color: var(--color-danger, #b42318); }
.registry-message { color: var(--color-success, #18794e); }
.registry-empty { padding: 1.5rem 0; text-align: center; }
.registry-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; white-space: nowrap; }
th { font-size: .8rem; font-weight: 600; }
td small { display: block; margin-top: .2rem; color: var(--color-text-muted, #666); }
.registry-total { color: var(--color-text-muted, #666); font-size: .85rem; }
.provider-status { display: grid; gap: .4rem; padding-inline-start: 1.25rem; }
.wide { grid-column: 1 / -1; }
.edit-panel { display: grid; gap: .6rem; margin-top: .9rem; }
</style>
