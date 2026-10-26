import { getBungieApiKey } from "@/lib/env";
import type { DestinyMembership } from "@/lib/destiny-membership";
import { loadTriumphCatalog } from "@/lib/triumphs/load";
import type { GuardianClass } from "@/types/armor-set";

const CLASS_BY_TYPE: Record<number, GuardianClass> = { 0: "titan", 1: "hunter", 2: "warlock" };
/** Profiles looked up for emblems / Power per list (keeps one tab to a few dozen calls). */
const ENRICH_LIMIT = 40;
/** Recent activities read for "Recent fireteams". */
const RECENT_ACTIVITIES = 15;

export type FireteamGuardian = {
  membershipType: number;
  membershipId: string;
  name: string;
  code: string | null;
  online: boolean | null;
  /** ISO date of the last online change (clan) or last activity together (recent). */
  lastSeen: string | null;
  /** In-game activity line when Bungie shares it (friends). */
  status: string | null;
  emblemPath: string | null;
  emblemBackgroundPath: string | null;
  light: number | null;
  title: string | null;
  mainClass: GuardianClass | null;
  /** Recent fireteams: activities played together. */
  together?: number;
};

export type FireteamList = { guardians: FireteamGuardian[]; heading: string | null; error: string | null };

type BungieUserInfo = {
  membershipType: number;
  membershipId: string;
  displayName?: string;
  bungieGlobalDisplayName?: string;
  bungieGlobalDisplayNameCode?: number;
  crossSaveOverride?: number;
  iconPath?: string;
};

