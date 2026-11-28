import { api } from '@/core/api/client';

export interface GovernanceElectionSummary {
  readonly id: number;
  readonly code: string;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly election_scope: string;
  readonly election_type: string;
  readonly status: string;
  readonly authority_verified_at: string | null;
  readonly timezone: string;
  readonly version: number;
}

export interface PaginatedGovernanceElections {
  readonly data: readonly GovernanceElectionSummary[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface GovernanceElectionSourceSnapshot {
  readonly id: number;
  readonly tenant_id: number;
  readonly election_id: number;
  readonly version: number;
  readonly source_schema_version: string;
  readonly record_date_time_utc: string;
  readonly record_date_timezone: string;
  readonly database_timezone: string;
  readonly captured_at_utc: string;
  readonly source_digest: string;
  readonly manifest_digest: string;
  readonly shareholder_count: number;
  readonly holding_count: number;
  readonly ledger_entry_count: number;
  readonly snapshot_state: 'captured';
  readonly electorate_state: 'blocked_unverified';
  readonly prepared_by: number;
  readonly prepared_at_utc: string;
  readonly reconciliations?: readonly GovernanceElectionSourceReconciliation[];
}

export interface GovernanceElectionSourceReconciliation {
  readonly id: number;
  readonly result: 'matched' | 'changed';
  readonly reason: string;
  readonly observed_source_digest: string;
  readonly reconciled_by: number;
  readonly reconciled_at_utc: string;
}

export interface GovernanceElectionSourceSnapshotHolder {
  readonly shareholder_id: number;
  readonly shareholder_number: string | null;
  readonly shareholder_type: string;
  readonly person_id: number | null;
  readonly direct_user_id: number | null;
  readonly representative_user_id: number | null;
  readonly current_status: string;
  readonly identity_temporal_state: 'unresolved_no_effective_dated_history';
  readonly holder_digest: string;
  readonly holding_count: number;
}

export interface GovernanceElectionSourceSnapshotHolding {
  readonly shareholder_id: number;
  readonly source_holding_id: number;
  readonly share_class_id: number;
  readonly share_class_code: string;
  readonly quantity_at_cutoff: string;
  readonly current_projection: string;
  readonly ledger_entry_count: number;
  readonly ledger_digest: string;
  readonly source_state: 'ledger_chain_validated';
}

export interface GovernanceElectionSourceSnapshotEntry {
  readonly source_holding_id: number;
  readonly source_entry_id: number;
  readonly entry_digest: string;
  readonly included_by_business_time: boolean;
}

export interface GovernanceElectionSourceSnapshotDetail {
  readonly snapshot: GovernanceElectionSourceSnapshot;
  readonly holders: readonly GovernanceElectionSourceSnapshotHolder[];
  readonly holdings: readonly GovernanceElectionSourceSnapshotHolding[];
  readonly source_entries: readonly GovernanceElectionSourceSnapshotEntry[];
  readonly reconciliations: readonly GovernanceElectionSourceReconciliation[];
}

export interface GovernanceElectionSourceReconciliationResult {
  readonly snapshot_id: number;
  readonly reconciliation_id: number;
  readonly result: 'matched' | 'changed';
  readonly observed_source_digest: string;
  readonly electorate_state: 'blocked_unverified';
  readonly message: string;
}

export async function listGovernanceElections(): Promise<PaginatedGovernanceElections> {
  return api.get<PaginatedGovernanceElections>('/api/governance/elections', {
    params: { per_page: 100 },
  });
}

export async function listElectionSourceSnapshots(
  electionId: number,
): Promise<readonly GovernanceElectionSourceSnapshot[]> {
  return api.get<readonly GovernanceElectionSourceSnapshot[]>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots`,
  );
}

export async function createElectionSourceSnapshot(
  electionId: number,
  recordDateTime: string,
): Promise<GovernanceElectionSourceSnapshot> {
  return api.post<GovernanceElectionSourceSnapshot>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots`,
    { record_date_time: recordDateTime },
  );
}

export async function getElectionSourceSnapshot(
  electionId: number,
  snapshotId: number,
): Promise<GovernanceElectionSourceSnapshotDetail> {
  return api.get<GovernanceElectionSourceSnapshotDetail>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots/${snapshotId}`,
  );
}

export async function reconcileElectionSourceSnapshot(
  electionId: number,
  snapshotId: number,
  reason: string,
): Promise<GovernanceElectionSourceReconciliationResult> {
  return api.post<GovernanceElectionSourceReconciliationResult>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots/${snapshotId}/reconcile`,
    { reason },
  );
}
