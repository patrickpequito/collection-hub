import { NextResponse } from "next/server";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { resolveArchetypeFromPlugs } from "@/lib/armor/archetypes";
import {
  resolveBaseArmorStatsByHash,
  resolveIsArmor30ForHash,
} from "@/lib/armor/base-stats";
import { getArmorBySlug } from "@/lib/armor/lookup";
import { collectArmorPageItemHashes } from "@/lib/armor/page-hashes";
import {
  buildArmorRollMetrics,
  rankArmorRolls,
} from "@/lib/armor/roll-scoring";
import {
  armorStatsFromHashMap,
  resolveArmorCatalogStats,
} from "@/lib/armor/stats";
import { resolveArmorVersionForHash } from "@/lib/armor/version-for-hash";
import { fetchArmorRollInstances } from "@/lib/destiny-inventory";
import { compareRollInstancesByRecency } from "@/lib/roll-instance-sort";
import { getSession } from "@/lib/session";
import type { ArmorRollInstance } from "@/types/armor-rolls";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const armor = await getArmorBySlug(slug);

  if (!armor) {
    return NextResponse.json(
      { rolls: [], characters: [], error: "Armor not found" },
      { status: 404 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ rolls: [], characters: [], error: "Not signed in" });
  }

  try {
    const [instancesResult, catalog] = await Promise.all([
      fetchArmorRollInstances(session, collectArmorPageItemHashes(armor)),
      loadAllLootCatalog(),
    ]);

    const { instances, characters } = instancesResult;

    const plugIndex = catalog.plugIndex ?? {};
    const baseStats = resolveArmorCatalogStats(armor);

    const scoredRolls = instances.map((instance) => {
      const baseStatsByHash = resolveBaseArmorStatsByHash(
        armor,
        instance,
        plugIndex,
      );
      const stats = armorStatsFromHashMap(baseStatsByHash, baseStats);
      const archetype = resolveArchetypeFromPlugs(
        instance.equippedPlugHashes,
        plugIndex,
      );
      const isArmor30 = resolveIsArmor30ForHash(armor, instance.itemHash);
      const tier = isArmor30 ? instance.gearTier : null;
      const metrics = buildArmorRollMetrics(
        stats,
        archetype?.name ?? null,
        tier,
      );

      return {
        itemInstanceId: instance.itemInstanceId,
        itemHash: instance.itemHash,
        location: instance.location,
        characterId: instance.characterId,
        version: resolveArmorVersionForHash(armor, instance.itemHash),
        stats,
        defense: instance.defense,
        ...metrics,
        archetypeIconPath: archetype?.iconPath ?? null,
      };
    });

    const rolls: ArmorRollInstance[] = rankArmorRolls(scoredRolls).sort(
      compareRollInstancesByRecency,
    );

    return NextResponse.json({ rolls, characters, error: null });
  } catch (error) {
    return NextResponse.json({
      rolls: [],
      characters: [],
      error:
        error instanceof Error ? error.message : "Failed to load armor rolls",
    });
  }
}
