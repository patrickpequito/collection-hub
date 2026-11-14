import { type SeasonHub } from "@/data/seasons/types";

const byPool = (id: string, names: string[]) =>
  Object.fromEntries(names.map((name) => [name, id]));

/*
 * Season: Reclamation (S27) ran with The Edge of Fate, Jul 15 – Sep 9 2025. Ash & Iron
 * (Sep 9 – Dec 2) shares the S27 watermark but has its own page: items released with it
 * carry the manifest trait "releases.v910" (Reclamation's carry "releases.v900").
 */
const CAMPAIGN_WEAPONS = ["Ahab Char", "Faustus Decline", "Jurisprudent", "Shoreline Dissident"];
// "Source: The Edge of Fate Activities" (Portal).
const PORTAL_WEAPONS = ["Aurora Dawn", "Boomslang-4fr", "Mercury-A", "Qua Nilus II"];
const PINNACLE_OPS_WEAPONS = [
  "Lionfish-4fr",
  "Mint Retrograde",
  "Outrageous Fortune",
  "Pre Astyanax IV",
  "Theodolite",
];
const CRUCIBLE_WEAPONS = ["Pure Recollection", "Returned Memory", "Solemn Remembrance", "Stars in Shadow"];
const TRIALS_WEAPONS = [
  "Aisha's Embrace",
  "Aureus Neutralizer",
  "Auric Disabler",
  "Forgiveness",
  "Unwavering Duty",
];
// Lionfish reissues with the S27 watermark.
const MONUMENT_WEAPONS = ["Ribbontail", "Synanceia", "Trachinus"];

