<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import { formatCalendarDate } from '@/core/dates/calendar';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/api';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (event: 'close'): void }>();
const store = useNotificationsStore();
const busyId = ref<string | null>(null);
const mutationBusy = ref(false);
const page = ref(1);
const locale = computed(() => document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'am');
const labels = computed(() => locale.value === 'am'
  ? { title: 'ማሳወቂያዎች', close: 'ዝጋ', markAll: 'ሁሉንም እንደተነበቡ ምልክት አድርግ', empty: 'አዲስ ማሳወቂያ የለም', loading: 'በመጫን ላይ…', retry: 'እንደገና ሞክር', unread: 'ያልተነበበ', previous: 'ቀዳሚ', next: 'ቀጣይ', error: 'ማሳወቂያዎችን ማምጣት አልተቻለም' }
  : { title: 'Notifications', close: 'Close', markAll: 'Mark all as read', empty: 'You are all caught up', loading: 'Loading…', retry: 'Try again', unread: 'Unread', previous: 'Previous', next: 'Next', error: 'Could not load notifications' });

function formatDate(value: string): string {
  return formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

async function load(targetPage = 1): Promise<void> {
  store.beginFetch();
  try {
    const result = await fetchNotifications(targetPage);
    page.value = result.page;
    store.setNotifications(result.items, result.unreadCount);
  } catch (error) {
    store.failFetch(error);
  }
}

async function openNotification(id: string): Promise<void> {
  const item = store.notifications.find((notification) => notification.id === id);
  if (!item || item.is_read || busyId.value) return;
  busyId.value = id;
  try {
    const unread = await markNotificationRead(id);
    store.applyReadState(id);
    store.setUnreadCount(unread);
  } catch (error) {
    store.failFetch(error);
  } finally {
    busyId.value = null;
  }
}

async function markAll(): Promise<void> {
  if (mutationBusy.value || store.unreadCount === 0) return;
  mutationBusy.value = true;
  try {
    const result = await markAllNotificationsRead();
    store.applyAllRead();
    store.setUnreadCount(result.unread_count);
  } catch (error) {
    store.failFetch(error);
  } finally {
    mutationBusy.value = false;
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) emit('close');
}

watch(() => props.open, (opened) => {
  if (opened && (store.isStale || !store.hasFetched)) void load(1);
});
onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <section v-if="open" class="notification-center" role="dialog" aria-modal="false" :aria-label="labels.title">
    <header class="notification-center__header">
      <div>
        <h2>{{ labels.title }}</h2>
        <p v-if="store.unreadCount > 0">{{ store.unreadCount }} {{ labels.unread }}</p>
      </div>
      <div class="notification-center__actions">
        <button type="button" class="notification-center__text-button" :disabled="mutationBusy || store.unreadCount === 0" @click="markAll">
          {{ labels.markAll }}
        </button>
        <button type="button" class="notification-center__close" :aria-label="labels.close" @click="emit('close')">×</button>
      </div>
    </header>

    <p v-if="store.isLoading && store.notifications.length === 0" class="notification-center__state" role="status">{{ labels.loading }}</p>
    <div v-else-if="store.error && store.notifications.length === 0" class="notification-center__state" role="alert">
      <p>{{ labels.error }}</p>
      <button type="button" class="notification-center__text-button" @click="load(1)">{{ labels.retry }}</button>
    </div>
    <ul v-else-if="store.notifications.length" class="notification-center__list">
      <li v-for="item in store.notifications" :key="item.id">
        <button type="button" class="notification-center__item" :class="{ 'is-unread': !item.is_read }" :disabled="busyId === item.id" @click="openNotification(item.id)">
          <span class="notification-center__item-heading">
            <span class="notification-center__item-title">{{ item.title }}</span>
            <span v-if="!item.is_read" class="notification-center__dot" :aria-label="labels.unread"></span>
          </span>
          <span v-if="item.body" class="notification-center__body">{{ item.body }}</span>
          <span class="notification-center__meta">{{ item.category }} · {{ formatDate(item.created_at) }}</span>
        </button>
      </li>
    </ul>
    <p v-else class="notification-center__state">{{ labels.empty }}</p>

    <footer v-if="store.notifications.length" class="notification-center__footer">
      <button type="button" class="notification-center__text-button" :disabled="page <= 1 || store.isLoading" @click="load(page - 1)">{{ labels.previous }}</button>
      <button type="button" class="notification-center__text-button" :disabled="store.notifications.length < 20 || store.isLoading" @click="load(page + 1)">{{ labels.next }}</button>
    </footer>
  </section>
</template>

<style scoped>
.notification-center {
  position: fixed;
  z-index: 1200;
  inset-block-start: calc(var(--mases-shell-header-height) + 0.5rem);
  inset-inline-end: clamp(0.75rem, 2vw, 2rem);
  display: flex;
  flex-direction: column;
  width: min(28rem, calc(100vw - 1.5rem));
  max-height: min(42rem, calc(100dvh - var(--mases-shell-header-height) - 1.5rem));
  overflow: hidden;
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface-raised);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  box-shadow: var(--mases-shadow-lg, 0 16px 48px rgb(0 0 0 / 18%));
}
.notification-center__header, .notification-center__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border-block-end: 1px solid var(--mases-color-border-subtle);
}
.notification-center__header h2 { margin: 0; font-size: 1rem; font-weight: 700; }
.notification-center__header p { margin: 0.25rem 0 0; color: var(--mases-color-text-secondary); font-size: 0.8rem; }
.notification-center__actions { display: flex; align-items: center; gap: 0.5rem; }
.notification-center__text-button, .notification-center__close {
  color: var(--mases-color-action-primary);
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
}
.notification-center__text-button:disabled { opacity: 0.45; cursor: not-allowed; }
.notification-center__close { width: 2rem; height: 2rem; border-radius: 0.4rem; font-size: 1.5rem; }
.notification-center__close:hover { background: var(--mases-color-surface-hover); }
.notification-center__list { overflow: auto; margin: 0; padding: 0; list-style: none; }
.notification-center__list li + li { border-block-start: 1px solid var(--mases-color-border-subtle); }
.notification-center__item { display: flex; flex-direction: column; gap: 0.35rem; width: 100%; padding: 0.9rem 1rem; color: inherit; text-align: start; background: transparent; border: 0; cursor: pointer; }
.notification-center__item:hover { background: var(--mases-color-surface-hover); }
.notification-center__item.is-unread { background: var(--mases-color-surface-subtle); }
.notification-center__item-heading { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-weight: 650; }
.notification-center__body, .notification-center__meta { color: var(--mases-color-text-secondary); font-size: 0.85rem; }
.notification-center__dot { width: 0.5rem; height: 0.5rem; flex: 0 0 auto; border-radius: 50%; background: var(--mases-color-action-primary); }
.notification-center__state { padding: 2rem 1rem; text-align: center; color: var(--mases-color-text-secondary); }
.notification-center__footer { border-block-start: 1px solid var(--mases-color-border-subtle); border-block-end: 0; }
.notification-center button:focus-visible { outline: 3px solid var(--mases-color-state-focus-ring); outline-offset: 2px; }
@media (forced-colors: active) {
  .notification-center { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }
  .notification-center__dot { background: Highlight; }
}
</style>
