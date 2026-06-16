/** Ammo box icons (destiny-icons) keyed by manifest ammunition type. */
const AMMO_TYPE_ICON_PATHS: Record<string, string> = {
  Primary: "/icons/d2/ammo/primary.svg",
  Special: "/icons/d2/ammo/special.svg",
  Heavy: "/icons/d2/ammo/heavy.svg",
};

const AMMO_TYPE_LABELS: Record<string, string> = {
  Primary: "Primary ammo",
  Special: "Special ammo",
  Heavy: "Heavy ammo",
};

export function weaponAmmoIconPath(
  ammoType: string | null | undefined,
): string | null {
  if (!ammoType) return null;
  return AMMO_TYPE_ICON_PATHS[ammoType] ?? null;
}

export function weaponAmmoLabel(
  ammoType: string | null | undefined,
): string | null {
  if (!ammoType) return null;
  return AMMO_TYPE_LABELS[ammoType] ?? null;
}
