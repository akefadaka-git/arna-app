# ARNA Finance Phase 01 — App Integration Contract

**Status:** Initial App-side API contract; UI route and interactive policy controls remain gated on API verification.  
**Base:** `329eaeaf10774c490d11a57cbf9cbd17a4168e3d`  
**Branch:** `feat/finance-phase01-foundation`

## API contract

The App consumes the Finance entity index at `GET /api/finance/entities`. The authenticated API resolves tenant membership and permissions; the App does not send an authoritative tenant ID.

Each entity may expose its eagerly loaded `accounting_profile`:

- functional/reporting currency ETB;
- transaction currency mode;
- EC/GC display calendar;
- Africa/Addis_Ababa timezone;
- optional Ethiopian fiscal-year start month/day;
- tax-profile and accounting-policy status;
- canonical Documents numbering-policy version.

The App must display unconfigured or pending states as such. It must not infer fiscal-year dates, tax settings, legal-entity registration facts or foreign-currency activation.

## Document integration

The App retrieves linked evidence from `GET /api/finance/documents` using the active legal entity and optional source/purpose filters. It presents canonical document references returned by Finance and opens the existing Documents/Files experience for content and lifecycle. It does not create document numbers, upload a second binary copy, edit issued document hashes, or bypass Documents permissions.

Finance document purposes are source evidence, approval evidence, supporting evidence, issued output, reconciliation evidence and legal authority. Document links remain tenant/entity scoped.

## UI behavior

- Amharic-first labels; English remains available.
- Ethiopian Calendar is the default display calendar; Gregorian is supported as a display option.
- Monetary values are transported and rendered as decimal strings, never JavaScript floating-point calculations.
- A user may view profile state only with Finance entity-view permission.
- The App consumes `GET/POST /api/finance/dimensions` and `GET/POST /api/finance/dimensions/{dimensionId}/values` for department, branch, project, cost center, contract, fund and region. Dimension reads and management remain separately permission-gated. Users with `finance.dimension.manage` can create entity-scoped dimensions and effective-dated values; they may designate a dimension as required on every journal line. Product/customer/supplier references remain canonical in their source domains.

The App must not expose controls for enabling multi-currency posting or changing tax/fiscal policy until separately authorized API commands exist.
- Payroll and shareholder documents must continue to obey their source-domain confidentiality permissions.

## Deferred from this contract

The full journal-entry workspace, entity profile editor, invoice/receipt screens, operational subledgers, approval workflows and document issuance screens are delivered in their dependent phases. Phase 01 includes the Finance foundation route, entity profile/evidence visibility and dimension/value management. Journal-line dimension assignments are accepted and enforced by the API; a full journal authoring UI remains in Phase 02.
