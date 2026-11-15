# PR #65 — Changed-Path Scope Reconciliation Inventory
Date: 2026-11-15

## Immutable evidence
- PR: https://github.com/akefadaka-git/arna-app/pull/65
- State: open; merged: false; draft: false
- Declared PR intent: one source file, `src/layouts/AppShell/AppHeader/AppHeader.vue`.
- Actual PR metadata: 190 commits; 199 changed files; +6356 / −4691.
- Base SHA: `85751ca489b7e2a250da46f408b040254827a199`; head SHA: `86eea1fc507b49065ec017dfa59f15153f9ddaaa`.
- The first PR commit is `42890d68fa44c7a9e0c0c165eed0f5b05d6a5fa7` (`fix(ui): preserve responsive header navigation content`, 2026-11-14 20:05:39Z), parent `85751ca489b7e2a250da46f408b040254827a199`. Its commit diff confirms exactly one changed file: `src/layouts/AppShell/AppHeader/AppHeader.vue` (+36/−18). This is the original one-file change.
- The PR then accumulated 189 subsequent commits, ending at `86eea1fc507b49065ec017dfa59f15153f9ddaaa` (`ci(architecture): generate and retain four-app import graph`, 2026-11-15 08:24:27Z). The final PR diff has 199 paths; therefore 198 additional changed paths lie beyond the original one-file commit. Their presence in this PR does not establish Owner authorization.
- The API was paginated: page 1 = 100; page 2 = 99; total enumerated = 199.

## Classification rule
The original header file is verified as the single-file initial change. The remaining 198 paths are classified as SCOPE EXPANSION — AUTHORIZATION UNKNOWN, pending Owner review. The path list and diff statistics establish what changed, not whether each expanded change was authorized, necessary, related, or safe to absorb. No path is approved merely because it is inside PR #65. Preserve all files and commit history until a path-by-path and commit-by-commit provenance review is approved.

## Scope distribution
| Path group | Changed paths |
|---|---:|
| `src/components/**` | 68 |
| `src/features/**` | 59 |
| `src/layouts/**` | 28 |
| `src/router/**` | 16 |
| `src/public-site/**` | 4 |
| `src/styles/**` | 4 |
| `tests/**` | 8 |
| Root, config, docs, build scripts, entry points, and public assets | 12 |
| **Total** | **199** |

The 198 expanded paths cover component and feature development, layout and router work, public-site work, styles, tests, environment/build configuration, architecture tooling, and documentation. This is a factual scope summary, not an approval classification.

