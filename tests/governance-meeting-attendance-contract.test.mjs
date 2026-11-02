import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('meeting attendance workspace is routed and permission-gated', async () => {
  const routes = await read('../src/router/routes-workspace.ts');
  const navigation = await read('../src/router/shell-labels.ts');
  const view = await read('../src/features/governance/MeetingAttendanceView.vue');

  assert.ok(routes.includes("path: 'governance/meetings'"));
  assert.ok(routes.includes("name: 'governance-meetings'"));
  assert.ok(routes.includes("MeetingAttendanceView.vue"));
  assert.ok(routes.includes("meta: { permission: 'governance.body.view' }"));
  assert.ok(navigation.includes("to: '/governance/meetings'"));
  assert.ok(navigation.includes("permission: 'governance.body.view'"));
  assert.ok(view.includes('Record arrival'));
  assert.ok(view.includes('Submit proxy'));
  assert.ok(view.includes('Same-day payment'));
  assert.ok(view.includes('no automatic dividend deduction'));
});

test('meeting API client uses the canonical shared transport and attendance endpoints', async () => {
  const api = await read('../src/features/governance/meetings-api.ts');
  assert.ok(api.includes("import { api } from '@/core/api/client'"));
  for (const endpoint of [
    '/api/governance/meetings',
    '/proxies',
    '/attendance',
    '/absence-authorizations',
    '/close',
    '/payments',
    '/dividend-settlement-requests',
  ]) assert.ok(api.includes(endpoint), `Missing endpoint contract: ${endpoint}`);
});

test('penalty amounts remain server-owned rather than duplicated as frontend business logic', async () => {
  const view = await read('../src/features/governance/MeetingAttendanceView.vue');
  assert.ok(view.includes('ETB'));
  assert.ok(!view.includes('amount = 50'));
  assert.ok(!view.includes('amount = 300'));
});
