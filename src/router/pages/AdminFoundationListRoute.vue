<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/core/api/client';

interface AdminDirectoryRow {
  readonly id: number;
  readonly slug?: string;
  readonly name_am?: string | null;
  readonly name_en?: string | null;
  readonly domain?: string | null;
  readonly is_active?: boolean;
  readonly is_system?: boolean;
  readonly email?: string;
  readonly locale?: string;
  readonly scope?: string;
  readonly category?: string;
  readonly first_name_am?: string | null;
  readonly father_name_am?: string | null;
  readonly grandfather_name_am?: string | null;
  readonly first_name_en?: string | null;
  readonly father_name_en?: string | null;
  readonly grandfather_name_en?: string | null;
  readonly permissions?: readonly { readonly slug: string }[];
}

interface Paginated<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly current_page: number;
  readonly last_page: number;
}

type Resource = 'tenants' | 'users' | 'roles' | 'permissions';

const route = useRoute();
const rows = ref<readonly AdminDirectoryRow[]>([]);
const loading = ref(false);
const errorMessage = ref('');
const total = ref<number | null>(null);

const resource = computed<Resource>(() => {
  const name = String(route.name ?? '');
  if (name === 'admin-tenants') return 'tenants';
  if (name === 'admin-users') return 'users';
  if (name === 'admin-roles') return 'roles';
  return 'permissions';
});

const labels: Record<Resource, { title: string; description: string; empty: string }> = {
  tenants: {
    title: 'ቴናንቶች',
    description: 'የመድረኩን ድርጅታዊ ቴናንቶች ዝርዝር ይመልከቱ።',
    empty: 'ምንም ቴናንት አልተገኘም።',
  },
  users: {
    title: 'የተጠቃሚ መለያዎች',
    description: 'በአሁኑ ቴናንት ውስጥ ያሉ የተጠቃሚ መለያዎች።',
    empty: 'በዚህ ቴናንት ውስጥ ተጠቃሚ አልተገኘም።',
  },
  roles: {
    title: 'ሚናዎች',
    description: 'ለአሁኑ ቴናንት የሚተገበሩ የመድረክና የቴናንት ሚናዎች።',
    empty: 'ሚና አልተገኘም።',
  },
  permissions: {
    title: 'ፈቃዶች',
    description: 'የተመዘገቡ የፈቃድ መለያዎችና የተግባር ወሰኖች።',
    empty: 'ፈቃድ አልተገኘም።',
  },
};

const current = computed(() => labels[resource.value]);

function rowName(row: AdminDirectoryRow): string {
  const amharic = [row.first_name_am, row.father_name_am, row.grandfather_name_am]
    .filter(Boolean).join(' ');
  const english = [row.first_name_en, row.father_name_en, row.grandfather_name_en]
    .filter(Boolean).join(' ');
  return row.name_am || amharic || row.name_en || english || row.email || row.slug || `#${row.id}`;
}

async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';
  rows.value = [];
  total.value = null;
  const endpoint: Record<Resource, string> = {
    tenants: '/api/admin/tenants',
    users: '/api/admin/identity/users',
    roles: '/api/admin/authorization/roles',
    permissions: '/api/admin/authorization/permissions',
  };
  try {
    const response = await api.get<Paginated<AdminDirectoryRow> | readonly AdminDirectoryRow[]>(
      endpoint[resource.value],
    );
    if (Array.isArray(response)) {
      rows.value = response;
      total.value = response.length;
    } else {
      const page = response as Paginated<AdminDirectoryRow>;
      rows.value = page.data;
      total.value = page.total;
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'መረጃውን ማምጣት አልተቻለም።';
  } finally {
    loading.value = false;
  }
}

watch(resource, () => { void load(); }, { immediate: true });
</script>

