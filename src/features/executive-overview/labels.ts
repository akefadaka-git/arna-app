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
