import { RAD_LOOT_ACTIVITY_PAGES } from "@/data/rad-loot/activity-pages";

export const ARMOR_SET_PREVIEW_DIR = "/images/armor-set-previews";

export function armorSetPreviewUrl(imageFile: string): string {
  return `${ARMOR_SET_PREVIEW_DIR}/${imageFile}`;
}

export function defaultActivityPreviewFile(activitySlug: string): string {
  return `${activitySlug}.webp`;
}

function slugifySetName(setName: string): string {
  return setName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSetNamesInOrder(
  armorSets: { setName: string }[],
): string[] {
  const names: string[] = [];
  for (const row of armorSets) {
    if (!names.includes(row.setName)) {
      names.push(row.setName);
    }
  }
  return names;
}

function buildRadSetPreviewMap(): ReadonlyMap<string, string> {
  const map = new Map<string, string>();

  for (const page of Object.values(RAD_LOOT_ACTIVITY_PAGES)) {
    const previewFiles =
      page.armorSetPreviewFiles ?? [defaultActivityPreviewFile(page.slug)];
    const setNames = uniqueSetNamesInOrder(page.armorSets);

    if (
      previewFiles.length > 1 &&
      previewFiles.length === setNames.length
    ) {
      setNames.forEach((name, index) => {
        map.set(name, previewFiles[index]!);
      });
      continue;
    }

    if (previewFiles.length > 1 && setNames.length > previewFiles.length) {
      const chunkSize = Math.ceil(setNames.length / previewFiles.length);
      setNames.forEach((name, index) => {
        const fileIndex = Math.min(
          Math.floor(index / chunkSize),
          previewFiles.length - 1,
        );
        map.set(name, previewFiles[fileIndex]!);
      });
      continue;
    }

    for (const name of setNames) {
      map.set(name, previewFiles[0]!);
    }
  }

  return map;
}

const RAD_SET_PREVIEW_FILES = buildRadSetPreviewMap();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildActivitySourcePreviewPatterns(): [RegExp, string][] {
  const patterns: [RegExp, string][] = [];
  const seen = new Set<string>();

  for (const page of Object.values(RAD_LOOT_ACTIVITY_PAGES)) {
    const previewFile =
      (page.armorSetPreviewFiles ?? [defaultActivityPreviewFile(page.slug)])[0]!;

    const labels = new Set<string>([
      page.title,
      page.slug,
      page.slug.replace(/-/g, " "),
    ]);

    for (const row of page.armorSets) {
      for (const piece of Object.values(row.pieces)) {
        if (!piece?.source) continue;
        const quoted = piece.source.match(/"([^"]+)"/);
        if (quoted?.[1]) labels.add(quoted[1]);
      }
    }

    for (const label of labels) {
      const key = `${label.toLowerCase()}::${previewFile}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pattern = escapeRegExp(label).replace(/'/g, "['']?");
      patterns.push([new RegExp(pattern, "i"), previewFile]);
    }
  }

  return patterns;
}

const ACTIVITY_SOURCE_PREVIEW_PATTERNS = buildActivitySourcePreviewPatterns();

/** Preview filename for a legendary set (RAD activity image or slugified set name). */
export function resolveArmorSetPreviewFile(
  setName: string,
  source = "",
): string {
  const mapped = RAD_SET_PREVIEW_FILES.get(setName);
  if (mapped) return mapped;

  if (source) {
    for (const [pattern, previewFile] of ACTIVITY_SOURCE_PREVIEW_PATTERNS) {
      if (pattern.test(source)) return previewFile;
    }
  }

  return `${slugifySetName(setName)}.webp`;
}

/** Resolves preview filenames for a RAD Loot activity page. */
export function resolveActivityArmorSetPreviewFiles(
  activitySlug: string,
  customFiles?: string[],
): string[] {
  if (customFiles?.length) return customFiles;
  return [defaultActivityPreviewFile(activitySlug)];
}
