import type { ReactNode } from "react";
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
import { ActivityWeaponPoolSection } from "@/components/activity-weapon-pool-section";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";
import { RotatingWeaponPools } from "@/components/rotating-weapon-pools";
import type { PoolOccurrence } from "@/lib/activities/pool-rotation";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
import { LootItemGrid } from "@/components/loot-section";
import type {
  ActivityHubLootSection,
  ActivityWeaponPool,
} from "@/types/activity-hub";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";

function collectOwnedItemHashes(
  items: LootItem[],
  ownedItemHashes: Set<string>,
  resolveItemOwned?: (itemHash: string) => boolean,
): string[] {
  return items
    .filter(
      (item) =>
        resolveItemOwned?.(item.itemHash) ??
        ownedItemHashes.has(item.itemHash),
    )
    .map((item) => item.itemHash);
}

const LOOT_PANEL_CLASS =
  "min-w-0 overflow-hidden border border-hairline bg-panel/85 p-3 sm:p-4";

export const ACTIVITY_LOOT_PANEL_CLASS = LOOT_PANEL_CLASS;

type ActivityLootPanelBaseProps = {
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
};
type ActivityCurrentLootPanelProps = ActivityLootPanelBaseProps & {
  activitySlug: string;
  activityTitle: string;
  armorRows: ActivityArmorRow[];
  previewFiles?: string[];
  weapons?: LootItem[];
  weaponPools?: ActivityWeaponPool[];
  /** Schedule for weaponPools: every pool shown at once, ranked by when it comes up. */
  poolOccurrences?: PoolOccurrence[];
  /** Server time for the first render of the pool ranking. */
  poolsNowMs?: number;
  /** Small note next to each armor set name (e.g. the playlists it drops in). */
  armorNote?: string;
  /** Extra labelled weapon groups inside the Weapons block (e.g. Arena Ops reissues). */
  weaponSubgroups?: { title: string; items: LootItem[] }[];
  /** Section title row (playlist pages); omitted inside other panels. */
  heading?: string;
  headingNote?: string;
};

type ActivityCosmeticLootPanelProps = ActivityLootPanelBaseProps & {
  sections: ActivityHubLootSection[];
  /** Optional heading row (e.g. legacy toggle) rendered above the sections. */
  toolbar?: ReactNode;
  /** Section title; the panel then shows owned / total and two-column boxes. */
  heading?: string;
};

/** Section heading above a loot panel (title left, small note right). */
export function PanelHeading({ title, note }: { title: string; note?: ReactNode }) {
  return <SectionHeading title={title} note={note} />;
}

function ownsLoot(
  item: LootItem,
  ownedItemHashes: Set<string>,
  resolveItemOwned?: (itemHash: string) => boolean,
): boolean {
  if (resolveItemOwned) return resolveItemOwned(item.itemHash);
  const hashes = item.ownershipHashes?.length ? item.ownershipHashes : [item.itemHash];
  return hashes.some((hash) => ownedItemHashes.has(hash));
}

type ActivityWeaponsLootPanelProps = ActivityLootPanelBaseProps & {
  weapons: LootItem[];
  heading?: string;
};

