import path from "node:path";
import sharp from "sharp";
import { DESTINATIONS } from "@/data/destinations";
import { localImage } from "@/lib/share/assets";
import { loadDestinationCurse, loadDestinationWeekly } from "@/lib/destinations/weekly";
import { loadPathfinderBoard, pathfinderOverthrowRegions } from "@/lib/destinations/pathfinder";

/**
 * Destinations share image (approved design "V3"): seven equal tiles, one image and one look
 * per destination, each rotation on one line ("TYPE · value"). The Pale Heart shows the
 * Pathfinder board's Overthrow regions. Destinations whose weekly rotation isn't tracked
 * yet show "Rotation coming soon".
 */

const ORDER = ["kepler", "the-pale-heart", "neomuna", "throne-world", "europa", "the-moon", "dreaming-city"] as const;
export type DestinationSlug = (typeof ORDER)[number];

/** Rotation labels as shown on the card (the site uses longer ones). */
const SHORT_LABEL: Record<string, string> = {
  "Ascendant Challenge": "Ascendant",
  "Altars of Reflection": "Altars",
};
/** Shown on the web but left out of the card (daily, or not something people look for). */
const SKIPPED_LABELS = new Set(["Petra's location"]);
const MAX_ROWS = 3;

export type DestinationRow = { label: string; value: string; curse?: { current: number; levels: number } };
export type DestinationTile = { slug: DestinationSlug; name: string; art: string | null; rows: DestinationRow[] };

/** Europa's art is a red Exo lab: tinted ice blue to match its card. */
async function europaArt(): Promise<string | null> {
  try {
    const buffer = await sharp(path.join(process.cwd(), "public/images/destinations/europa.webp"))
      .resize({ width: 900 })
      .tint({ r: 110, g: 165, b: 240 })
      .jpeg({ quality: 86 })
      .toBuffer();
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

async function rowsFor(slug: DestinationSlug): Promise<DestinationRow[]> {
  // Pale Heart: the Pathfinder board's Overthrow regions for the week.
  if (slug === "the-pale-heart") {
    const board = await loadPathfinderBoard();
    const regions = board ? pathfinderOverthrowRegions(board) : [];
    return regions.length ? [{ label: "Overthrow", value: regions.join(" · ") }] : [];
  }
  const destination = DESTINATIONS.find((entry) => entry.slug === slug);
  if (!destination?.weekly) return [];
  const weekly = (await loadDestinationWeekly(destination)).filter(
    (entry) => !/today/i.test(entry.label) && !SKIPPED_LABELS.has(entry.label),
  );
  const rows: DestinationRow[] = [];
  const curse = loadDestinationCurse(destination);
  if (curse) rows.push({ label: "Curse", value: curse.levels[curse.current], curse: { current: curse.current, levels: curse.levels.length } });
  for (const entry of weekly) {
    const label = SHORT_LABEL[entry.label] ?? entry.label;
    const last = rows.at(-1);
    // Repeated activities (the three Nightmare Hunts) share one line.
    if (last && last.label === label) last.value = `${last.value} · ${entry.name}`;
    else rows.push({ label, value: entry.name });
  }
  for (const row of rows) if (row.value.includes(" · ") && !row.label.endsWith("s")) row.label = `${row.label}s`;
  return rows.slice(0, MAX_ROWS);
}

export async function loadDestinationTiles(): Promise<DestinationTile[]> {
  return Promise.all(
    ORDER.map(async (slug) => ({
      slug,
      name: DESTINATIONS.find((entry) => entry.slug === slug)?.name ?? slug,
      art: slug === "europa" ? await europaArt() : await localImage(`/images/destinations/${slug}.webp`, 900),
      rows: await rowsFor(slug),
    })),
  );
}
