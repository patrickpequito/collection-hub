import { NextResponse } from "next/server";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { fetchWeaponRollInstances } from "@/lib/destiny-inventory";
import { getSession } from "@/lib/session";
import {
  mergeAegisEntriesForWeaponPage,
  scoreAegisRoll,
} from "@/lib/weapons/aegis-roll-scoring";
import { loadWeaponAegisRollIndex } from "@/lib/weapons/aegis-rolls";
import {
  loadWeaponGodRollIndex,
  resolveGodRollForItemHash,
  resolveWeaponGodRoll,
} from "@/lib/weapons/god-rolls";
import { getWeaponBySlug } from "@/lib/weapons/lookup";
import { collectWeaponPageItemHashes } from "@/lib/weapons/page-hashes";
import {
  compareWeaponRollsByPveThenPvp,
  rankWeaponRolls,
  scoreWeaponRoll,
} from "@/lib/weapons/roll-scoring";
import {
  filterEquippedWeaponPerkHashes,
  resolveWeaponPerkColumnsForHash,
  resolveWeaponRawPerkColumnsForHash,
} from "@/lib/weapons/perks";
import { resolveWeaponVersionForHash } from "@/lib/weapons/version-for-hash";
import type { WeaponRollInstance } from "@/types/weapon-rolls";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const weapon = await getWeaponBySlug(slug);

  if (!weapon) {
    return NextResponse.json(
      { rolls: [], error: "Weapon not found" },
      { status: 404 },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ rolls: [], error: "Not signed in" });
  }

  try {
    const [instances, godRollIndex, aegisRollIndex, catalog] =
      await Promise.all([
        fetchWeaponRollInstances(session, collectWeaponPageItemHashes(weapon)),
        loadWeaponGodRollIndex(),
        loadWeaponAegisRollIndex(),
        loadAllLootCatalog(),
      ]);

    const aegisEntry = mergeAegisEntriesForWeaponPage(weapon, aegisRollIndex);
    const plugIndex = catalog.plugIndex ?? {};

    const scoredRolls = instances.map((instance) => {
      const instanceGodRoll =
        resolveGodRollForItemHash(instance.itemHash, godRollIndex) ??
        resolveWeaponGodRoll(weapon, godRollIndex);

      const perkColumns = resolveWeaponPerkColumnsForHash(
        weapon,
        instance.itemHash,
        plugIndex,
      );
      const rawPerkColumns = resolveWeaponRawPerkColumnsForHash(
        weapon,
        instance.itemHash,
      );
      const equippedWeaponPerkHashes = filterEquippedWeaponPerkHashes(
        instance.equippedPlugHashes,
        weapon,
        plugIndex,
      );

      const aegisResult = scoreAegisRoll(
        instance.equippedPlugHashes,
        rawPerkColumns ?? weapon.perkColumns,
        aegisEntry,
        plugIndex,
      );

      const { tier, ...aegis } = aegisResult;

      return {
        ...instance,
        equippedWeaponPerkHashes,
        version: resolveWeaponVersionForHash(weapon, instance.itemHash),
        tier,
        aegis,
        scores: scoreWeaponRoll(
          instance.equippedPlugHashes,
          instanceGodRoll,
          { columns: perkColumns, plugIndex },
        ),
      };
    });

    const rolls: WeaponRollInstance[] = rankWeaponRolls(scoredRolls).sort(
      compareWeaponRollsByPveThenPvp,
    );

    return NextResponse.json({ rolls, error: null });
  } catch (error) {
    return NextResponse.json({
      rolls: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to load weapon rolls",
    });
  }
}
