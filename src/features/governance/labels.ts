/*
 * =============================================================================
 * CHANGE VERIFICATION — G3 · File 3 of 7 (amendment — composite sections)
 * =============================================================================
 *
 * File:      mase_app/src/features/governance/labels.ts  (AMEND)
 * Unit:      G3 — GovernanceBody frontend module (labels — composite
 *            detail sections)
 * Delivery type:  Full-file replacement. Version remains 1.1.0 per
 *                 the batch convention (api.ts v1.1.0, service.ts
 *                 v1.1.0, labels.ts v1.1.0) — the composite-section
 *                 labels are consolidated into the same v1.1.0
 *                 revision that carried the pagination labels.
 * Net lines:      +4 interface sections on
 *                 GovernanceBodyDetailViewLabels; +~40 const values;
 *                 ~200 lines docblock.
 *
 * Before (v1.1.0, pagination-only delivery):
 *   GovernanceBodyDetailViewLabels carried the identity-card
 *   section's labels only — the sixteen row labels, the section
 *   title, the 404 pair, and the yes/no pair. The four composite
 *   sections Q3 approved (current term, positions, officers, roster)
 *   had no labels; they were deferred because the four backend
 *   resources were not yet inspected. See that delivery's
 *   §"What this delivery deliberately does NOT include".
 *
 * After (v1.1.0, consolidated):
 *   The four backend resources have been inspected (G2b file 18,
 *   G2b file 6, G2c file 9, G2c file 22 redelivery 1). The
 *   composite-section label groups are added:
 *
 *     · Current term — a single card's section title and four row
 *       labels, plus the empty message.
 *
 *     · Positions — a table's section title, five column headers,
 *       and the empty message.
 *
 *     · Officers — a table's section title, four column headers,
 *       and the empty message.
 *
 *     · Roster — a table's section title, six column headers, and
 *       the empty message.
 *
 *   No existing field or value changed. No version bump — this
 *   amendment is folded into the same v1.1.0 revision that carried
 *   the pagination labels.
 *
 * -----------------------------------------------------------------------------
 * The four section shapes the labels support
 * -----------------------------------------------------------------------------
 * Each label group maps to a specific rendering the detail view
 * (G3 file 5) will produce:
 *
 *   · Current term (single card)
 *       The `currentTerm` field from `GovernanceBodyDetail`.
 *       Row labels for the term's display_label, its effective date
 *       pair, and its notes. Empty state when the body has no
 *       current term.
 *
 *   · Positions (table)
 *       The `positions` array from `GovernanceBodyDetail`. Columns:
 *       code, name, is_voting, is_officer, is_active. No filter —
 *       the array is already sorted by `sort_order` ascending; the
 *       Q3 requirement of "including vacancies" is satisfied by
 *       not filtering the positions list.
 *
 *   · Officers (table)
 *       The `activeAppointments` array from `GovernanceBodyDetail`.
 *       Columns: title, position, since, mode.
 *
 *   · Roster (table)
 *       The `activeMemberships` array from `GovernanceBodyDetail`.
 *       Columns: member, position, term, since, ex-officio, status.
 *
 * -----------------------------------------------------------------------------
 * A concern about the officers section — flagged, not resolved here
 * -----------------------------------------------------------------------------
 * The `GovernanceAppointment` resource carries no member-identity
 * field — no `user_id`, no `member_name`, no name column of any
 * kind. Its identifying fields are `title_am` / `title_en` /
 * `display_label`, `instrument_*`, `effective_date`,
 * `appointment_mode`, and `status`.
 *
 * The composite fetcher (G3 file 2 v1.1.0) treats active
 * appointments as the body's current officers. If the appointment's
 * `title_*` columns hold the OFFICER'S NAME (a plausible reading —
 * "title" as in "the title held by this person"), the officers
 * section renders correctly as delivered. If the `title_*` columns
 * instead hold the APPOINTMENT'S OWN TITLE (e.g. "Resolution
 * 2024-15"), the officers section needs the officer's name from a
 * different source — likely the linked membership, or a direct
 * `user` / member field on the appointment record that the resource
 * does not currently emit.
 *
 * The backend appointment model's migration would resolve this.
 * Until it is inspected, this labels file uses neutral field names
 * ("title") that work under either reading — the officers table's
 * first column is labelled generically rather than as "officer
 * name", so a subsequent correction to the officer-identity source
 * does not require amending these labels.
 *
 * This is a red flag for the detail view's delivery note as well —
 * see G3 file 5's §"Officers section" when it ships. It is a
 * possible backend CR (a "member identity on appointment" field) or
 * a possible composite-fetcher correction (fetch officers from
 * memberships filtered by position.is_officer). Not a G3 labels
 * concern; flagged here for continuity.
 *
 * -----------------------------------------------------------------------------
 * What does NOT change
 * -----------------------------------------------------------------------------
 *   · `GovernanceSharedLabels` — every field, every value.
 *   · `GovernanceBodyListViewLabels` — every field, every value,
 *     including the three pagination labels from the previous
 *     v1.1.0 delivery.
 *   · `GovernanceBodyDetailViewLabels`'s existing fields — page
 *     chrome, 404 pair, identity section, sixteen identity rows,
 *     the yes/no pair.
 *   · The `shared` const.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review — additions
 * -----------------------------------------------------------------------------
 *   · 'የአሁኑ የሥራ ዘመን' (current term) — 'የሥራ ዘመን' is the register's
 *     term for a term of office; the same word appears in the term
 *     resource's own label_am example ('የ2026 የሥራ ዘመን').
 *
 *   · 'የተገለጹ ቦታዎች' (defined positions) — literal construction;
 *     'ቦታ' is the register's term for a position/seat.
 *
 *   · 'መኮንን' (officer) — the register's term for a board officer.
 *     Pluralised as 'መኮንኖች'.
 *
 *   · 'የአባላት ዝርዝር' (members list / roster) — 'ዝርዝር' as in "list",
 *     matching the register of 'የአክሲዮን ክፍሎች' and similar.
 *
 *   · 'በስልጣን መሠረት' (ex officio) — literal "by virtue of office".
 *     Matches the term the appointment_mode enum proposes for
 *     `ex_officio`.
 *
 *   · 'ድምጽ ያለው' / 'ድምጽ የሌለው' (voting / non-voting) — the register's
 *     voting-rights pair. Distinct from the simpler 'አዎ' / 'አይደለም'
 *     the identity section uses for the standing/temporary pair,
 *     because a voting flag is a substantive attribute, not a
 *     checkbox.
 *
 *   · 'ምንም አሁን ያሉ መኮንኖች የሉም።' (no current officers) — the officers
 *     empty message. Register matches the other empty messages.
 *
 *   · The remaining section labels reuse existing corpus terms
 *     ('ኮድ', 'ስም', 'ቦታ', 'ከ', 'ማስታወሻ', 'ሁኔታ').
 *
 * All additions are flagged for review; none blocks delivery.
 *
 * -----------------------------------------------------------------------------
 * Dependency note
 * -----------------------------------------------------------------------------
 *   · Depends on nothing at the module level.
 *   · The new fields are consumed by the detail view (G3 file 5).
 *   · No config change, no Composer step. TypeScript module.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — G3 · File 3 of 7 (pagination labels — v1.1.0)
 * =============================================================================
 *
 * Preserved from the previous delivery. The pagination labels
 * (`paginationAriaLabel`, `paginationPrevLabel`,
 * `paginationNextLabel`) remain on
 * `GovernanceBodyListViewLabels`; the list view (v1.0.1) binds
 * against them. No field changed in this amendment's consolidation.
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — G3 · File 3 of 7 (initial — v1.0.0)
 * =============================================================================
 *
 * Preserved from the initial delivery. Three interfaces and their
 * const values, mirroring `features/loans/labels.ts`. All values
 * Amharic.
 *
 * The page title `የአስተዳደር አካላት` reuses the string carried by the
 * workspace nav leaf; the G3 amendment to `shell-labels.ts` (file 7)
 * sets the leaf's label to the same string.
 *
 * `body_type` labels are backend-supplied via the resource's
 * `body_type_label` field; the frontend declares no `bodyType*`
 * group.
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Governance Feature Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/features/governance/labels.ts
 * Layer:     Features (Governance domain)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            Governance domain GovernanceBodyResource.php (G2a file 11
 *              of 17)
 *            Governance domain GovernanceTermResource.php (G2b file
 *              18 of 27)
 *            Governance domain GovernancePositionResource.php (G2b
 *              file 6 of 27)
 *            Governance domain GovernanceAppointmentResource.php
 *              (G2c file 9 of 31)
 *            Governance domain GovernanceMembershipResource.php
 *              (G2c file 22 of 31, redelivery 1)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.1.0  — two amendments consolidated under the same version:
 *            · pagination labels added to GovernanceBodyListViewLabels
 *              (previous delivery);
 *            · four composite-section label groups added to
 *              GovernanceBodyDetailViewLabels (this delivery).
 *          No field removed or renamed.
 *
 * 1.0.0  — initial delivery. Shared, list, and identity-only detail
 *          labels.
 * =============================================================================
 */

