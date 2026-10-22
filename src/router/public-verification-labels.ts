/**
 * Public ARNA share-certificate verification UI labels.
 * Keep user-facing copy here to match the router's Amharic-first label modules.
 */
export const publicVerificationLabels = {
  pageTitle: 'የአክሲዮን ምስክር ወረቀት ማረጋገጫ',
  intro: 'የARNA የአክሲዮን ምስክር ወረቀት ማጣቀሻ ቁጥር በማስገባት ሁኔታውን ያረጋግጡ። ይህ አገልግሎት ሌሎች ሰነዶችን አያረጋግጥም።',
  referenceLabel: 'የማጣቀሻ ቁጥር',
  referencePlaceholder: 'የአክሲዮን ማጣቀሻ ቁጥር ያስገቡ',
  submit: 'አረጋግጥ',
  submitting: 'በማረጋገጥ ላይ…',
  required: 'እባክዎ የማጣቀሻ ቁጥር ያስገቡ።',
  tooLong: 'የማጣቀሻ ቁጥሩ ከ64 ቁምፊዎች መብለጥ የለበትም።',
  serverValidation: 'የማጣቀሻ ቁጥሩ በአገልጋዩ ማረጋገጫ አልተቀበለም። እባክዎ ቁጥሩን ያረጋግጡና እንደገና ይሞክሩ።',
  verifiedTitle: 'የአክሲዮን ምስክር ወረቀቱ ተረጋግጧል',
  verifiedMessage: 'የማረጋገጫ አገልግሎቱ የአክሲዮን ምስክር ወረቀቱን ትክክለኛነት አረጋግጧል።',
  invalidTitle: 'የአክሲዮን ምስክር ወረቀቱ አልተረጋገጠም',
  invalidMessage: 'ለዚህ ማጣቀሻ ቁጥር ትክክለኛ የአክሲዮን ምስክር ወረቀት አልተገኘም።',
  revokedTitle: 'የአክሲዮን ምስክር ወረቀቱ ተሰርዟል',
  revokedMessage: 'ይህ የአክሲዮን ምስክር ወረቀት ከእንግዲህ በሥራ ላይ አይደለም።',
  unavailableTitle: 'ማረጋገጫው ለጊዜው አይገኝም',
  unavailableMessage: 'የማረጋገጫ አገልግሎቱ ሁኔታውን ማረጋገጥ አልቻለም። እባክዎ ቆይተው ይሞክሩ።',
  backToLogin: 'ወደ መግቢያ ተመለስ',
  legal: 'ሕጋዊ መረጃ',
  help: 'እርዳታ',
  corporate: 'የድርጅቱ ድረ ገጽ',
  referenceResult: 'የማጣቀሻ ቁጥር',
} as const;

/**
 * Keep this status union aligned with the currently documented public API.
 * An expired state must not be shown until the authoritative API contract
 * explicitly defines and returns it.
 */
export type PublicVerificationStatus = 'verified' | 'invalid' | 'revoked';

export interface PublicVerificationResult {
  readonly status: PublicVerificationStatus;
  readonly reference: string;
  readonly documentType?: string;
  readonly issuedAt?: string;
}
