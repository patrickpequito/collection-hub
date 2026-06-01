export type NavItem = {
  href: string;
  label: string;
  /** Match nested routes (e.g. /rad-loot/vault-of-glass). */
  matchPrefix?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/rad-loot", label: "RAD Loot", matchPrefix: true },
  { href: "/exotics", label: "Exotics" },
  { href: "/triumphs", label: "Triumphs", matchPrefix: true },
  { href: "/sets", label: "Armor sets" },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === item.href;
}