## Complete changed-path manifest
| Path | GitHub status | Diff size | Current classification |
|---|---|---:|---|
| `.env.portal` | modified | +1 / −1 | SCOPE EXPANSION — AUTHORIZATION UNKNOWN |
| `.env.workspace` | modified | +1 / −1 | UNKNOWN — Owner review required |
| `.github/workflows/frontend-ci.yml` | modified | +30 / −0 | UNKNOWN — Owner review required |
| `docs/ARNA_DESIGN_SYSTEM_2.0_ACCEPTANCE_RECORD.md` | added | +174 / −0 | UNKNOWN — Owner review required |
| `docs/ARNA_DESIGN_SYSTEM_2.0_IMPLEMENTATION_GUIDE.md` | modified | +34 / −0 | UNKNOWN — Owner review required |
| `package.json` | modified | +2 / −1 | UNKNOWN — Owner review required |
| `portal-entry/index.html` | modified | +4 / −4 | UNKNOWN — Owner review required |
| `public/manifest.webmanifest` | modified | +2 / −2 | UNKNOWN — Owner review required |
| `scripts/build-application-import-graph.mjs` | added | +203 / −0 | UNKNOWN — Owner review required |
| `src/App.vue` | modified | +3 / −3 | UNKNOWN — Owner review required |
| `src/components/composites/Accordion/Accordion.vue` | modified | +25 / −25 | UNKNOWN — Owner review required |
| `src/components/composites/Alert/Alert.vue` | modified | +56 / −48 | UNKNOWN — Owner review required |
| `src/components/composites/Breadcrumbs/Breadcrumbs.vue` | modified | +17 / −17 | UNKNOWN — Owner review required |
| `src/components/composites/Combobox/Combobox.vue` | modified | +71 / −49 | UNKNOWN — Owner review required |
| `src/components/composites/ConfirmDialog/ConfirmDialog.vue` | modified | +4 / −4 | UNKNOWN — Owner review required |
| `src/components/composites/DatePicker/CalendarDateInput.vue` | added | +93 / −0 | UNKNOWN — Owner review required |
| `src/components/composites/DatePicker/CalendarDateTimeInput.vue` | added | +120 / −0 | UNKNOWN — Owner review required |
| `src/components/composites/DatePicker/DatePicker.vue` | modified | +203 / −155 | UNKNOWN — Owner review required |
| `src/components/composites/DatePicker/index.ts` | modified | +3 / −1 | UNKNOWN — Owner review required |
| `src/components/composites/Drawer/Drawer.vue` | modified | +49 / −49 | UNKNOWN — Owner review required |
| `src/components/composites/DropdownMenu/DropdownMenu.vue` | modified | +46 / −46 | UNKNOWN — Owner review required |
| `src/components/composites/EmptyState/EmptyState.vue` | modified | +20 / −20 | UNKNOWN — Owner review required |
| `src/components/composites/ErrorActions/ErrorActions.vue` | modified | +2 / −2 | UNKNOWN — Owner review required |
| `src/components/composites/ErrorHeader/ErrorHeader.vue` | modified | +13 / −13 | UNKNOWN — Owner review required |
| `src/components/composites/ErrorState/ErrorState.vue` | modified | +41 / −41 | UNKNOWN — Owner review required |
| `src/components/composites/ErrorSupportPanel/ErrorSupportPanel.vue` | modified | +69 / −69 | UNKNOWN — Owner review required |
| `src/components/composites/FileInput/FileInput.vue` | modified | +41 / −41 | UNKNOWN — Owner review required |
| `src/components/composites/FormActions/FormActions.vue` | modified | +1 / −1 | UNKNOWN — Owner review required |
| `src/components/composites/FormField/FormField.vue` | modified | +18 / −18 | UNKNOWN — Owner review required |
| `src/components/composites/FormSection/FormSection.vue` | modified | +15 / −15 | UNKNOWN — Owner review required |
| `src/components/composites/LoadingState/LoadingState.vue` | modified | +20 / −20 | UNKNOWN — Owner review required |
| `src/components/composites/MetaList/MetaList.vue` | modified | +15 / −15 | UNKNOWN — Owner review required |
| `src/components/composites/Modal/Modal.vue` | modified | +53 / −53 | UNKNOWN — Owner review required |
| `src/components/composites/Pagination/Pagination.vue` | modified | +28 / −28 | UNKNOWN — Owner review required |
| `src/components/composites/Popover/Popover.vue` | modified | +20 / −20 | UNKNOWN — Owner review required |
| `src/components/composites/SearchBar/SearchBar.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/components/composites/Skeleton/Skeleton.vue` | modified | +9 / −9 | UNKNOWN — Owner review required |
| `src/components/composites/Stepper/Stepper.vue` | modified | +52 / −52 | UNKNOWN — Owner review required |
| `src/components/composites/Tabs/Tabs.vue` | modified | +38 / −38 | UNKNOWN — Owner review required |
| `src/components/patterns/AccessDeniedPage/AccessDeniedPage.vue` | modified | +5 / −38 | UNKNOWN — Owner review required |
| `src/components/patterns/Card/Card.vue` | modified | +34 / −34 | UNKNOWN — Owner review required |
| `src/components/patterns/ConfirmDeleteDialog/ConfirmDeleteDialog.vue` | modified | +14 / −14 | UNKNOWN — Owner review required |
| `src/components/patterns/DataTable/DataTable.vue` | modified | +68 / −68 | UNKNOWN — Owner review required |
| `src/components/patterns/DetailCard/DetailCard.vue` | modified | +12 / −12 | UNKNOWN — Owner review required |
| `src/components/patterns/DownloadButton/DownloadButton.vue` | modified | +1 / −1 | UNKNOWN — Owner review required |
| `src/components/patterns/ErrorPage/ErrorPage.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/components/patterns/ErrorShell/ErrorShell.vue` | modified | +11 / −11 | UNKNOWN — Owner review required |
| `src/components/patterns/FilePreview/FilePreview.vue` | modified | +32 / −32 | UNKNOWN — Owner review required |
| `src/components/patterns/FileUploader/FileUploader.vue` | modified | +22 / −22 | UNKNOWN — Owner review required |
| `src/components/patterns/FilterBar/FilterBar.vue` | modified | +37 / −42 | UNKNOWN — Owner review required |
| `src/components/patterns/PageHeader/PageHeader.vue` | modified | +40 / −40 | UNKNOWN — Owner review required |
| `src/components/patterns/StatusBadge/StatusBadge.vue` | modified | +1 / −1 | UNKNOWN — Owner review required |
| `src/components/patterns/Timeline/Timeline.vue` | modified | +42 / −42 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseAvatar/BaseAvatar.vue` | modified | +36 / −27 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseBadge/BaseBadge.vue` | modified | +32 / −32 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseButton/BaseButton.vue` | modified | +83 / −85 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseCheckbox/BaseCheckbox.vue` | modified | +39 / −29 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseChip/BaseChip.vue` | modified | +45 / −37 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseDivider/BaseDivider.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseIcon/BaseIcon.vue` | modified | +49 / −38 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseInput/BaseInput.vue` | modified | +51 / −25 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseLabel/BaseLabel.vue` | modified | +21 / −13 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseLink/BaseLink.vue` | modified | +27 / −9 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseProgressBar/BaseProgressBar.vue` | modified | +37 / −19 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseRadio/BaseRadio.vue` | modified | +37 / −27 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseSelect/BaseSelect.vue` | modified | +39 / −29 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseSpinner/BaseSpinner.vue` | modified | +24 / −17 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseTextarea/BaseTextarea.vue` | modified | +51 / −23 | UNKNOWN — Owner review required |
| `src/components/primitives/BaseTooltip/BaseTooltip.vue` | modified | +15 / −15 | UNKNOWN — Owner review required |
| `src/components/primitives/DangerButton/DangerButton.vue` | modified | +7 / −2 | UNKNOWN — Owner review required |
| `src/components/primitives/ErrorCodeBadge/ErrorCodeBadge.vue` | modified | +15 / −15 | UNKNOWN — Owner review required |
| `src/components/primitives/ErrorSupportHint/ErrorSupportHint.vue` | modified | +10 / −10 | UNKNOWN — Owner review required |
| `src/components/primitives/ErrorSupportHint/index.ts` | added | +7 / −0 | UNKNOWN — Owner review required |
| `src/components/primitives/GhostButton/GhostButton.vue` | modified | +7 / −2 | UNKNOWN — Owner review required |
| `src/components/primitives/IconButton/IconButton.vue` | modified | +28 / −21 | UNKNOWN — Owner review required |
| `src/components/primitives/LinkButton/LinkButton.vue` | modified | +12 / −6 | UNKNOWN — Owner review required |
| `src/components/primitives/PrimaryButton/PrimaryButton.vue` | modified | +7 / −2 | UNKNOWN — Owner review required |
| `src/components/primitives/SecondaryButton/SecondaryButton.vue` | modified | +8 / −3 | UNKNOWN — Owner review required |
| `src/core/dates/ethiopic.ts` | added | +143 / −0 | UNKNOWN — Owner review required |
| `src/features/auth/AuthLayout/AuthLayout.vue` | modified | +66 / −66 | UNKNOWN — Owner review required |
| `src/features/auth/ForgotPasswordForm/ForgotPasswordForm.vue` | modified | +28 / −28 | UNKNOWN — Owner review required |
| `src/features/auth/LoginForm/LoginForm.vue` | modified | +51 / −51 | UNKNOWN — Owner review required |
| `src/features/auth/RegisterForm/RegisterForm.vue` | modified | +40 / −40 | UNKNOWN — Owner review required |
| `src/features/auth/ResetPasswordForm/ResetPasswordForm.vue` | modified | +50 / −50 | UNKNOWN — Owner review required |
| `src/features/auth/VerifyEmailPanel/VerifyEmailPanel.vue` | modified | +29 / −29 | UNKNOWN — Owner review required |
| `src/features/auth/VerifyEmailResend/VerifyEmailResend.vue` | modified | +27 / −27 | UNKNOWN — Owner review required |
| `src/features/communications/AnnouncementsView.vue` | modified | +10 / −10 | UNKNOWN — Owner review required |
| `src/features/communications/CommunicationHubView.vue` | modified | +7 / −2 | UNKNOWN — Owner review required |
| `src/features/dashboard/DashboardView.vue` | modified | +59 / −59 | UNKNOWN — Owner review required |
| `src/features/files/FileDetailView/FileDetailView.vue` | modified | +55 / −55 | UNKNOWN — Owner review required |
| `src/features/files/FilesListView/FilesListView.vue` | modified | +19 / −19 | UNKNOWN — Owner review required |
| `src/features/governance/GovernanceAttendanceView.vue` | modified | +33 / −25 | UNKNOWN — Owner review required |
| `src/features/governance/GovernanceBodyDetailView.vue` | modified | +33 / −33 | UNKNOWN — Owner review required |
| `src/features/governance/GovernanceBodyListView.vue` | modified | +35 / −34 | UNKNOWN — Owner review required |
| `src/features/governance/GovernanceFinanceSettlementView.vue` | modified | +3 / −2 | UNKNOWN — Owner review required |
| `src/features/governance/GovernanceOverviewView.vue` | modified | +63 / −63 | UNKNOWN — Owner review required |
| `src/features/governance/GovernancePeopleDirectoryView.vue` | modified | +6 / −6 | UNKNOWN — Owner review required |
| `src/features/governance/GovernancePersonProfileView.vue` | modified | +9 / −8 | UNKNOWN — Owner review required |
| `src/features/loans/LoanApplicationForm.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/features/loans/LoanApproveForm.vue` | modified | +7 / −7 | UNKNOWN — Owner review required |
| `src/features/loans/LoanCollateralForm.vue` | modified | +15 / −15 | UNKNOWN — Owner review required |
| `src/features/loans/LoanCollateralReleaseForm.vue` | modified | +10 / −10 | UNKNOWN — Owner review required |
| `src/features/loans/LoanDetailView.vue` | modified | +32 / −31 | UNKNOWN — Owner review required |
| `src/features/loans/LoanDisburseForm.vue` | modified | +7 / −7 | UNKNOWN — Owner review required |
| `src/features/loans/LoanListView.vue` | modified | +21 / −20 | UNKNOWN — Owner review required |
| `src/features/loans/LoanProductListView.vue` | modified | +51 / −51 | UNKNOWN — Owner review required |
| `src/features/loans/LoanRejectForm.vue` | modified | +7 / −7 | UNKNOWN — Owner review required |
| `src/features/loans/LoanRepaymentForm.vue` | modified | +37 / −37 | UNKNOWN — Owner review required |
| `src/features/loans/LoanRestructureForm.vue` | modified | +7 / −7 | UNKNOWN — Owner review required |
| `src/features/loans/LoanScheduleView.vue` | modified | +32 / −31 | UNKNOWN — Owner review required |
| `src/features/loans/LoanStatementView.vue` | modified | +28 / −28 | UNKNOWN — Owner review required |
| `src/features/loans/LoanWriteOffForm.vue` | modified | +10 / −10 | UNKNOWN — Owner review required |
| `src/features/notifications/NotificationsCenter.vue` | modified | +19 / −19 | UNKNOWN — Owner review required |
| `src/features/people/PeopleDirectoryView.vue` | modified | +22 / −22 | UNKNOWN — Owner review required |
| `src/features/people/PeopleProfileView.vue` | modified | +28 / −28 | UNKNOWN — Owner review required |
| `src/features/portal/MyCertificatesPage.vue` | modified | +1 / −1 | UNKNOWN — Owner review required |
| `src/features/portal/MyLoanDetailPage.vue` | modified | +31 / −30 | UNKNOWN — Owner review required |
| `src/features/portal/MyLoansPage.vue` | modified | +8 / −7 | UNKNOWN — Owner review required |
| `src/features/portal/MyShareholdingsPage.vue` | modified | +15 / −15 | UNKNOWN — Owner review required |
| `src/features/portal/MyWalletPage.vue` | modified | +16 / −16 | UNKNOWN — Owner review required |
| `src/features/portal/PortalHomePage.vue` | modified | +43 / −43 | UNKNOWN — Owner review required |
| `src/features/portal/PortalLayout.vue` | modified | +10 / −4 | UNKNOWN — Owner review required |
| `src/features/shareholders/CertificateCancelDialog/CertificateCancelDialog.vue` | modified | +28 / −28 | UNKNOWN — Owner review required |
| `src/features/shareholders/CertificateIssueForm/CertificateIssueForm.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/features/shareholders/HoldingEntryForm/HoldingEntryForm.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/features/shareholders/ShareClassListView/ShareClassListView.vue` | modified | +5 / −5 | UNKNOWN — Owner review required |
| `src/features/shareholders/ShareholderDetailView/ShareholderDetailView.vue` | modified | +30 / −30 | UNKNOWN — Owner review required |
| `src/features/shareholders/ShareholderForm/ShareholderForm.vue` | modified | +67 / −37 | UNKNOWN — Owner review required |
| `src/features/shareholders/ShareholderListView/ShareholderListView.vue` | modified | +19 / −19 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletAdjustForm.vue` | modified | +7 / −7 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletAllocationForm.vue` | modified | +7 / −7 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletAllocationReverseDialog.vue` | modified | +25 / −25 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletDetailView.vue` | modified | +30 / −30 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletListView.vue` | modified | +29 / −29 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletObligationForm.vue` | modified | +9 / −9 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletOpenForm.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletPaymentForm.vue` | modified | +9 / −9 | UNKNOWN — Owner review required |
| `src/features/wallet/WalletStatementView.vue` | modified | +28 / −30 | UNKNOWN — Owner review required |
| `src/layouts/AdminLayout/AdminLayout.vue` | modified | +19 / −11 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AbstractBackground/AbstractBackground.vue` | modified | +31 / −29 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AbstractBackground/index.ts` | modified | +2 / −2 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AppFooter/AppFooter.vue` | modified | +15 / −14 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AppHeader/AppHeader.vue` | modified | +75 / −61 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue` | modified | +53 / −42 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AppMobileDrawer/AppMobileDrawer.vue` | modified | +45 / −33 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AppShell.vue` | modified | +67 / −80 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AppSidebar/AppSidebar.vue` | modified | +61 / −43 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AranaBrand/AranaBrand.vue` | renamed | +69 / −69 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AranaBrand/index.ts` | renamed | +9 / −9 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AranaFooterContent/AranaFooterContent.vue` | renamed | +59 / −53 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/AranaFooterContent/index.ts` | renamed | +12 / −12 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/CalendarContext/CalendarContext.vue` | modified | +29 / −28 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/CalendarPreferenceControl.vue` | modified | +11 / −9 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/LanguageSelector/LanguageSelector.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/LauncherGrid/LauncherGrid.vue` | modified | +3 / −15 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/LauncherTile/LauncherTile.vue` | modified | +46 / −36 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/MaintenanceBanner/MaintenanceBanner.vue` | modified | +42 / −35 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/NotificationsBell/NotificationsBell.vue` | modified | +48 / −24 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/PageTitle/PageTitle.vue` | modified | +15 / −8 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/SkipToContent/SkipToContent.vue` | modified | +21 / −21 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/TenantSwitcher/TenantSwitcher.vue` | modified | +15 / −25 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/UserMenu/UserMenu.vue` | modified | +17 / −9 | UNKNOWN — Owner review required |
| `src/layouts/AppShell/index.ts` | modified | +6 / −3 | UNKNOWN — Owner review required |
| `src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue` | modified | +6 / −6 | UNKNOWN — Owner review required |
| `src/layouts/PublicSiteLayout.vue` | modified | +7 / −6 | UNKNOWN — Owner review required |
| `src/layouts/ThemePreferenceControl.vue` | modified | +8 / −9 | UNKNOWN — Owner review required |
| `src/public-site/CorporateDynamicHome.vue` | modified | +2 / −1 | UNKNOWN — Owner review required |
| `src/public-site/CorporateEntryRoute.vue` | modified | +4 / −3 | UNKNOWN — Owner review required |
| `src/public-site/CorporatePageRoute.vue` | modified | +2 / −2 | UNKNOWN — Owner review required |
| `src/public-site/PublicContributionRoute.vue` | modified | +3 / −3 | UNKNOWN — Owner review required |
| `src/router/admin-labels.ts` | modified | +10 / −10 | UNKNOWN — Owner review required |
| `src/router/pages/AdminAuditSecurityRoute.vue` | modified | +17 / −17 | UNKNOWN — Owner review required |
| `src/router/pages/AdminCorporateSiteRoute.vue` | modified | +3 / −1 | UNKNOWN — Owner review required |
| `src/router/pages/AdminDashboardRoute.vue` | modified | +18 / −18 | UNKNOWN — Owner review required |
| `src/router/pages/AdminPublicContentRoute.vue` | modified | +30 / −29 | UNKNOWN — Owner review required |
| `src/router/pages/ErrorRoute.vue` | modified | +11 / −11 | UNKNOWN — Owner review required |
| `src/router/pages/ForgotPasswordRoute.vue` | modified | +18 / −18 | UNKNOWN — Owner review required |
| `src/router/pages/LegalCenterRoute.vue` | modified | +61 / −61 | UNKNOWN — Owner review required |
| `src/router/pages/LegalDocumentRoute.vue` | modified | +75 / −75 | UNKNOWN — Owner review required |
| `src/router/pages/LoginRoute.vue` | modified | +8 / −8 | UNKNOWN — Owner review required |
| `src/router/pages/PublicVerificationRoute.vue` | modified | +35 / −35 | UNKNOWN — Owner review required |
| `src/router/pages/RegisterRoute.vue` | modified | +19 / −19 | UNKNOWN — Owner review required |
| `src/router/pages/ResetPasswordRoute.vue` | modified | +18 / −18 | UNKNOWN — Owner review required |
| `src/router/pages/VerifyEmailResendRoute.vue` | modified | +18 / −18 | UNKNOWN — Owner review required |
| `src/router/pages/VerifyEmailRoute.vue` | modified | +18 / −18 | UNKNOWN — Owner review required |
| `src/router/shell-labels.ts` | modified | +21 / −21 | UNKNOWN — Owner review required |
| `src/styles/base.css` | modified | +16 / −16 | UNKNOWN — Owner review required |
| `src/styles/reset.css` | modified | +1 / −1 | UNKNOWN — Owner review required |
| `src/styles/themes.css` | modified | +149 / −149 | UNKNOWN — Owner review required |
| `src/styles/tokens.css` | modified | +308 / −305 | UNKNOWN — Owner review required |
| `tests/app-shell-responsive-contract.test.mjs` | modified | +28 / −7 | UNKNOWN — Owner review required |
| `tests/brand-palette-contract.test.mjs` | modified | +2 / −2 | UNKNOWN — Owner review required |
| `tests/calendar-preference-contract.test.mjs` | added | +76 / −0 | UNKNOWN — Owner review required |
| `tests/date-picker-browser.spec.mjs` | added | +76 / −0 | UNKNOWN — Owner review required |
| `tests/design-system-theme-contract.test.mjs` | modified | +127 / −42 | UNKNOWN — Owner review required |
| `tests/ethiopic-calendar-contract.test.mjs` | added | +157 / −0 | UNKNOWN — Owner review required |
| `tests/fixtures/date-picker-browser.js` | added | +35 / −0 | UNKNOWN — Owner review required |
| `tests/fixtures/date-picker.html` | added | +12 / −0 | UNKNOWN — Owner review required |
| `workspace-entry/index.html` | modified | +5 / −5 | UNKNOWN — Owner review required |

## Required closure evidence
1. Identify the exact commit that first changed the declared one-file target and verify its parent diff.
2. Group subsequent commits by purpose and map each changed path to the commit(s) that introduced it.
3. For every path, record one disposition: intended UI baseline / required dependency / unrelated existing work / accidental scope expansion / unknown.
4. Preserve unrelated work. Any extraction or rollback must be a separate reviewed branch/PR, never a silent rewrite of PR #65.
5. Obtain explicit Owner approval for the resulting disposition manifest before changing PR #65 or using it as an implementation base.

## Status
UNRESOLVED — scope expansion is quantified and fully enumerated; authorization and provenance classification are not yet closed.