<template>
  <main class="admin-foundation" aria-labelledby="admin-foundation-title">
    <header class="admin-foundation__header">
      <div>
        <p class="admin-foundation__eyebrow">ARNA · ADMINISTRATION</p>
        <h1 id="admin-foundation-title">{{ current.title }}</h1>
        <p class="admin-foundation__description">{{ current.description }}</p>
      </div>
      <button class="admin-foundation__refresh" type="button" :disabled="loading" @click="load">
        {{ loading ? 'በመጫን ላይ…' : 'አድስ' }}
      </button>
    </header>

    <p v-if="loading" class="admin-foundation__state" role="status">መረጃ በመጫን ላይ…</p>
    <p v-else-if="errorMessage" class="admin-foundation__state admin-foundation__state--error" role="alert">
      {{ errorMessage }}
    </p>
    <p v-else-if="rows.length === 0" class="admin-foundation__state" role="status">
      {{ current.empty }}
    </p>

    <section v-else class="admin-foundation__table-wrap" :aria-label="current.title">
      <div class="admin-foundation__summary">{{ total }} መዝገቦች</div>
      <table>
        <thead>
          <tr>
            <th scope="col">ስም / መለያ</th>
            <th scope="col">ወሰን</th>
            <th scope="col">ዝርዝር</th>
            <th scope="col">ሁኔታ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <strong>{{ rowName(row) }}</strong>
              <small v-if="row.email || row.slug">{{ row.email || row.slug }}</small>
            </td>
            <td>{{ row.scope || row.domain || '—' }}</td>
            <td>
              <span v-if="row.category">{{ row.category }}</span>
              <span v-else-if="row.permissions">{{ row.permissions.length }} ፈቃዶች</span>
              <span v-else>—</span>
            </td>
            <td>
              <span v-if="row.is_system">System</span>
              <span v-else-if="row.is_active === true">Active</span>
              <span v-else-if="row.is_active === false">Inactive</span>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style scoped>
.admin-foundation { display: grid; gap: 1.25rem; min-width: 0; }
.admin-foundation__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.admin-foundation__eyebrow { margin: 0 0 .35rem; color: var(--mases-color-text-muted); font-size: .75rem; letter-spacing: .08em; }
.admin-foundation h1 { margin: 0; color: var(--mases-color-text-primary); font-size: clamp(1.35rem, 3vw, 1.8rem); }
.admin-foundation__description { margin: .45rem 0 0; color: var(--mases-color-text-secondary); }
.admin-foundation__refresh { border: 1px solid var(--mases-color-border-default); border-radius: .5rem; background: var(--mases-color-surface-raised); color: var(--mases-color-text-primary); padding: .6rem .9rem; }
.admin-foundation__refresh:focus-visible { outline: 3px solid var(--mases-focus-ring-color); outline-offset: 2px; }
.admin-foundation__refresh:disabled { opacity: .6; }
.admin-foundation__state, .admin-foundation__table-wrap { border: 1px solid var(--mases-color-border-default); border-radius: .75rem; background: var(--mases-color-surface-raised); padding: 1rem; color: var(--mases-color-text-primary); }
.admin-foundation__state--error { color: var(--mases-color-text-danger); }
.admin-foundation__summary { margin-bottom: .75rem; color: var(--mases-color-text-secondary); font-size: .875rem; }
.admin-foundation table { width: 100%; border-collapse: collapse; text-align: start; }
.admin-foundation th, .admin-foundation td { border-bottom: 1px solid var(--mases-color-border-default); padding: .75rem .5rem; vertical-align: top; }
.admin-foundation th { color: var(--mases-color-text-secondary); font-size: .8rem; font-weight: 600; }
.admin-foundation td { color: var(--mases-color-text-primary); }
.admin-foundation td small { display: block; margin-top: .2rem; color: var(--mases-color-text-secondary); overflow-wrap: anywhere; }
@media (max-width: 640px) {
  .admin-foundation__header { flex-direction: column; }
  .admin-foundation__table-wrap { overflow-x: auto; }
  .admin-foundation table { min-width: 34rem; }
}
</style>
