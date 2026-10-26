"use client";

import { ArmorSetBlock } from "@/components/activity-current-loot-panel";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import { useOwnership } from "@/components/client-ownership";
import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { LootItemGrid } from "@/components/loot-section";
import { ARMOR_SLOTS, CLASS_LABELS, GUARDIAN_CLASSES, SLOT_LABELS } from "@/lib/armor-sets/constants";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";

type OrnamentSet = { name: string; triumph: string; rows: ActivityArmorRow[] };

const BLOCK_CLASS = "min-w-0 space-y-3 overflow-hidden border border-hairline bg-panel/85 p-3 sm:p-4";

const piecesOf = (rows: ActivityArmorRow[]) =>
  rows.flatMap((row) => Object.values(row.pieces).filter((piece): piece is LootItem => Boolean(piece)));


/**
 * SRL current loot: Circuit with its classic SRL ornament sets in one block (the promo
 * art shows them together), Back on the Grid as its own set, then the weapons.
 */
export function SrlCurrentLoot({
  circuitRows,
  circuitPreview,
  ornamentSets,
  gridSet,
  gridPreview,
  weapons,
  itemHrefs,
}: {
  circuitRows: ActivityArmorRow[];
  circuitPreview: string;
  ornamentSets: OrnamentSet[];
  gridSet: OrnamentSet | null;
  gridPreview: string;
  weapons: LootItem[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();

  const owns = (piece: LootItem) =>
    (piece.ownershipHashes?.length ? piece.ownershipHashes : [piece.itemHash]).some((hash) => ownedItemHashes.has(hash));
  const countNote = (items: LootItem[]) =>
    showOwnership ? `${items.filter(owns).length} / ${items.length}` : items.length;

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Current loot" />

      <ArmorSetBlock
        setName="Circuit"
        rows={circuitRows}
        previewFiles={[circuitPreview]}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        itemHrefs={itemHrefs}
      >
        {ornamentSets.length ? (
          // Full width under the set and its preview: all three classes side by side.
          <div className="border-t border-white/[0.1] pt-3">
            <div className="grid min-w-0 items-end gap-x-6 gap-y-2 lg:grid-cols-[minmax(0,12rem)_repeat(3,max-content)_minmax(0,1fr)]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 lg:flex-col">
                <h4 className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-bone">Ornaments</h4>
                <span className="ui-label whitespace-nowrap text-[11px]!">Unlocked by SRL triumphs</span>
              </div>
              {GUARDIAN_CLASSES.map((guardianClass) => (
                <span key={guardianClass} className="hidden w-[202px] items-center gap-1.5 text-xs text-ash lg:flex">
                  <GuardianClassIcon guardianClass={guardianClass} size="xs" />
                  {CLASS_LABELS[guardianClass]}
                </span>
              ))}
              <span className="hidden lg:block" />
            </div>
            <ul className="mt-1">
              {ornamentSets.map((set) => {
                const pieces = piecesOf(set.rows);
                return (
                  <li
                    key={set.name}
                    className="grid min-w-0 items-center gap-x-6 gap-y-2 border-b border-white/[0.07] py-2.5 last:border-0 lg:grid-cols-[minmax(0,12rem)_repeat(3,max-content)_minmax(0,1fr)]"
                  >
                    <div className="flex min-w-0 items-baseline justify-between gap-3 lg:block">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-bone">{set.name}</p>
                        <p className="text-xs text-ash">Triumph · {set.triumph}</p>
                      </div>
                      <span className="text-xs tabular-nums text-ash lg:hidden">{countNote(pieces)}</span>
                    </div>
                    {GUARDIAN_CLASSES.map((guardianClass) => {
                      const row = set.rows.find((entry) => entry.guardianClass === guardianClass);
                      return (
                        <div key={guardianClass} className="flex items-center gap-1.5 lg:w-[202px]">
                          <span className="w-14 text-xs text-ash lg:hidden">{CLASS_LABELS[guardianClass]}</span>
                          {ARMOR_SLOTS.map((slot) => {
                            const piece = row?.pieces[slot];
                            if (!piece) return null;
                            return (
                              <div key={slot} className="w-[46px]">
                                <ArmorPieceIcon
                                  piece={piece}
                                  slotLabel={SLOT_LABELS[slot]}
                                  sourceLabel={piece.source}
                                  owned={owns(piece)}
                                  showOwnership={showOwnership}
                                  fluid
                                  href={itemHrefs?.[piece.itemHash]}
                                  ornamentOverlay
                                  classOrWeaponType={CLASS_LABELS[guardianClass]}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    <span className="hidden text-right text-xs tabular-nums text-ash lg:block">{countNote(pieces)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </ArmorSetBlock>

      {gridSet ? (
        <ArmorSetBlock
          setName={gridSet.name}
          title={`Ornaments · ${gridSet.name}`}
          note={`Triumph · ${gridSet.triumph}`}
          rows={gridSet.rows}
          previewFiles={[gridPreview]}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          itemHrefs={itemHrefs}
        />
      ) : null}

      {weapons.length ? (
        <div className={BLOCK_CLASS}>
          <BoxHeading title="Weapons" note={countNote(weapons)} />
          <LootItemGrid
            items={weapons}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            itemHrefs={itemHrefs}
          />
        </div>
      ) : null}
    </section>
  );
}
