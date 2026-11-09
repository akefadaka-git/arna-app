import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Executive Overview is a separate permission-gated workspace route', async () => {
  const routes = await read('../src/router/routes-workspace.ts');
  assert.match(routes, /path: 'executive-overview'[\s\S]*?name: 'executive-overview'[\s\S]*?ExecutiveOverviewView\.vue'[\s\S]*?permission: 'dashboard\.executive\.view'[\s\S]*?requiredRoles: \['ceo', 'president', 'finance_manager'\]/);
  assert.match(routes, /path: 'dashboard'[\s\S]*?name: 'dashboard'[\s\S]*?DashboardView\.vue'[\s\S]*?props: \{ labels: dashboardViewLabels \}/);
});

test('workspace navigation item is filtered by the same canonical permission', async () => {
  const shell = await read('../src/router/shell-labels.ts');
  assert.match(shell, /id: 'executive-overview'[\s\S]*?to: '\/executive-overview'[\s\S]*?permission: 'dashboard\.executive\.view'[\s\S]*?requiredRoles: \['ceo', 'president', 'finance_manager'\]/);
});

test('route and sidebar UX gates require an approved audience role as well as permission', async () => {
  const guards = await read('../src/router/guards.ts');
  const sidebar = await read('../src/layouts/AppShell/AppSidebar/AppSidebar.vue');
  assert.match(guards, /requiredRoles[\s\S]*?auth\.hasRole/);
  assert.match(sidebar, /passesRoleCheck[\s\S]*?auth\.hasRole/);
});

test('Executive Overview UI consumes only returned authorized widgets', async () => {
  const view = await read('../src/features/executive-overview/ExecutiveOverviewView.vue');
  const api = await read('../src/features/executive-overview/api.ts');
  assert.match(view, /overview\.widgets/);
  assert.match(api, /\/api\/dashboard\/v1\/overview/);
  assert.doesNotMatch(api, /omitted_widgets|unavailable_widgets/);
  assert.match(view, /effectiveTenantId/);
  assert.match(view, /overview\.value = null/);
  assert.match(view, /formatCalendarDate\(widget\.as_of/);
  assert.match(view, /formatCalendarDate\(overview\.generated_at/);
  assert.match(view, /useLocaleStore/);
  const labels = await read('../src/features/executive-overview/labels.ts');
  assert.match(labels, /executiveOverviewEnglishLabels/);
});

test('tenant changes clear prior-scope figures and abort superseded overview requests', async () => {
  const view = await read('../src/features/executive-overview/ExecutiveOverviewView.vue');
  assert.match(view, /activeController\?\.abort\(\)/);
  assert.match(view, /const controller = new AbortController\(\)/);
  assert.match(view, /getExecutiveOverview\(\{ signal: controller\.signal \}\)/);
  assert.match(view, /watch\([\s\S]*?tenant\.effectiveTenantId[\s\S]*?clearSensitiveViewState\(\)[\s\S]*?void load\(\)/);
  assert.match(view, /sequence === requestSequence/);
  assert.match(view, /!controller\.signal\.aborted/);
});

test('unmount invalidates pending responses and aborts the active request', async () => {
  const view = await read('../src/features/executive-overview/ExecutiveOverviewView.vue');
  assert.match(view, /onBeforeUnmount\(\(\) => \{[\s\S]*?requestSequence \+= 1[\s\S]*?activeController\?\.abort\(\)[\s\S]*?activeController = null[\s\S]*?\}\)/);
  assert.match(view, /if \(sequence === requestSequence\) overview\.value = result/);
  assert.match(view, /if \(sequence === requestSequence\) isLoading\.value = false/);
});


test('authorization-context changes immediately clear sensitive overview state', async () => {
  const view = await read('../src/features/executive-overview/ExecutiveOverviewView.vue');
  assert.match(view, /const auth = useAuthStore\(\)/);
  assert.match(view, /watch\([\s\S]*?\(\) => auth\.user[\s\S]*?clearSensitiveViewState\(\)/);
  assert.match(view, /activeController\?\.abort\(\)/);
  assert.match(view, /auth\.hasPermission\('dashboard\.executive\.view'\)/);
  assert.match(view, /\['ceo', 'president', 'finance_manager'\]\.some\(\(role\) => auth\.hasRole\(role\)\)/);
});

test('forbidden and unavailable responses have distinct non-disclosing user states', async () => {
  const view = await read('../src/features/executive-overview/ExecutiveOverviewView.vue');
  const labels = await read('../src/features/executive-overview/labels.ts');
  assert.match(view, /status === 403[\s\S]*?return 'forbidden'/);
  assert.match(view, /status === 404 \|\| status >= 500 \|\| failure\.category === 'network'/);
  assert.match(view, /labels\.forbiddenDescription/);
  assert.match(view, /labels\.unavailableDescription/);
  assert.doesNotMatch(view, /permission slug|omitted_widgets|inaccessible widget/i);
  assert.match(labels, /forbiddenTitle/);
  assert.match(labels, /unavailableTitle/);
});

test('partial-data notice is driven only by the explicit response status', async () => {
  const view = await read('../src/features/executive-overview/ExecutiveOverviewView.vue');
  const api = await read('../src/features/executive-overview/api.ts');
  assert.match(api, /status\?: 'complete' \| 'partial'/);
  assert.match(view, /overview\.status === 'partial'/);
  assert.match(view, /labels\.partialDataMessage/);
});


test('Loan-product launcher and route use the API canonical loan.view permission', async () => {
  const routes = await read('../src/router/routes-workspace.ts');
  const dashboard = await read('../src/features/dashboard/DashboardView.vue');
  assert.match(routes, /name: 'loan-products'[\s\S]*?meta: \{ permission: 'loan\.view' \}/);
  assert.match(dashboard, /permissions: \['loan\.view'\]/);
  assert.doesNotMatch(routes, /loan_product\.view/);
  assert.doesNotMatch(dashboard, /loan_product\.view/);
});
