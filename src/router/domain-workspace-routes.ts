import type { RouteRecordRaw } from 'vue-router';
import type { NavItem } from '@/layouts/AppShell';

/**
 * Discover domain-owned route/navigation exports without hard-coding
 * cross-domain imports in the shared workspace shell. This keeps each
 * feature branch buildable independently while composing all domains
 * once their feature route modules are present.
 */
const featureRouteModules = import.meta.glob('../features/**/routes.ts', { eager: true });
const exportedArrays = Object.values(featureRouteModules).flatMap((module) =>
  Object.values(module as Record<string, unknown>).filter(Array.isArray) as unknown[][]
);

export const domainWorkspaceRoutes: RouteRecordRaw[] = exportedArrays
  .flatMap((items) => items)
  .filter((item): item is RouteRecordRaw =>
    typeof item === 'object' && item !== null && 'path' in item && 'component' in item
  );

export const domainWorkspaceNavItems: ReadonlyArray<NavItem> = exportedArrays
  .flatMap((items) => items)
  .filter((item): item is NavItem =>
    typeof item === 'object' && item !== null && 'id' in item && 'label' in item && 'to' in item && 'permission' in item
  );
