# ARNA App — Error Handling Contract

The application must use src/core/api/client.ts as the only HTTP transport and error-normalization boundary.

- Preserve NormalizedApiError and its existing fields.
- Keep stable backend error codes separate from translated display messages.
- Keep cancellation as normal flow; do not show an error toast for user-initiated aborts.
- Display safe localized messages and a support reference based on requestId.
- Never display raw stack traces, SQL, tokens, or server exception messages.
- Retry only when the operation is safe/idempotent and the backend marks it retryable.
- Diagnostic hints are for support/admin workflows; ordinary users receive recovery guidance only.

Self-diagnosis workflow: collect client failure category + request ID; correlate with API incident; present a suggested diagnosis; create a proposed fix/test in a branch; require approval for privileged or production-impacting remediation.