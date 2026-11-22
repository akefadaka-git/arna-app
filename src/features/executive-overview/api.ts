import { api } from '@/core/api/client';

export interface ExecutiveOverviewFinanceValue {
  readonly total_debits: string;
  readonly total_credits: string;
  readonly difference: string;
  readonly is_balanced: boolean;
}

export interface ExecutiveOverviewFinanceWidget {
  readonly key: 'finance.trial_balance';
  readonly status: 'available';
  readonly source: {
    readonly domain: 'finance';
    readonly report_key: 'trial_balance';
    readonly calculation_version: string;
  };
  readonly entity: {
    readonly code: string;
    readonly name_am: string;
    readonly name_en: string;
  };
  readonly as_of: string;
  readonly currency: string;
  readonly value: ExecutiveOverviewFinanceValue;
}

export interface ExecutiveOverviewWorkforceWidget {
  readonly key: 'people.workforce.active';
  readonly status: 'available';
  readonly source: {
    readonly domain: 'people';
    readonly metric_key: 'active_workforce';
    readonly calculation_version: string;
  };
  readonly observed_at: string;
  readonly value: {
    readonly active: number;
  };
}

export type ExecutiveOverviewWidget =
  | ExecutiveOverviewFinanceWidget
  | ExecutiveOverviewWorkforceWidget;

export interface ExecutiveOverviewResponse {
  readonly status: 'complete' | 'partial';
  readonly contract_version: string;
  readonly generated_at: string;
  readonly widgets: readonly ExecutiveOverviewWidget[];
}

export function getExecutiveOverview(options?: { signal?: AbortSignal }): Promise<ExecutiveOverviewResponse> {
  return api.get<ExecutiveOverviewResponse>('/api/dashboard/v1/overview', options);
}
