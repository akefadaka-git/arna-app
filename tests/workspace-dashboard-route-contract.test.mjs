import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [routes, shell] = await Promise.all([
  readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/shell-labels.ts', import.meta.url), 'utf8'),
]);

test('workspace dashboard navigation points to a registered route', () => {
  assert.match(shell, /id:\s*'dashboard'[\s\S]*?to:\s*'\/dashboard'/);
  assert.match(routes, /path:\s*'dashboard'[\s\S]*?name:\s*'dashboard'/);
  assert.match(routes, /component:\s*\(\)\s*=>\s*import\('@\/features\/dashboard\/DashboardView\.vue'\)/);
  assert.match(routes, /props:\s*\{\s*labels:\s*dashboardViewLabels\s*\}/);
});


test('Finance workspace is registered and gated by the Finance entity permission', () => {
  assert.match(routes, /path:\s*'finance'[\s\S]*?name:\s*'finance-workspace'/);
  assert.match(routes, /component:\s*\(\)\s*=>\s*import\('@\/features\/finance\/FinanceWorkspaceView\.vue'\)/);
  assert.match(routes, /props:\s*\{\s*labels:\s*financeWorkspaceLabels\s*\}/);
  assert.match(routes, /meta:\s*\{\s*permission:\s*'finance\.entity\.view'\s*\}/);
});
