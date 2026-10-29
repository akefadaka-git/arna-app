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

/** Governance-owned navigation metadata; composed with domain routes. */
export const governanceWorkspaceNavItems = [
  {
    id: 'governance-meetings',
    label: 'የአስተዳደር ስብሰባዎች',
    to: '/governance/meetings',
    icon: 'calendar-days',
    permission: 'governance.meeting.view',
  },
  {
    id: 'governance-elections',
    label: 'የአስተዳደር ምርጫዎች',
    to: '/governance/elections',
    icon: 'vote',
    permission: 'governance.election.view',
  },
] as const;
