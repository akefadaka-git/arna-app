# MASES / ARNA Brand Identity Master Specification v1.0

- **Document ID:** ARNA-BRAND-MASTER-001
- **Version:** 1.0
- **Status:** Owner-approved brand direction v1.0 — runtime adoption pending separate implementation verification
- **Scope:** Maale Arna Smart System (MASES), ARNA corporate identity, public website, workspace, shareholder portal, administration interface, documents, and future product surfaces
- **Brand principle:** One identity; one semantic design system; many business domains
- **Companion document:** Repository [README.md](../README.md)

## 1. Purpose

This specification defines a coherent brand direction for Maale Arna Smart System (MASES) and ARNA. It reconciles the enterprise-blue direction with aubergine, crimson, gold, warm ivory, green, and controlled bright accents into one recognizable identity.

This document is a design specification, not evidence that the proposed values have been approved, implemented, contrast-tested, or deployed. Existing frozen design tokens and component contracts remain unchanged until a separately reviewed and authorized implementation change adopts this specification.

## 2. Brand architecture and naming

- **Maale Arna** is the corporate identity.
- **MASES** is the established name/acronym for Maale Arna Smart System and remains a valid legacy/product identity during the transition.
- **ARNA** is the official master name for the overall system, including its platform and intelligence capabilities.
- Use the full corporate identity, “Maale Arna Smart System (MASES),” on formal surfaces where clarity matters.
- Use the approved corporate emblem as the cultural and visual source of truth.
- Do not invent a replacement emblem or synthetic monogram that is disconnected from the actual corporate identity.
- A compact mark may be designed as a derivative of the approved emblem, with design review and Owner approval.
- Keep IROKA and MYFIN as separate products and identities; do not merge their branding into ARNA.

## 3. Brand idea

### The Living Leader

**Rooted in the People. Built on Integrity. Leading Through Example.**

ARNA's story is that meaningful leadership can begin with a small, purposeful step. Like a seed that grows through care and consistent work, ARNA should connect people, productive enterprise, technology, finance, services, communication, innovation, and AI into a system that earns trust through reliable behavior.

The brand should communicate:
- **Rootedness:** people, land, productive work, community, and heritage.
- **Growth:** learning, agriculture, enterprise, and durable progress.
- **Connection:** communication, services, finance, technology, and AI working together.
- **Leadership:** direction, responsibility, service, and setting a practical example.
- **Integrity:** transparent information, accountable decisions, security, and dependable outcomes.
- **Dignity:** respectful treatment, accessibility, and human agency.

ARNA leadership must be represented as service and responsibility, not superiority or domination.

## 4. Brand principles

1. **Trust before spectacle.** Clear information and predictable behavior outrank decoration.
2. **One identity across every product surface.** Use the same token system, typography, icon style, spacing, and interaction patterns.
3. **Distinctive, not derivative.** Learn from world-class design disciplines without copying another company's recognizable marks or signature compositions.
4. **Culturally grounded, never fabricated.** Do not label a motif as a traditional Maale symbol without review by knowledgeable Maale community members.
5. **Amharic-first readiness.** Support Amharic as a first-class interface language, including readable typography, line-height, wrapping, labels, and responsive layouts. English remains supported.
6. **Accessibility is part of the identity.** Contrast, keyboard operation, focus visibility, reduced motion, and understandable status messages are required.
7. **Restraint creates premium quality.** Use strong hierarchy, meaningful whitespace, and purposeful accents.
8. **Honesty in product claims.** Do not imply that AI is infallible, that a service is available when it is not, or that a security control exists unless it is implemented and verified.

## 5. Visual concept: The Living Path

Develop an original graphic language named **The Living Path**. It is a conceptual design motif, not a claim about an established Maale cultural artifact.

Its elements:
- **Seed point:** a small beginning and potential.
- **Root lines:** groundedness, stability, and productive work.
- **Growing path:** progress and leadership through example.
- **Branching connections:** people and the company's connected business domains.
- **Milestone nodes:** meaningful achievements or verified connections.
- **Horizon / leading point:** direction and responsible progress.
- **Fine underlying grain:** a restrained tactile surface that can evoke cultivated ground, woven structure, and engineered precision without reproducing a specific traditional textile.

Use the motif for brand illustrations, public-site hero backgrounds, onboarding, report covers, and selected loading or AI states. Keep it low contrast behind application content. Dense forms, tables, financial records, and data-heavy pages should use plain surfaces or nearly imperceptible texture.

Do not apply arbitrary gradients, glass effects, heavy patterns, or decorative animation to every screen. The existing shell's frozen constraints must be reviewed before adopting the pattern in the application.

## 6. Proposed core color palette

The following hex values are the **Owner-approved v1.0 brand palette**. They establish the canonical approved brand direction for future implementation; they are not yet canonical runtime tokens until the existing frozen token substrate is reconciled and an implementation change is verified. Before implementation, test each foreground/background pairing, document approved combinations, and reconcile these values with the existing frozen token substrate.

