import type { NavItem, UserMenuItem } from '@/layouts/AppShell';

/**
 * English shell chrome labels. The Amharic-first source labels remain the
 * fallback; the active locale is supplied by the existing locale store.
 * This does not introduce a language selector or a locale API dependency.
 */
export const arnaShellEnglishLabels = {
  skipToContent: 'Skip to main content',
  mobileMenu: 'Open navigation menu',
  userMenu: { triggerAriaLabel: 'User menu' },
  notificationsBell: {
    triggerAriaLabel: 'Notifications',
    triggerAriaLabelWithUnread: (count: number) => `Notifications, ${count} unread`,
    disabledReason: 'Notifications will be available soon',
  },
  tenantSwitcher: { triggerAriaLabel: 'Choose organization' },
  sidebar: { navigationAriaLabel: 'Main navigation' },
  drawer: {
    dialogAriaLabel: 'Navigation menu',
    closeButtonLabel: 'Close navigation menu',
  },
};

const workspaceLabels: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  launcher: 'Home',
  files: 'Documents',
  shareholders: 'Shareholders',
  'share-classes': 'Share classes',
  wallets: 'Wallets',
  loans: 'Loans',
  'loan-products': 'Loan products',
  governance: 'Governance',
};

const portalLabels: Readonly<Record<string, string>> = {
  'portal-home': 'Home',
  'my-holdings': 'My holdings',
  'my-certificates': 'My certificates',
  'my-wallet': 'My wallet',
  'my-loans': 'My loans',
};

const userMenuLabels: Readonly<Record<string, string>> = {
  logout: 'Sign out',
  'go-to-workspace': 'Back to Workspace',
};

/** Return translated copies without mutating the canonical Amharic arrays. */
export function localizeNavItems(items: ReadonlyArray<NavItem>, surface: 'workspace' | 'portal'): ReadonlyArray<NavItem> {
  const labels = surface === 'portal' ? portalLabels : workspaceLabels;
  return items.map((item) => ({ ...item, label: labels[item.id] ?? item.label }));
}

/** Return translated copies without mutating the canonical user-menu array. */
export function localizeUserMenuItems(items: ReadonlyArray<UserMenuItem>): ReadonlyArray<UserMenuItem> {
  return items.map((item) => ({ ...item, label: userMenuLabels[item.id] ?? item.label }));
}
