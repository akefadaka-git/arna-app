import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routes = await readFile(new URL('../src/router/routes-admin.ts', import.meta.url), 'utf8');
const nav = await readFile(new URL('../src/router/admin-labels.ts', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/router/pages/AdminDomainRegistryRoute.vue', import.meta.url), 'utf8');

test('Domain Management route and sidebar use the same confirmed permission slug', () => {
  assert.match(routes, /path: 'admin\/domains'/);
  assert.match(routes, /name: 'admin-domains'/);
  assert.match(routes, /AdminDomainRegistryRoute\.vue/);
  assert.match(routes, /meta: \{ permission: 'platform\.domains\.read' \}/);
  assert.match(nav, /to: '\/admin\/domains'/);
  assert.match(nav, /permission: 'platform\.domains\.read'/);
});

test('Domain Registry consumes the platform API and exposes truthful unverified states', () => {
  assert.match(page, /\/api\/admin\/platform\/domains/);
  assert.match(page, /not_verified/);
  assert.match(page, /not_observed/);
  assert.match(page, /live_mutations_enabled/);
  assert.match(page, /ownership_verification/);
  assert.match(page, /dns_provider_connected/);
});

test('Domain Registry has explicit loading, error, and empty states', () => {
  assert.match(page, /role="status"/);
  assert.match(page, /role="alert"/);
  assert.match(page, /registry-empty/);
});

test('Admin landing dashboard reads real platform overview metrics', async () => {
  const overview = await readFile(new URL('../src/router/pages/AdminOverviewRoute.vue', import.meta.url), 'utf8');
  assert.match(routes, /AdminOverviewRoute\.vue/);
  assert.match(overview, /\/api\/admin\/platform\/overview/);
  assert.match(overview, /users/);
  assert.match(overview, /active_memberships/);
  assert.match(overview, /generated_at/);
  assert.match(overview, /role="status"/);
  assert.match(overview, /role="alert"/);
});

test('Platform application registry uses a matching permission-gated route and API', async () => {
  const applications = await readFile(new URL('../src/router/pages/AdminApplicationsRoute.vue', import.meta.url), 'utf8');
  assert.match(routes, /path: 'admin\/platforms'/);
  assert.match(routes, /AdminApplicationsRoute\.vue/);
  assert.match(routes, /meta: \{ permission: 'platform\.applications\.read' \}/);
  assert.match(nav, /to: '\/admin\/platforms'/);
  assert.match(nav, /permission: 'platform\.applications\.read'/);
  assert.match(applications, /\/api\/admin\/platform\/applications/);
  assert.match(applications, /frontend_ready/);
  assert.match(applications, /role="alert"/);
});

test('Platform identity, tenant and RBAC directories use canonical platform API namespaces', async () => {
  const directory = await readFile(new URL('../src/router/pages/AdminDirectoryRoute.vue', import.meta.url), 'utf8');
  assert.match(routes, /name: 'admin-users'/);
  assert.match(routes, /name: 'admin-tenants'/);
  assert.match(routes, /name: 'admin-roles'/);
  assert.match(routes, /name: 'admin-permissions'/);
  assert.match(routes, /platform\.identity\.read/);
  assert.match(routes, /platform\.tenancy\.read/);
  assert.match(routes, /platform\.rbac\.read/);
  assert.match(nav, /to: '\/admin\/users'/);
  assert.match(nav, /to: '\/admin\/tenants'/);
  assert.match(nav, /to: '\/admin\/roles'/);
  assert.match(nav, /to: '\/admin\/permissions'/);
  assert.match(directory, /\/api\/admin\/platform\/identity\/users/);
  assert.match(directory, /\/api\/admin\/platform\/rbac\/roles/);
  assert.match(directory, /\/api\/admin\/platform\/rbac\/permissions/);
  assert.match(directory, /\/api\/admin\/platform\/tenants/);
  assert.doesNotMatch(directory, /\/api\/admin\/authorization\//);
});

test('Tenant membership detail is routed through the platform tenancy read contract', async () => {
  const memberships = await readFile(new URL('../src/router/pages/AdminTenantMembershipsRoute.vue', import.meta.url), 'utf8');
  assert.match(routes, /name: 'admin-tenant-memberships'/);
  assert.match(routes, /platform\.tenancy\.read/);
  assert.match(directory, /admin-tenant-memberships/);
  assert.match(memberships, /\/api\/admin\/platform\/tenants\//);
  assert.match(memberships, /memberships/);
  assert.match(memberships, /role="alert"/);
});
