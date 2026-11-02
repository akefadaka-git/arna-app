/**
 * Election-domain wire contracts.
 *
 * These are design-time contracts for the A3 integration. They must not be
 * used to call an API endpoint until the corresponding API controller,
 * permission mapping and route are delivered and verified.
 */
export type ElectionStatus =
  | 'planned'
  | 'nominating'
  | 'voting'
  | 'counting'
  | 'certified'
  | 'cancelled';

export type ElectionVotingMethod = 'physical';

export interface GovernanceElectionSummary {
  readonly id: number;
  readonly code: string;
  readonly title: string;
  readonly status: ElectionStatus;
  readonly voting_method: ElectionVotingMethod;
  readonly record_date: string | null;
  readonly authority_verified: boolean;
  readonly voting_rule_version: string | null;
}

export interface ElectionRegisterSnapshotSummary {
  readonly id: number;
  readonly election_id: number;
  readonly record_date: string;
  readonly source_reference: string;
  readonly rule_version: string;
  readonly content_sha256: string;
  readonly voter_count: number;
  readonly frozen_at: string;
}

export interface ElectionVoterEntitlement {
  readonly shareholder_id: number;
  readonly share_class_code: string;
  readonly share_quantity: string;
  readonly voting_weight: string;
  readonly entitlement_reference: string;
  readonly proxy_authorized: boolean;
}

export interface PhysicalBallotCustodyRecord {
  readonly id: number;
  readonly election_id: number;
  readonly voter_id: number;
  readonly ballot_reference: string;
  readonly channel: 'physical';
  readonly status: 'issued' | 'received' | 'voided';
  readonly custody_reference: string | null;
  readonly issued_at: string | null;
  readonly received_at: string | null;
}

export interface ElectionEvidenceReference {
  readonly reference: string;
  readonly kind:
    | 'authority_instrument'
    | 'register_source'
    | 'voting_rule'
    | 'ballot_custody'
    | 'count_sheet'
    | 'reconciliation'
    | 'certification';
}
