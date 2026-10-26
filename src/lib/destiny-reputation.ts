import type { BungieUserSession } from "@/lib/bungie";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { bungieGet } from "@/lib/destiny-records";

export type ReputationLevel = { level: number; levelCap: number; resets: number };

type ProgressionsResponse = {
  characterProgressions?: {
    data?: Record<
      string,
      {
        progressions?: Record<
          string,
          { level?: number; levelCap?: number; currentResetCount?: number }
        >;
      }
    >;
  };
};

/** Vendor reputation ranks (account-wide; highest character wins). */
export async function fetchReputationLevels(
  session: BungieUserSession,
  progressionHashes: string[],
): Promise<Record<string, ReputationLevel>> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return {};

  const profile = await bungieGet<ProgressionsResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=202`,
    session.accessToken,
  );

  const result: Record<string, ReputationLevel> = {};
  for (const character of Object.values(profile.characterProgressions?.data ?? {})) {
    for (const hash of progressionHashes) {
      const entry = character.progressions?.[hash];
      if (!entry) continue;
      const level = entry.level ?? 0;
      if (!result[hash] || level > result[hash].level) {
        result[hash] = {
          level,
          levelCap: entry.levelCap ?? 0,
          resets: entry.currentResetCount ?? 0,
        };
      }
    }
  }
  return result;
}
