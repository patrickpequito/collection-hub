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
    "Ignition Code": "world-loot",
    "Null Composure": "vanguard-ops",
    "Occluded Finality": "iron-banner",
    "Shayura's Wrath": "trials-of-osiris",
    "The Deicide": "lakshmi-2",
    "Survivor's Epitaph": "crucible",
    "Empty Vessel": "vanguard-ops",
    "Sojourner's Tale": "season-pass",
    "Finite Impactor": "iron-banner",
    "Gridskipper": "world-loot",
    "Riiswalker": "iron-banner",
    "Chroma Rush": "world-loot",
    "PLUG ONE.1": "world-loot",
    "Uzume RR4": "vanguard-ops",
    "Hung Jury SR4": "world-loot",
    "Archon's Thunder": "iron-banner",
  },
  playableActivities: [
    {
      id: "override-europa",
      title: "Override: Europa",
      description:
        "Six-player Override on Europa. One destination rotates active each week in the Director Override playlist.",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_europa.jpg",
    },
    {
      id: "override-moon",
      title: "Override: The Moon",
      description:
        "Six-player Override on the Moon. One destination rotates active each week in the Director Override playlist.",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_moon.jpg",
    },
    {
      id: "override-tangled-shore",
      title: "Override: Tangled Shore",
      description:
        "Six-player Override on the Tangled Shore. One destination rotates active each week in the Director Override playlist.",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_tangled_shore.jpg",
    },
    {
      id: "override-last-city",
      title: "Override: Last City",
      description:
        "Six-player Override in the Last City. One destination rotates active each week in the Director Override playlist.",
      pgcrImagePath:
        "/img/destiny_content/pgcr/season_14_override_last_city.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic gear from Season of the Splicer — Cryosthesia 77K from the Season Pass, and the season's new Hunter, Titan, and Warlock exotic armor.",
  cosmeticPanelDescription:
    "Season Pass cosmetics reclaimable with Chronologs from the Season Archive in the Tower.",
  cosmeticRewards: [
    "Riis Racer",
    "Deletion Protocol",
    "Luminous Tapestry",
    "Security Breach",
    "House of Light Entrance",
    "Technofusion",
    "Ready for Anything",
    "Absorb the Ether",
  ],
  available: true,
};
