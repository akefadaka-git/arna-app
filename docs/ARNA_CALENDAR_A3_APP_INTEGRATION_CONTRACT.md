# A3 App Integration Contract — Calendar Workspace

**Status:** A3 implementation planning companion; no user-facing route is enabled until Calendar API contracts are stable.

## Existing conventions to preserve
- Router factory and scope-specific route trees remain separate.
- Shared date preference in `src/core/dates/calendar.ts` remains the only display preference source.
- E.C. is default; G.C. is mutually exclusive.
- Date-only business values must not pass through generic JavaScript `Date` parsing as if they were instants.
- Backend remains final authority for tenant scope, permissions and linked-resource access.

## Planned App increments
1. Add typed API DTOs distinguishing `LocalDate` from `InstantWithTimezone`.
2. Add workspace Calendar route and feature module only after endpoint contract exists.
3. Deliver agenda-first mobile view, desktop month/week/day/timeline, keyboard navigation and accessible event state.
4. Add event composer with E.C. date entry, G.C. preference and explicit event timezone.
5. Add diary only after privacy/retention/sharing policy is approved.
6. Display source-domain references for Governance, Finance, PublicContent, Files and future Portfolio/Reporting/Communication; do not copy authoritative records.
7. Render notification/reminder delivery state from API; never schedule authoritative reminders in the browser.

## A3 boundary
This contract does not implement diary privacy policy, Governance meeting law, quorum/voting, social publishing or external calendar synchronization.
