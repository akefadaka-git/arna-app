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

export const publicVerificationEnglishLabels = {
  pageTitle: 'Share certificate verification',
  intro: 'Enter an ARNA share-certificate reference to check its status. This service does not verify other document types.',
  referenceLabel: 'Reference number',
  referencePlaceholder: 'Enter the share-certificate reference',
  submit: 'Verify certificate',
  submitting: 'Checking…',
  required: 'Enter a reference number.',
  tooLong: 'The reference number must not exceed 64 characters.',
  serverValidation: 'The server did not accept this reference. Check the number and try again.',
  verifiedTitle: 'Share certificate verified',
  verifiedMessage: 'The verification service confirmed this share certificate is valid.',
  invalidTitle: 'Share certificate not verified',
  invalidMessage: 'No valid share certificate was found for this reference.',
  revokedTitle: 'Share certificate revoked',
  revokedMessage: 'This share certificate is no longer active.',
  unavailableTitle: 'Verification temporarily unavailable',
  unavailableMessage: 'The verification service could not confirm the status. Please try again later.',
  backToLogin: 'Back to sign in',
  legal: 'Legal information',
  help: 'Help',
  corporate: 'Corporate website',
  referenceResult: 'Reference number',
  referenceHelp: 'Enter only the share-certificate reference number.',
  documentTypeLabel: 'Document type',
  issuedAtLabel: 'Issue date',
  disclaimer: 'This service verifies ARNA share certificates only; it does not verify other legal documents. If the service is unavailable, no conclusion is made about whether a certificate is valid or fraudulent.',
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
