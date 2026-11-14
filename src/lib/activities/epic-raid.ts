import type { ActivityArmorRow } from "@/types/activity-loot";

/** Epic Raid loot (The Desert Perpetual) is told apart by its source: `"…" Epic Raid`. */
export function isEpicRaidItem(item: { source?: string | null }): boolean {
  return /epic raid/i.test(item.source ?? "");
}

export function isEpicRaidRow(row: ActivityArmorRow): boolean {
  return Object.values(row.pieces).some((piece) => piece && isEpicRaidItem(piece));
}

/** Epic armor preview: `{slug}-epic.webp` unless the page names its own. */
export function epicArmorPreviewFile(page: { slug: string; epicArmorSetPreviewFiles?: string[] }): string {
  return page.epicArmorSetPreviewFiles?.[0] ?? `${page.slug}-epic.webp`;
}
