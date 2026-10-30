<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import { useAuthStore } from '@/stores/auth';
import {
  fetchPublicContentQueue,
  reviewPublicContent,
  type AdminPublicContent,
  type PublicContentStatus,
  type ReviewDecision,
} from '@/features/public-content/api';

const auth = useAuthStore();
const items = ref<AdminPublicContent[]>([]);
const selectedId = ref<number | null>(null);
const filter = ref<PublicContentStatus | 'all'>('pending_review');
const reason = ref('');
const scheduledAt = ref('');
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const notice = ref<string | null>(null);

const selected = computed(() => items.value.find((item) => item.id === selectedId.value) ?? null);
const canApproveSelected = computed(() =>
  selected.value !== null &&
  selected.value.submitted_by !== auth.userId &&
  ['pending_review', 'changes_requested'].includes(selected.value.status),
);

const labels = {
  title: 'ይፋዊ ይዘት ግምገማ',
  description: 'ለድረ ገጹ የቀረቡ ጽሑፎችን፣ ዜናዎችንና ማስታወቂያዎችን ይገምግሙ።',
  queue: 'የግምገማ ወረፋ',
  pending: 'ግምገማ ይጠብቃል',
  changes: 'ማሻሻያ ተጠይቋል',
  approved: 'ጸድቋል',
  rejected: 'ውድቅ ተደርጓል',
  scheduled: 'ለህትመት ተይዟል',
  published: 'ታትሟል',
  unpublished: 'ከህትመት ተነስቷል',
  all: 'ሁሉም',
  refresh: 'አድስ',
  selectPrompt: 'ለማየት ከዝርዝሩ አንድ ጽሑፍ ይምረጡ።',
  approve: 'አጽድቅ',
  reject: 'ውድቅ አድርግ',
  requestChanges: 'ማሻሻያ ጠይቅ',
  publish: 'አትም',
  schedule: 'ለተወሰነ ጊዜ አስቀምጥ',
  scheduleAt: 'የህትመት ቀንና ሰዓት',
  unpublish: 'ከህትመት አንሳ',
  reason: 'የግምገማ ማስታወሻ / ምክንያት',
  author: 'አቅራቢ',
  submitted: 'የቀረበበት ቀን',
  version: 'ስሪት',
  selfReview: 'የራስዎን የቀረበ ጽሑፍ ማጽደቅ ወይም ማተም አይችሉም።',
  noItems: 'በዚህ ማጣሪያ ምንም ጽሑፍ የለም።',
  reviewOnly: 'ይህ ገጽ ለተፈቀደላቸው የይዘት ገምጋሚዎች ብቻ ነው።',
} as const;

const statusLabels: Record<PublicContentStatus, string> = {
  pending_review: labels.pending,
  changes_requested: labels.changes,
  approved: labels.approved,
  rejected: labels.rejected,
  scheduled: labels.scheduled,
  published: labels.published,
  unpublished: labels.unpublished,
};

