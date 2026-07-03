import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";

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
  seasonLabel?: string;
  seasonNumber?: number;
  rows: ActivityArmorRow[];
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
  currentWeapons?: LootItem[];
  currentWeaponPools?: ActivityWeaponPool[];
  currentOtherSections: ActivityHubLootSection[];
  legacyArmorGroups: LegacyArmorSetGroup[];
};
