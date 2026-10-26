/**
 * Destinations index + pages. Loot is matched on the catalog "Source" text;
 * triumphs come from the destination's triumph group (or Legends sections).
 * Pages are built one by one with each expansion (`built`).
 */
export type Destination = {
  slug: string;
  name: string;
  /** Expansion / era that introduced it (header eyebrow, card label). */
  era: string;
  /** Header and card art in /public/images/destinations. */
  imageFile: string;
  /** Matches catalog item sources that drop here. */
  sourcePattern: RegExp;
  /** Reissued gear whose catalog source still names its old season (e.g. Seventh Seraph). */
  extraItems?: { namePattern: RegExp; types: string[] };
  /** Triumph group slug, or Legends section paths when the destination has no group. */
  triumphs: { group: string } | { group: string; sections: [string, string][] } | null;
  /** Seal tied to the destination (counted in "Destination titles"). */
  titleSlug?: string;
  /**
   * Vendor reputation (Bungie progression), from Throne World onward.
   * maxRank = last rank in the manifest rank table (later ranks repeat the last reward).
   */
  reputation?: { vendor: string; progressionHash: string; maxRank: number };
  /** Weekly rotation shown in "This week" (from data/featured-activities.json). */
  weekly?: "nightmare-hunts" | "europa" | "dreaming-city" | "throne-world";
  vaulted?: boolean;
  /** Page available (destinations are built one at a time). */
  built?: boolean;
};

/** Index order: newest first; vaulted destinations last. */
export const DESTINATIONS: Destination[] = [
  {
    slug: "kepler",
    name: "Kepler",
    era: "The Edge of Fate",
    imageFile: "kepler.webp",
    sourcePattern: /kepler/i,
    triumphs: { group: "kepler" },
    titleSlug: "the-edge-of-fate",
  },
  {
    slug: "the-pale-heart",
    name: "The Pale Heart",
    era: "The Final Shape",
    imageFile: "the-pale-heart.webp",
    sourcePattern: /pale heart/i,
    triumphs: { group: "the-pale-heart" },
    titleSlug: "the-final-shape",
    reputation: { vendor: "Ghost", progressionHash: "3011295063", maxRank: 16 },
  },
  {
    slug: "neomuna",
    name: "Neomuna",
    era: "Lightfall",
    imageFile: "neomuna.webp",
    sourcePattern: /neomuna/i,
    triumphs: { group: "neomuna" },
    titleSlug: "lightfall",
    reputation: { vendor: "Nimbus", progressionHash: "1807348350", maxRank: 30 },
  },
  {
    slug: "throne-world",
    name: "Throne World",
    era: "The Witch Queen",
    imageFile: "throne-world.webp",
    sourcePattern: /exploring the throne world/i,
    triumphs: { group: "throne-world" },
    titleSlug: "the-witch-queen",
    reputation: { vendor: "Fynch", progressionHash: "4203877294", maxRank: 30 },
    weekly: "throne-world",
    built: true,
  },
  {
    slug: "europa",
    name: "Europa",
    era: "Beyond Light",
    imageFile: "europa.webp",
    sourcePattern: /europa|europan/i,
    triumphs: { group: "europa" },
    titleSlug: "beyond-light",
    weekly: "europa",
    built: true,
  },
  {
    slug: "the-moon",
    name: "The Moon",
    era: "Shadowkeep",
    imageFile: "the-moon.webp",
    sourcePattern: /exploring the moon|^the moon$|altars of sorrow|nightmare hunt|ghosts of the moon/i,
    triumphs: { group: "the-moon" },
    titleSlug: "shadowkeep",
    weekly: "nightmare-hunts",
    built: true,
  },
  {
    slug: "dreaming-city",
    name: "Dreaming City",
    era: "Forsaken",
    imageFile: "dreaming-city.webp",
    sourcePattern: /dreaming city/i,
    triumphs: { group: "dreaming-city" },
    titleSlug: "the-dreaming-city",
    weekly: "dreaming-city",
    built: true,
  },
  {
    slug: "nessus",
    name: "Nessus",
    era: "Red War",
    imageFile: "nessus.webp",
    sourcePattern: /nessus/i,
    triumphs: { group: "nessus" },
    built: true,
  },
  {
    slug: "european-dead-zone",
    name: "European Dead Zone",
    era: "Red War",
    imageFile: "european-dead-zone.webp",
    sourcePattern: /european dead zone|\bedz\b/i,
    triumphs: { group: "european-dead-zone" },
    built: true,
  },
  {
    slug: "cosmodrome",
    name: "Cosmodrome",
    era: "New Light",
    imageFile: "cosmodrome.webp",
    sourcePattern: /cosmodrome/i,
    // Seventh Seraph armor + weapons (Season of the Worthy) now drop in the Cosmodrome.
    extraItems: { namePattern: /^Seventh Seraph /, types: ["Armor", "Weapon"] },
    triumphs: {
      group: "legends",
      sections: [
        ["Exploration", "Cosmodrome"],
        ["Strikes", "Cosmodrome"],
      ],
    },
    built: true,
  },
  {
    slug: "mars",
    name: "Mars",
    era: "Warmind",
    imageFile: "mars.webp",
    sourcePattern: /\bmars\b/i,
    triumphs: null,
    vaulted: true,
  },
  {
    slug: "mercury",
    name: "Mercury",
    era: "Curse of Osiris",
    imageFile: "mercury.webp",
    sourcePattern: /mercury/i,
    triumphs: null,
    vaulted: true,
  },
  {
    slug: "tangled-shore",
    name: "Tangled Shore",
    era: "Forsaken",
    imageFile: "tangled-shore.webp",
    sourcePattern: /tangled shore/i,
    triumphs: null,
    vaulted: true,
  },
  {
    slug: "titan",
    name: "Titan",
    era: "Red War",
    imageFile: "titan.webp",
    sourcePattern: /saturn's moon, titan/i,
    triumphs: null,
    vaulted: true,
  },
  {
    slug: "io",
    name: "Io",
    era: "Red War",
    imageFile: "io.webp",
    sourcePattern: /\bon io\b|\bio\.$/i,
    triumphs: null,
    vaulted: true,
  },
];

export function destinationImageUrl(destination: Destination): string {
  return `/images/destinations/${destination.imageFile}`;
}
