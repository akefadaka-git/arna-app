<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '@/stores/locale';
import { useNotificationsStore } from '@/stores/notifications';
import type { MasesNotification } from '@/stores/notifications';
import { useTenantStore } from '@/stores/tenant';
import { formatCalendarDate } from '@/core/dates/calendar';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/api';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (event: 'close'): void }>();
const store = useNotificationsStore();
const localeStore = useLocaleStore();
const tenantStore = useTenantStore();
const router = useRouter();

const busyId = ref<string | null>(null);
const mutationBusy = ref(false);
const page = ref(1);
const total = ref(0);
const requestSequence = ref(0);
const destinationUnavailable = ref(false);
const closeButton = ref<HTMLButtonElement | null>(null);
const locale = computed(() => localeStore.locale);
const labels = computed(() => locale.value === 'am'
  ? {
      title: 'ማሳወቂያዎች',
      close: 'ዝጋ',
      markAll: 'ሁሉንም እንደተነበቡ ምልክት አድርግ',
      empty: 'አዲስ ማሳወቂያ የለም',
      loading: 'በመጫን ላይ…',
      retry: 'እንደገና ሞክር',
      unread: 'ያልተነበበ',
      previous: 'ቀዳሚ',
      next: 'ቀጣይ',
      error: 'ማሳወቂያዎችን ማምጣት አልተቻለም',
      destinationUnavailable: 'ይህ ማሳወቂያ በዚህ መተግበሪያ ውስጥ የሚከፈት መዳረሻ የለውም።',
    }
  : {
      title: 'Notifications',
      close: 'Close',
      markAll: 'Mark all as read',
      empty: 'You are all caught up',
      loading: 'Loading…',
      retry: 'Try again',
      unread: 'Unread',
      previous: 'Previous',
      next: 'Next',
      error: 'Could not load notifications',
      destinationUnavailable: 'This notification has no available destination in this application.',
    });

const PER_PAGE = 20;

/*
 * A notification may request navigation only to a known internal detail
 * route. The router must also contain the route in this application build.
 * resource_ref is data, never a URL and never spread into a route object.
 */
const NOTIFICATION_DETAIL_ROUTES = new Set([
  'file-detail',
  'shareholder-detail',
  'wallet-detail',
  'wallet-statement',
  'loan-detail',
  'loan-schedule',
  'loan-statement',
  'governance-body-detail',
  'portal-my-loan-detail',
]);

const NOTIFICATION_LIST_ROUTES = new Set([
  'admin-home',
  'admin-public-content',
  'admin-corporate-site',
  'admin-audit-security',
  'portal-home',
  'portal-my-holdings',
  'portal-my-certificates',
  'portal-my-wallet',
  'portal-my-loans',
  'dashboard',
  'launcher',
  'communications',
  'announcements',
  'files',
  'shareholders',
  'share-classes',
  'wallets',
  'loans',
  'loan-products',
  'people',
  'governance-overview',
  'governance-attendance',
  'governance-bodies',
]);

function resolveNotificationTarget(
  action: MasesNotification['action'],
): { name: string; params?: { id: string } } | null {
  if (!action || !router.hasRoute(action.route_name)) return null;
  if (NOTIFICATION_LIST_ROUTES.has(action.route_name)) return { name: action.route_name };
  if (!NOTIFICATION_DETAIL_ROUTES.has(action.route_name)) return null;

  const resource = action.resource_ref;
  if (resource === null || typeof resource !== 'object' || Array.isArray(resource)) return null;

  const rawId = (resource as Record<string, unknown>).id;
  if (typeof rawId !== 'string' && typeof rawId !== 'number') return null;

  const id = String(rawId);
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;

  return { name: action.route_name, params: { id } };
}