export const SEASON_RECLAMATION_HUB: SeasonHub = {
  slug: "s27-season-reclamation",
  title: "Season: Reclamation",
  seasonLabel: "S27 Season: Reclamation",
  parentExpansionSlug: "the-edge-of-fate",
  seasonNumber: 27,
  titleIconPath:
    "/common/destiny2_content/icons/DestinySeasonDefinition_a16e9585a24eaccc9ef3021a1769e50d.png",
  // No season trailer: the owner picked this cinematic.
  videos: [{ id: "trailer", label: "Following the Trail", youtubeId: "Pjcdp6QohWg" }],
  // Rewards Pass sets (also Vanguard Ops / Crucible drops) and the Trials set.
  armorSetNames: ["Techsec", "Last Discipline", "Bushido", "Twofold Crown"],
  ornamentSets: [{ setName: "Multicell", armorSetName: "Techsec", position: "before" }],
  matchWeaponVersions: false,
  extraWeaponNames: [
    ...CAMPAIGN_WEAPONS,
    ...PORTAL_WEAPONS,
    ...PINNACLE_OPS_WEAPONS,
    ...CRUCIBLE_WEAPONS,
    ...TRIALS_WEAPONS,
    ...MONUMENT_WEAPONS,
  ],
  excludedWeaponNames: [
    // Events: Solstice, Arms Week, Festival of the Lost.
    "Festival Flight",
    "Fortunate Star",
    "Yeartide Apex",
    "Phoneutria Fera",
    "Arcane Embrace",
    "Gunburn",
    "Hushed Whisper",
    // Ash & Iron (released Sep 9 2025, own page).
    "Burden of Guilt",
    "Drang",
    "Everburning Glitz",
    "Finite Impactor",
    "Folded Root",
    "Forced Memorializer",
    "Haliaetus",
    "MIDA Macro-Tool",
    "MIDA Mini-Tool",
    "New Malpais",
    "Romantic Death",
    "Seraphine Haze",
    "Unfall",
    "Wolfsbane",
  ],
  exoticItemNames: ["Third Iteration"],
  weaponPools: [
    { id: "campaign", title: "The Edge of Fate Campaign", sourcePattern: /(?!)/ },
    { id: "portal", title: "Portal", sourcePattern: /(?!)/ },
    { id: "pinnacle-ops", title: "Pinnacle Ops", sourcePattern: /(?!)/ },
    { id: "crucible", title: "Crucible", sourcePattern: /(?!)/ },
    { id: "trials-of-osiris", title: "Trials of Osiris", sourcePattern: /(?!)/ },
    { id: "monument-of-triumph", title: "Monument of Triumph", sourcePattern: /(?!)/ },
  ],
  weaponPoolByName: {
    ...byPool("campaign", CAMPAIGN_WEAPONS),
    ...byPool("portal", PORTAL_WEAPONS),
    ...byPool("pinnacle-ops", PINNACLE_OPS_WEAPONS),
    ...byPool("crucible", CRUCIBLE_WEAPONS),
    ...byPool("trials-of-osiris", TRIALS_WEAPONS),
    ...byPool("monument-of-triumph", MONUMENT_WEAPONS),
  },
  // Reclamation had no activity of its own: it launched with The Edge of Fate.
  playableActivities: [],
  exoticPanelDescription: "Exotic weapon from the Season: Reclamation Rewards Pass.",
  cosmeticPanelDescription: "Season: Reclamation Rewards Pass cosmetics.",
  passName: "Rewards Pass",
  // The Reclamation Rewards Pass (manifest season pass 1148973001), cosmetics only.
  cosmeticRewards: [
    "Chlorophyta Helm",
    "Chlorophyta Hood",
    "Chlorophyta Mask",
    "Iterative Growth",
    "Chlorophyta",
    "Cat's Meow",
    "Fireside Within",
    "First Contact Shell",
    "Phoenix Projection",
    "Oort Explorer JS-8",
    "Point of Divergence",
    "Eternal Summer",
    "Repair Data",
    "Dead and Buried",
    "Worm Brûlée",
    "Zero-G Gambol",
  ],
  showEververseCosmetics: true,
  // Rewards Pass cosmetics (Reclamation and Ash & Iron passes) are not Eververse items.
  excludedEververseNames: [
    "Autognosis",
    "Azurine Thunder",
    "Cat's Meow",
    "Chlorophyta",
    "Chlorophyta Helm",
    "Chlorophyta Hood",
    "Chlorophyta Mask",
    "Cookie Crisis",
    "Dead and Buried",
    "Duskbright",
    "Eternal Summer",
    "Featherfine",
    "Fireside Within",
    "First Contact Shell",
    "Folded Light",
    "From Orbit",
    "Imperial Incubator",
    "Iterative Growth",
    "Multicell Bond",
    "Multicell Boots",
    "Multicell Cloak",
    "Multicell Gauntlets",
    "Multicell Gloves",
    "Multicell Grasps",
    "Multicell Greaves",
    "Multicell Helm",
    "Multicell Hood",
    "Multicell Mark",
    "Multicell Mask",
    "Multicell Plate",
    "Multicell Strides",
    "Multicell Vest",
    "Multicell Vestment",
    "Offroad Warning",
    "Oort Explorer JS-8",
    "Phoenix Projection",
    "Point of Divergence",
    "Psychic Awakening",
    "Repair Data",
    "Ripping the Cord",
    "Vigil of the Seraph",
    "Vigilant Seraph Bond",
    "Vigilant Seraph Boots",
    "Vigilant Seraph Casque",
    "Vigilant Seraph Cloak",
    "Vigilant Seraph Cover",
    "Vigilant Seraph Gauntlets",
    "Vigilant Seraph Gloves",
    "Vigilant Seraph Greaves",
    "Vigilant Seraph Grips",
    "Vigilant Seraph Helm",
    "Vigilant Seraph Mark",
    "Vigilant Seraph Plate",
    "Vigilant Seraph Robes",
    "Vigilant Seraph Strides",
    "Vigilant Seraph Vest",
    "Warmind Techno",
    "Worm Brûlée",
    "Xeric Weave",
    "Zero-G Gambol",
  ],
  available: true,
};
