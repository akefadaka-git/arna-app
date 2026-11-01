<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getConversation, listConversationMessages, markConversationRead, sendConversationMessage, type CommunicationMessage } from './api';

const route = useRoute();
const router = useRouter();
const id = String(route.params.id);
const conversation = ref<{ id: string; type: string; title: string | null } | null>(null);
const messages = ref<readonly CommunicationMessage[]>([]);
const body = ref('');
const loading = ref(false);
const sending = ref(false);
const error = ref('');

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const detail = await getConversation(id);
    conversation.value = detail.conversation;
    await markConversationRead(id);
    const page = await listConversationMessages(id);
    messages.value = page.items;
  } catch {
    error.value = 'መልዕክቶችን ማምጣት አልተቻለም። ፈቃድዎን እና የውይይት አባልነትዎን ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}

async function send(): Promise<void> {
  if (!body.value.trim()) return;
  sending.value = true;
  error.value = '';
  try {
    await sendConversationMessage(id, { body: body.value.trim(), body_locale: 'am', idempotency_key: crypto.randomUUID() });
    body.value = '';
    await load();
  } catch {
    error.value = 'መልዕክቱን መላክ አልተቻለም። እንደገና ይሞክሩ።';
  } finally {
    sending.value = false;
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="conversation-detail">
    <header class="head"><button type="button" @click="router.push({ name: 'communication-conversations' })">← ውይይቶች</button><div><p class="eyebrow">ARNA · COMMUNICATION HUB</p><h1>{{ conversation?.title || 'ቀጥተኛ ውይይት · Conversation' }}</h1><small>{{ conversation?.type }}</small></div><button type="button" :disabled="loading" @click="load">↻</button></header>
    <p v-if="error" class="notice" role="alert">{{ error }}</p>
    <section class="thread" aria-live="polite">
      <p v-if="loading" class="empty">በመጫን ላይ…</p>
      <p v-else-if="messages.length === 0" class="empty">ገና መልዕክት የለም። · Start the conversation.</p>
      <article v-for="message in messages" :key="message.id" class="message">
        <p>{{ message.body }}</p><small>{{ new Date(message.created_at).toLocaleString() }} · {{ message.body_locale }} · Delivered {{ message.delivered_count ?? 0 }} · Read {{ message.read_count ?? 0 }}</small>
      </article>
    </section>
    <form class="composer" @submit.prevent="send">
      <label for="message-body">መልዕክት · Message</label>
      <textarea id="message-body" v-model="body" rows="3" maxlength="20000" placeholder="መልዕክትዎን ይጻፉ…" required />
      <button class="primary" type="submit" :disabled="sending || !body.trim()">{{ sending ? 'Sending…' : 'Send message' }}</button>
    </form>
  </main>
</template>

<style scoped>
.conversation-detail{max-width:900px;margin:0 auto;padding:clamp(18px,4vw,36px);color:var(--mases-text,#24243a)}.head{display:flex;align-items:center;gap:14px;margin-bottom:18px}.head div{flex:1}.eyebrow{font-size:11px;letter-spacing:.14em;color:var(--mases-primary,#244a78);font-weight:700;margin:0}h1{font-size:clamp(21px,3vw,30px);margin:5px 0}.head small,.message small{font-size:11px;color:var(--mases-muted,#777)}button{border:1px solid var(--mases-border,#ddd);border-radius:8px;padding:9px 12px;background:transparent;color:inherit;cursor:pointer;font:inherit}.thread{min-height:360px;max-height:62vh;overflow:auto;border:1px solid var(--mases-border,#ddd);border-radius:14px;padding:16px;background:var(--mases-surface,#fff)}.message{max-width:80%;padding:12px 14px;margin:10px 0;border-radius:12px;background:var(--mases-canvas,#f4f5f8)}.message p{white-space:pre-wrap;margin:0 0 7px}.empty{text-align:center;padding:40px;color:var(--mases-muted,#777);font-size:13px}.composer{display:grid;gap:10px;margin-top:14px}.composer label{font-size:13px;font-weight:600}textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid var(--mases-border,#ddd);border-radius:9px;background:var(--mases-surface,#fff);color:inherit;font:inherit;resize:vertical}.primary{justify-self:end;background:var(--mases-primary,#244a78);border-color:var(--mases-primary,#244a78);color:white}.notice{padding:12px;border-radius:8px;background:#fff0ef;color:#9d302b}
</style>
