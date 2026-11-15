import { type SeasonHub } from "@/data/seasons/types";

const byPool = (id: string, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, id]));

/*
 * Ash & Iron: free update of Sep 9 2025 (until Renegades, Dec 2). Its gear keeps the
 * S27 watermark, so the page lists it by name: weapons and armor whose manifest
 * traitIds carry "releases.v910" (Season: Reclamation's carry "releases.v900").
 */
const RECLAIM_WEAPONS = ["Folded Root", "Romantic Death"];
// Rewards Pass (Ash & Iron) and Portal ("Source: The Edge of Fate Activities").
const PORTAL_WEAPONS = ["Drang", "Haliaetus", "MIDA Mini-Tool", "Unfall"];
const PINNACLE_OPS_WEAPONS = ["Forced Memorializer", "Seraphine Haze"];
const CRUCIBLE_WEAPONS = ["MIDA Macro-Tool"];
const TRIALS_WEAPONS = ["Burden of Guilt", "Everburning Glitz"];
const IRON_BANNER_WEAPONS = ["Finite Impactor"];

export const ASH_AND_IRON_HUB: SeasonHub = {
  slug: "ash-and-iron",
  title: "Ash & Iron",
  seasonLabel: "S27 Season: Reclamation",
  parentExpansionSlug: "the-edge-of-fate",
  seasonNumber: 27,
  isUpdate: true,
  titleIconPath:
    "/common/destiny2_content/icons/DestinySeasonPassDefinition_a16e9585a24eaccc9ef3021a1769e50d.png",
  // No Cutscene Archive upload for Ash & Iron: trailer only.
  videos: [{ id: "trailer", label: "Update trailer", youtubeId: "lmEo0y5ZnOU" }],
  // Rewards Pass sets (also Crucible / Vanguard Ops drops) and the Iron Banner set.
  armorSetNames: ["Disaster Corps", "Smoke Jumper", "Iron Panoply"],
  ornamentSets: [{ setName: "Vigilant Seraph", armorSetName: "Disaster Corps", position: "before" }],
  matchWeaponVersions: false,
  extraWeaponNames: [
    ...RECLAIM_WEAPONS,
    ...PORTAL_WEAPONS,
    ...PINNACLE_OPS_WEAPONS,
    ...CRUCIBLE_WEAPONS,
    ...TRIALS_WEAPONS,
    ...IRON_BANNER_WEAPONS,
  ],
  // Everything else with the S27 watermark: Season: Reclamation (own page) and events.
  excludedWeaponNames: [
    "Ahab Char",
    "Aisha's Embrace",
    "Aureus Neutralizer",
    "Auric Disabler",
    "Aurora Dawn",
    "Boomslang-4fr",
    "Faustus Decline",
    "Forgiveness",
    "Jurisprudent",
    "Lionfish-4fr",
    "Mercury-A",
    "Mint Retrograde",
    "Outrageous Fortune",
    "Pre Astyanax IV",
    "Pure Recollection",
    "Qua Nilus II",
    "Returned Memory",
    "Ribbontail",
    "Shoreline Dissident",
    "Solemn Remembrance",
    "Stars in Shadow",
    "Synanceia",
    "Theodolite",
    "Third Iteration",
    "Trachinus",
    "Unwavering Duty",
    "Festival Flight",
    "Fortunate Star",
    "Yeartide Apex",
    "Phoneutria Fera",
    "Arcane Embrace",
    "Gunburn",
    "Hushed Whisper",
  ],
  exoticItemNames: ["New Malpais", "Wolfsbane"],
  weaponPools: [
    { id: "reclaim", title: "Reclaim", sourcePattern: /(?!)/ },
    { id: "portal", title: "Portal", sourcePattern: /(?!)/ },
    { id: "pinnacle-ops", title: "Pinnacle Ops", sourcePattern: /(?!)/ },
    { id: "crucible", title: "Crucible", sourcePattern: /(?!)/ },
    { id: "trials-of-osiris", title: "Trials of Osiris", sourcePattern: /(?!)/ },
    { id: "iron-banner", title: "Iron Banner", sourcePattern: /(?!)/ },
  ],
  weaponPoolByName: {
    ...byPool("reclaim", RECLAIM_WEAPONS),
    ...byPool("portal", PORTAL_WEAPONS),
    ...byPool("pinnacle-ops", PINNACLE_OPS_WEAPONS),
    ...byPool("crucible", CRUCIBLE_WEAPONS),
    ...byPool("trials-of-osiris", TRIALS_WEAPONS),
    ...byPool("iron-banner", IRON_BANNER_WEAPONS),
  },
  playableActivities: [
    {
      id: "reclaim",
      title: "Reclaim",
      description: "Three-player activity retaking the Cosmodrome and Plaguelands from the Conductor's forces.",
      location: "Fireteam Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/cabals_watch.jpg",
    },
    {
      id: "heliostat",
      title: "Heliostat",
      description: "Exotic mission in a forgotten Golden Age facility that rewards Wolfsbane.",
      location: "Pinnacle Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/sarcophagus.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic weapons from Ash & Iron — New Malpais from the Rewards Pass and Wolfsbane from the Heliostat exotic mission.",
  cosmeticPanelDescription: "Ash & Iron Rewards Pass cosmetics.",
  passName: "Rewards Pass",
  // The Ash & Iron Rewards Pass (manifest season pass 1148973000), cosmetics only.
  cosmeticRewards: [
    "Vigil of the Seraph",
    "Xeric Weave",
    "Duskbright",
    "Featherfine",
    "Offroad Warning",
    "Azurine Thunder",
    "Folded Light",
    "Autognosis",
    "Imperial Incubator",
    "Cookie Crisis",
    "Warmind Techno",
    "From Orbit",
    "Psychic Awakening",
    "Ripping the Cord",
  ],
  // The rest of the S27 Eververse stays on the Season: Reclamation page.
  showEververseCosmetics: true,
  eververseSetNames: ["Jade Rabbit", "Taken Knife"],
  available: true,
};
