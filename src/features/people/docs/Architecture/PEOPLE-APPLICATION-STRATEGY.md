# ARNA People Application — Domain Ownership and Enhancement Strategy

- Document ID: PD-APP-STR-001
- Version: 1.0.0
- Date: 2026-10-30
- Canonical root: `src/features/people/`
- Status: Owner-approved strategy; documentation baseline

## 1. Purpose

All People-specific application code and documentation must reside under `src/features/people/`. This includes pages/views, components, API clients, types, stores, composables, validation, localization, feature tests, user manuals, implementation records and phase reports.

Governance-specific screens remain under Governance where they implement governance workflows or authority. They must consume the canonical People identity/profile contract rather than create a second Person master or duplicate People business rules.

## 2. Recommended feature structure

```text
src/features/people/
├── api/
├── components/
├── composables/
├── config/
├── docs/
│   ├── Architecture/
│   ├── Requirements/
│   ├── Implementation/
│   ├── Testing/
│   ├── Reports/
│   └── User-Manuals/
├── layouts/
├── pages/
├── services/
├── stores/
├── types/
├── utils/
├── validation/
└── tests/
```

The existing Vue views may remain at their current feature-root paths until a separately approved refactor proves that moving them is safe. Avoid unnecessary churn.

## 3. Application module responsibilities

- Directory: server-backed search, filters, sorting, pagination and tenant-scoped result rendering.
- Person profile: canonical identity and authorized profile fields.
- Contacts: add/list/deactivate, masked values, verification state and contact preferences.
- Relationships: typed relationships, effective dates, reasoned deactivation and sensitive-data restrictions.
- Participation: descriptive participation records only; no implicit employment, membership or governance authority.
- Employment: employee lifecycle and self-service views, consuming People API contracts.
- Workforce: assignments, reporting lines and acting roles, consuming Organization structures.
- Recruitment/onboarding: candidate and employee-entry journeys.
- Attendance/leave: schedules, attendance, balances, requests and approvals.
- Performance/learning/compensation: role-appropriate views and workflow journeys.
- Self-service: employee and manager requests, records and notifications.
- Analytics: permission-scoped, reconciled dashboards and exports.

## 4. Frontend architecture standards

1. API clients are typed and centralized within the People feature.
2. API responses are treated as untrusted input and rendered only after contract validation.
3. Tenant scope is enforced by the server; client-side filters are never security boundaries.
4. Search and pagination use server-side query parameters; do not filter only the currently loaded page when the server owns the complete result set.
5. Contact values remain masked unless an explicit permission and purpose permit reveal.
6. Verification state must be displayed truthfully; the UI must not imply verification when the server has not recorded it.
7. Relationship views must state and enforce that relationships do not grant access, employment or authority.
8. Every workflow has loading, empty, error, validation and success states.
9. Amharic-first layout, labels, date handling and responsive behavior are acceptance requirements.
10. Keyboard navigation, focus management, contrast, screen-reader labels and accessible validation are required.
11. Do not duplicate Governance or Organization business logic in People UI.
12. Feature-specific tests and documentation stay in this feature folder.

## 5. Application phase alignment

The frontend follows the API People phase sequence: P0 architecture/ownership; P1 Person Core; P2 directory/contacts/relationships; P3 employment; P4 workforce assignments; P5 recruitment/onboarding; P6 attendance/leave; P7 performance/talent; P8 learning/qualifications; P9 compensation/benefits; P10 self-service/analytics.

A frontend phase cannot close until its API contract is stable, authorization behavior is verified, relevant UI journeys are tested, localization/accessibility are accepted and the phase report is complete.

## 6. Frontend phase closure criteria

- Exact API contract and type definitions match the approved API version.
- Server-side pagination/search/filtering behavior is demonstrated.
- Tenant and permission boundaries are enforced by server responses and correctly represented in the UI.
- No sensitive field is exposed by default or through stale client state.
- All required loading/empty/error/validation states are implemented.
- Amharic and English content is complete for the phase.
- Responsive layouts and accessibility checks pass.
- Component, feature and end-to-end tests pass on the exact reviewed commit.
- No critical/high UI defect remains without explicit Owner risk acceptance.
- Feature manuals and phase report are updated under `src/features/people/docs/`.
- Independent review and explicit Owner closure approval are recorded.

## 7. Existing baseline observations

App main SHA: `7b04286d4a20b3587249eed8b90281699492b4c7`.

People directory, profile and API client are already inside `src/features/people/`. Governance-specific People views and service remain in Governance and require a source review to distinguish governance workflow logic from duplicated People profile logic.

Open App PR #5: `faf16e769756dcb1bc01afab69c418b881c8d980`, 13 commits ahead of main, 4 changed files. Its People application implementation register currently resides at `docs/phase-2/PEOPLE-APPLICATION-IMPLEMENTATION-REGISTER.md`, outside the People feature root. Previously inspected exact-head type-check/build runs failed; no rerun was performed during P0.

## 8. Governance

This is an application architecture and ownership specification. It does not authorize source refactoring, moving files, changing route registration, altering API contracts, modifying PR #5, running CI, merging or deploying. Such actions require their applicable phase/gate authorization.
