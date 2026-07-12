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
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
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
  "min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4";

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
};

type ActivityCosmeticLootPanelProps = ActivityLootPanelBaseProps & {
  sections: ActivityHubLootSection[];
};

type ActivityWeaponsLootPanelProps = ActivityLootPanelBaseProps & {
  weapons: LootItem[];
  heading?: string;
};

function ActivityArmorGrid({
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
  const isOwned = (itemHash: string) =>
    resolveItemOwned?.(itemHash) ?? ownedItemHashes.has(itemHash);

  return (
    <div className="space-y-4">
      {armorRows.map((row) => (
        <div
          key={`${row.setName}-${row.guardianClass}`}
          className="space-y-1"
        >
          <p className="text-xs text-zinc-500">
            {CLASS_LABELS[row.guardianClass]} — {row.setName}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
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
                    href={itemHrefs?.[piece.itemHash]}
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

export function ActivityCurrentLootPanel({
  activitySlug,
  activityTitle,
  armorRows,
  previewFiles,
  weapons,
  weaponPools,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: ActivityCurrentLootPanelProps) {
  const resolvedPreviewFiles = resolveArmorSetPreviewFiles(
    activitySlug,
    previewFiles,
  );
  const defaultWeaponPoolId =
    weaponPools?.find((pool) => pool.isActive)?.id ?? weaponPools?.[0]?.id ?? "";
  const ownedPoolItemHashes = weaponPools
    ? collectOwnedItemHashes(
        weaponPools.flatMap((pool) => pool.items),
        ownedItemHashes,
        resolveItemOwned,
      )
    : [];

  return (
    <section className={LOOT_PANEL_CLASS}>
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-3">
          {resolvedPreviewFiles.map((imageFile) => (
            <ActivityArmorSetPreview
              key={imageFile}
              imageFile={imageFile}
              imageUrl={activityArmorSetPreviewUrl(imageFile)}
              label={`${activityTitle} armor set`}
            />
          ))}
        </div>

        <div className="min-w-0 space-y-6">
          {armorRows.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-300">Armor</h3>
              <ActivityArmorGrid
                armorRows={armorRows}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                resolveItemOwned={resolveItemOwned}
                itemHrefs={itemHrefs}
              />
            </div>
          ) : null}

          {weaponPools && weaponPools.length > 0 ? (
            <ActivityWeaponPoolSection
              pools={weaponPools}
              defaultPoolId={defaultWeaponPoolId}
              ownedPoolItemHashes={ownedPoolItemHashes}
              showOwnership={showOwnership}
              itemHrefs={itemHrefs}
              inactivePoolMessage={`Not in rotation this ${activityTitle}.`}
            />
          ) : weapons && weapons.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-300">Weapons</h3>
              <LootItemGrid
                items={weapons}
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                resolveItemOwned={resolveItemOwned}
                itemHrefs={itemHrefs}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ActivityCosmeticLootPanel({
  sections,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
}: ActivityCosmeticLootPanelProps) {
  if (sections.length === 0) return null;

  return (
    <section className={LOOT_PANEL_CLASS}>
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
