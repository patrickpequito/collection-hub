import {
  ARMOR_SLOTS,
  CLASS_LABELS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { countOwnedArmorPieces } from "@/lib/activities/armor-rows";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";

type LegacyArmorSetsSectionProps = {
  groups: LegacyArmorSetGroup[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
};

export function LegacyArmorSetsSection({
  groups,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: LegacyArmorSetsSectionProps) {
  if (!groups.length) return null;

  const isOwned = (itemHash: string) =>
    resolveItemOwned?.(itemHash) ?? ownedItemHashes.has(itemHash);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <h2 className="mb-4 border-b border-zinc-800 pb-3 text-lg font-semibold text-zinc-100">
        Legacy armor sets
      </h2>

      <div className="divide-y divide-zinc-800">
        {groups.map((group) => {
          const progress = countOwnedArmorPieces(group.rows, isOwned);
          return (
            <details key={group.setName} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-zinc-800/40 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">{group.setName}</p>
                  {group.seasonLabel ? (
                    <p className="text-xs text-zinc-500">{group.seasonLabel}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm text-zinc-400">
                  {progress.owned}/{progress.total}
                </p>
              </summary>

              <div className="space-y-4 px-2 pb-4 pt-1">
                {group.rows.map((row) => (
                  <div
                    key={`${group.setName}-${row.guardianClass}`}
                    className="space-y-1"
                  >
                    <p className="text-xs text-zinc-500">
                      {CLASS_LABELS[row.guardianClass]}
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
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
            </details>
          );
        })}
      </div>
    </section>
  );
}
