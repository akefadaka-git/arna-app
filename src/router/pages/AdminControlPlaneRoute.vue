<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/core/api/client';

type Row = Record<string, unknown>;
interface PageResult<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
type Section = 'users' | 'roles' | 'permissions' | 'tenants';

const route = useRoute();
const authStore = useAuthStore();
const rows = ref<Row[]>([]);
const loading = ref(false);
const errorMessage = ref('');
const page = ref(1);
const total = ref(0);
const search = ref('');

const section = computed<Section>(() => {
  switch (route.name) {
    case 'admin-identity-users': return 'users';
    case 'admin-rbac-roles': return 'roles';
    case 'admin-rbac-permissions': return 'permissions';
    default: return 'tenants';
  }
});

const labels = computed(() => {
  const am = typeof document !== 'undefined' && document.documentElement.lang.startsWith('am');
  return {
    title: am ? 'ማዕከላዊ አስተዳደር' : 'Central administration',
    users: am ? 'የተጠቃሚ መለያዎች' : 'Identity directory',
    roles: am ? 'ሚናዎች' : 'Roles',
    permissions: am ? 'ፈቃዶች' : 'Permissions',
    tenants: am ? 'ቴናንቶች' : 'Tenants',
    search: am ? 'ፈልግ' : 'Search',
    refresh: am ? 'አድስ' : 'Refresh',
    loading: am ? 'በመጫን ላይ…' : 'Loading…',
    empty: am ? 'ምንም መዝገብ አልተገኘም' : 'No records found',
    total: am ? 'ጠቅላላ መዝገቦች' : 'Total records',
    previous: am ? 'ቀዳሚ' : 'Previous',
    next: am ? 'ቀጣይ' : 'Next',
    denied: am ? 'ይህን መረጃ ለማየት ፈቃድ የለዎትም።' : 'You are not authorized to view this information.',
  };
});

const title = computed(() => ({
  users: labels.value.users,
  roles: labels.value.roles,
  permissions: labels.value.permissions,
  tenants: labels.value.tenants,
}[section.value]));

const endpoint = computed(() => ({
  users: '/api/admin/identity/users',
  roles: '/api/admin/rbac/roles',
  permissions: '/api/admin/rbac/permissions',
  tenants: '/api/admin/tenants',
}[section.value]));

const columns = computed(() => rows.value.length ? Object.keys(rows.value[0]) : []);

function display(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';
  try {
    const result = await api.get<PageResult<Row>>(endpoint.value, {
      params: { page: page.value, per_page: 25, search: search.value || undefined },
    });
    rows.value = result.data ?? [];
    total.value = result.total ?? rows.value.length;
  } catch (error) {
    rows.value = [];
    errorMessage.value = error instanceof Error ? error.message : labels.value.denied;
  } finally {
    loading.value = false;
  }
}

function submitSearch(): void {
  page.value = 1;
  void load();
}

onMounted(() => { void load(); });
watch(section, () => { page.value = 1; search.value = ''; void load(); });
</script>

<template>
  <main class="admin-control-plane" aria-labelledby="control-plane-title">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ labels.title }}</p>
        <h1 id="control-plane-title">{{ title }}</h1>
      </div>
      <form class="search-form" @submit.prevent="submitSearch">
        <label class="sr-only" for="admin-control-search">{{ labels.search }}</label>
        <input id="admin-control-search" v-model="search" type="search" :placeholder="labels.search" />
        <button type="submit">{{ labels.search }}</button>
        <button type="button" class="secondary" :disabled="loading" @click="load">{{ labels.refresh }}</button>
      </form>
    </header>

    <nav class="section-nav" aria-label="Administration sections">
      <RouterLink v-if="authStore.hasPermission('platform.identity.read') && $route.name !== 'admin-identity-users'" to="/admin/identity/users">{{ labels.users }}</RouterLink>
      <RouterLink v-if="authStore.hasPermission('platform.rbac.read') && $route.name !== 'admin-rbac-roles'" to="/admin/rbac/roles">{{ labels.roles }}</RouterLink>
      <RouterLink v-if="authStore.hasPermission('platform.rbac.read') && $route.name !== 'admin-rbac-permissions'" to="/admin/rbac/permissions">{{ labels.permissions }}</RouterLink>
      <RouterLink v-if="authStore.hasPermission('platform.tenancy.read') && $route.name !== 'admin-tenants'" to="/admin/tenants">{{ labels.tenants }}</RouterLink>
    </nav>

    <p class="result-count">{{ labels.total }}: {{ total }}</p>
    <p v-if="loading" role="status">{{ labels.loading }}</p>
    <p v-else-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
    <p v-else-if="rows.length === 0" class="empty-state">{{ labels.empty }}</p>
    <div v-else class="table-scroll">
      <table>
        <thead><tr><th v-for="column in columns" :key="column" scope="col">{{ column }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="String(row.id ?? row.slug ?? index)">
            <td v-for="column in columns" :key="column">{{ display(row[column]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style scoped>
.admin-control-plane { display: grid; gap: 1.25rem; min-width: 0; }
.page-header { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1rem; }
.eyebrow { margin: 0 0 .25rem; color: var(--color-text-muted, #667085); font-size: .875rem; }
h1 { margin: 0; font-size: clamp(1.35rem, 3vw, 1.8rem); }
.search-form { display: flex; flex-wrap: wrap; gap: .5rem; }
input, button { min-height: 2.5rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .5rem; padding: .5rem .75rem; font: inherit; }
input { min-width: min(16rem, 70vw); background: var(--color-surface, #fff); color: inherit; }
button { cursor: pointer; background: var(--color-primary, #344054); color: white; }
button.secondary { background: transparent; color: inherit; }
button:disabled { cursor: wait; opacity: .6; }
.section-nav { display: flex; flex-wrap: wrap; gap: .75rem; }
.section-nav a { color: var(--color-primary, #344054); text-underline-offset: .2em; }
.result-count { margin: 0; color: var(--color-text-muted, #667085); font-size: .9rem; }
.table-scroll { overflow-x: auto; border: 1px solid var(--color-border, #d0d5dd); border-radius: .75rem; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .75rem; border-bottom: 1px solid var(--color-border, #eaecf0); vertical-align: top; text-align: start; }
th { background: var(--color-surface-subtle, #f9fafb); font-size: .8rem; text-transform: uppercase; letter-spacing: .03em; }
td { overflow-wrap: anywhere; }
.error-message { color: var(--color-danger, #b42318); }
.empty-state { padding: 2rem; text-align: center; color: var(--color-text-muted, #667085); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 640px) { .search-form { width: 100%; } .search-form input { flex: 1; min-width: 0; } }
</style>
