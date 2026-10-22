import { api } from '@/core/api/client';
import type { PublicVerificationResult } from '@/router/public-verification-labels';

/**
 * Public verification contract:
 * POST /api/public/document-verifications/verify
 * body: { reference: string }
 * success data: { status: 'verified' | 'invalid' | 'revoked', reference,
 *                 documentType?, issuedAt? }
 *
 * The backend verifies issued share certificates only. The API client unwraps
 * the canonical success envelope before this adapter receives the data.
 * Failures and unexpected contracts resolve to unavailable, never verified.
 * Expiry is intentionally not represented until the authoritative API contract
 * explicitly defines that status and its semantics.
 */
/** A backend 422 is a user-correctable validation response, not an outage. */
export class PublicVerificationValidationError extends Error {
  constructor() {
    super('The certificate reference was rejected by server validation.');
    this.name = 'PublicVerificationValidationError';
  }
}

export async function verifyPublicDocument(reference: string): Promise<PublicVerificationResult | null> {
  try {
    const result = await api.post<unknown>(
      '/api/public/document-verifications/verify',
      { reference },
    );

    if (typeof result !== 'object' || result === null) return null;
    const data = result as Record<string, unknown>;
    const status = data.status;
    const returnedReference = data.reference;

    if (
      typeof returnedReference !== 'string' ||
      returnedReference !== reference ||
      (status !== 'verified' && status !== 'invalid' && status !== 'revoked')
    ) {
      return null;
    }

    const documentType = data.documentType ?? data.document_type;
    const issuedAt = data.issuedAt ?? data.issued_at;

    return {
      status,
      reference: returnedReference,
      ...(typeof documentType === 'string' ? { documentType } : {}),
      ...(typeof issuedAt === 'string' ? { issuedAt } : {}),
    };
  } catch (error: unknown) {
    // Preserve the distinction between user input and infrastructure failure.
    if (
      typeof error === 'object' &&
      error !== null &&
      'httpStatus' in error &&
      error.httpStatus === 422
    ) {
      throw new PublicVerificationValidationError();
    }

    // Fail closed: network errors, unexpected envelopes, and 404s are unavailable.
    return null;
  }
}
