"use client";

import { useMemo, useState } from "react";
import {
  ActivityCosmeticLootPanel,
  ActivityCurrentLootPanel,
  ActivityWeaponsLootPanel,
} from "@/components/activity-current-loot-panel";
import { useOwnership } from "@/components/client-ownership";
import { LegacyArmorSetsSection } from "@/components/legacy-armor-sets-section";
import { LootBox, LootSection } from "@/components/loot-section";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { TrialsWeaponsBySeasonSection } from "@/components/trials-weapons-by-season-section";
import { compareTrialsReleaseOrder } from "@/lib/activities/trials-release-order";
import type { PoolOccurrence } from "@/lib/activities/pool-rotation";
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
  heading?: string;
  headingNote?: string;
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
  heading?: string;
};

export function OwnedActivityCosmeticLootPanel({
  sections,
  legacySections,
  itemHrefs,
  heading,
}: CosmeticProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [showLegacy, setShowLegacy] = useState(false);
  const hasLegacy = (legacySections?.length ?? 0) > 0;

  const visibleSections = useMemo(() => {
    if (!showLegacy || !legacySections?.length) return sections;
    return mergeCosmeticSections(sections, legacySections);
  }, [sections, legacySections, showLegacy]);

  // Current / Include legacy, same square segmented buttons as the other page toggles.
  const toolbar = hasLegacy ? (
    <div className="flex justify-end gap-1" role="group" aria-label="Cosmetics shown">
      {[
        { value: false, label: "Current" },
        { value: true, label: "Include legacy" },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={showLegacy === option.value}
          onClick={() => setShowLegacy(option.value)}
          className={`inline-flex min-h-7 items-center border px-2.5 font-display text-xs uppercase tracking-[0.12em] transition ${
            showLegacy === option.value
              ? "border-bone bg-white/[0.06] text-white"
              : "border-white/[0.22] text-[#c7cad0] hover:border-bone"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <ActivityCosmeticLootPanel
      sections={visibleSections}
      toolbar={toolbar}
      heading={heading}
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
  weaponSubgroups?: { title: string; items: LootItem[] }[];
  poolOccurrences?: PoolOccurrence[];
  poolsNowMs?: number;
  armorNote?: string;
  itemHrefs?: Record<string, string>;
  heading?: string;
  headingNote?: string;
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
  layout?: "column" | "wide";
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
  poolOccurrences?: PoolOccurrence[];
  poolsNowMs?: number;
  boxTitle?: string;
  weaponSubgroups?: { title: string; items: LootItem[] }[];
  activityTitle?: string;
  footerNote?: string;
  itemHrefs?: Record<string, string>;
  heading?: string;
  headingNote?: string;
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

export function OwnedLootBox(props: Omit<Parameters<typeof LootBox>[0], "ownedItemHashes" | "showOwnership">) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return <LootBox {...props} ownedItemHashes={ownedItemHashes} showOwnership={showOwnership} />;
}

