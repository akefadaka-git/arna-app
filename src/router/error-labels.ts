/*
 * ARNA error-route labels — Amharic-first.
 * All visible copy for the shared error routes lives here.
 */
import type { ErrorPageAction, ErrorPageLabels } from '@/components/patterns/ErrorPage';
import type { AccessDeniedLabels } from '@/components/patterns/AccessDeniedPage';

export const errorSupportLabels: ErrorPageLabels['support'] = {
  toggle: 'ቴክኒካዊ ዝርዝሮች',
  errorCode: 'የስህተት ኮድ',
  requestId: 'የጥያቄ ማጣቀሻ',
  timestamp: 'ጊዜ',
  occurredAt: 'የአካባቢ ጊዜ',
  copy: 'ቅዳ',
  copied: 'ተቀድቷል',
  copyFallbackInstruction: 'ከታች ያለውን ጽሑፍ ይምረጡና በእጅ ይቅዱ።',
};

export const errorCommonActionLabels = {
  navigation: 'የስህተት ገጽ አማራጮች',
  back: 'ወደ ቀደመው ገጽ ተመለስ',
  report: 'ችግሩን ሪፖርት አድርግ',
  contact: 'ድጋፍን አግኝ',
};

export const errorNotFoundStatusLabel = 'አልተገኘም';
export const errorNotFoundTitle = 'ገጹ አልተገኘም';
export const errorNotFoundMessage = 'የፈለጉት ገጽ የለም፣ ወይም ተዛውሮ ሊሆን ይችላል።';
export const errorNotFoundPageLabels: ErrorPageLabels = { support: errorSupportLabels };
export const errorNotFoundActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'home', label: 'ወደ መነሻ ሂድ', variant: 'primary' },
];

export const errorMaintenanceStatusLabel = 'አገልግሎቱ አይገኝም';
export const errorMaintenanceTitle = 'በጊዜያዊነት አገልግሎት ላይ ነን';
export const errorMaintenanceMessage = 'አገልግሎቱ በጥገና ላይ ነው። እባክዎ በጥቂት ደቂቃዎች ውስጥ እንደገና ይሞክሩ።';
export const errorMaintenancePageLabels: ErrorPageLabels = { support: errorSupportLabels };
export const errorMaintenanceActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'retry', label: 'እንደገና ይሞክሩ', variant: 'primary' },
  { id: 'home', label: 'ወደ መነሻ ሂድ', variant: 'secondary' },
];

export const errorServerStatusLabel = 'የአገልግሎት ስህተት';
export const errorServerTitle = 'ያልተጠበቀ ስህተት ተፈጥሯል';
export const errorServerMessage = 'ጥያቄዎን ማጠናቀቅ አልተቻለም። እባክዎ እንደገና ይሞክሩ፤ ችግሩ ከቀጠለ ለድጋፍ ያሳውቁ።';
export const errorServerPageLabels: ErrorPageLabels = { support: errorSupportLabels };
export const errorServerActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'retry', label: 'እንደገና ይሞክሩ', variant: 'primary' },
  { id: 'home', label: 'ወደ መነሻ ሂድ', variant: 'secondary' },
];

export const errorAccessDeniedLabels: AccessDeniedLabels = {
  title: 'መዳረሻ ተከልክሏል',
  message: 'ይህን ገጽ ለመመልከት ፈቃድ የለዎትም። ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።',
  statusLabel: 'የተከለከለ',
  launcher: 'ወደ መነሻ ተመለስ',
  fileHint: 'ይህን ተግባር ለማከናወን ተጨማሪ ቀጥተኛ ፈቃዶች ሊያስፈልጉዎት ይችላሉ።',
  support: errorSupportLabels,
};
