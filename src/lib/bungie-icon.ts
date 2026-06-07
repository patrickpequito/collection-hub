const BUNGIE_BASE = "https://www.bungie.net";

export function bungieIconUrl(iconPath: string): string {
  if (!iconPath) return "";
  if (iconPath.startsWith("http")) return iconPath;
  if (iconPath.startsWith("/images/")) return iconPath;
  return `${BUNGIE_BASE}${iconPath}`;
}
