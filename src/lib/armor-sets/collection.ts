import { existsSync } from "node:fs";
import path from "node:path";
import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import { DUNGEONS, LEGACY_RAIDS, PANTHEON, RAID_LAIRS, RAIDS } from "@/data/rad-loot/activities";
import { EXPANSION_HUBS, PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";
import { getSeasonHub, getSeasonSlugs, PUBLISHED_SEASON_SLUGS } from "@/data/seasons";
import { resolveCrucibleLoot } from "@/lib/activities/crucible-loot";
import { resolveGambitLoot } from "@/lib/activities/gambit-loot";
import { resolveIronBannerLoot } from "@/lib/activities/iron-banner-loot";
import { resolveTrialsOfOsirisLoot } from "@/lib/activities/trials-of-osiris-loot";
import { resolveVanguardOpsLoot } from "@/lib/activities/vanguard-ops-loot";
import { toLootItemFromCatalog } from "@/lib/activities/loot-item";
import { loadAllLootCatalog } from "@/lib/all-loot/search";
import { loadArmorSetCatalog } from "@/lib/armor-sets/load";
import {
  armorSetPreviewUrl,
  resolveActivityArmorSetPreviewFiles,
  resolveArmorSetPreviewFile,
} from "@/lib/armor-sets/preview-images";
import { loadArmorSetBonusCatalog, resolveArmorSetBonuses } from "@/lib/armor/set-bonuses";
import { resolveAllEververseOrnamentSets } from "@/lib/eververse/resolve-eververse";
import { resolveExpansionLoot } from "@/lib/expansions/resolve-expansion-loot";
import { resolveSeasonLoot } from "@/lib/seasons/resolve-season-loot";
import type { LegacyArmorSetGroup, ResolvedActivityHubLoot } from "@/types/activity-hub";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { ArmorSetBonus } from "@/types/armor-set-bonuses";

export type ArmorSetOriginGroup =
  | "raids"
  | "dungeons"
  | "seasons"
  | "expansions"
  | "playlists"
  | "events"
  | "eververse";

export type ArmorSetClass = "hunter" | "titan" | "warlock";
export type ArmorSetSlot = keyof ActivityArmorRow["pieces"];

export type ArmorSetEntry = {
  id: string;
  name: string;
  /** Eververse ornaments never count toward the page totals. */
  kind: "armor" | "ornament" | "eververse";
  group: ArmorSetOriginGroup;
  /** Playlist / event name inside its group. */
  subgroup?: string;
  /** "Vault of Glass · Raid", "S17 Season of the Haunted · Season pass"… */
  originLabel: string;
  href?: string;
  previewUrl?: string;
  classes: Partial<Record<ArmorSetClass, Partial<Record<ArmorSetSlot, LootItem>>>>;
  /** Armor 3.0 tiered sets: 2- and 4-piece bonuses. */
  bonus?: { twoPiece: ArmorSetBonus | null; fourPiece: ArmorSetBonus | null };
  /** Original release season (earliest version of its pieces); newest first. */
  releaseSeason: number;
  /** Expansion world-loot pool: shown only if the set also lives somewhere else. */
  worldLoot?: boolean;
};

export type ArmorSetReviewItem = {
  name: string;
  reason: string;
  detail: string;
};

export type ArmorSetCollection = {
  sets: ArmorSetEntry[];
  review: ArmorSetReviewItem[];
};

export const PLAYLIST_SUBGROUPS = [
  "Vanguard Ops",
  "Crucible",
  "Gambit",
  "Iron Banner",
  "Trials of Osiris",
] as const;
export const EVENT_SUBGROUPS = [
  "The Dawning",
  "Festival of the Lost",
  "Solstice",
  "Crimson Days",
  "Guardian Games",
] as const;

/** Earlier origins win when the same set shows up in several places. */
const GROUP_PRIORITY: ArmorSetOriginGroup[] = [
  "raids",
  "dungeons",
  "playlists",
  "events",
  "seasons",
  "expansions",
  "eververse",
];

function previewIfExists(file: string | undefined): string | undefined {
  if (!file) return undefined;
  const url = armorSetPreviewUrl(file);
  return existsSync(path.join(process.cwd(), "public", url)) ? url : undefined;
}

function classesFromRows(rows: ActivityArmorRow[]): ArmorSetEntry["classes"] {
  const classes: ArmorSetEntry["classes"] = {};
  for (const row of rows) {
    classes[row.guardianClass] = { ...(classes[row.guardianClass] ?? {}), ...row.pieces };
  }
  return classes;
}

function pieceCount(classes: ArmorSetEntry["classes"]): number {
  return Object.values(classes).reduce(
    (sum, slots) => sum + Object.values(slots ?? {}).filter(Boolean).length,
    0,
  );
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(ornaments?|set)$/, "")
    .replace(/'s$/, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Rows → sets. Older activities name each class's set differently (Emperor's
 * Agent / Champion / Minister), listed Hunter → Titan → Warlock, so a set is
 * one row per class: a class seen twice starts the next set.
 */
function groupRowsBySet(rows: ActivityArmorRow[]): Map<string, ActivityArmorRow[]> {
  const sets: ActivityArmorRow[][] = [];
  let current: ActivityArmorRow[] = [];
  for (const row of rows) {
    if (current.some((entry) => entry.guardianClass === row.guardianClass)) {
      sets.push(current);
      current = [];
    }
    current.push(row);
  }
  if (current.length > 0) sets.push(current);

  const bySet = new Map<string, ActivityArmorRow[]>();
  for (const group of sets) {
    const name = [...new Set(group.map((row) => row.setName))].join(" / ");
    bySet.set(name, [...(bySet.get(name) ?? []), ...group]);
  }
  return bySet;
}

/** Preview for a set named "A / B / C": try each name. */
function previewForSetName(name: string): string | undefined {
  for (const part of [name, ...name.split(" / ")]) {
    const url = previewIfExists(resolveArmorSetPreviewFile(part));
    if (url) return url;
  }
  return undefined;
}

const PLAYLIST_RESOLVERS: { name: (typeof PLAYLIST_SUBGROUPS)[number]; slug: string; load: () => Promise<ResolvedActivityHubLoot> }[] = [
  { name: "Vanguard Ops", slug: "vanguard-ops", load: resolveVanguardOpsLoot },
  { name: "Crucible", slug: "crucible", load: resolveCrucibleLoot },
  { name: "Gambit", slug: "gambit", load: resolveGambitLoot },
  { name: "Iron Banner", slug: "iron-banner", load: resolveIronBannerLoot },
  { name: "Trials of Osiris", slug: "trials-of-osiris", load: resolveTrialsOfOsirisLoot },
];

/**
 * Every armor and ornament set the site already curates (raids, dungeons,
 * seasons, expansions, playlists, events) plus Eververse ornaments, in one
 * list. Anything ambiguous goes to `review` for a manual check.
 */
export async function loadArmorSetCollection(): Promise<ArmorSetCollection> {
  const candidates: ArmorSetEntry[] = [];
  const review: ArmorSetReviewItem[] = [];

  const add = (entry: Omit<ArmorSetEntry, "id" | "releaseSeason">) => {
    if (pieceCount(entry.classes) === 0) return;
    candidates.push({
      ...entry,
      releaseSeason: 0,
      id: `${entry.group}-${normalize(entry.name)}-${candidates.length}`,
    });
  };
  const addGroups = (
    groups: LegacyArmorSetGroup[],
    origin: Pick<ArmorSetEntry, "group" | "subgroup" | "originLabel" | "href" | "worldLoot">,
    ornamentKind: ArmorSetEntry["kind"] = "ornament",
  ) => {
    for (const group of groups) {
      add({
        ...origin,
        name: group.displayName?.replace(/\s+ornaments$/, "") ?? group.setName,
        kind: group.kind === "ornament" ? ornamentKind : "armor",
        originLabel:
          group.seasonLabel && origin.group !== "seasons" && !origin.originLabel.includes(group.seasonLabel)
            ? `${origin.originLabel} · ${group.seasonLabel}`
            : origin.originLabel,
        previewUrl: previewIfExists(group.previewFile ?? resolveArmorSetPreviewFile(group.setName)),
        classes: classesFromRows(group.rows),
      });
    }
  };

  // Raids, raid lairs, dungeons, Pantheon.
  const activities = [
    ...[...RAIDS, ...LEGACY_RAIDS, ...RAID_LAIRS].map((entry) => ({ entry, group: "raids" as const, kind: "Raid" })),
    ...DUNGEONS.map((entry) => ({ entry, group: "dungeons" as const, kind: "Dungeon" })),
    { entry: PANTHEON, group: "raids" as const, kind: "Endgame" },
  ];
  for (const { entry, group, kind } of activities) {
    const page = getActivityLootPage(entry.slug);
    if (!page) continue;
    const previews = resolveActivityArmorSetPreviewFiles(entry.slug, page.armorSetPreviewFiles);
    for (const [setName, rows] of groupRowsBySet(page.armorSets)) {
      add({
        name: setName,
        kind: "armor",
        group,
        originLabel: `${entry.title} · ${kind}`,
        href: entry.available ? `/activities/${entry.slug}` : undefined,
        previewUrl: previewForSetName(setName) ?? previewIfExists(previews[0]),
        classes: classesFromRows(rows),
      });
    }
    if (kind === "Endgame" && page.armorSets.length > 0) {
      review.push({
        name: page.armorSets[0].setName,
        reason: "Origin to confirm",
        detail: "Pantheon armor is listed under Raids for now.",
      });
    }
  }

  // Playlists: current rotation + legacy sets.
  for (const playlist of PLAYLIST_RESOLVERS) {
    const loot = await playlist.load();
    const origin = {
      group: "playlists" as const,
      subgroup: playlist.name,
      originLabel: playlist.name,
      href: `/activities/${playlist.slug}`,
    };
    for (const [setName, rows] of groupRowsBySet(loot.currentArmorRows)) {
      add({
        ...origin,
        name: setName,
        kind: "armor",
        previewUrl: previewForSetName(setName),
        classes: classesFromRows(rows),
      });
    }
    for (const panel of loot.currentArmorPanels ?? []) {
      for (const [setName, rows] of groupRowsBySet(panel.armorRows)) {
        add({
          ...origin,
          name: setName,
          kind: "armor",
          previewUrl: previewForSetName(setName),
          classes: classesFromRows(rows),
        });
      }
    }
    addGroups(loot.legacyArmorGroups, origin);
    addGroups(loot.yearOfProphecyArmorGroups ?? [], origin);
  }

  // Seasons (armor + seasonal ornaments).
  for (const slug of getSeasonSlugs()) {
    const hub = getSeasonHub(slug);
    if (!hub) continue;
    const loot = await resolveSeasonLoot(hub);
    addGroups(loot.armorGroups, {
      group: "seasons",
      originLabel: hub.seasonLabel,
      href: PUBLISHED_SEASON_SLUGS.has(slug) ? `/seasons/${slug}` : undefined,
    });
  }

  // Expansions: destination armor + deep loot pools (playlist pools go to Playlists).
  for (const hub of EXPANSION_HUBS) {
    const loot = await resolveExpansionLoot(hub);
    const href = PUBLISHED_EXPANSION_SLUGS.has(hub.slug) ? `/expansions/${hub.slug}` : undefined;
    for (const [setName, rows] of groupRowsBySet(loot.destinationArmorRows)) {
      add({
        name: setName,
        kind: "armor",
        group: "expansions",
        originLabel: `${hub.title} · ${hub.destinationTitle.replace(/^Destination\s*\/\/\s*/i, "")}`,
        href,
        previewUrl: previewForSetName(setName),
        classes: classesFromRows(rows),
      });
    }
    for (const pool of loot.deepLootPools) {
      const playlist = PLAYLIST_SUBGROUPS.find((name) => name === pool.title);
      addGroups(
        pool.armorGroups,
        playlist
          ? { group: "playlists", subgroup: playlist, originLabel: `${playlist} · ${hub.title}`, href }
          : { group: "expansions", originLabel: `${hub.title} · ${pool.title}`, href, worldLoot: true },
      );
    }
  }

  // Events and loose sets from the legacy armor-set catalog.
  const legacyCatalog = await loadArmorSetCatalog();
  const allLoot = await loadAllLootCatalog();
  const catalogByHash = new Map(allLoot.items.map((item) => [item.itemHash, item]));
  const known = new Set(
    candidates.flatMap((entry) => [entry.name, ...entry.name.split(" / ")].map(normalize)),
  );
  // Piece names too: the old catalog sometimes names a set differently.
  const knownPieces = new Set(
    candidates.flatMap((entry) =>
      Object.values(entry.classes).flatMap((slots) => Object.values(slots ?? {}).map((piece) => piece!.itemHash)),
    ),
  );
  for (const set of legacyCatalog.sets) {
    const event = EVENT_SUBGROUPS.find((name) =>
      new RegExp(name.replace(/^The /, ""), "i").test(`${set.sourceLabel} ${set.source}`),
    );
    const classes: ArmorSetEntry["classes"] = {};
    for (const [guardianClass, slots] of Object.entries(set.classes)) {
      const mapped: Partial<Record<ArmorSetSlot, LootItem>> = {};
      for (const [slot, piece] of Object.entries(slots ?? {})) {
        if (!piece) continue;
        const catalogItem = catalogByHash.get(piece.itemHash);
        mapped[slot as ArmorSetSlot] = catalogItem
          ? toLootItemFromCatalog(catalogItem)
          : { itemHash: piece.itemHash, name: piece.name, iconPath: piece.iconPath, source: set.source };
      }
      classes[guardianClass as ArmorSetClass] = mapped;
    }
    if (event) {
      add({
        name: set.name,
        kind: "armor",
        group: "events",
        subgroup: event,
        originLabel: event,
        previewUrl: previewIfExists(resolveArmorSetPreviewFile(set.name)),
        classes,
      });
    } else if (
      !known.has(normalize(set.name)) &&
      !Object.values(set.classes).some((slots) =>
        Object.values(slots ?? {}).some((piece) => piece && knownPieces.has(piece.itemHash)),
      )
    ) {
      review.push({
        name: set.name,
        reason: "Not placed",
        detail: `Only in the old armor-set catalog (source: ${set.sourceLabel || set.source}).`,
      });
    }
  }

  // Eververse ornament sets, by season.
  for (const group of resolveAllEververseOrnamentSets(allLoot.items)) {
    add({
      name: group.displayName?.replace(/\s+ornaments$/, "") ?? group.setName,
      kind: "eververse",
      group: "eververse",
      originLabel: group.seasonLabel ? `${group.seasonLabel} · Eververse` : "Eververse",
      previewUrl: previewIfExists(group.previewFile),
      classes: classesFromRows(group.rows),
    });
  }

  // One entry per set: keep the highest-priority origin, note the rest.
  const byKey = new Map<string, ArmorSetEntry>();
  for (const entry of candidates) {
    const key = `${entry.kind === "armor" ? "armor" : "ornament"}::${normalize(entry.name)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, entry);
      continue;
    }
    const keep =
      GROUP_PRIORITY.indexOf(entry.group) < GROUP_PRIORITY.indexOf(existing.group) ? entry : existing;
    const drop = keep === entry ? existing : entry;
    if (keep.group !== drop.group || keep.subgroup !== drop.subgroup) {
      review.push({
        name: keep.name,
        reason: "Found in two places",
        detail: `Shown under “${keep.originLabel}”; also in “${drop.originLabel}”.`,
      });
    }
    // Merge classes so a partial copy never hides pieces.
    for (const [guardianClass, slots] of Object.entries(drop.classes)) {
      keep.classes[guardianClass as ArmorSetClass] = {
        ...(slots ?? {}),
        ...(keep.classes[guardianClass as ArmorSetClass] ?? {}),
      };
    }
    keep.previewUrl ??= drop.previewUrl;
    byKey.set(key, keep);
  }

  // World-loot sets only stay when they also live elsewhere (playlist, season…).
  for (const [key, entry] of byKey) {
    if (!entry.worldLoot) continue;
    byKey.delete(key);
    review.push({
      name: entry.name,
      reason: "Origin unclear",
      detail: `Only in ${entry.originLabel} (world drops). Not shown until it has an origin.`,
    });
  }

  // Catalog lookups by any hash (rad-loot data still uses older hashes).
  const catalogByAnyHash = new Map<string, (typeof allLoot.items)[number]>();
  for (const item of allLoot.items) {
    for (const hash of [item.itemHash, ...(item.versions ?? []).map((version) => version.itemHash)]) {
      if (!catalogByAnyHash.has(hash)) catalogByAnyHash.set(hash, item);
    }
  }
  const piecesOfEntry = (entry: ArmorSetEntry) =>
    Object.values(entry.classes).flatMap((slots) => Object.values(slots ?? {}).filter(Boolean) as LootItem[]);
  const catalogItemsOf = (entry: ArmorSetEntry) =>
    piecesOfEntry(entry)
      .map((piece) =>
        [piece.itemHash, ...(piece.ownershipHashes ?? [])]
          .map((hash) => catalogByAnyHash.get(hash))
          .find(Boolean),
      )
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Eververse: merge one-set-per-class seasons into one entry, like season pages.
  const eververseBySeason = new Map<string, ArmorSetEntry[]>();
  for (const [key, entry] of byKey) {
    if (entry.kind !== "eververse" || Object.keys(entry.classes).length !== 1) continue;
    byKey.delete(key);
    const season = entry.originLabel;
    eververseBySeason.set(season, [...(eververseBySeason.get(season) ?? []), entry]);
  }
  for (const [season, entries] of eververseBySeason) {
    const byClass = new Map<string, ArmorSetEntry[]>();
    for (const entry of entries) {
      const cls = Object.keys(entry.classes)[0];
      byClass.set(cls, [...(byClass.get(cls) ?? []), entry]);
    }
    const onePerClass =
      byClass.size === 3 && [...byClass.values()].every((list) => list.length === 1);
    if (onePerClass) {
      const ordered = (["hunter", "titan", "warlock"] as const).map((cls) => byClass.get(cls)![0]);
      const merged: ArmorSetEntry = {
        ...ordered[0],
        id: `eververse-${normalize(season)}-merged`,
        name: ordered.map((entry) => entry.name).join(" / "),
        previewUrl: ordered.map((entry) => entry.previewUrl).find(Boolean),
        classes: Object.assign({}, ...ordered.map((entry) => entry.classes)),
      };
      byKey.set(`ornament::${merged.id}`, merged);
    } else {
      for (const entry of entries) {
        review.push({
          name: entry.name,
          reason: "Single class",
          detail: `${season}: only ${Object.keys(entry.classes)[0]}. Which sets are its other classes?`,
        });
      }
    }
  }

  // Armor 3.0 bonuses + original release season.
  const bonusCatalog = await loadArmorSetBonusCatalog();
  const sets: ArmorSetEntry[] = [];
  for (const entry of byKey.values()) {
    const catalogItems = catalogItemsOf(entry);
    const seasons = catalogItems.flatMap((item) => [
      item.seasonNumber,
      ...(item.versions ?? []).map((version) => version.seasonNumber),
    ]).filter((value): value is number => typeof value === "number" && value > 0);
    let next: ArmorSetEntry = { ...entry, releaseSeason: seasons.length ? Math.min(...seasons) : 0 };
    if (entry.kind === "armor") {
      const setHash =
        catalogItems.map((item) => item.equipableItemSetHash).find(Boolean) ??
        piecesOfEntry(entry)
          .flatMap((piece) => [piece.itemHash, ...(piece.ownershipHashes ?? [])])
          .map((hash) => bonusCatalog.itemHashToSetHash?.[hash])
          .find(Boolean) ??
        piecesOfEntry(entry)
          .map((piece) => bonusCatalog.itemNameToSetHash?.[piece.name])
          .find(Boolean);
      if (setHash) {
        const { twoPiece, fourPiece } = resolveArmorSetBonuses(bonusCatalog, setHash);
        if (twoPiece || fourPiece) next = { ...next, bonus: { twoPiece, fourPiece } };
      }
    }
    sets.push(next);
  }

  // Playable raids / dungeons were reissued as Armor 3.0; flag any without bonus data.
  const playableTitles = new Set([...RAIDS, ...DUNGEONS].map((entry) => entry.title));
  for (const entry of sets) {
    if (entry.bonus || (entry.group !== "raids" && entry.group !== "dungeons")) continue;
    if (!playableTitles.has(entry.originLabel.split(" · ")[0])) continue;
    review.push({
      name: entry.name,
      reason: "Armor 3.0 not found",
      detail: `${entry.originLabel}: Bungie's data lists no set bonus for these pieces. Is there a reissued set with another name?`,
    });
  }

  // A set has all three classes with real pieces; anything else is reviewed, not shown.
  const shown: ArmorSetEntry[] = [];
  for (const entry of sets) {
    const classCount = Object.keys(entry.classes).length;
    const perClass = Object.values(entry.classes).map((slots) => Object.values(slots ?? {}).filter(Boolean).length);
    const ok = classCount === 3 && perClass.every((count) => count >= 3);
    if (ok) {
      shown.push(entry);
      continue;
    }
    review.push({
      name: entry.name,
      reason: classCount < 3 ? "Single class" : "Loose pieces",
      detail:
        classCount < 3
          ? `${entry.originLabel}: only ${Object.keys(entry.classes).join(", ") || "no"} class. Which sets are its other classes?`
          : `${entry.originLabel}: ${perClass.join(" / ")} pieces per class.`,
    });
  }

  return {
    sets: shown.sort((a, b) => b.releaseSeason - a.releaseSeason || a.name.localeCompare(b.name)),
    review,
  };
}
