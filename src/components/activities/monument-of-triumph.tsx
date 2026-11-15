"use client";

import Link from "@/components/app-link";
import { useEffect, useMemo, useState } from "react";
import { ActivityCard } from "@/components/activities/activity-card";
import { ArmorSetBlock } from "@/components/activity-current-loot-panel";
import { CollectionItemIcon } from "@/components/collection-item-icon";
import { ArmorPieceIcon } from "@/components/armor-piece-icon";
import { ClassToggle } from "@/components/class-toggle";
import { useOwnership } from "@/components/client-ownership";
import { BoxHeading, SectionHeading, StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { ProgressLine } from "@/components/home/home-progress";
import { LootBox, LootItemGrid } from "@/components/loot-section";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { ARMOR_SLOTS, CLASS_LABELS, SLOT_LABELS } from "@/lib/armor-sets/constants";
import { armorSetPreviewUrl } from "@/lib/armor-sets/preview-images";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";
import type { MonumentOrnamentSet, MonumentSingleOrnament } from "@/lib/activities/monument-of-triumph";
import type { SealSummary } from "@/lib/triumphs/hub";
import { countTriumphProgress } from "@/lib/triumphs/record-progress";
import { sealProgress } from "@/lib/triumphs/seal-progress";
import { useSignedIn } from "@/lib/use-signed-in";
import { DEADLANDS_CLASS_CODES, DEADLANDS_REDEEM_URL, DEADLANDS_SET_NAME } from "@/data/activities/deadlands-bundle";
import type { ActivityHubLootSection } from "@/types/activity-hub";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { GuardianClass } from "@/types/armor-set";
import type { TriumphRecord } from "@/types/triumph";

const BLOCK_CLASS = "min-w-0 space-y-3 overflow-hidden border border-hairline bg-panel/85 p-3 sm:p-4";

const ownershipOf = (item: LootItem) => item.ownershipHashes ?? [item.itemHash];

/** Header blocks: armor, weapons, Monument rewards, triumphs and the Immortal seal. */
export function MonumentStatBlocks({
  armorGroups,
  weaponGroups,
  rewardGroups,
  triumphRecords,
  seal,
}: {
  armorGroups: string[][];
  weaponGroups: string[][];
  rewardGroups: string[][];
  triumphRecords: TriumphRecord[];
  seal: SealSummary | null;
}) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();
  const instanceMap = useMemo(() => new Map(Object.entries(signedIn ? instances : {})), [instances, signedIn]);
  const triumphs = countTriumphProgress(triumphRecords, instanceMap);
  const sealBase = seal ? sealProgress(seal, signedIn ? instances : {}).base : null;
  const owned = (groups: string[][]) => (showOwnership ? countOwnedGroups(groups, ownedItemHashes) : null);

  return (
    <StatBlockGrid count={seal ? 5 : 4}>
      <StatBlock label="Armor">
        <StatCount owned={owned(armorGroups)} total={armorGroups.length} gold />
      </StatBlock>
      <StatBlock label="Weapons">
        <StatCount owned={owned(weaponGroups)} total={weaponGroups.length} />
      </StatBlock>
      <StatBlock label="Monument rewards">
        <StatCount owned={owned(rewardGroups)} total={rewardGroups.length} />
      </StatBlock>
      <StatBlock label="Triumphs">
        <StatCount owned={signedIn ? triumphs.completed : null} total={triumphs.total} />
      </StatBlock>
      {seal && sealBase ? (
        <StatBlock label={`Title · ${seal.guardianTitle}`}>
          <StatCount owned={signedIn ? sealBase.completed : null} total={sealBase.total} />
        </StatBlock>
      ) : null}
    </StatBlockGrid>
  );
}

