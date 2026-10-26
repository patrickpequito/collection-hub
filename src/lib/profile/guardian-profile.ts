import { readFile } from "node:fs/promises";
import path from "node:path";
import { isCatalogItemOwned } from "@/lib/activities/loot-progress";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import type { BungieUserSession } from "@/lib/bungie";
import { loadCollections } from "@/lib/collections/load";
import { RAID_COMPLETION_ACTIVITY_HASHES } from "@/lib/destiny-activity-stats";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { expandAcquiredItemHashes } from "@/lib/item-acquisition-index";
import { resolveDestinyMembership, type DestinyMembership } from "@/lib/destiny-membership";
import { mergeRecordInstances } from "@/lib/destiny-records";
import { getBungieApiKey } from "@/lib/env";
import { loadTriumphCatalog } from "@/lib/triumphs/load";
import { getTitleCompletionTier } from "@/lib/triumphs/record-progress";
import { buildWeaponHrefByItemHash } from "@/lib/weapons/lookup";
import { DESTINATIONS, destinationImageUrl } from "@/data/destinations";
import { DUNGEONS, LEGACY_RAIDS, PANTHEON, RAIDS, getActivityHref } from "@/data/rad-loot/activities";
import type { ActivityEntry } from "@/types/activity-loot";
import type { AllLootItem } from "@/types/all-loot";
import type { GuardianClass } from "@/types/armor-set";
import type { RecordInstance } from "@/types/triumph";

const BUNGIE_ORIGIN = "https://www.bungie.net";

const CLASS_BY_TYPE: Record<number, GuardianClass> = { 0: "titan", 1: "hunter", 2: "warlock" };
const RACE_BY_TYPE: Record<number, string> = { 0: "Human", 1: "Awoken", 2: "Exo" };
const PLATFORM_BY_TYPE: Record<number, string> = {
  1: "Xbox",
  2: "PlayStation",
  3: "Steam",
  5: "Stadia",
  6: "Epic Games",
};
const GUARDIAN_RANKS = [
  "",
  "New Light",
  "Explorer",
  "Initiate",
  "Scout",
  "Adventurer",
  "Veteran",
  "Elite",
  "Justiciar",
  "Vanquisher",
  "Exemplar",
  "Paragon",
];

/** Bungie DestinyRecordState flag: objectives not yet completed. */
const RECORD_OBJECTIVE_NOT_COMPLETED = 4;

/** "Enemies Defeated" objectives on weapon Kill Tracker plugs (PvE, Crucible, Gambit). */
const KILL_TRACKER_OBJECTIVES = new Set([73837075, 90275515, 2579044636]);

/** Playlists compared for "Favorite playlist" (Bungie activity mode → site page). */
const PLAYLISTS = [
  { mode: 5, key: "allPvP", name: "Crucible", href: "/activities/crucible", image: "/images/headers/crucible-header.webp" },
  { mode: 84, key: "trials_of_osiris", name: "Trials of Osiris", href: "/activities/trials-of-osiris", image: "/images/headers/trials-of-osiris-header.webp" },
  { mode: 19, key: "ironBanner", name: "Iron Banner", href: "/activities/iron-banner", image: "/images/headers/iron-banner-header.webp" },
  { mode: 63, key: "pvecomp_gambit", name: "Gambit", href: "/activities/gambit", image: "/images/headers/gambit-header.webp" },
  { mode: 18, key: "allStrikes", name: "Vanguard Ops", href: "/activities/vanguard-ops", image: "/images/headers/vanguard-ops-header.webp" },
] as const;
/** Extra modes read with the playlists: raids, dungeons, patrol, all PvE. */
const STAT_MODES = [...PLAYLISTS.map((playlist) => playlist.mode), 4, 82, 6, 7];

type StatValues = Record<string, { basic?: { value?: number }; pga?: { value?: number } }>;

