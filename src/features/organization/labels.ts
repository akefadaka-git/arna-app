export interface OrganizationUnitsViewLabels {
  readonly pageTitle: string;
  readonly description: string;
  readonly searchPlaceholder: string;
  readonly statusLabel: string;
  readonly allStatuses: string;
  readonly active: string;
  readonly inactive: string;
  readonly refresh: string;
  readonly loading: string;
  readonly retry: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly errorTitle: string;
  readonly code: string;
  readonly name: string;
  readonly type: string;
  readonly parent: string;
  readonly status: string;
  readonly actions: string;
  readonly previous: string;
  readonly next: string;
  readonly pageOf: string;
  readonly total: string;
  readonly view: string;
  readonly detailDescription: string;
  readonly nameAm: string;
  readonly nameEn: string;
  readonly reason: string;
  readonly childrenTitle: string;
  readonly notFound: string;
  readonly backToList: string;
}

export const organizationUnitsViewLabelsAm: OrganizationUnitsViewLabels = {
  pageTitle: 'የድርጅት መዋቅር',
  description: 'የድርጅት ክፍሎችን፣ ቅርንጫፎችን እና የሥራ ክፍሎችን ይመልከቱ።',
  searchPlaceholder: 'በኮድ ወይም በስም ይፈልጉ',
  statusLabel: 'ሁኔታ',
  allStatuses: 'ሁሉም ሁኔታዎች',
  active: 'ንቁ',
  inactive: 'የቦዘነ',
  refresh: 'አድስ',
  loading: 'በመጫን ላይ…',
  retry: 'እንደገና ሞክር',
  emptyTitle: 'የድርጅት ክፍል አልተገኘም',
  emptyDescription: 'ለዚህ ማጣሪያ የሚስማማ መዝገብ የለም።',
  errorTitle: 'የድርጅት መረጃን መጫን አልተቻለም',
  code: 'ኮድ',
  name: 'ስም',
  type: 'ዓይነት',
  parent: 'የወላጅ ክፍል',
  status: 'ሁኔታ',
  actions: 'ተግባሮች',
  previous: 'ቀዳሚ',
  next: 'ቀጣይ',
  pageOf: 'ገጽ',
  total: 'ጠቅላላ መዝገቦች',
  view: 'ዝርዝር ይመልከቱ',
  detailDescription: 'የድርጅት ክፍል ዝርዝር መረጃ',
  nameAm: 'ስም (አማርኛ)',
  nameEn: 'ስም (እንግሊዝኛ)',
  reason: 'ምክንያት',
  childrenTitle: 'የታችኛ ክፍሎች',
  notFound: 'መረጃውን ማግኘት አልተቻለም ወይም የሚፈለገው ክፍል የለም።',
  backToList: 'ወደ የድርጅት ክፍሎች ዝርዝር',
};

export const organizationUnitsViewLabelsEn: OrganizationUnitsViewLabels = {
  pageTitle: 'Organization structure',
  description: 'Browse organizational units, branches, departments and teams.',
  searchPlaceholder: 'Search by code or name',
  statusLabel: 'Status',
  allStatuses: 'All statuses',
  active: 'Active',
  inactive: 'Inactive',
  refresh: 'Refresh',
  loading: 'Loading…',
  retry: 'Retry',
  emptyTitle: 'No organization units found',
  emptyDescription: 'No records match the current filters.',
  errorTitle: 'Unable to load organization data',
  code: 'Code',
  name: 'Name',
  type: 'Type',
  parent: 'Parent unit',
  status: 'Status',
  actions: 'Actions',
  previous: 'Previous',
  next: 'Next',
  pageOf: 'Page',
  total: 'Total records',
  view: 'View details',
  detailDescription: 'Organization unit details',
  nameAm: 'Name (Amharic)',
  nameEn: 'Name (English)',
  reason: 'Reason',
  childrenTitle: 'Child units',
  notFound: 'The requested unit could not be found or loaded.',
  backToList: 'Back to organization units',
};
