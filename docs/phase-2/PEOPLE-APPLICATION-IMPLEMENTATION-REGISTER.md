# ARNA People Application — Phase 2 Implementation Register

**Status:** Phase 2.1 UI/API integration submitted for CI review  
**Scope:** Destination repository `akefadaka-git/arna-app`  
**Base:** `main` at `7b04286d4a20b3587249eed8b90281699492b4c7`

## P2.1 — Directory search
- Send the search term to the API instead of searching only the currently loaded page.
- Reset pagination when the search term changes.
- Debounce typing to avoid issuing a request for every keystroke.
- Preserve Amharic-first display, bilingual name matching, existing permission handling, and pagination.
- The API remains the authority for tenant filtering and search results.

## Next increments
- P2.2: profile contact points and verified-contact presentation, only after the API contract exists.
- P2.3: relationship and household UI, after API policy and privacy rules are approved.
- P2.4: membership, ministry and volunteer participation UI, reusing canonical domain contracts.
- P2.5: lifecycle timelines, documents and reports with accessible, responsive Amharic-first views.

## Safety and readiness
- This increment does not introduce client-side authority decisions or expose new sensitive fields.
- No local tests were run; validation is intended through destination GitHub CI only.
- No merge, production data change, or deployment is authorized.
