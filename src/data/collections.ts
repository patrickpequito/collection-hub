/** Collections page: the game's badges (data/badges.json) grouped for the index. */
export type CollectionEntryConfig = {
  /** Badge presentation node hash. */
  hash: string;
  /** Small line under the name when the badge name doesn't say what it is. */
  subtitle?: string;
  /** Related page on the site. */
  href?: string;
  /** Page not available yet (unbuilt, or waiting for unvaulting): greyed-out button, no link. */
  pagePending?: boolean;
};

export type CollectionGroupConfig = {
  id: string;
  title: string;
  entries: CollectionEntryConfig[];
};

export const COLLECTION_GROUPS: CollectionGroupConfig[] = [
  {
    id: "destinations",
    title: "Destinations",
    entries: [
      { hash: "1528010893", subtitle: "The Pale Heart", pagePending: true }, // Pale Heart Pathfinder
      { hash: "1074030956", subtitle: "Neomuna", pagePending: true }, // Neomuni Souvenirs
      { hash: "3016040694", subtitle: "Throne World", href: "/activities/destinations/throne-world" },
      { hash: "2078340986", subtitle: "Europa", href: "/activities/destinations/europa" },
      { hash: "2388540594", subtitle: "The Moon", href: "/activities/destinations/the-moon" }, // Lunar Rover
      { hash: "3642989833", href: "/activities/destinations/dreaming-city" },
      { hash: "2881240068", pagePending: true }, // Forsaken
      { hash: "1331476689", pagePending: true }, // Curse of Osiris and Warmind
      { hash: "2904806741", pagePending: true }, // Red War
    ],
  },
  {
    id: "raids",
    title: "Raids",
    entries: [
      { hash: "4253860097", href: "/activities/the-desert-perpetual" },
      { hash: "988425963", href: "/activities/salvations-edge" },
      { hash: "48971793", href: "/activities/crotas-end" },
      { hash: "1968454484", href: "/activities/root-of-nightmares" },
      { hash: "3509969063", href: "/activities/kings-fall" },
      { hash: "1809003442", href: "/activities/vow-of-the-disciple" },
      { hash: "1154828558", href: "/activities/vault-of-glass" },
      { hash: "1235050036", href: "/activities/deep-stone-crypt" },
      { hash: "223465203", subtitle: "Garden of Salvation", href: "/activities/garden-of-salvation" }, // Sacred Duty
      { hash: "1086048586", href: "/activities/last-wish" },
    ],
  },
  {
    id: "dungeons",
    title: "Dungeons",
    entries: [
      { hash: "1208791766", subtitle: "Dungeon", href: "/activities/equilibrium" },
      { hash: "2142982716", href: "/activities/sundered-doctrine" },
      { hash: "2157285411", href: "/activities/vespers-host" },
      { hash: "3754709239", subtitle: "Dungeon", href: "/activities/warlords-ruin" },
      { hash: "164858691", href: "/activities/ghosts-of-the-deep" },
      { hash: "2268797508", subtitle: "Dungeon", href: "/activities/spire-of-the-watcher" },
      { hash: "3487512928", href: "/activities/duality" },
    ],
  },
  {
    id: "playlists",
    title: "Playlists & activities",
    entries: [
      { hash: "564984975", href: "/activities/trials-of-osiris" },
      { hash: "701100740", subtitle: "Crucible", href: "/activities/crucible" }, // Forged in Fire
      { hash: "1420354007", subtitle: "Gambit", href: "/activities/gambit" }, // Playing for Keeps
      { hash: "1697245957", subtitle: "Raid boss rush", href: "/activities/the-pantheon" },
    ],
  },
  {
    id: "exotics",
    title: "Exotics",
    entries: [
      { hash: "3241617029", href: "/exotics" },
      { hash: "1419883649", href: "/exotics" },
      { hash: "3333531796", href: "/exotics" },
    ],
  },
  {
    id: "seasons",
    title: "Seasons & Annual Pass",
    entries: [
      { hash: "3459575786", href: "/seasons/s11-season-of-arrivals" },
      { hash: "3267852685", href: "/seasons/s8-season-of-the-undying" },
      { hash: "4257248973", href: "/seasons/s9-season-of-dawn" },
      { hash: "2759158924", pagePending: true }, // Annual Pass: Season of Opulence
      { hash: "2503214417", pagePending: true }, // Annual Pass: Jokers Wild
      { hash: "2399267278", pagePending: true }, // Annual Pass: Black Armory
    ],
  },
];
