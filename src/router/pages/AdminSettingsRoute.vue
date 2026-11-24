<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/core/api/client';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

type Category = 'setting' | 'configuration';
interface SettingItem {
  readonly key: string;
  readonly category: Category;
  readonly value: string | null;
  readonly is_secret: boolean;
  readonly is_configured: boolean;
  readonly description: string | null;
  readonly environment: string;
  readonly version: number;
  readonly updated_at: string;
}
interface ChangeRequest {
  readonly id: number;
  readonly key: string;
  readonly category: Category;
  readonly proposed_value: string | null;
  readonly secret_value_provided: boolean;
  readonly environment: string;
  readonly requested_by: number;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly reason: string;
  readonly created_at: string;
}
interface Page<T> { readonly data: readonly T[]; readonly total: number }
const route = useRoute();
const auth = useAuthStore();
const category = computed<Category>(() => route.name === 'admin-configuration' ? 'configuration' : 'setting');
const base = computed(() => '/api/admin/platform/' + (category.value === 'setting' ? 'settings' : 'configuration'));
const title = computed(() => category.value === 'setting' ? 'የመድረክ ቅንብሮች' : 'የመድረክ ውቅር');
const items = ref<readonly SettingItem[]>([]);
const requests = ref<readonly ChangeRequest[]>([]);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const message = ref('');
const key = ref('');
const value = ref('');
const isSecret = ref(false);
const environment = ref('production');
const reason = ref('');
const decisionNote = ref('');

const canRequest = computed(() => auth.hasPermission(category.value === 'setting' ? 'platform.settings.manage' : 'platform.configuration.manage'));
const canApprove = computed(() => auth.hasPermission(category.value === 'setting' ? 'platform.settings.approve' : 'platform.configuration.approve'));

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const [settings, pending] = await Promise.all([
      api.get<{ items: readonly SettingItem[] }>(base.value),
      canApprove.value ? api.get<Page<ChangeRequest>>(base.value + '/change-requests', { params: { status: 'pending', per_page: 50 } }) : Promise.resolve({ data: [], total: 0 }),
    ]);
    items.value = settings.items;
    requests.value = pending.data;
  } catch {
    error.value = 'የቅንብር መረጃን ማምጣት አልተቻለም። የፈቃድና የAPI ግንኙነት ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}

async function submitChange(): Promise<void> {
  if (!key.value.trim() || !value.value || reason.value.trim().length < 3) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await api.post(base.value + '/change-requests', {
      key: key.value.trim(),
      value: value.value,
      is_secret: isSecret.value,
      environment: environment.value,
      reason: reason.value.trim(),
    });
    message.value = 'የለውጥ ጥያቄው ተመዝግቧል። ሌላ ፈቃድ ያለው አስተዳዳሪ እስኪያጸድቀው ድረስ ንቁ ውቅር አይቀየርም።';
    key.value = '';
    value.value = '';
    reason.value = '';
    await load();
  } catch {
    error.value = 'የለውጥ ጥያቄው አልተመዘገበም።';
  } finally {
    busy.value = false;
  }
}

async function decide(id: number, decision: 'approve' | 'reject'): Promise<void> {
  if (decisionNote.value.trim().length < 3) return;
  busy.value = true;
  error.value = '';
  try {
    await api.post(base.value + '/change-requests/' + id + '/' + decision, { approval_note: decisionNote.value.trim() });
    message.value = decision === 'approve' ? 'የለውጥ ጥያቄው ጸድቋል።' : 'የለውጥ ጥያቄው ውድቅ ተደርጓል።';
    decisionNote.value = '';
    await load();
  } catch {
    error.value = 'ውሳኔው አልተመዘገበም። የተለየ አጽዳቂና የapprove permission ያስፈልጋሉ።';
  } finally {
    busy.value = false;
  }
}

watch(category, () => { void load(); });
onMounted(() => { void load(); });
</script>

