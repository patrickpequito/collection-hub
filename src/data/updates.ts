export const CURRENT_VERSION = "0.7.6";

export function formatReleaseDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

/**
 * Newest release first. Add a new entry at the top when shipping an update.
 */
export const UPDATE_RELEASES: UpdateRelease[] = [
  {
    version: "0.7.6",
    publishedAt: "2026-07-16",
    summary:
      "PvE Activities joins the Loot menu as a hub for Vanguard Ops, Gambit, and RAD Loot, with new Vanguard Ops and Gambit pages that follow the same layout as the PvP activity hubs.",
    sections: [
      {
        title: "PvE Activities",
        description:
          "One entry point for playlist loot, triumphs, and legacy armor across core PvE activities.",
        items: [
          "New PvE Activities page with banners for Vanguard Ops, Gambit, and RAD Loot.",
          "Vanguard Ops hub — current armor sets, obtainable weapons, cosmetics, Cosmodrome and Prison of Elders strike triumphs, Year of the Prophecy armor sets, and legacy armor sets grouped by introduction season.",
          "Gambit hub — current armor, weapons, cosmetics, Dredgen title progress, and legacy armor sets in the same activity-hub layout.",
        ],
      },
    ],
  },
  {
    version: "0.7.5",
    publishedAt: "2026-07-13",
    summary:
      "PvP Activities joins the Loot menu as a hub for Crucible, Iron Banner, and Trials of Osiris, with new Crucible and Trials pages that follow the same layout as Iron Banner.",
    sections: [
      {
        title: "PvP Activities",
        description:
          "One entry point for playlist loot, triumphs, and legacy armor across core PvP events.",
        items: [
          "New PvP Activities page with banners for Crucible, Iron Banner, and Trials of Osiris.",
          "Crucible hub — current armor sets, obtainable weapons, cosmetics, Glorious title progress, and legacy armor sets grouped by introduction season.",
          "Trials of Osiris hub — current armor, weapon pools and release history, featured maps, cosmetics, Flawless title progress, and legacy armor sets in the same Iron Banner-style layout.",
        ],
      },
    ],
  },
  {
    version: "0.7.4",
    publishedAt: "2026-07-05",
    summary:
      "Transfer items between your characters and the vault directly from weapon and armor roll panels, and see this week’s featured raids and dungeons on RAD Loot and the homepage.",
    sections: [
      {
        title: "Item transfer",
        description:
          "Move copies without leaving the detail page when signed in.",
        items: [
          "Send items to the vault, Hunter, Titan, or Warlock — the current location is marked and cannot be selected again.",
          "Transfer status and a location animation keep the roll pinned until the move completes.",
        ],
      },
      {
        title: "Featured raids & dungeons",
        description:
          "Weekly rotation highlights on RAD Loot and the homepage.",
        items: [
          "RAD Loot calls out this week’s featured raids and dungeons at the top of the page.",
          "The homepage shows the same featured activities in a compact grid above the main catalog banners.",
        ],
      },
    ],
  },
  {
    version: "0.7.3",
    publishedAt: "2026-07-03",
    summary:
      "Iron Banner gets its own activity hub — current armor and weapons, rotating focus pools, Event Card rewards with claim status, cosmetics, Iron Lord triumphs, and legacy armor sets in one place. The homepage now highlights Iron Banner and Monument of Triumph in a Featured row above the main catalog banners.",
    sections: [
      {
        title: "Iron Banner hub",
        description:
          "A dedicated page for everything worth chasing during the event.",
        items: [
          "Track armor, weapons, and cosmetics in loot panels, with collection highlighting when signed in.",
          "Rotating weapon focus pools (Pool 1 and Pool 2) so you can browse this week’s Saladin lineup and the alternate pool.",
          "Legacy Iron Banner armor sets listed below, in expandable tabs.",
          "Event Card reward track with claim status when signed in — gold for claimed, green for ready to claim, grey for locked.",
          "Iron Banner triumphs and Iron Lord title progress on the same page when signed in.",
        ],
      },
      {
        title: "Homepage",
        description:
          "Featured row for seasonal highlights above the main catalog entry points.",
        items: [
          "Featured section with Iron Banner and Monument of Triumph side by side.",
          "Updated site logo in the header and on the home title.",
        ],
      },
      {
        title: "Weapon tooltips",
        description:
          "Richer hover details on activity loot pages.",
        items: [
          "Weapon icons on RAD Loot and Iron Banner now show weapon type, damage type, and ammo icons between the name and source.",
        ],
      },
    ],
  },
  {
    version: "0.7.2",
    publishedAt: "2026-07-02",
    summary:
      "Armor pages arrive — browse any legendary or exotic armor piece with base stats, archetypes, set bonuses, and a full set preview, then sign in to see every copy you own with gear tier markers, defense values, and per-roll archetype and stat data. Weapon roll perk highlighting is also more accurate.",
    sections: [
      {
        title: "Armor pages",
        description:
          "Dedicated pages for every armor piece, matching the depth of weapon pages.",
        items: [
          "Open any armor piece from All Loot to see its base stats, archetype, set bonuses, and slot type at a glance.",
          "Full Set Preview shows the complete armor set image below the set pieces, with quick links to each piece.",
          "Set Bonuses and Set Pieces panels surface 2-piece and 4-piece perks for Armor 3.0 sets (The Edge of Fate, Renegades, Monument of Triumph).",
        ],
      },
      {
        title: "Your armor rolls",
        description:
          "See every copy of an armor piece you own when signed in with Bungie.",
        items: [
          "Show your rolls lists your vault, inventory, and equipped copies, sorted newest-first.",
          "Tiered gear is also visually displayed with diamonds like in-game for gear introduced during The Edge of Fate or later.",
          "Each roll shows its defense value, archetype, and total stats, with ★ marking your best copy per archetype and ✕ flagging lower-stat duplicates.",
          "Hover or tap a roll to update the stats panel with that copy's exact rolls.",
        ],
      },
      {
        title: "Weapon roll fixes",
        description:
          "More accurate perk highlighting on your weapon rolls.",
        items: [
          "Roll perk highlighting is more accurate, so your copies should match up better with the perk grid.",
        ],
      },
    ],
  },
  {
    version: "0.7.1",
    publishedAt: "2026-06-24",
    summary:
      "Weapon pages now show your own rolls when signed in — with PvE/PvP scoring, Aegis tier ratings, and clear markers for your best copy and safe-to-dismantle duplicates. Compare perks against the god roll side by side, browse stats and perk pools per weapon version, and benefit from a cleaner catalog with fixed season labels and consolidated Edge of Fate / Into the Light entries.",
    sections: [
      {
        title: "Your rolls",
        description:
          "See every copy you own on a weapon page and compare it to the community god roll.",
        items: [
          "Show your rolls on weapon pages when signed in with Bungie — vault, inventory, and equipped copies in one list.",
          "Hover or tap a roll to highlight its perks on the grid; god roll perks show at the same time for easy comparison.",
          "Matching perks glow gold; your-roll-only perks stay blue and god-roll-only perks use the PvE or PvP highlight colour.",
          "Multi-version weapons label each roll with its season (e.g. S9 Season of the Dawn) so you know which reissue you are looking at.",
        ],
      },
      {
        title: "Roll scoring & recommendations",
        description:
          "Quick read on whether a copy is worth keeping.",
        items: [
          "PvE and PvP match percentages against the Voltron god roll for each copy.",
          "Aegis tier rating from the community wishlist — overall score, perk columns hit, and trait combo match.",
          "★ marks your best copy; ✕ flags duplicates that are worse in both PvE and PvP (safe dismantle candidates).",
          "Rolls sorted by Aegis tier, then PvE, then PvP.",
        ],
      },
      {
        title: "Perks & stats per version",
        description:
          "Reissued weapons no longer share one static perk pool across every season.",
        items: [
          "Perk columns and stat blocks are resolved per manifest version — BrayTech Werewolf, Austringer, and similar reissues show the correct pool for each season badge.",
          "Click a season badge on the weapon page to switch stats, perks, and god roll data for that version.",
          "Hovering a roll switches the perk grid to that copy's version automatically.",
        ],
      },
      {
        title: "Catalog & season labels",
        description:
          "Cleaner search results and more accurate obtainability and event tagging.",
        items: [
          "Call to Arms treated as an event label, not a season — search and filters use the underlying season (e.g. The Edge of Fate).",
          "Duplicate catalog rows collapsed when versions share the same season, stats, and perks; event reissues merge into the base release where appropriate.",
          "Edge of Fate and S28 content consolidated; Into the Light separated from adjacent season groupings.",
          "Obtainability fixes for random-roll sources and reissued weapons (e.g. A Good Shout).",
          "God roll highlighting matches perks by name across alternate manifest hashes, not just exact plug IDs.",
        ],
      },
      {
        title: "Behind the scenes",
        description:
          "Data pipelines that keep roll features up to date.",
        items: [
          "Perk pools patched from the Bungie manifest for every weapon version and alternate item hash.",
          "Daily GitHub Action refreshes Voltron god rolls and Aegis wishlist data.",
        ],
      },
    ],
  },
  {
    version: "0.7.0",
    publishedAt: "2026-06-21",
    summary:
      "Loot Collector debuts with the full collectible catalog, powerful search and filters, and dedicated weapon pages with stats, perks, and Voltron god rolls. Loot sections are grouped under one hub; navigation and home are streamlined. Eververse Rotation is removed until Bungie's API supports it again.",
    sections: [
      {
        title: "Loot Collector catalog",
        description:
          "Every collectible in one generated catalog — weapons, armor, cosmetics, and more.",
        items: [
          "New Loot Collector section with the full deduplicated item database (most recent version when names repeat).",
          "Season badges, obtainability, sources, and collection highlighting when signed in with Bungie.",
          "Thin collection banners for RAD Loot, Exotics, Armor sets, Collections, activities, destinations, and expansions/seasons — with artwork for each category.",
        ],
      },
      {
        title: "Search & filters",
        description:
          "Browse the entire catalog without loading every item at once.",
        items: [
          "Full-text search across names, types, sources, and seasons.",
          "Multi-select filters for type, season, rarity, class, weapon type, damage type, slot, and more.",
          "Collection filter to show only owned or missing items when signed in.",
          "Infinite scroll with server-side search and facet endpoints.",
        ],
      },
      {
        title: "Weapon pages",
        description:
          "Dedicated page for every catalogued weapon.",
        items: [
          "Stats panel with bar and plain stat layouts (RPM, magazine, recoil, and similar stats shown without bars).",
          "Perk columns from the Bungie manifest — masterworks, barrels, magazines, and traits with icon tooltips.",
          "Season badges, description, obtainability, and source on each weapon page.",
        ],
      },
      {
        title: "God rolls",
        description:
          "Community recommendations powered by DIM's Voltron wishlist.",
        items: [
          "Off · PvE · PvP toggle on weapon pages to highlight recommended perks.",
          "God roll data built from Voltron at generate time.",
          "Covers 1,000+ weapons with PvE and/or PvP recommendations.",
        ],
      },
      {
        title: "Loot hub & navigation",
        description:
          "All loot sections grouped under Loot Collector with a clearer site structure.",
        items: [
          "Header Loot menu with Search loot plus every collection category — available sections link through; coming-soon entries stay visible but disabled.",
          "Home and header simplified: Triumphs stays prominent; RAD Loot, Exotics, and Armor sets move into the Loot menu.",
        ],
      },
      {
        title: "Removed",
        description:
          "Sections dropped when they can no longer be maintained reliably.",
        items: [
          "Eververse Rotation removed — Bungie's API no longer exposes the full daily Bright Dust shop after update 9.7.0.",
        ],
      },
    ],
  },
  {
    version: "0.6.0",
    publishedAt: "2026-06-14",
    summary:
      "Monument of Triumph triumphs and the Immortal title join the Triumphs hub. Pantheon 2.0 is added to RAD Loot with a full activity page. Faster page loads and smoother navigation across the site.",
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
        title: "Performance",
        description:
          "Faster loads across the site — pages render first, Bungie data follows in the background.",
        items: [
          "Global loading indicator when moving between sections: centered spinner with a dimmed overlay so the current page stays visible until the next one is ready.",
          "Home, Exotics, and Armor sets show catalogs immediately; collection ownership and triumph scores load afterward when signed in.",
          "RAD Loot index opens with activity banners right away; completion counts and title seal status fill in after sign-in data arrives.",
          "Server-side caching for catalog data and Bungie membership resolution — fewer repeated API calls per visit.",
          "Activity loot pages fetch inventory, triumph progress, and raid completions in parallel when signed in.",
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

/** ISO date (YYYY-MM-DD) of the newest entry in UPDATE_RELEASES. */
export const CURRENT_VERSION_PUBLISHED_AT = UPDATE_RELEASES[0].publishedAt;
