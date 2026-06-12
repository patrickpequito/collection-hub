import type { ActivityEntry } from "@/types/activity-loot";

export const RAIDS: ActivityEntry[] = [
  {
    slug: "the-pantheon",
    title: "Pantheon 2.0",
    available: true,
    imageFile: "the-pantheon.webp",
  },
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

export const RAID_LAIRS: ActivityEntry[] = [
  {
    slug: "eater-of-worlds",
    title: "Eater of Worlds",
    available: true,
    imageFile: "eater-of-worlds.webp",
  },
  {
    slug: "spire-of-stars",
    title: "Spire of Stars",
    available: true,
    imageFile: "spire-of-stars.webp",
  },
];

export const LEGACY_RAIDS: ActivityEntry[] = [
  {
    slug: "leviathan",
    title: "Leviathan",
    available: true,
    imageFile: "leviathan.webp",
  },
  {
    slug: "scourge-of-the-past",
    title: "Scourge of the Past",
    available: true,
    imageFile: "scourge-of-the-past.webp",
  },
  {
    slug: "crown-of-sorrow",
    title: "Crown of Sorrow",
    available: true,
    imageFile: "crown-of-sorrow.webp",
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
  {
    slug: "grasp-of-avarice",
    title: "Grasp of Avarice",
    available: true,
    imageFile: "grasp-of-avarice.webp",
  },
  {
    slug: "duality",
    title: "Duality",
    available: true,
    imageFile: "duality.webp",
  },
  {
    slug: "spire-of-the-watcher",
    title: "Spire of the Watcher",
    available: true,
    imageFile: "spire-of-the-watcher.webp",
  },
  {
    slug: "ghosts-of-the-deep",
    title: "Ghosts of the Deep",
    available: true,
    imageFile: "ghosts-of-the-deep.webp",
  },
  {
    slug: "warlords-ruin",
    title: "Warlord's Ruin",
    available: true,
    imageFile: "warlords-ruin.webp",
  },
  {
    slug: "vespers-host",
    title: "Vesper's Host",
    available: true,
    imageFile: "vespers-host.webp",
  },
  {
    slug: "sundered-doctrine",
    title: "Sundered Doctrine",
    available: true,
    imageFile: "sundered-doctrine.webp",
  },
  {
    slug: "equilibrium",
    title: "Equilibrium",
    available: true,
    imageFile: "equilibrium.webp",
  },
];

export function getActivityHref(entry: ActivityEntry): string | null {
  if (!entry.available || entry.placeholder) return null;
  return `/rad-loot/${entry.slug}`;
}
