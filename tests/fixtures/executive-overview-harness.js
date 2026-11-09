import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ExecutiveOverviewView from '../../src/features/executive-overview/ExecutiveOverviewView.vue';
import { executiveOverviewRequestKey, getExecutiveOverview } from '../../src/features/executive-overview/service';
import { executiveOverviewEnglishLabels } from '../../src/features/executive-overview/labels';
import { useAuthStore } from '../../src/stores/auth';
import { useTenantStore, createInMemoryTenantIdStorage, setTenantIdStorage } from '../../src/stores/tenant';
import { useLocaleStore, createInMemoryLocaleStorage, setLocaleStorage } from '../../src/stores/locale';
import { setAuthHeaderProvider, setTenantHeaderProvider, setUnauthorizedHandler } from '../../src/core/api/client';

setTenantIdStorage(createInMemoryTenantIdStorage());
setLocaleStorage(createInMemoryLocaleStorage());

const pinia = createPinia();
const app = createApp(ExecutiveOverviewView, { labels: executiveOverviewEnglishLabels });
app.use(pinia);

const auth = useAuthStore(pinia);
const tenant = useTenantStore(pinia);
const locale = useLocaleStore(pinia);

// Deferred request executor intentionally ignores AbortSignal. Tests can resolve
// an old operation after logout or tenant changes to prove sequence/scope guards.
const requests = [];
let requestExecutor = (options = {}) => new Promise((resolve, reject) => {
  requests.push({
    tenantId: tenant.effectiveTenantId,
    signal: options.signal,
    resolve,
    reject,
  });
});
app.provide(executiveOverviewRequestKey, requestExecutor);

const makeUser = (overrides = {}) => ({
  id: 9001,
  name: 'A4 Synthetic Reviewer',
  email: 'a4-reviewer@example.test',
  locale: 'en',
  default_tenant_id: 101,
  roles: ['finance_manager'],
  permissions: ['dashboard.executive.view'],
  tenants: [
    { id: 101, slug: 'tenant-a', name: 'Synthetic Tenant A', is_active: true },
    { id: 202, slug: 'tenant-b', name: 'Synthetic Tenant B', is_active: true },
  ],
  ...overrides,
});

auth.setUser(makeUser());
tenant.setActiveTenant(101);
locale.setLocale('en');

setAuthHeaderProvider(() => auth.token);
setTenantHeaderProvider(() => tenant.effectiveTenantId);
setUnauthorizedHandler(() => auth.clearSession());

app.mount('#app');

window.__a4 = {
  auth,
  tenant,
  makeUser,
  requests,
  resolveRequest: (index, result) => requests[index]?.resolve(result),
  setRequestExecutor: (executor) => { requestExecutor = executor; },
  useRealRequestExecutor: () => { requestExecutor = getExecutiveOverview; },
  unmount: () => app.unmount(),
};
