import { api } from '@/core/api/client';

export interface ExecutiveOverviewEntity {
  readonly id: number;
  readonly code: string;
  readonly name_am: string | null;
  readonly name_en: string | null;
  readonly base_currency: string;
  readonly status: string;
}

interface EntityPage {
  readonly data: readonly ExecutiveOverviewEntity[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

export interface TrialBalanceSummary {
  readonly total_debits: string;
  readonly total_credits: string;
  readonly difference: string;
  readonly is_balanced: boolean;
  readonly currency: string;
}

export interface ExecutiveOverviewPayload {
  readonly contract_version: string;
  readonly generated_at: string;
  readonly scope: {
    readonly entity_ref: string;
    readonly entity_name: { readonly am: string | null; readonly en: string | null };
    readonly as_of: string;
    readonly currency: string;
  };
  readonly widgets: readonly [{
    readonly key: 'finance.trial_balance';
    readonly status: 'available';
    readonly value: TrialBalanceSummary;
    readonly unit: 'currency';
    readonly source: {
      readonly domain: 'finance';
      readonly report_key: 'trial_balance';
      readonly calculation_version: string;
    };
    readonly as_of: string;
    readonly freshness: 'current';
  }];
  readonly omitted_widgets: readonly unknown[];
}

export async function listExecutiveOverviewEntities(): Promise<readonly ExecutiveOverviewEntity[]> {
  const page = await api.get<EntityPage>('/api/finance/entities', {
    params: { per_page: 100 },
  });

  if (!page || !Array.isArray(page.data)) {
    throw new Error('The Finance entity endpoint returned an invalid page.');
  }

  return page.data.filter((entity) =>
    Number.isInteger(entity.id) &&
    typeof entity.code === 'string' &&
    typeof entity.base_currency === 'string',
  );
}

export async function fetchExecutiveOverview(
  entityCode: string,
  asOf: string,
): Promise<ExecutiveOverviewPayload> {
  const result = await api.get<ExecutiveOverviewPayload>('/api/dashboard/v1/overview', {
    params: { entity_code: entityCode, as_of: asOf },
  });

  const widget = result?.widgets?.[0];
  const value = widget?.value;
  if (
    result?.contract_version !== '1.0' ||
    widget?.key !== 'finance.trial_balance' ||
    widget.status !== 'available' ||
    !value ||
    typeof value.total_debits !== 'string' ||
    typeof value.total_credits !== 'string' ||
    typeof value.difference !== 'string' ||
    typeof value.is_balanced !== 'boolean' ||
    typeof value.currency !== 'string'
  ) {
    throw new Error('The Executive Overview endpoint returned an invalid contract.');
  }

  return result;
}
