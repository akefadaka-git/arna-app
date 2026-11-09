export interface ExecutiveOverviewLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly loadingMessage: string;
  readonly errorTitle: string;
  readonly errorDescription: string;
  readonly forbiddenTitle: string;
  readonly forbiddenDescription: string;
  readonly unavailableTitle: string;
  readonly unavailableDescription: string;
  readonly partialDataMessage: string;
  readonly retryLabel: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly financeTitle: string;
  readonly debitLabel: string;
  readonly creditLabel: string;
  readonly differenceLabel: string;
  readonly balancedLabel: string;
  readonly unbalancedLabel: string;
  readonly asOfLabel: string;
  readonly generatedAtLabel: string;
}

export const executiveOverviewLabels: ExecutiveOverviewLabels = {
  pageTitle: 'የአስፈጻሚ አጠቃላይ እይታ',
  pageDescription: 'በእርስዎ የተፈቀደ የድርጅት ወሰን ውስጥ ያሉ የተረጋገጡ መለኪያዎች።',
  loadingMessage: 'መለኪያዎችን በመጫን ላይ…',
  errorTitle: 'አጠቃላይ እይታውን ማምጣት አልተቻለም።',
  errorDescription: 'እባክዎ እንደገና ይሞክሩ።',
  forbiddenTitle: 'ይህን እይታ ለማግኘት ፈቃድ የለዎትም።',
  forbiddenDescription: 'የመዳረሻ ፈቃድዎን ያረጋግጡ።',
  unavailableTitle: 'አገልግሎቱ ለጊዜው አይገኝም።',
  unavailableDescription: 'እባክዎ ቆይተው እንደገና ይሞክሩ።',
  partialDataMessage: 'አንዳንድ የተረጋገጡ መረጃዎች ብቻ ይታያሉ።',
  retryLabel: 'እንደገና ይሞክሩ',
  emptyTitle: 'አሁን የሚታዩ የተረጋገጡ መለኪያዎች የሉም',
  emptyDescription: 'ለእርስዎ የተፈቀደ እና የተረጋገጠ መረጃ ሲኖር እዚህ ይታያል።',
  financeTitle: 'የፋይናንስ ሚዛን',
  debitLabel: 'ጠቅላላ ዴቢት',
  creditLabel: 'ጠቅላላ ክሬዲት',
  differenceLabel: 'ልዩነት',
  balancedLabel: 'ሚዛኑ ተጠብቋል',
  unbalancedLabel: 'ሚዛኑ አልተጠበቀም',
  asOfLabel: 'እስከ',
  generatedAtLabel: 'የተፈጠረበት ጊዜ',
};

export const executiveOverviewEnglishLabels: ExecutiveOverviewLabels = {
  pageTitle: 'Executive Overview',
  pageDescription: 'Verified metrics within the organization scope you are authorized to access.',
  loadingMessage: 'Loading verified metrics…',
  errorTitle: 'The Executive Overview could not be loaded.',
  errorDescription: 'Please try again.',
  forbiddenTitle: 'You are not authorized to view this overview.',
  forbiddenDescription: 'Check your access with an authorized administrator.',
  unavailableTitle: 'The service is temporarily unavailable.',
  unavailableDescription: 'Please try again later.',
  partialDataMessage: 'Only some verified information is currently available.',
  retryLabel: 'Retry',
  emptyTitle: 'No verified metrics are currently available',
  emptyDescription: 'Authorized, verified metrics will appear here when their source contracts are available.',
  financeTitle: 'Trial Balance',
  debitLabel: 'Total debits',
  creditLabel: 'Total credits',
  differenceLabel: 'Difference',
  balancedLabel: 'Balanced',
  unbalancedLabel: 'Out of balance',
  asOfLabel: 'As of',
  generatedAtLabel: 'Generated at',
};
