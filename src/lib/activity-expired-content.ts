import type { ActivityLootPage } from "@/types/activity-loot";
import type { TriumphRecord } from "@/types/triumph";

/**
 * Time-limited triumphs and their exclusive rewards that can no longer be earned.
 * Activity pages filter these out so the loot list matches what is still obtainable.
 */
const EXPIRED_ACTIVITY_CONTENT: Record<
  string,
  { recordHashes: string[]; lootItemHashes: string[] }
> = {
  "the-desert-perpetual": {
    recordHashes: [
      "2037346146", // Stop the Clock (48h contest)
      "2758399574", // Stop the Clock II (Epic 48h contest)
    ],
    lootItemHashes: [
      "4178714191", // Timeline's Blade (emblem)
      "2565108500", // Fractured Timeline (emblem)
    ],
  },
  equilibrium: {
    recordHashes: [
      "1519202867", // Early Adopter (contest)
    ],
    lootItemHashes: [
      "2680217522", // Dredgen's Descent (emblem)
    ],
  },
};

function expiredRecordHashes(slug: string): Set<string> {
  return new Set(EXPIRED_ACTIVITY_CONTENT[slug]?.recordHashes ?? []);
}

function expiredLootItemHashes(slug: string): Set<string> {
  return new Set(EXPIRED_ACTIVITY_CONTENT[slug]?.lootItemHashes ?? []);
}

export function filterExpiredTriumphRecords(
  slug: string,
  records: TriumphRecord[],
): TriumphRecord[] {
  const expired = expiredRecordHashes(slug);
  if (!expired.size) return records;
  return records.filter((record) => !expired.has(record.recordHash));
}

function filterLootItems<T extends { itemHash: string }>(
  slug: string,
  items: T[],
): T[] {
  const expired = expiredLootItemHashes(slug);
  if (!expired.size) return items;
  return items.filter((item) => !expired.has(item.itemHash));
}

/** Strip expired triumph rewards from an activity loot page (weapons / other / adept). */
export function filterExpiredActivityLoot(
  activity: ActivityLootPage,
): ActivityLootPage {
  const { slug } = activity;
  if (!EXPIRED_ACTIVITY_CONTENT[slug]) return activity;

  return {
    ...activity,
    weapons: filterLootItems(slug, activity.weapons),
    timelostWeapons: filterLootItems(slug, activity.timelostWeapons),
    other: filterLootItems(slug, activity.other),
  };
}
