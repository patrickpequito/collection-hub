import type { ActivityEntry } from "@/types/activity-loot";

export const RAIDS: ActivityEntry[] = [
  { slug: "vault-of-glass", title: "Vault of Glass", available: true, imageFile: "vault-of-glass.webp" },
  { slug: "crotas-end", title: "Crota's End", available: false },
  { slug: "kings-fall", title: "King's Fall", available: false },
  { slug: "leviathan", title: "Leviathan", available: false },
  { slug: "last-wish", title: "Last Wish", available: false },
  { slug: "scourge-of-the-past", title: "Scourge of the Past", available: false },
  { slug: "crown-of-sorrow", title: "Crown of Sorrow", available: false },
  { slug: "garden-of-salvation", title: "Garden of Salvation", available: false },
  { slug: "deep-stone-crypt", title: "Deep Stone Crypt", available: false },
  { slug: "vow-of-the-disciple", title: "Vow of the Disciple", available: false },
  { slug: "root-of-nightmares", title: "Root of Nightmares", available: false },
  { slug: "salvations-edge", title: "Salvation's Edge", available: false },
  { slug: "the-desert-perpetual", title: "The Desert Perpetual", available: false },
];

export const DUNGEONS: ActivityEntry[] = [
  { slug: "the-shattered-throne", title: "The Shattered Throne", available: false },
  { slug: "pit-of-heresy", title: "Pit of Heresy", available: false },
  { slug: "prophecy", title: "Prophecy", available: false },
  { slug: "grasp-of-avarice", title: "Grasp of Avarice", available: false },
  { slug: "duality", title: "Duality", available: false },
  { slug: "spire-of-the-watcher", title: "Spire of the Watcher", available: false },
  { slug: "ghosts-of-the-deep", title: "Ghosts of the Deep", available: false },
  { slug: "warlords-ruin", title: "Warlord's Ruin", available: false },
  { slug: "vespers-host", title: "Vesper's Host", available: false },
  { slug: "sundered-doctrine", title: "Sundered Doctrine", available: false },
  { slug: "equilibrium", title: "Equilibrium", available: false },
];

export function getActivityHref(entry: ActivityEntry): string | null {
  if (!entry.available) return null;
  return `/rad-loot/${entry.slug}`;
}
