<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/core/api/client';
import { formatCalendarDate } from '@/core/dates/calendar';
import { useAuthStore } from '@/stores/auth';
import { useTenantStore } from '@/stores/tenant';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

interface TenantInfo { readonly id: number; readonly slug: string; readonly name: string }
interface Membership {
  readonly tenant_id: number;
  readonly user_id: number;
  readonly name: string | null;
  readonly email: string | null;
  readonly status: 'active' | 'suspended' | 'revoked';
  readonly joined_at: string | null;
}
interface Page<T> {
  readonly data: readonly T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}
interface TenantMembershipResponse {
  readonly tenant: TenantInfo;
  readonly memberships: Page<Membership>;
}
interface ApprovalChallenge {
  readonly challenge_id: string;
  readonly key_id: string;
  readonly canonical_payload: string;
  readonly payload_sha256: string;
  readonly expires_at: string;
}

const route = useRoute();
const auth = useAuthStore();
const tenantStore = useTenantStore();
const previousTenantId = tenantStore.activeTenantId;
const result = ref<TenantMembershipResponse | null>(null);
const loading = ref(false);
const error = ref('');
const actionMessage = ref('');
const tenantContextReady = ref(false);
const busy = ref(false);
const targetUserId = ref('');
const membershipAction = ref<'attach' | 'suspend' | 'reactivate' | 'revoke'>('attach');
const reason = ref('');
const ownerUserId = ref('');
const roleId = ref('');
const rbacTargetUserId = ref('');
const rbacAction = ref<'tenant.role.assign' | 'tenant.role.revoke' | 'tenant.role.permissions.sync'>('tenant.role.assign');
const permissionSlugs = ref('');
const rbacReason = ref('');
const challenge = ref<ApprovalChallenge | null>(null);
const ownerSignature = ref('');

const tenantId = computed(() => {
  const raw = route.params.tenantId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
});
const canManageMembership = computed(() => auth.hasPermission('tenant.membership.manage') && tenantContextReady.value);

function joinedLabel(value: string | null): string {
  return value ? formatCalendarDate(value, { dateStyle: 'medium' }) : '—';
}

function activateTenantContext(): void {
  tenantContextReady.value = false;
  if (tenantId.value === null) return;
  if (tenantStore.activeTenantId === tenantId.value || tenantStore.setActiveTenant(tenantId.value)) {
    tenantContextReady.value = true;
  } else {
    error.value = 'ይህን ቴናንት ለማስተዳደር የአሁኑ መለያ ንቁ አባልነት የለውም። የtenant context ለውጥ ተከልክሏል።';
  }
}

async function load(): Promise<void> {
  if (tenantId.value === null) {
    error.value = 'ትክክለኛ የቴናንት መለያ አልተሰጠም።';
    result.value = null;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    result.value = await api.get<TenantMembershipResponse>(
      '/api/admin/platform/tenants/' + tenantId.value + '/memberships',
      { params: { per_page: 100 } },
    );
  } catch {
    error.value = 'የቴናንት አባልነቶችን ማምጣት አልተቻለም። የplatform.tenancy.read ፈቃድ ያረጋግጡ።';
  } finally {
    loading.value = false;
  }
}

async function applyMembershipAction(): Promise<void> {
  const userId = Number(targetUserId.value);
  if (!Number.isInteger(userId) || userId <= 0 || reason.value.trim().length < 3) return;
  busy.value = true;
  actionMessage.value = '';
  error.value = '';
  try {
    const suffix = membershipAction.value === 'attach' ? '' : '/' + membershipAction.value;
    await api.post(
      '/api/admin/tenant/memberships/users/' + userId + suffix,
      { reason: reason.value.trim() },
    );
    actionMessage.value = 'የአባልነት ለውጡ ተፈጽሟል።';
    targetUserId.value = '';
    reason.value = '';
    await load();
  } catch {
    error.value = 'የአባልነት ለውጡ አልተፈጸመም። የtenant context፣ ፈቃድና የAPI ምላሽ ያረጋግጡ።';
  } finally {
    busy.value = false;
  }
}

