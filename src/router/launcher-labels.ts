/*
 * =============================================================================
 * MASES UI — Launcher Grid Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/launcher-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The launcher surface's user-facing strings, in Amharic. Consumed by
 * router/pages/LauncherRoute.vue and forwarded to
 * layouts/AppShell/LauncherGrid as its `labels` prop.
 *
 * This file is the launcher counterpart to router/auth-labels.ts. It
 * follows the same pattern: every value is Amharic, with a small,
 * documented set of terms handled deliberately, and the key names
 * remain English identifiers that describe the slot each value fills.
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. Amharic values for the five label keys
 *          that LauncherGridLabels requires. No component file is
 *          modified by this unit. LauncherRoute.vue continues to
 *          declare its own inline English object until the subsequent
 *          unit (L-2) imports from this file.
 *
 * -----------------------------------------------------------------------------
 * The launcher labels interface
 * -----------------------------------------------------------------------------
 * The shape is owned by LauncherGrid.vue and re-exported through the
 * barrel at @/layouts/AppShell/LauncherGrid. It declares exactly five
 * readonly string fields, all required:
 *
 *     loadingMessage       — the loading affordance
 *     emptyTitle           — the empty-state heading
 *     emptyDescription     — the empty-state explanation
 *     errorMessage         — the error-state heading
 *     errorRetryLabel      — the error-state retry button
 *
 * There is no "not-found" label and no "permission-denied" label here:
 * LauncherGrid does not currently render either state. If a future CR
 * adds them to the interface, this file grows by the same number of
 * keys.
 *
 * -----------------------------------------------------------------------------
 * Why the values are Amharic
 * -----------------------------------------------------------------------------
 * The design system's §9.1 default locale is 'am'. This file is the
 * launcher's contribution to that policy, in the same shape and with
 * the same rationale as router/auth-labels.ts. When i18n is introduced
 * (a future CR), this file becomes a facade over the translation
 * service; the keys remain stable and neither LauncherRoute.vue nor
 * LauncherGrid.vue changes.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "አፕሊኬሽን" (application) is used rather than the native Amharic
 * "መተግበሪያ". Reason: it is the term the MASES registry itself uses.
 * The platform_applications.name_am value for the 'launcher' row is
 * "የአፕሊኬሽን መክፈቻ" (Application Launcher). Following the registry's
 * own usage keeps the launcher grid consistent with the localized
 * application names it displays. A reviewer who prefers "መተግበሪያ"
 * should change both this file and the registry row together — a
 * single-place change would create an inconsistent surface.
 *
 * "MASES" does not appear in any of these five strings. If a future
 * CR adds a string that names the product, the convention is
 * Latin-script "MASES", matching the workspace build's VITE_APP_NAME.
 *
 * -----------------------------------------------------------------------------
 * Translation quality notes
 * -----------------------------------------------------------------------------
 * The Amharic below is idiomatic for Ethiopian software UI and follows
 * the register set by router/auth-labels.ts:
 *
 *   · The loading message uses the present-progressive verbal-noun
 *     form ("በመጫን ላይ…" — "in the act of loading"), matching the
 *     pattern auth-labels uses for "በመግባት ላይ…", "በመላክ ላይ…", and
 *     "በማስጀመር ላይ…". The trailing ellipsis is U+2026 (…), the same
 *     character the auth batch uses.
 *
 *   · The empty state is phrased as a statement of fact ("there are
 *     none") rather than as a failure. This mirrors the distinction
 *     the English source made between an empty list and a failed
 *     fetch — the grid treats "0 accessible applications" as a
 *     deterministic state, not as an error.
 *
 *   · The retry label uses the plural imperative "እንደገና ይሞክሩ" — the
 *     same string auth-labels uses for every retry affordance across
 *     the login, register, forgot-password, reset-password, and
 *     verification forms.
 *
 *   · The empty-state description ends with the same conditional
 *     escalation pattern the English source used ("if you think this
 *     is an error"). It does not tell every user to contact an
 *     administrator — only those who believe the empty state is
 *     unexpected.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings are the most likely candidates for adjustment
 * by a native Amharic reviewer. They are idiomatic as far as this
 * author can determine, but native review is the correct final gate:
 *
 *   · loadingMessage: 'አፕሊኬሽኖችን በመጫን ላይ…' — the object-incorporated
 *     form ("loading the applications") reads naturally in Amharic.
 *     A reviewer may prefer the intransitive "አፕሊኬሽኖች በመጫን ላይ ናቸው…"
 *     ("the applications are loading…"). Both are correct; the
 *     object-incorporated form is shorter and matches the register of
 *     the auth batch's submitting labels.
 *
 *   · emptyTitle: 'ምንም ተደራሽ አፕሊኬሽኖች የሉም' — "ተደራሽ" ("accessible") is
 *     chosen to distinguish "no applications are accessible to you"
 *     from "the system has no applications registered". The empty
 *     state appears in the first case; the wording must not suggest a
 *     system failure. A reviewer may prefer a different word for
 *     "accessible"; the constraint is that the title not imply an
 *     error.
 *
 *   · errorMessage: 'አፕሊኬሽኖችዎን ማምጣት አልቻልንም።' — "we could not bring
 *     your applications". The verb "ማምጣት" is chosen to parallel the
 *     auth batch's "ማግኘት አልቻልንም" (could not reach) family. A reviewer
 *     may prefer "መጫን አልቻልንም" ("could not load"). Either is idiomatic.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Native-speaker review of the three strings above. None of them
 *    block delivery; the review is a refinement.
 *
 * 2. LauncherRoute.vue continues to declare its own inline English
 *    labels in this unit. The subsequent unit (L-2) removes that
 *    inline object and imports from this file. Between L-1 and L-2,
 *    the two sources of launcher labels coexist; only L-2 makes this
 *    file the sole source.
 *
 * 3. This file exports a single value. If a future CR adds launcher
 *    surface strings beyond the five the grid consumes — a "categories"
 *    heading, a "search" placeholder, a "favorites" section title — they
 *    are added here as additional exported consts (or as additional
 *    fields on an extended interface), not by extending the grid's
 *    existing label prop. The grid's prop should grow only when the
 *    grid itself gains the corresponding render path.
 * =============================================================================
 */

