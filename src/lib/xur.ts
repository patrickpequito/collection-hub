import type { BungieUserSession } from "@/lib/bungie";
import { resolveDestinyMembership } from "@/lib/destiny-membership";
import { getBungieApiKey } from "@/lib/env";
import { rotationWeekIndex, weekBounds } from "@/lib/rad-loot/featured-rotation";

/**
 * Xûr (Friday 17:00 UTC → Tuesday reset). His exotic armor is in Bungie's public vendor list;
 * the exotic weapons and the two catalysts sit in his "Strange Gear Offers" sub-vendor, which
 * Bungie only shows to a signed-in player. The inventory is the same for everyone, so the first
 * signed-in visit of the weekend reads it and stores it in Upstash until the reset.
 */

const BUNGIE = "https://www.bungie.net";
const XUR_VENDOR_HASH = "2190858386";
const XUR_GEAR_VENDOR_HASH = "3751514131";
const MS_DAY = 24 * 60 * 60 * 1000;

export type XurClass = "Titan" | "Hunter" | "Warlock";
export type XurItem = { hash: string; name: string; icon: string; type: string };
export type XurArmor = XurItem & { guardianClass: XurClass };
export type XurGear = { weapons: XurItem[]; catalysts: XurItem[] };
export type XurData = {
  leavesAt: string;
  armor: XurArmor[];
  /** null until a signed-in visit has read the sub-vendor this weekend. */
  gear: XurGear | null;
};

type ItemDefinition = {
  displayProperties: { name: string; icon?: string };
  itemType: number;
  itemSubType: number;
  classType: number;
  itemTypeDisplayName?: string;
  inventory?: { tierType: number };
};
type SaleItems = Record<string, { itemHash: number }>;

const CLASSES: XurClass[] = ["Titan", "Hunter", "Warlock"];
const ITEM_TYPE_ARMOR = 2;
const ITEM_TYPE_WEAPON = 3;
const ITEM_SUB_TYPE_CLASS_ARMOR = 30;
const TIER_EXOTIC = 6;

/** Current Xûr weekend, or null outside Friday 17:00 → Tuesday 17:00 UTC. */
export function xurWindow(now = Date.now()): { weekStart: string; leavesAt: string } | null {
  const { weekStart, weekEnd } = weekBounds(rotationWeekIndex(new Date(now)));
  const arrives = Date.parse(weekStart) + 3 * MS_DAY;
  return now >= arrives && now < Date.parse(weekEnd) ? { weekStart, leavesAt: weekEnd } : null;
}

async function bungieGet<T>(path: string, init: RequestInit & { next?: { revalidate: number } } = {}): Promise<T | null> {
  try {
    const response = await fetch(`${BUNGIE}/Platform${path}`, {
      ...init,
      headers: { "X-API-Key": getBungieApiKey(), ...(init.headers ?? {}) },
    });
    if (!response.ok) return null;
    return ((await response.json()) as { Response?: T }).Response ?? null;
  } catch {
    return null;
  }
}

const itemDefinition = (hash: number) =>
  bungieGet<ItemDefinition>(`/Destiny2/Manifest/DestinyInventoryItemDefinition/${hash}/`, { next: { revalidate: 86_400 } });

async function definitions(sales: SaleItems): Promise<[number, ItemDefinition][]> {
  const hashes = [...new Set(Object.values(sales).map((sale) => sale.itemHash))];
  const defs = await Promise.all(hashes.map(async (hash) => [hash, await itemDefinition(hash)] as const));
  return defs.filter((entry): entry is [number, ItemDefinition] => entry[1] !== null);
}

const toItem = (hash: number, def: ItemDefinition): XurItem => ({
  hash: String(hash),
  name: def.displayProperties.name,
  icon: def.displayProperties.icon ? `${BUNGIE}${def.displayProperties.icon}` : "",
  type: def.itemTypeDisplayName ?? "",
});

