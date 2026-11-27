import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routes = await readFile(new URL('../src/router/routes-admin.ts', import.meta.url), 'utf8');
const nav = await readFile(new URL('../src/router/admin-labels.ts', import.meta.url), 'utf8');
const integrations = await readFile(new URL('../src/router/pages/AdminIntegrationsRoute.vue', import.meta.url), 'utf8');
const operations = await readFile(new URL('../src/router/pages/AdminOperationsRoute.vue', import.meta.url), 'utf8');

test('Integration Registry route, navigation and API use the same permission contract', () => {
  assert.match(routes, /path: 'admin\/integrations'/);
  assert.match(routes, /name: 'admin-integrations'/);
  assert.match(routes, /AdminIntegrationsRoute\.vue/);
  assert.match(routes, /meta: \{ permission: 'platform\.integrations\.read' \}/);
  assert.match(nav, /to: '\/admin\/integrations'/);
  assert.match(nav, /permission: 'platform\.integrations\.read'/);
  assert.match(integrations, /\/api\/admin\/platform\/integrations/);
  assert.match(integrations, /credentials_configured/);
  assert.match(integrations, /credential_values_exposed/);
  assert.match(integrations, /role="alert"/);
});

test('Operations Health route and page distinguish unknown from healthy', () => {
  assert.match(routes, /path: 'admin\/operations'/);
  assert.match(routes, /name: 'admin-operations'/);
  assert.match(routes, /AdminOperationsRoute\.vue/);
  assert.match(routes, /meta: \{ permission: 'platform\.operations\.read' \}/);
  assert.match(nav, /to: '\/admin\/operations'/);
  assert.match(nav, /permission: 'platform\.operations\.read'/);
  assert.match(operations, /\/api\/admin\/platform\/operations\/health/);
  assert.match(operations, /not_observed/);
  assert.match(operations, /Unknown or not-observed/);
  assert.match(operations, /role="status"/);
  assert.match(operations, /role="alert"/);
});
