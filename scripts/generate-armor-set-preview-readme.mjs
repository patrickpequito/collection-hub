import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const previewDir = resolve(root, "public/images/armor-set-previews");
const readmePath = resolve(previewDir, "README.md");
const radLootDir = resolve(root, "src/data/rad-loot");

function slugifySetName(setName) {
  return setName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSetNamesInOrder(setNames) {
  const names = [];
  for (const name of setNames) {
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

function parseRadLootPage(filePath) {
  const content = readFileSync(filePath, "utf8");
  const slugMatch = content.match(/slug:\s*"([^"]+)"/);
  const titleMatch = content.match(/title:\s*"([^"]+)"/);
  if (!slugMatch) return null;

  const previewFilesMatch = content.match(
    /armorSetPreviewFiles:\s*\[([^\]]+)\]/,
  );
  const previewFiles = previewFilesMatch
    ? [...previewFilesMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
    : [`${slugMatch[1]}.webp`];

  const setNames = [
    ...content.matchAll(/setName:\s*"([^"]+)"/g),
  ].map((match) => match[1]);

  if (!setNames.length) return null;

  return {
    slug: slugMatch[1],
    title: titleMatch?.[1] ?? slugMatch[1],
    previewFiles,
    setNames: uniqueSetNamesInOrder(setNames),
  };
}

function buildRadSetPreviewMap(pages) {
  const map = new Map();

  for (const page of pages) {
    const { previewFiles, setNames } = page;

    if (previewFiles.length > 1 && previewFiles.length === setNames.length) {
      setNames.forEach((name, index) => map.set(name, previewFiles[index]));
      continue;
    }

    if (previewFiles.length > 1 && setNames.length > previewFiles.length) {
      const chunkSize = Math.ceil(setNames.length / previewFiles.length);
      setNames.forEach((name, index) => {
        const fileIndex = Math.min(
          Math.floor(index / chunkSize),
          previewFiles.length - 1,
        );
        map.set(name, previewFiles[fileIndex]);
      });
      continue;
    }

    for (const name of setNames) {
      map.set(name, previewFiles[0]);
    }
  }

  return map;
}

function fileStatus(filename) {
  return existsSync(resolve(previewDir, filename)) ? "done" : "todo";
}

const radPages = readdirSync(radLootDir)
  .filter(
    (name) =>
      name.endsWith(".ts") &&
      ![
        "activity-pages.ts",
        "activities.ts",
        "activity-banner-meta.ts",
        "legacy-raid-banner-meta.ts",
      ].includes(name),
  )
  .map((name) => parseRadLootPage(resolve(radLootDir, name)))
  .filter(Boolean)
  .sort((a, b) => a.title.localeCompare(b.title));

const radMap = buildRadSetPreviewMap(radPages);
const bonuses = JSON.parse(
  readFileSync(resolve(root, "data/armor-set-bonuses.json"), "utf8"),
);

const catalogSetNames = Object.values(bonuses.sets)
  .map((entry) => entry.setName)
  .sort((a, b) => a.localeCompare(b));

const radRows = [];
for (const page of radPages) {
  for (const file of page.previewFiles) {
    const coveredSets = page.setNames.filter((name) => radMap.get(name) === file);
    radRows.push({
      file,
      activity: page.title,
      sets: coveredSets.join(", "),
      status: fileStatus(file),
    });
  }
}

const otherRows = [];
for (const setName of catalogSetNames) {
  if (radMap.has(setName)) continue;
  const file = `${slugifySetName(setName)}.webp`;
  otherRows.push({
    file,
    setName,
    status: fileStatus(file),
  });
}

const statusCell = (status) => (status === "done" ? "done" : "**todo**");

const radTable = radRows
  .map(
    (row) =>
      `| \`${row.file}\` | ${row.activity} | ${row.sets} | ${statusCell(row.status)} |`,
  )
  .join("\n");

const otherTable = otherRows
  .map(
    (row) =>
      `| \`${row.file}\` | ${row.setName} | ${statusCell(row.status)} |`,
  )
  .join("\n");

const readme = `# Armor set preview images

Full-set screenshots (all three classes) used on armor detail pages and RAD Loot activity pages.

## Path

\`public/images/armor-set-previews/{filename}.webp\`

## Format

- **WebP** (preferred) or JPG, sRGB
- **Recommended width:** **1200 px** (Hunter, Titan, and Warlock side by side)
- Click opens a larger popup on armor pages and RAD Loot

## RAD activity sets

One image per raid or dungeon activity (sometimes two when an activity has two distinct armor themes).

| File | Activity | Sets covered | Status |
|------|----------|--------------|--------|
${radTable}

## Other legendary sets

Filename is the slugified set name. These sets are not tied to a single RAD activity preview.

| File | Set name | Status |
|------|----------|--------|
${otherTable}

---

_Regenerate this checklist: \`node scripts/generate-armor-set-preview-readme.mjs\`_
`;

writeFileSync(readmePath, readme);
console.log(`Wrote ${readmePath}`);
console.log(
  `RAD previews: ${radRows.filter((r) => r.status === "done").length}/${radRows.length} done`,
);
console.log(
  `Other sets: ${otherRows.filter((r) => r.status === "done").length}/${otherRows.length} done`,
);
