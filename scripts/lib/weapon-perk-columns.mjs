/**
 * Shared helpers to resolve weapon perk columns and stats from Bungie manifest items.
 */

const EXCLUDED_WEAPON_STAT_HASHES = new Set([
  1480404414,
  1935470627,
  1931675084,
]);

const WEAPON_STAT_HASHES = {
  Accuracy: 1591432999,
  BlastRadius: 3614673599,
  ChargeTime: 2961396640,
  Impact: 4043523819,
  DrawTime: 447667954,
  Handling: 943549884,
  CoolingEfficiency: 3361094766,
  Persistence: 3863609976,
  Range: 1240592695,
  ReloadSpeed: 4188031367,
  Stability: 155624089,
  Velocity: 2523465841,
  VentSpeed: 2591150011,
  ShieldDuration: 1842278586,
};

const WEAPON_MASTERWORK_PLUG_CATEGORY = {
  [WEAPON_STAT_HASHES.Accuracy]: 1238043140,
  [WEAPON_STAT_HASHES.BlastRadius]: 1847616696,
  [WEAPON_STAT_HASHES.ChargeTime]: 2827428737,
  [WEAPON_STAT_HASHES.Impact]: 2458812152,
  [WEAPON_STAT_HASHES.DrawTime]: 482070447,
  [WEAPON_STAT_HASHES.Handling]: 199786516,
  [WEAPON_STAT_HASHES.CoolingEfficiency]: 2437126983,
  [WEAPON_STAT_HASHES.Persistence]: 854547368,
  [WEAPON_STAT_HASHES.Range]: 1392237582,
  [WEAPON_STAT_HASHES.ReloadSpeed]: 717646604,
  [WEAPON_STAT_HASHES.Stability]: 1762223024,
  [WEAPON_STAT_HASHES.Velocity]: 2321551094,
  [WEAPON_STAT_HASHES.VentSpeed]: 2876802050,
  [WEAPON_STAT_HASHES.ShieldDuration]: 1210640601,
};

const ITEM_CATEGORY_HASHES = {
  Bows: 3317537436,
  Sword: 3954685534,
};

function collectSocketPlugHashes(socket, plugSets) {
  const hashes = new Set();
  for (const plug of socket.reusablePlugItems ?? []) {
    hashes.add(plug.plugItemHash);
  }
  for (const setHash of [
    socket.randomizedPlugSetHash,
    socket.reusablePlugSetHash,
  ]) {
    if (!setHash) continue;
    const set = plugSets[String(setHash)];
    for (const plug of set?.reusablePlugItems ?? []) {
      hashes.add(plug.plugItemHash);
    }
  }
  return hashes;
}

function plugCategoryId(plug) {
  return plug?.plug?.plugCategoryIdentifier ?? "";
}

function isMasterworkStatPlug(plug) {
  return plugCategoryId(plug).includes("masterworks.stat");
}

function shouldSkipWeaponPlug(plug) {
  const category = plugCategoryId(plug);
  const name = plug?.displayProperties?.name ?? "";
  if (!plug?.displayProperties?.icon) return true;
  if (plug.redacted || plug.blacklisted) return true;
  if (name.startsWith("Empty ") || name === "Default Ornament") return true;
  if (name === "Default Combat Flair") return true;
  if (category.includes("shader")) return true;
  if (category.includes("skins")) return true;
  if (category.includes("kill_vfx")) return true;
  if (category.includes("confetti")) return true;
  if (category.includes("enhancers")) return true;
  if (category.includes("mod_empty")) return true;
  if (category.includes("weapon.mod_empty")) return true;
  if (category.includes("masterworks.trackers")) return true;
  if (category.includes("mod_guns")) return true;
  if (category.includes("mod_magazine")) return true;
  if (category.includes("mod_damage")) return true;
  if (category.includes("mod_mag_adjusting")) return true;
  return false;
}

function dedupeWeaponPlugs(plugs) {
  const seen = new Set();
  const result = [];
  for (const plug of plugs) {
    if (shouldSkipWeaponPlug(plug)) continue;
    const hash = String(plug.hash);
    if (seen.has(hash)) continue;
    seen.add(hash);
    result.push(plug);
  }
  return result;
}

function dedupeWeaponPlugsByName(plugs) {
  const seen = new Set();
  const result = [];
  for (const plug of plugs) {
    const name = plug.displayProperties?.name ?? "";
    if (!name || seen.has(name)) continue;
    seen.add(name);
    result.push(plug);
  }
  return result;
}

function isValidWeaponMasterworkStat(item, statHash, statGroups) {
  if (
    statHash === WEAPON_STAT_HASHES.ChargeTime &&
    item.itemCategoryHashes?.includes(ITEM_CATEGORY_HASHES.Bows)
  ) {
    return false;
  }
  if (
    statHash === WEAPON_STAT_HASHES.Impact &&
    !item.itemCategoryHashes?.includes(ITEM_CATEGORY_HASHES.Sword)
  ) {
    return false;
  }
  const statGroupHash = item.stats?.statGroupHash;
  if (!statGroupHash) return false;
  const statGroupDef = statGroups[String(statGroupHash)];
  return statGroupDef?.scaledStats?.some((entry) => entry.statHash === statHash) ?? false;
}

