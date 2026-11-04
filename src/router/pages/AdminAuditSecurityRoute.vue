<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

type Tab = 'audit' | 'security';
interface Actor { readonly id: number; readonly email: string }
interface AuditEntry {
  readonly id: number; readonly action: string; readonly resource_type: string | null;
  readonly resource_id: string | null; readonly request_id: string | null;
  readonly ip_address: string | null; readonly user_agent: string | null;
  readonly old_values: Record<string, unknown> | null; readonly new_values: Record<string, unknown> | null;
  readonly metadata: Record<string, unknown> | null; readonly created_at: string;
  readonly user: Actor | null;
}
interface SecurityEntry {
  readonly id: number; readonly event_type: string; readonly severity: 'info' | 'warning' | 'critical';
  readonly description: string | null; readonly event_data: Record<string, unknown> | null;
  readonly ip_address: string | null; readonly request_id: string | null; readonly created_at: string;
  readonly resolved_at: string | null; readonly resolution_notes: string | null;
  readonly user: Actor | null; readonly resolver: Actor | null;
}
interface Page<T> { readonly data: T[]; readonly current_page: number; readonly last_page: number; readonly total: number }

const tab = ref<Tab>('audit');
const auditRows = ref<AuditEntry[]>([]);
const securityRows = ref<SecurityEntry[]>([]);
const selectedAuditId = ref<number | null>(null);
const selectedSecurityId = ref<number | null>(null);
const search = ref('');
const severity = ref<'all' | SecurityEntry['severity']>('all');
const status = ref<'all' | 'open' | 'resolved'>('open');
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const resolutionNotes = ref('');

const selectedAudit = computed(() => auditRows.value.find((row) => row.id === selectedAuditId.value) ?? null);
const selectedSecurity = computed(() => securityRows.value.find((row) => row.id === selectedSecurityId.value) ?? null);
const labels = {
  title: 'የኦዲት እና የደህንነት ማዕከል',
  description: 'የስርዓት ድርጊቶችን ይከታተሉ፣ የደህንነት ክስተቶችን ይመርምሩ፣ ውሳኔዎችንም በማስረጃ ይመዝግቡ።',
  audit: 'የኦዲት መዝገቦች', security: 'የደህንነት ክስተቶች',
  search: 'ፈልግ (ድርጊት፣ ሀብት፣ ጥያቄ መለያ)', refresh: 'አድስ',
  all: 'ሁሉም', open: 'ክፍት', resolved: 'የተፈቱ',
  info: 'መረጃ', warning: 'ማስጠንቀቂያ', critical: 'አስቸኳይ',
  actor: 'ተዋናይ', resource: 'የተጎዳ ሀብት', request: 'የጥያቄ መለያ',
  time: 'ቀን / ሰዓት', ip: 'IP አድራሻ', details: 'ዝርዝር',
  notes: 'የመፍትሔ ማስታወሻ (ቢያንስ 10 ቁምፊ)', resolve: 'ክስተቱን ፍታ',
  noRows: 'በዚህ ማጣሪያ ምንም መዝገብ አልተገኘም።',
  immutable: 'የኦዲት መዝገቦች ለማስረጃነት ብቻ ይነበባሉ፤ አይሻሻሉም ወይም አይሰረዙም።',
} as const;

function formatDate(value: string): string {
  return formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}
function actorName(actor: Actor | null): string { return actor?.email ?? 'System / unknown'; }
function displayJson(value: unknown): string {
  return value == null ? '—' : JSON.stringify(value, null, 2);
}

