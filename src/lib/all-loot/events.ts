/**
 * Events (The Dawning, Festival of the Lost…) as their own axis next to seasons:
 * an event item is labelled "<Event> <year>" and filtered by event, not by season.
 * The year comes from the source text ("Moments of Triumph 2021") or from the season
 * the item was added in plus the month the event runs.
 */

/** Filter order, with the watermark used as the event's icon. */
export const EVENTS: { label: string; iconPath: string }[] = [
  { label: "The Dawning", iconPath: "/common/destiny2_content/icons/83fbcacd223402c09af4b7ab067f8cce.png" },
  { label: "Festival of the Lost", iconPath: "/common/destiny2_content/icons/53dc0b02306726ff1517af33ac908cef.png" },
  { label: "Solstice", iconPath: "/common/destiny2_content/icons/50c3ebe414c6946429934d79504922fa.png" },
  { label: "Guardian Games", iconPath: "/common/destiny2_content/icons/9c091ec0e22c01dacc25efb63b46eb9b.png" },
  { label: "Crimson Days", iconPath: "/common/destiny2_content/icons/fe8bcc20fbfaf4cac69dfb640bb0b84e.png" },
  { label: "The Revelry", iconPath: "/common/destiny2_content/icons/c1e11e70eba15abcd4e0414fa29ef714.png" },
  { label: "Pride", iconPath: "/common/destiny2_content/icons/2b89827888c5581a14af976968bcb18a.png" },
  { label: "Call to Arms", iconPath: "/common/destiny2_content/icons/6eeb62a30439cecc7699c22f3e1fb3cf.png" },
  { label: "30th Anniversary", iconPath: "/common/destiny2_content/icons/bcc26708e314306fb2fc8cb98fcbf47e.png" },
  { label: "10th Anniversary", iconPath: "/common/destiny2_content/icons/24174c8ceefc3aea6bfe6b9d45de9d07.png" },
];

/** Month (1–12) each recurring event usually starts. */
const EVENT_MONTH: Record<string, number> = {
  "The Dawning": 12,
  "Festival of the Lost": 10,
  Solstice: 7,
  "Guardian Games": 4,
  "Crimson Days": 2,
  Pride: 6,
  "Call to Arms": 3,
};

/** One-off events. */
const EVENT_FIXED_YEAR: Record<string, number> = {
  "The Revelry": 2019,
  "30th Anniversary": 2021,
  "10th Anniversary": 2024,
};

/** Start of each season / expansion label ("YYYY-MM"), in release order. */
const SEASON_STARTS: [string, string][] = [
  ["Red War", "2017-09"],
  ["Curse of Osiris", "2017-12"],
  ["Warmind", "2018-05"],
  ["Forsaken", "2018-09"],
  ["S5 Season of the Forge", "2018-11"],
  ["S6 Season of the Drifter", "2019-03"],
  ["S7 Season of Opulence", "2019-06"],
  ["Shadowkeep", "2019-10"],
  ["S8 Season of the Undying", "2019-10"],
  ["S9 Season of Dawn", "2019-12"],
  ["S10 Season of the Worthy", "2020-03"],
  ["S11 Season of Arrivals", "2020-06"],
  ["Beyond Light", "2020-11"],
  ["S12 Season of the Hunt", "2020-11"],
  ["S13 Season of the Chosen", "2021-02"],
  ["S14 Season of the Splicer", "2021-05"],
  ["S15 Season of the Lost", "2021-08"],
  ["The Witch Queen", "2022-02"],
  ["S16 Season of the Risen", "2022-02"],
  ["S17 Season of the Haunted", "2022-05"],
  ["S18 Season of Plunder", "2022-08"],
  ["S19 Season of the Seraph", "2022-12"],
  ["Lightfall", "2023-02"],
  ["S20 Season of Defiance", "2023-02"],
  ["S21 Season of the Deep", "2023-05"],
  ["S22 Season of the Witch", "2023-08"],
  ["S23 Season of the Wish", "2023-11"],
  ["Into the Light", "2024-04"],
  ["The Final Shape", "2024-06"],
  ["S24 Episode: Echoes", "2024-06"],
  ["S25 Episode: Revenant", "2024-10"],
  ["S26 Episode: Heresy", "2025-02"],
  ["The Edge of Fate", "2025-07"],
  ["S27 Season: Reclamation", "2025-07"],
  ["Monument of Triumph", "2025-12"],
  ["Renegades", "2025-12"],
  ["S28 Season: Lawless", "2025-12"],
];

const monthIndex = (yyyyMm: string) => {
  const [year, month] = yyyyMm.split("-").map(Number);
  return year * 12 + (month - 1);
};

const SEASON_RANGES = new Map<string, { start: number; end: number }>(
  SEASON_STARTS.map(([label, start]) => {
    const startIndex = monthIndex(start);
    // A season runs until the next later start (labels sharing a start month share the range).
    const next = SEASON_STARTS.map(([, other]) => monthIndex(other)).filter((index) => index > startIndex);
    return [label, { start: startIndex, end: next.length ? Math.min(...next) : startIndex + 6 }];
  }),
);

/** Year of the event edition an item belongs to, or null when it can't be told. */
export function eventYear(eventLabel: string, seasonLabel: string | null | undefined, source?: string | null): number | null {
  const fromSource = source?.match(/\b(20\d{2})\b/);
  if (fromSource) return Number(fromSource[1]);
  if (EVENT_FIXED_YEAR[eventLabel]) return EVENT_FIXED_YEAR[eventLabel];
  const month = EVENT_MONTH[eventLabel];
  const range = seasonLabel ? SEASON_RANGES.get(seasonLabel) : undefined;
  if (!month || !range) return null;
  // First time the event's month falls inside the season (or, failing that, right after it starts).
  for (let index = range.start; index < range.end; index += 1) {
    if ((index % 12) + 1 === month) return Math.floor(index / 12);
  }
  for (let index = range.start; index < range.start + 12; index += 1) {
    if ((index % 12) + 1 === month) return Math.floor(index / 12);
  }
  return null;
}

/** "The Dawning 2019" (or just the event when the year is unknown). */
export function eventDisplayLabel(eventLabel: string, year?: number | null): string {
  return year ? `${eventLabel} ${year}` : eventLabel;
}
