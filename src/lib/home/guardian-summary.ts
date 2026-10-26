import {
  activityLootProgress,
  buildOwnsHash,
  isCatalogItemOwned,
  type ActivityLootProgress,
  type Progress,
} from "@/lib/activities/loot-progress";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadCollections, type CollectionGroup } from "@/lib/collections/load";
import type { BungieUserSession } from "@/lib/bungie";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { fetchRecordInstances } from "@/lib/destiny-records";
import { getBungieApiKey } from "@/lib/env";
import { loadFeaturedActivities } from "@/lib/rad-loot/featured-activities";
import { loadTriumphCatalog } from "@/lib/triumphs/load";
import {
  countTitleProgress,
  getTitleCompletionTier,
  progressPercent,
  splitTitleRecords,
} from "@/lib/triumphs/record-progress";
import type { LootItem } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import type { GuardianClass } from "@/types/armor-set";
import type { RecordInstance } from "@/types/triumph";

const BUNGIE_ORIGIN = "https://www.bungie.net";
const CLOSEST_TITLES_COUNT = 3;

export type { Progress };

export type GuardianCharacter = {
  characterId: string;
  guardianClass: GuardianClass;
  light: number | null;
  emblemPath: string | null;
  emblemBackgroundPath: string | null;
  /** Light emblem art: text goes dark with a light shadow to stay readable. */
  lightEmblem: boolean;
};

export type FeaturedProgress = ActivityLootProgress;

export type HomeGuardian = {
  bungieCode: string | null;
  /** Equipped title of the most recently played character. */
  title: string | null;
  clan: { name: string; callsign: string; onlineCount: number } | null;
  emblem: { iconPath: string | null; backgroundPath: string | null; overlayPath: string | null };
};

export type AlmostCompleteBadge = {
  slug: string;
  name: string;
  iconPath: string;
  /** Owned share per class, 0–100. */
  classes: Record<GuardianClass, number>;
};

export type GuardianSummary = {
  displayName: string;
  guardian: HomeGuardian;
  /** Collections badges: complete with one class, gilded with all three. */
  badges: { completed: number; gilded: number; total: number; almost: AlmostCompleteBadge[] };
  /** Characters, most recently played first. */
  characters: GuardianCharacter[];
  triumphScore: number | null;
  collection: Progress;
  exotics: Progress;
  shaders: Progress;
  titles: Progress;
  closestTitles: {
    slug: string;
    name: string;
    iconPath: string;
    /** "title" = earning the seal; "gild" = gilding an earned seal. */
    goal: "title" | "gild";
    completed: number;
    total: number;
  }[];
  /** Every current title's progress, so pinned titles can be shown on Home (done = nothing left to do). */
  titleProgress: {
    slug: string;
    name: string;
    iconPath: string;
    goal: "title" | "gild";
    completed: number;
    total: number;
    done: boolean;
  }[];
  /** Weapons + per-class armor owned per featured raid / dungeon slug. */
  featured: Record<string, FeaturedProgress>;
};

type ProfileSummaryResponse = {
  profile?: { data?: { userInfo?: { bungieGlobalDisplayNameCode?: number } } };
  characters?: {
    data?: Record<
      string,
      {
        dateLastPlayed?: string;
        classType?: number;
        light?: number;
        emblemPath?: string;
        emblemBackgroundPath?: string;
        emblemColor?: { red: number; green: number; blue: number };
        emblemHash?: number;
        titleRecordHash?: number;
      }
    >;
  };
  profileRecords?: {
    data?: { activeScore?: number; lifetimeScore?: number; score?: number };
  };
};

export async function fetchProfileSummary(
  session: BungieUserSession,
): Promise<ProfileSummaryResponse | null> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;
  const response = await fetch(
    `${BUNGIE_ORIGIN}/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=100,200,900`,
    {
      headers: {
        "X-API-Key": getBungieApiKey(),
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    },
  );
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    ErrorCode: number;
    Response: ProfileSummaryResponse;
  };
  return payload.ErrorCode === 1 ? payload.Response : null;
}

const CLASS_BY_TYPE: Record<number, GuardianClass> = {
  0: "titan",
  1: "hunter",
  2: "warlock",
};

/** WCAG relative luminance of Bungie's dominant emblem colour (0–1). */
function emblemLuminance(color?: { red: number; green: number; blue: number }): number {
  if (!color) return 0;
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.red) + 0.7152 * channel(color.green) + 0.0722 * channel(color.blue);
}

/** Above this, white text loses contrast against the emblem. */
const LIGHT_EMBLEM_LUMINANCE = 0.4;