import type { LauncherGridLabels } from '@/layouts/AppShell/LauncherGrid';

/**
 * The launcher grid's user-facing strings, in Amharic.
 *
 * The interface (LauncherGridLabels) is owned by LauncherGrid.vue and
 * re-exported through the barrel at @/layouts/AppShell/LauncherGrid.
 * This file imports the type from that barrel — the same import path
 * LauncherRoute.vue already uses — so a future relocation of the type
 * (e.g. into a dedicated types module) requires no change here beyond
 * the import line.
 *
 * The object is declared with an explicit type annotation rather than
 * `as const`. Every field on the interface is readonly, so the object
 * is immutable under either declaration. The explicit annotation is
 * chosen to make the file's contract visible on the export line and
 * to match the style LauncherRoute.vue currently uses for the inline
 * object this file replaces.
 */
export const launcherGridLabels: LauncherGridLabels = {
  /**
   * Shown while the applications list is being fetched.
   *
   * The trailing ellipsis is the character U+2026 (…), the same one
   * auth-labels.ts uses. It is not load-bearing — a reviewer who
   * prefers three ASCII periods can make that a one-line change here
   * without affecting any consumer.
   */
  loadingMessage: 'አፕሊኬሽኖችን በመጫን ላይ…',

  /**
   * Shown when the authenticated user has no accessible applications.
   *
   * This is a deterministic state, not an error. The wording avoids
   * implying a failure: "there are none accessible to you" rather
   * than "we could not load". See the file header comment §"Translation
   * quality notes".
   */
  emptyTitle: 'ምንም ተደራሽ አፕሊኬሽኖች የሉም',

  /**
   * The empty-state explanation. Two sentences:
   *
   *   1. A statement of the user's current access ("currently you
   *      cannot access any application").
   *   2. A pointer to the correct escalation path, guarded by a
   *      conditional so that a user who has never had access — the
   *      common case for this state — is not told to escalate.
   *
   * The same two-sentence, conditionally-escalating pattern appears in
   * auth-labels.ts (e.g. invalidCredentialsMessage, networkErrorMessage,
   * verifyEmailPanelLabels.userNotFoundMessage).
   */
  emptyDescription:
    'በአሁኑ ጊዜ ምንም አፕሊኬሽን ማግኘት አይችሉም። ይህ ስህተት ነው ብለው ካሰቡ፣ አስተዳዳሪዎን ያግኙ።',

  /**
   * Shown when the applications fetch fails.
   *
   * LauncherGrid's state derivation collapses every consumer-supplied
   * error (network failure, 500, 503, timeout) into this one message;
   * the grid does not distinguish between them. That simplification is
   * carried over from the English source this file replaces. The retry
   * affordance is the recovery path.
   */
  errorMessage: 'አፕሊኬሽኖችዎን ማምጣት አልቻልንም።',

  /**
   * The retry button in the error state.
   *
   * The plural imperative is used deliberately, matching the auth
   * batch's convention for actions with side effects and matching the
   * "እንደገና ይሞክሩ" string used for every retry affordance across the
   * delivered label sets.
   */
  errorRetryLabel: 'እንደገና ይሞክሩ',
};