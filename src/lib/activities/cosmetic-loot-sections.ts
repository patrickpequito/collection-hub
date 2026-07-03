import type { ActivityHubLootSection } from "@/types/activity-hub";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";

const COSMETIC_LOOT_SECTIONS = [
  { type: "Emblem", title: "Emblems" },
  { type: "Shader", title: "Shaders" },
  { type: "Ghost Shell", title: "Ghost Shells" },
  { type: "Ship", title: "Ships" },
  { type: "Sparrow", title: "Sparrows" },
] as const;

export function groupActivityCosmeticLoot(
  items: AllLootItem[],
  toLootItem: (item: AllLootItem) => LootItem,
): ActivityHubLootSection[] {
  const byType = new Map<string, LootItem[]>();

  for (const item of items) {
    const bucket = byType.get(item.type) ?? [];
    bucket.push(toLootItem(item));
    byType.set(item.type, bucket);
  }

  return COSMETIC_LOOT_SECTIONS.map(({ type, title }) => ({
    title,
    items: (byType.get(type) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((section) => section.items.length > 0);
}
