import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { AllLootItem } from "@/types/all-loot";
import { collectArmorItemHashes } from "@/lib/armor/item-hashes";
import type {
  ArmorSetBonus,
  ArmorSetBonusCatalog,
} from "@/types/armor-set-bonuses";

async function readArmorSetBonusCatalog(): Promise<ArmorSetBonusCatalog> {
  const filePath = path.join(
    process.cwd(),
    "public/data/armor-set-bonuses.json",
  );
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as ArmorSetBonusCatalog;
}

export const loadArmorSetBonusCatalog = unstable_cache(
  readArmorSetBonusCatalog,
  ["armor-set-bonus-catalog"],
  { revalidate: 60 * 60 },
);

export function resolveEquipableItemSetHash(
  armor: AllLootItem,
  catalog: ArmorSetBonusCatalog,
): string | undefined {
  if (armor.equipableItemSetHash) {
    return armor.equipableItemSetHash;
  }

  const itemHashToSetHash = catalog.itemHashToSetHash ?? {};
  for (const hash of collectArmorItemHashes(armor)) {
    const setHash = itemHashToSetHash[hash];
    if (setHash) return setHash;
  }

  return undefined;
}

export function resolveArmorSetBonuses(
  catalog: ArmorSetBonusCatalog,
  equipableItemSetHash: string | undefined,
): { setName: string; twoPiece: ArmorSetBonus | null; fourPiece: ArmorSetBonus | null } {
  if (!equipableItemSetHash) {
    return { setName: "", twoPiece: null, fourPiece: null };
  }

  const entry = catalog.sets[equipableItemSetHash];
  if (!entry) {
    return { setName: "", twoPiece: null, fourPiece: null };
  }

  const twoPiece =
    entry.bonuses.find((bonus) => bonus.requiredCount === 2) ?? null;
  const fourPiece =
    entry.bonuses.find((bonus) => bonus.requiredCount === 4) ?? null;

  return {
    setName: entry.setName,
    twoPiece,
    fourPiece,
  };
}
