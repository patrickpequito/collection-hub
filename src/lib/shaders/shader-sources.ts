/**
 * Acquisition categories for shaders.
 *
 * Nested buckets (Events, Destinations, Raids, Dungeons, Seasonals, Vendors)
 * use `detail` for the specific source. Sort order is by relevance (not A–Z).
 */

export type ShaderAcquisition = {
  /** Top-level bucket (Raids, Events, Vanguard, Eververse, …). */
  category: string;
  /** Specific name when the category is a nested bucket. */
  detail?: string;
};

const RAIDS_CATEGORY = "Raids";
const DUNGEONS_CATEGORY = "Dungeons";
const DESTINATIONS_CATEGORY = "Destinations";
const EVENTS_CATEGORY = "Events";
const SEASONALS_CATEGORY = "Seasonals";
const VENDORS_CATEGORY = "Vendors";

/** Release-ish order for nested raid names. */
const RAID_DETAIL_ORDER = [
  "Leviathan",
  "Eater of Worlds",
  "Spire of Stars",
  "Last Wish",
  "Garden of Salvation",
  "Deep Stone Crypt",
  "Vault of Glass",
  "Vow of the Disciple",
  "King's Fall",
  "Root of Nightmares",
  "Crota's End",
  "Salvation's Edge",
  "The Desert Perpetual",
] as const;

const DUNGEON_DETAIL_ORDER = [
  "Pit of Heresy",
  "Prophecy",
  "Grasp of Avarice",
  "Duality",
  "Spire of the Watcher",
  "Ghosts of the Deep",
  "Warlord's Ruin",
  "Vesper's Host",
  "Sundered Doctrine",
  "Equilibrium",
] as const;

const DESTINATION_DETAIL_ORDER = [
  "Europa",
  "The Moon",
  "The Throne World",
  "Neomuna",
  "The Pale Heart",
  "Kepler",
  "Planetary chests",
] as const;

const EVENT_DETAIL_ORDER = [
  "The Dawning",
  "Festival of the Lost",
  "Solstice",
  "Guardian Games",
  "Call to Arms",
  "Crimson Days",
  "The Revelry",
  "Sparrow Racing League",
  "Event Card",
  "Pride",
] as const;

const SEASONAL_DETAIL_ORDER = [
  "Contact",
  "Sundial",
  "Empire Hunt",
  "Empyrean Restoration",
  "Seraph Warsat Network",
  "Season of the Witch",
  "Oblation",
  "Rite of the Nine",
  "Where's Archie?",
  "Into the Light",
  "Episode: Heresy",
  "Renegades",
  "Forsaken Annual Pass",
  "Past Is Prologue",
  "Season 8: Battle Drills",
  "Season 8: First Watch",
  "Season 8: Keepin' On",
] as const;

const VENDOR_DETAIL_ORDER = [
  "Banshee-44",
  "Xûr",
  "Saint-14",
  "Arach Jalaal",
  "Executor Hideo",
  "Lakshmi-2",
] as const;

const RAID_NAME_SET = new Set<string>(RAID_DETAIL_ORDER);
const DUNGEON_NAME_SET = new Set<string>(DUNGEON_DETAIL_ORDER);
const DESTINATION_NAME_SET = new Set<string>(DESTINATION_DETAIL_ORDER);
const EVENT_NAME_SET = new Set<string>(EVENT_DETAIL_ORDER);
const SEASONAL_NAME_SET = new Set<string>(SEASONAL_DETAIL_ORDER);
const VENDOR_NAME_SET = new Set<string>(VENDOR_DETAIL_ORDER);

/** Lower = more relevant (shown first). */
const CATEGORY_RELEVANCE = new Map<string, number>([
  // Playlists
  ["Vanguard", 10],
  ["Crucible", 11],
  ["Gambit", 12],
  ["Iron Banner", 13],
  ["Trials of Osiris", 14],

  // Nested buckets
  [EVENTS_CATEGORY, 20],
  [DESTINATIONS_CATEGORY, 30],
  [RAIDS_CATEGORY, 40],
  [DUNGEONS_CATEGORY, 50],
  [SEASONALS_CATEGORY, 60],
  [VENDORS_CATEGORY, 70],

  // Passes / reclaim
  ["Season Pass", 90],
  ["Rewards Pass", 91],
  ["Monument of Triumph", 92],

  // Triumphs
  ["Triumphs", 100],

  // Shop / filler
  ["Bright Engrams", 110],
  ["Engrams", 111],
  ["Eververse", 120],
  ["Special offer", 130],
  ["Applied to gear", 140],
  ["Unknown", 150],
]);

const DEFAULT_SEASONAL_RELEVANCE = 65;
const DEFAULT_MISC_RELEVANCE = 125;

