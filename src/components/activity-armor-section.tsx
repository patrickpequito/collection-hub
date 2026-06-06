import {
  ARMOR_SLOTS,
  CLASS_LABELS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import {
  activityArmorSetPreviewUrl,
  resolveArmorSetPreviewFiles,
} from "@/lib/activity-armor-set-image";
import { ActivityArmorSetPreview } from "@/components/activity-armor-set-preview";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import type { ActivityArmorRow } from "@/types/activity-loot";

type ActivityArmorSectionProps = {
  activitySlug: string;
  activityTitle: string;
  rows: ActivityArmorRow[];
  previewFiles?: string[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
};

export function ActivityArmorSection({
  activitySlug,
  activityTitle,
  rows,
  previewFiles,
  ownedItemHashes,
  showOwnership,
}: ActivityArmorSectionProps) {
  const resolvedPreviewFiles = resolveArmorSetPreviewFiles(
    activitySlug,
    previewFiles,
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="mb-4 border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        Armor sets
      </h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={`${row.setName}-${row.guardianClass}`}
            className="space-y-1"
          >
            <p className="text-xs text-zinc-500">
              {CLASS_LABELS[row.guardianClass]} — {row.setName}
            </p>
            <div className="flex flex-nowrap gap-1.5">
              {ARMOR_SLOTS.map((slot) => {
                const piece = row.pieces[slot];
                return (
                  <ArmorPieceIcon
                    key={`${row.setName}-${row.guardianClass}-${slot}`}
                    piece={piece}
                    slotLabel={SLOT_LABELS[slot]}
                    sourceLabel={piece.source}
                    owned={ownedItemHashes.has(piece.itemHash)}
                    showOwnership={showOwnership}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="my-4 border-b border-zinc-800" aria-hidden />
      <div className="space-y-4">
        {resolvedPreviewFiles.map((imageFile) => (
          <ActivityArmorSetPreview
            key={imageFile}
            imageFile={imageFile}
            imageUrl={activityArmorSetPreviewUrl(imageFile)}
            label={`${activityTitle} armor sets`}
          />
        ))}
      </div>
    </section>
  );
}
