export function weaponPageHref(slug: string, from?: string) {
  const base = `/weapons/${slug}`;
  if (!from || !from.startsWith("/") || from.startsWith("//")) return base;
  return `${base}?from=${encodeURIComponent(from)}`;
}

export function backLabelForPath(path: string) {
  if (path === "/all-loot") return "← Loot Collector";
  if (path === "/exotics") return "← Exotics";
  if (path.startsWith("/rad-loot/")) return "← Activity";
  return "← Back";
}

export function parseWeaponReturnPath(from: string | undefined) {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/all-loot";
  }
  return from;
}
