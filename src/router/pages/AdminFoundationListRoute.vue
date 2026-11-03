<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/core/api/client';

interface PermissionOption {
  readonly id: number;
  readonly slug: string;
  readonly name_am?: string | null;
  readonly name_en?: string | null;
  readonly is_system?: boolean;
  readonly scope?: string;
}

interface RoleOption {
  readonly id: number;
  readonly slug: string;
  readonly name_am?: string | null;
  readonly name_en?: string | null;
  readonly is_active?: boolean;
  readonly scope?: string;
  readonly permissions?: readonly PermissionOption[];
}

interface AdminDirectoryRow {
  readonly id: number;
  readonly slug?: string;
  readonly name_am?: string | null;
  readonly name_en?: string | null;
  readonly domain?: string | null;
  readonly is_active?: boolean;
  readonly is_system?: boolean;
  readonly email?: string;
  readonly phone?: string;
  readonly locale?: string;
  readonly scope?: string;
  readonly category?: string;
  readonly first_name_am?: string | null;
  readonly father_name_am?: string | null;
  readonly grandfather_name_am?: string | null;
  readonly first_name_en?: string | null;
  readonly father_name_en?: string | null;
  readonly grandfather_name_en?: string | null;
  readonly memberships?: readonly { readonly status: string }[];
  readonly roles?: readonly RoleOption[];
  readonly permissions?: readonly PermissionOption[];
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
const roleOptions = ref<readonly RoleOption[]>([]);
const permissionOptions = ref<readonly PermissionOption[]>([]);
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const actionMessage = ref('');
const total = ref<number | null>(null);
const membershipReason = ref('Administrative membership review');
const existingUserId = ref('');
const selectedUserId = ref<number | null>(null);
const selectedProfile = ref<{
  id: number;
  email: string;
  first_name_am: string;
  first_name_en: string;
  phone: string;
  locale: string;
} | null>(null);
const selectedRoleIds = ref<number[]>([]);
const selectedRoleId = ref<number | null>(null);
const selectedPermissionIds = ref<number[]>([]);
const newUser = ref({
  email: '',
  first_name_am: '',
  first_name_en: '',
  password: '',
  password_confirmation: '',
});
const newRole = ref({ slug: '', name_am: '', name_en: '' });

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
    description: 'በአሁኑ ቴናንት ያሉ መለያዎችን፣ አባልነትን እና ሚናዎችን ያስተዳድሩ።',
    empty: 'በዚህ ቴናንት ውስጥ ተጠቃሚ አልተገኘም።',
  },
  roles: {
    title: 'ሚናዎች',
    description: 'የቴናንት ሚናዎችን እና የተመደቡ ፈቃዶችን ያስተዳድሩ።',
    empty: 'ሚና አልተገኘም።',
  },
  permissions: {
    title: 'ፈቃዶች',
    description: 'የተመዘገቡ የፈቃድ መለያዎችና የተግባር ወሰኖች።',
    empty: 'ፈቃድ አልተገኘም።',
  },
};

const current = computed(() => labels[resource.value]);

function normalizeList<T>(value: Paginated<T> | readonly T[]): { rows: readonly T[]; total: number } {
  if (Array.isArray(value)) return { rows: value, total: value.length };
  const page = value as Paginated<T>;
  return { rows: page.data, total: page.total };
}

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
  actionMessage.value = '';
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
    const normalized = normalizeList(response);
    rows.value = normalized.rows;
    total.value = normalized.total;

    if (resource.value === 'users' || resource.value === 'roles') {
      const roleResponse = await api.get<Paginated<RoleOption> | readonly RoleOption[]>(
        '/api/admin/authorization/roles',
      );
      roleOptions.value = normalizeList(roleResponse).rows;
    }
    if (resource.value === 'roles' || resource.value === 'users') {
      permissionOptions.value = await api.get<readonly PermissionOption[]>(
        '/api/admin/authorization/permissions',
      );
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'መረጃውን ማምጣት አልተቻለም።';
  } finally {
    loading.value = false;
  }
}