type ProfileResponse = {
  profile?: {
    data?: {
      userInfo?: {
        membershipType?: number;
        bungieGlobalDisplayName?: string;
        bungieGlobalDisplayNameCode?: number;
        displayName?: string;
      };
      currentGuardianRank?: number;
      dateLastPlayed?: string;
    };
  };
  characters?: {
    data?: Record<
      string,
      {
        classType?: number;
        raceType?: number;
        light?: number;
        minutesPlayedTotal?: string;
        dateLastPlayed?: string;
        emblemHash?: number;
        emblemPath?: string;
        emblemBackgroundPath?: string;
        titleRecordHash?: number;
      }
    >;
  };
  characterActivities?: {
    data?: Record<string, { currentActivityHash?: number; dateActivityStarted?: string }>;
  };
  profileRecords?: {
    data?: { activeScore?: number; lifetimeScore?: number; legacyScore?: number; records?: Parameters<typeof mergeRecordInstances>[1] };
  };
  characterRecords?: { data?: Record<string, { records?: Parameters<typeof mergeRecordInstances>[1] }> };
  itemComponents?: {
    plugObjectives?: {
      data?: Record<string, { objectivesPerPlug?: Record<string, { objectiveHash: number; progress?: number }[]> }>;
    };
  };
  profileInventory?: { data?: { items?: { itemHash: number; itemInstanceId?: string }[] } };
  profileCollectibles?: { data?: { collectibles?: Record<string, { state: number }> } };
  characterCollectibles?: { data?: Record<string, { collectibles?: Record<string, { state: number }> }> };
  characterInventories?: { data?: Record<string, { items?: { itemHash: number; itemInstanceId?: string }[] }> };
  characterEquipment?: { data?: Record<string, { items?: { itemHash: number; itemInstanceId?: string }[] }> };
};

export type FavoriteEntry = {
  name: string;
  imageUrl: string | null;
  href: string | null;
  clears: number;
  seconds: number;
  /** Fastest clear (ms), raids and dungeons only. */
  fastestMs?: number;
};

export type WeaponFavorite = {
  name: string;
  iconPath: string;
  itemType: string;
  rarity: string;
  kills: number;
  precisionKills?: number;
  href: string | null;
};

export type ClearsRow = {
  slug: string;
  name: string;
  imageUrl: string | null;
  href: string | null;
  clears: number;
  masterClears: number;
  seconds: number;
  fastestMs: number | null;
};

export type ProfileCharacter = {
  characterId: string;
  guardianClass: GuardianClass;
  race: string;
  light: number | null;
  minutesPlayed: number;
  dateLastPlayed: string | null;
  emblemPath: string | null;
  emblemBackgroundPath: string | null;
  title: string | null;
  favoriteExotic: string | null;
};

export type GuardianProfile = {
  bungieName: string;
  bungieCode: string | null;
  platform: string | null;
  guardianRank: { rank: number; name: string } | null;
  dateLastPlayed: string | null;
  online: { activity: string } | null;
  clan: { name: string; callsign: string } | null;
  title: { name: string; gilded: boolean } | null;
  emblem: { iconPath: string | null; backgroundPath: string | null; overlayPath: string | null };
  characters: ProfileCharacter[];
  totals: {
    minutesPlayed: number;
    triumphs: { active: number | null; lifetime: number | null; legacy: number | null };
    seals: { earned: number; gilded: number; total: number };
    collections: { completed: number; gilded: number; total: number };
    raidClears: number;
    dungeonClears: number;
  };
  favorites: {
    raid: { byClears: FavoriteEntry | null; byTime: FavoriteEntry | null };
    dungeon: { byClears: FavoriteEntry | null; byTime: FavoriteEntry | null };
    playlist: { byClears: FavoriteEntry | null; byTime: FavoriteEntry | null };
    patrol: (FavoriteEntry & { publicEvents: number }) | null;
    weapon: WeaponFavorite | null;
    exotic: WeaponFavorite | null;
  };
  facts: {
    raidSeconds: number;
    towerSeconds: number;
    resurrections: number;
    precisionPercent: number | null;
    longestKillDistance: number | null;
    deaths: number;
    secondsPerDeath: number | null;
    publicEvents: number;
    orbsDropped: number;
  };
  clears: { raids: ClearsRow[]; dungeons: ClearsRow[] };
  combat: {
    pve: { kills: number; activitiesCleared: number; precisionPercent: number | null; publicEvents: number; orbsDropped: number };
    pvp: { kd: number | null; kda: number | null; matches: number; wins: number; bestStreak: number; trialsWins: number };
    gambit: { matches: number; wins: number; motesDeposited: number; invaderKills: number; primevalKills: number; blockersSent: number };
  };
  collection: { label: string; owned: number; total: number; href: string }[];
};

