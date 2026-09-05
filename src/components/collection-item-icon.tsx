"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WeaponMetaIcons } from "@/components/weapon-meta-icons";
import {
  bungieIconUrl,
  bungieOrnamentOverlayUrl,
  ornamentOverlayTierForRarity,
  type OrnamentOverlayTier,
} from "@/lib/bungie-icon";

const ICON_SIZE = 60;
const TOOLTIP_WIDTH = 176;

type CollectionItemIconProps = {
  name: string;
  iconPath: string;
  source?: string;
  /** Season/event watermark drawn over the icon (same as All Loot). */
  seasonIconPath?: string | null;
  owned?: boolean;
  showOwnership?: boolean;
  /** Border color when owned. Exotics use green; armor sets use gold. */
  ownedBorder?: "gold" | "green";
  /** Tooltip alignment for edge icons in tight rows. */
  tooltipAlign?: "start" | "center" | "end";
  /** Shrink to fit grid cells in narrow armor-set rows. */
  fluid?: boolean;
  /** When fluid, grow to fill the full grid cell (no 60px cap). */
  fillCell?: boolean;
  href?: string;
  classOrWeaponType?: string | null;
  damageType?: string | null;
  ammoType?: string | null;
  /**
   * Apply Destiny's ornament inventory plate overlay.
   * Pass a tier explicitly, or true to pick from `rarity`.
   */
  ornamentOverlay?: boolean | OrnamentOverlayTier;
  rarity?: string | null;
};

const OWNED_BORDER_STYLES = {
  gold: "border-2 border-[rgb(255,188,0)] shadow-[0_0_6px_rgba(255,188,0,0.8)]",
  green: "border-2 border-[rgb(18,233,135)] shadow-[0_0_6px_rgba(18,233,135,1)]",
} as const;

function tooltipLeft(
  rect: DOMRect,
  align: "start" | "center" | "end",
) {
  if (align === "start") return rect.left;
  if (align === "end") return rect.right - TOOLTIP_WIDTH;
  return rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
}

function resolveOrnamentOverlayTier(
  ornamentOverlay: boolean | OrnamentOverlayTier | undefined,
  rarity: string | null | undefined,
): OrnamentOverlayTier | null {
  if (!ornamentOverlay) return null;
  if (ornamentOverlay === true) return ornamentOverlayTierForRarity(rarity);
  return ornamentOverlay;
}

export function CollectionItemIcon({
  name,
  iconPath,
  source,
  seasonIconPath,
  owned = false,
  showOwnership = false,
  ownedBorder = "gold",
  tooltipAlign = "center",
  fluid = false,
  fillCell = false,
  href,
  classOrWeaponType,
  damageType,
  ammoType,
  ornamentOverlay,
  rarity,
}: CollectionItemIconProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const [tooltipLeftPx, setTooltipLeftPx] = useState<number | null>(null);

  const ownedStyles =
    showOwnership && owned
      ? OWNED_BORDER_STYLES[ownedBorder]
      : "border-zinc-800";

  const unownedStyles =
    showOwnership && !owned ? "opacity-70 brightness-90 saturate-75" : "";

  const sizeClass = fluid
    ? `aspect-square w-full ${fillCell ? "" : "max-w-[3.75rem] "}`
    : "size-[60px] shrink-0";

  // Border sits on an outer shell; icon layers fill the inner box edge-to-edge
  // so season watermarks (bottom stripe) sit flush like in-game / All Loot.
  const shellClass = `${sizeClass} overflow-hidden rounded-md border bg-zinc-900 transition duration-200 ease-out hover:brightness-110 active:scale-95 ${fluid ? "hover:scale-105" : "hover:scale-110"} ${ownedStyles} ${unownedStyles}`;

  const wrapperClass = fluid ? "relative min-w-0 w-full" : "relative shrink-0";

  const overlayTier = resolveOrnamentOverlayTier(ornamentOverlay, rarity);

  const showTooltip = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltipTop(rect.top - 8);
    setTooltipLeftPx(
      Math.max(
        8,
        Math.min(
          tooltipLeft(rect, tooltipAlign),
          window.innerWidth - TOOLTIP_WIDTH - 8,
        ),
      ),
    );
  }, [tooltipAlign]);

  const hideTooltip = useCallback(() => {
    setTooltipTop(null);
    setTooltipLeftPx(null);
  }, []);

  const tooltip =
    tooltipTop !== null && tooltipLeftPx !== null
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-44 -translate-y-full rounded-lg border border-zinc-700 bg-zinc-950/95 px-2.5 py-2 shadow-lg"
            style={{ top: tooltipTop, left: tooltipLeftPx }}
            role="tooltip"
          >
            <p className="text-xs font-medium text-zinc-100">{name}</p>
            <WeaponMetaIcons
              classOrWeaponType={classOrWeaponType}
              damageType={damageType}
              ammoType={ammoType}
              className="mt-1.5"
            />
            {source ? (
              <p className="mt-1 text-[10px] leading-snug text-zinc-400">
                {source}
              </p>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  const iconBody = (
    <div className={shellClass}>
      <div className="relative size-full overflow-hidden">
        {/* Native img avoids Next/Image wrapper offset that leaves a 1px gap. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bungieIconUrl(iconPath)}
          alt={name}
          width={ICON_SIZE}
          height={ICON_SIZE}
          className="pointer-events-none absolute inset-0 size-full object-cover"
          decoding="async"
        />
        {seasonIconPath ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={bungieIconUrl(seasonIconPath)}
            alt=""
            width={ICON_SIZE}
            height={ICON_SIZE}
            aria-hidden
            // Bleed 1px so Bungie watermark corner banners sit flush to the frame
            className="pointer-events-none absolute -left-px -top-px h-[calc(100%+2px)] w-[calc(100%+2px)] max-w-none object-cover"
            decoding="async"
          />
        ) : null}
        {overlayTier ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={bungieOrnamentOverlayUrl(overlayTier)}
            alt=""
            width={ICON_SIZE}
            height={ICON_SIZE}
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full object-cover mix-blend-screen opacity-[0.38]"
            decoding="async"
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={anchorRef}
        className={wrapperClass}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {href ? (
          <Link
            href={href}
            className="block rounded-md transition-transform duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/80"
            aria-label={name}
          >
            {iconBody}
          </Link>
        ) : (
          iconBody
        )}
      </div>
      {tooltip}
    </>
  );
}
