import type {
  ResolvedWeaponPerkColumn,
  WeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";
import { resolveEquippedPerColumn } from "@/lib/weapons/perks";

export type GodRollChipHighlight = "pve" | "pvp" | "both" | null;

function perkMatchesGodRollList(
  plugHash: string,
  godRollPerks: readonly string[] | undefined,
  plugIndex: Record<string, WeaponPlugDefinition>,
): boolean {
  if (!godRollPerks?.length) return false;

  const plugName = plugIndex[plugHash]?.name;

  for (const godHash of godRollPerks) {
    if (godHash === plugHash) return true;
    const godName = plugIndex[godHash]?.name;
    if (godName && plugName && godName === plugName) return true;
  }

  return false;
}

export function resolveGodRollChipHighlight(
  plugHash: string,
  pveGodRoll: readonly string[] | undefined,
  pvpGodRoll: readonly string[] | undefined,
  plugIndex: Record<string, WeaponPlugDefinition>,
): GodRollChipHighlight {
  const inPve = perkMatchesGodRollList(plugHash, pveGodRoll, plugIndex);
  const inPvp = perkMatchesGodRollList(plugHash, pvpGodRoll, plugIndex);

  if (inPve && inPvp) return "both";
  if (inPve) return "pve";
  if (inPvp) return "pvp";
  return null;
}

/** Highlight god-roll perks by matching plug hash or name in any perk column. */
export function godRollHighlightedPerks(
  godRollPerks: readonly string[] | undefined,
  columns: readonly ResolvedWeaponPerkColumn[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): Set<string> {
  const highlights = new Set<string>();
  if (!godRollPerks?.length) return highlights;

  const perkColumns = columns.filter((column) => column.type === "perk");

  for (const godHash of godRollPerks) {
    const godName = plugIndex[godHash]?.name;
    let matched = false;

    for (const column of perkColumns) {
      const byHash = column.perks.find((perk) => perk.plugHash === godHash);
      if (byHash) {
        highlights.add(byHash.plugHash);
        matched = true;
        break;
      }

      if (godName) {
        const byName = column.perks.find(
          (perk) =>
            perk.name === godName ||
            plugIndex[perk.plugHash]?.name === godName,
        );
        if (byName) {
          highlights.add(byName.plugHash);
          matched = true;
          break;
        }
      }
    }

    if (!matched && plugIndex[godHash]) {
      highlights.add(godHash);
    }
  }

  return highlights;
}

/** Highlight equipped roll perks by resolving one plug per catalog column. */
export function rollHighlightedPerks(
  equippedPlugHashes: readonly string[],
  columns: readonly ResolvedWeaponPerkColumn[],
  plugIndex: Record<string, WeaponPlugDefinition>,
  socketPlugHashesByIndex?: readonly (string | undefined)[],
  rawColumns?: readonly WeaponPerkColumn[],
): Set<string> {
  if (!equippedPlugHashes.length || !columns.length) return new Set();

  const perkColumns: readonly WeaponPerkColumn[] =
    rawColumns ??
    columns.map((column) => ({
      type: column.type,
      plugHashes: column.perks.map((perk) => perk.plugHash),
    }));

  const highlights = new Set<string>();
  for (const hash of resolveEquippedPerColumn(
    equippedPlugHashes,
    perkColumns,
    plugIndex,
    socketPlugHashesByIndex,
  )) {
    if (hash) highlights.add(hash);
  }

  return highlights;
}

/** @deprecated Prefer godRollHighlightedPerks — kept for roll scoring column order. */
export function resolveGodRollPlugsByColumn(
  godRollPerks: readonly string[] | undefined,
  columns: readonly ResolvedWeaponPerkColumn[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): (string | null)[] {
  if (!godRollPerks?.length) return [];

  const perkColumns = columns.filter((column) => column.type === "perk");
  const resolved: (string | null)[] = [];

  for (let index = 0; index < godRollPerks.length; index++) {
    const godHash = godRollPerks[index];
    const column = perkColumns[index];
    if (!column) {
      resolved.push(null);
      continue;
    }

    const godName = plugIndex[godHash]?.name;
    let match =
      column.perks.find((perk) => perk.plugHash === godHash)?.plugHash ?? null;

    if (!match && godName) {
      match =
        column.perks.find(
          (perk) =>
            perk.name === godName ||
            plugIndex[perk.plugHash]?.name === godName,
        )?.plugHash ?? null;
    }

    if (!match) {
      for (const searchColumn of perkColumns) {
        const found =
          searchColumn.perks.find((perk) => perk.plugHash === godHash) ??
          (godName
            ? searchColumn.perks.find(
                (perk) =>
                  perk.name === godName ||
                  plugIndex[perk.plugHash]?.name === godName,
              )
            : undefined);
        if (found) {
          match = found.plugHash;
          break;
        }
      }
    }

    resolved.push(match);
  }

  return resolved;
}
