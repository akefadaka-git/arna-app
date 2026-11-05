<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createConversation, listConversations, type CommunicationConversation } from './api';

const router = useRouter();
const items = ref<readonly CommunicationConversation[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const showCreate = ref(false);
const kind = ref<'direct' | 'group' | 'department'>('direct');
const title = ref('');
const participantIds = ref('');

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await listConversations();
    items.value = result.items;
  } catch {
    error.value = 'ውይይቶችን ማምጣት አልተቻለም። · Unable to load conversations.';
  } finally {
    loading.value = false;
  }
}

async function create(): Promise<void> {
  error.value = '';
  const raw = participantIds.value.split(',').map((value) => value.trim()).filter(Boolean);
  const ids = raw.map(Number);
  if (ids.length === 0 || ids.some((id) => !Number.isInteger(id) || id <= 0) || new Set(ids).size !== ids.length) {
    error.value = 'እባክዎ ትክክለኛ እና የተለያዩ የተጠቃሚ መለያዎችን ያስገቡ።';
    return;
  }
  if (kind.value !== 'direct' && !title.value.trim()) {
    error.value = 'የቡድኑን ስም ያስገቡ።';
    return;
  }
  saving.value = true;
  try {
    const result = await createConversation({ type: kind.value, title: title.value.trim() || null, participant_ids: ids });
    await router.push({ name: 'communication-conversation', params: { id: result.id } });
  } catch {
    error.value = 'ውይይቱን መፍጠር አልተቻለም። የተሳታፊዎችን የቴናንት አባልነት እና ፈቃድ ያረጋግጡ።';
  } finally {
    saving.value = false;
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="communications-list">
    <header class="page-head">
      <div><p class="eyebrow">ARNA · COMMUNICATION HUB</p><h1>ውይይቶች <span>Conversations</span></h1><p>ቀጥተኛ እና የቡድን መልዕክቶች</p></div>
      <button class="primary" type="button" @click="showCreate = !showCreate">＋ አዲስ ውይይት</button>
    </header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <section v-if="showCreate" class="panel">
      <h2>ውይይት ይፍጠሩ · New conversation</h2>
      <form @submit.prevent="create">
        <label>ዓይነት · Type
          <select v-model="kind"><option value="direct">ቀጥተኛ · Direct</option><option value="group">ቡድን · Group</option><option value="department">ክፍል · Department</option></select>
        </label>
        <label v-if="kind !== 'direct'">የቡድን ስም · Group name<input v-model="title" maxlength="180" required /></label>
        <label>የተሳታፊ የተጠቃሚ መለያዎች · Participant user IDs<input v-model="participantIds" placeholder="e.g. 12, 18" required /></label>
        <p class="hint">Enter active user IDs from the current tenant. Department directory selection will be added with the Organization integration.</p>
        <div class="actions"><button type="button" @click="showCreate = false">Cancel</button><button class="primary" type="submit" :disabled="saving">{{ saving ? 'Creating…' : 'Create conversation' }}</button></div>
      </form>
    </section>
    <section class="panel">
      <div class="panel-head"><div><h2>የቅርብ ጊዜ ውይይቶች</h2><p>Recent conversations</p></div><button type="button" :disabled="loading" @click="load">↻ Refresh</button></div>
      <p v-if="loading" class="empty">በመጫን ላይ…</p>
      <p v-else-if="items.length === 0" class="empty">ገና ውይይት የለም። · No conversations yet.</p>
      <button v-for="item in items" :key="item.id" class="conversation-row" type="button" @click="router.push({ name: 'communication-conversation', params: { id: item.id } })">
        <span class="avatar">{{ item.type === 'direct' ? '◉' : '◈' }}</span>
        <span class="copy"><strong>{{ item.title || (item.type === 'direct' ? 'ቀጥተኛ ውይይት · Direct conversation' : 'የቡድን ውይይት · Group conversation') }}</strong><small>{{ item.type }} · {{ new Date(item.updated_at).toLocaleString() }}</small></span>
        <span aria-hidden="true">›</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.communications-list{max-width:1000px;margin:0 auto;padding:clamp(20px,4vw,40px);color:var(--mases-text,#24243a)}.page-head,.panel-head,.actions{display:flex;justify-content:space-between;align-items:center;gap:14px}.page-head{align-items:flex-start;margin-bottom:22px}.eyebrow{font-size:11px;letter-spacing:.14em;color:var(--mases-primary,#244a78);font-weight:700}h1{font-size:clamp(25px,4vw,34px);margin:8px 0}h1 span{font-size:.58em;font-weight:500;color:var(--mases-muted,#777)}h2{font-size:18px;margin:0}.panel{border:1px solid var(--mases-border,#ddd);border-radius:14px;background:var(--mases-surface,#fff);padding:20px;margin-bottom:18px}.panel-head{margin-bottom:12px}.panel-head p,.hint{font-size:13px;color:var(--mases-muted,#777)}form{display:grid;gap:13px}label{display:grid;gap:7px;font-size:13px;font-weight:600}input,select{width:100%;box-sizing:border-box;padding:11px;border:1px solid var(--mases-border,#ddd);border-radius:8px;background:var(--mases-canvas,#fff);color:inherit;font:inherit}button{border:1px solid var(--mases-border,#ddd);border-radius:8px;padding:9px 13px;background:transparent;color:inherit;cursor:pointer;font:inherit}.primary{background:var(--mases-primary,#244a78);color:#fff;border-color:var(--mases-primary,#244a78)}button:disabled{opacity:.5}.conversation-row{display:flex;width:100%;align-items:center;gap:13px;text-align:left;border:0;border-top:1px solid var(--mases-border,#eee);border-radius:0;padding:15px 4px}.avatar{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:var(--mases-canvas,#f1f3f6);color:var(--mases-primary,#244a78);font-size:20px}.copy{display:grid;gap:4px;flex:1}.copy small,.empty{font-size:12px;color:var(--mases-muted,#777)}.empty{text-align:center;padding:28px}.notice{padding:12px;border-radius:8px}.error{background:#fff0ef;color:#9d302b}.hint{margin:0}.actions{justify-content:flex-end}@media(max-width:600px){.page-head{flex-direction:column}.panel{padding:15px}}
</style>
