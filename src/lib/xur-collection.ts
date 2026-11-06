import { loadExoticsPageData, type ExoticCatalystEntry } from "@/lib/exotics/page-data";
import type { XurData } from "@/lib/xur";

/** Item page link + ownership hashes for one of Xûr's items, keyed by its name. */
export type XurCollectionEntry = {
  href?: string;
  ownershipHashes: string[];
  /** Catalysts only: the weapon's catalysts, to read found / unlocked state. */
  catalysts?: Pick<ExoticCatalystEntry, "recordHash" | "objectives" | "ownershipHashes">[];
};
export type XurCollection = Record<string, XurCollectionEntry>;

/** Links and ownership data for this weekend's stock (catalysts link to their weapon). */
export async function loadXurCollection(xur: XurData): Promise<XurCollection> {
  const { weapons, armor } = await loadExoticsPageData("/");
  const weaponByName = new Map(weapons.map((weapon) => [weapon.name, weapon]));
  const armorByName = new Map(armor.map((piece) => [piece.name, piece]));
  const collection: XurCollection = {};

  for (const piece of xur.armor) {
    const entry = armorByName.get(piece.name);
    if (entry) collection[piece.name] = { href: entry.href, ownershipHashes: entry.ownershipHashes };
  }
  for (const item of [...(xur.gear?.weapons ?? []), ...(xur.gear?.catalysts ?? [])]) {
    const weapon = weaponByName.get(item.name);
    if (!weapon) continue;
    collection[item.name] = {
      href: weapon.href,
      ownershipHashes: weapon.ownershipHashes,
      catalysts: weapon.catalysts.map(({ recordHash, objectives, ownershipHashes }) => ({ recordHash, objectives, ownershipHashes })),
    };
  }
  return collection;
}
