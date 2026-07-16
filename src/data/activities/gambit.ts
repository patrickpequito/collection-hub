import type { ActivityHubConfig } from "@/types/activity-hub";

/** Cyberserpent Null — current Gambit armor (Monument of Triumph). */
const CYBERSERPENT_NULL_SET_HASH = "1790308978";

export const GAMBIT_HUB: ActivityHubConfig = {
  slug: "gambit",
  title: "Gambit",
  titleSlug: "gambit",
  headerImageUrl: "/images/headers/gambit-header.webp",
  currentArmorSetHashes: [CYBERSERPENT_NULL_SET_HASH],
  armorSetPreviewFiles: ["cyberserpent-null.webp"],
  excludeLegacySetNames: [
    "Cyberserpent Null",
    "Cyberserpent Null Set",
  ],
};