type ProfileActivities = { patrol: Record<string, string>; tower: string[]; loreBooks: string[][] };

/** Signed-in calls send the access token; public profiles use the API key alone. */
async function bungieGet<T>(pathName: string, accessToken: string | null): Promise<T> {
  const response = await fetch(`${BUNGIE_ORIGIN}/Platform${pathName}`, {
    headers: {
      "X-API-Key": getBungieApiKey(),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Bungie API error (${response.status})`);
  const data = (await response.json()) as { ErrorCode: number; Message: string; Response: T };
  if (data.ErrorCode !== 1) throw new Error(data.Message || "Unexpected Bungie API response");
  return data.Response;
}

/** Resolves to null instead of failing the whole profile when one Bungie call errors. */
const settle = <T>(promise: Promise<T>) => promise.catch(() => null);

const value = (values: StatValues | undefined, key: string) => values?.[key]?.basic?.value ?? 0;

async function loadProfileActivities(): Promise<ProfileActivities> {
  const raw = await readFile(path.join(process.cwd(), "data/profile-activities.json"), "utf8");
  return JSON.parse(raw) as ProfileActivities;
}

const ALL_ACTIVITIES: { entry: ActivityEntry; kind: "raid" | "dungeon" }[] = [
  ...[PANTHEON, ...RAIDS, ...LEGACY_RAIDS].map((entry) => ({ entry, kind: "raid" as const })),
  ...DUNGEONS.map((entry) => ({ entry, kind: "dungeon" as const })),
];

const activityImage = (entry: ActivityEntry) =>
  entry.imageFile ? `/images/rad-loot/activities/${entry.wideImageFile ?? entry.imageFile}` : null;

function sumValues(target: Record<string, number>, values: StatValues | undefined) {
  for (const [key, stat] of Object.entries(values ?? {})) {
    target[key] = (target[key] ?? 0) + (stat.basic?.value ?? 0);
  }
}

function pickFavorite<T extends { clears: number; seconds: number }>(rows: T[], by: "clears" | "seconds"): T | null {
  const best = [...rows].sort((a, b) => b[by] - a[by])[0];
  return best && best[by] > 0 ? best : null;
}

/** Everything on the signed-in Guardian profile page. */
export async function loadGuardianProfile(session: BungieUserSession): Promise<GuardianProfile | null> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;
  const owned = await fetchOwnedItemHashes(session);
  return loadGuardianProfileFor(membership, { accessToken: session.accessToken, owned, fallbackName: session.displayName });
}

/**
 * Profile for any Destiny membership. Without an access token only public data is read
 * (Bungie privacy settings decide what that includes); `owned` drives collection progress.
 */
export async function loadGuardianProfileFor(
  membership: DestinyMembership,
  { accessToken, owned: knownOwned, fallbackName }: { accessToken: string | null; owned?: Set<string>; fallbackName?: string },
): Promise<GuardianProfile> {
  const token = accessToken;
  const base = `/Destiny2/${membership.membershipType}/Account/${membership.membershipId}`;

  // Without a known owned set (other guardians), Collections come from their public profile.
  const profile = await bungieGet<ProfileResponse>(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=100,102,200,201,204,205,309,900${knownOwned ? "" : ",800"}`,
    token,
  );
  const owned =
    knownOwned ??
    (await expandAcquiredItemHashes({
      inventoryHashes: [
        ...(profile.profileInventory?.data?.items ?? []),
        ...Object.values(profile.characterInventories?.data ?? {}).flatMap((bucket) => bucket.items ?? []),
        ...Object.values(profile.characterEquipment?.data ?? {}).flatMap((bucket) => bucket.items ?? []),
      ].map((item) => String(item.itemHash)),
      collectibles: {
        ...(profile.profileCollectibles?.data?.collectibles ?? {}),
        ...Object.assign({}, ...Object.values(profile.characterCollectibles?.data ?? {}).map((entry) => entry.collectibles ?? {})),
      },
    }));
  const characterIds = Object.keys(profile.characters?.data ?? {});

  const [account, perCharacter, clanResponse, catalog, triumphs, collections, activityMap, weaponHrefs] =
    await Promise.all([
      settle(
        bungieGet<{ mergedAllCharacters?: { results?: Record<string, { allTime?: StatValues }> } }>(`${base}/Stats/`, token),
      ),
      Promise.all(
        characterIds.map(async (characterId) => {
          const [modes, aggregate, unique] = await Promise.all([
            settle(
              bungieGet<Record<string, { allTime?: StatValues }>>(
                `${base}/Character/${characterId}/Stats/?modes=${STAT_MODES.join(",")}&periodType=2`,
                token,
              ),
            ),
            settle(
              bungieGet<{ activities?: { activityHash: number; values?: StatValues }[] }>(
                `${base}/Character/${characterId}/Stats/AggregateActivityStats/`,
                token,
              ),
            ),
            settle(
              bungieGet<{ weapons?: { referenceId: number; values?: StatValues }[] }>(
                `${base}/Character/${characterId}/Stats/UniqueWeapons/`,
                token,
              ),
            ),
          ]);
          return { characterId, modes, aggregate, unique };
        }),
      ),
      settle(
        bungieGet<{ results?: { group?: { name?: string; clanInfo?: { clanCallsign?: string } } }[] }>(
          `/GroupV2/User/${membership.membershipType}/${membership.membershipId}/0/1/`,
          token,
        ),
      ),
      loadAllLootCatalog(),
      loadTriumphCatalog(),
      loadCollections(),
      loadProfileActivities(),
      buildWeaponHrefByItemHash("/profile"),
    ]);

  const recordInstances = new Map<string, RecordInstance>();
  mergeRecordInstances(recordInstances, profile.profileRecords?.data?.records);
  for (const character of Object.values(profile.characterRecords?.data ?? {})) {
    mergeRecordInstances(recordInstances, character.records);
  }

  const catalogByHash = new Map<string, AllLootItem>();
  for (const item of catalog.items) {
    catalogByHash.set(item.itemHash, item);
    for (const version of item.versions ?? []) catalogByHash.set(version.itemHash, item);
  }

  // Characters, most recently played first.
  const characterEntries = Object.entries(profile.characters?.data ?? {}).sort(
    ([, a], [, b]) => Date.parse(b.dateLastPlayed ?? "0") - Date.parse(a.dateLastPlayed ?? "0"),
  );
  const titleByRecord = new Map(
    triumphs.titles.filter((title) => title.completionRecordHash).map((title) => [title.completionRecordHash!, title]),
  );

  // Exotic weapon kills per character (Bungie only tracks lifetime kills for exotics).
  const exoticKills = new Map<number, { kills: number; precision: number }>();
  const topExoticByCharacter = new Map<string, string>();
  for (const { characterId, unique } of perCharacter) {
    let best: { name: string; kills: number } | null = null;
    for (const weapon of unique?.weapons ?? []) {
      const kills = value(weapon.values, "uniqueWeaponKills");
      const total = exoticKills.get(weapon.referenceId) ?? { kills: 0, precision: 0 };
      total.kills += kills;
      total.precision += value(weapon.values, "uniqueWeaponPrecisionKills");
      exoticKills.set(weapon.referenceId, total);
      const name = catalogByHash.get(String(weapon.referenceId))?.name;
      if (name && (!best || kills > best.kills)) best = { name, kills };
    }
    if (best) topExoticByCharacter.set(characterId, best.name);
  }

  const characters: ProfileCharacter[] = characterEntries.flatMap(([characterId, character]) => {
    const guardianClass = CLASS_BY_TYPE[character.classType ?? -1];
    if (!guardianClass) return [];
    const title = character.titleRecordHash ? titleByRecord.get(String(character.titleRecordHash)) : undefined;
    return [
      {
        characterId,
        guardianClass,
        race: RACE_BY_TYPE[character.raceType ?? -1] ?? "",
        light: character.light ?? null,
        minutesPlayed: Number(character.minutesPlayedTotal ?? 0),
        dateLastPlayed: character.dateLastPlayed ?? null,
        emblemPath: character.emblemPath ?? null,
        emblemBackgroundPath: character.emblemBackgroundPath ?? null,
        title: title?.guardianTitle ?? null,
        favoriteExotic: topExoticByCharacter.get(characterId) ?? null,
      },
    ];
  });

  // Equipped title and emblem of the most recently played character.
  const current = characterEntries[0]?.[1];
  const currentTitle = current?.titleRecordHash ? titleByRecord.get(String(current.titleRecordHash)) : undefined;
  const emblemDefinition = current?.emblemHash
    ? await settle(
        bungieGet<{ secondarySpecial?: string; secondaryOverlay?: string; displayProperties?: { icon?: string } }>(
          `/Destiny2/Manifest/DestinyInventoryItemDefinition/${current.emblemHash}/`,
          token,
        ),
      )
    : null;

  // Online: the character currently in an activity.
  const activeActivity = Object.values(profile.characterActivities?.data ?? {}).find(
    (activity) => (activity.currentActivityHash ?? 0) !== 0,
  );
  const onlineActivity = activeActivity
    ? await settle(
        bungieGet<{ displayProperties?: { name?: string } }>(
          `/Destiny2/Manifest/DestinyActivityDefinition/${activeActivity.currentActivityHash}/`,
          token,
        ),
      )
    : null;

  // Activity stats summed over every character.
  const perActivity = new Map<number, { clears: number; seconds: number; fastestMs: number | null }>();
  const modeTotals: Record<string, Record<string, number>> = {};
  for (const { modes, aggregate } of perCharacter) {
    for (const activity of aggregate?.activities ?? []) {
      const entry = perActivity.get(activity.activityHash) ?? { clears: 0, seconds: 0, fastestMs: null };
      entry.clears += value(activity.values, "activityCompletions");
      entry.seconds += value(activity.values, "activitySecondsPlayed");
      const fastest = value(activity.values, "fastestCompletionMsForActivity");
      if (fastest > 0 && (entry.fastestMs === null || fastest < entry.fastestMs)) entry.fastestMs = fastest;
      perActivity.set(activity.activityHash, entry);
    }
    for (const [key, stats] of Object.entries(modes ?? {})) {
      modeTotals[key] ??= {};
      sumValues(modeTotals[key], stats.allTime);
    }
  }

  const clearsFor = (hashes: readonly number[]) => {
    let clears = 0;
    let seconds = 0;
    let fastestMs: number | null = null;
    for (const hash of hashes) {
      const entry = perActivity.get(hash);
      if (!entry) continue;
      clears += entry.clears;
      seconds += entry.seconds;
      if (entry.fastestMs !== null && (fastestMs === null || entry.fastestMs < fastestMs)) fastestMs = entry.fastestMs;
    }
    return { clears, seconds, fastestMs };
  };

  const rows: (ClearsRow & { kind: "raid" | "dungeon" })[] = ALL_ACTIVITIES.flatMap(({ entry, kind }) => {
    const hashes = RAID_COMPLETION_ACTIVITY_HASHES[entry.slug as keyof typeof RAID_COMPLETION_ACTIVITY_HASHES];
    if (!hashes) return [];
    const normal = clearsFor(hashes.normal);
    const master = clearsFor(hashes.master);
    const fastest = [normal.fastestMs, master.fastestMs].filter((ms): ms is number => ms !== null);
    return [
      {
        kind,
        slug: entry.slug,
        name: entry.slug === PANTHEON.slug ? "The Pantheon" : entry.title,
        imageUrl: activityImage(entry),
        href: getActivityHref(entry),
        clears: normal.clears + master.clears,
        masterClears: master.clears,
        seconds: normal.seconds + master.seconds,
        fastestMs: fastest.length ? Math.min(...fastest) : null,
      },
    ];
  });
  const byClears = (a: ClearsRow, b: ClearsRow) => b.clears - a.clears || b.seconds - a.seconds;
  const raids = rows.filter((row) => row.kind === "raid" && row.clears > 0).sort(byClears);
  const dungeons = rows.filter((row) => row.kind === "dungeon" && row.clears > 0).sort(byClears);
  const toFavorite = (row: ClearsRow | null): FavoriteEntry | null =>
    row
      ? { name: row.name, imageUrl: row.imageUrl, href: row.href, clears: row.clears, seconds: row.seconds, fastestMs: row.fastestMs ?? undefined }
      : null;

  // Playlists: Crucible time excludes Trials and Iron Banner (they are counted on their own).
  const playlistRows = PLAYLISTS.map((playlist) => {
    let seconds = modeTotals[playlist.key]?.secondsPlayed ?? 0;
    let clears = modeTotals[playlist.key]?.activitiesEntered ?? 0;
    if (playlist.mode === 5) {
      for (const key of ["trials_of_osiris", "ironBanner"]) {
        seconds -= modeTotals[key]?.secondsPlayed ?? 0;
        clears -= modeTotals[key]?.activitiesEntered ?? 0;
      }
    }
    return { name: playlist.name, imageUrl: playlist.image, href: playlist.href, clears: Math.max(0, clears), seconds: Math.max(0, seconds) };
  });

  // Patrol zones and the Tower.
  const patrolBySlug = new Map<string, { seconds: number; clears: number }>();
  let towerSeconds = 0;
  const towerHashes = new Set(activityMap.tower);
  for (const [hash, entry] of perActivity) {
    if (towerHashes.has(String(hash))) towerSeconds += entry.seconds;
    const slug = activityMap.patrol[String(hash)];
    if (!slug) continue;
    const zone = patrolBySlug.get(slug) ?? { seconds: 0, clears: 0 };
    zone.seconds += entry.seconds;
    zone.clears += entry.clears;
    patrolBySlug.set(slug, zone);
  }
  const allPvE = account?.mergedAllCharacters?.results?.allPvE?.allTime;
  const allPvP = account?.mergedAllCharacters?.results?.allPvP?.allTime;
  const topZone = [...patrolBySlug.entries()].sort((a, b) => b[1].seconds - a[1].seconds)[0];
  const zoneDestination = topZone ? DESTINATIONS.find((destination) => destination.slug === topZone[0]) : undefined;
  const patrol =
    topZone && zoneDestination && topZone[1].seconds > 0
      ? {
          name: zoneDestination.name,
          imageUrl: destinationImageUrl(zoneDestination),
          href: zoneDestination.built ? `/activities/destinations/${zoneDestination.slug}` : null,
          clears: modeTotals.patrol?.activitiesEntered ?? 0,
          seconds: topZone[1].seconds,
          publicEvents: value(allPvE, "publicEventsCompleted"),
        }
      : null;

  // Favorite weapon: highest Kill Tracker among the weapons you hold.
  const instanceToHash = new Map<string, number>();
  const allItems = [
    ...(profile.profileInventory?.data?.items ?? []),
    ...Object.values(profile.characterInventories?.data ?? {}).flatMap((bucket) => bucket.items ?? []),
    ...Object.values(profile.characterEquipment?.data ?? {}).flatMap((bucket) => bucket.items ?? []),
  ];
  for (const item of allItems) if (item.itemInstanceId) instanceToHash.set(item.itemInstanceId, item.itemHash);
  let topTracker: { itemHash: number; kills: number } | null = null;
  for (const [instanceId, entry] of Object.entries(profile.itemComponents?.plugObjectives?.data ?? {})) {
    const itemHash = instanceToHash.get(instanceId);
    if (!itemHash) continue;
    for (const objectives of Object.values(entry.objectivesPerPlug ?? {})) {
      for (const objective of objectives) {
        if (!KILL_TRACKER_OBJECTIVES.has(objective.objectiveHash)) continue;
        const kills = objective.progress ?? 0;
        if (!topTracker || kills > topTracker.kills) topTracker = { itemHash, kills };
      }
    }
  }
  const weaponFavorite = (itemHash: number, kills: number, precisionKills?: number): WeaponFavorite | null => {
    const item = catalogByHash.get(String(itemHash));
    if (!item || item.type !== "Weapon") return null;
    return {
      name: item.name,
      iconPath: item.iconPath,
      itemType: item.classOrWeaponType ?? "Weapon",
      rarity: item.rarity,
      kills,
      precisionKills,
      href: weaponHrefs[String(itemHash)] ?? weaponHrefs[item.itemHash] ?? null,
    };
  };
  const topExotic = [...exoticKills.entries()].sort((a, b) => b[1].kills - a[1].kills)[0];

  // Seals (permanent titles) and Collections badges.
  const sealTitles = triumphs.titles.filter((title) => !title.isSeasonal);
  const tiers = sealTitles.map((title) => getTitleCompletionTier(title, recordInstances));
  const ownsItem = (hashes: string[]) => hashes.some((hash) => owned.has(hash));
  let badgesCompleted = 0;
  let badgesGilded = 0;
  let badgeTotal = 0;
  for (const entry of collections.flatMap((group) => group.entries)) {
    badgeTotal += 1;
    const complete = (["hunter", "titan", "warlock"] as GuardianClass[]).filter((guardianClass) =>
      [...entry.weapons, ...entry.other, ...entry.classItems[guardianClass]].every((item) =>
        ownsItem(item.ownershipHashes ?? [item.itemHash]),
      ),
    ).length;
    if (complete > 0) badgesCompleted += 1;
    if (complete === 3) badgesGilded += 1;
  }

  const countCatalog = (filter: (item: AllLootItem) => boolean) => {
    const items = catalog.items.filter(filter);
    return { owned: items.filter((item) => isCatalogItemOwned(item, owned)).length, total: items.length };
  };

  const pveKills = value(allPvE, "kills");
  const precisionPercent = pveKills > 0 ? Math.round((value(allPvE, "precisionKills") / pveKills) * 100) : null;
  const deaths = value(allPvE, "deaths") + value(allPvP, "deaths");
  const minutesPlayed = characters.reduce((sum, character) => sum + character.minutesPlayed, 0);
  const gambit = modeTotals.pvecomp_gambit ?? {};
  const userInfo = profile.profile?.data?.userInfo;
  const rank = profile.profile?.data?.currentGuardianRank ?? 0;
  const clan = clanResponse?.results?.[0]?.group;

  return {
    bungieName: userInfo?.bungieGlobalDisplayName || userInfo?.displayName || fallbackName || "Guardian",
    bungieCode:
      userInfo?.bungieGlobalDisplayNameCode !== undefined ? String(userInfo.bungieGlobalDisplayNameCode).padStart(4, "0") : null,
    platform: PLATFORM_BY_TYPE[membership.membershipType] ?? null,
    guardianRank: rank > 0 ? { rank, name: GUARDIAN_RANKS[rank] ?? "" } : null,
    dateLastPlayed: profile.profile?.data?.dateLastPlayed ?? null,
    online: onlineActivity?.displayProperties?.name ? { activity: onlineActivity.displayProperties.name } : null,
    clan: clan?.name ? { name: clan.name, callsign: clan.clanInfo?.clanCallsign ?? "" } : null,
    title: currentTitle?.guardianTitle
      ? { name: currentTitle.guardianTitle, gilded: getTitleCompletionTier(currentTitle, recordInstances) === "gilded" }
      : null,
    emblem: {
      iconPath: emblemDefinition?.displayProperties?.icon ?? current?.emblemPath ?? null,
      backgroundPath: emblemDefinition?.secondarySpecial ?? current?.emblemBackgroundPath ?? null,
      overlayPath: emblemDefinition?.secondaryOverlay ?? null,
    },
    characters,
    totals: {
      minutesPlayed,
      triumphs: {
        active: profile.profileRecords?.data?.activeScore ?? null,
        lifetime: profile.profileRecords?.data?.lifetimeScore ?? null,
        legacy: profile.profileRecords?.data?.legacyScore ?? null,
      },
      seals: {
        earned: tiers.filter((tier) => tier !== "none").length,
        gilded: tiers.filter((tier) => tier === "gilded").length,
        total: sealTitles.length,
      },
      collections: { completed: badgesCompleted, gilded: badgesGilded, total: badgeTotal },
      raidClears: raids.reduce((sum, row) => sum + row.clears, 0),
      dungeonClears: dungeons.reduce((sum, row) => sum + row.clears, 0),
    },
    favorites: {
      raid: { byClears: toFavorite(pickFavorite(raids, "clears")), byTime: toFavorite(pickFavorite(raids, "seconds")) },
      dungeon: { byClears: toFavorite(pickFavorite(dungeons, "clears")), byTime: toFavorite(pickFavorite(dungeons, "seconds")) },
      playlist: { byClears: pickFavorite(playlistRows, "clears"), byTime: pickFavorite(playlistRows, "seconds") },
      patrol,
      weapon: topTracker ? weaponFavorite(topTracker.itemHash, topTracker.kills) : null,
      exotic: topExotic ? weaponFavorite(topExotic[0], topExotic[1].kills, topExotic[1].precision) : null,
    },
    facts: {
      raidSeconds: modeTotals.raid?.secondsPlayed ?? 0,
      towerSeconds,
      resurrections: value(allPvE, "resurrectionsPerformed") + value(allPvP, "resurrectionsPerformed"),
      precisionPercent,
      longestKillDistance: value(allPvE, "longestKillDistance") || null,
      deaths,
      secondsPerDeath: deaths > 0 ? Math.round((minutesPlayed * 60) / deaths) : null,
      publicEvents: value(allPvE, "publicEventsCompleted"),
      orbsDropped: value(allPvE, "orbsDropped") + value(allPvP, "orbsDropped"),
    },
    clears: { raids, dungeons },
    combat: {
      pve: {
        kills: pveKills,
        activitiesCleared: value(allPvE, "activitiesCleared"),
        precisionPercent,
        publicEvents: value(allPvE, "publicEventsCompleted"),
        orbsDropped: value(allPvE, "orbsDropped"),
      },
      pvp: {
        kd: allPvP ? Number(value(allPvP, "killsDeathsRatio").toFixed(2)) : null,
        kda: allPvP ? Number(value(allPvP, "killsDeathsAssists").toFixed(2)) : null,
        matches: value(allPvP, "activitiesEntered"),
        wins: value(allPvP, "activitiesWon"),
        bestStreak: value(allPvP, "longestKillSpree"),
        trialsWins: modeTotals.trials_of_osiris?.activitiesWon ?? 0,
      },
      gambit: {
        matches: gambit.activitiesEntered ?? 0,
        wins: gambit.activitiesWon ?? 0,
        motesDeposited: gambit.motesDeposited ?? 0,
        invaderKills: gambit.invaderKills ?? 0,
        primevalKills: gambit.primevalKills ?? 0,
        blockersSent: (gambit.smallBlockersSent ?? 0) + (gambit.mediumBlockersSent ?? 0) + (gambit.largeBlockersSent ?? 0),
      },
    },
    collection: [
      { label: "Exotics", href: "/exotics", ...countCatalog((item) => item.rarity === "Exotic" && (item.type === "Weapon" || item.type === "Armor")) },
      { label: "Weapons", href: "/all-loot", ...countCatalog((item) => item.type === "Weapon") },
      { label: "Shaders", href: "/shaders", ...countCatalog((item) => item.type === "Shader") },
      { label: "Emblems", href: "/all-loot", ...countCatalog((item) => item.type === "Emblem") },
      { label: "Collections", href: "/collections", owned: badgesCompleted, total: badgeTotal },
      { label: "Seals", href: "/triumphs", owned: tiers.filter((tier) => tier !== "none").length, total: sealTitles.length },
      { label: "Gilded seals", href: "/triumphs", owned: tiers.filter((tier) => tier === "gilded").length, total: sealTitles.length },
      {
        label: "Lore books",
        href: "/triumphs",
        // A book is complete when every lore entry in it has been found.
        owned: activityMap.loreBooks.filter((book) =>
          book.every((hash) => {
            const instance = recordInstances.get(hash);
            return instance !== undefined && (instance.state & RECORD_OBJECTIVE_NOT_COMPLETED) === 0;
          }),
        ).length,
        total: activityMap.loreBooks.length,
      },
    ],
  };
}

