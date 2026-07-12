export type TrialsMapEntry = {
  name: string;
  activityHash: string;
  imagePath: string;
};

/** Bungie milestone shown while Trials of Osiris is active. */
export const TRIALS_RETURNS_MILESTONE_HASH = "2311040624";

export const TRIALS_MAP_POOL_1 = [
  "Burnout",
  "Javelin-4",
  "Endless Vale",
] as const;

export const TRIALS_MAP_POOL_2 = [
  ...TRIALS_MAP_POOL_1,
  "Altar of Flame",
  "Pacifica",
  "Cirrus Plaza",
  "Eventide Labs",
  "The Dead Cliffs",
  "Meltdown",
  "Solitude",
  "Radiant Cliffs",
  "Wormhaven",
] as const;

export const TRIALS_MAP_POOL_3 = [
  "Bannerfall",
  "Cathedral of Dusk",
  "Disjunction",
  "Distant Shore",
  "Dissonance",
  "Emperor's Respite",
  "Equinox",
  "Eternity",
  "Firebase Echo",
  "Fragment",
  "Gambler's Ruin",
  "Legion's Gulch",
  "Midtown",
  "Retribution",
  "The Anomaly",
  "The Cauldron",
  "The Fortress",
  "Twilight Gap",
  "Vostok",
  "Widow's Court",
] as const;

/** Crucible maps excluded from the Trials rotation (Monument of Triumph). */
export const TRIALS_EXCLUDED_MAPS = [
  "Convergence",
  "Rusted Lands",
  "Multiplex",
  "The Citadel",
  "Exodus Blue",
] as const;

export const TRIALS_MAP_CATALOG: TrialsMapEntry[] = [
  {
    name: "Burnout",
    activityHash: "247771251",
    imagePath: "/img/destiny_content/pgcr/pvp_the_burnout.jpg",
  },
  {
    name: "Javelin-4",
    activityHash: "176316743",
    imagePath: "/img/destiny_content/pgcr/crucible_shaft.jpg",
  },
  {
    name: "Endless Vale",
    activityHash: "368995245",
    imagePath: "/img/destiny_content/pgcr/crucible_grove.jpg",
  },
  {
    name: "Altar of Flame",
    activityHash: "105227112",
    imagePath: "/img/destiny_content/pgcr/crucible_ness.jpg",
  },
  {
    name: "Pacifica",
    activityHash: "1543755844",
    imagePath: "/img/destiny_content/pgcr/pvp_pacifica.jpg",
  },
  {
    name: "Cirrus Plaza",
    activityHash: "1579576831",
    imagePath: "/img/destiny_content/pgcr/crucible_mall.jpg",
  },
  {
    name: "Eventide Labs",
    activityHash: "132163276",
    imagePath: "/img/destiny_content/pgcr/crucible_ice.jpg",
  },
  {
    name: "The Dead Cliffs",
    activityHash: "42744716",
    imagePath: "/img/destiny_content/pgcr/crucible_cliffside.jpg",
  },
  {
    name: "Meltdown",
    activityHash: "96563552",
    imagePath: "/img/destiny_content/pgcr/crucible_meltdown.jpg",
  },
  {
    name: "Solitude",
    activityHash: "422437929",
    imagePath: "/img/destiny_content/pgcr/crucible_solitude.jpg",
  },
  {
    name: "Radiant Cliffs",
    activityHash: "532383918",
    imagePath: "/img/destiny_content/pgcr/pvp_radiant_cliffs.jpg",
  },
  {
    name: "Wormhaven",
    activityHash: "148937731",
    imagePath: "/img/destiny_content/pgcr/pvp_wormhaven.jpg",
  },
  {
    name: "Bannerfall",
    activityHash: "423513998",
    imagePath: "/img/destiny_content/pgcr/crucible_bannerfall.jpg",
  },
  {
    name: "Cathedral of Dusk",
    activityHash: "595258113",
    imagePath: "/img/destiny_content/pgcr/crucible_cathedral_of_dusk.jpg",
  },
  {
    name: "Disjunction",
    activityHash: "188634482",
    imagePath: "/img/destiny_content/pgcr/crucible_disjunction.jpg",
  },
  {
    name: "Distant Shore",
    activityHash: "236451195",
    imagePath: "/img/destiny_content/pgcr/crucible_distant_shore.jpg",
  },
  {
    name: "Dissonance",
    activityHash: "75561253",
    imagePath: "/img/destiny_content/pgcr/crucible_root.jpg",
  },
  {
    name: "Emperor's Respite",
    activityHash: "778271008",
    imagePath: "/img/destiny_content/pgcr/crucible_katana.jpg",
  },
  {
    name: "Equinox",
    activityHash: "1815340083",
    imagePath: "/img/destiny_content/pgcr/pvp_street.jpg",
  },
  {
    name: "Eternity",
    activityHash: "68962784",
    imagePath: "/img/destiny_content/pgcr/crucible_glaive.jpg",
  },
  {
    name: "Firebase Echo",
    activityHash: "2276121440",
    imagePath: "/img/destiny_content/pgcr/pvp_echo.jpg",
  },
  {
    name: "Fragment",
    activityHash: "119049673",
    imagePath: "/img/destiny_content/pgcr/crucible_fragment.jpg",
  },
  {
    name: "Gambler's Ruin",
    activityHash: "2591737171",
    imagePath: "/img/destiny_content/pgcr/crucible_gamblers_ruin.jpg",
  },
  {
    name: "Legion's Gulch",
    activityHash: "1711620427",
    imagePath: "/img/destiny_content/pgcr/crucible_slag.jpg",
  },
  {
    name: "Midtown",
    activityHash: "64172690",
    imagePath: "/img/destiny_content/pgcr/crucible_midtown.jpg",
  },
  {
    name: "Retribution",
    activityHash: "922191739",
    imagePath: "/img/destiny_content/pgcr/crucible_elevator.jpg",
  },
  {
    name: "The Anomaly",
    activityHash: "184660376",
    imagePath: "/img/destiny_content/pgcr/crucible_the_anomaly.jpg",
  },
  {
    name: "The Cauldron",
    activityHash: "828535312",
    imagePath: "/img/destiny_content/pgcr/crucible_cauldron.jpg",
  },
  {
    name: "The Fortress",
    activityHash: "903944065",
    imagePath: "/img/destiny_content/pgcr/crucible_hull.jpg",
  },
  {
    name: "Twilight Gap",
    activityHash: "111657329",
    imagePath: "/img/destiny_content/pgcr/crucible_twilight_gap.jpg",
  },
  {
    name: "Vostok",
    activityHash: "281812211",
    imagePath: "/img/destiny_content/pgcr/crucible_observatory.jpg",
  },
  {
    name: "Widow's Court",
    activityHash: "427041827",
    imagePath: "/img/destiny_content/pgcr/crucible_widows_court.jpg",
  },
];

export const TRIALS_MAP_BY_NAME = new Map(
  TRIALS_MAP_CATALOG.map((entry) => [entry.name, entry]),
);

export const TRIALS_MAP_BY_ACTIVITY_HASH = new Map(
  TRIALS_MAP_CATALOG.map((entry) => [entry.activityHash, entry]),
);
