import type {
  ResolvedWeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";

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

/** Highlight equipped roll perks by matching plug hash or name in any column. */
export function rollHighlightedPerks(
  equippedPlugHashes: readonly string[],
  columns: readonly ResolvedWeaponPerkColumn[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): Set<string> {
  const highlights = new Set<string>();
  if (!equippedPlugHashes.length) return highlights;

  for (const equippedHash of equippedPlugHashes) {
    const equippedName = plugIndex[equippedHash]?.name;

    for (const column of columns) {
      const byHash = column.perks.find((perk) => perk.plugHash === equippedHash);
      if (byHash) {
        highlights.add(byHash.plugHash);
        break;
      }

      if (equippedName) {
        const byName = column.perks.find(
          (perk) =>
            perk.name === equippedName ||
            plugIndex[perk.plugHash]?.name === equippedName,
        );
        if (byName) {
          highlights.add(byName.plugHash);
          break;
        }
      }
    }
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
