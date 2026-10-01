/*
 * =============================================================================
 * MASES Phase 2 UI — AdminLayout Barrel
 * =============================================================================
 *
 * File:      mase_app/src/layouts/AdminLayout/index.ts
 * Layer:     Layouts (admin application shell)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: G1 — Admin Application Architecture (approved, §2.4)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — G2.8-b (admin application scaffold, step 8 of 10, second
 *          file). The barrel that resolves `@/layouts/AdminLayout` to
 *          `./AdminLayout.vue`. Its shape matches the layout-directory
 *          convention the codebase uses for AuthenticatedLayout, whose
 *          route-table import specifier is `@/layouts/AuthenticatedLayout`
 *          with no filename.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Provide the module that the admin route tree's parent-route
 * component references by directory path:
 *
 *     component: () => import('@/layouts/AdminLayout'),
 *
 * Without this file, the import specifier above does not resolve.
 * `moduleResolution: "bundler"` in tsconfig.json resolves a directory
 * import to an `index.*` file inside the directory, not to an
 * arbitrary sibling `.vue` file. The barrel is that `index.*` file.
 *
 * -----------------------------------------------------------------------------
 * The default re-export contract
 * -----------------------------------------------------------------------------
 * The barrel re-exports AdminLayout.vue's default export as its own
 * default. A consumer that does
 *
 *     const mod = await import('@/layouts/AdminLayout');
 *     mod.default;
 *
 * receives the AdminLayout SFC component.
 *
 * No named exports are added by this barrel. AdminLayout.vue declares
 * no props and emits no events of its own (its only interaction
 * surface is AppShell's `user-menu-select`, which AdminLayout handles
 * internally and does not expose to consumers). There is therefore no
 * additional type surface, no named value, and no runtime constant
 * for this barrel to expose.
 *
 * If a future CR gives AdminLayout.vue a public interface — props,
 * emits, or an exposed ref — the corresponding type is re-exported
 * from this barrel in the same change:
 *
 *     export { default } from './AdminLayout.vue';
 *     export type { AdminLayoutProps, AdminLayoutEmits }
 *       from './AdminLayout.vue';
 *
 * That addition is not made now because no such interface exists.
 *
 * -----------------------------------------------------------------------------
 * Why a barrel is needed
 * -----------------------------------------------------------------------------
 * The codebase imports layouts by directory path:
 *
 *     routes-workspace.ts:  import('@/layouts/AuthenticatedLayout')
 *     routes-portal.ts:     import('@/features/portal/PortalLayout.vue')
 *
 * The workspace's layout is imported by directory; the portal's layout
 * is imported by explicit filename. Both are valid — the portal layout
 * is a single file in a feature directory, so it is named explicitly;
 * the workspace layout is a directory-scoped component, so it is
 * imported by directory.
 *
 * The admin layout is a directory-scoped component like the
 * workspace's. Its route table (routes-admin.ts, deferred) references
 * it by directory. The barrel makes that reference resolve.
 *
 * An alternative — routing the admin parent-route's component as
 * `import('@/layouts/AdminLayout/AdminLayout.vue')` with an explicit
 * filename — was considered and rejected at the Q1 decision (Option i,
 * approved). The barrel preserves consistency with the workspace
 * convention and keeps the route table's import specifier stable if
 * the layout file is ever renamed or split within its directory.
 *
 * -----------------------------------------------------------------------------
 * What this file does NOT do
 * -----------------------------------------------------------------------------
 *   · It does not define a component. AdminLayout.vue does.
 *   · It does not re-export any type. See the section above for the
 *     condition under which a type would be added.
 *   · It does not provide runtime behavior. It is a re-export shim; the
 *     module it exposes has no top-level side effects beyond importing
 *     the SFC module.
 *   · It does not declare a default export of its own. The default
 *     re-export is AdminLayout.vue's default; the barrel does not
 *     replace or wrap it.
 *
 * -----------------------------------------------------------------------------
 * Consumer contract
 * -----------------------------------------------------------------------------
 * The barrel's sole intended consumer is `src/router/routes-admin.ts`
 * (delivered at G2.6, deferred until G2.8-a and G2.8-b both land). The
 * consumer is a dynamic import:
 *
 *     component: () => import('@/layouts/AdminLayout'),
 *
 * Any other consumer — a test harness, a storybook-like surface, a
 * future admin entry that mounts the layout directly — imports this
 * barrel the same way. The default export is the component.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. No named export is exposed. If AdminLayout.vue later gains a
 *    public interface, the barrel gains the matching type re-export
 *    in the same CR. See §"The default re-export contract".
 *
 * 2. The barrel matches the workspace's AuthenticatedLayout directory
 *    convention. It does not attempt to unify the two conventions
 *    (directory import vs. explicit-filename import) across the
 *    codebase — that is a separate refactor, out of scope for the
 *    admin scaffold.
 * =============================================================================
 */

export { default } from './AdminLayout.vue';