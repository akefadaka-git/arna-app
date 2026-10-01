/*
 * =============================================================================
 * MASES Phase 2 UI — Error Route Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/error-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.4, §14.5
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The three error variants rendered by router/pages/ErrorRoute.vue —
 * 404 (not-found), 503 (maintenance), and 403 (access-denied) — as
 * Amharic constants. Also covers the shared ErrorSupportPanel labels
 * that the 404 and 503 variants render, and that the 403 variant
 * renders via AccessDeniedPage.
 *
 * This file is the error-route counterpart to router/auth-labels.ts,
 * router/launcher-labels.ts, and router/shell-labels.ts. It follows
 * the same pattern: every value is Amharic, the key names remain
 * English identifiers that describe the slot each value fills, and
 * Latin script is preserved only where a term is its own identity.
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. Amharic values for the three error
 *          variants and the shared support panel.
 *
 *          This file closes an i18n gap that ErrorRoute.vue's own
 *          header comment flagged as an exception: the file carried
 *          its user-facing strings inline in English. Those strings
 *          are now externalized here in Amharic. The subsequent
 *          ErrorRoute.vue revision (Unit A-5) imports them.
 *
 *          The eight support-panel strings (toggle, errorCode,
 *          requestId, timestamp, occurredAt, copy, copied,
 *          copyFallbackInstruction) and, per variant, the three
 *          strings rendered directly on <ErrorPage> (status-label,
 *          title, message) plus the two action-array labels move
 *          from the page component to this file.
 *
 * -----------------------------------------------------------------------------
 * What this file exports
 * -----------------------------------------------------------------------------
 * Twelve constants, in four groups:
 *
 *   1. The shared support-panel labels — one object.
 *
 *          errorSupportLabels: ErrorPageLabels['support']
 *
 *      Rendered by the ErrorSupportPanel that ErrorPage composes on
 *      the 404 and 503 variants, and that AccessDeniedPage composes
 *      on the 403 variant. All three read the same object.
 *
 *   2. The 404 variant — five constants.
 *
 *          errorNotFoundStatusLabel: string
 *          errorNotFoundTitle:       string
 *          errorNotFoundMessage:     string
 *          errorNotFoundPageLabels:  ErrorPageLabels
 *          errorNotFoundActions:     ReadonlyArray<ErrorPageAction>
 *
 *      The HTTP status code (404) is not here. It is a language-
 *      neutral numeric value rendered inline in the component's
 *      template.
 *
 *   3. The 503 variant — five constants.
 *
 *          errorMaintenanceStatusLabel: string
 *          errorMaintenanceTitle:       string
 *          errorMaintenanceMessage:     string
 *          errorMaintenancePageLabels:  ErrorPageLabels
 *          errorMaintenanceActions:     ReadonlyArray<ErrorPageAction>
 *
 *   4. The 403 variant — one constant.
 *
 *          errorAccessDeniedLabels: AccessDeniedLabels
 *
 *      The 403 variant is a composed pattern (AccessDeniedPage)
 *      rather than a direct ErrorPage call, so it takes a single
 *      labels object. The `from` / `code` / `request_id` values it
 *      displays are read from the route query by the component, not
 *      from this file.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "መነሻ" (home / start) is the term the shell's sidebar uses for the
 * launcher route (router/shell-labels.ts, authenticatedNavItems and
 * portalNavItems). The two error-variant actions that navigate to
 * /launcher use the same term so that a user who arrives at an error
 * page and then returns to the launcher sees one consistent name for
 * that destination.
 *
 * "ኮድ" (code) and "ማጣቀሻ" (reference) are the terms the support panel
 * uses for the error code and the request ID. The latter matches the
 * register auth-labels.ts established for its requestIdPrefix
 * ("ማጣቀሻ፦"); the "፦" colon suffix is dropped here because the field
 * is a standalone label, not a prefix for a value.
 *
 * "የአካባቢ ጊዜ" (local time) is used for the timestamp row. It is a
 * compound of the noun "አካባቢ" (locality) and the noun "ጊዜ" (time),
 * bound by the genitive "የ". The English source said "Local time"
 * and distinguished it from the machine timestamp; the Amharic
 * preserves that distinction.
 *
 * "ቅዳ" (copy) and "ተቀድቷል" (has been copied) are the imperative and
 * the perfective forms of the same verb. The English source used the
 * base form "Copy" for the button and the past participle "Copied"
 * for the confirmation; the Amharic mirrors that with the singular
 * imperative (for a button) and the perfective (for a completed
 * state).
 *
 * "ቴክኒካዊ" (technical) is a loanword that is universally recognized
 * in Ethiopian software UI. It is used here rather than a native
 * alternative because the "Technical details" toggle is a
 * developer-facing affordance and the loanword is what users expect.
 *
 * "የተከለከለ" (forbidden) is used for the 403 status label. It is the
 * standard Amharic rendering of "prohibited" / "forbidden" and
 * pairs with "መዳረሻ ተከልክሏል" ("access denied") as the title.
 *
 * "መዳረሻ" (access) is used in the 403 title. It is the standard
 * Amharic term for the act of reaching or accessing something.
 *
 * -----------------------------------------------------------------------------
 * Translation quality notes
 * -----------------------------------------------------------------------------
 * The Amharic below follows the register set by the four preceding
 * label files (auth, launcher, shell, and the three feature label
 * files in the current phase):
 *
 *   · Imperative voice for actionable elements — "ቅዳ", "ወደ መነሻ ሂድ",
 *     "ወደ መነሻ ተመለስ", "እንደገና ይሞክሩ". Every button on the error routes is
 *     an imperative.
 *
 *   · The retry label is the same "እንደገና ይሞክሩ" string used
 *     everywhere else in the localized surface.
 *
 *   · The 404 message uses the same phrasing the orphaned
 *     NotFoundRoute.vue uses for its own 404 state ("የፈለጉት ገጽ
 *     አልተገኘም…"). The two components present one message, not two.
 *
 *   · The 403 message uses the same two-sentence pattern as the
 *     shell and feature empty states: a factual statement of the
 *     situation, followed by the conditional escalation "… ይህ ስህተት
 *     ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።".
 *
 *   · The 503 message is two sentences: a statement of the situation
 *     and a polite instruction. The instruction uses the plural
 *     imperative "ይሞክሩ", matching the retry string.
 *
 *   · None of the three messages carries the trailing ellipsis (U+2026)
 *     that the loading strings use. They are statements, not
 *     in-progress states. A future reviewer who adds a loading label
 *     here should follow the convention the other label files use
 *     (U+2026, not three ASCII periods).
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings are the most likely candidates for adjustment
 * by a native Amharic reviewer. They are idiomatic as far as this
 * author can determine, but native review is the correct final gate:
 *
 *   · errorMaintenanceTitle: 'በጊዜያዊነት አገልግሎት ላይ ነን' — literally "we
 *     are temporarily on the service". The English source said "We
 *     are temporarily unavailable". A reviewer may prefer a
 *     construction that names the unavailability rather than the
 *     service state. Either is correct.
 *
 *   · errorMaintenanceStatusLabel: 'አገልግሎቱ አይገኝም' — "the service is
 *     not available". This is the status chip that sits next to the
 *     "503" number. A reviewer may prefer the shorter 'አይገኝም'
 *     ("unavailable") since the surrounding context already names
 *     the service.
 *
 *   · errorMaintenanceMessage: 'አገልግሎቱ በጥገና ላይ ነው። እባክዎ በጥቂት
 *     ደቂቃዎች ውስጥ እንደገና ይሞክሩ።' — "the service is under maintenance.
 *     Please try again in a few minutes." "ጥገና" is the standard
 *     Amharic term for maintenance. The phrase "በጥቂት ደቂቃዎች ውስጥ" is
 *     "in a few minutes"; a reviewer may prefer "በአጭር ጊዜ ውስጥ" ("in a
 *     short time"), which is what the generic error messages use
 *     elsewhere in the codebase.
 *
 *   · errorNotFoundMessage: 'የፈለጉት ገጽ የለም፣ ወይም ተዛውሮ ሊሆን ይችላል።' —
 *     "the page you were looking for does not exist, or may have
 *     moved." The comma before "ወይም" ("or") is a stylistic choice;
 *     Amharic prose often omits it. A reviewer may prefer to drop
 *     it, or to use the Amharic enumeration mark "፣" only between
 *     list items.
 *
 *   · errorAccessDeniedLabels.fileHint: 'ይህን ተግባር ለማከናወን ተጨማሪ ቀጥተኛ
 *     ፈቃዶች ሊያስፈልጉዎት ይችላሉ።' — "you may require additional direct
 *     permissions to perform this action." The phrase "ቀጥተኛ ፈቃዶች"
 *     is a literal rendering of "direct permissions" that reflects
 *     a specific backend concept (advisory vs. direct permissions,
 *     see features/files/api.ts §7.4.1). A reviewer may prefer
 *     "ተጨማሪ ፈቃዶች" alone, dropping the distinction, if the UI does
 *     not need to teach the concept. The current form preserves the
 *     distinction for the case where it matters.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Native-speaker review of the five strings listed above. None of
 *    them block delivery; the review is a refinement.
 *
 * 2. ErrorRoute.vue itself is not modified by this unit. The
 *    subsequent unit (A-5) removes the inline English objects and
 *    imports from here. Between A-4 and A-5, the two sources of
 *    error labels coexist; only A-5 makes this file the sole source.
 *
 * 3. The status codes (404, 503) rendered as numeric badges by
 *    ErrorPage are not externalized here. They are language-neutral
 *    and remain inline in ErrorRoute.vue's template.
 *
 * 4. The route-query readers (accessDeniedCode, accessDeniedFrom,
 *    requestId) in ErrorRoute.vue remain in the component. They
 *    read user-supplied URL parameters and pass them through; they
 *    are not translatable strings.
 * =============================================================================
 */

