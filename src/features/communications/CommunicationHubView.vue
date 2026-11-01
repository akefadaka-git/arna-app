<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { listNotifications, markAllNotificationsRead, markNotificationRead, type CommunicationNotification } from './api';

const router = useRouter();
const items = ref<readonly CommunicationNotification[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
const error = ref('');

function localized(value: string | { am?: string; en?: string } | null): string {
  if (value === null) return '';
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value) as { am?: string; en?: string }; return parsed.am || parsed.en || value; }
    catch { return value; }
  }
  return value.am || value.en || '';
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await listNotifications();
    items.value = result.items;
    unreadCount.value = result.unread_count;
  } catch {
    error.value = 'ማሳወቂያዎችን ማምጣት አልተቻለም።';
  } finally {
    loading.value = false;
  }
}

async function markRead(item: CommunicationNotification): Promise<void> {
  if (item.is_read) return;
  try {
    await markNotificationRead(item.id);
    await load();
  } catch {
    error.value = 'ማሳወቂያውን እንደተነበበ ማድረግ አልተቻለም።';
  }
}

async function markAllRead(): Promise<void> {
  try {
    await markAllNotificationsRead();
    await load();
  } catch {
    error.value = 'ሁሉንም ማሳወቂያዎች እንደተነበቡ ማድረግ አልተቻለም።';
  }
}

onMounted(() => { void load(); });
</script>

<template>
  <main class="hub">
    <header class="hero">
      <div><p class="eyebrow">ARNA PLATFORM SERVICE</p><h1>የግንኙነት ማዕከል <span>Communication Hub</span></h1><p>የድርጅቱ ውስጣዊ ማሳወቂያዎችን እና ይፋዊ ማስታወቂያዎችን በአንድ ቦታ ይቆጣጠሩ።</p></div>
      <div class="count"><strong>{{ unreadCount }}</strong><span>Unread</span></div>
    </header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <section class="tiles">
      <button class="tile active" type="button" @click="load"><span class="tile-icon">▤</span><strong>የገቢ ሳጥን · Inbox</strong><small>Central platform notifications</small></button>
      <button class="tile" type="button" @click="router.push({ name: 'announcements' })"><span class="tile-icon">◈</span><strong>ማስታወቂያዎች · Announcements</strong><small>Official notices and approval workflow</small></button>
    </section>
    <section class="inbox">
      <div class="section-head"><div><h2>የቅርብ ጊዜ ማሳወቂያዎች</h2><p>Latest notifications · {{ unreadCount }} unread</p></div><div><button type="button" @click="load" :disabled="loading">↻</button><button type="button" @click="markAllRead" :disabled="loading || unreadCount === 0">Mark all read</button></div></div>
      <p v-if="loading" class="empty">በመጫን ላይ…</p>
      <p v-else-if="items.length === 0" class="empty">ምንም አዲስ ማሳወቂያ የለም። · Your inbox is clear.</p>
      <article v-for="item in items" :key="item.id" class="notification" :class="{ unread: !item.is_read }">
        <span class="dot" :class="{ visible: !item.is_read }"></span>
        <div class="notification-copy"><strong>{{ localized(item.title) }}</strong><p>{{ localized(item.body) }}</p><small>{{ item.category }} · {{ new Date(item.created_at).toLocaleString() }}</small></div>
        <button v-if="!item.is_read" type="button" @click="markRead(item)">Mark read</button>
      </article>
    </section>
  </main>
</template>

<style scoped>
.hub{max-width:1120px;margin:0 auto;padding:clamp(20px,4vw,40px);color:var(--mases-text,#24243a)}.hero{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:26px}.eyebrow{font-size:11px;letter-spacing:.14em;font-weight:700;color:var(--mases-primary,#244a78)}h1{font-size:clamp(26px,4vw,36px);margin:8px 0}h1 span{font-size:.58em;font-weight:500;color:var(--mases-muted,#777)}.hero p:not(.eyebrow){color:var(--mases-muted,#777)}.count{min-width:90px;padding:15px;border:1px solid var(--mases-border,#ddd);border-radius:12px;text-align:center;display:grid}.count strong{font-size:26px}.count span,small{font-size:12px;color:var(--mases-muted,#777)}.tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:22px}.tile{display:grid;gap:7px;text-align:left;padding:20px;border:1px solid var(--mases-border,#ddd);border-radius:13px;background:var(--mases-surface,#fff);color:inherit;cursor:pointer}.tile.active{border-color:var(--mases-primary,#244a78)}.tile-icon{font-size:24px;color:var(--mases-primary,#244a78)}.tile small{font-size:12px}.inbox{border:1px solid var(--mases-border,#ddd);border-radius:14px;padding:20px;background:var(--mases-surface,#fff)}.section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.section-head h2{margin:0;font-size:19px}.section-head p{margin:4px 0;color:var(--mases-muted,#777);font-size:13px}.section-head button,.notification button{border:1px solid var(--mases-border,#ddd);background:transparent;border-radius:8px;padding:8px 10px;margin-left:6px;color:inherit;cursor:pointer}.notification{display:flex;align-items:flex-start;gap:12px;padding:15px 5px;border-top:1px solid var(--mases-border,#eee)}.notification.unread{background:color-mix(in srgb,var(--mases-primary,#244a78) 4%,transparent)}.dot{width:8px;height:8px;border-radius:50%;margin-top:7px;flex:none}.dot.visible{background:var(--mases-primary,#244a78)}.notification-copy{flex:1;min-width:0}.notification-copy p{margin:5px 0;white-space:pre-wrap;color:var(--mases-muted,#666);font-size:14px}.notification-copy small{text-transform:capitalize}.empty{text-align:center;padding:28px;color:var(--mases-muted,#777)}.error{color:#9d302b;background:#fff0ef;padding:12px;border-radius:8px}@media(max-width:650px){.hero{align-items:flex-start}.tiles{grid-template-columns:1fr}.inbox{padding:14px}.section-head{align-items:flex-start;flex-direction:column}}
</style>
