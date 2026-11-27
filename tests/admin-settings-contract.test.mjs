import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const routes = await readFile(new URL('../src/router/routes-admin.ts', import.meta.url), 'utf8');
const nav = await readFile(new URL('../src/router/admin-labels.ts', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/router/pages/AdminSettingsRoute.vue', import.meta.url), 'utf8');

test('Settings and Configuration pages are separately permission-gated', () => {
  assert.match(routes, /name: 'admin-settings'/);
  assert.match(routes, /meta: \{ permission: 'platform\.settings\.read' \}/);
  assert.match(routes, /name: 'admin-configuration'/);
  assert.match(routes, /meta: \{ permission: 'platform\.configuration\.read' \}/);
  assert.match(nav, /to: '\/admin\/settings'/);
  assert.match(nav, /permission: 'platform\.settings\.read'/);
  assert.match(nav, /to: '\/admin\/configuration'/);
  assert.match(nav, /permission: 'platform\.configuration\.read'/);
});

test('Settings UI submits changes for approval and redacts secret values', () => {
  assert.match(page, /\/api\/admin\/platform\//);
  assert.match(page, /change-requests/);
  assert.match(page, /is_secret/);
  assert.match(page, /••••••••/);
  assert.match(page, /secret_value_provided/);
  assert.match(page, /Approve/);
  assert.match(page, /Reject/);
  assert.match(page, /different authorized approver/);
});
