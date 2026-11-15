export const electionLabels = {
  am: {
    eyebrow: 'ARNA · ምርጫ',
    title: 'የቦርድ ምርጫ',
    description: 'የባለአክሲዮኖችን የምርጫ ሂደት፣ ማስረጃዎችንና የቁጥጥር መዝገቦችን በተለየ የአስተዳደር ሥርዓት ለመከታተል።',
    authorityPending: 'የሕጋዊ ሥልጣን ማረጋገጫ አልተጠናቀቀም',
    registerPending: 'የመራጮች ዝርዝር አልተቆለፈም',
    electronicVotingDisabled: 'ዲጂታል ድምፅ አሰጣጥ አልተፈቀደም',
    methodActivationGate: 'የአካል፣ ዲጂታል፣ ውክልና እና ድብልቅ የምርጫ ዘዴዎች በዕቅዱ ውስጥ አሉ፤ እያንዳንዱ ግን የሕግ፣ የደህንነት እና የሥራ ማረጋገጫ በር ከተሟላ በኋላ ብቻ ይነቃል.',
    noLegalDefaults: 'ያልጸደቁ የሕግ ውሳኔዎች በሥርዓቱ ነባሪ ደንብ አይሆኑም',
  },
  en: {
    eyebrow: 'ARNA · ELECTIONS',
    title: 'Board Election',
    description: 'A controlled workspace for shareholder elections, evidence and oversight records.',
    authorityPending: 'Legal authority has not been verified',
    registerPending: 'The voter register has not been frozen',
    electronicVotingDisabled: 'Electronic voting is not enabled',
    methodActivationGate: 'Physical, electronic, proxy and hybrid methods are in scope; each remains gated until its legal, security and operational acceptance requirements pass.',
    noLegalDefaults: 'Unapproved legal decisions are never system defaults',
  },
} as const;
