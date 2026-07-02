"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bungieIconUrl } from "@/lib/bungie-icon";

const TOOLTIP_WIDTH = 180;
const TOOLTIP_AUTO_DISMISS_MS = 3000;

type ArmorArchetypeIconProps = {
  name: string | null | undefined;
  iconPath?: string | null;
  /** Roll list: icon only with tooltip. Detail: icon + label in a fixed-height row. */
  variant?: "roll" | "detail";
  showTooltip?: boolean;
  className?: string;
};

const ICON_SIZE_CLASS = {
  roll: "size-5",
  detail: "size-6",
} as const;

function ArchetypeImage({
  iconPath,
  sizeClass,
}: {
  iconPath: string;
  sizeClass: string;
}) {
  return (
    <Image
      src={bungieIconUrl(iconPath)}
      alt=""
      width={20}
      height={20}
      className={`${sizeClass} shrink-0 object-contain`}
      aria-hidden
      unoptimized
    />
  );
}

function IconPlaceholder({ sizeClass }: { sizeClass: string }) {
  return <span className={`${sizeClass} shrink-0`} aria-hidden />;
}

export function ArmorArchetypeIcon({
  name,
  iconPath,
  variant = "roll",
  showTooltip = false,
  className = "",
}: ArmorArchetypeIconProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipTop, setTooltipTop] = useState<number | null>(null);
  const [tooltipLeftPx, setTooltipLeftPx] = useState<number | null>(null);
  const sizeClass = ICON_SIZE_CLASS[variant];

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

  const showTooltipAtAnchor = useCallback(() => {
    if (!showTooltip || !name) return;

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
  }, [name, showTooltip]);

  const tooltip =
    showTooltip &&
    name &&
    tooltipTop !== null &&
    tooltipLeftPx !== null
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-[11.25rem] rounded-lg border border-zinc-700 bg-zinc-950/95 px-2.5 py-2 text-center shadow-lg"
            style={{ top: tooltipTop, left: tooltipLeftPx }}
            role="tooltip"
          >
            <p className="text-xs font-medium text-zinc-100">{name}</p>
          </div>,
          document.body,
        )
      : null;

  const iconContent = iconPath ? (
    <ArchetypeImage iconPath={iconPath} sizeClass={sizeClass} />
  ) : (
    <IconPlaceholder sizeClass={sizeClass} />
  );

  const iconNode =
    showTooltip && name ? (
      <div
        ref={anchorRef}
        className="relative inline-flex"
        onMouseEnter={showTooltipAtAnchor}
        onMouseLeave={hideTooltip}
        onFocus={showTooltipAtAnchor}
        onBlur={hideTooltip}
        onClick={(event) => {
          event.stopPropagation();
          showTooltipAtAnchor();
        }}
      >
        {iconContent}
      </div>
    ) : (
      iconContent
    );

  if (variant === "detail") {
    return (
      <div
        className={`flex min-h-7 items-center gap-2 ${className}`}
      >
        {name ? (
          <>
            {iconPath ? (
              <ArchetypeImage iconPath={iconPath} sizeClass={sizeClass} />
            ) : (
              <IconPlaceholder sizeClass={sizeClass} />
            )}
            <p className="text-base font-medium leading-tight text-zinc-100">
              {name}
            </p>
          </>
        ) : (
          <p className="text-base font-medium leading-tight text-zinc-500">—</p>
        )}
      </div>
    );
  }

  if (!name) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <span className="text-sm font-medium text-zinc-500">—</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {iconNode}
      {tooltip}
    </div>
  );
}
