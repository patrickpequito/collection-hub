import { loadCatalogHashIndex } from "@/lib/all-loot/catalog-hash-index";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import { loadCatalystCatalog } from "@/lib/catalysts/load";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { dedupeCollectiblesByName } from "@/lib/exotics/constants";
import { loadExoticCatalog } from "@/lib/exotics/load";
import type { ArmorSlot, ExoticItem, WeaponSlot } from "@/types/exotic-item";

export type ExoticCatalystEntry = {
  name: string;
  iconPath: string;
  source: string;
  recordHash?: string;
  /** Objectives to finish before it can be slotted (e.g. "Targets defeated" × 500). */
  objectives: { objectiveHash: string; description: string; completionValue: number }[];
  /** All manifest hashes of the catalyst plug. */
  ownershipHashes: string[];
  /** What it does (perk name, text, icon), when the manifest describes it. */
  effect?: { name: string; description: string; iconPath: string };
};

export type ExoticWeaponEntry = {
  itemHash: string;
  name: string;
  iconPath: string;
  source: string;
  slot: WeaponSlot;
  weaponType: string | null;
  damageType: string | null;
  ammoType: string | null;
  ownershipHashes: string[];
  href?: string;
  /** Since Monument of Triumph every exotic has one or more catalysts. */
  catalysts: ExoticCatalystEntry[];
};

export type ExoticArmorEntry = {
  itemHash: string;
  name: string;
  iconPath: string;
  source: string;
  guardianClass: "hunter" | "titan" | "warlock";
  armorSlot: ArmorSlot;
  ownershipHashes: string[];
  href?: string;
};

export type ExoticsPageData = {
  weapons: ExoticWeaponEntry[];
  armor: ExoticArmorEntry[];
};

function cleanSource(source: string): string {
  return source.replace(/^source:\s*/i, "").trim();
}

/** Exotic weapons (with their catalyst) and exotic armor for the Exotics page. */
export async function loadExoticsPageData(): Promise<ExoticsPageData> {
  const [catalog, catalysts, catalogByHash, hrefs] = await Promise.all([
    loadExoticCatalog(),
    loadCatalystCatalog(),
    loadCatalogHashIndex(),
    buildCollectibleHrefByItemHash("/exotics"),
  ]);

  const ownership = (item: ExoticItem) => {
    const catalogItem = catalogByHash.get(item.itemHash);
    return {
      catalogItem,
      hashes: catalogItem ? collectAllLootItemHashes(catalogItem) : [item.itemHash],
    };
  };

  const catalystsByWeapon = new Map<string, typeof catalysts.items>();
  for (const entry of catalysts.items) {
    catalystsByWeapon.set(entry.weaponName, [...(catalystsByWeapon.get(entry.weaponName) ?? []), entry]);
  }

  const weapons = dedupeCollectiblesByName(
    catalog.items.filter((item) => item.category === "weapons" && item.weaponSlot),
  ).map((item): ExoticWeaponEntry => {
    const { catalogItem, hashes } = ownership(item);
    return {
      itemHash: item.itemHash,
      name: item.name,
      iconPath: item.iconPath,
      source: cleanSource(catalogItem?.source ?? item.source),
      slot: item.weaponSlot!,
      weaponType: catalogItem?.classOrWeaponType ?? null,
      damageType: catalogItem?.damageType ?? null,
      ammoType: catalogItem?.ammoType ?? null,
      ownershipHashes: hashes,
      href: hashes.map((hash) => hrefs[hash]).find(Boolean),
      catalysts: (catalystsByWeapon.get(item.name) ?? []).map((catalyst) => ({
        name: catalyst.name,
        iconPath: catalyst.iconPath,
        source: cleanSource(catalyst.source),
        recordHash: catalyst.recordHash,
        // "Insert the Catalyst" is a legacy step, not progress to track.
        objectives: (catalyst.objectives ?? []).filter(
          (objective) => !/^insert the catalyst/i.test(objective.description),
        ),
        ownershipHashes: catalyst.alternateItemHashes,
        effect: catalyst.effect,
      })),
    };
  });

  const armor = dedupeCollectiblesByName(
    catalog.items.filter(
      (item) =>
        (item.category === "hunter" || item.category === "titan" || item.category === "warlock") &&
        item.armorSlot,
    ),
  ).map((item): ExoticArmorEntry => {
    const { catalogItem, hashes } = ownership(item);
    return {
      itemHash: item.itemHash,
      name: item.name,
      iconPath: item.iconPath,
      source: cleanSource(catalogItem?.source ?? item.source),
      guardianClass: item.category as ExoticArmorEntry["guardianClass"],
      armorSlot: item.armorSlot!,
      ownershipHashes: hashes,
      href: hashes.map((hash) => hrefs[hash]).find(Boolean),
    };
  });

  return {
    weapons: weapons.sort((a, b) => a.name.localeCompare(b.name)),
    armor: armor.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Catalysts of one exotic weapon (weapon pages). */
export async function loadCatalystsForWeapon(weaponName: string): Promise<ExoticCatalystEntry[]> {
  const catalysts = await loadCatalystCatalog();
  return catalysts.items
    .filter((catalyst) => catalyst.weaponName === weaponName)
    .map((catalyst) => ({
      name: catalyst.name,
      iconPath: catalyst.iconPath,
      source: cleanSource(catalyst.source),
      recordHash: catalyst.recordHash,
      objectives: (catalyst.objectives ?? []).filter(
        (objective) => !/^insert the catalyst/i.test(objective.description),
      ),
      ownershipHashes: catalyst.alternateItemHashes,
      effect: catalyst.effect,
    }));
}
