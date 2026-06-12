export const CURRENT_VERSION = "0.6.0";

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
  "Monument of Triumph loot vendor and rewards (beyond triumphs and titles).",
  "Full rework of the Armor Sets page.",
  "Dedicated gear pages with weapon and armor stats, perks, recommended god rolls, and a view of what you own — highlighting your best roll or the one closest to the god roll.",
  "Rework the Exotics page layout and browsing experience.",
  "Eververse Rotation — complete daily Bright Dust shop. Blocked until Bungie exposes daily offers in the API again after Destiny 2 update 9.7.0.",
];

/**
 * Newest release first. Add a new entry at the top when shipping an update.
 */
export const UPDATE_RELEASES: UpdateRelease[] = [
  {
    version: "0.6.0",
    publishedAt: "2026-06-14",
    summary:
      "Monument of Triumph triumphs and the Immortal title join the Triumphs hub. Pantheon 2.0 is added to RAD Loot with a full activity page. Eververse Rotation debuts in early access. Faster page loads and smoother navigation across the site.",
    sections: [
      {
        title: "Triumphs",
        description:
          "Monument of Triumph from update 9.7.0 — triumphs, categories, and title tracking.",
        items: [
          "New Monument of Triumph group with five sections: Worlds, Stories, Combat, Teamwork, and Competitions.",
          "Browse every MoT triumph with objectives, progress bars, and rewards when signed in with Bungie.",
          "Track the Immortal title — base seal progress and gilding requirements on a dedicated title page.",
          "Monument of Triumph home banner now links to the live triumph group (no longer coming soon).",
        ],
      },
      {
        title: "RAD Loot",
        description: "Pantheon 2.0 endgame raid added to the Raids column.",
        items: [
          "Pantheon 2.0 listed at the top of the Raids column on the RAD Loot index.",
          "Full activity page with Pantheos Resplendent armor sets for all three classes, raid weapons, and cosmetics.",
          "Pantheon completion counts on the activity banner when signed in.",
          "Linked Pantheon triumphs on the activity page.",
        ],
      },
      {
        title: "Home & navigation",
        description: "Hub and nav updates for the new sections.",
        items: [
          "Eververse Rotation banner and nav link added.",
        ],
      },
      {
        title: "Performance",
        description:
          "Faster loads across the site — pages render first, Bungie data follows in the background.",
        items: [
          "Global loading indicator when moving between sections: centered spinner with a dimmed overlay so the current page stays visible until the next one is ready.",
          "Home, Exotics, Armor sets, and Eververse show catalogs immediately; collection ownership and triumph scores load afterward when signed in.",
          "RAD Loot index opens with activity banners right away; completion counts and title seal status fill in after sign-in data arrives.",
          "Server-side caching for catalog data and Bungie membership resolution — fewer repeated API calls per visit.",
          "Eververse rotation uses a daily cache by default instead of forcing a live Bungie fetch on every page load.",
          "Activity loot pages fetch inventory, triumph progress, and raid completions in parallel when signed in.",
        ],
      },
      {
        title: "Eververse Rotation",
        description:
          "Early access — today's Bright Dust shop at Tess Everis.",
        items: [
          "New page with ownership highlighting and a daily reset countdown.",
          "Incomplete until Bungie exposes daily Bright Dust offers in the API again after update 9.7.0. Only partial data is available for now; use in-game Eververse or the Companion App for the full daily shop.",
        ],
      },
    ],
  },
  {
    version: "0.5.1",
    publishedAt: "2026-06-08",
    summary:
      "Home page placeholders and a sign-in fix for Bungie accounts linked to more than one platform.",
    sections: [
      {
        title: "Home",
        description: "New coming-soon banner and copy update.",
        items: [
          "Eververse Rotations added as a coming-soon banner after Exotics.",
          "Monument of Triumph description updated to: “The final triumphs and loot to chase in one place.”",
        ],
      },
      {
        title: "Sign-in",
        description: "Bungie accounts with multiple linked platforms.",
        items: [
          "Fixed an issue where sign-in could target the wrong platform (for example Xbox with Destiny 1 only) instead of the account that actually has Destiny 2.",
          "Collection progress, triumphs, and activity stats now resolve the correct Destiny 2 profile when your Bungie account has several memberships.",
        ],
      },
    ],
  },
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
