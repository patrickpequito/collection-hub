"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WeaponMetaIcons } from "@/components/weapon-meta-icons";
import { bungieIconUrl } from "@/lib/bungie-icon";

const ICON_SIZE = 60;
const TOOLTIP_WIDTH = 176;

type CollectionItemIconProps = {
  name: string;
  iconPath: string;
  source?: string;
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

export function CollectionItemIcon({
  name,
  iconPath,
  source,
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

  const iconClass = fluid
    ? `aspect-square w-full ${fillCell ? "" : "max-w-[3.75rem] "}rounded-md border bg-zinc-900 object-contain transition duration-200 ease-out hover:scale-105 hover:brightness-110 active:scale-95 ${ownedStyles} ${unownedStyles}`
    : `size-[60px] shrink-0 rounded-md border bg-zinc-900 object-contain transition duration-200 ease-out hover:scale-110 hover:brightness-110 active:scale-95 ${ownedStyles} ${unownedStyles}`;

  const wrapperClass = fluid ? "relative min-w-0 w-full" : "relative shrink-0";

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
    <Image
      src={bungieIconUrl(iconPath)}
      alt={name}
      width={ICON_SIZE}
      height={ICON_SIZE}
      className={iconClass}
      unoptimized
    />
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
