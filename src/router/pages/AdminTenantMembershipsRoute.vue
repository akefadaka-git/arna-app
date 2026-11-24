<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/core/api/client';
import { formatCalendarDate } from '@/core/dates/calendar';
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

const route = useRoute();
const result = ref<TenantMembershipResponse | null>(null);
const loading = ref(false);
const error = ref('');

const tenantId = computed(() => {
  const raw = route.params.tenantId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
});

function joinedLabel(value: string | null): string {
  return value ? formatCalendarDate(value, { dateStyle: 'medium' }) : '—';
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

watch(tenantId, () => { void load(); });
onMounted(() => { void load(); });
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
      <p v-else-if="loading" role="status">መረጃ በመጫን ላይ…</p>
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
  </main>
</template>

<style scoped>
.tenant-memberships-page { display: grid; gap: 1.25rem; }
.membership-toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.membership-toolbar h2 { margin: 0; font-size: 1.05rem; }
.membership-toolbar button { min-height: 2.5rem; padding: .4rem .9rem; border: 1px solid var(--color-border, #888); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.membership-error { color: var(--color-danger, #b42318); }
.membership-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: start; }
th, td { padding: .7rem .6rem; border-bottom: 1px solid var(--color-border, #ddd); vertical-align: top; white-space: nowrap; }
th { font-size: .8rem; font-weight: 600; }
td small { display: block; margin-top: .2rem; color: var(--color-text-muted, #666); }
.membership-total { color: var(--color-text-muted, #666); font-size: .85rem; }
</style>