import type {
  ErrorPageAction,
  ErrorPageLabels,
} from '@/components/patterns/ErrorPage';
import type { AccessDeniedLabels } from '@/components/patterns/AccessDeniedPage';

// =============================================================================
// Shared support-panel labels
// =============================================================================

/**
 * The ErrorSupportPanel labels, shared by the 404, 503, and 403
 * variants.
 *
 * ErrorPage composes the panel on the 404 and 503 variants;
 * AccessDeniedPage composes it on the 403 variant. All three read the
 * same object.
 *
 * The eight fields correspond one-to-one with the slots the panel
 * renders. The descriptions below repeat only the constraint each
 * label must satisfy.
 */
export const errorSupportLabels: ErrorPageLabels['support'] = {
  /**
   * The toggle button that expands the panel. Shown closed by
   * default. The label names the content the panel contains.
   */
  toggle: 'ቴክኒካዊ ዝርዝሮች',

  /**
   * The label preceding the error code (e.g. "HTTP_500",
   * "AUTH_EMAIL_TAKEN"). The code itself is server-supplied and is
   * rendered verbatim; this string names what it is.
   */
  errorCode: 'ኮድ',

  /**
   * The label preceding the request ID. Matches the register
   * auth-labels.ts established with its requestIdPrefix ("ማጣቀሻ፦").
   */
  requestId: 'ማጣቀሻ',

  /**
   * The label preceding the machine timestamp. "ጊዜ" is the
   * standalone noun for "time"; the compound "የአካባቢ ጊዜ" ("local
   * time") is used for the row below it. The two are deliberately
   * distinct.
   */
  timestamp: 'ጊዜ',

  /**
   * The label preceding the local-time rendering of the same
   * timestamp. The distinction from `timestamp` matches the English
   * source, which showed a machine timestamp and a human-readable
   * local time.
   */
  occurredAt: 'የአካባቢ ጊዜ',

  /**
   * The copy button. Singular imperative, matching every other
   * actionable element in the localized surface.
   */
  copy: 'ቅዳ',

  /**
   * The success state of the copy button, shown briefly after a
   * successful clipboard write. Perfective form ("has been copied").
   */
  copied: 'ተቀድቷል',

  /**
   * The instruction shown when the clipboard API is unavailable
   * (older browsers, insecure contexts). Tells the user to select
   * the text manually.
   */
  copyFallbackInstruction:
    'ከታች ያለውን ጽሑፍ ይምረጡና በእጅ ይቅዱ።',
};

