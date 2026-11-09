export interface ExecutiveOverviewLabelPair {
  readonly am: string;
  readonly en: string;
}

export interface ExecutiveOverviewLabels {
  readonly pageTitle: ExecutiveOverviewLabelPair;
  readonly pageDescription: ExecutiveOverviewLabelPair;
  readonly entityLabel: ExecutiveOverviewLabelPair;
  readonly asOfLabel: ExecutiveOverviewLabelPair;
  readonly refreshLabel: ExecutiveOverviewLabelPair;
  readonly loadingMessage: ExecutiveOverviewLabelPair;
  readonly emptyTitle: ExecutiveOverviewLabelPair;
  readonly emptyDescription: ExecutiveOverviewLabelPair;
  readonly loadErrorTitle: ExecutiveOverviewLabelPair;
  readonly retryLabel: ExecutiveOverviewLabelPair;
  readonly trialBalanceTitle: ExecutiveOverviewLabelPair;
  readonly totalDebitsLabel: ExecutiveOverviewLabelPair;
  readonly totalCreditsLabel: ExecutiveOverviewLabelPair;
  readonly differenceLabel: ExecutiveOverviewLabelPair;
  readonly balancedLabel: ExecutiveOverviewLabelPair;
  readonly unbalancedLabel: ExecutiveOverviewLabelPair;
  readonly sourceLabel: ExecutiveOverviewLabelPair;
  readonly noReportLabel: ExecutiveOverviewLabelPair;
}

export const executiveOverviewLabels: ExecutiveOverviewLabels = {
  pageTitle: { am: 'የአስፈጻሚ አጠቃላይ እይታ', en: 'Executive Overview' },
  pageDescription: {
    am: 'ከተፈቀዱ የድርጅት መዝገቦች የተወሰደ የፋይናንስ ማጠቃለያ።',
    en: 'A read-only financial summary sourced from authorized enterprise records.',
  },
  entityLabel: { am: 'ሕጋዊ አካል', en: 'Legal entity' },
  asOfLabel: { am: 'እስከ ቀን', en: 'As of' },
  refreshLabel: { am: 'አድስ', en: 'Refresh' },
  loadingMessage: { am: 'የፋይናንስ መረጃ በመጫን ላይ…', en: 'Loading financial data…' },
  emptyTitle: { am: 'የሚታዩ ሕጋዊ አካላት የሉም', en: 'No visible legal entities' },
  emptyDescription: {
    am: 'ይህን እይታ ለመጠቀም የሕጋዊ አካል እና የፋይናንስ ሪፖርት የማየት ፈቃድ ያስፈልጋል።',
    en: 'Access requires legal-entity read and financial-report permissions.',
  },
  loadErrorTitle: { am: 'ዳሽቦርዱን መጫን አልተቻለም', en: 'The overview could not be loaded' },
  retryLabel: { am: 'እንደገና ሞክር', en: 'Retry' },
  trialBalanceTitle: { am: 'የሙከራ ሚዛን', en: 'Trial balance' },
  totalDebitsLabel: { am: 'ጠቅላላ ዴቢት', en: 'Total debits' },
  totalCreditsLabel: { am: 'ጠቅላላ ክሬዲት', en: 'Total credits' },
  differenceLabel: { am: 'ልዩነት', en: 'Difference' },
  balancedLabel: { am: 'ሚዛኑ ተመጣጣኝ ነው', en: 'Balanced' },
  unbalancedLabel: { am: 'ሚዛኑ አልተመጣጠነም', en: 'Not balanced' },
  sourceLabel: { am: 'ምንጭ፡ ፋይናንስ የሙከራ ሚዛን ሪፖርት', en: 'Source: Finance trial-balance report' },
  noReportLabel: { am: 'ለዚህ ምርጫ ሪፖርት የለም።', en: 'No report is available for this selection.' },
};
