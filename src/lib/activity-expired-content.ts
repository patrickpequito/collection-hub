import type { ActivityLootPage } from "@/types/activity-loot";
import type { TriumphRecord } from "@/types/triumph";

/**
 * Moments of Triumph 2020 raid triumphs — same objective as legacy raid triumphs but
 * separate records tied to the seasonal event, not the permanent Leviathan tree.
 */
const MOMENTS_OF_TRIUMPH_2020_RAID_RECORD_HASHES = new Set([
  "2266286943", // Leviathan Raid
  "1627755918", // Eater of Worlds Raid
  "3996781284", // Spire of Stars Raid
  "1419480252", // Crown of Sorrow Raid
  "1455741693", // Scourge of the Past Raid
]);

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
  "iron-banner": {
    recordHashes: [
      "1309367942", // Gunnora's Seal (legacy armor collection)
      "2519991248", // Orimund's Taste (legacy weapon collection)
      "1469486982", // Frostmire's Will (legacy Iron Banner challenges)
      "89629611", // Jorum's Howl (legacy armor-equipped matches)
    ],
    lootItemHashes: [],
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
  return records.filter(
    (record) =>
      !MOMENTS_OF_TRIUMPH_2020_RAID_RECORD_HASHES.has(record.recordHash) &&
      !expired.has(record.recordHash),
  );
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