// =============================================================================
// 404 — Not found
// =============================================================================

/**
 * The 404 variant's status chip. Rendered next to the numeric "404"
 * badge in the ErrorPage's heading.
 */
export const errorNotFoundStatusLabel = 'አልተገኘም';

/**
 * The 404 variant's page title.
 */
export const errorNotFoundTitle = 'ገጹ አልተገኘም';

/**
 * The 404 variant's explanatory message.
 *
 * Phrased to cover both causes: the URL never named a page, or the
 * page existed and has moved. Matches the message the orphaned
 * NotFoundRoute.vue uses for its own 404 state, so the two
 * components present one message rather than two.
 */
export const errorNotFoundMessage =
  'የፈለጉት ገጽ የለም፣ ወይም ተዛውሮ ሊሆን ይችላል።';

/**
 * The 404 variant's ErrorPage labels object.
 *
 * ErrorPage requires a `labels` prop even when the only field it uses
 * is `support`. The object is declared here — rather than built
 * inline in the component — so that a future addition of a second
 * field on ErrorPageLabels is a one-line change in one file.
 */
export const errorNotFoundPageLabels: ErrorPageLabels = {
  support: errorSupportLabels,
};

/**
 * The 404 variant's action list.
 *
 * A single action that navigates to /launcher. The action's `id`
 * ('home') is preserved byte-for-byte from the source; the component
 * routes on it. The `label` is the only field that changes.
 *
 * The array is typed `ReadonlyArray<ErrorPageAction>` rather than
 * `ErrorPageAction[]` so that a consumer cannot mutate the shared
 * list. This matches the source's `computed<ReadonlyArray<...>>`
 * declaration.
 */
