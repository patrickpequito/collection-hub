import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { preferCatalogVersion } from "./all-loot-mappings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const catalogPath = resolve(root, "data/all-loot.json");

function buildSearchText(entry) {
  const versionText = (entry.versions ?? []).flatMap((version) => [
    version.name,
    version.seasonLabel,
    version.eventLabel,
  ]);

  return [
    entry.name,
    entry.seasonLabel,
    entry.eventLabel,
    ...versionText,
    entry.type,
    entry.rarity,
    entry.classOrWeaponType,
    entry.damageType,
    entry.slot,
    entry.ammoType,
    entry.source,
    entry.obtainable ? "obtainable yes" : "obtainable no",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function versionDisplayLabel(version) {
  return version.eventLabel ?? version.seasonLabel;
}

function dedupeVersions(versions) {
  const merged = [];

  for (const version of versions) {
    const label = versionDisplayLabel(version);
    const index = merged.findIndex(
      (existing) => versionDisplayLabel(existing) === label,
    );

    if (index === -1) {
      merged.push(version);
      continue;
    }

    merged[index] = preferCatalogVersion(merged[index], version);
  }

  return merged.sort(
    (a, b) =>
      (b.seasonNumber ?? 0) - (a.seasonNumber ?? 0) ||
      Number(b.itemHash) - Number(a.itemHash),
  );
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
let updated = 0;

for (const item of catalog.items) {
  if (!item.versions?.length) continue;

  const deduped = dedupeVersions(item.versions);
  if (deduped.length === item.versions.length) continue;

  item.versions = deduped.length > 1 ? deduped : undefined;
  item.searchText = buildSearchText(item);
  updated += 1;
}

writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Deduped versions on ${updated} catalog items.`);
