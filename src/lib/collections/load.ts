import { readFile } from "node:fs/promises";
import path from "node:path";
import { COLLECTION_GROUPS } from "@/data/collections";
import { toLootItemFromCatalog, toLootItemFromCatalogVersion } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";
import type { GuardianClass } from "@/types/armor-set";

type BadgeFileItem = {
  itemHash: string;
  name: string;
  iconPath: string;
  seasonIconPath?: string;
  itemTypeDisplayName: string;
  rarity: string;
  source: string;
  isWeapon: boolean;
};

type BadgeFile = {
  badges: {
    hash: string;
    name: string;
    iconPath: string;
    classes: Record<GuardianClass, string[]>;
  }[];
  items: Record<string, BadgeFileItem>;
};

export type CollectionEntry = {
  hash: string;
  /** Anchor id (#last-wish). */
  slug: string;
  name: string;
  subtitle?: string;
  href?: string;
  pagePending?: boolean;
  iconPath: string;
  /** Shared by every class. */
  weapons: LootItem[];
  other: LootItem[];
  /** Items only one class gets (armor, class glaives). */
  classItems: Record<GuardianClass, LootItem[]>;
};

export type CollectionGroup = { id: string; title: string; entries: CollectionEntry[] };

const CLASSES: GuardianClass[] = ["hunter", "titan", "warlock"];

const slugify = (name: string) =>
  name
    .replace(/^(Raid|Dungeon): /, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const byRarityThenName = (a: LootItem, b: LootItem) =>
  Number(b.rarity === "Exotic") - Number(a.rarity === "Exotic") || a.name.localeCompare(b.name);

/** Every active Collections badge, grouped as on the page, with catalog items where available. */
export async function loadCollections(): Promise<CollectionGroup[]> {
  const [file, catalog] = await Promise.all([
    readFile(path.join(process.cwd(), "data/badges.json"), "utf8").then((raw) => JSON.parse(raw) as BadgeFile),
    loadAllLootCatalog(),
  ]);

  const catalogByHash = new Map<string, { item: AllLootItem; version?: AllLootItemVersion }>();
  for (const item of catalog.items) {
    for (const version of item.versions ?? []) catalogByHash.set(version.itemHash, { item, version });
    catalogByHash.set(item.itemHash, { item });
  }

  const lootItem = (hash: string): LootItem => {
    const entry = file.items[hash];
    const match = catalogByHash.get(hash);
    if (match) {
      const base = match.version
        ? { ...toLootItemFromCatalogVersion(match.item, match.version), ownershipHashes: collectAllLootItemHashes(match.item) }
        : toLootItemFromCatalog(match.item);
      // The badge's own hash always counts (catalog versions may list other hashes).
      const ownershipHashes = [...new Set([hash, ...(base.ownershipHashes ?? [base.itemHash])])];
      return { ...base, ownershipHashes, itemType: entry.itemTypeDisplayName || base.itemType };
    }
    return {
      itemHash: hash,
      name: entry.name,
      iconPath: entry.iconPath,
      seasonIconPath: entry.seasonIconPath,
      source: entry.source,
      itemType: entry.itemTypeDisplayName,
      rarity: entry.rarity,
      ownershipHashes: [hash],
    };
  };

  const badges = new Map(file.badges.map((badge) => [badge.hash, badge]));

  return COLLECTION_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    entries: group.entries.flatMap((config) => {
      const badge = badges.get(config.hash);
      if (!badge) return [];
      const shared = badge.classes.hunter.filter(
        (hash) => badge.classes.titan.includes(hash) && badge.classes.warlock.includes(hash),
      );
      const sharedSet = new Set(shared);
      const classItems = Object.fromEntries(
        CLASSES.map((guardianClass) => [
          guardianClass,
          badge.classes[guardianClass].filter((hash) => !sharedSet.has(hash)).map(lootItem),
        ]),
      ) as Record<GuardianClass, LootItem[]>;
      return [
        {
          hash: badge.hash,
          slug: slugify(badge.name),
          name: badge.name,
          subtitle: config.subtitle,
          href: config.href,
          pagePending: config.pagePending,
          iconPath: badge.iconPath,
          weapons: shared.filter((hash) => file.items[hash].isWeapon).map(lootItem).sort(byRarityThenName),
          other: shared.filter((hash) => !file.items[hash].isWeapon).map(lootItem),
          classItems,
        },
      ];
    }),
  }));
}
