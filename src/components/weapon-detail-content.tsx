"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExpandableImage, DETAIL_PREVIEW_FRAME_CLASS } from "@/components/expandable-image";
import { ExoticPerkPanel } from "@/components/exotic-perk-panel";
import { WeaponDetailMeta } from "@/components/weapon-detail-meta";
import { WeaponPerksGrid } from "@/components/weapon-perks-grid";
import { StatBlock, StatBlockGrid, StatCount, SectionJumpNav, SectionHeading } from "@/components/detail-page-parts";
import { ProgressBar } from "@/components/home/progress-bar";
import { ItemHeader, WhereToGetIt } from "@/components/item-detail-parts";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { catalystStatus, progressShare, type CatalystStatus } from "@/lib/exotics/catalyst-status";
import type { ExoticCatalystEntry } from "@/lib/exotics/page-data";
import { useCatalystPlugs } from "@/lib/exotics/use-catalyst-plugs";
import type { ItemOrigin } from "@/lib/items/origin";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import { WeaponCopiesTable } from "@/components/weapon-copies-table";
import { CatalystEffect } from "@/components/exotics/catalyst-effect";
import { WeaponSeasonBadges } from "@/components/weapon-season-badges";
import { WeaponStatsPanel } from "@/components/weapon-stats-panel";
import { resolveSeasonBadges } from "@/lib/all-loot/season-badges";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useSignedIn } from "@/lib/use-signed-in";
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
  origin?: ItemOrigin | null;
  aegisPerksByHash?: Record<string, string[]>;
  catalysts?: ExoticCatalystEntry[];
  plugIndex?: Record<string, WeaponPlugDefinition>;
  godRollsByHash?: Record<string, ResolvedWeaponGodRoll>;
  /** @deprecated Prefer client-side useSignedIn; optional override. */
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
      <div className="overflow-hidden border border-hairline bg-panel/85">
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

function CatalystCard({ catalyst, status }: { catalyst: ExoticCatalystEntry; status: CatalystStatus }) {
  const found = status.kind === "progress" || status.kind === "unlocked";
  const box = (done: boolean) => (
    <span aria-hidden className={`size-3 shrink-0 border ${done ? "border-owned bg-owned" : "border-white/40"}`} />
  );
  return (
    <div className={`ui-panel space-y-2.5 p-3.5 ${status.kind === "missing" ? "opacity-70" : ""}`}>
      <p className="text-[15px] text-bone">{catalyst.name}</p>
      <CatalystEffect catalyst={catalyst} />
      <div className="flex gap-3.5 text-xs text-bone/80">
        <span className="flex items-center gap-1.5">{box(found)}Found</span>
        <span className="flex items-center gap-1.5">{box(status.kind === "unlocked")}Unlocked</span>
      </div>
      {status.kind === "progress"
        ? status.objectives.map((objective) => (
            <div key={objective.description} className="space-y-1.5">
              <span className="flex justify-between gap-2 text-xs text-bone/80">
                <span className="truncate">{objective.description}</span>
                <span className="shrink-0 tabular-nums text-owned">
                  {objective.progress.toLocaleString("en-US")} / {objective.completionValue.toLocaleString("en-US")}
                </span>
              </span>
              <ProgressBar owned={objective.progress} total={objective.completionValue} />
            </div>
          ))
        : null}
      <p className="text-xs text-ash">
        {status.kind === "unknown"
          ? "Sign in to see your progress."
          : status.kind === "missing"
            ? "Not found yet."
            : status.kind === "progress"
              ? "Found — finish the objective."
              : "Unlocked."}
      </p>
      <p className="text-xs text-ash">{catalyst.source}</p>
    </div>
  );
}