| Color role | Proposed value | Intended meaning and use |
|---|---|---|
| Enterprise blue | `#123D68` | Primary brand anchor; corporate authority, trust, primary navigation and high-level structure |
| Action blue | `#1769AA` | Primary actions, links, selected controls, and interactive emphasis |
| Aubergine | `#3D1C50` | Brand depth, premium distinction, selected brand surfaces and visual anchors |
| Crimson | `#B4233A` | Deliberate brand emphasis; not a substitute for semantic error tokens |
| Gold | `#D4A017` | Heritage, excellence, achievement, and restrained highlights |
| Warm ivory | `#FFFDF7` | Warm page and document surfaces |
| Living green | `#216747` | Growth, agriculture-related identity, and positive states when semantically appropriate |
| Bright azure | `#35A7FF` | Selected informational, technology, and data-visualization accents |
| Violet | `#8B5CF6` | Innovation and selected intelligence/AI accents |
| Rose | `#E85D75` | Limited human-centered or communication accents |
| Teal | `#0F9D9A` | Service and connection accents where the meaning is clear |
| Citrus | `#C4D83D` | Rare illustration or campaign accent; avoid for small text |
| Basalt text | `#263445` | Primary text and strong neutral structure |
| Secondary text | `#64748B` | Secondary text only when contrast is sufficient |
| Cloud surface | `#F3F6FA` | Secondary surfaces, table regions, cards, and visual separation |
| White | `#FFFFFF` | Clean surfaces and contrast pairing where appropriate |

### 6.1 Palette hierarchy

- Enterprise blue is the primary corporate signature.
- Action blue is for interaction, not a second competing brand.
- Aubergine provides distinctive depth and complements blue.
- Gold is an accent, not a universal button, border, icon, or heading color.
- Crimson is used intentionally and must not blur the meaning of destructive/error states.
- Green may represent growth and positive outcomes, but domain color must not replace status labels or icons.
- Bright azure, violet, rose, teal, and citrus are supporting accents. They must not compete with the core identity.
- Warm ivory, cloud, white, and basalt provide readable neutral structure.

### 6.2 Color proportions

As an initial art-direction guideline—not a pixel-level requirement—use approximately:
- 60–75% neutral surfaces and whitespace;
- 15–25% enterprise blue and related structural colors;
- 5–10% combined aubergine, green, crimson, and gold accents;
- bright accents only in small, purposeful areas.

Actual proportions vary by product surface. Financial and administrative screens should prioritize clarity; public campaign surfaces may use more expressive imagery.

### 6.3 Accessibility and semantic tokens

- Never communicate status by color alone; pair color with text, iconography, or another visible cue.
- Test normal text to at least WCAG 2.2 AA contrast (4.5:1) and large text to at least 3:1.
- Test meaningful non-text controls, boundaries, and focus indicators against applicable WCAG contrast requirements.
- Do not assume gold, citrus, bright azure, rose, or light green is readable on white/ivory.
- Define semantic roles separately from brand colors: success, warning, error, information, disabled, focus, selected, and destructive.
- Define component tokens as references to semantic tokens; do not create independent component palettes.
- Record contrast-verified foreground/background pairings in the implementation change before adoption.

## 7. Business-domain accents

Domain accents are subordinate to the shared brand system. They are not separate product palettes.

| Domain | Visual language | Suggested accent |
|---|---|---|
| Agriculture | Seed forms, growth lines, fields and productive cycles | Living green |
| Technology | Precision geometry, clear system relationships | Azure / action blue |
| Finance | Stable grids, legible numbers, restrained emphasis | Enterprise blue / limited gold |
| Services | Human-centered pathways and clear service states | Teal |
| Innovation | Open forms and purposeful exploration | Violet |
| Communication | Connected nodes, signal lines, information clarity | Azure / limited rose |
| AI and intelligence | Branching paths converging on a human-directed outcome | Aubergine / azure |

Domain colors must not imply different trust levels or override the semantic meaning of status colors. A domain remains unmistakably ARNA through shared typography, layout, logo, color hierarchy, and interaction patterns.

## 8. Typography and multilingual design

- Use a highly legible bilingual type system with explicit Amharic and Latin font stacks.
- Verify the selected fonts against actual Amharic glyph coverage, weights, numerals, punctuation, and line-height before adoption.
- Keep hierarchy consistent: display, page title, section heading, body, label, caption, and data/numeric styles.
- Avoid using all-caps Latin conventions for Amharic labels.
- Ensure long Amharic labels wrap without clipping buttons, sidebar items, tables, or mobile navigation.
- Do not encode meaning only in font weight, capitalization, or color.
- Typography values must be shared tokens, not per-component inventions.

Exact font families and final type-scale values require a separate source-backed typography review before runtime adoption.

## 9. Shape, layout, iconography, and motion

### Shape and layout
- Prefer a disciplined grid, consistent alignment, meaningful whitespace, and predictable responsive behavior.
- Use a restrained radius scale and elevation system; avoid mixing unrelated corner styles or shadows.
- Keep business workflows and data surfaces quieter than public marketing surfaces.
- Preserve existing component contracts unless a reviewed change explicitly updates them.

