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
## User-facing error routes

The shared App error route renders dedicated 403 (access denied), 404 (not found), 500 (unexpected server error), and 503 (maintenance) states.

- **Back:** returns to the previous in-app history entry; if the page was opened directly, it falls back to the workspace launcher.
- **Home:** returns to the launcher.
- **Retry:** reloads the current route only for retryable page-level recovery paths.
- **Report a problem:** opens the user's mail client with HTTP status, stable error code, request reference, timestamp, and route path prefilled. It deliberately excludes exception messages, stack traces, tokens, credentials, and form contents.
- **Contact support:** opens a separate support email addressed to support@maalearna.com.et.
- Technical details are disclosed in the existing support panel, including copy-to-clipboard support for the reference data.

The route labels are Amharic-first and remain centralized in src/router/error-labels.ts. API feature failures continue to be rendered by their owning feature surfaces; the /server-error route is the shared page-level 500 destination and does not silently redirect every API failure.
