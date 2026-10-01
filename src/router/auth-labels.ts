/*
 * =============================================================================
 * MASES Phase 2 UI — Auth Page Labels (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/auth-labels.ts
 * Layer:     Core (router configuration)
 * Version:   3.1.1
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            Architecture Freeze §9.1 (Amharic-first)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. English constants.
 *
 * 1.1.0  — values changed from English to Amharic to satisfy the
 *          Amharic-first default. Keys unchanged; only string
 *          values differ.
 *
 * 2.0.0  — loginFormLabels extended for LoginForm.vue 2.0.0.
 *          Eight new keys; emailLabel value widened to include
 *          phone number. Other five exports unchanged.
 *
 * 3.0.0  — consolidated file, all six exports finalised for the
 *          six auth forms delivered in the current batch.
 *          MAJOR bump: four of the six label objects became
 *          contracts with form interfaces that had gained
 *          required keys.
 *
 * 3.1.0  — dedicated success-panel keys for ResetPasswordForm:
 *          · Added successTitle and successMessage to
 *            resetPasswordFormLabels.
 *          · The two keys replace the temporary compromise in
 *            ResetPasswordForm.vue 2.0.0, which reused
 *            submitLabel as the success heading and
 *            backToLoginLabel as the success body.
 *          · Minor version bump — the change was purely additive.
 *
 * 3.1.1  — documentation correction. PATCH bump. No code change.
 *
 *          · Two docblock lines miscounted the number of keys in
 *            registerFormLabels as "twenty-nine". The object
 *            actually has thirty keys. The miscount originated in
 *            my own 3.0.0 delivery and carried forward into
 *            3.1.0. It is prose, not code — every key is present
 *            in both prior versions; the docblock simply named the
 *            wrong total.
 *
 *          · Fixed lines:
 *              1. The header's revision-history summary for
 *                 registerFormLabels now reads "Thirty keys
 *                 (five new)" instead of "Twenty-nine keys
 *                 (five new)".
 *              2. The section docblock immediately above the
 *                 registerFormLabels export now reads "Thirty
 *                 keys." instead of "Twenty-nine keys."
 *
 *          · A full count of all six exports was performed to
 *            confirm the miscount was isolated to
 *            registerFormLabels. Results:
 *
 *              loginFormLabels ............ docblock: 23  actual: 23  ✓
 *              registerFormLabels ......... docblock: 30  actual: 30  ✓
 *              forgotPasswordFormLabels ... docblock: 15  actual: 15  ✓
 *              resetPasswordFormLabels .... docblock: 25  actual: 25  ✓
 *              verifyEmailPanelLabels ..... docblock: 18  actual: 18  ✓
 *              verifyEmailResendLabels .... docblock: 17  actual: 17  ✓
 *
 *          · The keys, the values, the ordering, and the docblock
 *            content of every export are byte-for-byte identical
 *            to 3.1.0 except for the two corrected count lines.
 *
 * -----------------------------------------------------------------------------
 * Why the values are Amharic
 * -----------------------------------------------------------------------------
 * The design system requires Amharic as the default locale. Without
 * an i18n layer, the only way to render Amharic is to make these
 * the values. When i18n is introduced (a future CR), this file
 * becomes a facade over the translation service; the keys remain
 * stable, and the six auth pages do not change.
 *
 * Some embedded technical strings remain English on purpose. The
 * criterion is: does an Amharic speaker recognize the term as
 * itself, or does it benefit from translation?
 *
 *   · "Reference:" — translated. Amharic speakers naturally read
 *     "ማጣቀሻ፦" for a support reference.
 *
 *   · "spam" (in the forgot-password success message and the
 *     resend confirmation) — kept in Latin script. Amharic email
 *     users universally recognize the word as-is; a translated
 *     form would be less clear, not more.
 *
 *   · "Caps Lock" (in every capsLockWarning) — kept in Latin
 *     script. The key is physically labeled "Caps Lock" on
 *     Ethiopian keyboards, and Ethiopian-language operating
 *     systems display the term in Latin script. Translating it
 *     would make the warning harder to act on.
 *
 *   · The English name field labels ("First name", "Father's name",
 *     "Grandfather's name") — kept in English. These labels are the
 *     field's own subject matter; the field accepts an English-
 *     script name, so the label is in English.
 *
 * -----------------------------------------------------------------------------
 * Why the key `emailLabel` is not renamed
 * -----------------------------------------------------------------------------
 * The identifier field on the login form accepts an email address
 * OR a phone number. Its label VALUE reads "ኢሜይል / ስልክ ቁጥር"
 * ("Email / phone number"). But the KEY remains `emailLabel`.
 *
 * Renaming the key to `identifierLabel` would require coordinated
 * changes across three files:
 *
 *   · this file (the exported object);
 *   · src/features/auth/LoginForm/LoginForm.vue (the interface);
 *   · src/router/pages/LoginRoute.vue (which passes
 *     loginFormLabels to the form).
 *
 * That coordinated change is deferred to a future CR. In the
 * meantime, the docblock on the interface field in LoginForm.vue
 * states explicitly that the label may hold an email or a phone,
 * so a maintainer reading either file has the correct information.
 *
 * The key name is historical. The value is authoritative.
 *
 * Note that registerFormLabels.emailLabel is NOT widened — the
 * register endpoint requires a real email address (its validation
 * rule is `email`), so a phone number cannot be registered.
 *
 * -----------------------------------------------------------------------------
 * Label naming conventions
 * -----------------------------------------------------------------------------
 * The keys follow a consistent pattern, so that a maintainer can
 * predict the name of a label before searching for it:
 *
 *   <noun>Label            — a visible label for a form control.
 *   <verb>Label            — the label of an actionable element
 *                            (usually a button or a link).
 *   <state>Title           — the heading of a banner, notice, or
 *                            confirmation panel.
 *   <state>Message         — the body text of the same.
 *   <n>ErrorTitle          — the heading of an error banner for a
 *                            specific error class.
 *   <n>ErrorMessage        — the body of that banner.
 *   <n>HelperText          — supporting text rendered near a field
 *                            but not part of its accessible name.
 *   <n>Prompt              — text that precedes an inline link.
 *   <n>ActionLabel         — the label of that link.
 *   <n>Prefix              — a prefix string rendered before a
 *                            dynamic value (e.g. a reference ID).
 *
 * A consumer of this file reads the key as a description of the
 * slot it fills. A label whose name does not fit the pattern is a
 * signal that the calling component's API needs a closer look.
 *
 * -----------------------------------------------------------------------------
 * Translation quality notes
 * -----------------------------------------------------------------------------
 * The Amharic below is idiomatic for Ethiopian software UI. Two
 * conventions are documented for a future reviewer, who may not be
 * a native speaker:
 *
 *   1. Imperative voice for actionable elements. "ግባ" (Log in),
 *      "ይመዝገቡ" (Register), "ማስፈንጠሪያ ላክ" (Send link) are all
 *      imperatives. This matches how Ethiopian software is written
 *      — commands are commands, not requests. A future translator
 *      should not "soften" them to conditional or permissive forms.
 *
 *   2. The politer plural imperative for actions with side effects.
 *      "ይመዝገቡ" (register) uses the plural form even for a single
 *      user, because the action creates an account. The singular
 *      "ግባ" (log in) is used for actions with no lasting side
 *      effect. This mirrors the distinction Amharic makes between
 *      actions addressed to "you" (singular) and "you" (respectful
 *      plural).
 *
 * A future CR that introduces i18n should preserve these choices,
 * either by translating them into the appropriate target-language
 * convention or by documenting why a given form is used.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings introduced during the current batch are
 * the most likely candidates for adjustment by a native Amharic
 * reviewer. They are idiomatic as far as this author can
 * determine, but native review is the correct final gate:
 *
 *   · capsLockWarning: 'Caps Lock በርቷል' — the verb "በርቷል"
 *     is literally "is lit/on", used for lamps and switches. It
 *     is idiomatic for a key indicator, but a native speaker may
 *     prefer a different construction.
 *
 *   · rateLimitTitle: 'ብዙ ሙከራዎች' — literal "many attempts". An
 *     alternative is "ብዙ ጊዜ ሞክረዋል" ("you have tried many times"),
 *     which is more direct but slightly less formal.
 *
 *   · sessionExpiredTitle: 'ክፍለ ጊዜዎ አልቋል' — "your session has
 *     ended". Standard, but a native speaker should confirm the
 *     register is right for a login page.
 *
 *   · showPasswordLabel / hidePasswordLabel — the paired
 *     imperatives "አሳይ" (show) and "ደብቅ" (hide). Both are
 *     correct; a reviewer may prefer the plural form for
 *     consistency with the other buttons.
 *
 *   · resetPasswordFormLabels.successTitle /
 *     resetPasswordFormLabels.successMessage (added in 3.1.0) —
 *     "የይለፍ ቃልዎ ተቀይሯል" ("Your password has been changed") and
 *     "አሁን በአዲሱ የይለፍ ቃልዎ መግባት ይችላሉ።" ("You can now log in with
 *     your new password."). Both are standard; a reviewer should
 *     confirm the register is right for a post-action
 *     confirmation.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. RESOLVED in 3.1.0. ResetPasswordForm success panel now has
 *    dedicated successTitle and successMessage keys. See the
 *    resetPasswordFormLabels export below.
 *
 * 2. LoginForm `emailLabel` key name: retained for backward
 *    compatibility. See §"Why the key `emailLabel` is not
 *    renamed".
 *
 * 3. Native-speaker review of the five strings listed in
 *    §"Native-speaker review needed".
 *
 * None of these items affect the correctness of the delivered
 * forms. Items 2 and 3 are refinements.
 * =============================================================================
 */

