import { buildArmorRowsFromCatalogItems, buildPartialArmorRowsFromCatalogItems } from "@/lib/activities/armor-rows";
import { groupActivityCosmeticLoot } from "@/lib/activities/cosmetic-loot-sections";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { SPARROW_RACING_LEAGUE_HUB, SRL_ORNAMENT_SETS } from "@/data/activities/sparrow-racing-league";

const isSrlSource = (source = "") => /sparrow racing league/i.test(source);

/** SRL loot straight from the catalog: Circuit armor, weapons and cosmetics. */
export async function resolveSparrowRacingLeagueLoot() {
  const catalog = await loadAllLootCatalog();
  const items = catalog.items.filter((item) => isSrlSource(item.source));
  const armor = items.filter((item) => item.type === "Armor");
  const ornaments = catalog.items.filter(
    (item) => item.type === "Ornament" && /monument of triumph/i.test(item.source ?? ""),
  );
  return {
    ornamentSets: SRL_ORNAMENT_SETS.map((set) => ({
      name: set.name,
      triumph: set.triumph,
      rows: buildPartialArmorRowsFromCatalogItems(
        ornaments.filter((item) => set.pattern.test(item.name)),
        set.name,
      ),
    })).filter((set) => set.rows.length > 0),
    armorRows: buildArmorRowsFromCatalogItems(armor, SPARROW_RACING_LEAGUE_HUB.armorSetName),
    weapons: items
      .filter((item) => item.type === "Weapon")
      .map(toLootItemFromCatalog)
      .sort((a, b) => a.name.localeCompare(b.name)),
    cosmetics: groupActivityCosmeticLoot(
      items.filter((item) => item.type !== "Armor" && item.type !== "Weapon"),
      toLootItemFromCatalog,
    ),
  };
}
