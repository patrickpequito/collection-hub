import { collectWeaponPageItemHashes } from "@/lib/weapons/page-hashes";
import type {
  AllLootItem,
  WeaponPerkColumn,
  WeaponPlugDefinition,
} from "@/types/all-loot";
import type {
  WeaponAegisRollIndex,
  WeaponAegisWeaponEntry,
} from "@/types/weapon-aegis-rolls";
import type { WeaponRollAegisScore } from "@/types/weapon-rolls";

export function aegisPercentToTier(percent: number): string {
  if (percent >= 95) return "S";
  if (percent >= 80) return "A";
  if (percent >= 65) return "B";
  if (percent >= 50) return "C";
  if (percent >= 35) return "D";
  return "F";
}

function plugName(
  plugHash: string,
  plugIndex: Record<string, WeaponPlugDefinition>,
): string | null {
  return plugIndex[plugHash]?.name ?? null;
}

function equippedPlugNames(
  equippedPlugHashes: readonly string[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): Set<string> {
  const names = new Set<string>();
  for (const hash of equippedPlugHashes) {
    const name = plugName(hash, plugIndex);
    if (name) names.add(name);
  }
  return names;
}

function lineMatchesEquipped(
  line: readonly string[],
  equippedNames: ReadonlySet<string>,
  plugIndex: Record<string, WeaponPlugDefinition>,
): number {
  return line.filter((hash) => {
    const name = plugName(hash, plugIndex);
    return Boolean(name && equippedNames.has(name));
  }).length;
}

function scoreBestLineMatch(
  equippedPlugHashes: readonly string[],
  lines: readonly string[][],
  plugIndex: Record<string, WeaponPlugDefinition>,
  perkColumnsTotal: number,
): number {
  const equippedNames = equippedPlugNames(equippedPlugHashes, plugIndex);
  let bestMatches = 0;

  for (const line of lines) {
    bestMatches = Math.max(
      bestMatches,
      lineMatchesEquipped(line, equippedNames, plugIndex),
    );
  }

  const denominator = Math.max(
    perkColumnsTotal,
    Math.max(...lines.map((line) => line.length), 1),
  );

  return Math.round((bestMatches / denominator) * 100);
}

function traitComboColumnIndices(
  columns: readonly WeaponPerkColumn[],
  perkColumnIndices: readonly number[],
): number[] {
  if (perkColumnIndices.length < 2) return [];

  let indices = [...perkColumnIndices];

  while (indices.length >= 2) {
    const lastColumn = columns[indices[indices.length - 1]];
    if (lastColumn.plugHashes.length <= 1) {
      indices = indices.slice(0, -1);
      continue;
    }
    break;
  }

  return indices.length >= 2 ? indices.slice(-2) : [];
}

function resolveEquippedPerColumn(
  equippedPlugHashes: readonly string[],
  perkColumns: readonly WeaponPerkColumn[],
  plugIndex: Record<string, WeaponPlugDefinition>,
): (string | null)[] {
  const equipped = new Set(equippedPlugHashes);
  const equippedNames = equippedPlugNames(equippedPlugHashes, plugIndex);

  return perkColumns.map((column) => {
    const direct = column.plugHashes.find((hash) => equipped.has(hash));
    if (direct) return direct;

    return (
      column.plugHashes.find((hash) => {
        const name = plugName(hash, plugIndex);
        return Boolean(name && equippedNames.has(name));
      }) ?? null
    );
  });
}

function isDesirablePlug(
  plugHash: string,
  desirableHashes: ReadonlySet<string>,
  plugIndex: Record<string, WeaponPlugDefinition>,
): boolean {
  if (desirableHashes.has(plugHash)) return true;

  const name = plugName(plugHash, plugIndex);
  if (!name) return false;

  for (const hash of desirableHashes) {
    if (plugName(hash, plugIndex) === name) return true;
  }

  return false;
}

export function mergeAegisEntriesForWeaponPage(
  weapon: AllLootItem,
  index: WeaponAegisRollIndex,
): WeaponAegisWeaponEntry | null {
  const lineKeys = new Set<string>();
  const lines: string[][] = [];
  let archetypeTier: string | undefined;

  for (const itemHash of collectWeaponPageItemHashes(weapon)) {
    const entry = index.weapons[itemHash];
    if (!entry) continue;

    archetypeTier ??= entry.archetypeTier;

    for (const line of entry.lines) {
      const key = [...line].sort().join(",");
      if (lineKeys.has(key)) continue;
      lineKeys.add(key);
      lines.push(line);
    }
  }

  if (!lines.length) return null;

  return { archetypeTier, lines };
}

export function scoreAegisRoll(
  equippedPlugHashes: readonly string[],
  perkColumns: readonly WeaponPerkColumn[] | undefined,
  entry: WeaponAegisWeaponEntry | null,
  plugIndex: Record<string, WeaponPlugDefinition> = {},
): WeaponRollAegisScore & { tier: string | null } {
  if (!entry?.lines.length) {
    return {
      tier: null,
      overallPercent: null,
      perkColumnsHit: 0,
      perkColumnsTotal: 0,
      traitComboMatch: false,
    };
  }

  const columns = perkColumns ?? [];
  const equippedPerColumn = resolveEquippedPerColumn(
    equippedPlugHashes,
    columns,
    plugIndex,
  );
  const desirable = new Set(entry.lines.flat());

  const perkColumnIndices = columns
    .map((column, index) => (column.type === "perk" ? index : -1))
    .filter((index) => index >= 0);

  let perkColumnsHit = 0;
  for (const index of perkColumnIndices) {
    const plug = equippedPerColumn[index];
    if (plug && isDesirablePlug(plug, desirable, plugIndex)) perkColumnsHit++;
  }

  const perkColumnsTotal = perkColumnIndices.length;
  const columnPercent =
    perkColumnsTotal > 0
      ? Math.round((perkColumnsHit / perkColumnsTotal) * 100)
      : 0;
  const linePercent = scoreBestLineMatch(
    equippedPlugHashes,
    entry.lines,
    plugIndex,
    perkColumnsTotal,
  );

  let traitComboMatch = false;
  const traitComboIndices = traitComboColumnIndices(
    columns,
    perkColumnIndices,
  );

  if (traitComboIndices.length === 2) {
    const plug1 = equippedPerColumn[traitComboIndices[0]];
    const plug2 = equippedPerColumn[traitComboIndices[1]];

    if (plug1 && plug2) {
      const name1 = plugName(plug1, plugIndex);
      const name2 = plugName(plug2, plugIndex);

      traitComboMatch = entry.lines.some((line) => {
        const lineNames = new Set(
          line
            .map((hash) => plugName(hash, plugIndex))
            .filter((name): name is string => Boolean(name)),
        );
        return Boolean(
          name1 && name2 && lineNames.has(name1) && lineNames.has(name2),
        );
      });
    }
  }

  const traitPercent = traitComboMatch ? 100 : 0;
  const overallPercent = Math.round(
    columnPercent * (2 / 3) + traitPercent * (1 / 3),
  );

  return {
    tier: aegisPercentToTier(Math.max(overallPercent, columnPercent)),
    overallPercent: Math.max(overallPercent, columnPercent),
    perkColumnsHit,
    perkColumnsTotal,
    traitComboMatch,
  };
}