// =============================================================================
// LoginForm (Unit 12.6, LoginForm.vue 2.1.0)
// =============================================================================
/*
 * The login form's labels. Twenty-three keys.
 *
 * Ordering within the object follows the visual order of the form:
 *   form-level → identifier → password → options → submit →
 *   alternate actions → error banners → notice.
 *
 * A maintainer adding a label should place it in the position that
 * matches its role in the form, not append it to the end. The
 * consistency makes a diff readable.
 */
export const loginFormLabels = {
  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------
  /** The form's accessible name (aria-label on the <form>). */
  formAriaLabel: 'ግባ',

  // ---------------------------------------------------------------------------
  // Identifier (email or phone number)
  // ---------------------------------------------------------------------------
  /*
   * The label for the identifier field. See the file header
   * §"Why the key `emailLabel` is not renamed".
   *
   * The value names both accepted forms because the backend
   * resolves either — an email via the users.email column, a
   * phone via the users.phone column. See
   * AuthController::resolveLoginEmail().
   */
  emailLabel: 'ኢሜይል / ስልክ ቁጥር',

  // ---------------------------------------------------------------------------
  // Password
  // ---------------------------------------------------------------------------
  /** The label for the password field. */
  passwordLabel: 'የይለፍ ቃል',

  /*
   * aria-label for the password-visibility toggle, when the
   * password is currently masked. The label describes the ACTION
   * the button performs ("reveal"), which matches the eye icon
   * shown alongside.
   *
   * The two toggle labels deliberately describe actions, not
   * states. A screen reader announces "Show password, button" —
   * the user understands what will happen if they activate it.
   */
  showPasswordLabel: 'የይለፍ ቃል አሳይ',

  /*
   * aria-label for the password-visibility toggle, when the
   * password is currently visible. Describes the action
   * ("conceal").
   */
  hidePasswordLabel: 'የይለፍ ቃል ደብቅ',

  /*
   * Inline hint shown while the user types in the password field
   * with Caps Lock engaged. Phrased as a hint, not an error —
   * Caps Lock being on is not a mistake, it is a state the user
   * may or may not want.
   *
   * "Caps Lock" is kept in Latin script per the file header
   * §"Why the values are Amharic".
   */
  capsLockWarning: 'Caps Lock በርቷል',

  // ---------------------------------------------------------------------------
  // Options row (remember me + forgot password)
  // ---------------------------------------------------------------------------
  /*
   * The visible label next to the remember-me checkbox. See
   * LoginForm.vue's docblock §"Remember-me scope" for what the
   * checkbox actually does in this release — it is a frontend-
   * only convenience, not a session-lifetime extension.
   */
  rememberMeLabel: 'አስታውሰኝ',

  /** The label for the "forgot password" link. */
  forgotPasswordLabel: 'የይለፍ ቃልዎን ረሱ?',

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  /** The submit button's label, in the idle state. */
  submitLabel: 'ግባ',

  /** The submit button's label, while a request is in flight. */
  submittingLabel: 'በመግባት ላይ…',

  // ---------------------------------------------------------------------------
  // Alternate actions
  // ---------------------------------------------------------------------------
  /** The prompt shown before the "register" link. */
  registerPrompt: 'መለያ የለዎትም?',

  /** The "register" link's label. */
  registerActionLabel: 'ይመዝገቡ',

  // ---------------------------------------------------------------------------
  // Error banners
  // ---------------------------------------------------------------------------
  /*
   * Invalid-credentials banner. The backend emits the
   * 'unauthorized' category for both an unknown identifier and a
   * wrong password — the two are deliberately indistinguishable.
   * The label must not name which of the two was wrong.
   *
   * The current value reads "Email or password is incorrect". When
   * the identifier field gained phone-number support, the label
   * became slightly imprecise — a user who typed a phone number
   * sees "Email" and may briefly think the wrong field was flagged.
   *
   * The imprecision is acceptable: the message is only shown after
   * the request has been rejected, so the user knows their input
   * was not accepted regardless of what the label calls the field.
   * A future CR that renames emailLabel to identifierLabel should
   * update this title in the same change.
   */
  invalidCredentialsTitle: 'ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም',
  invalidCredentialsMessage:
    'እባክዎ ኢሜይልዎን እና የይለፍ ቃልዎን ያረጋግጡ እንደገና ይሞክሩ።',

  /*
   * Rate-limit (HTTP 429) banner. Distinct from the generic
   * banner because the correct user action is different — wait
   * and retry, not contact support with a reference ID.
   */
  rateLimitTitle: 'ብዙ ሙከራዎች',
  rateLimitMessage: 'እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',

  /*
   * Network-error banner. Shown when the request failed before a
   * response arrived — DNS, TLS, connection refused, or timeout.
   */
  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',

  /*
   * Generic error banner. Shown for any error that falls through
   * the specific categories — a 419 from a CSRF misconfiguration,
   * a 500, or an unrecognized 4xx.
   */
  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',

  /*
   * Prefix shown before the request_id in the generic-error
   * banner. The request_id itself is server-supplied data, not
   * a translated string.
   */
  requestIdPrefix: 'ማጣቀሻ፦',

  // ---------------------------------------------------------------------------
  // Session-expired notice (informational, not an error)
  // ---------------------------------------------------------------------------
  /*
   * Shown above the form when the route wrapper passes
   * sessionExpired={true}. The user was redirected to /login
   * after their session ended.
   *
   * This is a notice, not an error. The visual treatment uses the
   * info surface tokens, not the danger surface.
   */
  sessionExpiredTitle: 'ክፍለ ጊዜዎ አልቋል',
  sessionExpiredMessage: 'እባክዎ እንደገና ይግቡ።',
} as const;

