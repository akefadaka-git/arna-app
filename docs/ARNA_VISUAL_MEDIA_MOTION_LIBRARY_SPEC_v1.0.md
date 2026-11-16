# ARNA Visual, Media & Motion Library — Specification v1.0

**Status:** Implementation baseline (additive; not a replacement for the existing component catalogue)  
**Repository:** `akefadaka-git/arna-app`  
**Scope:** Frontend presentation components shared by Workspace, Shareholder Portal, Admin Console and Public Site.

## 1. Purpose and boundary

This library extends the existing design system with data visualization, media presentation, promotional surfaces, decorative visuals and controlled motion. It preserves the current primitives, composites and patterns. Existing components are reused rather than duplicated.

The library is presentation-only. It does not create advertising campaigns, track users, fetch media, interpret financial data, or grant permissions. Consumers supply already-authorized content and data.

## 2. Capability catalogue

| Capability | Library contract | Initial implementation |
|---|---|---|
| Cards | Reuse existing Card and DetailCard patterns | Existing; no duplicate card |
| Icon pack | Single Lucide-backed BaseIcon registry | Existing registry; 56 names documented in BaseIcon source |
| Charts / graphs | Accessible chart container with caller-supplied series | ChartPanel: bar, line and donut |
| Dashboard widgets | Small composable KPI and chart surfaces | MetricWidget and ChartPanel |
| Media / images | Responsive image frame, caption and alt text | ImageFrame; GIF is supported as an image source |
| Abstract elements | Decorative, non-semantic branded backdrops | AbstractBackdrop |
| Animation | Opt-in entrance treatment and token-based motion | MotionReveal and TextEffect |
| GIF | Render through ImageFrame; honor alt text and reduced-motion guidance | Supported as media; no autoplay gallery |
| 3D elements | Isolated renderer, asset budget, fallback and device policy | Deferred; no 3D runtime dependency added |
| Text effects | Controlled gradient, shimmer and outline treatments | TextEffect |
| Advertising | Clearly identified promotional/announcement banner | PromoBanner; no ad network, tracking or targeting |
| 3D logo | Brand-approved source model, static fallback and motion policy | Deferred pending approved 3D source asset |

## 3. Component API principles

- All user-facing text is supplied by the consumer and must be localized (Amharic and English).
- Charts require a meaningful accessible label; source data and units remain consumer-owned.
- Image alternatives are required. Decorative images must use an empty alt only when the surrounding context makes that choice intentional.
- Promotional content must be identifiable as promotional content and must not resemble system/security notices.
- Motion is opt-in, short, non-essential and disabled by `prefers-reduced-motion`.
- Decorative abstract elements are hidden from assistive technology.
- Components consume semantic ARNA CSS variables; they must not introduce hard-coded brand colors.
- No remote tracking pixels, ad scripts, analytics beacons or third-party media calls are introduced.

## 4. Theme, language and responsive requirements

Every component must work in light and dark themes, inherit the active document language and Ethiopic/Latin font stack, avoid fixed-width layouts, and remain usable at 320 CSS pixels. Text must wrap without clipping. Charts must provide a textual legend or equivalent data summary.

## 5. Media and performance policy

- Prefer optimized WebP/AVIF for raster imagery where supported; retain suitable fallbacks.
- Use lazy loading for below-the-fold images and provide explicit dimensions/aspect ratio to limit layout shift.
- GIF files can be displayed as images, but the initial ImageFrame does not provide per-GIF pause controls. Do not use animated GIFs for essential information or where users need motion control; prefer a user-controllable video treatment or a static poster. Large GIFs should be converted to video for production delivery where appropriate.
- 3D models are deferred until a specific use case, approved asset, renderer, device fallback, performance budget and security review are available.
- Avoid bundling a large general-purpose 3D engine merely to satisfy a catalogue checkbox.

## 6. Verification gates

1. Type-check and all four static builds.
2. Component contract tests for required labels, media alternatives, reduced-motion behavior and safe promotional semantics.
3. Light/dark rendering checks.
4. Amharic/English content-fit checks.
5. Responsive browser checks at 320, 390, 768 and 1280 CSS pixels.
6. Keyboard and screen-reader review for chart summaries and promotional links.
7. Performance review for large images, animation and any future 3D renderer.

## 7. Explicitly deferred

3D model rendering, 3D logo animation, advanced particle systems, video authoring, ad-network integration, audience targeting and campaign analytics are not included in this initial implementation. They require separate architecture, asset, privacy, performance and approval gates.

## 8. Acceptance status

This specification and the initial source components establish the library structure. They do not by themselves certify exhaustive cross-application visual QA, WCAG 2.2 AA, or production media performance.
