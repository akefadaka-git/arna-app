import {
  listGovernanceBodies,
  listGovernanceMemberships,
} from './api';
import type { GovernanceBody, GovernanceMembership } from './api';

export interface GovernancePersonDirectoryEntry {
  readonly membership: GovernanceMembership;
  readonly body: GovernanceBody;
}

/**
 * Builds a tenant-scoped directory from the existing body and membership
 * read APIs. No profile/photo/contact/project/task fields are synthesized.
 * Each request remains subject to backend authorization.
 */
export async function fetchGovernancePeopleDirectory(): Promise<GovernancePersonDirectoryEntry[]> {
  const bodiesPage = await listGovernanceBodies({ page: 1, per_page: 200 });
  const bodies = bodiesPage.items;
  const entries: GovernancePersonDirectoryEntry[] = [];

  // Bound concurrency so a tenant with many governance bodies does not
  // create an unbounded request burst from one page load.
  for (let offset = 0; offset < bodies.length; offset += 5) {
    const batch = bodies.slice(offset, offset + 5);
    const results = await Promise.all(batch.map(async (body) => {
      const page = await listGovernanceMemberships(body.id, { page: 1, per_page: 200 });
      return page.items.map((membership) => ({ membership, body }));
    }));
    entries.push(...results.flat());
  }

  return entries.sort((a, b) =>
    a.membership.display_name.localeCompare(b.membership.display_name, 'am'),
  );
}
