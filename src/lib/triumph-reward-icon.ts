/** Bungie icon for "Increased Drop Rate" triumph rewards — non-square artwork. */
export const INCREASED_DROP_RATE_ICON = "6c4935a0247406e7b412ed5acd47b01d.png";

export function isIncreasedDropRateReward(iconPath: string): boolean {
  return iconPath.includes(INCREASED_DROP_RATE_ICON);
}