<template>
  <main class="settings-page">
    <PageHeader :title="title" description="የለውጥ ጥያቄዎች በሌላ አስተዳዳሪ ማጽደቅ እስኪያገኙ ድረስ ንቁ እሴቶችን አይቀይሩም።" />
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <p v-if="message" role="status" class="message">{{ message }}</p>
    <Card>
      <div class="toolbar"><h2>Active values</h2><button type="button" :disabled="loading" @click="load">{{ loading ? '…' : 'አድስ' }}</button></div>
      <p v-if="loading" role="status">መረጃ በመጫን ላይ…</p>
      <p v-else-if="items.length === 0">የተመዘገበ ቅንብር የለም።</p>
      <div v-else class="table-wrap">
        <table><thead><tr><th>Key</th><th>Value</th><th>Environment</th><th>Version</th></tr></thead>
          <tbody><tr v-for="item in items" :key="item.key + item.environment">
            <td><strong>{{ item.key }}</strong><small>{{ item.description }}</small></td>
            <td>{{ item.is_secret ? (item.is_configured ? '•••••••• (Secret configured)' : 'Not configured') : item.value }}</td>
            <td>{{ item.environment }}</td><td>{{ item.version }}</td>
          </tr></tbody>
        </table>
      </div>
    </Card>

    <Card v-if="canRequest">
      <h2>Request a change</h2>
      <form class="change-form" @submit.prevent="submitChange">
        <label>Key<input v-model="key" required maxlength="160" /></label>
        <label>Environment<select v-model="environment"><option>production</option><option>staging</option><option>development</option><option>testing</option></select></label>
        <label class="wide"><span>Value</span><input v-model="value" :type="isSecret ? 'password' : 'text'" required autocomplete="off" /></label>
        <label class="secret"><input v-model="isSecret" type="checkbox" /> Secret value</label>
        <label class="wide">Reason<input v-model="reason" required minlength="3" maxlength="500" /></label>
        <button type="submit" :disabled="busy">Submit approval request</button>
      </form>
      <p class="notice">All values are encrypted at rest. Secret values are never returned by read or approval APIs. A different authorized approver must approve the request.</p>
    </Card>

    <Card v-if="canApprove">
      <h2>Pending approval requests</h2>
      <p v-if="requests.length === 0">Pending request የለም።</p>
      <div v-for="request in requests" :key="request.id" class="request-item">
        <strong>{{ request.key }}</strong><span>{{ request.environment }} · {{ request.status }}</span>
        <p>{{ request.secret_value_provided ? 'Secret value provided (redacted)' : request.proposed_value }}</p>
        <small>Requester #{{ request.requested_by }} · {{ request.reason }}</small>
        <label>Decision note<input v-model="decisionNote" maxlength="500" minlength="3" /></label>
        <div class="decision-actions">
          <button type="button" :disabled="busy || decisionNote.trim().length < 3" @click="decide(request.id, 'approve')">Approve</button>
          <button type="button" :disabled="busy || decisionNote.trim().length < 3" @click="decide(request.id, 'reject')">Reject</button>
        </div>
      </div>
    </Card>
  </main>
</template>

<style scoped>
.settings-page { display: grid; gap: 1.25rem; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.toolbar h2 { margin: 0; font-size: 1.05rem; }
button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
button:disabled { opacity: .6; cursor: not-allowed; }
.error { color: var(--color-danger, #b42318); }
.message { color: var(--color-success, #18794e); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; }
td small { display: block; color: var(--color-text-muted, #666); }
.change-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: .75rem; align-items: end; }
.change-form label, .request-item label { display: grid; gap: .3rem; }
.change-form input, .change-form select, .request-item input { min-height: 2.5rem; min-width: 0; padding: .45rem .6rem; border: 1px solid var(--color-border, #aaa); border-radius: .375rem; background: var(--color-surface, white); color: inherit; }
.change-form .wide { grid-column: 1 / -1; }
.change-form .secret { display: flex; align-items: center; gap: .5rem; }
.change-form .secret input { min-height: auto; }
.notice { padding: .75rem; border-inline-start: 3px solid var(--color-warning, #b7791f); background: var(--color-surface-subtle, #f7f4ec); }
.request-item { display: grid; gap: .5rem; padding: .85rem 0; border-top: 1px solid var(--color-border, #ddd); }
.request-item small { color: var(--color-text-muted, #666); }
.decision-actions { display: flex; gap: .5rem; }
</style>