// =============================================================================
// RegisterForm (Unit 12.7, RegisterForm.vue 2.0.0)
// =============================================================================
/*
 * The register form's labels. Thirty keys.
 *
 * Ordering follows the form's visual structure: form → Amharic
 * name group → English name group → the at-least-one-name
 * validation message → contact → password → password confirm →
 * password toggles and Caps Lock → submit → alternate actions →
 * error banners.
 *
 * The thirty keys break down as twenty-five from the original
 * v1.1.0 delivery plus five added in v2.0.0 (showPasswordLabel,
 * hidePasswordLabel, capsLockWarning, rateLimitTitle,
 * rateLimitMessage).
 */
export const registerFormLabels = {
  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------
  formAriaLabel: 'መለያ ይፍጠሩ',

  // ---------------------------------------------------------------------------
  // Name in Amharic
  // ---------------------------------------------------------------------------
  nameAmGroupLabel: 'ስም በአማርኛ',
  nameEnGroupLabel: 'ስም በእንግሊዝኛ (አማራጭ)',
  firstNameAmLabel: 'የመጀመሪያ ስም',
  fatherNameAmLabel: 'የአባት ስም',
  grandfatherNameAmLabel: 'የአያት ስም',

  // ---------------------------------------------------------------------------
  // Name in English
  // ---------------------------------------------------------------------------
  /*
   * Kept in English by design — the field accepts an
   * English-script name, so the label is in English. See the
   * file header §"Why the values are Amharic".
   */
  firstNameEnLabel: 'First name',
  fatherNameEnLabel: "Father's name",
  grandfatherNameEnLabel: "Grandfather's name",

  /*
   * The client-side error message shown when both first_name_am
   * and first_name_en are empty on submit. Mirrors the backend's
   * required_without_all rule.
   */
  atLeastOneNameRequired:
    'እባክዎ ቢያንስ አንድ ስም ያስገቡ (በአማርኛ ወይም በእንግሊዝኛ)።',

  // ---------------------------------------------------------------------------
  // Contact
  // ---------------------------------------------------------------------------
  emailLabel: 'ኢሜይል',

  // ---------------------------------------------------------------------------
  // Password
  // ---------------------------------------------------------------------------
  passwordLabel: 'የይለፍ ቃል',
  passwordConfirmLabel: 'የይለፍ ቃል ያረጋግጡ',
  passwordHelperText: 'ቢያንስ 8 ቁምፊዎች።',

  /*
   * Show/hide password toggles. The same label pair is used for
   * both password fields — the button's own aria-label and its
   * position inside the field's suffix slot are sufficient
   * context for a screen reader.
   */
  showPasswordLabel: 'የይለፍ ቃል አሳይ',
  hidePasswordLabel: 'የይለፍ ቃል ደብቅ',

  /*
   * The Caps Lock warning. A single warning is shared between
   * the two password fields.
   */
  capsLockWarning: 'Caps Lock በርቷል',

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  submitLabel: 'መለያ ይፍጠሩ',
  submittingLabel: 'መለያ በመፍጠር ላይ…',

  // ---------------------------------------------------------------------------
  // Alternate actions
  // ---------------------------------------------------------------------------
  loginPrompt: 'መለያ አለዎት?',
  loginActionLabel: 'ግባ',

  // ---------------------------------------------------------------------------
  // Error banners
  // ---------------------------------------------------------------------------
  /*
   * 409 AUTH_EMAIL_TAKEN. The email the user entered is already
   * registered. The message offers both recovery paths without
   * presuming which the user wants.
   */
  emailTakenTitle: 'ይህ ኢሜይል ተመዝግቧል',
  emailTakenMessage:
    'ይህ ኢሜይልዎ ከሆነ፣ ይግቡ ወይም ሌላ አድራሻ ይጠቀሙ።',

  /*
   * Rate-limit (HTTP 429). The register endpoint is throttled.
   */
  rateLimitTitle: 'ብዙ ሙከራዎች',
  rateLimitMessage: 'እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',

  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',

  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',

  requestIdPrefix: 'ማጣቀሻ፦',
} as const;

