# ARNA People Application — Phase 2 Implementation Register

**Status:** Directory, contact, relationship and participation UI implemented; verification pending  
**Scope:** Destination repository `akefadaka-git/arna-app`  
**Base:** `main` at `7b04286d4a20b3587249eed8b90281699492b4c7`

## P2.1 — Directory search
- Send search terms to the API instead of searching only the currently loaded page.
- Reset pagination when the search term changes and debounce typing.
- Preserve Amharic-first display, bilingual name matching, and server-owned tenant filtering.

## P2.2 — Contact points
- Added contact type, label, primary designation, masked value and verification-state presentation.
- Added contact creation and deactivation actions.
- Raw contact values are not returned by the API; verification remains false until the approved verification workflow is integrated.

## P2.3 — Person relationships
- Added typed person-to-person relationship entry, list and deactivation actions.
- Related profiles are referenced by canonical public UUID, and the API enforces active tenant visibility.
- Relationship data does not confer account, membership, employment, or governance authority.

## P2.4 — Participation
- Added ministry, volunteer, committee, event, training, qualification and general participation entry/list/deactivation UI.
- Participation records are descriptive only and do not replace Organization or Governance authority.

## Safety and readiness
- API permission checks remain authoritative; frontend controls do not grant permissions.
- No local tests were run and no CI workflows were retried, per Owner instruction.
- Contact verification integration, deeper field-level privacy, accessibility review, and destination CI verification remain pending.
- No merge, production data change, or deployment is authorized.
