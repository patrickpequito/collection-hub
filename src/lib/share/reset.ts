import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import { featuredActivityEntries, loadFeaturedActivities } from "@/lib/rad-loot/featured-activities";
import { loadHomeThisWeek, type PantheonFeaturedBoss } from "@/lib/home/this-week";
import { bungieUrl, localImage, localImageBlack } from "@/lib/share/assets";

/**
 * The exotic shown next to each featured raid / dungeon in the weekly reset image.
 * Quest exotics stand in for activities without a drop (Divinity, Wish-Ender, Xenophage,
 * Gjallarhorn); Spire of Stars, Eater of Worlds, Leviathan and Prophecy show none.
 */
const ACTIVITY_EXOTIC: Record<string, string> = {
  "crotas-end": "Necrochasm",
  "crown-of-sorrow": "Tarrabah",
  "deep-stone-crypt": "Eyes of Tomorrow",
  duality: "Heartshadow",
  equilibrium: "Heirloom",
  "garden-of-salvation": "Divinity",
  "ghosts-of-the-deep": "The Navigator",
  "grasp-of-avarice": "Gjallarhorn",
  "kings-fall": "Touch of Malice",
  "last-wish": "One Thousand Voices",
  "pit-of-heresy": "Xenophage",
  "root-of-nightmares": "Conditional Finality",
  "salvations-edge": "Euphony",
  "scourge-of-the-past": "Anarchy",
  "spire-of-the-watcher": "Hierarchy of Needs",
  "sundered-doctrine": "Finality's Auger",
  "the-desert-perpetual": "Whirling Ovation",
  "the-shattered-throne": "Wish-Ender",
  "vault-of-glass": "Vex Mythoclast",
  "vespers-host": "Ice Breaker",
  "vow-of-the-disciple": "Collective Obligation",
  "warlords-ruin": "Buried Bloodline",
};

export type ShareActivityRow = {
  kind: "Raid" | "Dungeon";
  title: string;
  /** Header art as a data URI (null when the file is missing). */
  art: string | null;
  exoticIcon: string | null;
};

export type ShareBoss = PantheonFeaturedBoss & { art: string | null };

export type ResetShareData = {
  weekStart: string;
  weekEnd: string;
  bosses: ShareBoss[];
  rows: ShareActivityRow[];
  destinyIcon: string | null;
  logo: string | null;
  tierIcon: string | null;
  /** Things to check before posting (empty when everything is confirmed). */
  warnings: string[];
};

function exoticIcon(slug: string): string | null {
  const name = ACTIVITY_EXOTIC[slug];
  const weapon = name ? getActivityLootPage(slug)?.weapons.find((item) => item.name === name) : undefined;
  return weapon ? bungieUrl(weapon.iconPath) : null;
}

export async function loadResetShareData(): Promise<ResetShareData> {
  const [featured, entries, week] = await Promise.all([
    loadFeaturedActivities(),
    featuredActivityEntries(),
    loadHomeThisWeek(),
  ]);
  const toRows = (list: typeof entries.raids, kind: ShareActivityRow["kind"]) =>
    Promise.all(
      list.map(async (entry) => ({
        kind,
        title: entry.title,
        art: await localImage(`/images/rad-loot/headers/${entry.slug}-header.webp`, 1200),
        exoticIcon: exoticIcon(entry.slug),
      })),
    );
  const [raids, dungeons, bosses, destinyIcon, logo, tierIcon] = await Promise.all([
    toRows(entries.raids, "Raid"),
    toRows(entries.dungeons, "Dungeon"),
    Promise.all(
      week.pantheon.map(async (boss) => ({ ...boss, art: boss.image ? await localImage(boss.image, 900) : null })),
    ),
    localImage("/images/share/destiny-white.png", 200, true),
    localImage("/icon.png", 120, true),
    localImageBlack("/images/rad-loot/featured.png", 84),
  ]);

  const warnings: string[] = [];
  if (featured.featuredDungeons.length < 2) warnings.push("This week's dungeons are not confirmed yet.");
  if (featured.featuredRaids.length < 2) warnings.push("This week's raids are not confirmed yet.");
  if (week.pantheon.length < 2) warnings.push("Pantheon featured bosses not found (Bungie API unreachable?).");
  for (const boss of bosses) if (!boss.art) warnings.push(`No art for Pantheon boss ${boss.boss}.`);

  return {
    weekStart: featured.weekStart,
    weekEnd: featured.weekEnd,
    bosses,
    rows: [...raids, ...dungeons],
    destinyIcon,
    logo,
    tierIcon,
    warnings,
  };
}

/** "Oct 27 – Nov 3" (UTC). */
export function formatShareWeek(startIso: string, endIso: string): string {
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${format.format(new Date(startIso))} – ${format.format(new Date(endIso))}`;
}
