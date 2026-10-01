/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-DASH1 (feature dashboard)
 * =============================================================================
 *
 * File:      mase_app/src/features/dashboard/labels.ts  (NEW)
 * Unit:      CR-DASH1 — Workspace feature dashboard (labels)
 * Delivery type:  New file.
 * Net lines:      new file.
 *
 * Before:
 *   The file did not exist. The workspace had no feature-dashboard page
 *   and no labels module for one. Every feature (loans, loan products,
 *   shareholders, share classes, wallets, files) was reachable only
 *   through the sidebar; there was no single-page index of "what can
 *   this caller do?".
 *
 * After:
 *   A feature-level labels module at `features/dashboard/labels.ts`
 *   that declares the labels the dashboard view requires:
 *
 *     · page chrome — title, description, loading, error, retry,
 *       request-id prefix, empty state;
 *     · one `DashboardTileLabels` object per feature — title and
 *       description for each tile.
 *
 *   The interface is a NESTED structure: one `DashboardTileLabels`
 *   per feature, keyed by the feature's name. This matches the way
 *   the view will iterate over a static catalogue of tiles, and it
 *   keeps each tile's title and description adjacent in the source.
 *
 *   The register of the six feature titles MATCHES the corresponding
 *   entries in `router/shell-labels.ts` — 'ብድሮች', 'የብድር ዓይነቶች',
 *   'ባለአክሲዮኖች', 'የአክሲዮን ክፍሎች', 'የገንዘብ ማስቀመጫዎች', 'ሰነዶች' —
 *   so that the sidebar label and the tile label agree on the string
 *   for each feature. A reviewer comparing the two files will find
 *   them identical, by design.
 *
 *   Descriptions are new strings. They are deliberately one short
 *   sentence each — a tile description is a hint, not a paragraph.
 *
 * Amharic values — origin and review
 * ----------------------------------
 * Every value is Amharic. The register choices worth noting:
 *
 *   · 'ዳሽቦርድ' — the title. A loanword in common Ethiopian tech
 *     register; alternatives considered were 'የስራ ማዕከል' ("work
 *     center") and 'የስራ ቦታ' ("workspace", already used for the
 *     workspace itself). 'ዳሽቦርድ' is the clearest single-word
 *     identifier for a landing page that shows what the caller can do.
 *
 *   · 'አገልግሎቶች' — the term for "services" in the description. This
 *     is the register the platform uses for "features" in a UI
 *     context. 'ባህሪያት' ("characteristics") is not used, because it
 *     describes attributes rather than capabilities.
 *
 *   · Tile descriptions use the imperative plural — 'ያስተዳድሩ' ("manage"),
 *     'ይመልከቱ' ("view"). The register matches the shell's nav
 *     descriptions.
 *
 * All new strings are added to the native-speaker review list.
 *
 * Dependency note:
 *   · No imports. The file is a pure labels module.
 *   · Consumed by `features/dashboard/DashboardView.vue` (to be
 *     delivered) and by the workspace route registration (to be
 *     amended in `router/routes-workspace.ts`).
 *
 * Files modified:  this file only (new)
 * Files added:     this file
 * Files deleted:   none
 * =============================================================================
 */

// =============================================================================
// DashboardTileLabels — one tile's label pair
// =============================================================================

/**
 * The labels for a single feature tile.
 *
 * `title` is rendered as the tile's heading. `description` is
 * rendered as a short hint beneath it.
 *
 * The two strings are kept adjacent so a future translator sees them
 * together. The tile's icon and route are NOT declared here — those
 * are properties of the catalogue in the view, not of the label
 * module. A future CR that localizes the catalogue's icon or route
 * would extend this interface at that time.
 */
export interface DashboardTileLabels {
  readonly title: string;
  readonly description: string;
}

// =============================================================================
// DashboardViewLabels — the full label set for the dashboard page
// =============================================================================

/**
 * The full label set the dashboard page requires.
 *
 * Page chrome fields are flat (title, description, loading, error,
 * empty). Feature-tile fields are nested — one `DashboardTileLabels`
 * object per feature — matching the shape the view iterates over.
 *
 * The interface is intentionally NOT an extension of any other
 * labels interface. The dashboard is a distinct feature with no
 * labels in common with the loan, wallet, or shareholder features;
 * the four shared chrome strings are declared here as they would be
 * in any other feature's label module.
 */
export interface DashboardViewLabels {
  // ---------------------------------------------------------------------------
  // Page chrome
  // ---------------------------------------------------------------------------
  readonly pageTitle: string;
  readonly pageDescription: string;

  readonly loadingMessage: string;

  readonly errorTitle: string;
  readonly errorRetryLabel: string;

  readonly requestIdPrefix: string;

  readonly emptyTitle: string;
  readonly emptyDescription: string;

  // ---------------------------------------------------------------------------
  // Feature tiles
  //
  // One entry per feature the dashboard renders. Each entry carries
  // the tile's title and description. The order of the fields below
  // is the order the view renders the tiles in.
  // ---------------------------------------------------------------------------
  readonly loans: DashboardTileLabels;
  readonly loanProducts: DashboardTileLabels;
  readonly shareholders: DashboardTileLabels;
  readonly shareClasses: DashboardTileLabels;
  readonly wallets: DashboardTileLabels;
  readonly files: DashboardTileLabels;
}

// =============================================================================
// The label values
// =============================================================================

/**
 * The dashboard's full label set.
 *
 * Feature titles are kept byte-for-byte identical to the
 * corresponding entries in `router/shell-labels.ts`. If the sidebar
 * label for a feature is changed, the dashboard tile for that
 * feature MUST change in the same commit — otherwise the two
 * surfaces disagree on the feature's name.
 */
export const dashboardViewLabels: DashboardViewLabels = {
  // ---------------------------------------------------------------------------
  // Page chrome
  // ---------------------------------------------------------------------------
  pageTitle: 'ዳሽቦርድ',
  pageDescription: 'የሚገኙ የስራ ቦታ አገልግሎቶች።',

  loadingMessage: 'በመጫን ላይ…',

  errorTitle: 'ይህን ገጽ ማምጣት አልቻልንም።',
  errorRetryLabel: 'እንደገና ይሞክሩ',

  requestIdPrefix: 'ማጣቀሻ፦',

  emptyTitle: 'ምንም አገልግሎቶች የሉም',
  emptyDescription:
    'ለእርስዎ የሚገኝ የስራ ቦታ አገልግሎት የለም። አስተዳዳሪዎን ያግኙ።',

  // ---------------------------------------------------------------------------
  // Feature tiles
  // ---------------------------------------------------------------------------
  loans: {
    title: 'ብድሮች',
    description: 'የተቋሙን ብድሮች ያስተዳድሩ።',
  },
  loanProducts: {
    title: 'የብድር ዓይነቶች',
    description: 'የብድር ዓይነቶችን ይመልከቱ።',
  },
  shareholders: {
    title: 'ባለአክሲዮኖች',
    description: 'ባለአክሲዮኖችን ያስተዳድሩ።',
  },
  shareClasses: {
    title: 'የአክሲዮን ክፍሎች',
    description: 'የአክሲዮን ክፍሎችን ይመልከቱ።',
  },
  wallets: {
    title: 'የገንዘብ ማስቀመጫዎች',
    description: 'የገንዘብ ማስቀመጫዎችን ያስተዳድሩ።',
  },
  files: {
    title: 'ሰነዶች',
    description: 'ሰነዶችን ያስተዳድሩ።',
  },
};