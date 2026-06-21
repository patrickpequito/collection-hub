"use client";

import { useMemo, useState } from "react";
import { ExoticItemGrid } from "@/components/exotic-item-grid";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import {
  ARMOR_SECTIONS,
  countExoticsByCategory,
  EXOTIC_TABS,
  filterExoticsByCategory,
  groupCatalystsByWeaponSlot,
  groupExoticsByArmorSlot,
  groupExoticsByWeaponSlot,
  WEAPON_SECTIONS,
} from "@/lib/exotics/constants";
import type { CatalystItem } from "@/types/catalyst-item";
import type { ExoticCategory, ExoticItem } from "@/types/exotic-item";

type ExoticsCatalogProps = {
  items: ExoticItem[];
  catalysts: CatalystItem[];
  signedIn?: boolean;
  weaponHrefs?: Record<string, string>;
};

export function ExoticsCatalog({
  items,
  catalysts,
  signedIn = false,
  weaponHrefs,
}: ExoticsCatalogProps) {
  const { itemHashes: ownedItemHashes, error: inventoryError } =
    useOwnedItemHashes(signedIn);
  const showOwnership = signedIn && !inventoryError;
  const counts = useMemo(
    () => countExoticsByCategory(items, catalysts.length),
    [items, catalysts.length],
  );
  const [activeTab, setActiveTab] = useState<ExoticCategory>("weapons");

  const ownedSet = useMemo(
    () => new Set(ownedItemHashes),
    [ownedItemHashes],
  );

  const tabItems = useMemo(
    () => filterExoticsByCategory(items, activeTab),
    [items, activeTab],
  );

  const weaponGroups = useMemo(
    () => groupExoticsByWeaponSlot(tabItems),
    [tabItems],
  );

  const armorGroups = useMemo(
    () => groupExoticsByArmorSlot(tabItems),
    [tabItems],
  );

  const catalystGroups = useMemo(
    () => groupCatalystsByWeaponSlot(catalysts),
    [catalysts],
  );

  return (
    <div className="space-y-6">
      {inventoryError ? (
        <p className="text-xs text-amber-200/80">
          Collection unavailable: {inventoryError}
        </p>
      ) : null}

      {showOwnership ? (
        <p className="text-xs text-zinc-500">
          Green border = acquired. Dimmed icons = not collected yet.
          Hover an item for its source.
        </p>
      ) : null}

      <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        {EXOTIC_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-zinc-950"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({counts[tab.id]})</span>
          </button>
        ))}
      </nav>

      {activeTab === "weapons" || activeTab === "catalysts" ? (
        <div className="space-y-6">
          {WEAPON_SECTIONS.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">
                {section.label}
              </h2>
              <ExoticItemGrid
                items={
                  activeTab === "weapons"
                    ? weaponGroups[section.id]
                    : catalystGroups[section.id]
                }
                ownedItemHashes={ownedSet}
                showOwnership={showOwnership}
                weaponHrefs={activeTab === "weapons" ? weaponHrefs : undefined}
              />
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {ARMOR_SECTIONS.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">
                {section.label}
              </h2>
              <ExoticItemGrid
                items={armorGroups[section.id]}
                ownedItemHashes={ownedSet}
                showOwnership={showOwnership}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
