"use client";

import {
  ARMOR_SLOTS,
  CLASS_LABELS,
  SLOT_LABELS,
} from "@/lib/armor-sets/constants";
import { ActivityArmorSetPreview } from "@/components/activity-armor-set-preview";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import { useOwnership } from "@/components/client-ownership";
import { LootItemGrid } from "@/components/loot-section";
import {
  armorSetPreviewUrl,
  resolveArmorSetPreviewFile,
} from "@/lib/armor-sets/preview-images";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";
import type { ExpansionDeepLootPool } from "@/lib/expansions/resolve-expansion-loot";

type ExpansionDeepLootSectionProps = {
  pools: ExpansionDeepLootPool[];
  itemHrefs?: Record<string, string>;
  emptyDescription: string;
};

export function ExpansionDeepLootSection({
  pools,
  itemHrefs,
  emptyDescription,
}: ExpansionDeepLootSectionProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();

  if (pools.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Deep loot</h2>
        <p className="mt-2 text-sm text-zinc-400">{emptyDescription}</p>
      </section>
    );
  }

  const isOwned = (itemHash: string) => ownedItemHashes.has(itemHash);

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Deep loot</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Loot this expansion added to playlist activities and world drops.
          Each pool collapses on its own. Raid/dungeon hubs are linked above.
        </p>
      </div>

      <div className="space-y-3">
        {pools.map((pool) => (
          <details
            key={pool.id}
            open
            className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40"
          >
            <summary className="cursor-pointer list-none px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  {pool.title}
                </h3>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 group-open:hidden">
                  Show
                </span>
                <span className="hidden text-xs font-medium uppercase tracking-wide text-zinc-500 group-open:inline">
                  Hide
                </span>
              </div>
            </summary>
            <div className="space-y-6 border-t border-zinc-800 p-3 sm:p-4">
              {pool.armorGroups.map((group) => {
                const previewFile =
                  group.previewFile ??
                  resolveArmorSetPreviewFile(group.setName);
                return (
                  <div key={group.setName} className="min-w-0 space-y-3">
                    <h4 className="text-sm font-medium text-zinc-300">
                      {group.setName}
                    </h4>
                    <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                      <div className="min-w-0 space-y-1">
                        <ActivityArmorSetPreview
                          imageFile={previewFile}
                          imageUrl={armorSetPreviewUrl(previewFile)}
                          label={`${group.setName} armor set`}
                          missingImageVariant="contribute"
                          contributionLink={{
                            href: X_PROFILE_URL,
                            handle: X_PROFILE_HANDLE,
                          }}
                        />
                      </div>
                      <div className="min-w-0 space-y-4">
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
                    </div>
                  </div>
                );
              })}

              {pool.weapons.length > 0 ? (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-zinc-300">
                    Weapons
                  </h4>
                  <LootItemGrid
                    items={pool.weapons}
                    ownedItemHashes={ownedItemHashes}
                    showOwnership={showOwnership}
                    itemHrefs={itemHrefs}
                  />
                </div>
              ) : null}

              {pool.otherSections.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-3 text-sm font-medium text-zinc-300">
                    {section.title}
                  </h4>
                  <LootItemGrid
                    items={section.items}
                    ownedItemHashes={ownedItemHashes}
                    showOwnership={showOwnership}
                    itemHrefs={itemHrefs}
                  />
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