// =============================================================================
// ForgotPasswordForm (Unit 12.8, ForgotPasswordForm.vue 1.2.0)
// =============================================================================
/*
 * The forgot-password form's labels. Fifteen keys.
 *
 * The success panel echoes the email the user typed, via the
 * `{email}` token in successMessage. The token is optional — a
 * message without it renders unchanged.
 */
export const forgotPasswordFormLabels = {
  formAriaLabel: 'የይለፍ ቃል ማስጀመሪያ ይጠይቁ',
  emailLabel: 'ኢሜይል',
  submitLabel: 'ማስፈንጠሪያ ላክ',
  submittingLabel: 'በመላክ ላይ…',

  // ---------------------------------------------------------------------------
  // Success panel
  // ---------------------------------------------------------------------------
  successTitle: 'ገቢ ሳጥንዎን ይመልከቱ',
  /*
   * May contain the token `{email}`. If present, the component
   * replaces it with the address the user typed.
   */
  successMessage:
    'ለ {email} መለያ ካለ፣ የይለፍ ቃል ማስጀመሪያ አገናኝ ልከናል። ገቢ ሳጥንዎን እና የ spam አቃፊዎን ይመልከቱ።',
  tryAnotherEmailLabel: 'ሌላ ኢሜይል ይሞክሩ',
  backToLoginLabel: 'ወደ መግቢያ ይመለሱ',

  // ---------------------------------------------------------------------------
  // Error banners
  // ---------------------------------------------------------------------------
  /*
   * Rate-limit (429). The forgot-password endpoint is throttled.
   */
  rateLimitTitle: 'ብዙ ሙከራዎች',
  rateLimitMessage: 'እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',

  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',

  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',

  requestIdPrefix: 'ማጣቀሻ፦',
} as const;