async function load(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    const page = await fetchPublicContentQueue(filter.value);
    items.value = [...page.data];
    if (!items.value.some((item) => item.id === selectedId.value)) {
      selectedId.value = items.value[0]?.id ?? null;
    }
  } catch {
    error.value = 'የይዘት ዝርዝሩን ማምጣት አልተቻለም። የፈቃድና የAPI ግንኙነት ሁኔታን ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}

async function decide(decision: ReviewDecision): Promise<void> {
  if (!selected.value || saving.value) return;
  if (['reject', 'request-changes'].includes(decision) && !reason.value.trim()) {
    error.value = 'ለውድቅ ወይም ማሻሻያ ጥያቄ ምክንያት ያስገቡ።';
    return;
  }
  saving.value = true;
  error.value = null;
  notice.value = null;
  try {
    const schedule = decision === 'publish' && scheduledAt.value
      ? new Date(scheduledAt.value).toISOString()
      : undefined;
    await reviewPublicContent(selected.value, decision, reason.value, schedule);
    notice.value = 'የግምገማ ውሳኔው ተመዝግቧል።';
    reason.value = '';
    scheduledAt.value = '';
    await load();
  } catch {
    error.value = 'ውሳኔው አልተፈጸመም። ስሪቱ ተቀይሮ ከሆነ ዝርዝሩን ያድሱና እንደገና ይገምግሙ።';
  } finally {
    saving.value = false;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('am-ET', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

onMounted(load);
</script>

<template>
  <div class="public-content-admin" data-testid="admin-public-content-root">
    <PageHeader :title="labels.title" :description="labels.description" />

    <Card>
      <div class="public-content-admin__toolbar">
        <h2>{{ labels.queue }}</h2>
        <div class="public-content-admin__filters">
          <label for="content-status-filter">{{ labels.all }}</label>
          <select id="content-status-filter" v-model="filter" @change="load">
            <option value="pending_review">{{ labels.pending }}</option>
            <option value="changes_requested">{{ labels.changes }}</option>
            <option value="approved">{{ labels.approved }}</option>
            <option value="rejected">{{ labels.rejected }}</option>
            <option value="scheduled">{{ labels.scheduled }}</option>
            <option value="published">{{ labels.published }}</option>
            <option value="unpublished">{{ labels.unpublished }}</option>
            <option value="all">{{ labels.all }}</option>
          </select>
          <button type="button" :disabled="loading" @click="load">{{ labels.refresh }}</button>
        </div>
      </div>

      <p v-if="error" class="public-content-admin__message public-content-admin__message--error" role="alert">{{ error }}</p>
      <p v-if="notice" class="public-content-admin__message public-content-admin__message--success" role="status">{{ notice }}</p>

      <div class="public-content-admin__workspace">
        <div class="public-content-admin__list" aria-label="Submitted content">
          <p v-if="loading" class="public-content-admin__empty" role="status">በመጫን ላይ…</p>
          <p v-else-if="items.length === 0" class="public-content-admin__empty">{{ labels.noItems }}</p>
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            class="public-content-admin__item"
            :class="{ 'public-content-admin__item--active': selectedId === item.id }"
            :aria-pressed="selectedId === item.id"
            @click="selectedId = item.id"
          >
            <span class="public-content-admin__item-type">{{ item.content_type.replace('_', ' ') }}</span>
            <strong>{{ item.title }}</strong>
            <span>{{ item.author_name }} · {{ statusLabels[item.status] }}</span>
          </button>
        </div>

        <section v-if="selected" class="public-content-admin__preview" aria-label="Selected submission">
          <div class="public-content-admin__preview-heading">
            <div>
              <span class="public-content-admin__item-type">{{ selected.content_type.replace('_', ' ') }}</span>
              <h3>{{ selected.title }}</h3>
            </div>
            <span class="public-content-admin__status">{{ statusLabels[selected.status] }}</span>
          </div>
          <dl class="public-content-admin__metadata">
            <div><dt>{{ labels.author }}</dt><dd>{{ selected.author_name }}<span v-if="selected.author_email"> · {{ selected.author_email }}</span></dd></div>
            <div><dt>{{ labels.submitted }}</dt><dd>{{ formatDate(selected.created_at) }}</dd></div>
            <div><dt>{{ labels.version }}</dt><dd>{{ selected.version }}</dd></div>
          </dl>
          <div class="public-content-admin__body">{{ selected.body }}</div>
          <p v-if="selected.review_note" class="public-content-admin__note">{{ selected.review_note }}</p>
          <p v-if="selected.submitted_by === auth.userId" class="public-content-admin__message public-content-admin__message--error">{{ labels.selfReview }}</p>
          <label v-if="selected.status === 'approved' || selected.status === 'scheduled'" class="public-content-admin__reason-label" for="publish-at">{{ labels.scheduleAt }}</label>
          <input v-if="selected.status === 'approved' || selected.status === 'scheduled'" id="publish-at" v-model="scheduledAt" type="datetime-local" />
          <label class="public-content-admin__reason-label" for="review-reason">{{ labels.reason }}</label>
          <textarea id="review-reason" v-model="reason" rows="3" maxlength="2000" />
          <div class="public-content-admin__actions">
            <button v-if="canApproveSelected" type="button" :disabled="saving" @click="decide('approve')">{{ labels.approve }}</button>
            <button v-if="canApproveSelected" type="button" class="secondary" :disabled="saving" @click="decide('request-changes')">{{ labels.requestChanges }}</button>
            <button v-if="canApproveSelected" type="button" class="danger" :disabled="saving" @click="decide('reject')">{{ labels.reject }}</button>
            <button v-if="selected.status === 'approved' || selected.status === 'scheduled'" type="button" :disabled="saving" @click="decide('publish')">{{ scheduledAt ? labels.schedule : labels.publish }}</button>
            <button v-if="selected.status === 'published'" type="button" class="danger" :disabled="saving" @click="decide('unpublish')">{{ labels.unpublish }}</button>
          </div>
        </section>
        <div v-else class="public-content-admin__empty public-content-admin__preview">{{ labels.selectPrompt }}</div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.public-content-admin { display: flex; flex-direction: column; gap: var(--mases-space-6); width: 100%; }
.public-content-admin__toolbar,.public-content-admin__filters,.public-content-admin__preview-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--mases-space-3); }
.public-content-admin__toolbar h2,.public-content-admin__preview h3 { margin: 0; color: var(--mases-color-text-primary); }
.public-content-admin__filters { flex-wrap: wrap; }
.public-content-admin select,.public-content-admin textarea { max-width: 100%; padding: var(--mases-space-2); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-raised); color: var(--mases-color-text-primary); }
.public-content-admin button { cursor: pointer; border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); padding: var(--mases-space-2) var(--mases-space-3); color: var(--mases-color-text-primary); background: var(--mases-color-surface-raised); }
.public-content-admin button:disabled { cursor: wait; opacity: .55; }
.public-content-admin__workspace { display: grid; grid-template-columns: minmax(240px, .8fr) minmax(0, 1.5fr); gap: var(--mases-space-4); margin-top: var(--mases-space-4); }
.public-content-admin__list { display: flex; flex-direction: column; gap: var(--mases-space-2); min-width: 0; }
.public-content-admin__item { display: flex; flex-direction: column; align-items: flex-start; gap: var(--mases-space-1); text-align: start; }
.public-content-admin__item strong { overflow-wrap: anywhere; }
.public-content-admin__item > span:last-child,.public-content-admin__metadata,.public-content-admin__empty { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.public-content-admin__item--active { border-color: var(--mases-color-action-primary); background: var(--mases-color-state-selected); }
.public-content-admin__item-type { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-caption); text-transform: uppercase; letter-spacing: .06em; }
.public-content-admin__preview { min-width: 0; padding: var(--mases-space-4); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-lg); }
.public-content-admin__preview h3 { margin-top: var(--mases-space-2); overflow-wrap: anywhere; }
.public-content-admin__status { border-radius: 999px; padding: var(--mases-space-1) var(--mases-space-2); background: var(--mases-color-surface-subtle); color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-caption); }
.public-content-admin__metadata { display: flex; flex-wrap: wrap; gap: var(--mases-space-4); padding: 0; }
.public-content-admin__metadata div { min-width: 0; }
.public-content-admin__metadata dt { font-weight: var(--mases-font-weight-semibold); }
.public-content-admin__metadata dd { margin: 0; overflow-wrap: anywhere; }
.public-content-admin__body { white-space: pre-wrap; overflow-wrap: anywhere; line-height: var(--mases-line-height-body); padding-block: var(--mases-space-4); }
.public-content-admin__note { padding: var(--mases-space-3); background: var(--mases-color-surface-subtle); border-radius: var(--mases-radius-md); }
.public-content-admin__reason-label { display: block; margin-bottom: var(--mases-space-2); font-weight: var(--mases-font-weight-semibold); }
.public-content-admin textarea { width: 100%; resize: vertical; }
.public-content-admin__actions { display: flex; flex-wrap: wrap; gap: var(--mases-space-2); margin-top: var(--mases-space-3); }
.public-content-admin__actions .secondary { background: var(--mases-color-surface-subtle); }
.public-content-admin__actions .danger { color: var(--mases-color-text-danger); }
.public-content-admin__message { padding: var(--mases-space-3); border-radius: var(--mases-radius-md); }
.public-content-admin__message--error { color: var(--mases-color-text-danger); background: var(--mases-color-surface-danger); }
.public-content-admin__message--success { color: var(--mases-color-text-success); background: var(--mases-color-surface-success); }
.public-content-admin__empty { padding: var(--mases-space-4); }
@media (max-width: 760px) {
  .public-content-admin__toolbar,.public-content-admin__preview-heading { align-items: flex-start; flex-direction: column; }
  .public-content-admin__workspace { grid-template-columns: minmax(0,1fr); }
  .public-content-admin__list { max-height: 360px; overflow-y: auto; }
}
</style>
