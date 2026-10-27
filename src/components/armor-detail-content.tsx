"use client";

import Link from "@/components/app-link";
import { useMemo, useState } from "react";
import { ArmorArchetypeIcon } from "@/components/armor-archetype-icon";
import { StatBlock, StatBlockGrid, StatCount, SectionJumpNav, SectionHeading } from "@/components/detail-page-parts";
import { ExoticPerkPanel } from "@/components/exotic-perk-panel";
import { ItemHeader, WhereToGetIt } from "@/components/item-detail-parts";
import { ROLL_TRANSFER_CELL_CLASS, RollLocationIcon, RollTransferButtons } from "@/components/roll-transfer-buttons";
import { WeaponRollIcon } from "@/components/weapon-roll-icon";
import { ArmorSetBonusesPanel } from "@/components/armor-set-bonuses-panel";
import { ArmorSetPiecesPanel } from "@/components/armor-set-pieces-panel";
import { ArmorSetPreviewPanel } from "@/components/armor-set-preview-panel";
import { ArmorStatsPanel } from "@/components/armor-stats-panel";
import { ExpandableImage, DETAIL_PREVIEW_FRAME_CLASS } from "@/components/expandable-image";
import { WeaponSeasonBadges } from "@/components/weapon-season-badges";
import { resolveSeasonBadges } from "@/lib/all-loot/season-badges";
import { ARMOR_STAT_ORDER } from "@/lib/armor/constants";
import { resolveIsArmor30ForHash, resolvePreferredArmorItemHash } from "@/lib/armor/base-stats";
import { resolveExoticArmorPerkForHash } from "@/lib/armor/exotic-perk";
import { resolveArmorStatsForItemHash } from "@/lib/armor/stats";
import {
  resolveArmorScreenshotForHash,
  resolveArmorVersionForHash,
  resolveSeasonKeyFromVersion,
} from "@/lib/armor/version-for-hash";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { armorSlotIconPath, armorSlotLabel } from "@/lib/armor-slot-icon";
import { isArmorPieceOwned } from "@/lib/armor/ownership";
import type { ItemOrigin } from "@/lib/items/origin";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import type { ArmorRollInstance } from "@/types/armor-rolls";
import type { ProfileCharacter, TransferDestinationId } from "@/types/destiny-characters";
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
  origin?: ItemOrigin | null;
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
      <div className="overflow-hidden border border-hairline bg-panel/85">
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