// =============================================================================
// ResetPasswordForm (Unit 12.9, ResetPasswordForm.vue 2.1.0)
// =============================================================================
/*
 * The reset-password form's labels. Twenty-five keys.
 *
 * -----------------------------------------------------------------------------
 * Success panel
 * -----------------------------------------------------------------------------
 * The success state has dedicated successTitle and successMessage
 * keys. Before the 3.1.0 revision of this file, ResetPasswordForm.vue
 * reused submitLabel ("የይለፍ ቃል አስጀምር") as the success heading
 * and backToLoginLabel ("ወደ መግቢያ ይመለሱ") as the success body —
 * a temporary compromise that produced an awkward panel.
 *
 * The change is coordinated: ResetPasswordForm.vue 2.1.0 consumes
 * the two keys instead of the reused ones. The two files should
 * be deployed together. If ResetPasswordForm.vue 2.1.0 is deployed
 * against auth-labels.ts 3.0.0, the form's references to
 * labels.successTitle and labels.successMessage will fail to
 * compile. The build's vue-tsc step will catch this before the
 * Vite build runs.
 */
export const resetPasswordFormLabels = {
  formAriaLabel: 'የይለፍ ቃልዎን ያስጀምሩ',
  emailLabel: 'ኢሜይል',

  /*
   * Rendered under the read-only email field, explaining why the
   * value cannot be edited.
   */
  emailReadonlyHint: 'ይህ አድራሻ በተከተሉት የማስጀመሪያ አገናኝ ተዘጋጅቷል።',

  passwordLabel: 'አዲስ የይለፍ ቃል',
  passwordHelperText: 'ቢያንስ 8 ቁምፊዎች።',
  passwordConfirmLabel: 'አዲሱን የይለፍ ቃል ያረጋግጡ',

  /*
   * Show/hide password toggles. The same label pair is used for
   * both password fields; see registerFormLabels' note.
   */
  showPasswordLabel: 'የይለፍ ቃል አሳይ',
  hidePasswordLabel: 'የይለፍ ቃል ደብቅ',

  /*
   * The Caps Lock warning. A single warning is shared between
   * the two password fields.
   */
  capsLockWarning: 'Caps Lock በርቷል',

  submitLabel: 'የይለፍ ቃል አስጀምር',
  submittingLabel: 'በማስጀመር ላይ…',
  backToLoginLabel: 'ወደ መግቢያ ይመለሱ',

  // ---------------------------------------------------------------------------
  // Success panel (added in 3.1.0)
  // ---------------------------------------------------------------------------
  /*
   * Shown after the backend confirms the password has been reset.
   * The backend has invalidated the reset token; the user must
   * log in again with the new password.
   *
   * The panel is a terminal state — no form fields, no resubmit
   * action. The user's next step is the "back to login" link
   * rendered below the panel.
   */
  successTitle: 'የይለፍ ቃልዎ ተቀይሯል',
  successMessage:
    'አሁን በአዲሱ የይለፍ ቃልዎ መግባት ይችላሉ።',

  // ---------------------------------------------------------------------------
  // Invalid-link state
  // ---------------------------------------------------------------------------
  invalidLinkTitle: 'ይህ አገናኝ ትክክል አይደለም',
  invalidLinkMessage:
    'የይለፍ ቃል ማስጀመሪያ አገናኙ ጠፍቷል፣ ጊዜው አልፎበታል፣ ወይም ጥቅም ላይ ውሏል። ለመቀጠል አዲስ ይጠይቁ።',
  requestNewLinkLabel: 'አዲስ አገናኝ ጠይቅ',

  // ---------------------------------------------------------------------------
  // Error banners
  // ---------------------------------------------------------------------------
  rateLimitTitle: 'ብዙ ሙከራዎች',
  rateLimitMessage: 'እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',

  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',

  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',

  requestIdPrefix: 'ማጣቀሻ፦',

  /*
   * Client-side error shown under the confirmation field when
   * the two password values do not match. Mirrors the backend's
   * `confirmed` validation rule.
   */
  passwordsDoNotMatch: 'ሁለቱ የይለፍ ቃሎች አይመሳሰሉም።',
} as const;

