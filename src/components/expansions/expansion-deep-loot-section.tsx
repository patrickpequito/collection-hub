"use client";

import { SectionHeading } from "@/components/detail-page-parts";
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
      <section className="min-w-0">
        <SectionHeading title="Deep loot" />
        <div className="border border-hairline bg-panel/85 p-3 sm:p-4">
        <p className="text-sm text-zinc-400">{emptyDescription}</p>
        </div>
      </section>
    );
  }

  const isOwned = (itemHash: string) => ownedItemHashes.has(itemHash);

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <SectionHeading title="Deep loot" />
        <p className="text-sm text-zinc-400">
          Loot this expansion added to playlist activities and world drops.
          Each pool collapses on its own.
        </p>
      </div>

      <div className="grid items-start gap-3 md:grid-cols-2">
        {pools.map((pool) => (
          <details
            key={pool.id}
            open
            className={`group min-w-0 overflow-hidden border border-hairline bg-panel/85 ${
              pool.armorGroups.length > 0 ? "md:col-span-2" : ""
            }`}
          >
            <summary className="cursor-pointer list-none px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">
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
            <div className="space-y-5 border-t border-zinc-800 p-3 sm:p-4">
              {pool.armorGroups.map((group) => {
                const previewFile =
                  group.previewFile ??
                  resolveArmorSetPreviewFile(group.setName);
                return (
                  <div key={group.setName} className="min-w-0 space-y-3">
                    <h4 className="ui-label">{group.setName}</h4>
                    {/* Same armor set layout as activity pages: preview as tall as the rows, uncropped. */}
                    <div className="grid min-w-0 gap-5 lg:grid-cols-[20.25rem_minmax(0,1fr)]">
                      <div className="min-w-0 lg:order-2 lg:h-full">
                        <ActivityArmorSetPreview
                          fill
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
                      <div className="min-w-0 space-y-4 lg:order-1">
                        {group.rows.map((row) => (
                          <div
                            key={`${group.setName}-${row.guardianClass}`}
                            className="space-y-1"
                          >
                            <p className="text-xs text-zinc-500">
                              {CLASS_LABELS[row.guardianClass]}
                            </p>
                            <div className="grid grid-cols-[repeat(5,minmax(0,3.75rem))] gap-1.5">
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
                                      classOrWeaponType={CLASS_LABELS[row.guardianClass]}
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
                  <h4 className="ui-label mb-2.5">Weapons</h4>
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
                  <h4 className="ui-label mb-2.5">{section.title}</h4>
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