/** Small set preview that opens full size on click; hatched placeholder with the filename when missing. */
function PreviewThumb({ file, url, label }: { file: string; url: string | null; label: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!url) {
    return (
      <span
        className="flex aspect-video w-full items-end border border-white/[0.14] bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.04)_0_2px,transparent_2px_14px)] p-1.5 font-mono text-[10px] text-zinc-500"
        title={`Add /images/armor-set-previews/${file}`}
      >
        <span className="truncate">{file}</span>
      </span>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand ${label} preview`}
        className="block w-full cursor-zoom-in border border-white/[0.14] transition hover:border-bone/60"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="aspect-video w-full object-cover" />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="max-h-[90vh] w-full max-w-5xl object-contain" />
        </div>
      ) : null}
    </>
  );
}

/** Ornament set blocks in three columns: name, preview, then the selected class's pieces. */
function SetGrid({
  label,
  sets,
  extraItems,
  guardianClass,
  onClassChange,
  itemHrefs,
}: {
  /** Row title and the small line next to it. */
  label: { heading: string; text: string };
  sets: MonumentOrnamentSet[];
  /** Pieces outside a set (helmets, exotic ornaments), one block without preview. */
  extraItems?: { title: string; items: Record<GuardianClass, MonumentSingleOrnament[]> };
  guardianClass: GuardianClass;
  /** Shows the class toggle on this row (one toggle drives every grid in the section). */
  onClassChange?: (guardianClass: GuardianClass) => void;
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const owns = (item: LootItem) => ownershipOf(item).some((hash) => ownedItemHashes.has(hash));
  const countNote = (items: LootItem[]) =>
    showOwnership ? `${items.filter(owns).length} / ${items.length}` : items.length;
  const piecesFor = (set: MonumentOrnamentSet) => {
    const row = set.rows.find((entry) => entry.guardianClass === guardianClass);
    return row ? Object.values(row.pieces).filter((piece): piece is LootItem => Boolean(piece)) : [];
  };

  const icon = (piece: LootItem, slotLabel: string) => (
    <ArmorPieceIcon
      key={piece.itemHash}
      piece={piece}
      slotLabel={slotLabel}
      sourceLabel={piece.source}
      owned={owns(piece)}
      showOwnership={showOwnership}
      fluid
      href={itemHrefs?.[piece.itemHash]}
      ornamentOverlay
      classOrWeaponType={CLASS_LABELS[guardianClass]}
    />
  );

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">{label.heading}</h3>
        <span className="ui-label text-[11px]!">{label.text}</span>
        {onClassChange ? (
          <div className="ml-auto">
            <ClassToggle value={guardianClass} onChange={onClassChange} />
          </div>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => {
          const row = set.rows.find((entry) => entry.guardianClass === guardianClass);
          return (
            <div key={set.name} className={`${BLOCK_CLASS} space-y-2.5!`}>
              <BoxHeading
                title={set.classNames?.[guardianClass] ?? set.name}
                note={row ? countNote(piecesFor(set)) : undefined}
              />
              <PreviewThumb
                file={set.previewFile}
                url={set.hasPreview ? armorSetPreviewUrl(set.previewFile) : null}
                label={`${set.name} ornament set`}
              />
              {row ? (
                <div className="grid grid-cols-5 gap-1.5">
                  {ARMOR_SLOTS.map((slot) => {
                    const piece = row.pieces[slot];
                    return piece ? icon(piece, SLOT_LABELS[slot]) : <div key={slot} aria-hidden />;
                  })}
                </div>
              ) : (
                // Class-specific sets (Pattern Breaker is Warlock only).
                <p className="text-xs text-ash">
                  {set.rows.map((entry) => CLASS_LABELS[entry.guardianClass]).join(" / ")} only
                </p>
              )}
            </div>
          );
        })}
        {extraItems?.items[guardianClass].length ? (
          <div className={`${BLOCK_CLASS} space-y-2.5!`}>
            <BoxHeading title={extraItems.title} note={countNote(extraItems.items[guardianClass])} />
            <div className="grid grid-cols-5 gap-1.5">
              {extraItems.items[guardianClass].map((piece) => icon(piece, piece.slotLabel))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Monument rewards: ornament sets (one class at a time, with previews) and cosmetics by type. */
export function MonumentRewards({
  ornamentSets,
  singles,
  rewardsPassSets,
  cosmetics,
  itemHrefs,
}: {
  ornamentSets: MonumentOrnamentSet[];
  singles: Record<GuardianClass, MonumentSingleOrnament[]>;
  rewardsPassSets: MonumentOrnamentSet[];
  cosmetics: ActivityHubLootSection[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const [guardianClass, setGuardianClass] = useState<GuardianClass>("hunter");
  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Monument rewards" note="Ornaments and cosmetics" />
      <SetGrid
        label={{ heading: "Ornament sets", text: "Unlocked at the Monument" }}
        sets={ornamentSets}
        extraItems={{ title: "Single ornaments", items: singles }}
        guardianClass={guardianClass}
        onClassChange={setGuardianClass}
        itemHrefs={itemHrefs}
      />
      {rewardsPassSets.length ? (
        <div className="pt-3">
          <SetGrid
            label={{ heading: "Rewards Pass", text: "Ornament sets from the pass" }}
            sets={rewardsPassSets}
            guardianClass={guardianClass}
            itemHrefs={itemHrefs}
          />
        </div>
      ) : null}
      <h3 className="pt-3 font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">Cosmetics</h3>
      <div className="grid items-start gap-3 md:grid-cols-2">
        {cosmetics.map((section) => (
          <LootBox
            key={section.title}
            title={section.title}
            items={section.items}
            ownedItemHashes={ownedItemHashes}
            showOwnership={showOwnership}
            itemHrefs={itemHrefs}
            fill
          />
        ))}
      </div>
    </section>
  );
}

/** Redeem code with a copy button; gold border once its items are owned. */
function RedeemCode({ code, redeemed }: { code: string; redeemed: boolean }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(code).then(() => setCopied(true), () => undefined);
      }}
      aria-label={`Copy code ${code}`}
      className={`inline-flex min-h-[30px] shrink-0 items-center gap-2 border px-2 font-display text-[15px] tracking-[0.08em] whitespace-nowrap text-bone transition hover:border-bone/60 ${
        redeemed ? "border-owned" : "border-white/[0.22]"
      }`}
    >
      {code}
      {/* Always as wide as "Copied", so the row never reflows when the label changes. */}
      <span className="grid border-l border-white/[0.18] pl-2 text-center text-[10.5px] tracking-[0.16em] text-ash">
        <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>Copy</span>
        <span aria-live="polite" className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>
          Copied
        </span>
      </span>
    </button>
  );
}

/** Deadlands Bundle: ornament set (per-class codes) and cosmetics, each unlocked with a Bungie.net code. */
export function MonumentDeadlands({
  rows,
  previewFile,
  cosmetics,
  itemHrefs,
}: {
  rows: ActivityArmorRow[];
  previewFile: string;
  cosmetics: (LootItem & { code: string })[];
  itemHrefs?: Record<string, string>;
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const owns = (item: LootItem) => ownershipOf(item).some((hash) => ownedItemHashes.has(hash));
  // One code unlocks the class's five ornaments: any owned piece means it was redeemed.
  const classRedeemed = (guardianClass: GuardianClass) => {
    const row = rows.find((entry) => entry.guardianClass === guardianClass);
    return showOwnership && Boolean(row && Object.values(row.pieces).some((piece) => piece && owns(piece)));
  };
  const ownedCosmetics = cosmetics.filter(owns).length;

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Deadlands Bundle" />
      <ArmorSetBlock
        setName={DEADLANDS_SET_NAME}
        title={`Armor · ${DEADLANDS_SET_NAME}`}
        rows={rows}
        previewFiles={[previewFile]}
        missingImageVariant="contribute"
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        itemHrefs={itemHrefs}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/[0.07] pt-3.5">
          {(Object.keys(DEADLANDS_CLASS_CODES) as GuardianClass[]).map((guardianClass) => (
            <div key={guardianClass} className="flex items-center gap-2">
              <span className="ui-label">{CLASS_LABELS[guardianClass]}</span>
              <RedeemCode code={DEADLANDS_CLASS_CODES[guardianClass]} redeemed={classRedeemed(guardianClass)} />
            </div>
          ))}
          <a
            href={DEADLANDS_REDEEM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[31px] items-center bg-bone px-3 font-display text-xs uppercase tracking-[0.18em] whitespace-nowrap text-void transition hover:bg-white sm:ml-auto"
          >
            Redeem on Bungie.net →
          </a>
        </div>
      </ArmorSetBlock>
      {cosmetics.length ? (
        <div className={BLOCK_CLASS}>
          <BoxHeading
            title="Cosmetics"
            note={showOwnership ? `${ownedCosmetics} / ${cosmetics.length}` : cosmetics.length}
          />
          <div className="grid gap-x-10 md:grid-cols-2">
            {cosmetics.map((item) => (
              <div key={item.itemHash} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3.5 py-2.5">
                <CollectionItemIcon
                  fluid
                  fillCell
                  name={item.name}
                  iconPath={item.iconPath}
                  source={item.source}
                  seasonIconPath={item.seasonIconPath}
                  owned={owns(item)}
                  showOwnership={showOwnership}
                  href={itemHrefs?.[item.itemHash]}
                  rarity={item.rarity}
                  itemType={item.itemType}
                />
                <div className="min-w-0">
                  <p className="text-sm text-bone">{item.name}</p>
                  <p className="ui-label text-[11px]!">{item.itemType}</p>
                </div>
                <RedeemCode code={item.code} redeemed={showOwnership && owns(item)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** The new Monument weapons under their own section title. */
export function MonumentWeapons({ weapons, itemHrefs }: { weapons: LootItem[]; itemHrefs?: Record<string, string> }) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const owned = weapons.filter((item) => ownershipOf(item).some((hash) => ownedItemHashes.has(hash))).length;
  return (
    <section className="min-w-0">
      <SectionHeading title="Weapons" note={showOwnership ? `${owned} / ${weapons.length} owned` : `${weapons.length} weapons`} />
      <div className={BLOCK_CLASS}>
        <LootItemGrid items={weapons} ownedItemHashes={ownedItemHashes} showOwnership={showOwnership} itemHrefs={itemHrefs} />
      </div>
    </section>
  );
}

/** Link banner to the Armor set bonuses guide, over set preview art. */
export function MonumentGuideBanner({
  imageUrl,
  reissuedSets,
  totalSets,
}: {
  imageUrl: string;
  reissuedSets: number;
  totalSets: number;
}) {
  return (
    <Link
      href="/sets/bonuses"
      className="group relative flex min-h-[220px] flex-col justify-end gap-2 overflow-hidden border border-owned/45 bg-panel px-6 py-6 transition hover:border-owned"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-void/95 via-void/70 to-void/10" />
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-owned" />
      <span className="ui-label text-on-art relative text-owned!">Collections · Guide</span>
      <span className="text-on-art relative font-display text-[28px] font-semibold uppercase leading-tight tracking-[0.06em] text-bone">
        Armor set bonuses
      </span>
      <span className="text-on-art relative max-w-xl text-sm text-[#c7cad0]">
        {reissuedSets} of the {totalSets} sets with set bonuses came back with Monument of Triumph. Search every 2 and
        4-piece bonus by effect, class and source.
      </span>
      <span className="relative mt-2 inline-flex min-h-[38px] items-center self-start border border-owned/70 bg-void/60 px-3.5 font-display text-sm uppercase tracking-[0.12em] text-owned transition group-hover:bg-owned group-hover:text-void">
        Open the guide →
      </span>
    </Link>
  );
}

/** Sparrow Racing League and Pantheon cards with loot progress. */
export function MonumentActivities({
  cards,
}: {
  cards: {
    href: string;
    title: string;
    label: string;
    imageUrl: string;
    imagePosition?: string;
    groups: string[][];
  }[];
}) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  return (
    <section className="min-w-0">
      <SectionHeading title="Activities" note="New with Monument of Triumph" />
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <ActivityCard
            key={card.href}
            href={card.href}
            title={card.title}
            label={card.label}
            imageUrl={card.imageUrl}
            imagePosition={card.imagePosition}
          >
            {showOwnership ? (
              <ProgressLine label="Loot" owned={countOwnedGroups(card.groups, ownedItemHashes)} total={card.groups.length} />
            ) : null}
          </ActivityCard>
        ))}
      </div>
    </section>
  );
}