async function createOwnerChallenge(): Promise<void> {
  const owner = Number(ownerUserId.value);
  const role = Number(roleId.value);
  const target = Number(rbacTargetUserId.value);
  if (!Number.isInteger(owner) || owner <= 0 || !Number.isInteger(role) || role <= 0 || rbacReason.value.trim().length < 3) return;
  if (rbacAction.value !== 'tenant.role.permissions.sync' && (!Number.isInteger(target) || target <= 0)) return;
  busy.value = true;
  error.value = '';
  actionMessage.value = '';
  challenge.value = null;
  ownerSignature.value = '';
  try {
    challenge.value = await api.post<ApprovalChallenge>('/api/admin/tenant/rbac/approval-challenges', {
      owner_user_id: owner,
      action: rbacAction.value,
      role_id: role,
      ...(rbacAction.value === 'tenant.role.permissions.sync' ? {} : { target_user_id: target }),
      ...(rbacAction.value === 'tenant.role.permissions.sync'
        ? { permission_slugs: permissionSlugs.value.split(',').map((slug) => slug.trim()).filter(Boolean) }
        : {}),
      reason: rbacReason.value.trim(),
    });
    actionMessage.value = 'የOwner ፊርማ ጥያቄ ተፈጥሯል። ይህ እርምጃ ገና ሚናን አልቀየረም።';
  } catch {
    error.value = 'የOwner ማጽደቂያ ጥያቄ አልተፈጠረም። የtrust anchor፣ tenant membership እና permission ያረጋግጡ።';
  } finally {
    busy.value = false;
  }
}

async function executeOwnerChallenge(): Promise<void> {
  if (!challenge.value || ownerSignature.value.trim() === '') return;
  busy.value = true;
  error.value = '';
  actionMessage.value = '';
  try {
    await api.post(
      '/api/admin/tenant/rbac/approval-challenges/' + encodeURIComponent(challenge.value.challenge_id) + '/execute',
      { signature: ownerSignature.value.trim() },
    );
    actionMessage.value = 'የOwner ፊርማ ተረጋግጧል፤ የRBAC ለውጡ ተፈጽሟል።';
    challenge.value = null;
    ownerSignature.value = '';
    await load();
  } catch {
    error.value = 'የOwner ፊርማ አልተረጋገጠም ወይም ጥያቄው ጊዜው አልፎታል። የsignature፣ key እና tenant context ያረጋግጡ።';
  } finally {
    busy.value = false;
  }
}

watch(tenantId, () => {
  activateTenantContext();
  void load();
});
onMounted(() => {
  activateTenantContext();
  void load();
});
onUnmounted(() => {
  if (previousTenantId === null) tenantStore.clearActiveTenant();
  else tenantStore.setActiveTenant(previousTenantId);
});
</script>