async function load(): Promise<void> {
  loading.value = true; error.value = '';
  try {
    const params = {
      q: search.value.trim() || undefined,
      per_page: 25,
      page: page.value,
      ...(tab.value === 'security' ? {
        severity: severity.value === 'all' ? undefined : severity.value,
        status: status.value === 'all' ? undefined : status.value,
      } : {}),
    };
    if (tab.value === 'audit') {
      const result = await api.get<Page<AuditEntry>>('/api/admin/audit-logs', { params });
      auditRows.value = result.data;
      lastPage.value = result.last_page;
      total.value = result.total;
      if (!auditRows.value.some((row) => row.id === selectedAuditId.value)) selectedAuditId.value = auditRows.value[0]?.id ?? null;
    } else {
      const result = await api.get<Page<SecurityEntry>>('/api/admin/security-events', { params });
      securityRows.value = result.data;
      lastPage.value = result.last_page;
      total.value = result.total;
      if (!securityRows.value.some((row) => row.id === selectedSecurityId.value)) selectedSecurityId.value = securityRows.value[0]?.id ?? null;
    }
  } catch {
    error.value = 'መዝገቦቹን ማምጣት አልተቻለም። የፈቃድ፣ የቴናንት አውድ እና የAPI ግንኙነት ያረጋግጡ።';
  } finally { loading.value = false; }
}
async function resolveSelected(): Promise<void> {
  if (!selectedSecurity.value || resolutionNotes.value.trim().length < 10 || saving.value) return;
  saving.value = true; error.value = ''; notice.value = '';
  try {
    await api.post(`/api/admin/security-events/${selectedSecurity.value.id}/resolve`, {
      resolution_notes: resolutionNotes.value.trim(),
    });
    notice.value = 'የክስተቱ መፍትሔ ተመዝግቧል።';
    resolutionNotes.value = '';
    await load();
  } catch {
    error.value = 'መፍትሔው አልተመዘገበም። ክስተቱ ቀድሞ ተፈትቶ ወይም ፈቃዱ ተቀይሮ ሊሆን ይችላል።';
  } finally { saving.value = false; }
}
function changeTab(next: Tab): void { tab.value = next; page.value = 1; error.value = ''; notice.value = ''; void load(); }
watch([severity, status], () => { if (tab.value === 'security') { page.value = 1; void load(); } });
onMounted(load);
</script>

