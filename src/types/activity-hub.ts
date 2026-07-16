import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";

export type ActivityCurrentArmorPanel = {
  armorRows: ActivityArmorRow[];
  previewFiles?: string[];
};

export type ActivityHubConfig = {
  slug: string;
  title: string;
  /** Triumph catalog title slug (e.g. iron-banner → Iron Lord). */
  titleSlug: string;
  headerImageUrl: string;
  /** Equipable item set hashes for this event's current armor. */
  currentArmorSetHashes: string[];
  armorSetPreviewFiles?: string[];
  /** Armor set display names excluded from the legacy section. */
  excludeLegacySetNames?: string[];
};

export type LegacyArmorSetGroup = {
  setName: string;
  /** When set, shown instead of setName in the section heading. */
  displayName?: string;
  /** Overrides slugified set name for full-set preview images. */
  previewFile?: string;
  seasonLabel?: string;
  seasonNumber?: number;
  rows: ActivityArmorRow[];
};

export type TrialsWeaponSeasonGroup = {
  seasonLabel: string;
  seasonNumber: number;
  items: LootItem[];
};

export type ActivityHubLootSection = {
  title: string;
  items: LootItem[];
};

export type ActivityWeaponPool = {
  id: string;
  label: string;
  isActive: boolean;
  items: LootItem[];
};

export type ActivityEventCardReward = {
  rank: number;
  name: string;
  subtitle?: string;
  iconPath: string;
  itemHash?: string;
  /** Index into DestinyProgression.rewardItemStates for this rank's reward. */
  progressionRewardIndex: number;
};

export type EventCardRewardClaimStatus = "locked" | "claimable" | "claimed";

export type ResolvedActivityHubLoot = {
  currentArmorRows: ActivityArmorRow[];
  /** When set, render one loot panel per entry (e.g. multiple current armor rotations). */
  currentArmorPanels?: ActivityCurrentArmorPanel[];
  currentWeapons?: LootItem[];
  currentWeaponPools?: ActivityWeaponPool[];
  weaponSeasonGroups?: TrialsWeaponSeasonGroup[];
  currentOtherSections: ActivityHubLootSection[];
  legacyArmorGroups: LegacyArmorSetGroup[];
  yearOfProphecyArmorGroups?: LegacyArmorSetGroup[];
};