// =============================================================================
// GovernanceSharedLabels — shared across every governance page
// =============================================================================

/**
 * Labels shared by every governance page — the four page states plus
 * the four error-banner categories plus the request-id prefix.
 */
export interface GovernanceSharedLabels {
  readonly loadingMessage: string;
  readonly errorMessage: string;
  readonly errorRetryLabel: string;

  readonly conflictTitle: string;
  readonly conflictMessage: string;
  readonly networkErrorTitle: string;
  readonly networkErrorMessage: string;
  readonly genericErrorTitle: string;
  readonly genericErrorMessage: string;
  readonly requestIdPrefix: string;
}

const shared: GovernanceSharedLabels = {
  loadingMessage: 'በመጫን ላይ…',
  errorMessage: 'ይህን መረጃ ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',

  conflictTitle: 'ግጭት ተፈጥሯል',
  conflictMessage:
    'መረጃውን ያረጋግጡና እንደገና ይሞክሩ።',
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',
  requestIdPrefix: 'ማጣቀሻ፦',
};

// =============================================================================
// GovernanceBodyListViewLabels — the /governance/bodies page
// =============================================================================

export interface GovernanceBodyListViewLabels extends GovernanceSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly columnCode: string;
  readonly columnName: string;
  readonly columnType: string;
  readonly columnStatus: string;
  readonly columnEffectiveFrom: string;

  readonly statusActive: string;
  readonly statusInactive: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;

  readonly paginationAriaLabel: string;
  readonly paginationPrevLabel: string;
  readonly paginationNextLabel: string;
}

