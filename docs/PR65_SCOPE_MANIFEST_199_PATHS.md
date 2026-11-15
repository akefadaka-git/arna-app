# PR #65 — complete 199-path scope manifest

> Repository: `akefadaka-git/arna-app`  
> PR: [#65](https://github.com/akefadaka-git/arna-app/pull/65)  
> Base: `85751ca489b7e2a250da46f408b040254827a199`  
> Head: `86eea1fc507b49065ec017dfa59f15153f9ddaaa`  
> Retrieved from GitHub PR files API, pages 1 and 2, 2026-11-15. This is a path/stat inventory, not an authorization decision.

## Reconciliation summary

- GitHub reports 190 commits, 199 changed paths, +6,356 additions, −4,691 deletions.
- The first commit `42890d68fa44c7a9e0c0c165eed0f5b05d6a5fa7` has parent `85751ca489b7e2a250da46f408b040254827a199` and changes exactly one file: `src/layouts/AppShell/AppHeader/AppHeader.vue` (+36/−18).
- That original commit is the declared one-file scope. The other 198 changed paths are later scope expansion; authorization remains UNKNOWN for each until Owner review.
- PR #71 preserves the original one-file commit as an isolated draft proposal. PR #65 remains untouched and open.
- No path is discarded, merged, cherry-picked from the expanded PR, or presumed approved by this manifest.

## Path inventory

| # | Path | Change | + | − | Preliminary classification | Authorization |
|---:|---|---|---:|---:|---|---|
| 1 | `.env.portal` | modified | 1 | 1 | Later scope expansion — Configuration/assets/build | UNKNOWN |
| 2 | `.env.workspace` | modified | 1 | 1 | Later scope expansion — Configuration/assets/build | UNKNOWN |
| 3 | `.github/workflows/frontend-ci.yml` | modified | 30 | 0 | Later scope expansion — CI/workflow | UNKNOWN |
| 4 | `docs/ARNA_DESIGN_SYSTEM_2.0_ACCEPTANCE_RECORD.md` | added | 174 | 0 | Later scope expansion — Documentation | UNKNOWN |
| 5 | `docs/ARNA_DESIGN_SYSTEM_2.0_IMPLEMENTATION_GUIDE.md` | modified | 34 | 0 | Later scope expansion — Documentation | UNKNOWN |
| 6 | `package.json` | modified | 2 | 1 | Later scope expansion — Configuration/assets/build | UNKNOWN |
| 7 | `portal-entry/index.html` | modified | 4 | 4 | Later scope expansion — Configuration/assets/build | UNKNOWN |
| 8 | `public/manifest.webmanifest` | modified | 2 | 2 | Later scope expansion — Configuration/assets/build | UNKNOWN |
| 9 | `scripts/build-application-import-graph.mjs` | added | 203 | 0 | Later scope expansion — Build/analysis tooling | UNKNOWN |
| 10 | `src/App.vue` | modified | 3 | 3 | Later scope expansion — Application source | UNKNOWN |
| 11 | `src/components/composites/Accordion/Accordion.vue` | modified | 25 | 25 | Later scope expansion — Shared component system | UNKNOWN |
| 12 | `src/components/composites/Alert/Alert.vue` | modified | 56 | 48 | Later scope expansion — Shared component system | UNKNOWN |
| 13 | `src/components/composites/Breadcrumbs/Breadcrumbs.vue` | modified | 17 | 17 | Later scope expansion — Shared component system | UNKNOWN |
| 14 | `src/components/composites/Combobox/Combobox.vue` | modified | 71 | 49 | Later scope expansion — Shared component system | UNKNOWN |
| 15 | `src/components/composites/ConfirmDialog/ConfirmDialog.vue` | modified | 4 | 4 | Later scope expansion — Shared component system | UNKNOWN |
| 16 | `src/components/composites/DatePicker/CalendarDateInput.vue` | added | 93 | 0 | Later scope expansion — Shared component system | UNKNOWN |
| 17 | `src/components/composites/DatePicker/CalendarDateTimeInput.vue` | added | 120 | 0 | Later scope expansion — Shared component system | UNKNOWN |
| 18 | `src/components/composites/DatePicker/DatePicker.vue` | modified | 203 | 155 | Later scope expansion — Shared component system | UNKNOWN |
| 19 | `src/components/composites/DatePicker/index.ts` | modified | 3 | 1 | Later scope expansion — Shared component system | UNKNOWN |
| 20 | `src/components/composites/Drawer/Drawer.vue` | modified | 49 | 49 | Later scope expansion — Shared component system | UNKNOWN |
| 21 | `src/components/composites/DropdownMenu/DropdownMenu.vue` | modified | 46 | 46 | Later scope expansion — Shared component system | UNKNOWN |
| 22 | `src/components/composites/EmptyState/EmptyState.vue` | modified | 20 | 20 | Later scope expansion — Shared component system | UNKNOWN |
| 23 | `src/components/composites/ErrorActions/ErrorActions.vue` | modified | 2 | 2 | Later scope expansion — Shared component system | UNKNOWN |
| 24 | `src/components/composites/ErrorHeader/ErrorHeader.vue` | modified | 13 | 13 | Later scope expansion — Shared component system | UNKNOWN |
| 25 | `src/components/composites/ErrorState/ErrorState.vue` | modified | 41 | 41 | Later scope expansion — Shared component system | UNKNOWN |
| 26 | `src/components/composites/ErrorSupportPanel/ErrorSupportPanel.vue` | modified | 69 | 69 | Later scope expansion — Shared component system | UNKNOWN |
| 27 | `src/components/composites/FileInput/FileInput.vue` | modified | 41 | 41 | Later scope expansion — Shared component system | UNKNOWN |
| 28 | `src/components/composites/FormActions/FormActions.vue` | modified | 1 | 1 | Later scope expansion — Shared component system | UNKNOWN |
| 29 | `src/components/composites/FormField/FormField.vue` | modified | 18 | 18 | Later scope expansion — Shared component system | UNKNOWN |
| 30 | `src/components/composites/FormSection/FormSection.vue` | modified | 15 | 15 | Later scope expansion — Shared component system | UNKNOWN |
| 31 | `src/components/composites/LoadingState/LoadingState.vue` | modified | 20 | 20 | Later scope expansion — Shared component system | UNKNOWN |
| 32 | `src/components/composites/MetaList/MetaList.vue` | modified | 15 | 15 | Later scope expansion — Shared component system | UNKNOWN |
| 33 | `src/components/composites/Modal/Modal.vue` | modified | 53 | 53 | Later scope expansion — Shared component system | UNKNOWN |
| 34 | `src/components/composites/Pagination/Pagination.vue` | modified | 28 | 28 | Later scope expansion — Shared component system | UNKNOWN |
| 35 | `src/components/composites/Popover/Popover.vue` | modified | 20 | 20 | Later scope expansion — Shared component system | UNKNOWN |
| 36 | `src/components/composites/SearchBar/SearchBar.vue` | modified | 8 | 8 | Later scope expansion — Shared component system | UNKNOWN |
| 37 | `src/components/composites/Skeleton/Skeleton.vue` | modified | 9 | 9 | Later scope expansion — Shared component system | UNKNOWN |
| 38 | `src/components/composites/Stepper/Stepper.vue` | modified | 52 | 52 | Later scope expansion — Shared component system | UNKNOWN |
| 39 | `src/components/composites/Tabs/Tabs.vue` | modified | 38 | 38 | Later scope expansion — Shared component system | UNKNOWN |
| 40 | `src/components/patterns/AccessDeniedPage/AccessDeniedPage.vue` | modified | 5 | 38 | Later scope expansion — Shared component system | UNKNOWN |
| 41 | `src/components/patterns/Card/Card.vue` | modified | 34 | 34 | Later scope expansion — Shared component system | UNKNOWN |
| 42 | `src/components/patterns/ConfirmDeleteDialog/ConfirmDeleteDialog.vue` | modified | 14 | 14 | Later scope expansion — Shared component system | UNKNOWN |
| 43 | `src/components/patterns/DataTable/DataTable.vue` | modified | 68 | 68 | Later scope expansion — Shared component system | UNKNOWN |
| 44 | `src/components/patterns/DetailCard/DetailCard.vue` | modified | 12 | 12 | Later scope expansion — Shared component system | UNKNOWN |
| 45 | `src/components/patterns/DownloadButton/DownloadButton.vue` | modified | 1 | 1 | Later scope expansion — Shared component system | UNKNOWN |
| 46 | `src/components/patterns/ErrorPage/ErrorPage.vue` | modified | 8 | 8 | Later scope expansion — Shared component system | UNKNOWN |
| 47 | `src/components/patterns/ErrorShell/ErrorShell.vue` | modified | 11 | 11 | Later scope expansion — Shared component system | UNKNOWN |
| 48 | `src/components/patterns/FilePreview/FilePreview.vue` | modified | 32 | 32 | Later scope expansion — Shared component system | UNKNOWN |
| 49 | `src/components/patterns/FileUploader/FileUploader.vue` | modified | 22 | 22 | Later scope expansion — Shared component system | UNKNOWN |
| 50 | `src/components/patterns/FilterBar/FilterBar.vue` | modified | 37 | 42 | Later scope expansion — Shared component system | UNKNOWN |
| 51 | `src/components/patterns/PageHeader/PageHeader.vue` | modified | 40 | 40 | Later scope expansion — Shared component system | UNKNOWN |
| 52 | `src/components/patterns/StatusBadge/StatusBadge.vue` | modified | 1 | 1 | Later scope expansion — Shared component system | UNKNOWN |
| 53 | `src/components/patterns/Timeline/Timeline.vue` | modified | 42 | 42 | Later scope expansion — Shared component system | UNKNOWN |
| 54 | `src/components/primitives/BaseAvatar/BaseAvatar.vue` | modified | 36 | 27 | Later scope expansion — Shared component system | UNKNOWN |
| 55 | `src/components/primitives/BaseBadge/BaseBadge.vue` | modified | 32 | 32 | Later scope expansion — Shared component system | UNKNOWN |
| 56 | `src/components/primitives/BaseButton/BaseButton.vue` | modified | 83 | 85 | Later scope expansion — Shared component system | UNKNOWN |
| 57 | `src/components/primitives/BaseCheckbox/BaseCheckbox.vue` | modified | 39 | 29 | Later scope expansion — Shared component system | UNKNOWN |
| 58 | `src/components/primitives/BaseChip/BaseChip.vue` | modified | 45 | 37 | Later scope expansion — Shared component system | UNKNOWN |
| 59 | `src/components/primitives/BaseDivider/BaseDivider.vue` | modified | 8 | 8 | Later scope expansion — Shared component system | UNKNOWN |
| 60 | `src/components/primitives/BaseIcon/BaseIcon.vue` | modified | 49 | 38 | Later scope expansion — Shared component system | UNKNOWN |
| 61 | `src/components/primitives/BaseInput/BaseInput.vue` | modified | 51 | 25 | Later scope expansion — Shared component system | UNKNOWN |
| 62 | `src/components/primitives/BaseLabel/BaseLabel.vue` | modified | 21 | 13 | Later scope expansion — Shared component system | UNKNOWN |
| 63 | `src/components/primitives/BaseLink/BaseLink.vue` | modified | 27 | 9 | Later scope expansion — Shared component system | UNKNOWN |
| 64 | `src/components/primitives/BaseProgressBar/BaseProgressBar.vue` | modified | 37 | 19 | Later scope expansion — Shared component system | UNKNOWN |
| 65 | `src/components/primitives/BaseRadio/BaseRadio.vue` | modified | 37 | 27 | Later scope expansion — Shared component system | UNKNOWN |
| 66 | `src/components/primitives/BaseSelect/BaseSelect.vue` | modified | 39 | 29 | Later scope expansion — Shared component system | UNKNOWN |
| 67 | `src/components/primitives/BaseSpinner/BaseSpinner.vue` | modified | 24 | 17 | Later scope expansion — Shared component system | UNKNOWN |
| 68 | `src/components/primitives/BaseTextarea/BaseTextarea.vue` | modified | 51 | 23 | Later scope expansion — Shared component system | UNKNOWN |
| 69 | `src/components/primitives/BaseTooltip/BaseTooltip.vue` | modified | 15 | 15 | Later scope expansion — Shared component system | UNKNOWN |
| 70 | `src/components/primitives/DangerButton/DangerButton.vue` | modified | 7 | 2 | Later scope expansion — Shared component system | UNKNOWN |
| 71 | `src/components/primitives/ErrorCodeBadge/ErrorCodeBadge.vue` | modified | 15 | 15 | Later scope expansion — Shared component system | UNKNOWN |
| 72 | `src/components/primitives/ErrorSupportHint/ErrorSupportHint.vue` | modified | 10 | 10 | Later scope expansion — Shared component system | UNKNOWN |
| 73 | `src/components/primitives/ErrorSupportHint/index.ts` | added | 7 | 0 | Later scope expansion — Shared component system | UNKNOWN |
| 74 | `src/components/primitives/GhostButton/GhostButton.vue` | modified | 7 | 2 | Later scope expansion — Shared component system | UNKNOWN |
| 75 | `src/components/primitives/IconButton/IconButton.vue` | modified | 28 | 21 | Later scope expansion — Shared component system | UNKNOWN |
| 76 | `src/components/primitives/LinkButton/LinkButton.vue` | modified | 12 | 6 | Later scope expansion — Shared component system | UNKNOWN |
| 77 | `src/components/primitives/PrimaryButton/PrimaryButton.vue` | modified | 7 | 2 | Later scope expansion — Shared component system | UNKNOWN |
| 78 | `src/components/primitives/SecondaryButton/SecondaryButton.vue` | modified | 8 | 3 | Later scope expansion — Shared component system | UNKNOWN |
| 79 | `src/core/dates/ethiopic.ts` | added | 143 | 0 | Later scope expansion — Core platform | UNKNOWN |
| 80 | `src/features/auth/AuthLayout/AuthLayout.vue` | modified | 66 | 66 | Later scope expansion — Application feature/domain | UNKNOWN |
| 81 | `src/features/auth/ForgotPasswordForm/ForgotPasswordForm.vue` | modified | 28 | 28 | Later scope expansion — Application feature/domain | UNKNOWN |
| 82 | `src/features/auth/LoginForm/LoginForm.vue` | modified | 51 | 51 | Later scope expansion — Application feature/domain | UNKNOWN |
| 83 | `src/features/auth/RegisterForm/RegisterForm.vue` | modified | 40 | 40 | Later scope expansion — Application feature/domain | UNKNOWN |
| 84 | `src/features/auth/ResetPasswordForm/ResetPasswordForm.vue` | modified | 50 | 50 | Later scope expansion — Application feature/domain | UNKNOWN |
| 85 | `src/features/auth/VerifyEmailPanel/VerifyEmailPanel.vue` | modified | 29 | 29 | Later scope expansion — Application feature/domain | UNKNOWN |
| 86 | `src/features/auth/VerifyEmailResend/VerifyEmailResend.vue` | modified | 27 | 27 | Later scope expansion — Application feature/domain | UNKNOWN |
| 87 | `src/features/communications/AnnouncementsView.vue` | modified | 10 | 10 | Later scope expansion — Application feature/domain | UNKNOWN |
| 88 | `src/features/communications/CommunicationHubView.vue` | modified | 7 | 2 | Later scope expansion — Application feature/domain | UNKNOWN |
| 89 | `src/features/dashboard/DashboardView.vue` | modified | 59 | 59 | Later scope expansion — Application feature/domain | UNKNOWN |
| 90 | `src/features/files/FileDetailView/FileDetailView.vue` | modified | 55 | 55 | Later scope expansion — Application feature/domain | UNKNOWN |
| 91 | `src/features/files/FilesListView/FilesListView.vue` | modified | 19 | 19 | Later scope expansion — Application feature/domain | UNKNOWN |
| 92 | `src/features/governance/GovernanceAttendanceView.vue` | modified | 33 | 25 | Later scope expansion — Application feature/domain | UNKNOWN |
| 93 | `src/features/governance/GovernanceBodyDetailView.vue` | modified | 33 | 33 | Later scope expansion — Application feature/domain | UNKNOWN |
| 94 | `src/features/governance/GovernanceBodyListView.vue` | modified | 35 | 34 | Later scope expansion — Application feature/domain | UNKNOWN |
| 95 | `src/features/governance/GovernanceFinanceSettlementView.vue` | modified | 3 | 2 | Later scope expansion — Application feature/domain | UNKNOWN |
| 96 | `src/features/governance/GovernanceOverviewView.vue` | modified | 63 | 63 | Later scope expansion — Application feature/domain | UNKNOWN |
| 97 | `src/features/governance/GovernancePeopleDirectoryView.vue` | modified | 6 | 6 | Later scope expansion — Application feature/domain | UNKNOWN |
| 98 | `src/features/governance/GovernancePersonProfileView.vue` | modified | 9 | 8 | Later scope expansion — Application feature/domain | UNKNOWN |
| 99 | `src/features/loans/LoanApplicationForm.vue` | modified | 8 | 8 | Later scope expansion — Application feature/domain | UNKNOWN |
| 100 | `src/features/loans/LoanApproveForm.vue` | modified | 7 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 101 | `src/features/loans/LoanCollateralForm.vue` | modified | 15 | 15 | Later scope expansion — Application feature/domain | UNKNOWN |
| 102 | `src/features/loans/LoanCollateralReleaseForm.vue` | modified | 10 | 10 | Later scope expansion — Application feature/domain | UNKNOWN |
| 103 | `src/features/loans/LoanDetailView.vue` | modified | 32 | 31 | Later scope expansion — Application feature/domain | UNKNOWN |
| 104 | `src/features/loans/LoanDisburseForm.vue` | modified | 7 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 105 | `src/features/loans/LoanListView.vue` | modified | 21 | 20 | Later scope expansion — Application feature/domain | UNKNOWN |
| 106 | `src/features/loans/LoanProductListView.vue` | modified | 51 | 51 | Later scope expansion — Application feature/domain | UNKNOWN |
| 107 | `src/features/loans/LoanRejectForm.vue` | modified | 7 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 108 | `src/features/loans/LoanRepaymentForm.vue` | modified | 37 | 37 | Later scope expansion — Application feature/domain | UNKNOWN |
| 109 | `src/features/loans/LoanRestructureForm.vue` | modified | 7 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 110 | `src/features/loans/LoanScheduleView.vue` | modified | 32 | 31 | Later scope expansion — Application feature/domain | UNKNOWN |
| 111 | `src/features/loans/LoanStatementView.vue` | modified | 28 | 28 | Later scope expansion — Application feature/domain | UNKNOWN |
| 112 | `src/features/loans/LoanWriteOffForm.vue` | modified | 10 | 10 | Later scope expansion — Application feature/domain | UNKNOWN |
| 113 | `src/features/notifications/NotificationsCenter.vue` | modified | 19 | 19 | Later scope expansion — Application feature/domain | UNKNOWN |
| 114 | `src/features/people/PeopleDirectoryView.vue` | modified | 22 | 22 | Later scope expansion — Application feature/domain | UNKNOWN |
| 115 | `src/features/people/PeopleProfileView.vue` | modified | 28 | 28 | Later scope expansion — Application feature/domain | UNKNOWN |
| 116 | `src/features/portal/MyCertificatesPage.vue` | modified | 1 | 1 | Later scope expansion — Application feature/domain | UNKNOWN |
| 117 | `src/features/portal/MyLoanDetailPage.vue` | modified | 31 | 30 | Later scope expansion — Application feature/domain | UNKNOWN |
| 118 | `src/features/portal/MyLoansPage.vue` | modified | 8 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 119 | `src/features/portal/MyShareholdingsPage.vue` | modified | 15 | 15 | Later scope expansion — Application feature/domain | UNKNOWN |
| 120 | `src/features/portal/MyWalletPage.vue` | modified | 16 | 16 | Later scope expansion — Application feature/domain | UNKNOWN |
| 121 | `src/features/portal/PortalHomePage.vue` | modified | 43 | 43 | Later scope expansion — Application feature/domain | UNKNOWN |
| 122 | `src/features/portal/PortalLayout.vue` | modified | 10 | 4 | Later scope expansion — Application feature/domain | UNKNOWN |
| 123 | `src/features/shareholders/CertificateCancelDialog/CertificateCancelDialog.vue` | modified | 28 | 28 | Later scope expansion — Application feature/domain | UNKNOWN |
| 124 | `src/features/shareholders/CertificateIssueForm/CertificateIssueForm.vue` | modified | 8 | 8 | Later scope expansion — Application feature/domain | UNKNOWN |
| 125 | `src/features/shareholders/HoldingEntryForm/HoldingEntryForm.vue` | modified | 8 | 8 | Later scope expansion — Application feature/domain | UNKNOWN |
| 126 | `src/features/shareholders/ShareClassListView/ShareClassListView.vue` | modified | 5 | 5 | Later scope expansion — Application feature/domain | UNKNOWN |
| 127 | `src/features/shareholders/ShareholderDetailView/ShareholderDetailView.vue` | modified | 30 | 30 | Later scope expansion — Application feature/domain | UNKNOWN |
| 128 | `src/features/shareholders/ShareholderForm/ShareholderForm.vue` | modified | 67 | 37 | Later scope expansion — Application feature/domain | UNKNOWN |
| 129 | `src/features/shareholders/ShareholderListView/ShareholderListView.vue` | modified | 19 | 19 | Later scope expansion — Application feature/domain | UNKNOWN |
| 130 | `src/features/wallet/WalletAdjustForm.vue` | modified | 7 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 131 | `src/features/wallet/WalletAllocationForm.vue` | modified | 7 | 7 | Later scope expansion — Application feature/domain | UNKNOWN |
| 132 | `src/features/wallet/WalletAllocationReverseDialog.vue` | modified | 25 | 25 | Later scope expansion — Application feature/domain | UNKNOWN |
| 133 | `src/features/wallet/WalletDetailView.vue` | modified | 30 | 30 | Later scope expansion — Application feature/domain | UNKNOWN |
| 134 | `src/features/wallet/WalletListView.vue` | modified | 29 | 29 | Later scope expansion — Application feature/domain | UNKNOWN |
| 135 | `src/features/wallet/WalletObligationForm.vue` | modified | 9 | 9 | Later scope expansion — Application feature/domain | UNKNOWN |
| 136 | `src/features/wallet/WalletOpenForm.vue` | modified | 8 | 8 | Later scope expansion — Application feature/domain | UNKNOWN |
| 137 | `src/features/wallet/WalletPaymentForm.vue` | modified | 9 | 9 | Later scope expansion — Application feature/domain | UNKNOWN |
| 138 | `src/features/wallet/WalletStatementView.vue` | modified | 28 | 30 | Later scope expansion — Application feature/domain | UNKNOWN |
| 139 | `src/layouts/AdminLayout/AdminLayout.vue` | modified | 19 | 11 | Later scope expansion — Application shell/layout | UNKNOWN |
| 140 | `src/layouts/AppShell/AbstractBackground/AbstractBackground.vue` | modified | 31 | 29 | Later scope expansion — Application shell/layout | UNKNOWN |
| 141 | `src/layouts/AppShell/AbstractBackground/index.ts` | modified | 2 | 2 | Later scope expansion — Application shell/layout | UNKNOWN |
| 142 | `src/layouts/AppShell/AppFooter/AppFooter.vue` | modified | 15 | 14 | Later scope expansion — Application shell/layout | UNKNOWN |
| 143 | `src/layouts/AppShell/AppHeader/AppHeader.vue` | modified | 75 | 61 | Original declared target (also touched later in aggregate diff) | UNKNOWN |
| 144 | `src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue` | modified | 53 | 42 | Later scope expansion — Application shell/layout | UNKNOWN |
| 145 | `src/layouts/AppShell/AppMobileDrawer/AppMobileDrawer.vue` | modified | 45 | 33 | Later scope expansion — Application shell/layout | UNKNOWN |
| 146 | `src/layouts/AppShell/AppShell.vue` | modified | 67 | 80 | Later scope expansion — Application shell/layout | UNKNOWN |
| 147 | `src/layouts/AppShell/AppSidebar/AppSidebar.vue` | modified | 61 | 43 | Later scope expansion — Application shell/layout | UNKNOWN |
| 148 | `src/layouts/AppShell/AranaBrand/AranaBrand.vue` | renamed | 69 | 69 | Later scope expansion — Application shell/layout | UNKNOWN |
| 149 | `src/layouts/AppShell/AranaBrand/index.ts` | renamed | 9 | 9 | Later scope expansion — Application shell/layout | UNKNOWN |
| 150 | `src/layouts/AppShell/AranaFooterContent/AranaFooterContent.vue` | renamed | 59 | 53 | Later scope expansion — Application shell/layout | UNKNOWN |
| 151 | `src/layouts/AppShell/AranaFooterContent/index.ts` | renamed | 12 | 12 | Later scope expansion — Application shell/layout | UNKNOWN |
| 152 | `src/layouts/AppShell/CalendarContext/CalendarContext.vue` | modified | 29 | 28 | Later scope expansion — Application shell/layout | UNKNOWN |
| 153 | `src/layouts/AppShell/CalendarPreferenceControl.vue` | modified | 11 | 9 | Later scope expansion — Application shell/layout | UNKNOWN |
| 154 | `src/layouts/AppShell/LanguageSelector/LanguageSelector.vue` | modified | 8 | 8 | Later scope expansion — Application shell/layout | UNKNOWN |
| 155 | `src/layouts/AppShell/LauncherGrid/LauncherGrid.vue` | modified | 3 | 15 | Later scope expansion — Application shell/layout | UNKNOWN |
| 156 | `src/layouts/AppShell/LauncherTile/LauncherTile.vue` | modified | 46 | 36 | Later scope expansion — Application shell/layout | UNKNOWN |
| 157 | `src/layouts/AppShell/MaintenanceBanner/MaintenanceBanner.vue` | modified | 42 | 35 | Later scope expansion — Application shell/layout | UNKNOWN |
| 158 | `src/layouts/AppShell/NotificationsBell/NotificationsBell.vue` | modified | 48 | 24 | Later scope expansion — Application shell/layout | UNKNOWN |
| 159 | `src/layouts/AppShell/PageTitle/PageTitle.vue` | modified | 15 | 8 | Later scope expansion — Application shell/layout | UNKNOWN |
| 160 | `src/layouts/AppShell/SkipToContent/SkipToContent.vue` | modified | 21 | 21 | Later scope expansion — Application shell/layout | UNKNOWN |
| 161 | `src/layouts/AppShell/TenantSwitcher/TenantSwitcher.vue` | modified | 15 | 25 | Later scope expansion — Application shell/layout | UNKNOWN |
| 162 | `src/layouts/AppShell/UserMenu/UserMenu.vue` | modified | 17 | 9 | Later scope expansion — Application shell/layout | UNKNOWN |
| 163 | `src/layouts/AppShell/index.ts` | modified | 6 | 3 | Later scope expansion — Application shell/layout | UNKNOWN |
| 164 | `src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue` | modified | 6 | 6 | Later scope expansion — Application shell/layout | UNKNOWN |
| 165 | `src/layouts/PublicSiteLayout.vue` | modified | 7 | 6 | Later scope expansion — Application shell/layout | UNKNOWN |
| 166 | `src/layouts/ThemePreferenceControl.vue` | modified | 8 | 9 | Later scope expansion — Application shell/layout | UNKNOWN |
| 167 | `src/public-site/CorporateDynamicHome.vue` | modified | 2 | 1 | Later scope expansion — Public site | UNKNOWN |
| 168 | `src/public-site/CorporateEntryRoute.vue` | modified | 4 | 3 | Later scope expansion — Public site | UNKNOWN |
| 169 | `src/public-site/CorporatePageRoute.vue` | modified | 2 | 2 | Later scope expansion — Public site | UNKNOWN |
| 170 | `src/public-site/PublicContributionRoute.vue` | modified | 3 | 3 | Later scope expansion — Public site | UNKNOWN |
| 171 | `src/router/admin-labels.ts` | modified | 10 | 10 | Later scope expansion — Application source | UNKNOWN |
| 172 | `src/router/pages/AdminAuditSecurityRoute.vue` | modified | 17 | 17 | Later scope expansion — Application source | UNKNOWN |
| 173 | `src/router/pages/AdminCorporateSiteRoute.vue` | modified | 3 | 1 | Later scope expansion — Application source | UNKNOWN |
| 174 | `src/router/pages/AdminDashboardRoute.vue` | modified | 18 | 18 | Later scope expansion — Application source | UNKNOWN |
| 175 | `src/router/pages/AdminPublicContentRoute.vue` | modified | 30 | 29 | Later scope expansion — Application source | UNKNOWN |
| 176 | `src/router/pages/ErrorRoute.vue` | modified | 11 | 11 | Later scope expansion — Application source | UNKNOWN |
| 177 | `src/router/pages/ForgotPasswordRoute.vue` | modified | 18 | 18 | Later scope expansion — Application source | UNKNOWN |
| 178 | `src/router/pages/LegalCenterRoute.vue` | modified | 61 | 61 | Later scope expansion — Application source | UNKNOWN |
| 179 | `src/router/pages/LegalDocumentRoute.vue` | modified | 75 | 75 | Later scope expansion — Application source | UNKNOWN |
| 180 | `src/router/pages/LoginRoute.vue` | modified | 8 | 8 | Later scope expansion — Application source | UNKNOWN |
| 181 | `src/router/pages/PublicVerificationRoute.vue` | modified | 35 | 35 | Later scope expansion — Application source | UNKNOWN |
| 182 | `src/router/pages/RegisterRoute.vue` | modified | 19 | 19 | Later scope expansion — Application source | UNKNOWN |
| 183 | `src/router/pages/ResetPasswordRoute.vue` | modified | 18 | 18 | Later scope expansion — Application source | UNKNOWN |
| 184 | `src/router/pages/VerifyEmailResendRoute.vue` | modified | 18 | 18 | Later scope expansion — Application source | UNKNOWN |
| 185 | `src/router/pages/VerifyEmailRoute.vue` | modified | 18 | 18 | Later scope expansion — Application source | UNKNOWN |
| 186 | `src/router/shell-labels.ts` | modified | 21 | 21 | Later scope expansion — Application source | UNKNOWN |
| 187 | `src/styles/base.css` | modified | 16 | 16 | Later scope expansion — Application source | UNKNOWN |
| 188 | `src/styles/reset.css` | modified | 1 | 1 | Later scope expansion — Application source | UNKNOWN |
| 189 | `src/styles/themes.css` | modified | 149 | 149 | Later scope expansion — Application source | UNKNOWN |
| 190 | `src/styles/tokens.css` | modified | 308 | 305 | Later scope expansion — Application source | UNKNOWN |
| 191 | `tests/app-shell-responsive-contract.test.mjs` | modified | 28 | 7 | Later scope expansion — Tests | UNKNOWN |
| 192 | `tests/brand-palette-contract.test.mjs` | modified | 2 | 2 | Later scope expansion — Tests | UNKNOWN |
| 193 | `tests/calendar-preference-contract.test.mjs` | added | 76 | 0 | Later scope expansion — Tests | UNKNOWN |
| 194 | `tests/date-picker-browser.spec.mjs` | added | 76 | 0 | Later scope expansion — Tests | UNKNOWN |
| 195 | `tests/design-system-theme-contract.test.mjs` | modified | 127 | 42 | Later scope expansion — Tests | UNKNOWN |
| 196 | `tests/ethiopic-calendar-contract.test.mjs` | added | 157 | 0 | Later scope expansion — Tests | UNKNOWN |
| 197 | `tests/fixtures/date-picker-browser.js` | added | 35 | 0 | Later scope expansion — Tests | UNKNOWN |
| 198 | `tests/fixtures/date-picker.html` | added | 12 | 0 | Later scope expansion — Tests | UNKNOWN |
| 199 | `workspace-entry/index.html` | modified | 5 | 5 | Later scope expansion — Configuration/assets/build | UNKNOWN |

## Decision required

Owner review is required to classify the 198 later paths as (a) intended baseline dependency, (b) independently authorized work, (c) unrelated work to preserve outside this UI sequence, or (d) unresolved. Do not merge PR #65. Review PR #71 independently; its creation does not authorize merge. A2 remains PARTIAL until the 198 paths and the design-system authority are reconciled.
