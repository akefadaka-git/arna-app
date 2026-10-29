import type { RouteRecordRaw } from 'vue-router';
import { organizationUnitsViewLabelsAm } from './labels';

/**
 * Organization-owned route definitions.
 * The workspace router imports this module as a single integration point;
 * Organization feature implementation stays under src/features/organization/.
 */
export const organizationWorkspaceRoutes: RouteRecordRaw[] = [
  {
    path: 'organization/units',
    name: 'organization-units',
    component: () => import('./OrganizationUnitsView.vue'),
    props: { labels: organizationUnitsViewLabelsAm },
    meta: { permission: 'organization.unit.view' },
  },
  {
    path: 'organization/units/:id',
    name: 'organization-unit-detail',
    component: () => import('./OrganizationUnitDetailView.vue'),
    meta: { permission: 'organization.unit.view' },
  },
];
