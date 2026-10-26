import { existsSync } from "node:fs";
import path from "node:path";
import { buildArmorRowsFromCatalogItems, buildPartialArmorRowsFromCatalogItems } from "@/lib/activities/armor-rows";
import { loadArmorSetBonusCatalog } from "@/lib/armor/set-bonuses";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { armorSetPreviewUrl, resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import { collectAllLootItemHashes } from "@/lib/all-loot/item-hashes";
import {
  MONUMENT_COSMETIC_TYPES,
  MONUMENT_EXTRA_ITEMS,
  MONUMENT_EXTRA_REWARD_HASHES,
  MONUMENT_REWARDS_PASS_ITEM_HASHES,
  MONUMENT_REWARDS_PASS_SETS,
  MONUMENT_SOURCE,
  MONUMENT_ARMOR_SETS,
  MONUMENT_ORNAMENT_SETS,
  MONUMENT_SINGLE_ORNAMENTS,
} from "@/data/activities/monument-of-triumph";
import type { ActivityHubLootSection } from "@/types/activity-hub";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import type { GuardianClass } from "@/types/armor-set";

const MONUMENT = "Monument of Triumph";

/** Ornament outside a set (helmet or exotic piece), with the slot it goes on. */
export type MonumentSingleOrnament = LootItem & { slotLabel: string };

export type MonumentOrnamentSet = {
  name: string;
  rows: ActivityArmorRow[];
  previewFile: string;
  hasPreview: boolean;
  /** Per-class set names (one set, one preview). */
  classNames?: Record<GuardianClass, string>;
};

const hasPreviewFile = (file: string) => existsSync(path.join(process.cwd(), "public", armorSetPreviewUrl(file)));

/** Has a release before Monument of Triumph (a reissue rather than new gear). */
const hasOlderVersion = (item: AllLootItem) =>
  Boolean(item.versions?.some((version) => version.seasonLabel !== MONUMENT));

const CLASS_NAMES = new Set(["Hunter", "Titan", "Warlock"]);

const isMonumentSource = (source = "") => source === "" || /^Source: Monument of Triumph$/i.test(source);

/** Everything the Monument of Triumph page shows, straight from the catalog. */
export async function resolveMonumentOfTriumph() {
  const [catalog, bonusCatalog] = await Promise.all([loadAllLootCatalog(), loadArmorSetBonusCatalog()]);
  const monumentItems = catalog.items.filter(
    (item) => item.seasonLabel === MONUMENT && isMonumentSource(item.source),
  );
  const ornaments = catalog.items.filter((item) => item.type === "Ornament");
  const buildOrnamentSets = (sets: typeof MONUMENT_ORNAMENT_SETS): MonumentOrnamentSet[] =>
    sets
      .map((set) => ({
        name: set.name,
        classNames: set.classNames,
        previewFile: resolveArmorSetPreviewFile(set.name),
        hasPreview: hasPreviewFile(resolveArmorSetPreviewFile(set.name)),
        rows: buildPartialArmorRowsFromCatalogItems(
          ornaments.filter(
            (item) => set.pattern.test(item.name) && (set.source ?? MONUMENT_SOURCE).test(item.source ?? ""),
          ),
          set.name,
        ),
      }))
      .filter((set) => set.rows.length > 0);
  const singles: Record<GuardianClass, MonumentSingleOrnament[]> = { hunter: [], titan: [], warlock: [] };
  for (const item of ornaments) {
    const guardianClass = item.classOrWeaponType?.toLowerCase() as GuardianClass | undefined;
    const wanted = MONUMENT_SINGLE_ORNAMENTS.some(
      ({ pattern, source }) => pattern.test(item.name) && source.test(item.source ?? ""),
    );
    if (wanted && guardianClass && guardianClass in singles) {
      singles[guardianClass].push({ ...toLootItemFromCatalog(item), slotLabel: item.slot ?? "Helmet" });
    }
  }

  const ornamentSets = buildOrnamentSets(MONUMENT_ORNAMENT_SETS);
  const rewardsPassSets = buildOrnamentSets(MONUMENT_REWARDS_PASS_SETS);

  const armorSets: MonumentOrnamentSet[] = MONUMENT_ARMOR_SETS.map((set) => {
    const name = (bonusCatalog.sets[set.hash]?.setName ?? set.playlist).replace(/ Set$/, "");
    return {
      name,
      rows: buildArmorRowsFromCatalogItems(
        catalog.items.filter((item) => item.type === "Armor" && item.equipableItemSetHash === set.hash),
        name,
      ),
      previewFile: set.previewFile,
      hasPreview: hasPreviewFile(set.previewFile),
    };
  });
  // Monument and Rewards Pass gear (Season: Lawless watermark, listed by hash).
  const passItems = catalog.items.filter(
    (item) => MONUMENT_REWARDS_PASS_ITEM_HASHES.has(item.itemHash) || MONUMENT_EXTRA_REWARD_HASHES.has(item.itemHash),
  );
  const rewardItems = [...monumentItems, ...passItems];

  // New weapons (Fafnir, Hardline Cut, Turncoat…) plus older ones listed on purpose; no reissues.
  const weapons = rewardItems
    .filter(
      (item) =>
        item.type === "Weapon" && (!hasOlderVersion(item) || MONUMENT_EXTRA_REWARD_HASHES.has(item.itemHash)),
    )
    .map(toLootItemFromCatalog)
    .sort((a, b) => a.name.localeCompare(b.name));

  const extraItems: (LootItem & { itemType: string })[] = MONUMENT_EXTRA_ITEMS.map((item) => ({
    ...item,
  }));
  const cosmetics: ActivityHubLootSection[] = MONUMENT_COSMETIC_TYPES.map(({ type, emoteKind, alsoKind, title }) => ({
    title,
    items: [
      ...rewardItems
        .filter(
          (item) =>
            (item.type === type &&
              (type !== "Emote" || (item.emoteKind ?? null) === emoteKind) &&
              // Ornaments here are weapon ornaments (armor ornaments live in the sets).
              (type !== "Ornament" || !CLASS_NAMES.has(item.classOrWeaponType ?? ""))) ||
            (alsoKind !== undefined && item.emoteKind === alsoKind),
        )
        .map(toLootItemFromCatalog),
      ...extraItems.filter((item) => item.itemType === type),
    ].sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((section) => section.items.length > 0);

  const activityGroups = (pattern: RegExp) =>
    catalog.items.filter((item) => pattern.test(item.source ?? "")).map(collectAllLootItemHashes);

  return {
    ornamentSets,
    singles,
    rewardsPassSets,
    armorSets,
    weapons,
    cosmetics,
    activities: {
      srl: activityGroups(/sparrow racing league/i),
      pantheon: activityGroups(/^Source: Pantheon$/i),
    },
  };
}
