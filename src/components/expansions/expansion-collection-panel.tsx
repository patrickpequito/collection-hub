"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useOwnership } from "@/components/client-ownership";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { LootItemGrid } from "@/components/loot-section";
import {
  CLASS_LABELS,
  GUARDIAN_CLASSES,
} from "@/lib/armor-sets/constants";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ExpansionCollectionItem } from "@/lib/expansions/resolve-expansion-loot";
import type { GuardianClass } from "@/types/armor-set";

type ExpansionCollectionPanelProps = {
  badgeName: string;
  /** Primary badge art (presentation node icon). Prefer over bannerIconPath. */
  iconPath: string;
  /** Often a broken 1×1 placeholder from Bungie — only used as fallback. */
  bannerIconPath?: string;
  items: ExpansionCollectionItem[];
  itemHrefs?: Record<string, string>;
};

const SECTION_ORDER = [
  { id: "armor", title: "Armor" },
  { id: "weapons", title: "Weapons" },
  { id: "other", title: "Other" },
] as const;

/** Preferred exotic weapon order in the collection weapons grid. */
const EXOTIC_WEAPON_ORDER = [
  "Parasite",
  "Edge of Action",
  "Edge of Concurrence",
  "Edge of Intent",
] as const;

/** Class-locked Edge glaives hidden when filtering by another class. */
const HIDDEN_WEAPONS_BY_CLASS: Record<GuardianClass, ReadonlySet<string>> = {
  hunter: new Set(["Edge of Action", "Edge of Intent"]),
  titan: new Set(["Edge of Concurrence", "Edge of Intent"]),
  warlock: new Set(["Edge of Action", "Edge of Concurrence"]),
};

function resolveGuardianClass(
  item: ExpansionCollectionItem,
): GuardianClass | null {
  const raw = (item.classOrWeaponType ?? "").toLowerCase();
  if (raw === "hunter" || raw === "titan" || raw === "warlock") return raw;

  const typeName = (item.itemTypeDisplayName ?? "").toLowerCase();
  if (typeName.includes("hunter") || typeName.includes("cloak")) return "hunter";
  if (typeName.includes("titan") || typeName.includes("mark")) return "titan";
  if (typeName.includes("warlock") || typeName.includes("bond")) return "warlock";

  const name = item.name.toLowerCase();
  if (/\b(cowl|grips|vest|strides|cloak)\b/.test(name)) return "hunter";
  if (/\b(helm|gauntlets|plate|greaves|mark)\b/.test(name)) return "titan";
  if (/\b(hood|gloves|robe|robes|boots|bond)\b/.test(name)) return "warlock";

  return null;
}

function sortCollectionWeapons(
  items: ExpansionCollectionItem[],
): ExpansionCollectionItem[] {
  const exoticRank = new Map<string, number>(
    EXOTIC_WEAPON_ORDER.map((name, index) => [name, index]),
  );

  return [...items].sort((a, b) => {
    const aExotic = a.rarity === "Exotic";
    const bExotic = b.rarity === "Exotic";
    if (aExotic !== bExotic) return aExotic ? -1 : 1;

    if (aExotic && bExotic) {
      const aRank = exoticRank.get(a.name) ?? EXOTIC_WEAPON_ORDER.length;
      const bRank = exoticRank.get(b.name) ?? EXOTIC_WEAPON_ORDER.length;
      if (aRank !== bRank) return aRank - bRank;
    }

    return a.name.localeCompare(b.name);
  });
}

function filterCollectionItems(
  items: ExpansionCollectionItem[],
  classFilter: GuardianClass | null,
): ExpansionCollectionItem[] {
  if (!classFilter) return items;

  const hiddenWeapons = HIDDEN_WEAPONS_BY_CLASS[classFilter];

  return items.filter((item) => {
    if (item.section === "armor") {
      return resolveGuardianClass(item) === classFilter;
    }
    if (item.section === "weapons") {
      return !hiddenWeapons.has(item.name);
    }
    return true;
  });
}

export function ExpansionCollectionPanel({
  badgeName,
  iconPath,
  bannerIconPath,
  items,
  itemHrefs,
}: ExpansionCollectionPanelProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [classFilter, setClassFilter] = useState<GuardianClass | null>(null);
  const badgeUrl =
    bungieIconUrl(iconPath) ||
    (bannerIconPath ? bungieIconUrl(bannerIconPath) : "");

  const visibleItems = useMemo(
    () => filterCollectionItems(items, classFilter),
    [classFilter, items],
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {badgeUrl ? (
          <Image
            src={badgeUrl}
            alt={`${badgeName} badge`}
            width={208}
            height={126}
            className="h-24 w-auto shrink-0 sm:h-28"
            unoptimized
          />
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-zinc-100">
            Expansion collection
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {badgeName
              ? `Destiny Collections badge: ${badgeName}`
              : "Collection badge items will appear here when this expansion’s collector record is wired."}
          </p>
        </div>
      </div>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" aria-hidden />
        <div className="flex shrink-0 items-center gap-2">
          {GUARDIAN_CLASSES.map((guardianClass) => {
            const selected = classFilter === guardianClass;
            return (
              <button
                key={guardianClass}
                type="button"
                onClick={() =>
                  setClassFilter((current) =>
                    current === guardianClass ? null : guardianClass,
                  )
                }
                aria-pressed={selected}
                aria-label={
                  selected
                    ? `Clear ${CLASS_LABELS[guardianClass]} filter`
                    : `Filter collection by ${CLASS_LABELS[guardianClass]}`
                }
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  selected
                    ? "border-[#c9a227]/70 bg-[#c9a227]/15 text-zinc-100"
                    : "border-zinc-600 bg-zinc-950/80 text-zinc-300 hover:border-zinc-400 hover:text-zinc-100"
                }`}
              >
                <GuardianClassIcon guardianClass={guardianClass} size="sm" />
              </button>
            );
          })}
        </div>
        <div className="h-px flex-1 bg-zinc-800" aria-hidden />
      </div>

      <div className="space-y-6">
        {SECTION_ORDER.map((section) => {
          const sectionItems = visibleItems.filter(
            (item) => item.section === section.id,
          );
          if (sectionItems.length === 0) return null;

          if (section.id === "armor") {
            const classOrder = classFilter
              ? [classFilter]
              : [...GUARDIAN_CLASSES];
            return (
              <div key={section.id}>
                <h3 className="mb-3 text-sm font-medium text-zinc-300">
                  {section.title}
                </h3>
                <div className="space-y-4">
                  {classOrder.map((guardianClass) => {
                    const classItems = sectionItems.filter(
                      (item) => resolveGuardianClass(item) === guardianClass,
                    );
                    if (classItems.length === 0) return null;
                    return (
                      <LootItemGrid
                        key={guardianClass}
                        items={classItems}
                        ownedItemHashes={ownedItemHashes}
                        showOwnership={showOwnership}
                        itemHrefs={itemHrefs}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={section.id}>
              <h3 className="mb-3 text-sm font-medium text-zinc-300">
                {section.title}
              </h3>
              <LootItemGrid
                items={
                  section.id === "weapons"
                    ? sortCollectionWeapons(sectionItems)
                    : sectionItems
                }
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                itemHrefs={itemHrefs}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
