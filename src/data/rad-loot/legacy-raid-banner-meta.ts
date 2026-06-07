const LEVIATHAN_ACTIVITY_ICON =
  "/common/destiny2_content/icons/99dd675e20df42d2451400ceb3636223.png";

/** Vaulted raids and lairs — title seals are not in triumphs.json. */
export const LEGACY_RAID_BANNER_META: Record<
  string,
  { iconPath: string; completionRecordHash: string | null }
> = {
  "eater-of-worlds": {
    iconPath: LEVIATHAN_ACTIVITY_ICON,
    completionRecordHash: null,
  },
  "spire-of-stars": {
    iconPath: LEVIATHAN_ACTIVITY_ICON,
    completionRecordHash: null,
  },
  leviathan: {
    iconPath: LEVIATHAN_ACTIVITY_ICON,
    completionRecordHash: null,
  },
  "scourge-of-the-past": {
    iconPath:
      "/common/destiny2_content/icons/6577a6172ce4e9e65fe6294f024be4ea.png",
    completionRecordHash: "317521250",
  },
  "crown-of-sorrow": {
    iconPath:
      "/common/destiny2_content/icons/d08f27b6273edf99a245b762255863b2.png",
    completionRecordHash: "2056461735",
  },
};
