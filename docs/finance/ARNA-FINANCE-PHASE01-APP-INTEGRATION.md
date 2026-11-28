# ARNA Finance Phase 01 — App Integration Contract

**Status:** Initial App-side API contract; UI route and interactive policy controls remain gated on API verification.  
**Base:** `329eaeaf10774c490d11a57cbf9cbd17a4168e3d`  
**Branch:** `feat/finance-phase01-foundation`

## API contract

The App consumes the Finance entity index at `GET /api/finance/entities`. The authenticated API resolves tenant membership and permissions; the App does not send an authoritative tenant ID.

Each entity may expose its eagerly loaded `profile`:

- functional/reporting currency ETB;
- transaction currency mode;
- EC/GC display calendar;
- Africa/Addis_Ababa timezone;
- optional Ethiopian fiscal-year start month/day;
- tax-profile and accounting-policy status;
- canonical Documents numbering-policy version.

The App must display unconfigured or pending states as such. It must not infer fiscal-year dates, tax settings, legal-entity registration facts or foreign-currency activation.

## Document integration

The App presents canonical document references returned by Finance and opens the existing Documents/Files experience for content and lifecycle. It does not create document numbers, upload a second binary copy, edit issued document hashes, or bypass Documents permissions.

Finance document purposes are source evidence, approval evidence, supporting evidence, issued output, reconciliation evidence and legal authority. Document links remain tenant/entity scoped.

## UI behavior

- Amharic-first labels; English remains available.
- Ethiopian Calendar is the default display calendar; Gregorian is supported as a display option.
- Monetary values are transported and rendered as decimal strings, never JavaScript floating-point calculations.
- A user may view profile state only with Finance entity-view permission.
- The App must not expose controls for enabling multi-currency posting or changing tax/fiscal policy until separately authorized API commands exist.
- Payroll and shareholder documents must continue to obey their source-domain confidentiality permissions.

## Deferred from this contract

The full Finance workspace navigation, entity profile editor, invoice/receipt screens, operational subledgers, approval workflows and document issuance screens are delivered in their dependent phases. The current file establishes typed API compatibility only.
