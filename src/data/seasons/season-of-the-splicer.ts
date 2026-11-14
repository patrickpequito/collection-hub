import {
  DEFAULT_SEASON_WEAPON_POOLS,
  type SeasonHub,
} from "@/data/seasons/types";

export const SEASON_OF_THE_SPLICER_HUB: SeasonHub = {
  slug: "s14-season-of-the-splicer",
  title: "Season of the Splicer",
  seasonLabel: "S14 Season of the Splicer",
  parentExpansionSlug: "beyond-light",
  seasonNumber: 14,
  titleIconPath:
    "/common/destiny2_content/icons/84ec4bb049181bc59b45daf71e262b5d.png",
  seal: { title: "Splicer", completionRecordHash: "2796658869" },
  videos: [
    {
      id: "trailer",
      label: "Season trailer",
      youtubeId: "crKGHG3stbY",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "PLFO7wuQu04",
    },
  ],
  armorSetNames: ["Lightkin"],
  ornamentSets: [{ setName: "Interlaced", armorSetName: "Lightkin" }],
  /** VoG reprisal shares the S14 watermark — stay on primary label + explicit extras. */
  matchWeaponVersions: false,
  extraWeaponNames: [
    "Archon's Thunder",
    "Chroma Rush",
    "Empty Vessel",
    "Finite Impactor",
    "Gridskipper",
    "Hung Jury SR4",
    "Ignition Code",
    "Null Composure",
    "Occluded Finality",
    "PLUG ONE.1",
    "Riiswalker",
    "Shayura's Wrath",
    "Sojourner's Tale",
    "Survivor's Epitaph",
    "The Deicide",
    "Uzume RR4",
  ],
  exoticItemNames: [
    "Cryosthesia 77K",
    "Star-Eater Scales",
    "The Path of Burning Steps",
    "Boots of the Assembler",
  ],
  weaponPools: [
    {
      id: "override",
      title: "Override & Expunge",
      sourcePattern: /splicer activ|override|expunge/i,
    },
    {
      id: "lakshmi-2",
      title: "Lakshmi-2",
      sourcePattern: /lakshmi/i,
    },
    ...DEFAULT_SEASON_WEAPON_POOLS,
  ],
  weaponPoolByName: {
    Farewell: "override",
    "Memory Interdict": "lakshmi-2",
    "Pleiades Corrector": "lakshmi-2",
    "Stochastic Variable": "lakshmi-2",
    "The Number": "lakshmi-2",
    "The Vision": "lakshmi-2",
    "Shattered Cipher": "season-pass",
    "Borrowed Time": "gambit",
    "Ignition Code": "override",
    "Null Composure": "vanguard-ops",
    "Occluded Finality": "iron-banner",
    "Shayura's Wrath": "trials-of-osiris",
    "The Deicide": "lakshmi-2",
    "Survivor's Epitaph": "crucible",
    "Empty Vessel": "vanguard-ops",
    "Sojourner's Tale": "season-pass",
    "Finite Impactor": "iron-banner",
    "Gridskipper": "override",
    "Riiswalker": "iron-banner",
    "Chroma Rush": "override",
    "PLUG ONE.1": "world-loot",
    "Uzume RR4": "vanguard-ops",
    "Hung Jury SR4": "world-loot",
    "Archon's Thunder": "iron-banner",
  },
  // The four Overrides rotate in Arena Ops; this week's one is marked.
  playableActivities: [
    {
      id: "override-europa",
      title: "Override: Europa",
      description: "Six-player Override on Europa.",
      location: "Vanguard Arena Ops",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_europa.jpg",
      rotationActivityHashes: ["1644254322", "1026239567", "25688104", "1307933814", "1792588602"],
    },
    {
      id: "override-moon",
      title: "Override: The Moon",
      description: "Six-player Override on the Moon.",
      location: "Vanguard Arena Ops",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_moon.jpg",
      rotationActivityHashes: ["650473962", "3595613735", "2865532048", "2301670494", "3480889442"],
    },
    {
      id: "override-tangled-shore",
      title: "Override: Tangled Shore",
      description: "Six-player Override on the Tangled Shore.",
      location: "Vanguard Arena Ops",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_tangled_shore.jpg",
      rotationActivityHashes: ["4230843715", "3251791982", "3933916447", "2307304497", "2277697861"],
    },
    {
      id: "override-last-city",
      title: "Override: Last City",
      description: "Six-player Override in the Last City.",
      location: "Vanguard Arena Ops",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_last_city.jpg",
      rotationActivityHashes: ["2573597190", "3907305499", "612985278", "883763122", "3343628502"],
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Season of the Splicer — Cryosthesia 77K from the Season Pass, and the season's new Hunter, Titan, and Warlock exotic armor.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  showEververseCosmetics: true,
  // Exactly the Season Archive (Monument to Seasons Past) rewards.
  cosmeticRewards: [
    "Absorb the Ether",
    "Ready for Anything",
    "Security Breach",
    "Riis Racer",
    "House of Light Entrance",
    "Technofusion",
    "Ritualism",
    "Deletion Protocol",
  ],
  // Seasonal triumph / vendor rewards no longer obtainable.
  seasonalRewards: [
    "Luminous Tapestry",
  ],
  available: true,
};