<template>
  <main class="tenant-memberships-page">
    <PageHeader
      :title="result?.tenant.name ?? 'የቴናንት አባልነቶች'"
      :description="result?.tenant.slug ?? 'የመድረክ የአባልነት መዝገብ'"
    />
    <Card>
      <div class="membership-toolbar">
        <h2>የአባላት ዝርዝር</h2>
        <button type="button" :disabled="loading" @click="load">{{ loading ? '…' : 'አድስ' }}</button>
      </div>
      <p v-if="error" role="alert" class="membership-error">{{ error }}</p>
      <p v-if="actionMessage" role="status" class="membership-success">{{ actionMessage }}</p>
      <p v-if="loading" role="status">መረጃ በመጫን ላይ…</p>
      <p v-else-if="!result || result.memberships.data.length === 0">አባልነት አልተገኘም።</p>
      <div v-else class="membership-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">ተጠቃሚ</th>
              <th scope="col">መለያ ቁጥር</th>
              <th scope="col">ሁኔታ</th>
              <th scope="col">የተቀላቀለበት ቀን</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="membership in result.memberships.data" :key="membership.user_id">
              <td><strong>{{ membership.name || membership.email || '—' }}</strong><small>{{ membership.email }}</small></td>
              <td>{{ membership.user_id }}</td>
              <td>{{ membership.status }}</td>
              <td>{{ joinedLabel(membership.joined_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="result" class="membership-total">{{ result.memberships.total }} አባላት</p>
    </Card>

    <Card v-if="auth.hasPermission('tenant.membership.manage')">
      <h2>የአባልነት ሕይወት ዑደት</h2>
      <p class="membership-note">ለዚህ ቴናንት ንቁ አባልነት ያለው አስተዳዳሪ ብቻ ለውጥ ማድረግ ይችላል። የአሁኑ tenant context: {{ tenantContextReady ? 'ንቁ' : 'አልተፈቀደም' }}.</p>
      <form class="action-form" @submit.prevent="applyMembershipAction">
        <label>የተጠቃሚ ID<input v-model="targetUserId" inputmode="numeric" required /></label>
        <label>እርምጃ
          <select v-model="membershipAction">
            <option value="attach">Attach</option><option value="suspend">Suspend</option>
            <option value="reactivate">Reactivate</option><option value="revoke">Revoke</option>
          </select>
        </label>
        <label class="wide">ምክንያት<input v-model="reason" minlength="3" maxlength="500" required /></label>
        <button type="submit" :disabled="busy || !canManageMembership">አባልነት አስፈጽም</button>
      </form>
    </Card>

    <Card v-if="auth.hasPermission('tenant.membership.manage')">
      <h2>Owner-approved Tenant RBAC</h2>
      <p class="membership-note">የሚና ለውጥ በOwner የEd25519 ፊርማ ካልተረጋገጠ አይፈጸምም። የጥያቄ ፈጠራ ብቻ የመዳረሻ መብትን አይቀይርም።</p>
      <form class="action-form" @submit.prevent="createOwnerChallenge">
        <label>Owner User ID<input v-model="ownerUserId" inputmode="numeric" required /></label>
        <label>Role ID<input v-model="roleId" inputmode="numeric" required /></label>
        <label>Target User ID<input v-model="rbacTargetUserId" inputmode="numeric" :required="rbacAction !== 'tenant.role.permissions.sync'" :disabled="rbacAction === 'tenant.role.permissions.sync'" /></label>
        <label>እርምጃ
          <select v-model="rbacAction">
            <option value="tenant.role.assign">Assign role</option>
            <option value="tenant.role.revoke">Revoke role</option>
            <option value="tenant.role.permissions.sync">Sync role permissions</option>
          </select>
        </label>
        <label v-if="rbacAction === 'tenant.role.permissions.sync'" class="wide">Permission slugs (comma-separated)<input v-model="permissionSlugs" placeholder="permission.one, permission.two" /></label>
        <label class="wide">ምክንያት<input v-model="rbacReason" minlength="3" maxlength="500" required /></label>
        <button type="submit" :disabled="busy || !canManageMembership">Owner approval challenge ፍጠር</button>
      </form>
      <div v-if="challenge" class="challenge-panel">
        <p><strong>Challenge:</strong> {{ challenge.challenge_id }}</p>
        <p><strong>Key ID:</strong> {{ challenge.key_id }} · Expires: {{ challenge.expires_at }}</p>
        <p><strong>SHA-256:</strong> {{ challenge.payload_sha256 }}</p>
        <label>Canonical payload<textarea :value="challenge.canonical_payload" readonly rows="7" /></label>
        <label>Owner Ed25519 signature (Base64)<input v-model="ownerSignature" autocomplete="off" /></label>
        <button type="button" :disabled="busy || ownerSignature.trim() === '' || !canManageMembership" @click="executeOwnerChallenge">ፊርማውን አረጋግጥና አስፈጽም</button>
      </div>
    </Card>
  </main>
</template>

<style scoped>
.tenant-memberships-page { display: grid; gap: 1.25rem; }
.membership-toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.membership-toolbar h2 { margin: 0; font-size: 1.05rem; }
.membership-toolbar button, .action-form button, .challenge-panel button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
button:disabled { opacity: .6; cursor: not-allowed; }
.membership-error { color: var(--color-danger, #b42318); }
.membership-success { color: var(--color-success, #18794e); }
.membership-note { padding: .75rem; background: var(--color-surface-subtle, #f7f7f7); border-radius: .35rem; }
.membership-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; white-space: nowrap; }
th { font-size: .8rem; }
td small { display: block; margin-top: .2rem; color: var(--color-text-muted, #666); }
.membership-total { color: var(--color-text-muted, #666); font-size: .85rem; }
.action-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); gap: .75rem; align-items: end; }
.action-form label, .challenge-panel label { display: grid; gap: .3rem; font-size: .875rem; }
.action-form input, .action-form select, .challenge-panel input, .challenge-panel textarea { min-height: 2.5rem; min-width: 0; padding: .45rem .6rem; border: 1px solid var(--color-border, #aaa); border-radius: .375rem; background: var(--color-surface, white); color: inherit; }
.action-form .wide, .challenge-panel { grid-column: 1 / -1; }
.challenge-panel { display: grid; gap: .65rem; margin-top: 1rem; padding: .9rem; border: 1px solid var(--color-border, #ddd); border-radius: .5rem; }
.challenge-panel textarea { min-height: 9rem; font-family: monospace; }
</style>