export function ActivityArmorGrid({
  armorRows,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: Pick<
  ActivityCurrentLootPanelProps,
  | "armorRows"
  | "ownedItemHashes"
  | "showOwnership"
  | "resolveItemOwned"
  | "itemHrefs"
>) {
  const isOwned = (itemHash: string) => {
    if (resolveItemOwned) return resolveItemOwned(itemHash);
    for (const row of armorRows) {
      for (const piece of Object.values(row.pieces)) {
        if (!piece || piece.itemHash !== itemHash) continue;
        const hashes = piece.ownershipHashes?.length
          ? piece.ownershipHashes
          : [itemHash];
        return hashes.some((hash) => ownedItemHashes.has(hash));
      }
    }
    return ownedItemHashes.has(itemHash);
  };
  // One set with a different name per class (raids): name it next to the class.
  const mixedSetNames = new Set(armorRows.map((row) => row.setName)).size > 1;

  return (
    <div className="space-y-4">
      {armorRows.map((row) => (
        <div
          key={`${row.setName}-${row.guardianClass}`}
          className="space-y-1"
        >
          <p className="text-xs text-zinc-500">
            {CLASS_LABELS[row.guardianClass]}
            {mixedSetNames ? ` · ${row.setName}` : null}
          </p>
          {/* Phones: five equal columns spanning the block, so rows line up with the preview below. */}
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-[repeat(5,minmax(0,3.75rem))]">
            {ARMOR_SLOTS.map((slot, slotIndex) => {
              const piece = row.pieces[slot];
              if (!piece) {
                return (
                  <div
                    key={`${row.setName}-${row.guardianClass}-${slot}`}
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
                  key={`${row.setName}-${row.guardianClass}-${slot}`}
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
                    fillCell
                    href={itemHrefs?.[piece.itemHash]}
                    ornamentOverlay={piece.itemType === "Ornament"}
                    classOrWeaponType={CLASS_LABELS[row.guardianClass]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Left column as wide as the five-piece grid, or the title if it is longer. */
const ARMOR_GRID_WIDTH = "lg:grid-cols-[max-content_minmax(0,1fr)]";

/**
 * One armor set, the same everywhere (raids, dungeons, playlists, Monument): "Armor · Set"
 * title (plus an optional small source note) over the class rows, and the preview on the
 * right, as tall as the title and rows, uncropped and right-aligned.
 */
export function ArmorSetBlock({
  setName,
  title,
  note,
  rows,
  previewFiles = [],
  missingImageVariant = "file-hint",
  bare = false,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
  children,
}: ActivityLootPanelBaseProps & {
  setName: string;
  /** Replaces "Armor · Set" (e.g. "Ornaments · Back on the Grid"). */
  title?: string;
  note?: string;
  rows: ActivityArmorRow[];
  previewFiles?: string[];
  /** Missing preview: show the expected file name, or ask players to share art on X. */
  missingImageVariant?: "file-hint" | "contribute";
  /** Inside another frame (legacy set rows): no border, no title. */
  bare?: boolean;
  /** Extra content under the set and its preview (e.g. SRL ornaments). */
  children?: ReactNode;
}) {
  const preview = previewFiles[0];
  return (
    <div className={`${bare ? "p-3 sm:p-4" : LOOT_PANEL_CLASS} space-y-4`}>
      <div className={`grid min-w-0 gap-5 ${preview ? ARMOR_GRID_WIDTH : ""}`}>
        <div className="min-w-0 space-y-3">
          <div className={bare ? "hidden" : "space-y-1"}>
            <h3 className="max-w-[28rem] font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">
              {title ?? `Armor · ${setName}`}
            </h3>
            {/* Source note on its own line under the title (e.g. the playlists it drops in). */}
            {note ? <p className="ui-label whitespace-nowrap text-[11px]!">{note}</p> : null}
          </div>
          <ActivityArmorGrid
            armorRows={rows}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            resolveItemOwned={resolveItemOwned}
            itemHrefs={itemHrefs}
          />
        </div>
        {preview ? (
          <div className="min-w-0 lg:h-full">
            <ActivityArmorSetPreview
              imageFile={preview}
              imageUrl={activityArmorSetPreviewUrl(preview)}
              label={`${setName} armor set`}
              missingImageVariant={missingImageVariant}
              contributionLink={{ href: X_PROFILE_URL, handle: X_PROFILE_HANDLE }}
              fill
            />
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Loot as separate blocks: one "Armor · Set" block per set (15 pieces + preview),
 * then a "Weapons" block. Pages stack several of these under one section title.
 */
export function ActivityCurrentLootPanel({
  activitySlug,
  activityTitle,
  armorRows,
  previewFiles,
  weapons,
  weaponPools,
  weaponSubgroups,
  poolOccurrences,
  poolsNowMs,
  armorNote,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
  heading,
  headingNote,
}: ActivityCurrentLootPanelProps) {
  const resolvedPreviewFiles = resolveArmorSetPreviewFiles(
    activitySlug,
    previewFiles,
  );
  const defaultWeaponPoolId =
    weaponPools?.find((pool) => pool.isActive)?.id ?? weaponPools?.[0]?.id ?? "";
  const poolItems = weaponPools
    ? [...new Map(weaponPools.flatMap((pool) => pool.items).map((item) => [item.itemHash, item])).values()]
    : [];
  const ownedPoolItemHashes = weaponPools
    ? collectOwnedItemHashes(poolItems, ownedItemHashes, resolveItemOwned)
    : [];

  const countNote = (items: LootItem[]) =>
    showOwnership
      ? `${items.filter((item) => ownsLoot(item, ownedItemHashes, resolveItemOwned)).length} / ${items.length}`
      : items.length;

  // One armor block per set; previews pair with sets when the counts match.
  const sets = [...new Set(armorRows.map((row) => row.setName))].map((setName) => ({
    setName,
    rows: armorRows.filter((row) => row.setName === setName),
  }));
  const previewsFor = (index: number) =>
    resolvedPreviewFiles.length === sets.length
      ? [resolvedPreviewFiles[index]]
      : index === 0
        ? resolvedPreviewFiles
        : [];

  const weaponItems = weaponPools?.length ? poolItems : (weapons ?? []);
  const subgroups = (weaponSubgroups ?? []).filter((group) => group.items.length > 0);
  const allWeapons = [...weaponItems, ...subgroups.flatMap((group) => group.items)];

  return (
    <section className="min-w-0 space-y-3">
      {heading ? <SectionHeading title={heading} note={headingNote} /> : null}

      {sets.map((set, index) => (
        <ArmorSetBlock
          key={set.setName}
          setName={set.setName}
          note={armorNote}
          rows={set.rows}
          previewFiles={previewsFor(index)}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          resolveItemOwned={resolveItemOwned}
          itemHrefs={itemHrefs}
        />
      ))}

      {allWeapons.length ? (
        <div className={`${LOOT_PANEL_CLASS} space-y-3`}>
          <BoxHeading title="Weapons" note={countNote(allWeapons)} />
          {weaponPools?.length && poolOccurrences ? (
            <RotatingWeaponPools
              pools={weaponPools}
              occurrences={poolOccurrences}
              initialNowMs={poolsNowMs ?? 0}
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
              resolveItemOwned={resolveItemOwned}
              itemHrefs={itemHrefs}
            />
          ) : weaponPools?.length ? (
            <ActivityWeaponPoolSection
              pools={weaponPools}
              defaultPoolId={defaultWeaponPoolId}
              ownedPoolItemHashes={ownedPoolItemHashes}
              showOwnership={showOwnership}
              itemHrefs={itemHrefs}
              inactivePoolMessage={`Not in rotation this ${activityTitle}.`}
              heading={null}
            />
          ) : (
            <LootItemGrid
              items={weaponItems}
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
              resolveItemOwned={resolveItemOwned}
              itemHrefs={itemHrefs}
            />
          )}
          {subgroups.map((group) => (
            <div key={group.title} className="space-y-2 border-t border-white/[0.08] pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="ui-label text-[11px]!">{group.title}</span>
                <span className="ui-label text-[11px]!">{countNote(group.items)}</span>
              </div>
              <LootItemGrid
                items={group.items}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                resolveItemOwned={resolveItemOwned}
                itemHrefs={itemHrefs}
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ActivityCosmeticLootPanel({
  sections,
  toolbar,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
  heading,
}: ActivityCosmeticLootPanelProps) {
  if (sections.length === 0) return null;

  const countOwned = (items: LootItem[]) =>
    items.filter((item) => ownsLoot(item, ownedItemHashes, resolveItemOwned)).length;
  const allItems = sections.flatMap((section) => section.items);

  if (heading) {
    return (
      <section className="min-w-0 space-y-3">
        {/* Toolbar (e.g. Current / Include legacy) sits in the heading row, next to the count. */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.14] pb-2.5">
          <h2 className="min-w-0 text-2xl font-semibold uppercase tracking-[0.06em] text-bone">{heading}</h2>
          <div className="flex items-center gap-4">
            <span className="ui-label shrink-0">
              {showOwnership ? `${countOwned(allItems)} / ${allItems.length} owned` : `${allItems.length} items`}
            </span>
            {toolbar}
          </div>
        </div>
        <div className="grid items-start gap-3 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className={`${LOOT_PANEL_CLASS} space-y-3`}>
              <BoxHeading
                title={section.title}
                note={showOwnership ? `${countOwned(section.items)} / ${section.items.length}` : section.items.length}
              />
              <LootItemGrid
                items={section.items}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                resolveItemOwned={resolveItemOwned}
                itemHrefs={itemHrefs}
                fill
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={LOOT_PANEL_CLASS}>
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-3 text-sm font-medium text-zinc-300">
              {section.title}
            </h3>
            <LootItemGrid
              items={section.items}
              ownedItemHashes={ownedItemHashes}
              showOwnership={showOwnership}
              resolveItemOwned={resolveItemOwned}
              itemHrefs={itemHrefs}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ActivityWeaponsLootPanel({
  weapons,
  heading = "Weapons",
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: ActivityWeaponsLootPanelProps) {
  if (weapons.length === 0) return null;

  return (
    <section className={LOOT_PANEL_CLASS}>
      <h3 className="mb-3 text-sm font-medium text-zinc-300">{heading}</h3>
      <LootItemGrid
        items={weapons}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        resolveItemOwned={resolveItemOwned}
        itemHrefs={itemHrefs}
      />
    </section>
  );
}