export function parseCharacters(profile: ProfileSummaryResponse | null): GuardianCharacter[] {
  return Object.entries(profile?.characters?.data ?? {})
    .sort(
      ([, a], [, b]) =>
        Date.parse(b.dateLastPlayed ?? "0") - Date.parse(a.dateLastPlayed ?? "0"),
    )
    .flatMap(([characterId, character]) => {
      const guardianClass = CLASS_BY_TYPE[character.classType ?? -1];
      if (!guardianClass) return [];
      return [
        {
          characterId,
          guardianClass,
          light: character.light ?? null,
          emblemPath: character.emblemPath ?? null,
          emblemBackgroundPath: character.emblemBackgroundPath ?? null,
          lightEmblem: emblemLuminance(character.emblemColor) > LIGHT_EMBLEM_LUMINANCE,
        },
      ];
    });
}

function countOwned(items: AllLootItem[], owned: Set<string>): Progress {
  return {
    owned: items.filter((item) => isCatalogItemOwned(item, owned)).length,
    total: items.length,
  };
}

/**
 * Titles worth chasing next: not yet earned, or earned but still gildable.
 * Earned-and-not-gildable and already-gilded titles are hidden. Event titles
 * are skipped because their progress can't be continued once the event ends.
 */
function closestTitles(
  titles: Awaited<ReturnType<typeof loadTriumphCatalog>>["titles"],
  instances: Map<string, RecordInstance>,
): GuardianSummary["closestTitles"] {
  const candidates: (GuardianSummary["closestTitles"][number] & { percent: number })[] =
    [];

  for (const title of titles) {
    if (title.isSeasonal) continue;
    const tier = getTitleCompletionTier(title, instances);
    const progress = countTitleProgress(title, instances);
    const { gildingRecords } = splitTitleRecords(title.records);
    const gildable = gildingRecords.length > 0 || title.gildingTrackingRecordHash !== null;

    if (tier === "none") {
      if (progress.base.total === 0) continue;
      candidates.push({
        slug: title.slug,
        name: title.name,
        iconPath: title.iconPath,
        goal: "title",
        completed: progress.base.completed,
        total: progress.base.total,
        percent: progressPercent(progress.base),
      });
    } else if (tier === "base" && gildable && progress.gilding.total > 0) {
      candidates.push({
        slug: title.slug,
        name: title.name,
        iconPath: title.iconPath,
        goal: "gild",
        completed: progress.gilding.completed,
        total: progress.gilding.total,
        percent: progressPercent(progress.gilding),
      });
    }
  }

  return candidates
    .sort((a, b) => b.percent - a.percent || b.completed - a.completed)
    .slice(0, CLOSEST_TITLES_COUNT)
    .map((candidate) => ({
      slug: candidate.slug,
      name: candidate.name,
      iconPath: candidate.iconPath,
      goal: candidate.goal,
      completed: candidate.completed,
      total: candidate.total,
    }));
}

/** Progress toward each title's next goal: earn it, then gild it (when gildable). */
function titleProgress(
  titles: Awaited<ReturnType<typeof loadTriumphCatalog>>["titles"],
  instances: Map<string, RecordInstance>,
): GuardianSummary["titleProgress"] {
  return titles.map((title) => {
    const tier = getTitleCompletionTier(title, instances);
    const progress = countTitleProgress(title, instances);
    const chasingGild = tier !== "none" && progress.gilding.total > 0;
    const step = chasingGild ? progress.gilding : progress.base;
    return {
      slug: title.slug,
      name: title.name,
      iconPath: title.iconPath,
      goal: chasingGild ? "gild" : "title",
      completed: tier === "gilded" ? step.total : step.completed,
      total: step.total,
      done: tier === "gilded" || (tier === "base" && progress.gilding.total === 0),
    };
  });
}

