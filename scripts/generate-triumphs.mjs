/**
 * Builds public/data/triumphs.json from Bungie manifest presentation nodes.
 *
 * Usage: node scripts/generate-triumphs.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/** Top-level triumph categories shown in the Triumphs column. */
const TRIUMPH_ROOT_HASH = "1866538467";

/** Current playable titles (not legacy). */
const TITLE_ROOT_HASH = "616318467";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchJson(path) {
  const url = `https://www.bungie.net${path}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": process.env.BUNGIE_API_KEY },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

function buildObjectiveDef(objectives, objectiveHash) {
  const objective = objectives[objectiveHash];
  if (!objective) return null;

  return {
    objectiveHash: String(objectiveHash),
    progressDescription:
      objective.progressDescription ??
      objective.displayProperties?.description ??
      objective.displayProperties?.name ??
      "",
    completionValue: objective.completionValue ?? 1,
  };
}

function buildRecord(records, objectives, items, recordHash) {
  const def = records[recordHash];
  if (!def?.displayProperties?.name) return null;

  let objectiveDefs = (def.objectiveHashes ?? [])
    .map((objectiveHash) => buildObjectiveDef(objectives, objectiveHash))
    .filter(Boolean);
  let progressStyle = "default";

  if (
    !objectiveDefs.length &&
    def.intervalInfo?.intervalObjectives?.length
  ) {
    objectiveDefs = def.intervalInfo.intervalObjectives
      .map((entry) =>
        buildObjectiveDef(objectives, entry.intervalObjectiveHash),
      )
      .filter(Boolean)
      .sort((a, b) => a.completionValue - b.completionValue);
    progressStyle = "interval";
  }

  const rewards = (def.rewardItems ?? [])
    .map((reward) => {
      const item = items[reward.itemHash];
      if (!item?.displayProperties?.name) return null;
      return {
        itemHash: String(reward.itemHash),
        name: item.displayProperties.name,
        itemType: item.itemTypeDisplayName ?? "",
        iconPath: item.displayProperties.icon ?? "",
      };
    })
    .filter(Boolean);

  return {
    recordHash: String(recordHash),
    name: def.displayProperties.name,
    description: def.displayProperties.description ?? "",
    iconPath: def.displayProperties.icon ?? "",
    score: def.completionInfo?.ScoreValue ?? def.completionInfo?.Score ?? 0,
    forTitleGilding: Boolean(def.forTitleGilding),
    progressStyle,
    objectives: objectiveDefs,
    rewards,
  };
}

function collectRecordHashesFromNode(nodeHash, presentationNodes, seen = new Set()) {
  const node = presentationNodes[nodeHash];
  if (!node || seen.has(nodeHash)) return [];
  seen.add(nodeHash);

  let hashes = (node.children?.records ?? []).map((entry) => entry.recordHash);
  for (const child of node.children?.presentationNodes ?? []) {
    hashes = hashes.concat(
      collectRecordHashesFromNode(
        String(child.presentationNodeHash),
        presentationNodes,
        seen,
      ),
    );
  }
  return hashes;
}

function collectCategoryGroups(
  rootHash,
  presentationNodes,
  records,
  objectives,
  items,
) {
  const root = presentationNodes[rootHash];
  if (!root?.children?.presentationNodes) return [];

  const groups = [];
  for (const child of root.children.presentationNodes) {
    const nodeHash = String(child.presentationNodeHash);
    const node = presentationNodes[nodeHash];
    if (!node?.displayProperties?.name) continue;

    const uniqueHashes = [
      ...new Set(collectRecordHashesFromNode(nodeHash, presentationNodes)),
    ];
    const recordItems = uniqueHashes
      .map((hash) => buildRecord(records, objectives, items, hash))
      .filter(Boolean);
    if (!recordItems.length) continue;

    groups.push({
      slug: slugify(node.displayProperties.name),
      presentationNodeHash: nodeHash,
      name: node.displayProperties.name,
      iconPath: node.displayProperties.icon ?? "",
      records: recordItems,
    });
  }

  return groups;
}

function isSeasonalTitle(node) {
  const description = node.displayProperties.description ?? "";
  return /progress resets at the end of the event/i.test(description);
}

function getGuardianTitle(completionDef) {
  const titles = completionDef?.titleInfo?.titlesByGender;
  if (!titles) return null;
  return titles.Male ?? titles.Female ?? Object.values(titles)[0] ?? null;
}

function collectTitles(titleRootHash, presentationNodes, records, objectives, items) {
  const root = presentationNodes[titleRootHash];
  if (!root?.children?.presentationNodes) return [];

  const titles = [];
  for (const [sortOrder, child] of root.children.presentationNodes.entries()) {
    const nodeHash = String(child.presentationNodeHash);
    const node = presentationNodes[nodeHash];
    if (!node?.displayProperties?.name) continue;

    const itemsForTitle = (node.children?.records ?? [])
      .map((entry) => buildRecord(records, objectives, items, entry.recordHash))
      .filter(Boolean);
    if (!itemsForTitle.length) continue;

    const completionRecordHash = node.completionRecordHash
      ? String(node.completionRecordHash)
      : null;
    const completionDef = completionRecordHash
      ? records[completionRecordHash]
      : null;
    const gildingTrackingRecordHash = completionDef?.titleInfo
      ?.gildingTrackingRecordHash
      ? String(completionDef.titleInfo.gildingTrackingRecordHash)
      : null;

    titles.push({
      slug: slugify(node.displayProperties.name),
      presentationNodeHash: nodeHash,
      name: node.displayProperties.name,
      description: node.displayProperties.description ?? "",
      iconPath: node.displayProperties.icon ?? "",
      guardianTitle: getGuardianTitle(completionDef),
      sortOrder,
      isSeasonal: isSeasonalTitle(node),
      completionRecordHash,
      gildingTrackingRecordHash,
      records: itemsForTitle,
    });
  }

  return titles;
}

loadEnv();

const API_KEY = process.env.BUNGIE_API_KEY;
if (!API_KEY) {
  console.error("Missing BUNGIE_API_KEY in .env.local");
  process.exit(1);
}

const manifest = (
  await fetchJson("/Platform/Destiny2/Manifest/")
).Response.jsonWorldComponentContentPaths.en;

const [presentationNodes, records, objectives, items] = await Promise.all([
  fetchJson(manifest.DestinyPresentationNodeDefinition),
  fetchJson(manifest.DestinyRecordDefinition),
  fetchJson(manifest.DestinyObjectiveDefinition),
  fetchJson(manifest.DestinyInventoryItemDefinition),
]);

const groups = collectCategoryGroups(
  TRIUMPH_ROOT_HASH,
  presentationNodes,
  records,
  objectives,
  items,
);

const titles = collectTitles(
  TITLE_ROOT_HASH,
  presentationNodes,
  records,
  objectives,
  items,
);

const output = {
  generatedAt: new Date().toISOString(),
  groups,
  titles,
};

mkdirSync(resolve(root, "public/data"), { recursive: true });
writeFileSync(
  resolve(root, "public/data/triumphs.json"),
  JSON.stringify(output, null, 2),
);

console.log(
  `Wrote ${groups.length} triumph groups and ${titles.length} titles to public/data/triumphs.json`,
);