/** Exotic armor from the public vendor list (exotic class items left out: Xûr sells one every week). */
async function loadXurArmor(): Promise<XurArmor[] | null> {
  const vendors = await bungieGet<{ sales?: { data?: Record<string, { saleItems: SaleItems }> } }>(
    `/Destiny2/Vendors/?components=402`,
    { next: { revalidate: 900 } },
  );
  const sales = vendors?.sales?.data?.[XUR_VENDOR_HASH]?.saleItems;
  if (!sales) return null;
  return (await definitions(sales))
    .filter(
      ([, def]) =>
        def.itemType === ITEM_TYPE_ARMOR &&
        def.inventory?.tierType === TIER_EXOTIC &&
        def.itemSubType !== ITEM_SUB_TYPE_CLASS_ARMOR &&
        CLASSES[def.classType],
    )
    .map(([hash, def]) => ({ ...toItem(hash, def), guardianClass: CLASSES[def.classType] }))
    .sort((a, b) => CLASSES.indexOf(a.guardianClass) - CLASSES.indexOf(b.guardianClass));
}

// --- Upstash (same REST store as pinned titles) ---

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}
const gearKey = (weekStart: string) => `xur:gear:${weekStart.slice(0, 10)}`;

async function readStoredGear(weekStart: string): Promise<XurGear | null> {
  const config = redisConfig();
  if (!config) return null;
  try {
    const response = await fetch(`${config.url}/get/${encodeURIComponent(gearKey(weekStart))}`, {
      headers: { Authorization: `Bearer ${config.token}` },
      cache: "no-store",
    });
    const payload = (await response.json()) as { result: string | null };
    return payload.result ? (JSON.parse(payload.result) as XurGear) : null;
  } catch {
    return null;
  }
}

async function storeGear(weekStart: string, leavesAt: string, gear: XurGear): Promise<void> {
  const config = redisConfig();
  if (!config) return;
  const seconds = Math.max(60, Math.round((Date.parse(leavesAt) - Date.now()) / 1000));
  await fetch(`${config.url}/set/${encodeURIComponent(gearKey(weekStart))}?EX=${seconds}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: JSON.stringify(gear),
    cache: "no-store",
  }).catch(() => undefined);
}

/** Xûr's stock for the home strip, or null when he is not in the Tower. */
export async function loadXur(): Promise<XurData | null> {
  const window = xurWindow();
  if (!window) return null;
  const [armor, gear] = await Promise.all([loadXurArmor(), readStoredGear(window.weekStart)]);
  if (!armor) return null;
  return { leavesAt: window.leavesAt, armor, gear };
}

/** Reads the weapons + catalysts sub-vendor with a signed-in player's token and stores them for everyone. */
export async function refreshXurGear(session: BungieUserSession): Promise<XurGear | null> {
  const window = xurWindow();
  if (!window) return null;
  const stored = await readStoredGear(window.weekStart);
  if (stored) return stored;

  const membership = await resolveDestinyMembership(session);
  if (!membership) return null;
  const auth = { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: "no-store" as const };
  const profile = await bungieGet<{ characters?: { data?: Record<string, unknown> } }>(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/?components=200`,
    auth,
  );
  const characterId = Object.keys(profile?.characters?.data ?? {})[0];
  if (!characterId) return null;
  const vendor = await bungieGet<{ sales?: { data?: SaleItems } }>(
    `/Destiny2/${membership.membershipType}/Profile/${membership.membershipId}/Character/${characterId}/Vendors/${XUR_GEAR_VENDOR_HASH}/?components=402`,
    auth,
  );
  const sales = vendor?.sales?.data;
  if (!sales) return null;

  const defs = await definitions(sales);
  const exotic = defs.filter(([, def]) => def.inventory?.tierType === TIER_EXOTIC);
  const gear: XurGear = {
    weapons: exotic.filter(([, def]) => def.itemType === ITEM_TYPE_WEAPON).map(([hash, def]) => toItem(hash, def)),
    catalysts: exotic
      .filter(([, def]) => / Catalyst$/.test(def.displayProperties.name))
      .map(([hash, def]) => ({ ...toItem(hash, def), name: def.displayProperties.name.replace(/ Catalyst$/, "") })),
  };
  if (!gear.weapons.length && !gear.catalysts.length) return null;
  await storeGear(window.weekStart, window.leavesAt, gear);
  return gear;
}
