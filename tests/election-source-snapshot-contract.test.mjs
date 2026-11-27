import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Board Election list and source-register routes are permission-gated and navigable', async () => {
  const routes = await read('../src/router/routes-workspace.ts');
  const navigation = await read('../src/router/shell-labels.ts');

  assert.ok(routes.includes("path: 'governance/elections'"));
  assert.ok(routes.includes("name: 'governance-elections'"));
  assert.ok(routes.includes("meta: { permission: 'governance.election.view' }"));
  assert.ok(routes.includes("path: 'governance/elections/:id/shareholder-source'"));
  assert.ok(routes.includes("name: 'governance-election-source-register'"));
  assert.ok(routes.includes("permission: ['governance.election.view', 'governance.election.register.view']"));
  assert.ok(routes.includes("permissionMode: 'all'"));
  assert.ok(navigation.includes("to: '/governance/elections'"));
  assert.ok(navigation.includes("permission: 'governance.election.view'"));
});

test('Shareholder source API adapter calls only the declared tenant election endpoints', async () => {
  const api = await read('../src/features/elections/source-snapshot-api.ts');

  for (const endpoint of [
    '/api/governance/elections',
    '/authority-evidence',
    '/committee/members',
    '/shareholder-source-snapshots',
    '/reconcile',
  ]) {
    assert.ok(api.includes(endpoint), `Missing API endpoint contract: ${endpoint}`);
  }
  assert.ok(api.includes('record_date_time: recordDateTime'));
  assert.ok(api.includes('reason'));
  assert.ok(api.includes("'blocked_unverified'"));
});

test('source-register UI is evidence-only and does not calculate electorate decisions', async () => {
  const view = await read('../src/features/elections/ElectionSourceSnapshotView.vue');
  const api = await read('../src/features/elections/source-snapshot-api.ts');

  assert.ok(view.includes('governance.election.register.prepare'));
  assert.ok(view.includes('governance.election.register.reconcile'));
  assert.ok(view.includes('canViewAuthority'));
  assert.ok(view.includes('canViewCommittee'));
  assert.ok(view.includes('does not record, review or verify legal authority'));
  assert.ok(view.includes('No appointment, revocation, administrator grant or conflict action'));
  assert.ok(view.includes('preparer cannot reconcile their own snapshot'));
  assert.ok(view.includes('does not verify statutory ownership, voter eligibility, voting weight'));
  assert.ok(view.includes('blocked_unverified'));
  assert.ok(view.includes('selected.source_entries'));
  assert.ok(view.includes('record_date_timezone'));
  assert.ok(view.includes('database_timezone'));
  assert.ok(!view.includes('voting_weight'));
  assert.ok(!view.includes('voter_eligible'));
  assert.ok(!view.includes('ballot'));
  assert.ok(!api.includes('verifyElectionAuthority'));
  assert.ok(!api.includes('appointElectionCommittee'));
});
