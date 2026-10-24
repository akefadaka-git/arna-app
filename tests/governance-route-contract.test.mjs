import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('governance overview is permission-gated and reachable from workspace navigation', async () => {
  const routes = await read('../src/router/routes-workspace.ts');
  const navigation = await read('../src/router/shell-labels.ts');

  assert.ok(routes.includes("path: 'governance'"), 'Missing governance overview route');
  assert.ok(routes.includes("name: 'governance-overview'"), 'Missing stable overview route name');
  assert.ok(routes.includes("component: () => import('@/features/governance/GovernanceOverviewView.vue')"));
  assert.ok(routes.includes("meta: { permission: 'governance.body.view' }"));
  assert.ok(navigation.includes("to: '/governance'"), 'Workspace navigation must open the overview');
  assert.ok(navigation.includes("permission: 'governance.body.view'"));
});

test('governance overview only claims API-supported governance records', async () => {
  const view = await read('../src/features/governance/GovernanceOverviewView.vue');
  const labels = await read('../src/features/governance/labels.ts');
  const service = await read('../src/features/governance/service.ts');

  assert.ok(view.includes('listGovernanceBodies({ page: 1 })'));
  assert.ok(labels.includes('governanceOverviewLabels'));
  assert.ok(service.includes('listGovernanceTerms'));
  assert.ok(service.includes('listGovernancePositions'));
  assert.ok(service.includes('listGovernanceAppointments'));
  assert.ok(service.includes('listGovernanceMemberships'));
  assert.ok(labels.includes('የAPI ድጋፍ ሲኖራቸው ብቻ'), 'Future meeting/decision/delegation pages must be explicitly gated on backend support');
});

test('governance body filters use only declared backend query parameters', async () => {
  const view = await read('../src/features/governance/GovernanceBodyListView.vue');
  const api = await read('../src/features/governance/api.ts');

  for (const control of [
    'governance-body-search',
    'governance-body-type',
    'governance-body-status',
    'applyFilters',
    'clearFilters',
  ]) {
    assert.ok(view.includes(control), `Missing governance filter control or handler: ${control}`);
  }

  for (const parameter of ['search', 'type', 'is_active']) {
    assert.ok(api.includes(parameter), `Backend query contract does not declare ${parameter}`);
    assert.ok(view.includes(parameter), `UI does not pass supported filter ${parameter}`);
  }

  assert.ok(view.includes("value=\"subcommittee\""));
  assert.ok(view.includes("value=\"ad_hoc\""));
});


test('people directory and profile routes are permission-gated and use declared membership APIs', async () => {
  const routes = await read('../src/router/routes-workspace.ts');
  const directory = await read('../src/features/governance/GovernancePeopleDirectoryView.vue');
  const profile = await read('../src/features/governance/GovernancePersonProfileView.vue');
  const service = await read('../src/features/governance/people-service.ts');
  const api = await read('../src/features/governance/api.ts');
  const overview = await read('../src/features/governance/GovernanceOverviewView.vue');

  assert.ok(routes.includes("path: 'governance/people'"));
  assert.ok(routes.includes("name: 'governance-people'"));
  assert.ok(routes.includes("path: 'governance/people/:bodyId/:membershipId'"));
  assert.ok(routes.includes("name: 'governance-person-profile'"));
  assert.ok((routes.match(/meta: { permission: 'governance.body.view' }/g) ?? []).length >= 4);
  assert.ok(overview.includes('to="/governance/people"'));
  assert.ok(directory.includes('people-search'));
  assert.ok(directory.includes('entry.membership.display_name'));
  assert.ok(directory.includes('entry.membership.position?.display_name'));
  assert.ok(profile.includes('fetchGovernanceBodyDetail'));
  assert.ok(profile.includes('person.start_date_display'));
  assert.ok(service.includes('listGovernanceBodies'));
  assert.ok(service.includes('listGovernanceMemberships'));
  assert.ok(api.includes('GovernanceMembershipUserSummary'));
  assert.ok(directory.includes('ፎቶ'), 'Unsupported photo data must be disclosed rather than fabricated');
  assert.ok(profile.includes('ፕሮጀክቶች'), 'Unsupported projects/tasks must be disclosed rather than fabricated');
});
