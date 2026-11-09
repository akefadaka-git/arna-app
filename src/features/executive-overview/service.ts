import { getExecutiveOverview } from './api';
import type { InjectionKey } from 'vue';

export const executiveOverviewRequestKey: InjectionKey<typeof getExecutiveOverview> = Symbol('executiveOverviewRequest');

export { getExecutiveOverview };
export type {
  ExecutiveOverviewFinanceValue,
  ExecutiveOverviewFinanceWidget,
  ExecutiveOverviewResponse,
} from './api';