export const errorNotFoundActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'home', label: 'ወደ መነሻ ሂድ', variant: 'primary' },
];

// =============================================================================
// 503 — Maintenance
// =============================================================================

/**
 * The 503 variant's status chip. Rendered next to the numeric "503"
 * badge.
 */
export const errorMaintenanceStatusLabel = 'አገልግሎቱ አይገኝም';

/**
 * The 503 variant's page title.
 */
export const errorMaintenanceTitle = 'በጊዜያዊነት አገልግሎት ላይ ነን';

/**
 * The 503 variant's explanatory message.
 */
export const errorMaintenanceMessage =
  'አገልግሎቱ በጥገና ላይ ነው። እባክዎ በጥቂት ደቂቃዎች ውስጥ እንደገና ይሞክሩ።';

/**
 * The 503 variant's ErrorPage labels object. See the note above
 * errorNotFoundPageLabels.
 */
export const errorMaintenancePageLabels: ErrorPageLabels = {
  support: errorSupportLabels,
};

/**
 * The 503 variant's action list.
 *
 * A single action that reloads the page. The action's `id` ('retry')
 * is preserved byte-for-byte from the source; the component routes
 * on it. The label is the same retry string used everywhere else in
 * the localized surface.
 */
export const errorMaintenanceActions: ReadonlyArray<ErrorPageAction> = [
  { id: 'retry', label: 'እንደገና ይሞክሩ', variant: 'primary' },
];

// =============================================================================
// 403 — Access denied
// =============================================================================

/**
 * The 403 variant's labels object.
 *
 * The 403 variant is rendered by the AccessDeniedPage pattern, not
 * by a direct ErrorPage call. It composes an ErrorPage internally,
 * which is why its labels object supplies a `support` block of its
 * own — the same shared object the other two variants use.
 *
 * The `code` and `from` values the component passes to
 * AccessDeniedPage are read from the route query by ErrorRoute.vue
 * and are not part of this object. They are runtime data, not
 * translatable strings.
 *
 * The `fileHint` field is shown only when AccessDeniedPage detects
 * the FILE_ACCESS_DENIED condition (see features/files/api.ts
 * §7.4.1). It is nonetheless a required field on the labels type;
 * the pattern renders it conditionally.
 */
export const errorAccessDeniedLabels: AccessDeniedLabels = {
  title: 'መዳረሻ ተከልክሏል',
  message:
    'ይህን ገጽ ለመመልከት ፈቃድ የለዎትም። ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።',
  statusLabel: 'የተከለከለ',
  launcher: 'ወደ መነሻ ተመለስ',
  fileHint:
    'ይህን ተግባር ለማከናወን ተጨማሪ ቀጥተኛ ፈቃዶች ሊያስፈልጉዎት ይችላሉ።',
  support: errorSupportLabels,
};