function formatDate(value: string): string {
  return formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

async function load(targetPage = 1): Promise<void> {
  const request = ++requestSequence.value;
  const tenantId = tenantStore.effectiveTenantId;
  store.beginFetch();

  try {
    const result = await fetchNotifications(targetPage, PER_PAGE, localeStore.locale);
    if (request !== requestSequence.value || tenantId !== tenantStore.effectiveTenantId) return;
    page.value = result.page;
    total.value = result.total;
    store.setNotifications(result.items, result.unreadCount);
  } catch (error) {
    if (request === requestSequence.value && tenantId === tenantStore.effectiveTenantId) {
      store.failFetch(error);
    }
  }
}

async function openNotification(id: string): Promise<void> {
  const item = store.notifications.find((notification) => notification.id === id);
  if (!item || busyId.value) return;

  const tenantId = tenantStore.effectiveTenantId;
  busyId.value = id;
  destinationUnavailable.value = false;

  try {
    if (!item.is_read) {
      const unread = await markNotificationRead(id);
      if (tenantId !== tenantStore.effectiveTenantId) return;
      store.applyReadState(id);
      store.setUnreadCount(unread);
    }

    if (item.action) {
      const target = resolveNotificationTarget(item.action);
      if (!target) {
        destinationUnavailable.value = true;
        return;
      }
      await router.push(target);
      emit('close');
    }
    // A notification without an action is still a useful inbox item. Keep
    // the center open after marking it read so the user can continue reading.
  } catch (error) {
    if (tenantId === tenantStore.effectiveTenantId) store.failFetch(error);
  } finally {
    busyId.value = null;
  }
}

async function markAll(): Promise<void> {
  if (mutationBusy.value || store.unreadCount === 0) return;
  const tenantId = tenantStore.effectiveTenantId;
  mutationBusy.value = true;

  try {
    const result = await markAllNotificationsRead();
    if (tenantId !== tenantStore.effectiveTenantId) return;
    store.applyAllRead();
    store.setUnreadCount(result.unread_count);
  } catch (error) {
    if (tenantId === tenantStore.effectiveTenantId) store.failFetch(error);
  } finally {
    mutationBusy.value = false;
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) emit('close');
}

watch(() => props.open, async (opened) => {
  if (!opened) {
    destinationUnavailable.value = false;
    return;
  }
  if (store.isStale || !store.hasFetched) void load(1);
  await nextTick();
  closeButton.value?.focus();
});

// A locale switch reloads the visible page using the new locale explicitly;
// this avoids depending on the timing of App.vue's document.lang watcher.
watch(() => localeStore.locale, (next, previous) => {
  if (props.open && next !== previous) void load(page.value);
});

// A tenant switch invalidates any in-flight result from the previous tenant.
watch(() => tenantStore.effectiveTenantId, () => {
  requestSequence.value += 1;
  page.value = 1;
  total.value = 0;
  destinationUnavailable.value = false;
  if (props.open) void load(1);
});

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  requestSequence.value += 1;
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <section
    v-if="open"
    id="notification-center"
    class="notification-center"
    role="dialog"
    aria-modal="false"
    aria-labelledby="notification-center-title"
    data-testid="notification-center"
  >
    <header class="notification-center__header">
      <div>
        <h2 id="notification-center-title">{{ labels.title }}</h2>
        <p v-if="store.unreadCount > 0" role="status" aria-live="polite">
          {{ store.unreadCount }} {{ labels.unread }}
        </p>
      </div>
      <div class="notification-center__actions">
        <button
          type="button"
          class="notification-center__text-button"
          :disabled="mutationBusy || store.unreadCount === 0"
          @click="markAll"
        >
          {{ labels.markAll }}
        </button>
        <button
          ref="closeButton"
          type="button"
          class="notification-center__close"
          :aria-label="labels.close"
          data-testid="notification-center-close"
          @click="emit('close')"
        >×</button>
      </div>
    </header>

    <p
      v-if="destinationUnavailable"
      class="notification-center__state notification-center__destination-warning"
      role="alert"
    >{{ labels.destinationUnavailable }}</p>

    <p
      v-if="store.isLoading && store.notifications.length === 0"
      class="notification-center__state"
      role="status"
      aria-live="polite"
    >{{ labels.loading }}</p>

    <div
      v-else-if="store.error && store.notifications.length === 0"
      class="notification-center__state"
      role="alert"
    >
      <p>{{ labels.error }}</p>
      <button type="button" class="notification-center__text-button" @click="load(1)">
        {{ labels.retry }}
      </button>
    </div>

    <template v-else>
      <p v-if="store.error" class="notification-center__state" role="alert">
        {{ labels.error }}
        <button type="button" class="notification-center__text-button" @click="load(page)">
          {{ labels.retry }}
        </button>
      </p>

      <ul v-if="store.notifications.length" class="notification-center__list">
        <li v-for="item in store.notifications" :key="item.id">
          <button
            type="button"
            class="notification-center__item"
            :class="{ 'is-unread': !item.is_read }"
            :disabled="busyId === item.id"
            :aria-busy="busyId === item.id ? 'true' : undefined"
            @click="openNotification(item.id)"
          >
            <span class="notification-center__item-heading">
              <span class="notification-center__item-title">{{ item.title }}</span>
              <span
                v-if="!item.is_read"
                class="notification-center__dot"
                role="img"
                :aria-label="labels.unread"
              ></span>
            </span>
            <span v-if="item.body" class="notification-center__body">{{ item.body }}</span>
            <span class="notification-center__meta">
              {{ item.category }} · {{ formatDate(item.created_at) }}
            </span>
          </button>
        </li>
      </ul>
      <p v-else class="notification-center__state">{{ labels.empty }}</p>
    </template>

    <footer v-if="total > PER_PAGE || page > 1" class="notification-center__footer">
      <button
        type="button"
        class="notification-center__text-button"
        :disabled="page <= 1 || store.isLoading"
        @click="load(page - 1)"
      >{{ labels.previous }}</button>
      <span aria-live="polite">{{ page }} / {{ Math.max(1, Math.ceil(total / PER_PAGE)) }}</span>
      <button
        type="button"
        class="notification-center__text-button"
        :disabled="page * PER_PAGE >= total || store.isLoading"
        @click="load(page + 1)"
      >{{ labels.next }}</button>
    </footer>
  </section>
</template>

<style scoped>
.notification-center {
  position: fixed;
  z-index: var(--arna-z-popover);
  inset-block-start: calc(var(--mases-shell-header-height, 4rem) + 0.5rem);
  inset-inline-end: clamp(0.75rem, 2vw, 2rem);
  display: flex;
  flex-direction: column;
  width: min(28rem, calc(100vw - 1.5rem));
  max-height: min(42rem, calc(100dvh - var(--mases-shell-header-height, 4rem) - 1.5rem));
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
.notification-center__list { flex: 1 1 auto; min-height: 0; overflow: auto; margin: 0; padding: 0; list-style: none; }
.notification-center__list li + li { border-block-start: 1px solid var(--mases-color-border-subtle); }
.notification-center__item { display: flex; flex-direction: column; gap: 0.35rem; width: 100%; padding: 0.9rem 1rem; color: inherit; text-align: start; background: transparent; border: 0; cursor: pointer; }
.notification-center__item:hover { background: var(--mases-color-surface-hover); }
.notification-center__item.is-unread { background: var(--mases-color-surface-subtle); }
.notification-center__item-heading { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-weight: 650; }
.notification-center__body, .notification-center__meta { color: var(--mases-color-text-secondary); font-size: 0.85rem; }
.notification-center__dot { width: 0.5rem; height: 0.5rem; flex: 0 0 auto; border-radius: 50%; background: var(--mases-color-action-primary); }
.notification-center__state { padding: 2rem 1rem; text-align: center; color: var(--mases-color-text-secondary); }
.notification-center__destination-warning { padding-block: 0.75rem; }
.notification-center__footer { border-block-start: 1px solid var(--mases-color-border-subtle); border-block-end: 0; }
.notification-center button:focus-visible { outline: 3px solid var(--mases-color-state-focus-ring); outline-offset: 2px; }
@media (forced-colors: active) {
  .notification-center { border: 1px solid CanvasText; background: Canvas; color: CanvasText; }
  .notification-center__dot { background: Highlight; }
}
</style>
