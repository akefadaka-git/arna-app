import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [routes, shell, api, view] = await Promise.all([
  readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/shell-labels.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/executive-overview/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/executive-overview/ExecutiveOverviewView.vue', import.meta.url), 'utf8'),
]);

test('Executive Overview is a separate permission-gated workspace route', () => {
  assert.match(routes, /path:\s*'executive-overview'[\s\S]*?name:\s*'executive-overview'/);
  assert.match(routes, /ExecutiveOverviewView\.vue/);
  assert.match(routes, /finance\.entity\.view'[\s\S]*?finance\.report\.view'[\s\S]*?permissionMode:\s*'all'/);
  assert.match(routes, /dashboardViewLabels/);
});

test('Executive Overview navigation is independently permission-filtered', () => {
  assert.match(shell, /id:\s*'executive-overview'[\s\S]*?to:\s*'\/executive-overview'[\s\S]*?permission:\s*'finance\.report\.view'/);
});

test('Executive Overview reads the authoritative dashboard API and preserves decimal strings', () => {
  assert.match(api, /\/api\/dashboard\/v1\/overview/);
  assert.match(api, /total_debits:\s*string/);
  assert.doesNotMatch(view, /Number\(trialBalance\.value\./);
});
