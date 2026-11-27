import { api } from '@/core/api/client';

export interface GovernanceElectionSummary {
  readonly id: number;
  readonly code: string;
  readonly title_am: string | null;
  readonly title_en: string | null;
  readonly election_scope: string;
  readonly election_type: string;
  readonly status: string;
  readonly timezone: string;
  readonly authority_verified_at: string | null;
  readonly version: number;
}

export interface PaginatedGovernanceElections {
  readonly data: readonly GovernanceElectionSummary[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

export interface ElectionSourceSnapshot {
  readonly id: number;
  readonly election_id: number;
  readonly version: number;
  readonly record_date_time_utc: string;
  readonly record_date_timezone: string;
  readonly database_timezone: string;
  readonly captured_at_utc: string;
  readonly source_digest: string;
  readonly manifest_digest: string;
  readonly shareholder_count: number;
  readonly holding_count: number;
  readonly ledger_entry_count: number;
  readonly snapshot_state: string;
  readonly electorate_state: 'blocked_unverified' | string;
  readonly prepared_by: number;
  readonly prepared_at_utc: string;
}

export interface ElectionSourceSnapshotHolder {
  readonly shareholder_id: number;
  readonly shareholder_number: string | null;
  readonly shareholder_type: string;
  readonly person_id: number | null;
  readonly direct_user_id: number | null;
  readonly representative_user_id: number | null;
  readonly current_status: string;
  readonly identity_temporal_state: string;
  readonly holder_digest: string;
  readonly holding_count: number;
}

export interface ElectionSourceSnapshotHolding {
  readonly shareholder_id: number;
  readonly source_holding_id: number;
  readonly share_class_code: string;
  readonly quantity_at_cutoff: string;
  readonly current_projection: string;
  readonly ledger_entry_count: number;
  readonly ledger_digest: string;
  readonly source_state: string;
}

export interface ElectionSourceSnapshotEntry {
  readonly source_holding_id: number;
  readonly source_entry_id: number;
  readonly entry_digest: string;
  readonly included_by_business_time: boolean;
}

export interface ElectionSourceSnapshotReconciliation {
  readonly id: number;
  readonly observed_source_digest: string;
  readonly result: 'matched' | 'changed';
  readonly reason: string;
  readonly reconciled_by: number;
  readonly reconciled_at_utc: string;
}

export interface ElectionSourceSnapshotDetail {
  readonly snapshot: ElectionSourceSnapshot;
  readonly holders: readonly ElectionSourceSnapshotHolder[];
  readonly holdings: readonly ElectionSourceSnapshotHolding[];
  readonly source_entries: readonly ElectionSourceSnapshotEntry[];
  readonly reconciliations: readonly ElectionSourceSnapshotReconciliation[];
}

export interface ElectionSourceSnapshotReconciliationResult {
  readonly snapshot_id: number;
  readonly reconciliation_id: number;
  readonly result: 'matched' | 'changed';
  readonly observed_source_digest: string;
  readonly electorate_state: 'blocked_unverified' | string;
  readonly message: string;
}

export function listGovernanceElections(): Promise<PaginatedGovernanceElections> {
  return api.get<PaginatedGovernanceElections>('/api/governance/elections', {
    params: { per_page: 100 },
  });
}

export function getGovernanceElection(electionId: number): Promise<GovernanceElectionSummary> {
  return api.get<GovernanceElectionSummary>(`/api/governance/elections/${electionId}`);
}

export function listElectionSourceSnapshots(electionId: number): Promise<readonly ElectionSourceSnapshot[]> {
  return api.get<readonly ElectionSourceSnapshot[]>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots`,
  );
}

export function getElectionSourceSnapshot(
  electionId: number,
  snapshotId: number,
): Promise<ElectionSourceSnapshotDetail> {
  return api.get<ElectionSourceSnapshotDetail>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots/${snapshotId}`,
  );
}

export function captureElectionSourceSnapshot(
  electionId: number,
  recordDateTime: string,
): Promise<ElectionSourceSnapshot> {
  return api.post<ElectionSourceSnapshot>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots`,
    { record_date_time: recordDateTime },
  );
}

export function reconcileElectionSourceSnapshot(
  electionId: number,
  snapshotId: number,
  reason: string,
): Promise<ElectionSourceSnapshotReconciliationResult> {
  return api.post<ElectionSourceSnapshotReconciliationResult>(
    `/api/governance/elections/${electionId}/shareholder-source-snapshots/${snapshotId}/reconcile`,
    { reason },
  );
}
