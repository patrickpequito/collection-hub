"use client";

import { useMemo, useState } from "react";
import { ExpandableImage, DETAIL_PREVIEW_FRAME_CLASS } from "@/components/expandable-image";
import { ExoticPerkPanel } from "@/components/exotic-perk-panel";
import { ObtainableIcon } from "@/components/obtainable-icon";
import { WeaponDetailMeta } from "@/components/weapon-detail-meta";
import { WeaponPerksSection } from "@/components/weapon-perks-section";
import { WeaponRollsPanel } from "@/components/weapon-rolls-panel";
import { WeaponSeasonBadges } from "@/components/weapon-season-badges";
import { WeaponStatsPanel } from "@/components/weapon-stats-panel";
import { resolveSeasonBadges } from "@/lib/all-loot/season-badges";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useWeaponRolls } from "@/lib/use-weapon-rolls";
import { rollHighlightedPerks } from "@/lib/weapons/god-roll-highlights";
import {
  resolveWeaponPerkColumnsForHash,
  resolveWeaponRawPerkColumnsForHash,
  resolveWeaponScreenshotForHash,
  resolveWeaponStatsForHash,
} from "@/lib/weapons/perks";
import { resolveExoticWeaponPerkForHash } from "@/lib/weapons/exotic-perk";
import type { AllLootItem, WeaponPlugDefinition } from "@/types/all-loot";
import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";

type WeaponDetailContentProps = {
  weapon: AllLootItem;
  plugIndex?: Record<string, WeaponPlugDefinition>;
  godRollsByHash?: Record<string, ResolvedWeaponGodRoll>;
  isSignedIn?: boolean;
};

function WeaponScreenshot({
  weapon,
  itemHash,
}: {
  weapon: AllLootItem;
  itemHash: string;
}) {
  const screenshotPath = resolveWeaponScreenshotForHash(weapon, itemHash);

  if (screenshotPath) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
        <ExpandableImage
          key={screenshotPath}
          src={bungieIconUrl(screenshotPath)}
          alt={weapon.name}
          expandLabel={`Expand ${weapon.name} preview`}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40">
      <div className={`${DETAIL_PREVIEW_FRAME_CLASS} text-sm text-zinc-500`}>
        No preview image available.
      </div>
    </div>
  );
}

export function WeaponDetailContent({
  weapon,
  plugIndex = {},
  godRollsByHash = {},
  isSignedIn = false,
}: WeaponDetailContentProps) {
  const seasonBadges = resolveSeasonBadges(weapon);
  const weaponSlug = weapon.slug ?? "";

  const [selectedVersionHash, setSelectedVersionHash] = useState(
    weapon.itemHash,
  );
  const [showRolls, setShowRolls] = useState(false);
  const [hoveredRollId, setHoveredRollId] = useState<string | null>(null);
  const [pinnedRollId, setPinnedRollId] = useState<string | null>(null);

  const { rolls, characters, loading, error, refetch } = useWeaponRolls(
    weaponSlug,
    isSignedIn && showRolls,
  );

  const activeRollId = pinnedRollId ?? hoveredRollId;

  const activeRoll = useMemo(
    () =>
      activeRollId
        ? rolls.find((entry) => entry.itemInstanceId === activeRollId) ?? null
        : null,
    [activeRollId, rolls],
  );

  const displayItemHash = activeRoll?.itemHash ?? selectedVersionHash;

  const perkColumns = useMemo(
    () => resolveWeaponPerkColumnsForHash(weapon, displayItemHash, plugIndex),
    [weapon, displayItemHash, plugIndex],
  );

  const rawPerkColumns = useMemo(
    () => resolveWeaponRawPerkColumnsForHash(weapon, displayItemHash),
    [weapon, displayItemHash],
  );

  const stats = useMemo(
    () => resolveWeaponStatsForHash(weapon, displayItemHash),
    [weapon, displayItemHash],
  );

  const exoticPerk = useMemo(
    () =>
      weapon.rarity === "Exotic"
        ? resolveExoticWeaponPerkForHash(weapon, displayItemHash)
        : null,
    [weapon, displayItemHash],
  );

  const godRoll = godRollsByHash[displayItemHash] ?? null;

  const rollHighlightPerks = useMemo(() => {
    if (!activeRoll) return new Set<string>();
    return rollHighlightedPerks(
      activeRoll.equippedPlugHashes,
      perkColumns,
      plugIndex,
      activeRoll.socketPlugHashesByIndex,
      rawPerkColumns,
    );
  }, [activeRoll, perkColumns, plugIndex, rawPerkColumns]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <h1 className="min-w-0 text-3xl font-semibold leading-none text-zinc-100 sm:text-4xl">
          {weapon.name}
        </h1>
        <WeaponSeasonBadges
          badges={seasonBadges}
          selectedKey={selectedVersionHash}
          onSelect={
            seasonBadges.length > 1 ? setSelectedVersionHash : undefined
          }
          className="ml-auto"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <WeaponDetailMeta weapon={weapon} />

          <div className="space-y-2">
            {weapon.description ? (
              <p className="text-sm italic leading-relaxed text-zinc-400">
                {weapon.description}
              </p>
            ) : null}

            <div
              className={`flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1 ${
                weapon.obtainable
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <span
                className={`text-xs ${weapon.obtainable ? "text-emerald-200/90" : "text-zinc-400"}`}
              >
                {weapon.obtainable ? "Obtainable" : "Not obtainable"}
              </span>
              <ObtainableIcon obtainable={weapon.obtainable} size="compact" />
            </div>

            {weapon.source ? (
              <p className="text-sm leading-relaxed text-zinc-300">
                {weapon.source}
              </p>
            ) : null}
          </div>

          <div className="lg:hidden">
            <WeaponScreenshot weapon={weapon} itemHash={displayItemHash} />
          </div>

          {stats?.length ? (
            <WeaponStatsPanel stats={stats} />
          ) : null}

          {weaponSlug ? (
            <WeaponRollsPanel
              rolls={rolls}
              characters={characters}
              loading={loading}
              error={error}
              showRolls={showRolls}
              signedIn={isSignedIn}
              onShowRollsChange={(next) => {
                setShowRolls(next);
                if (!next) {
                  setHoveredRollId(null);
                  setPinnedRollId(null);
                }
              }}
              activeRollId={activeRollId}
              pinnedRollId={pinnedRollId}
              onRollHover={setHoveredRollId}
              onRollPin={setPinnedRollId}
              onTransferComplete={(destination) =>
                refetch({
                  silent: true,
                  locationUpdate: pinnedRollId
                    ? { itemInstanceId: pinnedRollId, destination }
                    : undefined,
                })
              }
              plugIndex={plugIndex}
              godRollsByHash={godRollsByHash}
            />
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="hidden lg:block">
            <WeaponScreenshot weapon={weapon} itemHash={displayItemHash} />
          </div>

          {weapon.rarity === "Exotic" ? (
            <ExoticPerkPanel
              perk={exoticPerk}
              unavailableMessage="Exotic perk data is not available for this weapon yet."
            />
          ) : null}

          {perkColumns.length ? (
            <WeaponPerksSection
              key={displayItemHash}
              columns={perkColumns}
              godRoll={godRoll}
              plugIndex={plugIndex}
              rollHighlightPerks={rollHighlightPerks}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
