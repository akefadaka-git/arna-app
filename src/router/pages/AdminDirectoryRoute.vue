<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '@/core/api/client';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

type Resource = 'users' | 'roles' | 'permissions' | 'tenants';
interface DirectoryRow {
  readonly id: number;
  readonly name?: string;
  readonly slug?: string;
  readonly email?: string;
  readonly username?: string | null;
  readonly locale?: string | null;
  readonly domain?: string | null;
  readonly scope?: string | null;
  readonly category?: string | null;
  readonly is_active?: boolean;
  readonly is_system?: boolean;
  readonly tenant_id?: number | null;
  readonly application_id?: number | null;
  readonly active_memberships_count?: number;
  readonly last_login_at?: string | null;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly tenants?: readonly { readonly id: number; readonly slug: string; readonly name: string }[];
}
interface Page<T> {
  readonly data: readonly T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

const route = useRoute();
const rows = ref<readonly DirectoryRow[]>([]);
const search = ref('');
const loading = ref(false);
const error = ref('');
const total = ref(0);

const resource = computed<Resource>(() => {
  const name = String(route.name ?? '');
  if (name === 'admin-users') return 'users';
  if (name === 'admin-roles') return 'roles';
  if (name === 'admin-permissions') return 'permissions';
  return 'tenants';
});

const labels: Record<Resource, { title: string; description: string; empty: string; endpoint: string }> = {
  users: {
    title: 'የመድረክ ተጠቃሚ መለያዎች',
    description: 'በARNA ውስጥ የተመዘገቡ የተጠቃሚ መለያዎችን ይመልከቱ።',
    empty: 'የተጠቃሚ መለያ አልተገኘም።',
    endpoint: '/api/admin/platform/identity/users',
  },
  roles: {
    title: 'የመድረክ ሚናዎች',
    description: 'የመድረክ፣ የቴናንትና የመተግበሪያ ሚና መዝገብ።',
    empty: 'ሚና አልተገኘም።',
    endpoint: '/api/admin/platform/rbac/roles',
  },
  permissions: {
    title: 'የመድረክ ፈቃዶች',
    description: 'የፈቃድ መለያዎችን፣ ምድቦችንና ወሰኖችን ይመልከቱ።',
    empty: 'ፈቃድ አልተገኘም።',
    endpoint: '/api/admin/platform/rbac/permissions',
  },
  tenants: {
    title: 'የመድረክ ቴናንቶች',
    description: 'የተመዘገቡ ድርጅታዊ ቴናንቶችንና ንቁ አባልነቶችን ይመልከቱ።',
    empty: 'ቴናንት አልተገኘም።',
    endpoint: '/api/admin/platform/tenants',
  },
};

const current = computed(() => labels[resource.value]);

const columns = computed(() => {
  switch (resource.value) {
    case 'users':
      return [
        { key: 'email', label: 'ኢሜይል' },
        { key: 'username', label: 'የተጠቃሚ ስም' },
        { key: 'roles', label: 'ሚናዎች' },
        { key: 'tenants', label: 'ቴናንቶች' },
        { key: 'last_login_at', label: 'የመጨረሻ መግቢያ' },
      ] as const;
    case 'roles':
      return [
        { key: 'scope', label: 'ወሰን' },
        { key: 'tenant_id', label: 'Tenant ID' },
        { key: 'application_id', label: 'Application ID' },
        { key: 'is_active', label: 'ሁኔታ' },
        { key: 'permissions', label: 'ፈቃዶች' },
      ] as const;
    case 'permissions':
      return [
        { key: 'category', label: 'ምድብ' },
        { key: 'scope', label: 'ወሰን' },
        { key: 'tenant_id', label: 'Tenant ID' },
        { key: 'application_id', label: 'Application ID' },
        { key: 'is_active', label: 'ሁኔታ' },
        { key: 'is_system', label: 'የስርዓት ፈቃድ' },
      ] as const;
    case 'tenants':
      return [
        { key: 'domain', label: 'ዶሜይን' },
        { key: 'is_active', label: 'ሁኔታ' },
        { key: 'active_memberships_count', label: 'ንቁ አባላት' },
      ] as const;
  }
});

function primaryName(row: DirectoryRow): string {
  return row.name || row.email || row.slug || '#' + row.id;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'ንቁ / Yes' : 'የቦዘነ / No';
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && 'name' in item) return String(item.name);
      return JSON.stringify(item);
    }).join(', ') || '—';
  }
  return String(value);
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await api.get<Page<DirectoryRow>>(current.value.endpoint, {
      params: { search: search.value.trim() || undefined, per_page: 50 },
    });
    rows.value = result.data;
    total.value = result.total;
  } catch {
    error.value = 'መረጃውን ማምጣት አልተቻለም። የplatform-level read permission እና API ግንኙነት ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}

watch(resource, () => {
  search.value = '';
  void load();
});
onMounted(() => { void load(); });
</script>

<template>
  <main class="admin-directory-page">
    <PageHeader :title="current.title" :description="current.description" />
    <Card>
      <div class="directory-toolbar">
        <form class="directory-search" @submit.prevent="load">
          <label>
            <span>ፈልግ (Search)</span>
            <input v-model="search" type="search" autocomplete="off" />
          </label>
          <button type="submit" :disabled="loading">{{ loading ? '…' : 'ፈልግ' }}</button>
        </form>
        <p>{{ total }} መዝገቦች</p>
      </div>
      <p class="directory-note">ይህ ገጽ የመድረክ ደረጃ የንባብ እይታ ነው። የሚና፣ የአባልነት ወይም የፈቃድ ለውጦች በተለየ የapproval ሂደት ብቻ ይፈጸማሉ።</p>
      <p v-if="error" role="alert" class="directory-error">{{ error }}</p>
      <p v-else-if="loading" role="status">መረጃ በመጫን ላይ…</p>
      <p v-else-if="rows.length === 0" class="directory-empty">{{ current.empty }}</p>
      <div v-else class="directory-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">ስም / መለያ</th>
              <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
              <th v-if="resource === 'tenants'" scope="col">አባላት</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><strong>{{ primaryName(row) }}</strong><small>#{{ row.id }} · {{ row.slug ?? '' }}</small></td>
              <td v-for="column in columns" :key="column.key">{{ displayValue(row[column.key]) }}</td>
              <td v-if="resource === 'tenants'"><RouterLink :to="{ name: 'admin-tenant-memberships', params: { tenantId: row.id } }">አባላት ይመልከቱ</RouterLink></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </main>
</template>

<style scoped>
.admin-directory-page { display: grid; gap: 1.25rem; }
.directory-toolbar { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: .75rem; }
.directory-toolbar p { margin: 0; color: var(--color-text-muted, #666); font-size: .85rem; }
.directory-search { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; }
.directory-search label { display: grid; gap: .25rem; font-size: .875rem; }
.directory-search input { min-height: 2.5rem; min-width: min(22rem, 70vw); padding: .4rem .6rem; border: 1px solid var(--color-border, #aaa); border-radius: .375rem; background: var(--color-surface, white); color: inherit; }
.directory-search button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.directory-search button:disabled { cursor: wait; opacity: .6; }
.directory-note { padding: .75rem; border-inline-start: 3px solid var(--color-border, #888); background: var(--color-surface-subtle, #f6f6f6); border-radius: .25rem; }
.directory-error { color: var(--color-danger, #b42318); }
.directory-empty { padding: 1.5rem 0; text-align: center; }
.directory-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; white-space: nowrap; }
th { font-size: .8rem; font-weight: 600; }
td small { display: block; margin-top: .2rem; color: var(--color-text-muted, #666); }
</style>
