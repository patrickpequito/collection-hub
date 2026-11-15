import type { BungieUserSession } from "@/lib/bungie";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { bungieGet } from "@/lib/destiny-records";
import { PRAXIC_BLADE_PLUG_SETS, RENEGADE_ABILITY_GROUPS } from "@/data/expansions/renegades-frontier";

/**
 * Syndicate reputation. Bungie's level keeps climbing past the last rank (the 2,000-point
 * step repeats); the game shows Rank = level + 1, capped at the number of ranks.
 */
export type ClanRank = { level: number; progressToNextLevel: number; nextLevelAt: number };

type PlugState = { plugItemHash: number; canInsert?: boolean };
type PlugSets = { plugs?: Record<string, PlugState[]> };

type ProgressionsResponse = {
  profilePlugSets?: { data?: PlugSets };
  characterPlugSets?: { data?: Record<string, PlugSets> };
  characterProgressions?: {
    data?: Record<
      string,
      { progressions?: Record<string, { level?: number; progressToNextLevel?: number; nextLevelAt?: number }> }
    >;
  };
};

export type RenegadesProgress = {
  /** Highest Syndicate rank across characters, keyed by progression hash. */
  clans: Record<string, ClanRank>;
  /**
   * Praxic Blade plugs the player can insert. Locked crystals still come back "enabled",
   * so only canInsert counts as unlocked (the site-wide ownership set also takes enabled).
   */
  praxicUnlocked: string[];
};

export async function fetchRenegadesProgress(session: BungieUserSession): Promise<RenegadesProgress> {
  const membership = await resolveDestinyMembership(session);
  if (!membership) return { clans: {}, praxicUnlocked: [] };
  const profile = await bungieGet<ProgressionsResponse>(
    `/Platform/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=202,305`,
    session.accessToken,
  );

  const praxic = new Set<string>();
  const sets = [profile.profilePlugSets?.data, ...Object.values(profile.characterPlugSets?.data ?? {})];
  for (const plugSets of sets) {
    for (const setHash of PRAXIC_BLADE_PLUG_SETS) {
      for (const plug of plugSets?.plugs?.[setHash] ?? []) {
        if (plug.canInsert) praxic.add(String(plug.plugItemHash));
      }
    }
  }

  const clans: Record<string, ClanRank> = {};
  for (const character of Object.values(profile.characterProgressions?.data ?? {})) {
    for (const group of RENEGADE_ABILITY_GROUPS) {
      if (!group.progressionHash) continue;
      const entry = character.progressions?.[group.progressionHash];
      if (!entry) continue;
      const rank: ClanRank = {
        level: entry.level ?? 0,
        progressToNextLevel: entry.progressToNextLevel ?? 0,
        nextLevelAt: entry.nextLevelAt ?? 0,
      };
      const current = clans[group.progressionHash];
      if (
        !current ||
        rank.level > current.level ||
        (rank.level === current.level && rank.progressToNextLevel > current.progressToNextLevel)
      ) {
        clans[group.progressionHash] = rank;
      }
    }
  }
  return { clans, praxicUnlocked: [...praxic] };
}
