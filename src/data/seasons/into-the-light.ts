import type { SeasonHub } from "@/data/seasons/types";

/** Free update released during Season of the Wish (April 2024). */
export const INTO_THE_LIGHT_HUB: SeasonHub = {
  slug: "into-the-light",
  title: "Into the Light",
  seasonLabel: "Into the Light",
  parentExpansionSlug: "lightfall",
  seasonNumber: 23,
  isUpdate: true,
  titleIconPath: "/images/seasons/into-the-light.png",
  videos: [
    {
      id: "trailer",
      label: "Trailer",
      youtubeId: "qRNWmA5TILc",
    },
    {
      id: "cutscene-archive",
      label: "Cutscene archive",
      youtubeId: "BKm0TPqeOjY",
    },
  ],
  armorSetNames: ["Parade"],
  // The BRAVE arsenal: reissued weapons with the Into the Light watermark.
  matchWeaponVersions: false,
  extraWeaponNames: [
    "Blast Furnace",
    "Edge Transit",
    "Elsie's Rifle",
    "Falling Guillotine",
    "Forbearance",
    "Hammerhead",
    "Hung Jury SR4",
    "Luna's Howl",
    "Midnight Coup",
    "Succession",
    "The Mountaintop",
    "The Recluse",
  ],
  exoticItemNames: ["Whisper of the Worm", "Outbreak Perfected"],
  weaponPools: [
    {
      id: "brave-arsenal",
      title: "Onslaught & Hall of Champions",
      sourcePattern: /(?!)/,
    },
  ],
  weaponPoolByName: {
    "Blast Furnace": "brave-arsenal",
    "Edge Transit": "brave-arsenal",
    "Elsie's Rifle": "brave-arsenal",
    "Falling Guillotine": "brave-arsenal",
    Forbearance: "brave-arsenal",
    Hammerhead: "brave-arsenal",
    "Hung Jury SR4": "brave-arsenal",
    "Luna's Howl": "brave-arsenal",
    "Midnight Coup": "brave-arsenal",
    Succession: "brave-arsenal",
    "The Mountaintop": "brave-arsenal",
    "The Recluse": "brave-arsenal",
  },
  // Onslaught and the original Pantheon are no longer launchable.
  playableActivities: [
    {
      id: "the-whisper",
      title: "The Whisper",
      description: "Exotic mission beneath Io that rewards Whisper of the Worm.",
      location: "Vanguard Pinnacle Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/whisper.jpg",
    },
    {
      id: "zero-hour",
      title: "Zero Hour",
      description: "Exotic mission in the Tower that rewards Outbreak Perfected.",
      location: "Vanguard Pinnacle Ops",
      pgcrImagePath: "/img/destiny_content/pgcr/zero-hour.jpg",
    },
  ],
  exoticPanelDescription:
    "Exotic weapons from the returning exotic missions — Whisper of the Worm from The Whisper and Outbreak Perfected from Zero Hour.",
  cosmeticPanelDescription:
    "Cosmetics with the Into the Light watermark, earned from the update's activities and missions.",
  cosmeticRewards: [
    "Karve of the Worm",
    "Vimana Junker",
    "Pyramidic Vessel",
    "Superblack",
    "Blue Steel",
  ],
  available: true,
};