function cleanSourceText(source: string): string {
  return source
    .replace(/^Source:\s*/i, "")
    .replace(/\.$/, "")
    .trim();
}

function detailOrderIndex(
  name: string,
  order: readonly string[],
): number {
  const index = order.indexOf(name);
  return index === -1 ? 500 + name.localeCompare("") : index;
}

function asRaid(detail: string): ShaderAcquisition {
  return { category: RAIDS_CATEGORY, detail };
}

function asDungeon(detail: string): ShaderAcquisition {
  return { category: DUNGEONS_CATEGORY, detail };
}

function asDestination(detail: string): ShaderAcquisition {
  return { category: DESTINATIONS_CATEGORY, detail };
}

function asEvent(detail: string): ShaderAcquisition {
  return { category: EVENTS_CATEGORY, detail };
}

function asSeasonal(detail: string): ShaderAcquisition {
  return { category: SEASONALS_CATEGORY, detail };
}

function asVendor(detail: string): ShaderAcquisition {
  return { category: VENDORS_CATEGORY, detail };
}

function classifyNamedActivity(
  name: string,
  sourceText: string,
): ShaderAcquisition | null {
  if (RAID_NAME_SET.has(name) || /\braid\b/i.test(sourceText)) {
    return asRaid(name);
  }
  if (DUNGEON_NAME_SET.has(name) || /\bdungeon\b/i.test(sourceText)) {
    return asDungeon(name);
  }
  if (DESTINATION_NAME_SET.has(name)) {
    return asDestination(name);
  }
  if (EVENT_NAME_SET.has(name)) {
    return asEvent(name);
  }
  if (SEASONAL_NAME_SET.has(name)) {
    return asSeasonal(name);
  }
  if (VENDOR_NAME_SET.has(name)) {
    return asVendor(name);
  }
  return null;
}

/** Resolve category (+ optional raid/dungeon detail) from a Bungie source string. */
export function resolveShaderAcquisition(source = ""): ShaderAcquisition {
  const text = cleanSourceText(source);
  if (!text) return { category: "Unknown" };

  if (/\btriumph\b/i.test(text) && !/monument of triumph/i.test(text)) {
    return { category: "Triumphs" };
  }

  const quoted = text.match(/"([^"]+)"/);
  if (quoted) {
    const named = classifyNamedActivity(quoted[1], text);
    if (named) return named;
    return { category: quoted[1] };
  }

  if (/dismantle an item with this shader/i.test(text)) {
    return { category: "Applied to gear" };
  }
  if (/bright engram/i.test(text)) return { category: "Bright Engrams" };
  if (/eververse/i.test(text)) return { category: "Eververse" };
  if (/season pass/i.test(text)) return { category: "Season Pass" };
  if (/rewards pass/i.test(text)) return { category: "Rewards Pass" };
  if (/legendary engram/i.test(text)) return { category: "Engrams" };

  if (/iron banner/i.test(text)) return { category: "Iron Banner" };
  if (/trials/i.test(text)) return { category: "Trials of Osiris" };
  if (/gambit/i.test(text)) return { category: "Gambit" };
  if (/crucible|lord shaxx/i.test(text)) return { category: "Crucible" };
  if (/strike|zavala|vanguard/i.test(text)) return { category: "Vanguard" };

  if (/sparrow racing/i.test(text)) {
    return asEvent("Sparrow Racing League");
  }
  if (/guardian games/i.test(text)) return asEvent("Guardian Games");
  if (/festival of the lost/i.test(text)) {
    return asEvent("Festival of the Lost");
  }
  if (/dawning/i.test(text)) return asEvent("The Dawning");
  if (/solstice/i.test(text)) return asEvent("Solstice");
  if (/call to arms/i.test(text)) return asEvent("Call to Arms");
  if (/rite of the nine/i.test(text)) {
    return asSeasonal("Rite of the Nine");
  }
  if (/upgraded event card/i.test(text)) return asEvent("Event Card");
  if (/crimson days/i.test(text)) return asEvent("Crimson Days");
  if (/revelry/i.test(text)) return asEvent("The Revelry");

  const exploring = text.match(/^exploring\s+(.+)$/i);
  if (exploring) {
    const place = exploring[1]
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return asDestination(place);
  }

  if (/planetary faction chests/i.test(text)) {
    return asDestination("Planetary chests");
  }
  if (/contact public event/i.test(text)) return asSeasonal("Contact");
  if (/sundial/i.test(text)) return asSeasonal("Sundial");
  if (/fallen empire/i.test(text)) return asSeasonal("Empire Hunt");
  if (/empyrean restoration/i.test(text)) {
    return asSeasonal("Empyrean Restoration");
  }
  if (/seraph warsat/i.test(text)) {
    return asSeasonal("Seraph Warsat Network");
  }
  if (/where'?s archie/i.test(text)) return asSeasonal("Where's Archie?");
  if (/oblation/i.test(text)) return asSeasonal("Oblation");
  if (/equilibrium/i.test(text)) return asDungeon("Equilibrium");
  if (/into the light/i.test(text)) return asSeasonal("Into the Light");
  if (/forsaken annual pass/i.test(text)) {
    return asSeasonal("Forsaken Annual Pass");
  }
  if (/monument of triumph/i.test(text)) {
    return { category: "Monument of Triumph" };
  }
  if (/episode:\s*heresy/i.test(text)) {
    return asSeasonal("Episode: Heresy");
  }
  if (/^renegades$/i.test(text)) return asSeasonal("Renegades");
  if (/season of the witch/i.test(text)) {
    return asSeasonal("Season of the Witch");
  }

  if (/leviathan,\s*eater of worlds/i.test(text)) {
    return asRaid("Eater of Worlds");
  }
  if (/leviathan,\s*spire of stars/i.test(text)) {
    return asRaid("Spire of Stars");
  }
  if (/leviathan/i.test(text)) return asRaid("Leviathan");

  if (/banshee/i.test(text)) return asVendor("Banshee-44");
  if (/x[uû]r/i.test(text)) return asVendor("Xûr");
  if (/arach jalaal/i.test(text)) return asVendor("Arach Jalaal");
  if (/executor hideo/i.test(text)) return asVendor("Executor Hideo");
  if (/lakshmi/i.test(text)) return asVendor("Lakshmi-2");
  if (/saint-14/i.test(text)) return asVendor("Saint-14");
  if (/drifter rank/i.test(text)) return { category: "Gambit" };

  if (/special offer|pre-order|charity|handed out|promotion/i.test(text)) {
    return { category: "Special offer" };
  }

  if (/season \d+:/i.test(text)) {
    const questLabel = text
      .replace(/^Complete the\s+/i, "")
      .replace(/\s+quest\.?$/i, "")
      .replace(/^"|"$/g, "");
    return asSeasonal(questLabel);
  }

  if (text.length <= 40 && !/^complete /i.test(text) && !/^earn /i.test(text)) {
    const named = classifyNamedActivity(text, text);
    if (named) return named;
    return { category: text };
  }

  return {
    category: text.length > 48 ? `${text.slice(0, 45)}…` : text,
  };
}

