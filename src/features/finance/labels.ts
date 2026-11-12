export interface FinanceWorkspaceLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly entityLabel: string;
  readonly asOfLabel: string;
  readonly loadEvidence: string;
  readonly loading: string;
  readonly entitiesError: string;
  readonly evidenceError: string;
  readonly noEntities: string;
  readonly trialBalanceTitle: string;
  readonly accountColumn: string;
  readonly debitColumn: string;
  readonly creditColumn: string;
  readonly netDebitColumn: string;
  readonly netCreditColumn: string;
  readonly balanced: string;
  readonly unbalanced: string;
  readonly evidenceDigest: string;
  readonly limitationsTitle: string;
  readonly intelligenceTitle: string;
  readonly taskQuestion: string;
  readonly generateProposal: string;
  readonly providerUnavailable: string;
  readonly proposalsTitle: string;
  readonly noProposals: string;
  readonly approve: string;
  readonly reject: string;
  readonly reviewReason: string;
  readonly reviewRequired: string;
  readonly reviewSaved: string;
}

export const financeWorkspaceLabels: FinanceWorkspaceLabels = {
  pageTitle: 'ፋይናንስ',
  pageDescription: 'የሂሳብ መዝገቦችን፣ የሙከራ ሚዛንን እና በማስረጃ የተደገፉ የፋይናንስ ግንዛቤዎችን ይመልከቱ።',
  entityLabel: 'ሕጋዊ አካል',
  asOfLabel: 'እስከ ቀን (Gregorian)',
  loadEvidence: 'ሪፖርት አምጣ',
  loading: 'በመጫን ላይ…',
  entitiesError: 'የሕጋዊ አካላት ዝርዝር ማምጣት አልተቻለም።',
  evidenceError: 'የሂሳብ ማስረጃ ማምጣት አልተቻለም።',
  noEntities: 'ለዚህ ተቋም የተመዘገበ ሕጋዊ አካል የለም።',
  trialBalanceTitle: 'የሙከራ ሚዛን',
  accountColumn: 'ሂሳብ',
  debitColumn: 'ዴቢት',
  creditColumn: 'ክሬዲት',
  netDebitColumn: 'የዴቢት ቀሪ',
  netCreditColumn: 'የክሬዲት ቀሪ',
  balanced: 'ሚዛኑ ተጠብቋል',
  unbalanced: 'ልዩነት ተገኝቷል',
  evidenceDigest: 'የማስረጃ SHA-256',
  limitationsTitle: 'የማስረጃ ገደቦች',
  intelligenceTitle: 'የፋይናንስ አይአይ ሀሳቦች',
  taskQuestion: 'የምርመራ ጥያቄ',
  generateProposal: 'የሀሳብ ረቂቅ አዘጋጅ',
  providerUnavailable: 'የአይአይ አቅራቢ ገና አልተዋቀረም፤ ማስረጃ ማየት ይቻላል፣ ሀሳብ ማመንጨት ግን ተዘግቷል።',
  proposalsTitle: 'የቀድሞ ሀሳቦች',
  noProposals: 'ምንም የፋይናንስ ሀሳብ የለም።',
  approve: 'አጽድቅ',
  reject: 'ውድቅ አድርግ',
  reviewReason: 'የግምገማ ምክንያት',
  reviewRequired: 'የግምገማ ምክንያት ያስፈልጋል።',
  reviewSaved: 'የግምገማ ሁኔታ ተቀምጧል።',
};
