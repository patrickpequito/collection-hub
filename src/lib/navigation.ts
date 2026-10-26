/**
 * Director UI global navigation: top-level tabs (Q / E cycle through them)
 * and the grouped links shown in each tab's menu.
 */

export type NavLink = {
  label: string;
  href?: string;
  /** Shown greyed out with a "soon" tag. */
  comingSoon?: boolean;
};

export type NavGroup = {
  label: string;
  links: readonly NavLink[];
};

export type NavTab = {
  id: string;
  label: string;
  /** Where the tab (and Q / E) goes. */
  href: string;
  /** Path prefixes that light this tab up. */
  matchPrefixes: readonly string[];
  /** Tabs with groups open a menu instead of navigating on click. */
  groups?: readonly NavGroup[];
};

export const NAV_TABS: readonly NavTab[] = [
  {
    id: "director",
    label: "Director",
    href: "/",
    matchPrefixes: [],
  },
  {
    id: "collections",
    label: "Collections",
    href: "/all-loot",
    matchPrefixes: [
      "/all-loot",
      "/collections",
      "/exotics",
      "/sets",
      "/shaders",
      "/weapons",
      "/armor",
    ],
    groups: [
      {
        label: "Catalogs",
        links: [
          { label: "Search all loot", href: "/all-loot" },
          { label: "Exotics", href: "/exotics" },
          { label: "Armor sets", href: "/sets" },
          { label: "Set bonuses", href: "/sets/bonuses" },
          { label: "Shaders", href: "/shaders" },
          { label: "Collections", href: "/collections" },
        ],
      },
    ],
  },
  {
    id: "triumphs",
    label: "Triumphs",
    href: "/triumphs",
    matchPrefixes: ["/triumphs"],
  },
  {
    id: "seasons",
    label: "Timeline",
    href: "/expansions",
    matchPrefixes: ["/expansions", "/seasons"],
  },
  {
    id: "activities",
    label: "Activities",
    href: "/activities",
    matchPrefixes: [
      "/activities",
      "/pve-activities",
      "/pvp-activities",
    ],
    groups: [
      {
        label: "Endgame",
        links: [
          { label: "Raids & dungeons", href: "/activities" },
          { label: "Pantheon", href: "/activities/the-pantheon" },
          {
            label: "Monument of Triumph",
            href: "/activities/monument-of-triumph",
          },
        ],
      },
      {
        label: "Playlists",
        links: [
          { label: "Vanguard Ops", href: "/activities/vanguard-ops" },
          { label: "Crucible", href: "/activities/crucible" },
          { label: "Trials of Osiris", href: "/activities/trials-of-osiris" },
          { label: "Iron Banner", href: "/activities/iron-banner" },
          { label: "Gambit", href: "/activities/gambit" },
          { label: "Sparrow Racing League", href: "/activities/sparrow-racing-league" },
        ],
      },
      {
        label: "World",
        links: [{ label: "Destinations", href: "/activities/destinations" }],
      },
    ],
  },
];

export function isNavTabActive(pathname: string, tab: NavTab): boolean {
  if (tab.href === "/") return pathname === "/";
  return tab.matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
