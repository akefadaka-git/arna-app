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