/** @deprecated Prefer `resolveShaderAcquisition`. */
export function shaderAcquisitionLabel(source = ""): string {
  return resolveShaderAcquisition(source).category;
}

export function isNestedAcquisitionCategory(category: string): boolean {
  return (
    category === RAIDS_CATEGORY ||
    category === DUNGEONS_CATEGORY ||
    category === DESTINATIONS_CATEGORY ||
    category === EVENTS_CATEGORY ||
    category === SEASONALS_CATEGORY ||
    category === VENDORS_CATEGORY
  );
}

/** @deprecated Use `isNestedAcquisitionCategory`. */
export function isRaidOrDungeonCategory(category: string): boolean {
  return isNestedAcquisitionCategory(category);
}

function categoryRelevance(label: string): number {
  const known = CATEGORY_RELEVANCE.get(label);
  if (known !== undefined) return known;
  if (label.length <= 40 && !label.includes("…")) {
    return DEFAULT_SEASONAL_RELEVANCE;
  }
  return DEFAULT_MISC_RELEVANCE;
}

/** Sort acquisition categories by gameplay relevance. */
export function compareShaderAcquisitionLabels(a: string, b: string): number {
  const pa = categoryRelevance(a);
  const pb = categoryRelevance(b);
  if (pa !== pb) return pa - pb;
  return a.localeCompare(b);
}

/** Sort nested detail names within a bucket. */
export function compareNestedAcquisitionDetails(
  category: string,
  a: string,
  b: string,
): number {
  const order =
    category === DUNGEONS_CATEGORY
      ? DUNGEON_DETAIL_ORDER
      : category === DESTINATIONS_CATEGORY
        ? DESTINATION_DETAIL_ORDER
        : category === EVENTS_CATEGORY
          ? EVENT_DETAIL_ORDER
          : category === SEASONALS_CATEGORY
            ? SEASONAL_DETAIL_ORDER
            : category === VENDORS_CATEGORY
              ? VENDOR_DETAIL_ORDER
              : RAID_DETAIL_ORDER;
  const ia = detailOrderIndex(a, order);
  const ib = detailOrderIndex(b, order);
  if (ia !== ib) return ia - ib;
  return a.localeCompare(b);
}

/** @deprecated Use `compareNestedAcquisitionDetails`. */
export function compareRaidOrDungeonDetails(
  category: string,
  a: string,
  b: string,
): number {
  return compareNestedAcquisitionDetails(category, a, b);
}

export function shaderAcquisitionGroupId(label: string): string {
  return label
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
