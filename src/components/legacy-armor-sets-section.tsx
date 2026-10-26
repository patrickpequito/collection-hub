"use client";

import { useEffect, useRef, useState } from "react";
import { ArmorSetBlock } from "@/components/activity-current-loot-panel";
import { countOwnedArmorPieces } from "@/lib/activities/armor-rows";
import { armorSetPreviewUrl, resolveArmorSetPreviewFile } from "@/lib/armor-sets/preview-images";
import type { LegacyArmorSetGroup } from "@/types/activity-hub";

type LegacyArmorSetsSectionProps = {
  groups: LegacyArmorSetGroup[];
  ownedItemHashes: Set<string>;
  showOwnership: boolean;
  resolveItemOwned?: (itemHash: string) => boolean;
  itemHrefs?: Record<string, string>;
  heading?: string;
  /** Skip the section heading (e.g. nested inside another panel). */
  bare?: boolean;
};

function legacySetSource(group: LegacyArmorSetGroup): string {
  for (const row of group.rows) {
    for (const piece of Object.values(row.pieces)) {
      if (piece?.source) return piece.source;
    }
  }
  return "";
}

/** Small preview in a closed row; only shown once the image has loaded (none when missing). */
function PreviewThumb({ file }: { file: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "missing">("loading");
  const ref = useRef<HTMLImageElement>(null);
  // The image may finish loading before React attaches onLoad (server-rendered page).
  useEffect(() => {
    const img = ref.current;
    if (!img?.complete) return;
    void Promise.resolve().then(() => setState(img.naturalWidth > 0 ? "loaded" : "missing"));
  }, []);
  if (state === "missing") return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={armorSetPreviewUrl(file)}
      alt=""
      aria-hidden
      onLoad={() => setState("loaded")}
      onError={() => setState("missing")}
      className={`hidden h-11 w-auto shrink-0 sm:block ${
        state === "loaded" ? "border border-white/[0.14]" : "invisible w-0"
      }`}
    />
  );
}

const TOGGLE =
  "inline-flex min-h-7 items-center border px-2.5 font-display text-xs uppercase tracking-[0.12em] transition";

/**
 * Older armor (and ornament) sets as expandable rows. A closed row shows the set name,
 * its release season, a preview thumbnail and the owned count; an open row shows the
 * shared armor set block (classes above each row, uncropped preview on the right).
 */
export function LegacyArmorSetsSection({
  groups,
  ownedItemHashes,
  showOwnership,
  resolveItemOwned,
  itemHrefs,
  heading = "Legacy armor sets",
  bare = false,
}: LegacyArmorSetsSectionProps) {
  const [openSets, setOpenSets] = useState<Set<string>>(() => new Set());
  if (!groups.length) return null;

  const isOwned = (itemHash: string) => {
    if (resolveItemOwned) return resolveItemOwned(itemHash);
    for (const group of groups) {
      for (const row of group.rows) {
        for (const piece of Object.values(row.pieces)) {
          if (!piece || piece.itemHash !== itemHash) continue;
          const hashes = piece.ownershipHashes?.length ? piece.ownershipHashes : [itemHash];
          return hashes.some((hash) => ownedItemHashes.has(hash));
        }
      }
    }
    return ownedItemHashes.has(itemHash);
  };
  const toggle = (setName: string) =>
    setOpenSets((current) => {
      const next = new Set(current);
      if (next.has(setName)) next.delete(setName);
      else next.add(setName);
      return next;
    });
  const allOpen = openSets.size === groups.length;
  const expandControls = (
    <div className="flex gap-1">
      {[
        { label: "Expand all", active: allOpen, onClick: () => setOpenSets(new Set(groups.map((group) => group.setName))) },
        { label: "Collapse all", active: openSets.size === 0, onClick: () => setOpenSets(new Set()) },
      ].map((button) => (
        <button
          key={button.label}
          type="button"
          onClick={button.onClick}
          className={`${TOGGLE} ${
            button.active ? "border-bone bg-white/[0.06] text-white" : "border-white/[0.22] text-[#c7cad0] hover:border-bone"
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );

  return (
    <section className="min-w-0 space-y-2">
      {bare ? null : (
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.14] pb-2.5">
          <h2 className="min-w-0 text-2xl font-semibold uppercase tracking-[0.06em] text-bone">{heading}</h2>
          {expandControls}
        </div>
      )}

      {groups.map((group) => {
        const progress = countOwnedArmorPieces(group.rows, isOwned);
        const name = group.displayName ?? group.setName;
        const title = group.kind === "ornament" ? `Ornaments · ${name.replace(/ ornaments$/i, "")}` : `Armor · ${name}`;
        const previewFile = group.previewFile ?? resolveArmorSetPreviewFile(group.setName, legacySetSource(group));
        const open = openSets.has(group.setName);
        return (
          <div
            key={group.setName}
            className={`min-w-0 border bg-panel/85 ${open ? "border-white/30" : "border-hairline"}`}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => toggle(group.setName)}
              className={`flex w-full items-center gap-4 px-4 py-2.5 text-left transition hover:bg-white/[0.03] ${
                open ? "border-b border-white/[0.08]" : ""
              }`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-bone">
                  {title}
                </span>
                {group.seasonLabel ? <span className="ui-label text-[11px]!">{group.seasonLabel}</span> : null}
              </span>
              {open ? null : <PreviewThumb file={previewFile} />}
              <span
                className={`w-14 shrink-0 text-right text-xs tabular-nums ${
                  showOwnership && progress.owned >= progress.total ? "text-owned" : "text-ash"
                }`}
              >
                {showOwnership ? `${progress.owned} / ${progress.total}` : progress.total}
              </span>
              <span aria-hidden className={`text-[11px] text-ash transition ${open ? "rotate-90 text-bone" : ""}`}>
                ▸
              </span>
            </button>
            {open ? (
              <ArmorSetBlock
                bare
                setName={name}
                rows={group.rows}
                previewFiles={[previewFile]}
                missingImageVariant="contribute"
                ownedItemHashes={ownedItemHashes}
                showOwnership={showOwnership}
                resolveItemOwned={resolveItemOwned}
                itemHrefs={itemHrefs}
              />
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
