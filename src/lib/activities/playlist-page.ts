import { formatShortDay } from "@/lib/activities/playlists";
import type { LootItem } from "@/types/activity-loot";

/** Each item counts once, owned through any of its version hashes. */
export const ownershipGroups = (items: LootItem[]) =>
  items.map((item) => item.ownershipHashes ?? [item.itemHash]);

/** Flatten armor rows / legacy groups into their pieces. */
export const armorPieces = (rows: { pieces: Record<string, LootItem | undefined> }[]) =>
  rows.flatMap((row) => Object.values(row.pieces).filter((piece): piece is LootItem => Boolean(piece)));

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Trials header badge: weekend window Friday reset → Tuesday reset, paused on Iron Banner weeks. */
export function trialsHeaderBadge(
  featuredMaps: { weekStart: string; weekEnd: string; source: string },
  nowMs = Date.now(),
): string {
  if (featuredMaps.source === "iron-banner") return "Paused for Iron Banner";
  const startMs = Date.parse(featuredMaps.weekStart);
  const endMs = Date.parse(featuredMaps.weekEnd);
  if (nowMs >= startMs && nowMs < endMs) return `Live until ${formatShortDay(endMs)}`;
  return `Next: ${formatShortDay(nowMs < startMs ? startMs : startMs + MS_PER_WEEK)}`;
}
