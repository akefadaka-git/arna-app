import type { RouteRecordRaw } from 'vue-router';

/** Governance-owned route definitions; the workspace router composes this module. */
export const governanceMeetingRoutes: RouteRecordRaw[] = [
  {
    path: 'governance/meetings',
    name: 'governance-meetings',
    component: () => import('./GovernanceMeetingsView.vue'),
    meta: { permission: 'governance.meeting.view' },
  },
  {
    path: 'governance/elections',
    name: 'governance-elections',
    component: () => import('./GovernanceElectionsView.vue'),
    meta: { permission: 'governance.election.view' },
  },
];