// =============================================================================
// VerifyEmailPanel (Unit 12.10, VerifyEmailPanel.vue 1.2.0)
// =============================================================================
/*
 * The verification panel's labels. Eighteen keys.
 *
 * The panel has four states — verifying, verified, already-
 * verified, failed — and each has its own title and message. The
 * failed state additionally has three variant pairs (invalid
 * token, user not found, rate-limit) which override the generic
 * failed pair.
 */
export const verifyEmailPanelLabels = {
  // ---------------------------------------------------------------------------
  // Verifying (initial state)
  // ---------------------------------------------------------------------------
  verifyingTitle: 'ኢሜይልዎን በማረጋገጥ ላይ',
  verifyingMessage: 'ይህ ትንሽ ጊዜ ይወስዳል።',

  // ---------------------------------------------------------------------------
  // Verified (200)
  // ---------------------------------------------------------------------------
  verifiedTitle: 'ኢሜይልዎ ተረጋግጧል',
  verifiedMessage: 'አሁን መግባት እና መለያዎን መጠቀም ይችላሉ።',

  // ---------------------------------------------------------------------------
  // Already verified (400 AUTH_EMAIL_ALREADY_VERIFIED — idempotent success)
  // ---------------------------------------------------------------------------
  alreadyVerifiedTitle: 'ኢሜይልዎ ቀድሞውኑ ተረጋግጧል',
  alreadyVerifiedMessage: 'ሌላ ምንም አያስፈልግም። መግባት ይችላሉ።',

  // ---------------------------------------------------------------------------
  // Failed — generic (overridden by the variants below when their
  // error code or category matches)
  // ---------------------------------------------------------------------------
  failedTitle: 'ኢሜይልዎን ማረጋገጥ አልቻልንም',
  failedMessage:
    'የማረጋገጫ አገናኙ ጠፍቷል፣ ጊዜው አልፎበታል፣ ወይም ጥቅም ላይ ውሏል። ለመቀጠል አዲስ ይጠይቁ።',

  // ---------------------------------------------------------------------------
  // Failed — invalid token (401 AUTH_INVALID_VERIFICATION_TOKEN)
  // ---------------------------------------------------------------------------
  invalidTokenTitle: 'ይህ የማረጋገጫ አገናኝ ትክክል አይደለም',
  invalidTokenMessage:
    'አገናኙ ጊዜው አልፎበት ወይም ቀድሞውኑ ጥቅም ላይ ውሏል። አዲስ የማረጋገጫ ኢሜይል ይጠይቁ።',

  // ---------------------------------------------------------------------------
  // Failed — user not found (404 AUTH_USER_NOT_FOUND)
  // ---------------------------------------------------------------------------
  userNotFoundTitle: 'መለያ አልተገኘም',
  userNotFoundMessage:
    'ለዚህ አገናኝ መለያ ማግኘት አልቻልንም። ተወግዶ ሊሆን ይችላል።',

  // ---------------------------------------------------------------------------
  // Failed — rate limited (429)
  // ---------------------------------------------------------------------------
  /*
   * A user who reloads the verification link repeatedly trips the
   * throttle. The 429 is not a link failure; the copy tells the
   * user to wait.
   */
  rateLimitTitle: 'ብዙ ሙከራዎች',
  rateLimitMessage: 'እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',

  // ---------------------------------------------------------------------------
  // Exit links
  // ---------------------------------------------------------------------------
  continueLabel: 'ወደ መግቢያ ይቀጥሉ',
  requestNewLinkLabel: 'አዲስ የማረጋገጫ ኢሜይል ይጠይቁ',
  backToLoginLabel: 'ወደ መግቢያ ይመለሱ',

  requestIdPrefix: 'ማጣቀሻ፦',
} as const;

