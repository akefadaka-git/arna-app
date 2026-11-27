# ARNA App — Shareholder / Board Election Integration

Status: documentation-only A3 planning contract; no implementation started.

## Ownership
Shareholder API remains authoritative for shareholder identity, register provenance, share classes, holdings, ledger and certificates. Governance API owns election authority, committee, candidate intake, voter-register preparation/reconciliation/freeze, ballots, tally, disputes and certification. App is a typed presentation layer only.

## Workspace
Integrate one selected, current-main-rebased Governance election workspace. Show tenant-scoped election list/detail, authority/rule-version status, committee/candidate surfaces only where API permissions exist, voter-register lifecycle status, Shareholder source provenance and exception states. Do not calculate eligibility, vote weight, quorum, tally or certification in Vue.

## Shareholder Portal
Add a read-only My Board Elections view only after the API identity contract is stable. Resolve the person through the authenticated session and server-side shareholder/election identity endpoint. Never trust a shareholder ID from a URL or client payload. Show notices, authorized status, proxy/attendance instructions and certified outcomes only when supported by API state. No ballot, vote-weight or eligibility control while legal rules or source evidence are unresolved.

## Admin
Technical Admin may see operational health and evidence exceptions under explicit permissions. It does not gain corporate authority to verify registers, appoint committees, approve candidates, freeze electorates, open ballots, tally or certify.

## Shared rules
Use typed APIs; no direct database access or duplicate business rules. Preserve tenant isolation and least privilege. Distinguish shareholder, candidate, voter, proxy and representative. Use Amharic-first labels, WCAG 2.2 AA, responsive layouts and explicit loading/empty/stale/blocked/unauthorized/conflict/error states. Notification links must preserve authorization and not leak shareholder data.

## PR lineage
App #31 is the initial election UI branch; #68 is stacked on #31 and only aligns four voting-method labels; #120 is the newer Governance workspace candidate but needs a fresh current-main rebase. API dependencies include #151/#161 election-core/authority, #126 AGE A2, #128–#146 voter-register stack, #149 committee security and #157 disputes. All remain PR-only until reconciled and merged. Select one App branch and one canonical API dependency chain; do not merge stacked branches wholesale.

## Acceptance tests
Route permissions; 401/403/404 and cross-tenant states; stale/unverified source handling; server-resolved identity; no false eligibility or ballot controls; Portal own-record isolation; Admin/corporate authority separation; Amharic/English accessibility; notification privacy; exact-head App builds and browser tests.

## Stage status
Shareholder A2 API #237 and App #142: ACCEPTED / MERGED. This record: documentation only. A3 API adapter and A3 App integration: NOT STARTED. A4: NOT STARTED. A5: NOT AUTHORIZED.

Conclusion: integrate via read-only, provenance-bearing, election-specific Governance snapshots and explicit API decisions. No implementation, election activation, production data change or deployment is authorized by this record.