async function bungieGetOrNull<T>(pathName: string, accessToken: string): Promise<T | null> {
  try {
    const response = await fetch(`${BUNGIE_ORIGIN}/Platform${pathName}`, {
      headers: { "X-API-Key": getBungieApiKey(), Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { ErrorCode: number; Response: T };
    return payload.ErrorCode === 1 ? payload.Response : null;
  } catch {
    return null;
  }
}

/** Clan name and how many clanmates are online right now. */
async function loadClan(session: BungieUserSession): Promise<HomeGuardian["clan"]> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;
  const groups = await bungieGetOrNull<{
    results?: { group?: { groupId?: string; name?: string; clanInfo?: { clanCallsign?: string } } }[];
  }>(`/GroupV2/User/${membership.membershipType}/${membership.membershipId}/0/1/`, session.accessToken);
  const group = groups?.results?.[0]?.group;
  if (!group?.groupId || !group.name) return null;
  const members = await bungieGetOrNull<{ results?: { isOnline?: boolean; destinyUserInfo?: { membershipId?: string } }[] }>(
    `/GroupV2/${group.groupId}/Members/?currentpage=1`,
    session.accessToken,
  );
  const onlineCount = (members?.results ?? []).filter(
    (member) => member.isOnline && member.destinyUserInfo?.membershipId !== membership.membershipId,
  ).length;
  return { name: group.name, callsign: group.clanInfo?.clanCallsign ?? "", onlineCount };
}

const ALMOST_COMPLETE_COUNT = 3;

/** Badge completion counts and the not-yet-gilded badges closest to their next class. */
function badgeProgress(collections: CollectionGroup[], owned: Set<string>): GuardianSummary["badges"] {
  const owns = (item: LootItem) => (item.ownershipHashes ?? [item.itemHash]).some((hash) => owned.has(hash));
  let completed = 0;
  let gilded = 0;
  const candidates: (AlmostCompleteBadge & { score: number })[] = [];
  const entries = collections.flatMap((group) => group.entries);
  for (const entry of entries) {
    const classes = Object.fromEntries(
      (["hunter", "titan", "warlock"] as GuardianClass[]).map((guardianClass) => {
        const items = [...entry.weapons, ...entry.other, ...entry.classItems[guardianClass]];
        return [guardianClass, items.length ? Math.round((items.filter(owns).length / items.length) * 100) : 0];
      }),
    ) as Record<GuardianClass, number>;
    const values = Object.values(classes);
    const full = values.filter((value) => value >= 100).length;
    if (full > 0) completed += 1;
    if (full === 3) {
      gilded += 1;
      continue;
    }
    const nextClass = Math.max(...values.filter((value) => value < 100));
    if (nextClass > 0) candidates.push({ slug: entry.slug, name: entry.name, iconPath: entry.iconPath, classes, score: nextClass });
  }
  return {
    completed,
    gilded,
    total: entries.length,
    almost: candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, ALMOST_COMPLETE_COUNT)
      .map((candidate) => ({ slug: candidate.slug, name: candidate.name, iconPath: candidate.iconPath, classes: candidate.classes })),
  };
}

/** Everything the signed-in home needs, in one round of Bungie requests. */
export async function loadGuardianSummary(
  session: BungieUserSession,
): Promise<GuardianSummary> {
  const [profile, owned, records, catalog, triumphs, featured, collections, clan] = await Promise.all([
    fetchProfileSummary(session),
    fetchOwnedItemHashes(session),
    fetchRecordInstances(session),
    loadAllLootCatalog(),
    loadTriumphCatalog(),
    loadFeaturedActivities(),
    loadCollections(),
    loadClan(session),
  ]);

  // Equipped title and emblem art of the most recently played character.
  const latest = Object.values(profile?.characters?.data ?? {}).sort(
    (a, b) => Date.parse(b.dateLastPlayed ?? "0") - Date.parse(a.dateLastPlayed ?? "0"),
  )[0];
  const emblem = latest?.emblemHash
    ? await bungieGetOrNull<{ secondarySpecial?: string; secondaryOverlay?: string; displayProperties?: { icon?: string } }>(
        `/Destiny2/Manifest/DestinyInventoryItemDefinition/${latest.emblemHash}/`,
        session.accessToken,
      )
    : null;
  const equippedTitle = latest?.titleRecordHash
    ? triumphs.titles.find((title) => title.completionRecordHash === String(latest.titleRecordHash))?.guardianTitle ?? null
    : null;
  const code = profile?.profile?.data?.userInfo?.bungieGlobalDisplayNameCode;

  const items = catalog.items;
  const ownsHash = buildOwnsHash(items, owned);
  const featuredProgress: Record<string, FeaturedProgress> = {};
  for (const slug of [...featured.featuredRaids, ...featured.featuredDungeons, "the-pantheon"]) {
    const progress = activityLootProgress(slug, ownsHash);
    if (progress) featuredProgress[slug] = progress;
  }

  const permanentTitles = triumphs.titles.filter((title) => !title.isSeasonal);

  return {
    displayName: session.displayName || "Guardian",
    guardian: {
      bungieCode: code !== undefined ? String(code).padStart(4, "0") : null,
      title: equippedTitle,
      clan,
      emblem: {
        iconPath: emblem?.displayProperties?.icon ?? latest?.emblemPath ?? null,
        backgroundPath: emblem?.secondarySpecial ?? latest?.emblemBackgroundPath ?? null,
        overlayPath: emblem?.secondaryOverlay ?? null,
      },
    },
    badges: badgeProgress(collections, owned),
    characters: parseCharacters(profile),
    // Total (lifetime) triumph score: active + legacy, as shown in the game.
    triumphScore:
      profile?.profileRecords?.data?.lifetimeScore ??
      profile?.profileRecords?.data?.score ??
      null,
    collection: countOwned(items, owned),
    exotics: countOwned(
      items.filter(
        (item) =>
          item.rarity === "Exotic" && (item.type === "Weapon" || item.type === "Armor"),
      ),
      owned,
    ),
    shaders: countOwned(
      items.filter((item) => item.type === "Shader"),
      owned,
    ),
    titles: {
      owned: permanentTitles.filter(
        (title) => getTitleCompletionTier(title, records.instances) !== "none",
      ).length,
      total: permanentTitles.length,
    },
    closestTitles: closestTitles(triumphs.titles, records.instances),
    titleProgress: titleProgress(triumphs.titles, records.instances),
    featured: featuredProgress,
  };
}
