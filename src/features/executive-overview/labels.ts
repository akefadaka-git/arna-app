export interface ExecutiveOverviewLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly loadingMessage: string;
  readonly errorTitle: string;
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
