/**
 * Sanity-checks season labels in public/data/all-loot.json.
 *
 * Usage: node scripts/validate-all-loot-seasons.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_SEASON_ORDER,
  EXPANSION_DISPLAY_NUMBER,
  isExpansionLabel,
} from "./all-loot-mappings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogPath = resolve(__dirname, "../public/data/all-loot.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const knownSeasons = new Set(CANONICAL_SEASON_ORDER);
const issues = [];

for (const item of catalog.items) {
  const labels = new Set([item.seasonLabel]);
  if (item.expansionLabel) labels.add(item.expansionLabel);
  for (const version of item.versions ?? []) labels.add(version.seasonLabel);

  for (const label of labels) {
    if (!knownSeasons.has(label) && !/^S\d+/.test(label)) {
      issues.push({
        type: "unknown-label",
        name: item.name,
        label,
      });
    }
  }

  if (item.expansionLabel && item.versions?.length) {
    const expansionNumbers = new Set(
      [item.expansionLabel]
        .filter(isExpansionLabel)
        .map((label) => EXPANSION_DISPLAY_NUMBER[label] ?? 0),
    );
    const versionNumbers = item.versions.map((version) => version.seasonNumber);
    const debutNumber = Math.min(...versionNumbers);
    for (const expansionNumber of expansionNumbers) {
      if (expansionNumber > 0 && debutNumber < expansionNumber - 1) {
        issues.push({
          type: "expansion-before-debut",
          name: item.name,
          expansionLabel: item.expansionLabel,
          debutSeasonNumber: debutNumber,
        });
        break;
      }
    }
  }

  if (item.versions?.length) {
    const sorted = [...item.versions].sort(
      (a, b) => b.seasonNumber - a.seasonNumber,
    );
    if (sorted[0].seasonLabel !== item.seasonLabel) {
      issues.push({
        type: "latest-mismatch",
        name: item.name,
        primary: item.seasonLabel,
        latestVersion: sorted[0].seasonLabel,
      });
    }

    const seen = new Set();
    for (const version of item.versions) {
      const key = `${version.seasonLabel}:${version.itemHash}`;
      if (seen.has(version.seasonLabel)) {
        issues.push({
          type: "duplicate-version-label",
          name: item.name,
          seasonLabel: version.seasonLabel,
        });
        break;
      }
      seen.add(version.seasonLabel);
    }
  }
}

const expansionCounts = Object.fromEntries(
  Object.keys(EXPANSION_DISPLAY_NUMBER).map((label) => [label, 0]),
);

for (const item of catalog.items) {
  const filterLabels = new Set([item.seasonLabel]);
  if (item.expansionLabel) filterLabels.add(item.expansionLabel);
  for (const version of item.versions ?? []) filterLabels.add(version.seasonLabel);

  for (const label of filterLabels) {
    if (expansionCounts[label] !== undefined) expansionCounts[label]++;
  }
}

console.log("Expansion filter coverage:");
for (const [label, count] of Object.entries(expansionCounts).sort(
  (a, b) => b[1] - a[1],
)) {
  console.log(`  ${label}: ${count}`);
}

if (!issues.length) {
  console.log("\nNo structural season issues found.");
  process.exit(0);
}

console.log(`\nFound ${issues.length} issue(s):`);
for (const issue of issues.slice(0, 40)) {
  console.log(issue);
}
if (issues.length > 40) {
  console.log(`…and ${issues.length - 40} more`);
}
process.exit(1);