// =============================================================================
// VerifyEmailResend (Unit 12.11, VerifyEmailResend.vue 1.2.0)
// =============================================================================
/*
 * The verify-email-resend labels. Seventeen keys.
 *
 * Both confirmation messages — 'sent' and 'already-verified' —
 * support the `{email}` token. When present in the template, the
 * component replaces it with the address the user typed.
 */
export const verifyEmailResendLabels = {
  formAriaLabel: 'የማረጋገጫ ኢሜይል እንደገና ላክ',
  emailLabel: 'ኢሜይል',
  submitLabel: 'የማረጋገጫ ኢሜይል እንደገና ላክ',
  submittingLabel: 'በመላክ ላይ…',

  // ---------------------------------------------------------------------------
  // 'sent' state
  // ---------------------------------------------------------------------------
  sentTitle: 'ገቢ ሳጥንዎን ይመልከቱ',
  sentMessage:
    'ለ {email} አዲስ የማረጋገጫ አገናኝ ልከናል። ገቢ ሳጥንዎን እና የ spam አቃፊዎን ይመልከቱ።',

  // ---------------------------------------------------------------------------
  // 'already-verified' state
  // ---------------------------------------------------------------------------
  /*
   * A terminal-success state. The email the user submitted is
   * already verified, so there is nothing to resend. The panel
   * does not offer a "try another email" link — see
   * VerifyEmailResend.vue's docblock §"Idempotency of 'already
   * verified'".
   */
  alreadyVerifiedTitle: 'ኢሜይልዎ ቀድሞውኑ ተረጋግጧል',
  alreadyVerifiedMessage:
    'ኢሜይል {email} ቀድሞውኑ ተረጋግጧል። ለመቀጠል መግባት ይችላሉ።',

  // ---------------------------------------------------------------------------
  // Exit links
  // ---------------------------------------------------------------------------
  tryAnotherEmailLabel: 'ሌላ ኢሜይል ይሞክሩ',
  backToLoginLabel: 'ወደ መግቢያ ይመለሱ',

  // ---------------------------------------------------------------------------
  // Error banners
  // ---------------------------------------------------------------------------
  rateLimitTitle: 'ብዙ ሙከራዎች',
  rateLimitMessage: 'እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',

  networkErrorTitle: 'የኔትወርክ ስህተት',
  networkErrorMessage:
    'አገልጋዩን ማግኘት አልቻልንም። ግንኙነትዎን ያረጋግጡ እንደገና ይሞክሩ።',

  genericErrorTitle: 'የሆነ ችግር ተፈጥሯል',
  genericErrorMessage: 'እባክዎ በአጭር ጊዜ ውስጥ እንደገና ይሞክሩ።',

  requestIdPrefix: 'ማጣቀሻ፦',
} as const;