import { ArmorSetBlock } from "@/components/activity-current-loot-panel";
import { SectionHeading } from "@/components/detail-page-parts";
import { resolveArmorSetPreviewFiles } from "@/lib/activity-armor-set-image";
import type { ActivityArmorRow } from "@/types/activity-loot";

type ActivityArmorSectionProps = {
  activitySlug: string;
  activityTitle: string;
  rows: ActivityArmorRow[];
  previewFiles?: string[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
  /** Kept for callers; every layout now uses the shared armor set block. */
  layout?: "column" | "wide";
};

/** Raid / dungeon "Armor sets": one shared armor set block per set. */
export function ActivityArmorSection({
  activitySlug,
  activityTitle,
  rows,
  previewFiles,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: ActivityArmorSectionProps) {
  const resolvedPreviewFiles = resolveArmorSetPreviewFiles(activitySlug, previewFiles);
  // Many raids name each class's set differently (Trepidation / Agony / Detestation):
  // set names are merged into one block until a class would repeat.
  const sets: { setName: string; rows: ActivityArmorRow[] }[] = [];
  for (const setName of new Set(rows.map((row) => row.setName))) {
    const setRows = rows.filter((row) => row.setName === setName);
    const last = sets.at(-1);
    const classesTaken = new Set(last?.rows.map((row) => row.guardianClass));
    if (last && setRows.every((row) => !classesTaken.has(row.guardianClass))) {
      last.rows.push(...setRows);
    } else {
      sets.push({ setName, rows: [...setRows] });
    }
  }
  // A merged block is named after the raid, or after its sets when the raid has several.
  for (const set of sets) {
    const names = [...new Set(set.rows.map((row) => row.setName))];
    if (names.length > 1) set.setName = sets.length === 1 ? activityTitle : names.join(" / ");
  }
  // Previews pair with sets when the counts match; otherwise the first set shows the first one.
  const previewsFor = (index: number) =>
    resolvedPreviewFiles.length === sets.length
      ? [resolvedPreviewFiles[index]]
      : index === 0
        ? resolvedPreviewFiles
        : [];

  return (
    <section className="min-w-0 max-w-full space-y-3">
      <SectionHeading title="Armor sets" />
      {sets.map((set, index) => (
        <ArmorSetBlock
          key={set.setName}
          setName={set.setName}
          rows={set.rows}
          previewFiles={previewsFor(index)}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          resolveItemOwned={resolveItemOwned}
          itemHrefs={itemHrefs}
        />
      ))}
    </section>
  );
}
