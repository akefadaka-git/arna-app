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
