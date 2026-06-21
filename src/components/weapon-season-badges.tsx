"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SeasonBadge } from "@/lib/all-loot/season-badges";

const TOOLTIP_WIDTH = 200;
const BADGE_SIZE_CLASS = "size-10 sm:size-12";

type WeaponSeasonBadgesProps = {
  badges: SeasonBadge[];
  className?: string;
};

function SeasonBadgeIcon({ badge }: { badge: SeasonBadge }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const [tooltipLeftPx, setTooltipLeftPx] = useState<number | null>(null);

  const showTooltip = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltipTop(rect.bottom + 8);
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

  const tooltip =
    tooltipTop !== null && tooltipLeftPx !== null
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-[12.5rem] rounded-lg border border-zinc-700 bg-zinc-950/95 px-2.5 py-2 text-center shadow-lg"
            style={{ top: tooltipTop, left: tooltipLeftPx }}
            role="tooltip"
          >
            <p className="text-xs font-medium text-zinc-100">{badge.label}</p>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={anchorRef}
        className={`relative shrink-0 rounded-sm border border-zinc-800 bg-zinc-900 ${BADGE_SIZE_CLASS}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <Image
          src={bungieIconUrl(badge.iconPath)}
          alt=""
          width={48}
          height={48}
          className="pointer-events-none absolute left-0 top-0 size-full"
          aria-label={badge.label}
          unoptimized
        />
      </div>
      {tooltip}
    </>
  );
}

export function WeaponSeasonBadges({
  badges,
  className = "",
}: WeaponSeasonBadgesProps) {
  if (!badges.length) return null;

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5 ${className}`}
    >
      {badges.map((badge) => (
        <SeasonBadgeIcon key={badge.key} badge={badge} />
      ))}
    </div>
  );
}
