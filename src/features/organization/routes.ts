import type { RouteRecordRaw } from 'vue-router';
import { organizationUnitsViewLabelsAm, organizationUnitsViewLabelsEn } from './labels';

const language = typeof navigator === 'undefined' ? 'am' : navigator.language.toLowerCase();
const organizationLabels = language.startsWith('am') ? organizationUnitsViewLabelsAm : organizationUnitsViewLabelsEn;

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
    props: { labels: organizationLabels },
    meta: { permission: 'organization.unit.view' },
  },
  {
    path: 'organization/units/:id',
    name: 'organization-unit-detail',
    component: () => import('./OrganizationUnitDetailView.vue'),
    props: { labels: organizationLabels },
    meta: { permission: 'organization.unit.view' },
  },

  {
    path: 'organization/units/:id/assignments',
    name: 'organization-unit-assignments',
    component: () => import('./OrganizationAssignmentsView.vue'),
    meta: { permission: 'organization.assignment.view' },
  },
  {
    path: 'organization/audit',
    name: 'organization-audit',
    component: () => import('./OrganizationAuditView.vue'),
    meta: { permission: 'organization.audit.view' },
  },
];
