import { NextResponse } from "next/server";
import { isItemOwned } from "@/lib/all-loot/ownership";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { getFreshSession } from "@/lib/session-access";
import type { AllLootItem } from "@/types/all-loot";

const NO_STORE = { "Cache-Control": "private, no-store" };

const COSMETIC_TYPES = new Set([
  "Ship",
  "Sparrow",
  "Ghost Shell",
  "Emblem",
  "Shader",
  "Emote",
  "Ghost Projection",
  "Transmat Effect",
]);

export type CollectionSummaryEntry = { owned: number | null; total: number };
export type CollectionSummary = Record<
  "collection" | "weapons" | "armor" | "cosmetics",
  CollectionSummaryEntry
>;

function summarize(items: AllLootItem[], owned: Set<string> | null): CollectionSummaryEntry {
  return {
    owned: owned ? items.filter((item) => isItemOwned(item, owned)).length : null,
    total: items.length,
  };
}

/** Loot Collector header blocks: owned / total for the whole catalog and by category. */
export async function GET() {
  const catalog = await loadAllLootCatalog();
  const session = await getFreshSession();
  let owned: Set<string> | null = null;
  if (session) {
    try {
      owned = await fetchOwnedItemHashes(session);
    } catch (error) {
      console.warn(
        "Collection summary inventory failed:",
        error instanceof Error ? error.message.slice(0, 300) : error,
      );
    }
  }

  const summary: CollectionSummary = {
    collection: summarize(catalog.items, owned),
    weapons: summarize(catalog.items.filter((item) => item.type === "Weapon"), owned),
    armor: summarize(catalog.items.filter((item) => item.type === "Armor"), owned),
    cosmetics: summarize(catalog.items.filter((item) => COSMETIC_TYPES.has(item.type)), owned),
  };
  return NextResponse.json({ summary }, { headers: NO_STORE });
}