export function WeaponDetailContent({
  weapon,
  plugIndex: pagePlugIndex = {},
  godRollsByHash = {},
  origin = null,
  aegisPerksByHash = {},
  catalysts = [],
  isSignedIn: isSignedInProp,
}: WeaponDetailContentProps) {
  const signedInHook = useSignedIn();
  const isSignedIn = isSignedInProp ?? signedInHook;
  const seasonBadges = resolveSeasonBadges(weapon);
  const weaponSlug = weapon.slug ?? "";

  const [selectedVersionHash, setSelectedVersionHash] = useState(
    weapon.itemHash,
  );
  const catalystPlugs = useCatalystPlugs();
  const profileInstances = useProfileRecordInstances();
  const signedInInstances = isSignedIn ? profileInstances : null;
  const { itemHashes: ownedHashList } = useOwnedItemHashes(isSignedIn);
  const ownedSet = useMemo(() => new Set(ownedHashList), [ownedHashList]);
  const [hoveredRollId, setHoveredRollId] = useState<string | null>(null);
  const [pinnedRollId, setPinnedRollId] = useState<string | null>(null);

  const { rolls, characters, loading, error, refetch } = useWeaponRolls(
    weaponSlug,
    isSignedIn,
  );

  // The page ships only this weapon's plugs; owned copies bring their own definitions.
  const plugIndex = useMemo(
    () => Object.assign({}, pagePlugIndex, ...rolls.map((roll) => roll.plugs ?? {})),
    [pagePlugIndex, rolls],
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

  // Recommendations for the shown version; if it has none, the newest earlier
  // version that does (only perks that still exist get marked).
  const recommendationSource = useMemo(() => {
    const hasData = (hash: string) => Boolean(godRollsByHash[hash] || aegisPerksByHash[hash]?.length);
    if (hasData(displayItemHash)) return { hash: displayItemHash, fallbackLabel: null as string | null };
    const versions = [...(weapon.versions ?? [])].sort((a, b) => (b.seasonNumber ?? 0) - (a.seasonNumber ?? 0));
    const fallback = versions.find((version) => version.itemHash !== displayItemHash && hasData(version.itemHash));
    return fallback
      ? { hash: fallback.itemHash, fallbackLabel: fallback.seasonLabel ?? "an earlier version" }
      : { hash: displayItemHash, fallbackLabel: null };
  }, [aegisPerksByHash, displayItemHash, godRollsByHash, weapon.versions]);
  const godRoll = godRollsByHash[recommendationSource.hash] ?? null;

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

  const isExotic = weapon.rarity === "Exotic";
  const sourceText = weapon.source?.replace(/^source:\s*/i, "").replace(/"/g, "") ?? "";
  const rpm = stats?.find((stat) => stat.name === "Rounds Per Minute")?.value;
  const bestRoll = rolls.reduce<(typeof rolls)[number] | null>((best, roll) => {
    const score = (entry: (typeof rolls)[number]) =>
      Math.max(entry.scores.pvePercent ?? 0, entry.scores.pvpPercent ?? 0, entry.aegis.overallPercent ?? 0);
    return !best || score(roll) > score(best) ? roll : best;
  }, null);
  const bestScore = bestRoll
    ? Math.max(bestRoll.scores.pvePercent ?? 0, bestRoll.scores.pvpPercent ?? 0, bestRoll.aegis.overallPercent ?? 0)
    : null;
  const catalystStatuses = catalysts.map((catalyst) =>
    catalystStatus(catalyst, { plugs: catalystPlugs, instances: signedInInstances, ownedItemHashes: ownedSet }),
  );
  const singleStatus = catalysts.length === 1 ? catalystStatuses[0] : null;
  const unlockedCatalysts = catalystStatuses.filter((status) => status.kind === "unlocked").length;

  const sectionLinks = [
    { id: "perks", label: isExotic ? "Exotic perk" : "Perks" },
    ...(isExotic && catalysts.length ? [{ id: "catalysts", label: "Catalysts" }] : []),
    { id: "your-copies", label: "Your copies" },
    { id: "where", label: "Where to get it" },
  ];

  return (
    <div className="space-y-9">
      <ItemHeader
        name={weapon.name}
        iconPath={weapon.iconPath}
        rarity={weapon.rarity}
        typeLine={(dark) => <WeaponDetailMeta weapon={weapon} dark={dark} />}
        mobileTypeLine={(dark) => <WeaponDetailMeta weapon={weapon} dark={dark} compact />}
        tags={[
          ...(isExotic ? [] : [{ label: weapon.obtainable ? "Obtainable" : "Not obtainable", tone: weapon.obtainable ? ("green" as const) : ("plain" as const) }]),
          { label: weapon.rarity ?? "Weapon" },
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

      <StatBlockGrid count={4}>
        <StatBlock label="Your copies">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">
            {isSignedIn ? (loading ? "…" : rolls.length) : "—"}
          </span>
          <span className="text-[13px] text-ash">
            {isSignedIn ? (rolls.length ? `${rolls.filter((roll) => roll.location === "vault").length} in vault` : "None owned") : "Sign in to track"}
          </span>
        </StatBlock>
        {isExotic ? (
          <StatBlock label={catalysts.length > 1 ? "Catalysts" : "Catalyst"}>
            {singleStatus?.kind === "progress" ? (
              <>
                <span className="font-display text-[22px] leading-none sm:text-[30px] text-owned">
                  {Math.floor(progressShare(singleStatus) * 100)}%
                </span>
                <span className="text-[13px] text-ash">
                  {singleStatus.objectives
                    .map((objective) => `${objective.description} ${objective.progress.toLocaleString("en-US")} / ${objective.completionValue.toLocaleString("en-US")}`)
                    .join(" · ")}
                </span>
              </>
            ) : singleStatus ? (
              <>
                <span className={`font-display text-[22px] leading-none sm:text-[30px] ${singleStatus.kind === "unlocked" ? "text-owned" : "text-bone"}`}>
                  {singleStatus.kind === "unlocked" ? "Unlocked" : singleStatus.kind === "missing" ? "Not found" : "—"}
                </span>
                <span className="text-[13px] text-ash">{singleStatus.kind === "unknown" ? "Sign in to track" : catalysts[0].name}</span>
              </>
            ) : (
              <StatCount owned={catalystPlugs ? unlockedCatalysts : null} total={catalysts.length} gold />
            )}
          </StatBlock>
        ) : (
          <StatBlock label="Best match">
            <span className={`font-display text-[22px] leading-none sm:text-[30px] ${bestScore ? "text-owned" : "text-ash"}`}>
              {bestScore ? `${Math.round(bestScore)}%` : "—"}
            </span>
            <span className="text-[13px] text-ash">Closest copy to the recommended rolls</span>
          </StatBlock>
        )}
        <StatBlock label="Frame">
          <span className="font-display text-xl leading-tight text-bone">
            {[weapon.classOrWeaponType, rpm ? `${rpm} RPM` : null].filter(Boolean).join(" · ") || "—"}
          </span>
          <span className="text-[13px] text-ash">{[weapon.damageType, weapon.ammoType].filter(Boolean).join(" · ")}</span>
        </StatBlock>
        <StatBlock label="Source">
          <span className="font-display text-xl leading-tight text-bone">{origin?.label ?? (sourceText || "Unknown")}</span>
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="min-w-0 space-y-2.5">
          <WeaponScreenshot weapon={weapon} itemHash={displayItemHash} />
          {weapon.description ? (
            <p className="text-[13px] italic leading-relaxed text-ash">“{weapon.description}”</p>
          ) : null}
        </div>
        <div className="ui-panel space-y-3 p-4">
          <span className="ui-label block">
            {activeRoll ? "Stats · selected copy" : "Stats"}
          </span>
          {stats?.length ? <WeaponStatsPanel stats={stats} /> : <p className="text-sm text-ash">No stat data.</p>}
        </div>
      </div>

      <div id="perks" className="scroll-mt-20">
        {isExotic ? (
          <div className="space-y-6">
            <ExoticPerkPanel
              perk={exoticPerk}
              unavailableMessage="Exotic perk data is not available for this weapon yet."
            />
            {perkColumns.length ? (
              <WeaponPerksGrid
                key={displayItemHash}
                columns={perkColumns}
                godRoll={null}
                aegisPerks={[]}
                plugIndex={plugIndex}
                rollHighlightPerks={rollHighlightPerks}
                showRecommendations={false}
              />
            ) : null}
          </div>
        ) : perkColumns.length ? (
          <WeaponPerksGrid
            key={displayItemHash}
            columns={perkColumns}
            godRoll={godRoll}
            aegisPerks={aegisPerksByHash[recommendationSource.hash] ?? []}
            fallbackVersionLabel={recommendationSource.fallbackLabel}
            plugIndex={plugIndex}
            rollHighlightPerks={rollHighlightPerks}
          />
        ) : null}
      </div>

      {isExotic && catalysts.length ? (
        <section id="catalysts" className="min-w-0 scroll-mt-20 space-y-3">
          <SectionHeading
            title={catalysts.length > 1 ? "Catalysts" : "Catalyst"}
            note={catalystPlugs && catalysts.length > 1 ? `${unlockedCatalysts} / ${catalysts.length} unlocked` : undefined}
          />
          <div className={`grid gap-2.5 ${catalysts.length > 1 ? "sm:grid-cols-2 xl:grid-cols-4" : ""}`}>
            {catalysts.map((catalyst, index) => (
              <CatalystCard key={catalyst.name} catalyst={catalyst} status={catalystStatuses[index]} />
            ))}
          </div>
        </section>
      ) : null}

      <section id="your-copies" className="min-w-0 scroll-mt-20 space-y-3">
        <SectionHeading title="Your copies" />
        {!isSignedIn ? (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            Sign in to see your copies, how close each one is to the recommended rolls, and move them between characters.
          </p>
        ) : loading ? (
          <p className="text-sm text-ash">Loading your copies…</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : rolls.length === 0 ? (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            You don&apos;t own a copy of this weapon.
          </p>
        ) : (
          <WeaponCopiesTable
            rolls={rolls}
            characters={characters}
            activeRollId={activeRollId}
            pinnedRollId={pinnedRollId}
            isExotic={isExotic}
            plugIndex={plugIndex}
            godRollsByHash={godRollsByHash}
            onHover={setHoveredRollId}
            onPin={(id) => setPinnedRollId(pinnedRollId === id ? null : id)}
            onTransferComplete={(itemInstanceId, destination) =>
              refetch({ silent: true, locationUpdate: { itemInstanceId, destination } })
            }
          />
        )}
      </section>

      <div id="where" className="scroll-mt-20">
        <WhereToGetIt
          rows={[
            { label: "Source", value: origin ? `${origin.label} · ${origin.kind}` : sourceText || "Unknown", href: origin?.href },
            ...(origin && sourceText && !sourceText.toLowerCase().includes(origin.label.toLowerCase())
              ? [{ label: "Details", value: sourceText }]
              : []),
            ...(isExotic
              ? [{ label: "Today", value: "Also available from the Exotic Archive at the Tower once collected (Exotic Cipher)." }]
              : [{ label: "Obtainable", value: weapon.obtainable ? "Yes" : "No" }]),
            ...(!isExotic && seasonBadges.length > 1
              ? [{ label: "Versions", value: seasonBadges.map((badge) => badge.label).join(" · ") }]
              : []),
          ]}
        />
      </div>
    </div>
  );
}
