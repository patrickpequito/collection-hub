import {
  ARMOR_SLOTS,
  CLASS_LABELS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { countOwnedArmorPieces } from "@/lib/activities/armor-rows";
import { ActivityArmorSetPreview } from "@/components/activity-armor-set-preview";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import {
  armorSetPreviewUrl,
  resolveArmorSetPreviewFile,
} from "@/lib/armor-sets/preview-images";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";

type LegacyArmorSetsSectionProps = {
  groups: LegacyArmorSetGroup[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
  heading?: string;
};

function legacySetSource(group: LegacyArmorSetGroup): string {
  for (const row of group.rows) {
    for (const piece of Object.values(row.pieces)) {
      if (piece?.source) return piece.source;
    }
  }
  return "";
}

export function LegacyArmorSetsSection({
  groups,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
  heading = "Legacy armor sets",
}: LegacyArmorSetsSectionProps) {
  if (!groups.length) return null;

  const isOwned = (itemHash: string) =>
    resolveItemOwned?.(itemHash) ?? ownedItemHashes.has(itemHash);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="mb-4 border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        {heading}
      </h2>

      <div className="divide-y divide-zinc-800">
        {groups.map((group) => {
          const progress = countOwnedArmorPieces(group.rows, isOwned);
          const groupTitle = group.displayName ?? group.setName;
          const previewFile =
            group.previewFile ??
            resolveArmorSetPreviewFile(group.setName, legacySetSource(group));

          return (
            <details key={group.setName} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-zinc-800/40 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">{groupTitle}</p>
                  {group.seasonLabel ? (
                    <p className="text-xs text-zinc-500">{group.seasonLabel}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm text-zinc-400">
                  {progress.owned}/{progress.total}
                </p>
              </summary>

              <div className="px-2 pb-4 pt-1">
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_min(52%,28rem)] lg:items-start lg:gap-4">
                  <div className="min-w-0 space-y-3">
                    {group.rows.map((row) => (
                      <div
                        key={`${group.setName}-${row.guardianClass}`}
                        className="space-y-1"
                      >
                        <p className="text-xs text-zinc-500">
                          {CLASS_LABELS[row.guardianClass]}
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                          {ARMOR_SLOTS.map((slot, slotIndex) => {
                            const piece = row.pieces[slot];
                            if (!piece) {
                              return (
                                <div
                                  key={`${group.setName}-${row.guardianClass}-${slot}`}
                                  className="min-w-0"
                                  aria-hidden
                                />
                              );
                            }
                            const tooltipAlign =
                              slotIndex === 0
                                ? "start"
                                : slotIndex === ARMOR_SLOTS.length - 1
                                  ? "end"
                                  : "center";
                            return (
                              <div
                                key={`${group.setName}-${row.guardianClass}-${slot}`}
                                className="min-w-0"
                              >
                                <ArmorPieceIcon
                                  piece={piece}
                                  slotLabel={SLOT_LABELS[slot]}
                                  sourceLabel={piece.source}
                                  owned={isOwned(piece.itemHash)}
                                  showOwnership={showOwnership}
                                  tooltipAlign={tooltipAlign}
                                  fluid
                                  href={itemHrefs?.[piece.itemHash]}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="min-w-0 space-y-1 lg:col-start-2 lg:row-start-1">
                    <p className="text-xs text-zinc-500">Full armor set preview</p>
                    <ActivityArmorSetPreview
                      imageFile={previewFile}
                      imageUrl={armorSetPreviewUrl(previewFile)}
                      label={`${groupTitle} armor set`}
                      missingImageVariant="contribute"
                      contributionLink={{
                        href: X_PROFILE_URL,
                        handle: X_PROFILE_HANDLE,
                      }}
                    />
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