<template>
  <div class="audit-security-admin" data-testid="admin-audit-security-root">
    <PageHeader :title="labels.title" :description="labels.description" />
    <Card>
      <div class="audit-security-admin__toolbar">
        <div class="audit-security-admin__tabs" role="tablist" aria-label="Audit and security">
          <button type="button" role="tab" :aria-selected="tab === 'audit'" :class="{ active: tab === 'audit' }" @click="changeTab('audit')">{{ labels.audit }}</button>
          <button type="button" role="tab" :aria-selected="tab === 'security'" :class="{ active: tab === 'security' }" @click="changeTab('security')">{{ labels.security }}</button>
        </div>
        <button type="button" :disabled="loading" @click="load">{{ labels.refresh }}</button>
      </div>
      <div class="audit-security-admin__filters">
        <label class="sr-only" for="audit-search">{{ labels.search }}</label>
        <input id="audit-search" v-model="search" type="search" :placeholder="labels.search" @keydown.enter="page = 1; load()" />
        <template v-if="tab === 'security'">
          <label class="sr-only" for="security-severity">Severity</label>
          <select id="security-severity" v-model="severity">
            <option value="all">{{ labels.all }}</option>
            <option value="info">{{ labels.info }}</option>
            <option value="warning">{{ labels.warning }}</option>
            <option value="critical">{{ labels.critical }}</option>
          </select>
          <label class="sr-only" for="security-status">Status</label>
          <select id="security-status" v-model="status">
            <option value="open">{{ labels.open }}</option>
            <option value="resolved">{{ labels.resolved }}</option>
            <option value="all">{{ labels.all }}</option>
          </select>
        </template>
        <button type="button" :disabled="loading" @click="page = 1; load()">ፈልግ</button>
      </div>
      <p v-if="error" class="audit-security-admin__message error" role="alert">{{ error }}</p>
      <p v-if="notice" class="audit-security-admin__message success" role="status">{{ notice }}</p>
      <p v-if="tab === 'audit'" class="audit-security-admin__hint">{{ labels.immutable }}</p>
      <p v-if="loading" class="audit-security-admin__hint" role="status">በመጫን ላይ…</p>

      <div v-if="tab === 'audit'" class="audit-security-admin__layout">
        <div class="audit-security-admin__list" aria-label="Audit log entries">
          <p v-if="!loading && auditRows.length === 0" class="audit-security-admin__empty">{{ labels.noRows }}</p>
          <button v-for="entry in auditRows" :key="entry.id" type="button" class="audit-security-admin__row" :class="{ active: selectedAuditId === entry.id }" :aria-pressed="selectedAuditId === entry.id" @click="selectedAuditId = entry.id">
            <strong>{{ entry.action }}</strong>
            <span>{{ actorName(entry.user) }}</span>
            <small>{{ formatDate(entry.created_at) }}</small>
          </button>
        </div>
        <section v-if="selectedAudit" class="audit-security-admin__detail" aria-label="Audit log detail">
          <h2>{{ labels.details }} #{{ selectedAudit.id }}</h2>
          <dl>
            <div><dt>{{ labels.actor }}</dt><dd>{{ actorName(selectedAudit.user) }}</dd></div>
            <div><dt>{{ labels.resource }}</dt><dd>{{ selectedAudit.resource_type ?? '—' }} / {{ selectedAudit.resource_id ?? '—' }}</dd></div>
            <div><dt>{{ labels.request }}</dt><dd>{{ selectedAudit.request_id ?? '—' }}</dd></div>
            <div><dt>{{ labels.ip }}</dt><dd>{{ selectedAudit.ip_address ?? '—' }}</dd></div>
            <div><dt>{{ labels.time }}</dt><dd>{{ formatDate(selectedAudit.created_at) }}</dd></div>
          </dl>
          <h3>Before</h3><pre>{{ displayJson(selectedAudit.old_values) }}</pre>
          <h3>After</h3><pre>{{ displayJson(selectedAudit.new_values) }}</pre>
          <h3>Metadata</h3><pre>{{ displayJson(selectedAudit.metadata) }}</pre>
        </section>
        <div v-else class="audit-security-admin__detail audit-security-admin__empty">{{ labels.noRows }}</div>
      </div>

      <div v-else class="audit-security-admin__layout">
        <div class="audit-security-admin__list" aria-label="Security events">
          <p v-if="!loading && securityRows.length === 0" class="audit-security-admin__empty">{{ labels.noRows }}</p>
          <button v-for="event in securityRows" :key="event.id" type="button" class="audit-security-admin__row" :class="{ active: selectedSecurityId === event.id }" :aria-pressed="selectedSecurityId === event.id" @click="selectedSecurityId = event.id">
            <strong>{{ event.event_type }}</strong>
            <span>{{ event.description ?? '—' }}</span>
            <small>{{ labels[event.severity] }} · {{ event.resolved_at ? labels.resolved : labels.open }} · {{ formatDate(event.created_at) }}</small>
          </button>
        </div>
        <section v-if="selectedSecurity" class="audit-security-admin__detail" aria-label="Security event detail">
          <h2>{{ selectedSecurity.event_type }} #{{ selectedSecurity.id }}</h2>
          <dl>
            <div><dt>{{ labels.actor }}</dt><dd>{{ actorName(selectedSecurity.user) }}</dd></div>
            <div><dt>{{ labels.ip }}</dt><dd>{{ selectedSecurity.ip_address ?? '—' }}</dd></div>
            <div><dt>{{ labels.request }}</dt><dd>{{ selectedSecurity.request_id ?? '—' }}</dd></div>
            <div><dt>{{ labels.time }}</dt><dd>{{ formatDate(selectedSecurity.created_at) }}</dd></div>
            <div><dt>{{ labels.resolved }}</dt><dd>{{ selectedSecurity.resolved_at ? formatDate(selectedSecurity.resolved_at) : labels.open }}</dd></div>
            <div v-if="selectedSecurity.resolver"><dt>Resolved by</dt><dd>{{ actorName(selectedSecurity.resolver) }}</dd></div>
          </dl>
          <p>{{ selectedSecurity.description }}</p>
          <h3>Event data</h3><pre>{{ displayJson(selectedSecurity.event_data) }}</pre>
          <p v-if="selectedSecurity.resolution_notes" class="audit-security-admin__hint">{{ selectedSecurity.resolution_notes }}</p>
          <form v-if="!selectedSecurity.resolved_at" class="audit-security-admin__resolve" @submit.prevent="resolveSelected">
            <label for="resolution-notes">{{ labels.notes }}</label>
            <textarea id="resolution-notes" v-model="resolutionNotes" rows="3" minlength="10" maxlength="4000" required />
            <button type="submit" :disabled="saving || resolutionNotes.trim().length < 10">{{ saving ? 'በመመዝገብ ላይ…' : labels.resolve }}</button>
          </form>
        </section>
        <div v-else class="audit-security-admin__detail audit-security-admin__empty">{{ labels.noRows }}</div>
      </div>
      <div class="audit-security-admin__pagination">
        <span>{{ total }} · {{ page }} / {{ lastPage }}</span>
        <div>
          <button type="button" :disabled="loading || page <= 1" @click="page--; load()">‹</button>
          <button type="button" :disabled="loading || page >= lastPage" @click="page++; load()">›</button>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.audit-security-admin { display:flex; flex-direction:column; gap:var(--mases-space-6); width:100%; min-width:0; }