function resolveMasterworkPlugsForWeapon(item, masterworkPlugs, statGroups, statDefs) {
  const resolved = [];
  for (const [statHash, plugCategoryHash] of Object.entries(
    WEAPON_MASTERWORK_PLUG_CATEGORY,
  )) {
    const numericStatHash = Number(statHash);
    if (!isValidWeaponMasterworkStat(item, numericStatHash, statGroups)) continue;

    const plugsForStat = masterworkPlugs.filter(
      (plug) => plug.plug?.plugCategoryHash === plugCategoryHash,
    );
    if (!plugsForStat.length) continue;

    const best = plugsForStat.sort((a, b) => {
      const tierA = Number(a.displayProperties?.name?.match(/Tier (\d+)/)?.[1] ?? 0);
      const tierB = Number(b.displayProperties?.name?.match(/Tier (\d+)/)?.[1] ?? 0);
      return tierB - tierA;
    })[0];
    const tier = Number(best.displayProperties?.name?.match(/Tier (\d+)/)?.[1] ?? 10);
    const statName =
      statDefs[String(numericStatHash)]?.displayProperties?.name ??
      best.displayProperties?.name?.replace(/^Tier \d+: /, "") ??
      "Stat";

    resolved.push({ plug: best, statName, tier });
  }

  return resolved.sort((a, b) => a.statName.localeCompare(b.statName));
}

function masterworkPlugCatalogEntry({ plug, statName, tier }) {
  return {
    name: `Masterworked: ${statName}`,
    description: `+${tier} ${statName}`,
    iconPath: plug.displayProperties.icon,
  };
}

function isWeaponPerkSocket(categoryName, plugs) {
  if (categoryName !== "WEAPON PERKS") return false;
  return !plugs.every((plug) =>
    plugCategoryId(plug).includes("masterworks.trackers"),
  );
}

function isMasterworkSocket(categoryName, plugs) {
  if (categoryName !== "WEAPON MODS") return false;
  return plugs.some(isMasterworkStatPlug);
}

export function resolveWeaponStatsFromManifest(item, statDefs) {
  const statsBlock = item.stats?.stats;
  if (!statsBlock) return undefined;

  const resolved = Object.values(statsBlock)
    .map((entry) => {
      const def = statDefs[String(entry.statHash)];
      if (!def?.displayProperties?.name) return null;
      if (EXCLUDED_WEAPON_STAT_HASHES.has(entry.statHash)) return null;
      if (def.statCategory !== 1) return null;

      return {
        name: def.displayProperties.name,
        value: entry.value,
        max: entry.displayMaximum || 100,
        sort: def.index ?? 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sort - b.sort)
    .map(({ name, value, max }) => ({ name, value, max }));

  return resolved.length ? resolved : undefined;
}

export function resolveWeaponPerkColumnsFromManifest(
  item,
  {
    items,
    plugSets,
    socketTypes,
    socketCategories,
    statGroups,
    statDefs,
    plugIndex,
  },
) {
  const masterworkPlugs = [];
  const perkColumns = [];

  for (let socketIndex = 0; socketIndex < (item.sockets?.socketEntries?.length ?? 0); socketIndex++) {
    const socket = item.sockets.socketEntries[socketIndex];
    const socketType = socketTypes[String(socket.socketTypeHash)];
    const categoryHash = socketType?.socketCategoryHash;
    const categoryName =
      socketCategories[String(categoryHash)]?.displayProperties?.name ?? "";
    const plugs = dedupeWeaponPlugs(
      [...collectSocketPlugHashes(socket, plugSets)]
        .map((hash) => items[String(hash)])
        .filter(Boolean),
    );
    if (!plugs.length) continue;

    if (isMasterworkSocket(categoryName, plugs)) {
      masterworkPlugs.push(...plugs.filter(isMasterworkStatPlug));
      continue;
    }

    if (isWeaponPerkSocket(categoryName, plugs)) {
      for (const plug of plugs) {
        const hash = String(plug.hash);
        plugIndex[hash] ??= {
          name: plug.displayProperties.name,
          description: plug.displayProperties.description ?? "",
          iconPath: plug.displayProperties.icon,
        };
      }
      perkColumns.push({
        socketIndex,
        plugs: dedupeWeaponPlugsByName(plugs),
      });
    }
  }

  const columns = [];
  const masterworks = resolveMasterworkPlugsForWeapon(
    item,
    masterworkPlugs,
    statGroups,
    statDefs,
  );
  if (masterworks.length) {
    columns.push({
      type: "masterwork",
      plugHashes: masterworks.map(({ plug, statName, tier }) => {
        const hash = String(plug.hash);
        plugIndex[hash] = masterworkPlugCatalogEntry({ plug, statName, tier });
        return hash;
      }),
    });
  }

  for (const { socketIndex, plugs } of perkColumns) {
    columns.push({
      type: "perk",
      socketIndex,
      plugHashes: plugs.map((plug) => {
        const hash = String(plug.hash);
        plugIndex[hash] = {
          name: plug.displayProperties.name,
          description: plug.displayProperties.description ?? "",
          iconPath: plug.displayProperties.icon,
        };
        return hash;
      }),
    });
  }

  return columns.length ? columns : undefined;
}

export function resolveWeaponScreenshotFromManifest(item) {
  return item?.screenshot || undefined;
}
