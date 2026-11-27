import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const routes = read('../src/router/routes-workspace.ts');
const api = read('../src/features/governance/electionSourceSnapshotsApi.ts');
const snapshotView = read('../src/features/governance/ElectionSourceSnapshotView.vue');
const labels = read('../src/features/governance/electionLabels.ts');
const overview = read('../src/features/governance/GovernanceOverviewView.vue');

test('Board Election workspace routes require the corresponding backend permissions', () => {
  assert.match(routes, /path: 'governance\/elections',[\s\S]*?meta: \{ permission: 'governance\.election\.view' \}/);
  assert.match(routes, /path: 'governance\/elections\/:electionId\/shareholder-source-snapshots',[\s\S]*?meta: \{ permission: 'governance\.election\.register\.view' \}/);
});

test('source snapshot client uses the versioned Governance API contract and explicit record-date input', () => {
  assert.match(api, /\/api\/governance\/elections\/\$\{electionId\}\/shareholder-source-snapshots/);
  assert.match(api, /record_date_time: recordDateTime/);
  assert.match(api, /\/reconcile/);
});

test('source snapshot workspace keeps electorate and voting decisions fail-closed', () => {
  assert.match(api, /blocked_unverified/);
  assert.match(labels, /No voter eligibility or voting weight is calculated/);
  assert.doesNotMatch(snapshotView, /voter_eligible|voting_weight|submitBallot|castVote/i);
  assert.match(snapshotView, /governance\.election\.register\.prepare/);
  assert.match(snapshotView, /governance\.election\.register\.reconcile/);
});

test('Governance overview exposes the Board Election workspace only to election viewers', () => {
  assert.match(overview, /canViewElections = computed\(\(\) => auth\.hasPermission\('governance\.election\.view'\)\)/);
  assert.match(overview, /v-if="canViewElections"[\s\S]*?to="\/governance\/elections"/);
});
