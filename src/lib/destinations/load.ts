import { buildArmorRowsFromCatalogItems } from "@/lib/activities/armor-rows";
import { groupActivityCosmeticLoot } from "@/lib/activities/cosmetic-loot-sections";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import { summarizeSeal, type SealSummary } from "@/lib/triumphs/hub";
import { getTitleEntry, getTriumphGroup, loadTriumphCatalog } from "@/lib/triumphs/load";
import { collectLeafSections, leafSectionId } from "@/lib/triumphs/sections";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import destinationLoot from "../../../data/destination-loot.json";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { ActivityHubLootSection } from "@/types/activity-hub";
import type { AllLootItem } from "@/types/all-loot";
import type { TriumphCatalog, TriumphRecord } from "@/types/triumph";

const ARMOR_SLOT_WORDS = /\s+\S+$/;

export type DestinationArmorSet = { setName: string; rows: ActivityArmorRow[]; previewFile: string };

export type DestinationTriumphSection = {
  name: string;
  /** Top-level category on the triumph group page ("Activities", "World"…). */
  parent: string;
  href: string;
  records: TriumphRecord[];
};

const POOL_NAMES = destinationLoot.destinations as Record<string, string[]>;
type ReputationStep = { name: string; icon: string | null };
const REPUTATION_TRACKS =
  (destinationLoot as unknown as { reputation?: Record<string, { steps: ReputationStep[] }> }).reputation ?? {};

export type DestinationReputationInfo = { vendor: string; steps: ReputationStep[]; maxRank: number };

/** Vendor reputation track for the destination page (rank names from the manifest). */
export function destinationReputation(destination: Destination): DestinationReputationInfo | null {
  if (!destination.reputation) return null;
  const track = REPUTATION_TRACKS[destination.slug];
  return {
    vendor: destination.reputation.vendor,
    steps: track?.steps ?? [],
    maxRank: destination.reputation.maxRank,
  };
}

/**
 * Destination loot = its engram pool + vendor rewards (data/destination-loot.json,
 * generated from the manifest) + any catalog item whose "Source" names the place.
 */
function destinationItems(items: AllLootItem[], destination: Destination): AllLootItem[] {
  const poolNames = new Set(POOL_NAMES[destination.slug] ?? []);
  const extra = destination.extraItems;
  return items.filter(
    (item) =>
      poolNames.has(item.name) ||
      destination.sourcePattern.test(item.source ?? "") ||
      Boolean(extra && extra.types.includes(item.type) && extra.namePattern.test(item.name)),
  );
}

const newestFirst = (a: LootItem, b: LootItem) =>
  (b.seasonNumber ?? 0) - (a.seasonNumber ?? 0) || a.name.localeCompare(b.name);

/** Destination loot: complete armor sets (rows + preview), weapons, odd armor pieces and cosmetics. */
export async function loadDestinationLoot(destination: Destination) {
  const catalog = await loadAllLootCatalog();
  const items = destinationItems(catalog.items, destination);

  // Armor sets by name ("Wildwood Mask" → "Wildwood"); only full class rows become set rows.
  const armorBySet = new Map<string, AllLootItem[]>();
  for (const item of items.filter((entry) => entry.type === "Armor")) {
    const setName = item.name.replace(ARMOR_SLOT_WORDS, "");
    armorBySet.set(setName, [...(armorBySet.get(setName) ?? []), item]);
  }
  const armorSets: DestinationArmorSet[] = [];
  const looseArmor: LootItem[] = [];
  for (const [setName, setItems] of armorBySet) {
    const rows = buildArmorRowsFromCatalogItems(setItems, setName);
    if (rows.length) {
      armorSets.push({ setName, rows, previewFile: resolveArmorSetPreviewFile(setName, setItems[0]?.source ?? "") });
    } else {
      looseArmor.push(...setItems.map(toLootItemFromCatalog));
    }
  }

  const weapons = items.filter((item) => item.type === "Weapon").map(toLootItemFromCatalog).sort(newestFirst);
  const cosmetics: ActivityHubLootSection[] = groupActivityCosmeticLoot(
    items.filter((item) => item.type !== "Weapon" && item.type !== "Armor"),
    toLootItemFromCatalog,
  ).filter((section) => section.items.length > 0);

  return { armorSets, looseArmor, weapons, cosmetics, total: items.length };
}

/** Destination triumphs grouped by subcategory, each linking to its spot on the group page. */
export function destinationTriumphSections(
  catalog: TriumphCatalog,
  destination: Destination,
): DestinationTriumphSection[] {
  if (!destination.triumphs) return [];
  const group = getTriumphGroup(catalog, destination.triumphs.group);
  if (!group) return [];
  const wanted = "sections" in destination.triumphs ? destination.triumphs.sections : null;

  return group.sections.flatMap((section) =>
    collectLeafSections([section])
      .filter((leaf) => !wanted || wanted.some(([top, name]) => top === section.name && name === leaf.name))
      .map((leaf) => ({
        name: wanted ? `${section.name}: ${leaf.name}` : leaf.name,
        parent: section.name,
        href: `/triumphs/group/${group.slug}#${leafSectionId(section.name, leaf.name)}`,
        records: leaf.records,
      })),
  );
}

export function destinationSeal(catalog: TriumphCatalog, destination: Destination): SealSummary | null {
  const title = destination.titleSlug ? getTitleEntry(catalog, destination.titleSlug) : undefined;
  return title ? summarizeSeal(title) : null;
}

export type DestinationCardData = {
  slug: string;
  name: string;
  era: string;
  imageUrl: string;
  /** Destination glyph (its triumph group icon). */
  iconPath: string | null;
  reputationVendor: string | null;
  built: boolean;
  vaulted: boolean;
  lootGroups: string[][];
  triumphHashes: string[];
  seal: SealSummary | null;
};

/** Light per-destination data for the index (ownership hashes, triumph hashes, seal). */
export async function loadDestinationsIndex(): Promise<DestinationCardData[]> {
  const [catalog, triumphs] = await Promise.all([loadAllLootCatalog(), loadTriumphCatalog()]);
  return DESTINATIONS.map((destination) => ({
    slug: destination.slug,
    name: destination.name,
    era: destination.era,
    imageUrl: `/images/destinations/${destination.imageFile}`,
    iconPath:
      destination.triumphs && !("sections" in destination.triumphs)
        ? (getTriumphGroup(triumphs, destination.triumphs.group)?.iconPath ?? null)
        : null,
    reputationVendor: destination.reputation?.vendor ?? null,
    built: Boolean(destination.built),
    vaulted: Boolean(destination.vaulted),
    lootGroups: destinationItems(catalog.items, destination).map(
      (item) => toLootItemFromCatalog(item).ownershipHashes ?? [item.itemHash],
    ),
    triumphHashes: destinationTriumphSections(triumphs, destination).flatMap((section) =>
      section.records.map((record) => record.recordHash),
    ),
    seal: destinationSeal(triumphs, destination),
  }));
}
