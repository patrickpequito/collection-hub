"use client";

import { useMemo, useState } from "react";
import { ArmorDetailMeta } from "@/components/armor-detail-meta";
import { ArmorArchetypeIcon } from "@/components/armor-archetype-icon";
import { ExoticPerkPanel } from "@/components/exotic-perk-panel";
import { ArmorRollsPanel } from "@/components/armor-rolls-panel";
import { ArmorSetBonusesPanel } from "@/components/armor-set-bonuses-panel";
import { ArmorSetPiecesPanel } from "@/components/armor-set-pieces-panel";
import { ArmorSetPreviewPanel } from "@/components/armor-set-preview-panel";
import { ArmorStatsPanel } from "@/components/armor-stats-panel";
import { ExpandableImage, DETAIL_PREVIEW_FRAME_CLASS } from "@/components/expandable-image";
import { ObtainableIcon } from "@/components/obtainable-icon";
import { WeaponSeasonBadges } from "@/components/weapon-season-badges";
import { resolveSeasonBadges } from "@/lib/all-loot/season-badges";
import { ARMOR_STAT_ORDER } from "@/lib/armor/constants";
import { resolveIsArmor30ForHash } from "@/lib/armor/base-stats";
import { resolveExoticArmorPerkForHash } from "@/lib/armor/exotic-perk";
import { resolveArmorStatsForItemHash } from "@/lib/armor/stats";
import {
  resolveArmorScreenshotForHash,
  resolveArmorVersionForHash,
  resolveSeasonKeyFromVersion,
} from "@/lib/armor/version-for-hash";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useSignedIn } from "@/lib/use-signed-in";
import { useArmorRolls } from "@/lib/use-armor-rolls";
import type { AllLootItem } from "@/types/all-loot";
import type { ArmorSetBonus } from "@/types/armor-set-bonuses";
import type { ArmorSet, GuardianClass } from "@/types/armor-set";

type ArmorDetailContentProps = {
  armor: AllLootItem;
  setName: string;
  twoPieceBonus: ArmorSetBonus | null;
  fourPieceBonus: ArmorSetBonus | null;
  armorSet?: ArmorSet | null;
  primaryGuardianClass?: GuardianClass | null;
  itemHrefs?: Record<string, string>;
  /** @deprecated Prefer client-side useSignedIn; optional override. */
  isSignedIn?: boolean;
};

function ArmorPreviewUnavailable() {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40">
      <div className={`${DETAIL_PREVIEW_FRAME_CLASS} text-sm text-zinc-500`}>
        No preview image available.
      </div>
    </div>
  );
}

function ArmorPreview({
  armor,
  itemHash,
}: {
  armor: AllLootItem;
  itemHash: string;
}) {
  const [screenshotFailed, setScreenshotFailed] = useState(false);
  const screenshotPath = resolveArmorScreenshotForHash(armor, itemHash);

  if (screenshotPath && !screenshotFailed) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
        <ExpandableImage
          key={screenshotPath}
          src={bungieIconUrl(screenshotPath)}
          alt={armor.name}
          expandLabel={`Expand ${armor.name} preview`}
          onError={() => setScreenshotFailed(true)}
        />
      </div>
    );
  }

  return <ArmorPreviewUnavailable />;
}

