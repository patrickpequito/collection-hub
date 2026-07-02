"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { localSeasonIconPath } from "@/lib/all-loot/season-icon-path";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SeasonBadge } from "@/lib/all-loot/season-badges";

const TOOLTIP_WIDTH = 200;
const TOOLTIP_AUTO_DISMISS_MS = 3000;
const BADGE_SIZE_CLASS = "size-10 sm:size-12";

type WeaponSeasonBadgesProps = {
  badges: SeasonBadge[];
  selectedKey?: string;
  onSelect?: (itemHash: string) => void;
  className?: string;
};

type SeasonBadgeIconProps = {
  badge: SeasonBadge;
  selected: boolean;
  selectable: boolean;
  onSelect?: (itemHash: string) => void;
};

function SeasonBadgeIcon({
  badge,
  selected,
  selectable,
  onSelect,
}: SeasonBadgeIconProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [iconSrc, setIconSrc] = useState(() =>
    bungieIconUrl(localSeasonIconPath(badge.label)),
  );
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const [tooltipLeftPx, setTooltipLeftPx] = useState<number | null>(null);

  useEffect(() => {
    setIconSrc(bungieIconUrl(localSeasonIconPath(badge.label)));
  }, [badge.label, badge.iconPath]);

  useEffect(
    () => () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    },
    [],
  );

  const hideTooltip = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setTooltipTop(null);
    setTooltipLeftPx(null);
  }, []);

  const showTooltip = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

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

    dismissTimerRef.current = setTimeout(() => {
      dismissTimerRef.current = null;
      setTooltipTop(null);
      setTooltipLeftPx(null);
    }, TOOLTIP_AUTO_DISMISS_MS);
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
            {selectable ? (
              <p className="mt-0.5 text-[0.65rem] text-zinc-500">
                {selected ? "Showing this version" : "Click to show perks"}
              </p>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  const ringClass = selected
    ? "ring-2 ring-amber-400/70 ring-offset-1 ring-offset-zinc-950"
    : selectable
      ? "hover:ring-1 hover:ring-amber-400/50"
      : "";

  const containerClass = [
    `relative shrink-0 overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900 ${BADGE_SIZE_CLASS}`,
    selectable
      ? "cursor-pointer transition-[transform,background-color,border-color,box-shadow] duration-200 hover:bg-zinc-800/90 hover:border-zinc-600 active:scale-95 active:duration-75"
      : "",
    selectable && !selected
      ? "hover:scale-105 hover:shadow-lg hover:shadow-black/25"
      : "",
    ringClass,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <Image
      src={iconSrc}
      alt=""
      width={48}
      height={48}
      className="pointer-events-none absolute left-0 top-0 size-full object-cover"
      aria-hidden
      unoptimized
      onError={() => {
        const fallback = bungieIconUrl(badge.iconPath);
        setIconSrc((current) => (current === fallback ? current : fallback));
      }}
    />
  );

  return (
    <>
      <div
        ref={anchorRef}
        className={containerClass}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {selectable && onSelect ? (
          <button
            type="button"
            className="absolute inset-0 z-10 rounded-sm"
            onFocus={showTooltip}
            onBlur={hideTooltip}
            onClick={() => {
              showTooltip();
              onSelect(badge.key);
            }}
            aria-label={badge.label}
            aria-pressed={selected}
          />
        ) : null}
        {inner}
      </div>
      {tooltip}
    </>
  );
}

export function WeaponSeasonBadges({
  badges,
  selectedKey,
  onSelect,
  className = "",
}: WeaponSeasonBadgesProps) {
  if (!badges.length) return null;

  const selectable = Boolean(onSelect && badges.length > 1);

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5 ${className}`}
      role={selectable ? "tablist" : undefined}
      aria-label={selectable ? "Weapon versions" : undefined}
    >
      {badges.map((badge) => (
        <SeasonBadgeIcon
          key={badge.key}
          badge={badge}
          selected={badge.key === selectedKey}
          selectable={selectable}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