export const governanceBodyListViewLabels: GovernanceBodyListViewLabels = {
  ...shared,

  pageTitle: 'የአስተዳደር አካላት',
  pageDescription: 'የአሁኑ ተቋም የአስተዳደር አካላት።',

  columnCode:          'ኮድ',
  columnName:          'ስም',
  columnType:          'ዓይነት',
  columnStatus:        'ሁኔታ',
  columnEffectiveFrom: 'የጀመረበት',

  statusActive:   'ንቁ',
  statusInactive: 'ንቁ ያልሆነ',

  emptyTitle: 'ምንም የአስተዳደር አካላት የሉም',
  emptyDescription:
    'የአሁኑ ተቋም ምንም የአስተዳደር አካል አልተመዘገበም።',

  paginationAriaLabel: 'የአስተዳደር አካላት ዝርዝር ገጽ አሰሳ',
  paginationPrevLabel: 'ቀዳሚ',
  paginationNextLabel: 'ቀጣይ',
};

// =============================================================================
// GovernanceBodyDetailViewLabels — the /governance/bodies/:id page
// =============================================================================

/**
 * Labels for the governance-body detail page.
 *
 * Five sections:
 *   · identity (this file's initial delivery)
 *   · current term (this delivery)
 *   · positions (this delivery)
 *   · officers (this delivery)
 *   · roster (this delivery)
 */
export interface GovernanceBodyDetailViewLabels extends GovernanceSharedLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly notFoundTitle: string;
  readonly notFoundDescription: string;

  // ---------------------------------------------------------------------------
  // Identity card.
  // ---------------------------------------------------------------------------
  readonly identitySectionTitle: string;

  readonly codeLabel: string;
  readonly typeLabel: string;
  readonly nameLabel: string;
  readonly statusLabel: string;
  readonly standingLabel: string;
  readonly temporaryLabel: string;
  readonly purposeLabel: string;
  readonly mandateLabel: string;
  readonly parentBodyLabel: string;
  readonly reportingBodyLabel: string;
  readonly meetingFrequencyLabel: string;
  readonly quorumRuleLabel: string;
  readonly effectiveFromLabel: string;
  readonly effectiveUntilLabel: string;
  readonly createdAtLabel: string;
  readonly updatedAtLabel: string;

  readonly yesLabel: string;
  readonly noLabel: string;

  // ---------------------------------------------------------------------------
  // Current term section — a single card. The card renders the
  // currentTerm field from GovernanceBodyDetail (null when the body
  // has no current term).
  // ---------------------------------------------------------------------------
  readonly termSectionTitle: string;
  readonly termLabel: string;
  readonly termEffectiveFromLabel: string;
  readonly termEffectiveUntilLabel: string;
  readonly termNotesLabel: string;
  readonly termEmpty: string;

  // ---------------------------------------------------------------------------
  // Positions section — a table. Columns: code, name, voting,
  // officer, active. The positions array is already sorted by
  // sort_order ascending.
  // ---------------------------------------------------------------------------
  readonly positionsSectionTitle: string;
  readonly positionsColumnCode: string;
  readonly positionsColumnName: string;
  readonly positionsColumnVoting: string;
  readonly positionsColumnOfficer: string;
  readonly positionsColumnStatus: string;
  readonly positionsEmpty: string;

  /** Value labels for the voting/officer cells. */
  readonly votingYes: string;
  readonly votingNo: string;
  readonly officerYes: string;
  readonly officerNo: string;

  // ---------------------------------------------------------------------------
  // Officers section — a table. Columns: title, position, since,
  // mode. The title column is deliberately labelled generically —
  // see the change-verification block §"A concern about the officers
  // section" for the ambiguity.
  // ---------------------------------------------------------------------------
  readonly officersSectionTitle: string;
  readonly officersColumnTitle: string;
  readonly officersColumnPosition: string;
  readonly officersColumnSince: string;
  readonly officersColumnMode: string;
  readonly officersEmpty: string;

  // ---------------------------------------------------------------------------
  // Roster section — a table. Columns: member, position, term,
  // since, ex-officio, status. `status` here shows the membership's
  // status_label — the resource supplies it via the catalogue.
  // ---------------------------------------------------------------------------
  readonly rosterSectionTitle: string;
  readonly rosterColumnMember: string;
  readonly rosterColumnPosition: string;
  readonly rosterColumnTerm: string;
  readonly rosterColumnSince: string;
  readonly rosterColumnExOfficio: string;
  readonly rosterColumnStatus: string;
  readonly rosterEmpty: string;

  /** Value label for the roster's ex-officio cell (yes/no pair). */
  readonly exOfficioYes: string;
  readonly exOfficioNo: string;
}

