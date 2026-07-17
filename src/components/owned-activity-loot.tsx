"use client";

import {
  ActivityCosmeticLootPanel,
  ActivityCurrentLootPanel,
  ActivityWeaponsLootPanel,
} from "@/components/activity-current-loot-panel";
import { useOwnership } from "@/components/client-ownership";
import { LegacyArmorSetsSection } from "@/components/legacy-armor-sets-section";
import { LootSection } from "@/components/loot-section";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { TrialsWeaponsBySeasonSection } from "@/components/trials-weapons-by-season-section";
import type {
  ActivityHubLootSection,
  ActivityWeaponPool,
  LegacyArmorSetGroup,
  TrialsWeaponSeasonGroup,
} from "@/types/activity-hub";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";

type CurrentArmorProps = {
  activitySlug: string;
  activityTitle: string;
  armorRows: ActivityArmorRow[];
  previewFiles?: string[];
  itemHrefs?: Record<string, string>;
};

export function OwnedActivityCurrentLootPanel(props: CurrentArmorProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityCurrentLootPanel
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type WeaponsProps = {
  weapons: LootItem[];
  itemHrefs?: Record<string, string>;
};

export function OwnedActivityWeaponsLootPanel(props: WeaponsProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityWeaponsLootPanel
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type CosmeticProps = {
  sections: ActivityHubLootSection[];
  itemHrefs?: Record<string, string>;
};

export function OwnedActivityCosmeticLootPanel(props: CosmeticProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityCosmeticLootPanel
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type LegacyProps = {
  groups: LegacyArmorSetGroup[];
  itemHrefs?: Record<string, string>;
  heading?: string;
};

export function OwnedLegacyArmorSetsSection(props: LegacyProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <LegacyArmorSetsSection
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type WeaponPoolsProps = {
  // reserved for iron banner / trials pages that pass weaponPools via ActivityCurrentLootPanel
  activitySlug: string;
  activityTitle: string;
  armorRows: ActivityArmorRow[];
  previewFiles?: string[];
  weapons?: LootItem[];
  weaponPools?: ActivityWeaponPool[];
  itemHrefs?: Record<string, string>;
};

export function OwnedActivityCurrentLootPanelFull(props: WeaponPoolsProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityCurrentLootPanel
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type ArmorSectionProps = {
  activitySlug: string;
  activityTitle: string;
  rows: ActivityArmorRow[];
  previewFiles?: string[];
  itemHrefs?: Record<string, string>;
};

export function OwnedActivityArmorSection(props: ArmorSectionProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <ActivityArmorSection
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type LootSectionProps = {
  title: string;
  items: LootItem[];
  exoticItemHashes?: Set<string>;
  itemHrefs?: Record<string, string>;
};

export function OwnedLootSection(props: LootSectionProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <LootSection
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}

type TrialsWeaponsProps = {
  groups: TrialsWeaponSeasonGroup[];
  weaponPools?: ActivityWeaponPool[];
  activityTitle?: string;
  footerNote?: string;
  itemHrefs?: Record<string, string>;
};

export function OwnedTrialsWeaponsBySeasonSection(props: TrialsWeaponsProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <TrialsWeaponsBySeasonSection
      {...props}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
    />
  );
}
