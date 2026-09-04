/**
 * Season hub config — lighter than expansion hubs; loot + videos + playable activities.
 */

export type SeasonVideo = {
  id: string;
  label: string;
  youtubeId: string;
};

export type SeasonWeaponPoolDefinition = {
  id: string;
  title: string;
  sourcePattern: RegExp;
};

export type SeasonPlayableActivity = {
  id: string;
  title: string;
  description: string;
  /** Bungie manifest `pgcrImage` path for the Director-style activity art. */
  pgcrImagePath: string;
  href?: string;
};

export type SeasonHub = {
  slug: string;
  title: string;
  /** Full all-loot season label, e.g. "S13 Season of the Chosen". */
  seasonLabel: string;
  parentExpansionSlug: string;
  seasonNumber: number;
  videos: readonly SeasonVideo[];
  /** Named armor sets shown in the season loot panel. */
  armorSetNames: readonly string[];
  /**
   * Season Pass armor ornament sets, placed directly under the matching armor set.
   * Example: Legatus ornaments under Praefectus.
   */
  ornamentSets?: readonly {
    setName: string;
    armorSetName: string;
  }[];
  /** Legendary weapons introduced this season but remastered into Monument / playlists. */
  extraWeaponNames?: readonly string[];
  /** Catalog matches to omit from season loot (e.g. event reprisals). */
  excludedWeaponNames?: readonly string[];
  /** Exotic weapons and armor — legendaries live in season loot. */
  exoticItemNames: readonly string[];
  /**
   * Season Pass cosmetics reclaimable from the Tower Season Archive.
   * Curated by name — shown in a single row in this order.
   */
  cosmeticRewards?: readonly string[];
  /** Optional blurb under the Cosmetic rewards heading. */
  cosmeticPanelDescription?: string;
  weaponPools: readonly SeasonWeaponPoolDefinition[];
  /** Force specific weapons into a pool when source text is unreliable. */
  weaponPoolByName?: Readonly<Record<string, string>>;
  /**
   * When false, only primary `seasonLabel` (+ `extraWeaponNames`) count as
   * season weapons. Default true also matches older versions — useful for
   * remasters, but too broad for seasons that share watermarks with an expansion.
   */
  matchWeaponVersions?: boolean;
  /** Bungie icon path for the season title seal (decorative + future title panel). */
  titleIconPath: string;
  playableActivities: readonly SeasonPlayableActivity[];
  exoticPanelDescription: string;
  available: boolean;
};

/** Shared playlist buckets for season weapon grouping. */
export const DEFAULT_SEASON_WEAPON_POOLS: readonly SeasonWeaponPoolDefinition[] =
  [
    {
      id: "battlegrounds",
      title: "Battlegrounds",
      sourcePattern: /battleground/i,
    },
    {
      id: "vanguard-ops",
      title: "Vanguard Ops",
      sourcePattern: /vanguard|zavala|nightfall|strike/i,
    },
    {
      id: "crucible",
      title: "Crucible",
      sourcePattern: /crucible|shaxx/i,
    },
    {
      id: "trials-of-osiris",
      title: "Trials of Osiris",
      sourcePattern: /trials of osiris|flawless|lighthouse/i,
    },
    {
      id: "iron-banner",
      title: "Iron Banner",
      sourcePattern: /iron banner|saladin/i,
    },
    {
      id: "gambit",
      title: "Gambit",
      sourcePattern: /gambit|drifter/i,
    },
    {
      id: "season-pass",
      title: "Season Pass",
      sourcePattern: /season pass/i,
    },
  ];

export const SEASON_WORLD_LOOT_POOL: SeasonWeaponPoolDefinition = {
  id: "world-loot",
  title: "World Loot",
  sourcePattern: /.*/,
};
