/**
 * Shared Expansion Hub config (Layout B completionist dashboard).
 */

export type ExpansionDeepLootActivity = {
  id: string;
  title: string;
  sourcePattern: RegExp;
};

export type ExpansionIndexEntry = {
  slug: string;
  title: string;
  available: boolean;
  /**
   * Dedicated index card art:
   * `public/images/expansions/activities/{imageFile}`
   * (usually `{slug}.webp`).
   */
  imageFile: string;
  /**
   * Temporary RAD activity art until dedicated expansion card art exists.
   * Loaded from `public/images/rad-loot/activities/`.
   */
  fallbackImageFile?: string;
  href?: string;
};

export type ExpansionHub = {
  slug: string;
  title: string;
  /** Title seal slug in triumphs catalog; null for legacy expansions without one. */
  titleSlug: string | null;
  /** Destination triumph group slug; null when none applies. */
  triumphGroupSlug: string | null;
  seasonLabels: readonly string[];
  /** Basename hashes from seasonIconPath (with or without .png). */
  seasonIconHashes: readonly string[];
  /** Manifest season number used for deep-loot armor group metadata. */
  seasonNumber: number;
  destinationArmorSetNames: readonly string[];
  destinationArmorPreviewFiles?: readonly string[];
  destinationTitle: string;
  destinationActivityTitle: string;
  destinationActivitySlug: string;
  destinationWeaponSourcePattern: RegExp;
  destinationWeaponExtraNames?: readonly string[];
  relatedRadSlugs: readonly string[];
  deepLootActivities: readonly ExpansionDeepLootActivity[];
  /** Sources that belong on destination / RAD / Eververse hubs, not Deep Loot. */
  deepLootExcludedSourcePattern: RegExp;
  raidsDungeonsBlurb: string;
  /** Collapsible triumphs block title, e.g. "Throne World // All triumphs". */
  triumphsGroupTitle: string;
  exoticPanelDescription: string;
  deepLootEmptyDescription: string;
  indexImageFile: string;
  available: boolean;
  /** Official expansion launch / reveal trailer (YouTube id). */
  trailerYoutubeId?: string;
  /** Hub-specific membership exclusions (name patterns). */
  excludedNamePatterns?: readonly RegExp[];
  excludedSeasonLabels?: readonly string[];
  excludedSourcePatterns?: readonly RegExp[];
  /** Extra exotic membership via quest/source text. */
  exoticQuestSourcePattern?: RegExp;
  exoticExcludedNames?: readonly string[];
  exoticExcludedSourcePattern?: RegExp;
  /** Force remastered weapons into a deep-loot pool by exact name. */
  deepLootWeaponPoolByName?: Readonly<Record<string, string>>;
  /** Raid/dungeon weapons that keep an expansion version — belong on RAD hubs. */
  raidDungeonDeepLootExcludedNames?: readonly string[];
};

/** Shared playlist deep-loot buckets used by most expansion hubs. */
export const DEFAULT_DEEP_LOOT_ACTIVITIES: readonly ExpansionDeepLootActivity[] =
  [
    {
      id: "vanguard-ops",
      title: "Vanguard Ops",
      sourcePattern: /vanguard|zavala|nightfall|strike/i,
    },
    {
      id: "gambit",
      title: "Gambit",
      sourcePattern: /gambit|drifter/i,
    },
    {
      id: "crucible",
      title: "Crucible",
      sourcePattern: /crucible|shaxx/i,
    },
    {
      id: "iron-banner",
      title: "Iron Banner",
      sourcePattern: /iron banner|saladin/i,
    },
    {
      id: "trials-of-osiris",
      title: "Trials of Osiris",
      sourcePattern: /trials of osiris|saint-14|flawless/i,
    },
  ];
