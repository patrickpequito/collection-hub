import { buildArmorRowsFromCatalogItems } from "@/lib/activities/armor-rows";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadArmorSetBonusCatalog } from "@/lib/armor/set-bonuses";
import { loadArmorSetCollection, type ArmorSetEntry, type ArmorSetOriginGroup } from "@/lib/armor-sets/collection";
import { EFFECT_TAGS, type BonusGuideOrigin, type BonusGuideSet } from "@/lib/armor-sets/bonus-tags";
import type { AllLootItem } from "@/types/all-loot";
import type { GuardianClass } from "@/types/armor-set";

const GROUP_ORDER: (ArmorSetOriginGroup | "other")[] = ["raids", "dungeons", "playlists", "expansions", "seasons", "events", "other"];

function armor30Hashes(item: AllLootItem): string[] {
  const flagged = Object.entries(item.isArmor30ByItemHash ?? {})
    .filter(([, isArmor30]) => isArmor30)
    .map(([hash]) => hash);
  return flagged.length ? flagged : item.isArmor30 ? [item.itemHash] : [];
}

/**
 * Best collection entry for a set: one whose origin matches the pieces' source text,
 * then real armor, then anything that is not world loot.
 */
function pickEntry(entries: ArmorSetEntry[], source: string): ArmorSetEntry | undefined {
  const lower = source.toLowerCase();
  return (
    entries.find((entry) => lower.includes(entry.originLabel.split(" · ")[0].toLowerCase())) ??
    entries.find((entry) => entry.kind === "armor" && !entry.worldLoot) ??
    entries.find((entry) => !entry.worldLoot) ??
    entries[0]
  );
}

/** Origin for sets the Armor sets page does not place yet. */
function fallbackOrigin(source: string): BonusGuideOrigin {
  if (/sparrow racing league/i.test(source)) {
    return { group: "playlists", label: "Sparrow Racing League · Playlist", href: "/activities/sparrow-racing-league" };
  }
  if (/solstice/i.test(source)) return { group: "events", label: "Solstice · Event" };
  if (!source || /random perks/i.test(source)) return { group: "other", label: "World loot" };
  return { group: "other", label: source.replace(/^Source: /, "") };
}

/** Every armor set with a set bonus, with origin, tags and the hashes that count for wearing it. */
export async function loadBonusGuideSets(): Promise<BonusGuideSet[]> {
  const [bonusCatalog, catalog, collection] = await Promise.all([
    loadArmorSetBonusCatalog(),
    loadAllLootCatalog(),
    loadArmorSetCollection(),
  ]);

  const armorBySet = new Map<string, AllLootItem[]>();
  for (const item of catalog.items) {
    if (item.type !== "Armor" || !item.equipableItemSetHash) continue;
    armorBySet.set(item.equipableItemSetHash, [...(armorBySet.get(item.equipableItemSetHash) ?? []), item]);
  }

  // Collection entries keyed by the set hash of their pieces.
  const setHashByItem = new Map<string, string>();
  for (const [setHash, items] of armorBySet) {
    for (const item of items) {
      for (const hash of [item.itemHash, ...(item.alternateItemHashes ?? []), ...(item.versions ?? []).map((v) => v.itemHash)]) {
        setHashByItem.set(hash, setHash);
      }
    }
  }
  const entriesBySet = new Map<string, ArmorSetEntry[]>();
  for (const entry of collection.sets) {
    const pieces = Object.values(entry.classes).flatMap((slots) => Object.values(slots ?? {}));
    const setHash = pieces.map((piece) => piece && setHashByItem.get(piece.itemHash)).find(Boolean);
    if (setHash) entriesBySet.set(setHash, [...(entriesBySet.get(setHash) ?? []), entry]);
  }

  const sets = Object.entries(bonusCatalog.sets).map(([hash, entry]): BonusGuideSet => {
    const twoPiece = entry.bonuses.find((bonus) => bonus.requiredCount === 2) ?? null;
    const fourPiece = entry.bonuses.find((bonus) => bonus.requiredCount === 4) ?? null;
    const items = armorBySet.get(hash) ?? [];
    const source = items.find((item) => !/random perks/i.test(item.source ?? ""))?.source ?? "";
    const collectionEntry = pickEntry(entriesBySet.get(hash) ?? [], source);
    const rows = buildArmorRowsFromCatalogItems(items, entry.setName);

    const wearHashes: Record<GuardianClass, string[][]> = { hunter: [], titan: [], warlock: [] };
    const byHash = new Map(items.map((item) => [item.itemHash, item]));
    for (const row of rows) {
      wearHashes[row.guardianClass] = Object.values(row.pieces)
        .filter((piece) => piece !== undefined)
        .map((piece) => {
          const item = byHash.get(piece.itemHash);
          return item ? armor30Hashes(item) : [];
        });
    }

    const text = `${twoPiece?.description ?? ""} ${fourPiece?.description ?? ""}`;
    return {
      hash,
      name: entry.setName.replace(/ Set$/, ""),
      origin: collectionEntry
        ? { group: collectionEntry.group, label: collectionEntry.originLabel, href: collectionEntry.href }
        : fallbackOrigin(source),
      previewUrl: collectionEntry?.previewUrl,
      twoPiece,
      fourPiece,
      tags: EFFECT_TAGS.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag),
      monumentReissue: items.some(
        (item) =>
          item.seasonLabel === "Monument of Triumph" ||
          (item.versions ?? []).some((version) => version.seasonLabel === "Monument of Triumph"),
      ),
      rows,
      wearHashes,
    };
  });

  return sets.sort(
    (a, b) => GROUP_ORDER.indexOf(a.origin.group) - GROUP_ORDER.indexOf(b.origin.group) || a.name.localeCompare(b.name),
  );
}
