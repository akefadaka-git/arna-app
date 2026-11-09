import { createApp } from 'vue';
import { createPinia } from 'pinia';

import ExecutiveOverviewView from '../../src/features/executive-overview/ExecutiveOverviewView.vue';
import { executiveOverviewEnglishLabels } from '../../src/features/executive-overview/labels';
import { useAuthStore } from '../../src/stores/auth';
import { useTenantStore, createInMemoryTenantIdStorage, setTenantIdStorage } from '../../src/stores/tenant';
import { useLocaleStore, createInMemoryLocaleStorage, setLocaleStorage } from '../../src/stores/locale';

setTenantIdStorage(createInMemoryTenantIdStorage());
setLocaleStorage(createInMemoryLocaleStorage());

const pinia = createPinia();
const app = createApp(ExecutiveOverviewView, { labels: executiveOverviewEnglishLabels });
app.use(pinia);

const auth = useAuthStore(pinia);
const tenant = useTenantStore(pinia);
const locale = useLocaleStore(pinia);

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

app.mount('#app');

window.__a4 = {
  auth,
  tenant,
  makeUser,
  unmount: () => app.unmount(),
};
