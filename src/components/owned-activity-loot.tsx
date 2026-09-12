"use client";

import { useMemo, useState } from "react";
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
import { compareTrialsReleaseOrder } from "@/lib/activities/trials-release-order";
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

function mergeCosmeticSections(
  current: ActivityHubLootSection[],
  legacy: ActivityHubLootSection[],
): ActivityHubLootSection[] {
  const byTitle = new Map<string, LootItem[]>();

  for (const section of [...current, ...legacy]) {
    const bucket = byTitle.get(section.title) ?? [];
    for (const item of section.items) {
      if (bucket.some((existing) => existing.itemHash === item.itemHash)) {
        continue;
      }
      bucket.push(item);
    }
    byTitle.set(section.title, bucket);
  }

  const order = ["Emblems", "Shaders", "Ghost Shells", "Ships", "Sparrows"];
  return order
    .filter((title) => byTitle.has(title))
    .map((title) => ({
      title,
      items: (byTitle.get(title) ?? []).sort(compareTrialsReleaseOrder),
    }));
}

type CosmeticProps = {
  sections: ActivityHubLootSection[];
  legacySections?: ActivityHubLootSection[];
  itemHrefs?: Record<string, string>;
};

export function OwnedActivityCosmeticLootPanel({
  sections,
  legacySections,
  itemHrefs,
}: CosmeticProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [showLegacy, setShowLegacy] = useState(false);
  const hasLegacy = (legacySections?.length ?? 0) > 0;

  const visibleSections = useMemo(() => {
    if (!showLegacy || !legacySections?.length) return sections;
    return mergeCosmeticSections(sections, legacySections);
  }, [sections, legacySections, showLegacy]);

  const toolbar = hasLegacy ? (
    <div className="flex items-center justify-end">
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
        <span>Include legacy</span>
        <span className="relative inline-flex h-5 w-9 items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={showLegacy}
            onChange={(event) => setShowLegacy(event.target.checked)}
          />
          <span className="absolute inset-0 rounded-full bg-zinc-700 transition peer-checked:bg-[#c9a227]/80 peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9a227]/60" />
          <span className="absolute left-0.5 size-4 rounded-full bg-zinc-100 transition peer-checked:translate-x-4" />
        </span>
      </label>
    </div>
  ) : null;

  return (
    <ActivityCosmeticLootPanel
      sections={visibleSections}
      toolbar={toolbar}
      ownedItemHashes={ownedItemHashes}
      showOwnership={showOwnership}
      itemHrefs={itemHrefs}
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