async function bungieGet<T>(pathName: string, accessToken: string | null, host = "www"): Promise<T> {
  const response = await fetch(`https://${host}.bungie.net/Platform${pathName}`, {
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

const code = (value?: number) => (value !== undefined && value !== null ? String(value).padStart(4, "0") : null);

function fromUserInfo(info: BungieUserInfo): FireteamGuardian {
  return {
    membershipType: info.membershipType,
    membershipId: info.membershipId,
    name: info.bungieGlobalDisplayName || info.displayName || "Guardian",
    code: code(info.bungieGlobalDisplayNameCode),
    online: null,
    lastSeen: null,
    status: null,
    emblemPath: null,
    emblemBackgroundPath: null,
    light: null,
    title: null,
    mainClass: null,
  };
}

/** Runs `task` over `items` a few at a time (Bungie throttles bursts). */
async function inBatches<T, R>(items: T[], size: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    results.push(...(await Promise.all(items.slice(index, index + size).map(task))));
  }
  return results;
}

/** Fills emblem, Power, equipped title and main class from each public profile. */
async function enrich(guardians: FireteamGuardian[]): Promise<FireteamGuardian[]> {
  const catalog = await loadTriumphCatalog();
  const titleByRecord = new Map(
    catalog.titles.filter((title) => title.completionRecordHash).map((title) => [title.completionRecordHash!, title.guardianTitle]),
  );
  const head = guardians.slice(0, ENRICH_LIMIT);
  const enriched = await inBatches(head, 10, async (guardian) => {
    try {
      const profile = await bungieGet<{
        characters?: {
          data?: Record<
            string,
            {
              classType?: number;
              light?: number;
              minutesPlayedTotal?: string;
              dateLastPlayed?: string;
              emblemPath?: string;
              emblemBackgroundPath?: string;
              titleRecordHash?: number;
            }
          >;
        };
      }>(`/Destiny2/${guardian.membershipType}/Profile/${guardian.membershipId}/?components=200`, null);
      const characters = Object.values(profile.characters?.data ?? {});
      if (!characters.length) return guardian;
      const latest = [...characters].sort(
        (a, b) => Date.parse(b.dateLastPlayed ?? "0") - Date.parse(a.dateLastPlayed ?? "0"),
      )[0];
      const main = [...characters].sort((a, b) => Number(b.minutesPlayedTotal ?? 0) - Number(a.minutesPlayedTotal ?? 0))[0];
      return {
        ...guardian,
        emblemPath: latest.emblemPath ?? guardian.emblemPath,
        emblemBackgroundPath: latest.emblemBackgroundPath ?? null,
        light: latest.light ?? null,
        title: latest.titleRecordHash ? (titleByRecord.get(String(latest.titleRecordHash)) ?? null) : null,
        mainClass: CLASS_BY_TYPE[main.classType ?? -1] ?? null,
        lastSeen: guardian.lastSeen ?? latest.dateLastPlayed ?? null,
      };
    } catch {
      return guardian;
    }
  });
  return [...enriched, ...guardians.slice(ENRICH_LIMIT)];
}

const byOnlineThenRecent = (a: FireteamGuardian, b: FireteamGuardian) =>
  Number(b.online ?? false) - Number(a.online ?? false) ||
  Date.parse(b.lastSeen ?? "0") - Date.parse(a.lastSeen ?? "0");

/** Members of the guardian's Bungie clan, online first. */
export async function loadClanMembers(membership: DestinyMembership, accessToken: string | null): Promise<FireteamList> {
  const groups = await bungieGet<{
    results?: { group?: { groupId?: string; name?: string; clanInfo?: { clanCallsign?: string } } }[];
  }>(`/GroupV2/User/${membership.membershipType}/${membership.membershipId}/0/1/`, accessToken);
  const group = groups.results?.[0]?.group;
  if (!group?.groupId) return { guardians: [], heading: null, error: "Not in a clan." };

  const members = await bungieGet<{
    results?: { isOnline?: boolean; lastOnlineStatusChange?: string; destinyUserInfo?: BungieUserInfo }[];
  }>(`/GroupV2/${group.groupId}/Members/?currentpage=1`, accessToken);
  const guardians = (members.results ?? [])
    .filter((member) => member.destinyUserInfo && member.destinyUserInfo.membershipId !== membership.membershipId)
    .map((member) => ({
      ...fromUserInfo(member.destinyUserInfo!),
      online: member.isOnline ?? false,
      lastSeen: member.lastOnlineStatusChange ? new Date(Number(member.lastOnlineStatusChange) * 1000).toISOString() : null,
    }))
    .sort(byOnlineThenRecent);

  return {
    guardians: await enrich(guardians),
    heading: `${group.clanInfo?.clanCallsign ? `[${group.clanInfo.clanCallsign}] ` : ""}${group.name ?? "Clan"}`,
    error: null,
  };
}

/** Bungie.net friends (needs the signed-in user's token and Bungie's friends permission). */
export async function loadFriends(accessToken: string): Promise<FireteamList> {
  try {
    const response = await bungieGet<{
      friends?: {
        lastSeenAsMembershipId?: string;
        lastSeenAsBungieMembershipType?: number;
        bungieGlobalDisplayName?: string;
        bungieGlobalDisplayNameCode?: number;
        onlineStatus?: number;
        onlineTitle?: number;
      }[];
    }>("/Social/Friends/", accessToken);
    const guardians = (response.friends ?? [])
      .filter((friend) => friend.lastSeenAsMembershipId && friend.lastSeenAsBungieMembershipType)
      .map((friend) => ({
        ...fromUserInfo({
          membershipType: friend.lastSeenAsBungieMembershipType!,
          membershipId: friend.lastSeenAsMembershipId!,
          bungieGlobalDisplayName: friend.bungieGlobalDisplayName,
          bungieGlobalDisplayNameCode: friend.bungieGlobalDisplayNameCode,
        }),
        online: friend.onlineStatus === 1,
      }));
    const enriched = await enrich(guardians);
    return { guardians: enriched.sort(byOnlineThenRecent), heading: null, error: null };
  } catch {
    return { guardians: [], heading: null, error: "Bungie didn't share your friends list." };
  }
}

/** Guardians from your latest activities, most frequent first. */
export async function loadRecentFireteams(
  membership: DestinyMembership,
  accessToken: string | null,
): Promise<FireteamList> {
  const profile = await bungieGet<{ characters?: { data?: Record<string, { dateLastPlayed?: string }> } }>(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=200`,
    accessToken,
  );
  const characterId = Object.entries(profile.characters?.data ?? {}).sort(
    ([, a], [, b]) => Date.parse(b.dateLastPlayed ?? "0") - Date.parse(a.dateLastPlayed ?? "0"),
  )[0]?.[0];
  if (!characterId) return { guardians: [], heading: null, error: null };

  const history = await bungieGet<{ activities?: { period?: string; activityDetails?: { instanceId?: string } }[] }>(
    `/Destiny2/${membership.membershipType}/Account/${membership.membershipId}/Character/${characterId}/Stats/Activities/?count=${RECENT_ACTIVITIES}`,
    accessToken,
  );
  const teammates = new Map<string, FireteamGuardian>();
  const reports = await inBatches(history.activities ?? [], 5, async (activity) => {
    const instanceId = activity.activityDetails?.instanceId;
    if (!instanceId) return null;
    try {
      const report = await bungieGet<{ entries?: { player?: { destinyUserInfo?: BungieUserInfo } }[] }>(
        `/Destiny2/Stats/PostGameCarnageReport/${instanceId}/`,
        null,
        "stats",
      );
      return { period: activity.period ?? null, entries: report.entries ?? [] };
    } catch {
      return null;
    }
  });
  for (const report of reports) {
    if (!report) continue;
    const seen = new Set<string>();
    for (const entry of report.entries) {
      const info = entry.player?.destinyUserInfo;
      if (!info?.membershipId || info.membershipId === membership.membershipId || seen.has(info.membershipId)) continue;
      seen.add(info.membershipId);
      const existing = teammates.get(info.membershipId);
      if (existing) {
        existing.together = (existing.together ?? 1) + 1;
        continue;
      }
      teammates.set(info.membershipId, {
        ...fromUserInfo(info),
        emblemPath: info.iconPath ?? null,
        lastSeen: report.period,
        together: 1,
      });
    }
  }
  const guardians = [...teammates.values()].sort(
    (a, b) => (b.together ?? 0) - (a.together ?? 0) || Date.parse(b.lastSeen ?? "0") - Date.parse(a.lastSeen ?? "0"),
  );
  return { guardians: await enrich(guardians), heading: null, error: null };
}

export type GuardianSearchResult = { membershipType: number; membershipId: string; name: string; code: string | null };

/** Bungie name search ("Name" or "Name#1234"). */
export async function searchGuardians(query: string): Promise<GuardianSearchResult[]> {
  const [prefix, wantedCode] = query.trim().split("#");
  if (!prefix) return [];
  const response = await fetch("https://www.bungie.net/Platform/User/Search/GlobalName/0/", {
    method: "POST",
    headers: { "X-API-Key": getBungieApiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({ displayNamePrefix: prefix }),
    cache: "no-store",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as {
    Response?: {
      searchResults?: {
        bungieGlobalDisplayName?: string;
        bungieGlobalDisplayNameCode?: number;
        destinyMemberships?: BungieUserInfo[];
      }[];
    };
  };
  return (data.Response?.searchResults ?? [])
    .filter((result) => !wantedCode || code(result.bungieGlobalDisplayNameCode) === wantedCode.padStart(4, "0"))
    .flatMap((result) => {
      const memberships = result.destinyMemberships ?? [];
      // Cross save: the membership the override points at holds the characters.
      const primary =
        memberships.find((entry) => entry.crossSaveOverride && entry.membershipType === entry.crossSaveOverride) ??
        memberships[0];
      if (!primary) return [];
      return [
        {
          membershipType: primary.membershipType,
          membershipId: primary.membershipId,
          name: result.bungieGlobalDisplayName ?? primary.displayName ?? "Guardian",
          code: code(result.bungieGlobalDisplayNameCode),
        },
      ];
    })
    .slice(0, 10);
}
