export const CURRENT_VERSION = "0.5.0";

export type UpdateFeatureSection = {
  title: string;
  /** How this area is organized and what it covers. */
  description: string;
  items: string[];
};

export type UpdateRelease = {
  version: string;
  /** ISO date (YYYY-MM-DD) shown in the UI. */
  publishedAt: string;
  /** Short label shown next to the version, e.g. "First public release". */
  tagline?: string;
  summary: string;
  sections: UpdateFeatureSection[];
};

/** Major sections still in progress before a 1.0 release. */
export const UPDATE_ROADMAP: string[] = [
  "Build the Monument of Triumph section (seasonal and event triumphs).",
  "Full rework of the Armor Sets page.",
  "Dedicated gear pages with weapon and armor stats, perks, recommended god rolls, and a view of what you own — highlighting your best roll or the one closest to the god roll.",
  "Rework the Exotics page layout and browsing experience.",
];

/**
 * Newest release first. Add a new entry at the top when shipping an update.
 */
export const UPDATE_RELEASES: UpdateRelease[] = [
  {
    version: "0.5.0",
    publishedAt: "2026-05-29",
    tagline: "First public release",
    summary:
      "First public release of Destiny 2 Collection Hub. Sign in with Bungie to track what you own across exotics, armor sets, triumphs, and raid and dungeon loot.",
    sections: [
      {
        title: "Home & sign-in",
        description:
          "The home page is the entry point to every section of the app.",
        items: [
          "Sign in with your Bungie account to load collection and triumph progress.",
          "View your Lifetime and Active Triumph Score when signed in.",
          "Jump to each catalog from the section banners: RAD Loot, Triumphs, Armor sets, and Exotics.",
          "Monument of Triumph appears as a coming-soon banner for a future seasonal triumph section.",
        ],
      },
      {
        title: "Exotics",
        description:
          "Browse exotic weapons, armor, and catalysts in one catalog.",
        items: [
          "Filter and browse exotics by slot, weapon type, and Guardian class.",
          "See catalyst progress and whether an exotic is in your collection.",
          "Catalogs work without signing in; Bungie login highlights what you already own.",
        ],
      },
      {
        title: "Armor sets",
        description:
          "Legendary armor sets grouped by where they drop. This section is still being expanded.",
        items: [
          "Browse armor sets from raids, dungeons, seasons, and other sources.",
          "See all five pieces in a set and which ones you are missing.",
          "Track collection progress per set when signed in.",
        ],
      },
      {
        title: "Triumphs",
        description:
          "Triumph groups and titles in two columns on the Triumphs hub.",
        items: [
          "Browse triumph groups such as Lifetime, Renegades, destinations, and Legends.",
          "Open a group to navigate by section icons and subgroups with completion counts.",
          "Read individual triumphs with objectives, progress bars, and rewards.",
          "Track permanent titles and seasonal titles with base and gilding progress.",
          "Open a title page to see seal progress, guardian title tier, and every required triumph.",
          "Hide completed triumphs on title and activity pages when reviewing what is left.",
        ],
      },
      {
        title: "RAD Loot",
        description:
          "Raid and dungeon loot organized into four columns on the RAD Loot index.",
        items: [
          "Raids — current endgame raids with loot pages and completion stats on banners.",
          "Dungeons — dungeon loot pages with the same structure as raids.",
          "Legacy raids — Leviathan, Scourge of the Past, and Crown of Sorrow.",
          "Raid lairs — Eater of Worlds and Spire of Stars.",
          "Open any activity to see weapons, armor sets, triumphs, and other rewards in one place.",
          "View raid completion counts on supported activity pages when signed in.",
          "Activity pages available include King's Fall, Last Wish, Vault of Glass, Crota's End, Prophecy, Vow of the Disciple, Root of Nightmares, Deep Stone Crypt, Garden of Salvation, Salvation's Edge, Desert Perpetual, Equilibrium, Sundered Doctrine, Vesper's Host, Ghosts of the Deep, Warlord's Ruin, and more.",
        ],
      },
    ],
  },
];
