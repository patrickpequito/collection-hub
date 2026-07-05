/** Bungie DestinyActivityModeDefinition icons (Raid / Dungeon). */
export const RAID_ACTIVITY_ICON_PATH =
  "/common/destiny2_content/icons/DestinyActivityModeDefinition_bfe80e3dafe6686a9dc42df0606bdc9b.png";

export const DUNGEON_ACTIVITY_ICON_PATH =
  "/common/destiny2_content/icons/DestinyActivityModeDefinition_f20ebb76bee675ca429e470cec58cc7b.png";

export function activityKindIconPath(kind: "raid" | "dungeon"): string {
  return kind === "raid"
    ? RAID_ACTIVITY_ICON_PATH
    : DUNGEON_ACTIVITY_ICON_PATH;
}
