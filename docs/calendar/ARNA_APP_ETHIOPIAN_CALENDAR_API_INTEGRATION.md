# ARNA App — Ethiopian Calendar API Integration

**Status:** A3 implementation increment; draft for review. This document does not declare A4 complete or authorize merge/deployment.

## API dependency

This App increment consumes the Calendar API contract in [arna-api PR #109](https://github.com/akefadaka-git/arna-api/pull/109), currently draft and unmerged. The App must not assume those endpoints are available in production until the API change is separately reviewed, merged and deployed through its own gates.

## Civil-date and instant rules

- All-day E.C. events submit `starts_on_ec` and `ends_on_ec` objects with integer `year`, `month`, and `day` fields. The API validates and converts these using its canonical Ethiopian calendar implementation.
- All-day G.C. events submit `starts_on` and `ends_on` date-only strings.
- Timed events remain explicit ISO-8601 instants with offsets plus an IANA timezone. The App uses the selected E.C./G.C. preference for date entry; the API returns authoritative `starts_at_ec` / `ends_at_ec` representations for E.C. display.
- Event list and occurrence-range requests send either Gregorian `from`/`to` values or E.C. `from_ec`/`to_ec` objects, never both.
- E.C. date display prefers API-provided `formatted_am` / `formatted_en` values. Timed E.C. display uses the API-provided `ethiopian_time` value, retaining `local_time` and timezone metadata in the typed contract.
- Gregorian canonical storage, absolute instants, timezone retention, tenant context and server authorization remain API-owned.

## Recurrence and exceptions

- The composer supports one-time and recurring all-day events.
- E.C. recurrence sets `calendar_system: ethiopian`; monthly recurrence follows the 13-month E.C. cycle and yearly recurrence follows the E.C. year boundary.
- An optional E.C. recurrence end date is sent as `recurrence_rule.until_ec`; it is omitted when no end date is selected.
- The App retrieves bounded occurrences through the API and supports cancelling a single occurrence using `original_starts_on_ec`.
- E.C. all-day occurrence moves submit the original, override-start and override-end E.C. date objects together. The API converts and persists the exception using its canonical civil-date path.
- Timed recurrence remains Gregorian-rule based in this API version; the App does not label timed recurrence as Ethiopian-native.

## Security and compatibility

- No tenant identifier is supplied by the browser; the shared API transport and server tenant context remain authoritative.
- Client permission checks are UX gating only. Calendar API middleware and domain authorization remain authoritative.
- No local E.C. persistence engine, runtime dependency, database migration, production database operation, merge, signing, or deployment is introduced by this App increment.
- The existing browser conversion helper remains only for local date validation and constructing timed-event instants; E.C. civil-date create/filter/exception operations use native API fields.

## Verification gates

- Frontend TypeScript check and all four static builds must pass on the exact PR head.
- Calendar contract tests must cover E.C. input/output/filtering, recurrence metadata, occurrence cancellation/move payloads, and preservation of tenant-context transport.
- Browser-level review must verify Pagume day 5/6 boundaries, E.C. month/year transitions, Amharic and English formatted payloads, timezone display, keyboard access and mobile layouts.
- API PR #109 exact-head A4 and independent security review remain separate prerequisites for release readiness.
