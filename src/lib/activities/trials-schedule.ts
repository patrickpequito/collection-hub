/**
 * Trials of Osiris weekend schedule + Iron Banner blackout detection.
 * Anchors match the public Monument of Triumph cadence (Kyber / Bungie).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_FOUR_WEEKS = 28 * MS_PER_DAY;
/** Trials runs Friday 17:00 UTC through Tuesday 17:00 UTC. */
const MS_TRIALS_WINDOW = 4 * MS_PER_DAY;

/**
 * First Iron Banner week after Mot Trials return (Tue 17:00 UTC).
 * IB repeats every four weeks for one weekly-reset week.
 */
export const IRON_BANNER_BLACKOUT_ANCHOR_MS = Date.parse(
  "2026-08-25T17:00:00Z",
);

export type IronBannerWindow = {
  startMs: number;
  endMs: number;
};

export function ironBannerWindowFor(nowMs: number): IronBannerWindow {
  let n = Math.floor(
    (nowMs - IRON_BANNER_BLACKOUT_ANCHOR_MS) / MS_FOUR_WEEKS,
  );
  let startMs = IRON_BANNER_BLACKOUT_ANCHOR_MS + n * MS_FOUR_WEEKS;
  if (startMs > nowMs) {
    startMs -= MS_FOUR_WEEKS;
  }
  return { startMs, endMs: startMs + MS_PER_WEEK };
}

/** True when Iron Banner is live (Tue→Tue), pausing Trials. */
export function isIronBannerLive(nowMs = Date.now()): boolean {
  const { startMs, endMs } = ironBannerWindowFor(nowMs);
  return nowMs >= startMs && nowMs < endMs;
}

/**
 * True when this Trials Friday falls inside an Iron Banner blackout week
 * (Trials does not run that weekend).
 */
export function isIronBannerBlackoutFriday(fridayMs: number): boolean {
  const { startMs, endMs } = ironBannerWindowFor(fridayMs);
  return fridayMs >= startMs && fridayMs < endMs;
}

export function trialsWeekendBoundsForEpoch(
  epochMs: number,
  nowMs = Date.now(),
): {
  weekIndex: number;
  weekStartMs: number;
  weekEndMs: number;
  weekStart: string;
  weekEnd: string;
} {
  let weekIndex = Math.floor((nowMs - epochMs) / MS_PER_WEEK);
  let weekStartMs = epochMs + weekIndex * MS_PER_WEEK;
  if (nowMs < weekStartMs) {
    weekIndex -= 1;
    weekStartMs = epochMs + weekIndex * MS_PER_WEEK;
  }
  const weekEndMs = weekStartMs + MS_TRIALS_WINDOW;
  return {
    weekIndex,
    weekStartMs,
    weekEndMs,
    weekStart: new Date(weekStartMs).toISOString(),
    weekEnd: new Date(weekEndMs).toISOString(),
  };
}

export function isWithinTrialsWeekend(
  nowMs: number,
  weekStartMs: number,
  weekEndMs: number,
): boolean {
  return nowMs >= weekStartMs && nowMs <= weekEndMs;
}

/** Trials should show featured maps: inside Fri→Tue window and not an IB blackout. */
export function shouldShowTrialsFeaturedMaps(
  epochMs: number,
  nowMs = Date.now(),
): {
  active: boolean;
  ironBanner: boolean;
  bounds: ReturnType<typeof trialsWeekendBoundsForEpoch>;
} {
  const bounds = trialsWeekendBoundsForEpoch(epochMs, nowMs);
  const ironBanner = isIronBannerBlackoutFriday(bounds.weekStartMs);
  const inWindow = isWithinTrialsWeekend(
    nowMs,
    bounds.weekStartMs,
    bounds.weekEndMs,
  );
  return {
    active: inWindow && !ironBanner,
    ironBanner: ironBanner && inWindow,
    bounds,
  };
}

export {
  MS_PER_DAY,
  MS_PER_WEEK,
  MS_TRIALS_WINDOW,
};