.audit-security-admin__toolbar,.audit-security-admin__tabs,.audit-security-admin__filters,.audit-security-admin__pagination { display:flex; align-items:center; justify-content:space-between; gap:var(--mases-space-3); flex-wrap:wrap; }
.audit-security-admin button,.audit-security-admin input,.audit-security-admin select,.audit-security-admin textarea { border:1px solid var(--mases-color-border-default); border-radius:var(--mases-radius-md); padding:var(--mases-space-2) var(--mases-space-3); color:var(--mases-color-text-primary); background:var(--mases-color-surface-raised); }
.audit-security-admin button { cursor:pointer; }
.audit-security-admin button:disabled { opacity:.55; cursor:wait; }
.audit-security-admin__tabs button.active,.audit-security-admin__row.active { border-color:var(--mases-color-action-primary); background:var(--mases-color-state-selected); }
.audit-security-admin__filters { justify-content:flex-start; margin-block:var(--mases-space-4); }
.audit-security-admin__filters input { flex:1 1 260px; min-width:0; }
.audit-security-admin__layout { display:grid; grid-template-columns:minmax(240px,.8fr) minmax(0,1.5fr); gap:var(--mases-space-4); margin-top:var(--mases-space-3); }
.audit-security-admin__list { display:flex; flex-direction:column; gap:var(--mases-space-2); min-width:0; }
.audit-security-admin__row { display:flex; flex-direction:column; align-items:flex-start; gap:var(--mases-space-1); text-align:start; overflow-wrap:anywhere; }
.audit-security-admin__row span,.audit-security-admin__row small,.audit-security-admin__hint,.audit-security-admin__empty { color:var(--mases-color-text-secondary); font-size:var(--mases-font-size-body-sm); }
.audit-security-admin__detail { min-width:0; padding:var(--mases-space-4); border:1px solid var(--mases-color-border-default); border-radius:var(--mases-radius-lg); }
.audit-security-admin__detail h2 { margin-top:0; overflow-wrap:anywhere; }
.audit-security-admin__detail dl { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:var(--mases-space-3); }
.audit-security-admin__detail dt { color:var(--mases-color-text-secondary); font-size:var(--mases-font-size-caption); }
.audit-security-admin__detail dd { margin:0; overflow-wrap:anywhere; }
.audit-security-admin pre { max-width:100%; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; padding:var(--mases-space-3); background:var(--mases-color-surface-subtle); border-radius:var(--mases-radius-md); font-size:var(--mases-font-size-body-sm); }
.audit-security-admin__resolve { display:flex; flex-direction:column; gap:var(--mases-space-2); margin-top:var(--mases-space-4); }
.audit-security-admin__resolve textarea { width:100%; resize:vertical; }
.audit-security-admin__message.error { color:var(--mases-color-text-danger); }
.audit-security-admin__message.success { color:var(--mases-color-text-success); }
.audit-security-admin__pagination { margin-top:var(--mases-space-4); color:var(--mases-color-text-secondary); font-size:var(--mases-font-size-body-sm); }
.audit-security-admin .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media(max-width:760px) { .audit-security-admin__layout { grid-template-columns:minmax(0,1fr); } }
</style>
