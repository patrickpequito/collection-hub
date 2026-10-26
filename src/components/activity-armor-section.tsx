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
  rows,
  previewFiles,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: ActivityArmorSectionProps) {
  const resolvedPreviewFiles = resolveArmorSetPreviewFiles(activitySlug, previewFiles);
  const sets = [...new Set(rows.map((row) => row.setName))].map((setName) => ({
    setName,
    rows: rows.filter((row) => row.setName === setName),
  }));
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
