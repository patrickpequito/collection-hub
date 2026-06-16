const CLASS_ICON_PATHS: Record<string, string> = {
  Titan: "/icons/d2/class_titan.svg",
  Hunter: "/icons/d2/class_hunter.svg",
  Warlock: "/icons/d2/class_warlock.svg",
};

/** Weapon archetype symbols (destiny-icons, same set as DIM / destiny.report). */
const WEAPON_TYPE_ICON_PATHS: Record<string, string> = {
  "Auto Rifle": "/icons/d2/weapons/auto_rifle.svg",
  "Combat Bow": "/icons/d2/weapons/bow.svg",
  Bow: "/icons/d2/weapons/bow.svg",
  "Fusion Rifle": "/icons/d2/weapons/fusion_rifle.svg",
  Glaive: "/icons/d2/weapons/glaive.svg",
  "Grenade Launcher": "/icons/d2/weapons/grenade_launcher.svg",
  "Hand Cannon": "/icons/d2/weapons/hand_cannon.svg",
  "Linear Fusion Rifle": "/icons/d2/weapons/wire_rifle.svg",
  "Machine Gun": "/icons/d2/weapons/machinegun.svg",
  "Pulse Rifle": "/icons/d2/weapons/pulse_rifle.svg",
  "Rocket Launcher": "/icons/d2/weapons/rocket_launcher.svg",
  "Scout Rifle": "/icons/d2/weapons/scout_rifle.svg",
  Shotgun: "/icons/d2/weapons/shotgun.svg",
  Sidearm: "/icons/d2/weapons/sidearm.svg",
  "Sniper Rifle": "/icons/d2/weapons/sniper_rifle.svg",
  "Submachine Gun": "/icons/d2/weapons/smg.svg",
  Sword: "/icons/d2/weapons/sword_heavy.svg",
  "Trace Rifle": "/icons/d2/weapons/beam_weapon.svg",
};

export function isGuardianClass(label: string | null | undefined): boolean {
  if (!label) return false;
  return label in CLASS_ICON_PATHS;
}

export function classOrWeaponTypeIconPath(
  label: string | null | undefined,
): string | null {
  if (!label) return null;
  return CLASS_ICON_PATHS[label] ?? WEAPON_TYPE_ICON_PATHS[label] ?? null;
}
