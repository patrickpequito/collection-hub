export function weaponPageHref(slug: string, from?: string) {
  const base = `/weapons/${slug}`;
  if (!from || !from.startsWith("/") || from.startsWith("//")) return base;
  return `${base}?from=${encodeURIComponent(from)}`;
}

export function backLabelForPath(path: string) {
  if (path === "/") return "← Home";
  if (path === "/all-loot") return "← Loot Collector";
  if (path === "/exotics") return "← Exotics";
  if (path === "/pve-activities") return "← PvE Activities";
  if (path === "/pvp-activities") return "← PvP Activities";
  if (path === "/rad-loot") return "← RAD Loot";
  if (path.startsWith("/rad-loot/")) return "← Activity";
  return "← Back";
}

export function parseAppReturnPath(from: string | undefined, defaultHref = "/") {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return defaultHref;
  }
  return from;
}

export function parseWeaponReturnPath(from: string | undefined) {
  return parseAppReturnPath(from, "/all-loot");
}
