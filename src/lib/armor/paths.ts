export function armorPageHref(slug: string, from?: string) {
  const base = `/armor/${slug}`;
  if (!from || !from.startsWith("/") || from.startsWith("//")) return base;
  return `${base}?from=${encodeURIComponent(from)}`;
}

export function parseArmorReturnPath(from: string | undefined) {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/all-loot";
  }
  return from;
}