async function createUser(): Promise<void> {
  submitting.value = true;
  actionMessage.value = '';
  errorMessage.value = '';
  try {
    await api.post('/api/admin/identity/users', newUser.value);
    newUser.value = { email: '', first_name_am: '', first_name_en: '', password: '', password_confirmation: '' };
    actionMessage.value = 'የተጠቃሚ መለያው ተፈጥሯል።';
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'መለያውን መፍጠር አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

async function addExistingMembership(): Promise<void> {
  const id = Number(existingUserId.value);
  if (!Number.isInteger(id) || id < 1) {
    errorMessage.value = 'ትክክለኛ የተጠቃሚ መለያ ቁጥር ያስገቡ።';
    return;
  }
  submitting.value = true;
  errorMessage.value = '';
  try {
    await api.post(`/api/admin/identity/users/${id}/membership`, {
      reason: membershipReason.value,
    });
    existingUserId.value = '';
    actionMessage.value = 'ተጠቃሚው ወደ ቴናንቱ ተጨምሯል።';
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'አባልነቱን መጨመር አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

async function revokeMembership(row: AdminDirectoryRow): Promise<void> {
  if (!window.confirm('ይህን አባልነት በቋሚነት ማቋረጥ ይፈልጋሉ? እንደገና ማንቃት አይቻልም።')) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    await api.post(`/api/admin/identity/users/${row.id}/membership/revoke`, {
      reason: membershipReason.value,
    });
    actionMessage.value = 'አባልነቱ በቋሚነት ተቋርጧል።';
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'አባልነቱን ማቋረጥ አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

async function changeMembership(row: AdminDirectoryRow): Promise<void> {
  const currentStatus = row.memberships?.[0]?.status ?? 'active';
  const status = currentStatus === 'active' ? 'suspended' : 'active';
  submitting.value = true;
  errorMessage.value = '';
  actionMessage.value = '';
  try {
    await api.patch(`/api/admin/identity/users/${row.id}/membership`, {
      status,
      reason: membershipReason.value,
    });
    actionMessage.value = status === 'active' ? 'አባልነቱ እንደገና ተነቃቅቷል።' : 'አባልነቱ ታግዷል።';
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'የአባልነት ሁኔታን መቀየር አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

function editUserProfile(row: AdminDirectoryRow): void {
  selectedProfile.value = {
    id: row.id,
    email: row.email ?? '',
    first_name_am: row.first_name_am ?? '',
    first_name_en: row.first_name_en ?? '',
    phone: row.phone ?? '',
    locale: row.locale ?? 'am',
  };
}

async function saveUserProfile(): Promise<void> {
  if (selectedProfile.value === null) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    const { id, ...profile } = selectedProfile.value;
    await api.patch(`/api/admin/identity/users/${id}`, profile);
    selectedProfile.value = null;
    actionMessage.value = 'የተጠቃሚው መገለጫ ተዘምኗል።';
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'መገለጫውን ማዘመን አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

function editUserRoles(row: AdminDirectoryRow): void {
  selectedUserId.value = row.id;
  selectedRoleIds.value = (row.roles ?? [])
    .filter((role) => role.scope === 'tenant')
    .map((role) => role.id);
}

async function saveUserRoles(): Promise<void> {
  if (selectedUserId.value === null) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    await api.put(`/api/admin/identity/users/${selectedUserId.value}/roles`, {
      role_ids: selectedRoleIds.value,
    });
    actionMessage.value = 'የተጠቃሚው ሚናዎች ተዘምነዋል።';
    selectedUserId.value = null;
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ሚናዎቹን ማዘመን አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

async function createRole(): Promise<void> {
  submitting.value = true;
  errorMessage.value = '';
  try {
    await api.post('/api/admin/authorization/roles', newRole.value);
    newRole.value = { slug: '', name_am: '', name_en: '' };
    actionMessage.value = 'ሚናው ተፈጥሯል።';
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ሚናውን መፍጠር አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

function editRolePermissions(row: AdminDirectoryRow): void {
  selectedRoleId.value = row.id;
  selectedPermissionIds.value = (row.permissions ?? [])
    .filter((permission) => !permission.is_system && permission.scope === 'tenant')
    .map((permission) => permission.id);
}

async function saveRolePermissions(): Promise<void> {
  if (selectedRoleId.value === null) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    await api.put(`/api/admin/authorization/roles/${selectedRoleId.value}/permissions`, {
      permission_ids: selectedPermissionIds.value,
    });
    actionMessage.value = 'የሚናው ፈቃዶች ተዘምነዋል።';
    selectedRoleId.value = null;
    await load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ፈቃዶቹን ማዘመን አልተቻለም።';
  } finally {
    submitting.value = false;
  }
}

watch(resource, () => {
  selectedRoleId.value = null;
  selectedUserId.value = null;
  void load();
}, { immediate: true });
</script>

<template>
  <main class="admin-foundation" aria-labelledby="admin-foundation-title">
    <header class="admin-foundation__header">
      <div>
        <p class="admin-foundation__eyebrow">ARNA · ADMINISTRATION</p>
        <h1 id="admin-foundation-title">{{ current.title }}</h1>
        <p class="admin-foundation__description">{{ current.description }}</p>
      </div>
      <button class="admin-foundation__button" type="button" :disabled="loading" @click="load">
        {{ loading ? 'በመጫን ላይ…' : 'አድስ' }}
      </button>
    </header>

    <p v-if="actionMessage" class="admin-foundation__state" role="status">{{ actionMessage }}</p>
    <p v-if="errorMessage" class="admin-foundation__state admin-foundation__state--error" role="alert">
      {{ errorMessage }}
    </p>

    <details v-if="resource === 'users'" class="admin-foundation__panel">
      <summary>አዲስ የተጠቃሚ መለያ ፍጠር</summary>
      <form class="admin-foundation__form" @submit.prevent="createUser">
        <label>ኢሜይል<input v-model.trim="newUser.email" type="email" autocomplete="email" required /></label>
        <label>ስም (አማርኛ)<input v-model.trim="newUser.first_name_am" type="text" /></label>
        <label>ስም (English)<input v-model.trim="newUser.first_name_en" type="text" /></label>
        <label>ጊዜያዊ የይለፍ ቃል<input v-model="newUser.password" type="password" minlength="12" autocomplete="new-password" required /></label>
        <label>የይለፍ ቃሉን ድገም<input v-model="newUser.password_confirmation" type="password" minlength="12" autocomplete="new-password" required /></label>
        <button class="admin-foundation__button" type="submit" :disabled="submitting">መለያ ፍጠር</button>
      </form>
    </details>

    <details v-if="resource === 'roles'" class="admin-foundation__panel">
      <summary>አዲስ የቴናንት ሚና ፍጠር</summary>
      <form class="admin-foundation__form" @submit.prevent="createRole">
        <label>የሚና መለያ (slug)<input v-model.trim="newRole.slug" type="text" pattern="[A-Za-z0-9_-]+" required /></label>
        <label>ስም (አማርኛ)<input v-model.trim="newRole.name_am" type="text" /></label>
        <label>ስም (English)<input v-model.trim="newRole.name_en" type="text" required /></label>
        <button class="admin-foundation__button" type="submit" :disabled="submitting">ሚና ፍጠር</button>
      </form>
    </details>

    <label v-if="resource === 'users'" class="admin-foundation__reason">
      ለአባልነት ለውጥ ምክንያት
      <input v-model.trim="membershipReason" type="text" minlength="10" maxlength="500" />
    </label>
    <form v-if="resource === 'users'" class="admin-foundation__add-membership" @submit.prevent="addExistingMembership">
      <label>ነባር የመለያ ቁጥር
        <input v-model.trim="existingUserId" type="number" min="1" required />
      </label>
      <button class="admin-foundation__button" type="submit" :disabled="submitting">ወደ ቴናንቱ ጨምር</button>
    </form>

    <p v-if="loading" class="admin-foundation__state" role="status">መረጃ በመጫን ላይ…</p>
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
            <th v-if="resource === 'users' || resource === 'roles'" scope="col">እርምጃ</th>
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
              <span v-else-if="row.memberships?.[0]?.status">{{ row.memberships[0].status }}</span>
              <span v-else-if="row.is_active === true">Active</span>
              <span v-else-if="row.is_active === false">Inactive</span>
              <span v-else>—</span>
            </td>
            <td v-if="resource === 'users' || resource === 'roles'" class="admin-foundation__actions">
              <template v-if="resource === 'users'">
                <button class="admin-foundation__button admin-foundation__button--small" type="button" :disabled="submitting || row.memberships?.[0]?.status === 'revoked'" @click="changeMembership(row)">
                  {{ row.memberships?.[0]?.status === 'active' ? 'አባልነት አግድ' : 'አባልነት አንቃ' }}
                </button>
                <button class="admin-foundation__button admin-foundation__button--small" type="button" @click="editUserProfile(row)">መገለጫ</button>
                <button class="admin-foundation__button admin-foundation__button--small" type="button" @click="editUserRoles(row)">ሚናዎች</button>
                <button class="admin-foundation__button admin-foundation__button--small" type="button" :disabled="submitting || row.memberships?.[0]?.status === 'revoked'" @click="revokeMembership(row)">በቋሚነት አቋርጥ</button>
              </template>
              <template v-else>
                <button class="admin-foundation__button admin-foundation__button--small" type="button" :disabled="row.scope !== 'tenant'" @click="editRolePermissions(row)">ፈቃዶች</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="selectedProfile !== null" class="admin-foundation__panel" aria-labelledby="user-profile-editor">
      <h2 id="user-profile-editor">የተጠቃሚ መገለጫ ማስተካከያ</h2>
      <form class="admin-foundation__form" @submit.prevent="saveUserProfile">
        <label>ኢሜይል<input v-model.trim="selectedProfile.email" type="email" required /></label>
        <label>ስም (አማርኛ)<input v-model.trim="selectedProfile.first_name_am" type="text" /></label>
        <label>ስም (English)<input v-model.trim="selectedProfile.first_name_en" type="text" /></label>
        <label>ስልክ<input v-model.trim="selectedProfile.phone" type="tel" /></label>
        <label>ቋንቋ
          <select v-model="selectedProfile.locale">
            <option value="am">አማርኛ</option>
            <option value="en">English</option>
          </select>
        </label>
        <button class="admin-foundation__button" type="submit" :disabled="submitting">መገለጫ አስቀምጥ</button>
      </form>
      <button class="admin-foundation__text-button" type="button" @click="selectedProfile = null">ዝጋ</button>
    </section>

    <section v-if="selectedUserId !== null" class="admin-foundation__panel" aria-labelledby="user-role-editor">
      <h2 id="user-role-editor">የተጠቃሚ ሚናዎች</h2>
      <p>በአሁኑ ቴናንት የሚተገበሩ ሚናዎችን ይምረጡ።</p>
      <label v-for="role in roleOptions.filter((item) => item.scope === 'tenant')" :key="role.id" class="admin-foundation__check">
        <input v-model="selectedRoleIds" type="checkbox" :value="role.id" />
        <span>{{ role.name_am || role.name_en || role.slug }} <small>{{ role.slug }}</small></span>
      </label>
      <button class="admin-foundation__button" type="button" :disabled="submitting" @click="saveUserRoles">ሚናዎችን አስቀምጥ</button>
      <button class="admin-foundation__text-button" type="button" @click="selectedUserId = null">ዝጋ</button>
    </section>

    <section v-if="selectedRoleId !== null" class="admin-foundation__panel" aria-labelledby="role-permission-editor">
      <h2 id="role-permission-editor">የሚና ፈቃዶች</h2>
      <p>System ፈቃዶች ከዚህ ማያ ገጽ ሊቀየሩ አይችሉም።</p>
      <label v-for="permission in permissionOptions.filter((item) => !item.is_system && item.scope === 'tenant')" :key="permission.id" class="admin-foundation__check">
        <input v-model="selectedPermissionIds" type="checkbox" :value="permission.id" />
        <span>{{ permission.name_am || permission.name_en || permission.slug }} <small>{{ permission.slug }}</small></span>
      </label>
      <button class="admin-foundation__button" type="button" :disabled="submitting" @click="saveRolePermissions">ፈቃዶችን አስቀምጥ</button>
      <button class="admin-foundation__text-button" type="button" @click="selectedRoleId = null">ዝጋ</button>
    </section>
  </main>
</template>

<style scoped>
.admin-foundation { display: grid; gap: 1.25rem; min-width: 0; }
.admin-foundation__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.admin-foundation__eyebrow { margin: 0 0 .35rem; color: var(--mases-color-text-muted); font-size: .75rem; letter-spacing: .08em; }
.admin-foundation h1 { margin: 0; color: var(--mases-color-text-primary); font-size: clamp(1.35rem, 3vw, 1.8rem); }
.admin-foundation h2 { margin: 0 0 .75rem; color: var(--mases-color-text-primary); font-size: 1.1rem; }
.admin-foundation__description { margin: .45rem 0 0; color: var(--mases-color-text-secondary); }
.admin-foundation__button { border: 1px solid var(--mases-color-border-default); border-radius: .5rem; background: var(--mases-color-surface-raised); color: var(--mases-color-text-primary); padding: .6rem .9rem; cursor: pointer; }
.admin-foundation__button:focus-visible, .admin-foundation__text-button:focus-visible { outline: 3px solid var(--mases-focus-ring-color); outline-offset: 2px; }
.admin-foundation__button:disabled { opacity: .6; cursor: not-allowed; }
.admin-foundation__button--small { padding: .4rem .6rem; font-size: .8rem; }
.admin-foundation__text-button { border: 0; background: transparent; color: var(--mases-color-text-secondary); padding: .6rem; cursor: pointer; }
.admin-foundation__state, .admin-foundation__table-wrap, .admin-foundation__panel { border: 1px solid var(--mases-color-border-default); border-radius: .75rem; background: var(--mases-color-surface-raised); padding: 1rem; color: var(--mases-color-text-primary); }
.admin-foundation__state--error { color: var(--mases-color-text-danger); }
.admin-foundation__summary { margin-bottom: .75rem; color: var(--mases-color-text-secondary); font-size: .875rem; }
.admin-foundation__form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: .8rem; margin-top: 1rem; }
.admin-foundation__form label, .admin-foundation__reason { display: grid; gap: .35rem; color: var(--mases-color-text-secondary); font-size: .9rem; }
.admin-foundation input:not([type=checkbox]), .admin-foundation select { width: 100%; min-width: 0; border: 1px solid var(--mases-color-border-default); border-radius: .45rem; background: var(--mases-color-surface); color: var(--mases-color-text-primary); padding: .65rem .7rem; }
.admin-foundation input:focus-visible, .admin-foundation select:focus-visible { outline: 3px solid var(--mases-focus-ring-color); outline-offset: 2px; }
.admin-foundation__reason { max-width: 36rem; }
.admin-foundation__add-membership { display: flex; align-items: end; flex-wrap: wrap; gap: .75rem; }
.admin-foundation__add-membership label { display: grid; gap: .35rem; color: var(--mases-color-text-secondary); font-size: .9rem; }
.admin-foundation table { width: 100%; border-collapse: collapse; text-align: start; }
.admin-foundation th, .admin-foundation td { border-bottom: 1px solid var(--mases-color-border-default); padding: .75rem .5rem; vertical-align: top; }
.admin-foundation th { color: var(--mases-color-text-secondary); font-size: .8rem; font-weight: 600; }
.admin-foundation td { color: var(--mases-color-text-primary); }
.admin-foundation td small { display: block; margin-top: .2rem; color: var(--mases-color-text-secondary); overflow-wrap: anywhere; }
.admin-foundation__actions { display: flex; flex-wrap: wrap; gap: .4rem; }
.admin-foundation__check { display: flex; align-items: flex-start; gap: .65rem; padding: .45rem 0; color: var(--mases-color-text-primary); }
.admin-foundation__check small { display: block; color: var(--mases-color-text-secondary); overflow-wrap: anywhere; }
@media (max-width: 640px) {
  .admin-foundation__header { flex-direction: column; }
  .admin-foundation__table-wrap { overflow-x: auto; }
  .admin-foundation table { min-width: 42rem; }
}
</style>
