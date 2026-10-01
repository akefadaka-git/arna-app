/*
 * =============================================================================
 * MASES Phase 2 UI — Error Route Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/error-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.4, §14.5
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The three error variants rendered by router/pages/ErrorRoute.vue —
 * 404 (not-found), 503 (maintenance), and 403 (access-denied) — as
 * Amharic constants, plus the shared ErrorSupportPanel labels.
 *
 * Consumed by: router/pages/ErrorRoute.vue.
 * =============================================================================
 */

import type {
  ErrorPageAction,
  ErrorPageLabels,
} from '@/components/patterns/ErrorPage';
import type { AccessDeniedLabels } from '@/components/patterns/AccessDeniedPage';

// =============================================================================
// Shared support-panel labels
// =============================================================================

/**
 * The ErrorSupportPanel labels, shared by the 404, 503, and 403
 * variants.
 */
export const errorSupportLabels: ErrorPageLabels['support'] = {
  toggle: 'ቴክኒካዊ ዝርዝሮች',
  errorCode: 'ኮድ',
  requestId: 'ማጣቀሻ',
  timestamp: 'ጊዜ',
  occurredAt: 'የአካባቢ ጊዜ',
  copy: 'ቅዳ',
  copied: 'ተቀድቷል',
  copyFallbackInstruction:
    'ከታች ያለውን ጽሑፍ ይምረጡና በእጅ ይቅዱ።',
};

// =============================================================================
// 404 — Not found
// =============================================================================

export const errorNotFoundStatusLabel = 'አልተገኘም';

export const errorNotFoundTitle = 'ገጹ አልተገኘም';

export const errorNotFoundMessage =
  'የፈለጉት ገጽ የለም፣ ወይም ተዛውሮ ሊሆን ይችላል።';

export const errorNotFoundPageLabels: ErrorPageLabels = {
  support: errorSupportLabels,
};

export const errorNotFoundActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'home', label: 'ወደ መነሻ ሂድ', variant: 'primary' },
];

// =============================================================================
// 503 — Maintenance
// =============================================================================

export const errorMaintenanceStatusLabel = 'አገልግሎቱ አይገኝም';

export const errorMaintenanceTitle = 'በጊዜያዊነት አገልግሎት ላይ ነን';

export const errorMaintenanceMessage =
  'አገልግሎቱ በጥገና ላይ ነው። እባክዎ በጥቂት ደቂቃዎች ውስጥ እንደገና ይሞክሩ።';

export const errorMaintenancePageLabels: ErrorPageLabels = {
  support: errorSupportLabels,
};

export const errorMaintenanceActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'retry', label: 'እንደገና ይሞክሩ', variant: 'primary' },
];

// =============================================================================
// 403 — Access denied
// =============================================================================

export const errorAccessDeniedLabels: AccessDeniedLabels = {
  title: 'መዳረሻ ተከልክሏል',
  message:
    'ይህን ገጽ ለመመልከት ፈቃድ የለዎትም። ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።',
  statusLabel: 'የተከለከለ',
  launcher: 'ወደ መነሻ ተመለስ',
  fileHint:
    'ይህን ተግባር ለማከናወን ተጨማሪ ቀጥተኛ ፈቃዶች ሊያስፈልጉዎት ይችላሉ።',
  support: errorSupportLabels,
};