### Iconography
- Use one coherent icon family and consistent stroke, sizing, and alignment.
- Use icons to clarify actions and concepts, not as decoration.
- Pair ambiguous icons with labels, especially in Amharic-first navigation.
- Avoid fabricated cultural icons. Cultural marks require provenance and review.

### Motion
- Motion should explain state transitions, focus, progress, or the Living Path concept.
- Prefer short, calm transitions; avoid perpetual movement and motion that delays work.
- Honor reduced-motion preferences.
- Never use animation as the only indication of a security, financial, or service state.

## 10. Emblem and brand-mark rules

- The existing approved Maale Arna corporate emblem remains the authoritative emblem.
- Preserve its integrity, proportions, and intended full-attention use.
- Do not redraw, recolor, simplify, or crop the emblem without explicit brand review.
- A compact digital mark may be developed from the emblem's identifying invariants; it must be reviewed as a derivative, not an unrelated replacement.
- Test the emblem at small sizes and against both light and dark backgrounds before selecting a usage rule.
- The wordmark, corporate name, and product name must remain consistent across the public website, workspace, shareholder portal, administration interface, authentication pages, and official documents.

## 11. Product and surface application

| Surface | Brand behavior |
|---|---|
| Corporate public website | Strong brand story, Living Path motif, people/product imagery with verified context, clear service and legal navigation |
| Workspace | Quiet, high-clarity shell; blue structure, restrained accents, minimal texture behind working content |
| Shareholder portal | Trustworthy records, legible balances and statements, clear verification and service states |
| Administration interface | Dense but orderly information, explicit permissions and audit context, minimal decorative effects |
| Authentication | Clear identity, legible forms, calm surfaces, visible security and recovery guidance |
| Financial documents | Print-safe neutrals, disciplined numeric alignment, verifiable identity, no decorative background under data |
| AI experiences | Clearly distinguish AI-generated suggestions from verified facts and user decisions; retain human control and explain uncertainty |
| Notifications and status messages | Explicit wording plus accessible semantic color and icon; never color-only |

The repository currently describes four independent static builds: workspace, shareholder portal, administration, and public corporate website. The same design-system rules should apply to all four, with surface-appropriate emphasis.

## 12. Content and voice

The brand voice is clear, respectful, calm, specific, and accountable.

Prefer:
- “Here is what is complete, what remains, and what has been verified.”
- “This service is coming soon” when a service is not available.
- “AI-generated suggestion” when output has not been independently verified.
- Plain explanations of fees, permissions, limitations, and next steps.

Avoid:
- Unsupported claims of being the best, safest, first, or fully intelligent.
- False certainty, manipulative urgency, exaggerated promises, and opaque status labels.
- Claims that cultural symbols are traditional without validation.
- Language implying that leadership gives ARNA authority over people.

### Proposed brand statement

**ARNA — Lead by Example.**  
**Rooted in Maale. Built for Tomorrow.**

We begin with people, grow through productive work, connect opportunity with intelligence, and lead through service. We believe leadership is earned through integrity, responsibility, and results. Our aim is to build enduring trust and create lasting value for the communities we serve.

This brand statement is Owner-approved as the v1.0 brand direction. Its final placement and production use remain subject to the implementation and content review described in this specification.

## 13. Governance and change control

1. The brand direction in this document is Owner-approved. That approval does not itself authorize changes to frozen source files or deployment.
2. The Owner decides final brand values, naming, scope, exceptions, and adoption.
3. The current frozen token system remains unchanged until an explicitly authorized change reconciles this specification with existing design-system and shell contracts.
4. The implementation must use one authoritative token source. Components must not introduce competing hardcoded brand colors.
5. A brand implementation change must identify exact files, preserve unrelated work, and be reviewed on a separate candidate branch.
6. Any color, typography, shell, or background change affecting shared surfaces requires visual regression review.
7. No deployment is implied by specification approval or code implementation.

## 14. Adoption acceptance criteria

Before this specification is considered implemented:
- [x] Owner has approved the canonical brand palette and brand statement.
- [ ] Corporate emblem and any compact-mark proposal have passed brand review.
- [ ] The canonical design token file and all referenced frozen specifications are reconciled.
- [ ] Color pairings have documented WCAG contrast results.
- [ ] Amharic and English typography have been checked at supported viewport sizes.
- [ ] Core colors and semantic status colors have distinct, documented responsibilities.
- [ ] All four app builds use the shared tokens without unauthorized hardcoded palette exceptions.
- [ ] Public website, workspace, portal, and admin surfaces have been visually reviewed.
- [ ] Keyboard focus, reduced motion, icon labels, and status messaging are verified.
- [ ] Tests, type checks, builds, and relevant UI smoke checks pass against the exact candidate SHA.
- [ ] Final diff and artifacts have been reviewed before a separate release decision.

## 15. Revision history

| Version | Status | Summary |
|---|---|---|
| 1.0 | Owner-approved brand direction | Consolidates enterprise blue, aubergine, crimson, gold, warm ivory, controlled bright accents, the Living Leader concept, and the Living Path graphic language. Runtime adoption remains subject to token reconciliation and implementation verification. |
