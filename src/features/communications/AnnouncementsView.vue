<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  approveAnnouncement,
  createAnnouncement,
  listAnnouncements,
  publishAnnouncement,
  submitAnnouncement,
  type Announcement,
} from './api';

const items = ref<readonly Announcement[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const showComposer = ref(false);
const titleAm = ref('');
const titleEn = ref('');
const body = ref('');
const recipientIds = ref('');
const locale = ref<'am' | 'en'>('am');
const priority = ref<'normal' | 'important' | 'urgent' | 'critical'>('normal');
const requiresAcknowledgement = ref(false);

const statusLabels: Record<Announcement['status'], string> = {
  draft: 'ረቂቅ · Draft',
  pending_approval: 'ፈቃድ በመጠባበቅ ላይ · Pending approval',
  approved: 'ጸድቋል · Approved',
  published: 'ታትሟል · Published',
  withdrawn: 'ተወግዷል · Withdrawn',
  archived: 'በማህደር · Archived',
};

const sortedItems = computed(() => items.value);

function titleOf(item: Announcement): string {
  if (typeof item.title === 'string') {
    try {
      const parsed = JSON.parse(item.title) as { am?: string; en?: string };
      return parsed.am || parsed.en || 'ያለ ርዕስ · Untitled';
    } catch {
      return item.title;
    }
  }
  return item.title.am || item.title.en || 'ያለ ርዕስ · Untitled';
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await listAnnouncements();
    items.value = result.items;
  } catch {
    error.value = 'ማስታወቂያዎችን ማምጣት አልተቻለም። ፈቃድዎን እና የድረ-ገጽ ግንኙነትዎን ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}

async function create(): Promise<void> {
  error.value = '';
  success.value = '';
  const ids = recipientIds.value.split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
  if (ids.length === 0 || ids.length !== recipientIds.value.split(',').filter((value) => value.trim()).length) {
    error.value = 'እባክዎ ትክክለኛ የተቀባዮች የተጠቃሚ መለያ ቁጥሮችን በኮማ ይለዩ።';
    return;
  }
  saving.value = true;
  try {
    await createAnnouncement({
      title: { ...(titleAm.value.trim() ? { am: titleAm.value.trim() } : {}), ...(titleEn.value.trim() ? { en: titleEn.value.trim() } : {}) },
      content: body.value.trim(),
      content_locale: locale.value,
      priority: priority.value,
      requires_acknowledgement: requiresAcknowledgement.value,
      recipient_ids: ids,
    });
    success.value = 'ማስታወቂያው እንደ ረቂቅ ተቀምጧል። ከማተምዎ በፊት የፈቃድ ሂደቱን ያጠናቅቁ።';
    showComposer.value = false;
    titleAm.value = '';
    titleEn.value = '';
    body.value = '';
    recipientIds.value = '';
    await load();
  } catch {
    error.value = 'ማስታወቂያውን ማስቀመጥ አልተቻለም። የannouncement.manage ፈቃድን እና የተቀባዮች አባልነትን ያረጋግጡ።';
  } finally {
    saving.value = false;
  }
}

async function transition(action: 'submit' | 'approve' | 'publish', item: Announcement): Promise<void> {
  error.value = '';
  success.value = '';
  try {
    if (action === 'submit') await submitAnnouncement(item.id);
    if (action === 'approve') await approveAnnouncement(item.id);
    if (action === 'publish') await publishAnnouncement(item.id);
    success.value = 'የማስታወቂያው ሁኔታ ተሻሽሏል።';
    await load();
  } catch {
    error.value = 'ይህን እርምጃ ማከናወን አልተቻለም። ፈቃድ፣ የማጽደቅ ቅደም ተከተል እና የራስ-ማጽደቅ ገደብ ይፈትሹ።';
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="communication-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">ARNA · COMMUNICATION HUB</p>
        <h1>ማስታወቂያዎች <span>Announcements</span></h1>
        <p class="intro">የድርጅቱ ይፋዊ ማሳወቂያዎች፣ መመሪያዎች እና የውስጥ ግንኙነቶች።</p>
      </div>
      <button class="primary" type="button" @click="showComposer = !showComposer">＋ አዲስ ማስታወቂያ</button>
    </header>

    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <p v-if="success" class="notice success" role="status">{{ success }}</p>

    <section v-if="showComposer" class="composer">
      <div class="section-heading">
        <div><h2>አዲስ ማስታወቂያ ይፍጠሩ</h2><p>New announcement · Saved as draft</p></div>
        <button class="quiet" type="button" @click="showComposer = false">✕</button>
      </div>
      <form @submit.prevent="create">
        <div class="field-grid">
          <label>ርዕስ · አማርኛ<input v-model="titleAm" maxlength="240" /></label>
          <label>Title · English<input v-model="titleEn" maxlength="240" /></label>
        </div>
        <label>ይዘት · Announcement body<textarea v-model="body" rows="6" required maxlength="100000" /></label>
        <div class="field-grid">
          <label>የይዘት ቋንቋ<select v-model="locale"><option value="am">አማርኛ</option><option value="en">English</option></select></label>
          <label>ቅድሚያ · Priority<select v-model="priority"><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option><option value="critical">Critical</option></select></label>
        </div>
        <label>የተቀባዮች የተጠቃሚ መለያዎች · comma-separated user IDs<input v-model="recipientIds" placeholder="e.g. 12, 18, 25" required /></label>
        <label class="check"><input v-model="requiresAcknowledgement" type="checkbox" /> ከተቀባዮች የንባብ/ተቀባይነት ማረጋገጫ ያስፈልጋል</label>
        <div class="form-actions"><button class="quiet" type="button" @click="showComposer = false">Cancel</button><button class="primary" type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save draft' }}</button></div>
      </form>
    </section>

    <section class="list-section">
      <div class="section-heading"><div><h2>የማስታወቂያ ማዕከል</h2><p>Announcement register · Tenant-scoped</p></div><button class="quiet" type="button" :disabled="loading" @click="load">↻ Refresh</button></div>
      <div v-if="loading" class="empty">በመጫን ላይ…</div>
      <div v-else-if="sortedItems.length === 0" class="empty">ምንም ማስታወቂያ የለም። · No announcements yet.</div>
      <article v-for="item in sortedItems" :key="item.id" class="announcement-card">
        <div class="card-top"><span class="status">{{ statusLabels[item.status] }}</span><span class="priority">{{ item.priority }}</span></div>
        <h3>{{ titleOf(item) }}</h3>
        <p class="body-preview">{{ item.content }}</p>
        <div class="card-bottom"><small>{{ item.reference || item.id.slice(0, 8) }}</small><div class="actions">
          <button v-if="item.status === 'draft'" class="quiet" type="button" @click="transition('submit', item)">Submit for approval</button>
          <button v-if="item.status === 'pending_approval'" class="quiet" type="button" @click="transition('approve', item)">Approve</button>
          <button v-if="item.status === 'approved'" class="primary small" type="button" @click="transition('publish', item)">Publish internally</button>
        </div></div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.communication-page{max-width:1120px;margin:0 auto;padding:clamp(20px,4vw,40px);color:var(--mases-text,#24243a)}
.page-header,.section-heading,.card-top,.card-bottom,.form-actions{display:flex;align-items:center;justify-content:space-between;gap:16px}
.page-header{margin-bottom:28px;align-items:flex-start}.eyebrow{font-size:11px;letter-spacing:.14em;color:var(--mases-primary,#244a78);font-weight:700}
h1{font-size:clamp(26px,4vw,36px);margin:8px 0}h1 span{font-size:.58em;color:var(--mases-muted,#747486);font-weight:500}.intro,.section-heading p{color:var(--mases-muted,#747486);margin:4px 0}
h2{font-size:19px;margin:0}.section-heading{margin-bottom:18px}
button{border:1px solid var(--mases-border,#dedee7);border-radius:9px;padding:10px 14px;background:transparent;color:inherit;cursor:pointer;font:inherit}
button:disabled{opacity:.55;cursor:not-allowed}.primary{background:var(--mases-primary,#244a78);border-color:var(--mases-primary,#244a78);color:white}.small{padding:7px 10px;font-size:13px}.quiet{background:transparent}
.composer,.list-section{background:var(--mases-surface,#fff);border:1px solid var(--mases-border,#e2e2e9);border-radius:14px;padding:22px;margin-bottom:22px}
form{display:grid;gap:15px}label{display:grid;gap:7px;font-size:13px;font-weight:600}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
input:not([type=checkbox]),textarea,select{width:100%;box-sizing:border-box;border:1px solid var(--mases-border,#d8d8e2);border-radius:8px;padding:11px 12px;background:var(--mases-canvas,#fff);color:inherit;font:inherit}
textarea{resize:vertical}.check{display:flex;align-items:center;gap:9px;font-weight:500}.form-actions{justify-content:flex-end}
.announcement-card{border:1px solid var(--mases-border,#e4e4eb);border-radius:11px;padding:17px;margin-top:12px}.status{font-size:12px;font-weight:700;color:var(--mases-primary,#244a78)}.priority{text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:var(--mases-muted,#777)}
h3{margin:13px 0 7px;font-size:17px}.body-preview{white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;color:var(--mases-muted,#666);font-size:14px}
.card-bottom{margin-top:14px;flex-wrap:wrap}.card-bottom small{color:var(--mases-muted,#777)}.actions{display:flex;gap:8px;flex-wrap:wrap}.empty{padding:32px;text-align:center;color:var(--mases-muted,#777)}
.notice{padding:12px 15px;border-radius:9px;margin:12px 0}.error{background:#fff0ef;color:#9d302b}.success{background:#edf7ef;color:#24653a}
@media(max-width:650px){.page-header{flex-direction:column}.field-grid{grid-template-columns:1fr}.composer,.list-section{padding:16px}.card-bottom{align-items:flex-start;flex-direction:column}}
</style>
