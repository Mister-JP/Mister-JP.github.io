export type NavMatchMode = 'exact' | 'section';

export interface NavItem {
  href: string;
  label: string;
  match?: NavMatchMode;
  title?: string;
}

export interface ResolvedNavItem extends NavItem {
  isCurrent: boolean;
}

export const primaryNavigation: readonly NavItem[] = [
  { href: '/', label: 'Home', match: 'exact' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/writing', label: 'Writing' },
  { href: '/tools', label: 'Tools' },
  { href: '/resume', label: 'Resume' },
];

export function normalizePathname(pathname: string): string {
  const [pathOnly = '/'] = pathname.split(/[?#]/, 1);
  const withoutTrailingSlash = pathOnly.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
}

export function isNavItemCurrent(item: NavItem, pathname: string): boolean {
  const currentPath = normalizePathname(pathname);
  const itemPath = normalizePathname(item.href);
  const matchMode = item.match ?? (itemPath === '/' ? 'exact' : 'section');

  if (matchMode === 'exact') {
    return currentPath === itemPath;
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function getActiveNavigationHref(pathname: string): string | undefined {
  const currentPath = normalizePathname(pathname);

  return primaryNavigation.find((item) => isNavItemCurrent(item, currentPath))?.href;
}

export function resolvePrimaryNavigation(pathname: string): ResolvedNavItem[] {
  const activeHref = getActiveNavigationHref(pathname);

  return primaryNavigation.map((item) => ({
    ...item,
    isCurrent: item.href === activeHref,
  }));
}
