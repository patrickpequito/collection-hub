import type { ActivityEntry } from "@/types/activity-loot";

export const RAIDS: ActivityEntry[] = [
  { slug: "vault-of-glass", title: "Vault of Glass", available: true, imageFile: "vault-of-glass.webp" },
  {
    slug: "crotas-end",
    title: "Crota's End",
    available: true,
    imageFile: "crotas-end.webp",
  },
  {
    slug: "kings-fall",
    title: "King's Fall",
    available: true,
    imageFile: "kings-fall.webp",
  },
  {
    slug: "last-wish",
    title: "Last Wish",
    available: true,
    imageFile: "last-wish.webp",
  },
  {
    slug: "garden-of-salvation",
    title: "Garden of Salvation",
    available: true,
    imageFile: "garden-of-salvation.webp",
  },
  {
    slug: "deep-stone-crypt",
    title: "Deep Stone Crypt",
    available: true,
    imageFile: "deep-stone-crypt.webp",
  },
  {
    slug: "vow-of-the-disciple",
    title: "Vow of the Disciple",
    available: true,
    imageFile: "vow-of-the-disciple.webp",
  },
  {
    slug: "root-of-nightmares",
    title: "Root of Nightmares",
    available: true,
    imageFile: "root-of-nightmares.webp",
  },
  {
    slug: "salvations-edge",
    title: "Salvation's Edge",
    available: true,
    imageFile: "salvations-edge.webp",
  },
  {
    slug: "the-desert-perpetual",
    title: "The Desert Perpetual",
    available: true,
    imageFile: "the-desert-perpetual.webp",
  },
];

export const DUNGEONS: ActivityEntry[] = [
  {
    slug: "the-shattered-throne",
    title: "The Shattered Throne",
    available: true,
    imageFile: "the-shattered-throne.webp",
  },
  {
    slug: "pit-of-heresy",
    title: "Pit of Heresy",
    available: true,
    imageFile: "pit-of-heresy.webp",
  },
  {
    slug: "prophecy",
    title: "Prophecy",
    available: true,
    imageFile: "prophecy.webp",
  },
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
