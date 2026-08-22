import type { ExpansionLoot } from "@/lib/expansions/resolve-expansion-loot";
import type { TitleEntry } from "@/types/triumph";
import type { ExpansionProgressInputs } from "@/lib/expansions/expansion-progress";

function buildLootOwnershipGroups(loot: ExpansionLoot): string[][] {
  const collectionOwnershipGroups = loot.collectionItems.map(
    (item) => item.ownershipHashes ?? [item.itemHash],
  );

  return [
    ...collectionOwnershipGroups,
    ...loot.exoticItems.map((item) => item.ownershipHashes ?? [item.itemHash]),
    ...loot.destinationWeapons.map(
      (item) => item.ownershipHashes ?? [item.itemHash],
    ),
    ...loot.deepLootPools.flatMap((pool) => [
      ...pool.armorGroups.flatMap((group) =>
        group.rows.flatMap((row) =>
          Object.values(row.pieces)
            .filter(Boolean)
            .map((piece) => piece!.ownershipHashes ?? [piece!.itemHash]),
        ),
      ),
      ...pool.weapons.map((item) => item.ownershipHashes ?? [item.itemHash]),
      ...pool.otherSections.flatMap((section) =>
        section.items.map((item) => item.ownershipHashes ?? [item.itemHash]),
      ),
    ]),
    ...loot.destinationArmorRows.flatMap((row) =>
      Object.values(row.pieces)
        .filter(Boolean)
        .map((piece) => piece!.ownershipHashes ?? [piece!.itemHash]),
    ),
  ];
}

export function buildExpansionProgressInputs(
  slug: string,
  loot: ExpansionLoot,
  title: TitleEntry | null,
): ExpansionProgressInputs {
  const collectionOwnershipGroups = loot.collectionItems.map(
    (item) => item.ownershipHashes ?? [item.itemHash],
  );
  const lootOwnershipGroups = buildLootOwnershipGroups(loot);

  return {
    slug,
    collectionTotal: loot.collectionItems.length,
    collectionOwnershipGroups,
    title,
    campaignMissions: loot.campaignMissions,
    campaignLegendaryRecordHash: loot.campaignLegendaryRecordHash,
    campaignQuests: loot.campaignQuests,
    difficultyHunts: loot.difficultyHunts,
    lootTotal: lootOwnershipGroups.length,
    lootOwnershipGroups,
  };
}
