import { NextResponse } from "next/server";
import { RAD_LOOT_ACTIVITY_PAGES } from "@/data/rad-loot/activity-pages";
import {
  activityLootProgress,
  buildOwnsHash,
  type ActivityLootProgress,
} from "@/lib/activities/loot-progress";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { getFreshSession } from "@/lib/session-access";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Loot owned per raid / dungeon (total, weapons and per-class armor). */
export async function GET() {
  const session = await getFreshSession();
  if (!session) {
    return NextResponse.json({ progress: null, error: null }, { headers: NO_STORE });
  }

  try {
    const [owned, catalog] = await Promise.all([
      fetchOwnedItemHashes(session),
      loadAllLootCatalog(),
    ]);
    const ownsHash = buildOwnsHash(catalog.items, owned);
    const progress: Record<string, ActivityLootProgress> = {};
    for (const slug of Object.keys(RAD_LOOT_ACTIVITY_PAGES)) {
      const entry = activityLootProgress(slug, ownsHash);
      if (entry) progress[slug] = entry;
    }
    return NextResponse.json(
      { progress, error: null },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.warn(
      "Activities progress failed:",
      error instanceof Error ? error.message.slice(0, 300) : error,
    );
    return NextResponse.json(
      { progress: null, error: "Couldn't load your collection right now." },
      { headers: NO_STORE },
    );
  }
}
