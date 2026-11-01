import { ironBannerWindowFor } from "@/lib/activities/trials-schedule";

const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

/** This Iron Banner week when it is live, otherwise the next one (it runs every four weeks). */
export function ironBannerWeek(now = Date.now()): { live: boolean; startMs: number; endMs: number; startedToday: boolean } {
  const window = ironBannerWindowFor(now);
  const live = now >= window.startMs && now < window.endMs;
  const startMs = live ? window.startMs : window.startMs + 4 * MS_WEEK;
  // The image is posted with the Tuesday reset, so it says "starts today" unless IB is already a day in.
  const startedToday = !live || now - startMs < MS_WEEK / 7;
  return { live, startMs, endMs: startMs + MS_WEEK, startedToday };
}
