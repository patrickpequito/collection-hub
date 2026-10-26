import { TRIALS_BONUS_POOL_EPOCH_MS } from "@/data/activities/trials-of-osiris";
import {
  IRON_BANNER_BLACKOUT_ANCHOR_MS,
  MS_PER_DAY,
  MS_PER_WEEK,
  ironBannerWindowFor,
  isIronBannerBlackoutFriday,
} from "@/lib/activities/trials-schedule";

/** One run of a rotating weapon pool (an Iron Banner event or a Trials weekend). */
export type PoolOccurrence = { poolId: string; startMs: number; endMs: number };

export type PoolRowStatus = "active" | "next" | "later";

export type PoolRowState = {
  poolId: string;
  status: PoolRowStatus;
  /** The pool's current or next run; null when none is scheduled. */
  occurrence: PoolOccurrence | null;
};

const MS_FOUR_WEEKS = 4 * MS_PER_WEEK;
/** Trials runs Friday 17:00 UTC through Tuesday 17:00 UTC. */
const MS_TRIALS_WINDOW = 4 * MS_PER_DAY;

/**
 * Orders pools by when they come up: the running one is "active", the first one
 * after it (or the soonest, when nothing runs) is "next", the rest are "later". Pure, so the page can re-run it on the
 * client and switch labels at the right moment.
 */
export function rankPools(poolIds: string[], occurrences: PoolOccurrence[], nowMs: number): PoolRowState[] {
  const upcoming = occurrences.filter((entry) => entry.endMs > nowMs).sort((a, b) => a.startMs - b.startMs);
  const rows = poolIds.map((poolId) => ({
    poolId,
    occurrence: upcoming.find((entry) => entry.poolId === poolId) ?? null,
  }));
  rows.sort((a, b) => (a.occurrence?.startMs ?? Infinity) - (b.occurrence?.startMs ?? Infinity));
  const running = rows.find((row) => row.occurrence && row.occurrence.startMs <= nowMs);
  // "Next" = the first scheduled pool that isn't running (after the active one, if any).
  const next = rows.find((row) => row !== running && row.occurrence);
  return rows.map((row) => ({
    ...row,
    status: row === running ? "active" : row === next ? "next" : ("later" as PoolRowStatus),
  }));
}

/**
 * Iron Banner events (one week every four) with their weapon pool: the two pools
 * alternate each event. The event that started on the anchor week used pool 1.
 */
export function ironBannerPoolOccurrences(
  nowMs: number,
  poolIds: readonly [string, string],
  count = 4,
): PoolOccurrence[] {
  const first = ironBannerWindowFor(nowMs);
  return Array.from({ length: count }, (_, index) => {
    const startMs = first.startMs + index * MS_FOUR_WEEKS;
    const eventIndex = Math.round((startMs - IRON_BANNER_BLACKOUT_ANCHOR_MS) / MS_FOUR_WEEKS);
    return { poolId: poolIds[((eventIndex % 2) + 2) % 2], startMs, endMs: startMs + MS_PER_WEEK };
  });
}

/**
 * Trials weekends with their bonus pool (three pools, one per weekly reset since the
 * Monument of Triumph return). Iron Banner weeks have no Trials and are skipped.
 */
export function trialsPoolOccurrences(
  nowMs: number,
  poolIds: readonly [string, string, string],
  count = 6,
): PoolOccurrence[] {
  const occurrences: PoolOccurrence[] = [];
  let week = Math.floor((nowMs - TRIALS_BONUS_POOL_EPOCH_MS) / MS_PER_WEEK);
  while (occurrences.length < count) {
    const startMs = TRIALS_BONUS_POOL_EPOCH_MS + week * MS_PER_WEEK;
    const endMs = startMs + MS_TRIALS_WINDOW;
    if (endMs > nowMs && !isIronBannerBlackoutFriday(startMs)) {
      occurrences.push({ poolId: poolIds[((week % 3) + 3) % 3], startMs, endMs });
    }
    week += 1;
  }
  return occurrences;
}

/** Pool schedule as of now, for a server page's first render. */
export function poolScheduleNow<T extends readonly string[]>(
  build: (nowMs: number, poolIds: T) => PoolOccurrence[],
  poolIds: T,
): { nowMs: number; occurrences: PoolOccurrence[] } {
  const nowMs = Date.now();
  return { nowMs, occurrences: build(nowMs, poolIds) };
}