function summarizeLocations(rolls: ArmorRollInstance[]): string {
  const equipped = rolls.filter((roll) => roll.location === "equipped").length;
  const vault = rolls.filter((roll) => roll.location === "vault").length;
  const carried = rolls.length - equipped - vault;
  return [
    equipped ? `${equipped} equipped` : null,
    carried ? `${carried} on characters` : null,
    vault ? `${vault} in vault` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

const STAT_SHORT: Record<string, string> = {
  Health: "HP",
  Melee: "MEL",
  Grenade: "GRN",
  Super: "SUP",
  Class: "CLS",
  Weapons: "WPN",
};

/** All six stats as short labels; the three highest (Armor 3.0 primary / secondary / tertiary) stay bright. */
function CopyStats({ roll }: { roll: ArmorRollInstance }) {
  const byName = new Map(roll.stats.map((stat) => [stat.name, stat.value]));
  const top = topStatNames(roll);
  return (
    <span className="grid grid-cols-[repeat(6,2.125rem)] gap-1">
      {ARMOR_STAT_ORDER.map((name) => {
        const value = byName.get(name) ?? 0;
        return (
          <span key={name} title={`${name} ${value}`} className="flex flex-col items-center leading-tight">
            <span className="font-display text-[10px] tracking-[0.1em] text-ash">{STAT_SHORT[name]}</span>
            <span className={`text-[13px] tabular-nums ${top.has(name) ? "text-bone" : "text-bone/35"}`}>{value}</span>
          </span>
        );
      })}
    </span>
  );
}

/** Phones (open copy): the six stats in equal cells with a small bar; the top three stay bright. */
function CopyStatBars({ roll }: { roll: ArmorRollInstance }) {
  const byName = new Map(roll.stats.map((stat) => [stat.name, stat]));
  const top = topStatNames(roll);
  return (
    <span className="grid grid-cols-6 gap-1.5">
      {ARMOR_STAT_ORDER.map((name) => {
        const stat = byName.get(name);
        const value = stat?.value ?? 0;
        const bright = top.has(name);
        return (
          <span key={name} className="flex flex-col items-center gap-1">
            <span className="font-display text-[9.5px] tracking-[0.1em] text-ash">{STAT_SHORT[name]}</span>
            <span className={`text-[13px] tabular-nums ${bright ? "text-bone" : "text-bone/35"}`}>{value}</span>
            <span className="block h-[3px] w-full bg-white/10">
              <span
                className={`block h-full ${bright ? "bg-bone" : "bg-bone/35"}`}
                style={{ width: `${Math.min(100, (value / (stat?.max || 30)) * 100)}%` }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function topStatNames(roll: ArmorRollInstance): Set<string> {
  return new Set(
    [...roll.stats]
      .filter((stat) => stat.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((stat) => stat.name),
  );
}

function CopiesTable({
  rolls,
  characters,
  activeRollId,
  pinnedRollId,
  isExotic,
  onHover,
  onPin,
  onTransferComplete,
}: {
  rolls: ArmorRollInstance[];
  characters: ProfileCharacter[];
  activeRollId: string | null;
  pinnedRollId: string | null;
  isExotic: boolean;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
  onTransferComplete: (itemInstanceId: string, destination: TransferDestinationId) => void | Promise<void>;
}) {
  const sorted = [...rolls].sort((a, b) => b.totalStats - a.totalStats);
  const bestTotal = sorted[0]?.totalStats ?? 0;
  const showArchetype = rolls.some((roll) => roll.archetype);
  const columns = showArchetype
    ? "grid-cols-[3rem_minmax(0,1fr)_13.5rem_2.75rem]"
    : "grid-cols-[3rem_13.5rem_2.75rem]";
  const headers = ["", ...(showArchetype ? ["Archetype"] : []), "Stats", "Total"];
  return (
    // Phones: icon, archetype and total on one line, then stats and move buttons.
    <div className="ui-panel sm:overflow-x-auto">
      <div className="hidden min-w-[37rem] items-center gap-3 border-b border-white/[0.14] pb-2 pl-4 pr-4 pt-3 sm:flex">
        <div className={`grid flex-1 ${columns} gap-3`}>
          {headers.map((label, index) => (
            <span key={`${label}-${index}`} className="ui-label text-[11px]!">
              {label}
            </span>
          ))}
        </div>
        <span className={`ui-label text-[11px]! ${ROLL_TRANSFER_CELL_CLASS}`}>Location</span>
      </div>
      {sorted.map((roll) => {
        const active = activeRollId === roll.itemInstanceId;
        return (
          <div
            key={roll.itemInstanceId}
            onMouseEnter={() => onHover(roll.itemInstanceId)}
            onMouseLeave={() => onHover(null)}
            className={`border-b border-white/[0.08] transition last:border-0 ${
              active ? "bg-owned/10 shadow-[inset_3px_0_0_0_#c9a227]" : "hover:bg-white/[0.03]"
            }`}
          >
            <div className="sm:hidden">
              <button
                type="button"
                aria-expanded={pinnedRollId === roll.itemInstanceId}
                onClick={() => onPin(roll.itemInstanceId)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
              >
                <WeaponRollIcon version={roll.version} gearTier={isExotic ? null : roll.tier} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex min-w-0 items-center gap-1.5 text-sm text-bone">
                    {roll.archetype ? (
                      <ArmorArchetypeIcon name={roll.archetype} iconPath={roll.archetypeIconPath} variant="roll" />
                    ) : null}
                    <span className="truncate">{roll.archetype ?? "Armor"}</span>
                  </span>
                  <span className="truncate text-[11.5px] text-ash">
                    {ARMOR_STAT_ORDER.filter((name) => topStatNames(roll).has(name))
                      .map((name) => `${STAT_SHORT[name]} ${roll.stats.find((stat) => stat.name === name)?.value ?? 0}`)
                      .join(" · ")}
                  </span>
                </span>
                <span className={`font-display text-[17px] tabular-nums ${roll.totalStats === bestTotal ? "text-owned" : "text-bone"}`}>
                  {roll.totalStats}
                </span>
                <RollLocationIcon roll={roll} characters={characters} />
                <span
                  aria-hidden
                  className={`text-[11px] transition ${pinnedRollId === roll.itemInstanceId ? "rotate-90 text-bone" : "text-ash"}`}
                >
                  ▸
                </span>
              </button>
              {pinnedRollId === roll.itemInstanceId ? (
                <div className="space-y-2.5 px-3 pb-3">
                  <CopyStatBars roll={roll} />
                  <p className="ui-label text-[10px]!">Move to</p>
                  <RollTransferButtons roll={roll} characters={characters} onTransferComplete={onTransferComplete} labelled />
                </div>
              ) : null}
            </div>
            <div className="hidden min-w-[37rem] items-center gap-3 pr-4 sm:flex">
              <button
                type="button"
                aria-pressed={pinnedRollId === roll.itemInstanceId}
                onClick={() => onPin(roll.itemInstanceId)}
                className={`grid flex-1 ${columns} items-center gap-3 py-2.5 pl-4 text-left`}
              >
                <WeaponRollIcon version={roll.version} gearTier={isExotic ? null : roll.tier} />
                {showArchetype ? (
                  <span className="flex min-w-0 items-center gap-2 text-sm text-bone">
                    {roll.archetype ? (
                      <ArmorArchetypeIcon name={roll.archetype} iconPath={roll.archetypeIconPath} variant="roll" />
                    ) : null}
                    <span className="truncate">{roll.archetype ?? "—"}</span>
                  </span>
                ) : null}
                <CopyStats roll={roll} />
                <span
                  className={`text-[15px] tabular-nums ${roll.totalStats === bestTotal ? "text-owned" : "text-bone"}`}
                >
                  {roll.totalStats}
                </span>
              </button>
              <RollTransferButtons roll={roll} characters={characters} onTransferComplete={onTransferComplete} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ArmorDetailContent({
  armor,
  setName,
  twoPieceBonus,
  fourPieceBonus,
  armorSet = null,
  primaryGuardianClass = null,
  itemHrefs,
  origin = null,
  isSignedIn: isSignedInProp,
}: ArmorDetailContentProps) {
  const signedInHook = useSignedIn();
  const isSignedIn = isSignedInProp ?? signedInHook;
  const seasonBadges = resolveSeasonBadges(armor);
  const armorSlug = armor.slug ?? "";
  const [selectedVersionHash, setSelectedVersionHash] = useState(() =>
    resolvePreferredArmorItemHash(armor),
  );
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
  const { itemHashes: ownedHashList } = useOwnedItemHashes(isSignedIn);
  const ownedSet = useMemo(() => new Set(ownedHashList), [ownedHashList]);
  const [hoveredRollId, setHoveredRollId] = useState<string | null>(null);
  const [pinnedRollId, setPinnedRollId] = useState<string | null>(null);

  const { rolls, characters, loading, error, refetch } = useArmorRolls(
    armorSlug,
    isSignedIn,
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


  const ownedCopies = rolls.length;
  const bestRoll = rolls.reduce<(typeof rolls)[number] | null>(
    (best, roll) => (!best || roll.totalStats > best.totalStats ? roll : best),
    null,
  );
  const locationSummary = summarizeLocations(rolls);
  const classPieces = armorSet && primaryGuardianClass ? Object.values(armorSet.classes[primaryGuardianClass] ?? {}) : [];
  const classPiecesOwned = classPieces.filter((piece) => isArmorPieceOwned(piece, ownedSet)).length;
  const isExotic = armor.rarity === "Exotic";
  const sourceText = armor.source?.replace(/^source:\s*/i, "").replace(/"/g, "") ?? "";
  const typeIcon = armorSlotIconPath(armor.slot);
  const classLabel = armor.classOrWeaponType ?? "";

  const sectionLinks = [
    { id: "your-copies", label: "Your copies" },
    ...(isExotic ? [] : showArmor30SetBonuses ? [{ id: "set-bonuses", label: "Set bonuses" }] : []),
    ...(armorSet && !isExotic ? [{ id: "set-pieces", label: "Set pieces" }] : []),
    { id: "where", label: "Where to get it" },
  ];

  return (
    <div className="space-y-9">
      <ItemHeader
        name={armor.name}
        iconPath={armor.iconPath}
        rarity={armor.rarity}
        typeLine={(dark) => (
          <>
            {typeIcon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={typeIcon}
                alt=""
                aria-hidden
                className={`size-4 object-contain ${dark ? "brightness-0 opacity-70" : "opacity-80"}`}
              />
            ) : null}
            <span>
              {classLabel ? `${classLabel} · ` : ""}
              {armorSlotLabel(armor.slot) ?? "Armor"}
            </span>
          </>
        )}
        tags={[
          ...(showArmor30SetBonuses && !isExotic ? [{ label: "Armor 3.0", tone: "gold" as const }] : []),
          { label: armor.obtainable ? "Obtainable" : "Not obtainable", tone: armor.obtainable ? ("green" as const) : ("plain" as const) },
          { label: armor.rarity ?? "Armor" },
        ]}
        right={
          seasonBadges.length > 0 ? (
            <WeaponSeasonBadges
              badges={seasonBadges}
              selectedKey={selectedVersionHash}
              onSelect={seasonBadges.length > 1 ? setSelectedVersionHash : undefined}
            />
          ) : null
        }
      />

      <StatBlockGrid count={isExotic || !armorSet ? 3 : 4}>
        <StatBlock label="Your copies">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">
            {isSignedIn ? (loading ? "…" : ownedCopies) : "—"}
          </span>
          <span className="text-[13px] text-ash">
            {isSignedIn ? locationSummary || "None owned" : "Sign in to track"}
          </span>
        </StatBlock>
        <StatBlock label="Best copy">
          <span className={`font-display text-[22px] leading-none sm:text-[30px] ${bestRoll ? "text-owned" : "text-ash"}`}>
            {bestRoll ? bestRoll.totalStats : "—"}
          </span>
          <span className="text-[13px] text-ash">
            {bestRoll
              ? [!isExotic && bestRoll.tier ? `Tier ${bestRoll.tier}` : null, bestRoll.archetype].filter(Boolean).join(" · ") || "Total stats"
              : "Total stats of your best copy"}
          </span>
        </StatBlock>
        {armorSet && !isExotic && primaryGuardianClass ? (
          <StatBlock label={`Set progress · ${classLabel}`}>
            <StatCount owned={isSignedIn ? classPiecesOwned : null} total={classPieces.length} />
          </StatBlock>
        ) : null}
        <StatBlock label="Source">
          <span className="font-display text-xl leading-tight text-bone">
            {origin?.label ?? (armor.source?.replace(/^source:\s*/i, "") || "Unknown")}
          </span>
          {origin?.href ? (
            <Link href={origin.href} className="text-[13px] text-ash underline-offset-2 hover:text-bone hover:underline">
              Open {origin.kind.toLowerCase()} →
            </Link>
          ) : isExotic ? (
            <Link href="/exotics" className="text-[13px] text-ash underline-offset-2 hover:text-bone hover:underline">
              See all exotics →
            </Link>
          ) : null}
        </StatBlock>
      </StatBlockGrid>

      <SectionJumpNav links={sectionLinks} />

{isExotic ? (
        <>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <ArmorPreview armor={armor} itemHash={selectedVersionHash} />
        <div id="set-bonuses" className="min-w-0 scroll-mt-20 space-y-3">
          {isExotic ? (
            <ExoticPerkPanel
              perk={exoticPerk}
              unavailableMessage="Exotic perk data is not available for this armor piece yet."
            />
          ) : showArmor30SetBonuses ? (
            <ArmorSetBonusesPanel setName={setName} twoPiece={twoPieceBonus} fourPiece={fourPieceBonus} />
          ) : (
            <p className="border border-dashed border-white/[0.14] p-5 text-sm text-ash">
              Set bonuses apply to Armor 3.0 versions only (The Edge of Fate, Renegades, Monument of Triumph).
            </p>
          )}
          {armor.description ? (
            <p className="text-[13px] italic leading-relaxed text-ash">“{armor.description}”</p>
          ) : null}
        </div>
      </div>

      <section id="your-copies" className="min-w-0 scroll-mt-20 space-y-3">
        <SectionHeading title="Your copies" note={
            rolls.length > 1 ? (
              <>
                <span className="sm:hidden">Sorted by total</span>
                <span className="hidden sm:inline">Sorted by total · gold = best</span>
              </>
            ) : undefined
          } />
        {!isSignedIn ? (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            {showArmor30SetBonuses
              ? "In Armor 3.0 the archetype decides the primary and secondary stat, so every drop rolls differently. Sign in to compare your copies."
              : "Every drop rolls different stats. Sign in to compare your copies."}
          </p>
        ) : loading ? (
          <p className="text-sm text-ash">Loading your copies…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : rolls.length === 0 ? (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            You don&apos;t own a copy of this piece.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
            <CopiesTable
              rolls={rolls}
              characters={characters}
              activeRollId={activeRollId}
              pinnedRollId={pinnedRollId}
              isExotic={isExotic}
              onHover={setHoveredRollId}
              onPin={(id) => setPinnedRollId(pinnedRollId === id ? null : id)}
              onTransferComplete={(itemInstanceId, destination) =>
                refetch({ silent: true, locationUpdate: { itemInstanceId, destination } })
              }
            />
            <div className="ui-panel space-y-3 p-4">
              <span className="ui-label block">
                {activeRoll
                  ? `Selected · ${[!isExotic && activeRoll.tier ? `Tier ${activeRoll.tier}` : null, activeRoll.archetype].filter(Boolean).join(" ") || "copy"}`
                  : "Pick a copy to see its stats"}
              </span>
              {activeRoll ? (
                <ArmorStatsPanel stats={displayStats} highlightedStatNames={highlightedStatNames} />
              ) : null}
            </div>
          </div>
        )}
      </section>

        </>
      ) : (
        <>
      <section id="your-copies" className="min-w-0 scroll-mt-20 space-y-3">
        <SectionHeading title="Your copies" note={
            rolls.length > 1 ? (
              <>
                <span className="sm:hidden">Sorted by total</span>
                <span className="hidden sm:inline">Sorted by total · gold = best</span>
              </>
            ) : undefined
          } />
        {!isSignedIn ? (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            {showArmor30SetBonuses
              ? "In Armor 3.0 the archetype decides the primary and secondary stat, so every drop rolls differently. Sign in to compare your copies."
              : "Every drop rolls different stats. Sign in to compare your copies."}
          </p>
        ) : loading ? (
          <p className="text-sm text-ash">Loading your copies…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : rolls.length === 0 ? (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            You don&apos;t own a copy of this piece.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
            <CopiesTable
              rolls={rolls}
              characters={characters}
              activeRollId={activeRollId}
              pinnedRollId={pinnedRollId}
              isExotic={isExotic}
              onHover={setHoveredRollId}
              onPin={(id) => setPinnedRollId(pinnedRollId === id ? null : id)}
              onTransferComplete={(itemInstanceId, destination) =>
                refetch({ silent: true, locationUpdate: { itemInstanceId, destination } })
              }
            />
            <div className="ui-panel space-y-3 p-4">
              <span className="ui-label block">
                {activeRoll
                  ? `Selected · ${[!isExotic && activeRoll.tier ? `Tier ${activeRoll.tier}` : null, activeRoll.archetype].filter(Boolean).join(" ") || "copy"}`
                  : "Pick a copy to see its stats"}
              </span>
              {activeRoll ? (
                <ArmorStatsPanel stats={displayStats} highlightedStatNames={highlightedStatNames} />
              ) : null}
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <ArmorPreview armor={armor} itemHash={selectedVersionHash} />
        <div id="set-bonuses" className="min-w-0 scroll-mt-20 space-y-3">
          {isExotic ? (
            <ExoticPerkPanel
              perk={exoticPerk}
              unavailableMessage="Exotic perk data is not available for this armor piece yet."
            />
          ) : showArmor30SetBonuses ? (
            <ArmorSetBonusesPanel setName={setName} twoPiece={twoPieceBonus} fourPiece={fourPieceBonus} />
          ) : (
            <p className="border border-dashed border-white/[0.14] p-5 text-sm text-ash">
              Set bonuses apply to Armor 3.0 versions only (The Edge of Fate, Renegades, Monument of Triumph).
            </p>
          )}
          {armor.description ? (
            <p className="text-[13px] italic leading-relaxed text-ash">“{armor.description}”</p>
          ) : null}
        </div>
      </div>

        </>
      )}

      {armorSet && !isExotic ? (
        <section id="set-pieces" className="min-w-0 scroll-mt-20 space-y-4">
          <ArmorSetPiecesPanel
            set={armorSet}
            primaryClass={primaryGuardianClass}
            selectedSeasonKey={selectedSeasonKey}
            isSignedIn={isSignedIn}
            itemHrefs={itemHrefs}
            preview={<ArmorSetPreviewPanel setName={armorSet.name} source={armorSet.source} />}
          />
        </section>
      ) : null}

      <div id="where" className="scroll-mt-20">
        <WhereToGetIt
          rows={[
            {
              label: "Source",
              value: origin ? `${origin.label} · ${origin.kind}` : armor.source?.replace(/^source:\s*/i, "") || "Unknown",
              href: origin?.href,
            },
            ...(origin && sourceText && !sourceText.toLowerCase().includes(origin.label.toLowerCase())
              ? [{ label: "Details", value: sourceText }]
              : []),
            ...(isExotic ? [] : [{ label: "Obtainable", value: armor.obtainable ? "Yes" : "No" }]),
            ...(!isExotic && seasonBadges.length > 1
              ? [{ label: "Versions", value: seasonBadges.map((badge) => badge.label).join(" · ") }]
              : []),
          ]}
        />
      </div>
    </div>
  );
}