export function ArmorDetailContent({
  armor,
  setName,
  twoPieceBonus,
  fourPieceBonus,
  armorSet = null,
  primaryGuardianClass = null,
  itemHrefs,
  isSignedIn: isSignedInProp,
}: ArmorDetailContentProps) {
  const signedInHook = useSignedIn();
  const isSignedIn = isSignedInProp ?? signedInHook;
  const seasonBadges = resolveSeasonBadges(armor);
  const armorSlug = armor.slug ?? "";
  const [selectedVersionHash, setSelectedVersionHash] = useState(armor.itemHash);
  const selectedSeasonKey = useMemo(() => {
    const version = resolveArmorVersionForHash(armor, selectedVersionHash);
    return resolveSeasonKeyFromVersion(version);
  }, [armor, selectedVersionHash]);
  const catalogStats = useMemo(
    () => resolveArmorStatsForItemHash(armor, selectedVersionHash),
    [armor, selectedVersionHash],
  );
  const showArmor30SetBonuses = useMemo(
    () => resolveIsArmor30ForHash(armor, selectedVersionHash),
    [armor, selectedVersionHash],
  );
  const exoticPerk = useMemo(
    () =>
      armor.rarity === "Exotic"
        ? resolveExoticArmorPerkForHash(armor, selectedVersionHash)
        : null,
    [armor, selectedVersionHash],
  );
  const [showRolls, setShowRolls] = useState(false);
  const [hoveredRollId, setHoveredRollId] = useState<string | null>(null);
  const [pinnedRollId, setPinnedRollId] = useState<string | null>(null);

  const { rolls, characters, loading, error, refetch } = useArmorRolls(
    armorSlug,
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

  const displayStats = activeRoll?.stats ?? catalogStats;
  const highlightedStatNames = useMemo(() => {
    if (!activeRoll) return undefined;
    return new Set<string>(ARMOR_STAT_ORDER);
  }, [activeRoll]);

  const archetypeLabel = activeRoll?.archetype ?? "";
  const archetypeIconPath = activeRoll?.archetypeIconPath ?? null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <h1 className="min-w-0 text-3xl font-semibold leading-none text-zinc-100 sm:text-4xl">
          {armor.name}
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
          <ArmorDetailMeta armor={armor} />

          <div className="space-y-2">
            {armor.description ? (
              <p className="text-sm italic leading-relaxed text-zinc-400">
                {armor.description}
              </p>
            ) : null}

            <div
              className={`flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1 ${
                armor.obtainable
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <span
                className={`text-xs ${armor.obtainable ? "text-emerald-200/90" : "text-zinc-400"}`}
              >
                {armor.obtainable ? "Obtainable" : "Not obtainable"}
              </span>
              <ObtainableIcon obtainable={armor.obtainable} size="compact" />
            </div>

            {armor.source ? (
              <p className="text-sm leading-relaxed text-zinc-300">
                {armor.source}
              </p>
            ) : null}
          </div>

          <div className="lg:hidden">
            <ArmorPreview armor={armor} itemHash={selectedVersionHash} />
          </div>

          <ArmorStatsPanel
            stats={displayStats}
            highlightedStatNames={highlightedStatNames}
          />

          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">
              Archetype
            </p>
            <div className="mt-1">
              <ArmorArchetypeIcon
                name={archetypeLabel || null}
                iconPath={archetypeIconPath}
                variant="detail"
              />
            </div>
          </div>

          {armorSlug ? (
            <ArmorRollsPanel
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
              showVersionLabels={(armor.versions?.length ?? 0) > 1}
            />
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="hidden lg:block">
            <ArmorPreview armor={armor} itemHash={selectedVersionHash} />
          </div>

          {armor.rarity === "Exotic" ? (
            <ExoticPerkPanel
              perk={exoticPerk}
              unavailableMessage="Exotic perk data is not available for this armor piece yet."
            />
          ) : (
            <div className="space-y-6">
              {showArmor30SetBonuses ? (
                <ArmorSetBonusesPanel
                  setName={setName}
                  twoPiece={twoPieceBonus}
                  fourPiece={fourPieceBonus}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-500">
                  Set bonuses apply to Armor 3.0 versions only (The Edge of Fate,
                  Renegades, Monument of Triumph).
                </div>
              )}

              {armorSet ? (
                <>
                  <ArmorSetPiecesPanel
                    set={armorSet}
                    primaryClass={primaryGuardianClass}
                    selectedSeasonKey={selectedSeasonKey}
                    isSignedIn={isSignedIn}
                    itemHrefs={itemHrefs}
                  />
                  <ArmorSetPreviewPanel
                    setName={armorSet.name}
                    source={armorSet.source}
                  />
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
