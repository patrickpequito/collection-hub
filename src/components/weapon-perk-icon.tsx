"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPerkDescription } from "@/lib/weapons/perks";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ResolvedWeaponPerk } from "@/types/all-loot";
import type { PerkHighlightMode } from "@/types/weapon-god-rolls";

const ICON_OUTER_SIZE = "size-12";
const ICON_INNER_SIZE = "size-9";
const TOOLTIP_WIDTH = 240;

type WeaponPerkIconProps = {
  perk: ResolvedWeaponPerk;
  shape?: "circle" | "square";
  highlighted?: boolean;
  highlightMode?: PerkHighlightMode;
};

export function WeaponPerkIcon({
  perk,
  shape = "circle",
  highlighted = false,
  highlightMode = null,
}: WeaponPerkIconProps) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const [tooltipLeftPx, setTooltipLeftPx] = useState<number | null>(null);

  const showTooltip = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltipTop(rect.top - 8);
    setTooltipLeftPx(
      Math.max(
        8,
        Math.min(
          rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2,
          window.innerWidth - TOOLTIP_WIDTH - 8,
        ),
      ),
    );
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltipTop(null);
    setTooltipLeftPx(null);
  }, []);

  const description = formatPerkDescription(perk.description);
  const isSquare = shape === "square";
  const outerHighlightClass = !highlighted
    ? "border-zinc-700 bg-zinc-900"
    : highlightMode === "match"
      ? "border-yellow-400/80 bg-yellow-500/30 shadow-[0_0_6px_rgba(250,204,21,0.3)]"
      : highlightMode === "pve"
        ? "border-emerald-500/70 bg-emerald-500/30"
        : highlightMode === "pvp"
          ? "border-amber-500/70 bg-amber-500/30"
          : "border-blue-500/70 bg-blue-500/30";

  const tooltip =
    tooltipTop !== null && tooltipLeftPx !== null
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-60 -translate-y-full rounded-lg border border-zinc-700 bg-zinc-950/95 px-3 py-2.5 shadow-lg"
            style={{ top: tooltipTop, left: tooltipLeftPx }}
            role="tooltip"
          >
            <p className="text-sm font-medium text-zinc-100">{perk.name}</p>
            {description ? (
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={`relative shrink-0 border transition hover:border-zinc-500 hover:brightness-110 ${outerHighlightClass} ${ICON_OUTER_SIZE} ${
          isSquare
            ? "overflow-hidden rounded-none"
            : "flex items-center justify-center rounded-full"
        }`}
        aria-label={perk.name}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <span
          className={`relative block overflow-hidden ${isSquare ? "size-full" : `${ICON_INNER_SIZE} rounded-full`}`}
        >
          <Image
            src={bungieIconUrl(perk.iconPath)}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
            unoptimized
          />
        </span>
      </button>
      {tooltip}
    </>
  );
}