export const governanceBodyDetailViewLabels: GovernanceBodyDetailViewLabels = {
  ...shared,

  pageTitle: 'የአስተዳደር አካል',
  pageDescription: 'የአስተዳደር አካሉ ዝርዝር።',

  notFoundTitle: 'የአስተዳደር አካሉ አልተገኘም',
  notFoundDescription:
    'ይህ የአስተዳደር አካል አልተገኘም ወይም የማየት ፈቃድ የለዎትም።',

  identitySectionTitle: 'መረጃ',

  codeLabel:             'ኮድ',
  typeLabel:             'ዓይነት',
  nameLabel:             'ስም',
  statusLabel:           'ሁኔታ',
  standingLabel:         'ቋሚነት',
  temporaryLabel:        'ጊዜያዊነት',
  purposeLabel:          'ዓላማ',
  mandateLabel:          'ተልዕኮ',
  parentBodyLabel:       'ወላጅ አካል',
  reportingBodyLabel:    'የሚመራበት አካል',
  meetingFrequencyLabel: 'የስብሰባ ድግግሞሽ',
  quorumRuleLabel:       'ኮረም',
  effectiveFromLabel:    'የጀመረበት',
  effectiveUntilLabel:   'የሚያበቃበት',
  createdAtLabel:        'የተፈጠረበት',
  updatedAtLabel:        'መጨረሻ የተሻሻለበት',

  yesLabel: 'አዎ',
  noLabel:  'አይደለም',

  // ---------------------------------------------------------------------------
  // Current term.
  // ---------------------------------------------------------------------------
  termSectionTitle:         'የአሁኑ የሥራ ዘመን',
  termLabel:                'የሥራ ዘመን',
  termEffectiveFromLabel:   'የጀመረበት',
  termEffectiveUntilLabel:  'የሚያበቃበት',
  termNotesLabel:           'ማስታወሻ',
  termEmpty:                'ምንም የአሁኑ የሥራ ዘመን የለም።',

  // ---------------------------------------------------------------------------
  // Positions.
  // ---------------------------------------------------------------------------
  positionsSectionTitle:   'የተገለጹ ቦታዎች',
  positionsColumnCode:     'ኮድ',
  positionsColumnName:     'ስም',
  positionsColumnVoting:   'ድምጽ',
  positionsColumnOfficer:  'መኮንንነት',
  positionsColumnStatus:   'ሁኔታ',
  positionsEmpty:          'ምንም ቦታዎች የሉም።',

  votingYes:  'ድምጽ ያለው',
  votingNo:   'ድምጽ የሌለው',
  officerYes: 'መኮንን',
  officerNo:  '—',

  // ---------------------------------------------------------------------------
  // Officers.
  // ---------------------------------------------------------------------------
  officersSectionTitle:   'አሁን ያሉ መኮንኖች',
  officersColumnTitle:    'ርዕስ',
  officersColumnPosition: 'ቦታ',
  officersColumnSince:    'ከ',
  officersColumnMode:     'የተሾመበት መንገድ',
  officersEmpty:          'ምንም አሁን ያሉ መኮንኖች የሉም።',

  // ---------------------------------------------------------------------------
  // Roster.
  // ---------------------------------------------------------------------------
  rosterSectionTitle:     'የአሁኑ የአባላት ዝርዝር',
  rosterColumnMember:     'አባል',
  rosterColumnPosition:   'ቦታ',
  rosterColumnTerm:       'የሥራ ዘመን',
  rosterColumnSince:      'ከ',
  rosterColumnExOfficio:  'በስልጣን መሠረት',
  rosterColumnStatus:     'ሁኔታ',
  rosterEmpty:            'ምንም አባላት የሉም።',

  exOfficioYes: 'በስልጣን መሠረት',
  exOfficioNo:  '—',
};