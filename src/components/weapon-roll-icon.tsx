"use client";

import { GearTierMarkers } from "@/components/gear-tier-markers";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { WeaponVersionDisplay } from "@/types/weapon-rolls";

type WeaponRollIconProps = {
  version: WeaponVersionDisplay;
  gearTier?: number | null;
  className?: string;
};

const ICON_LAYER_CLASS =
  "pointer-events-none absolute inset-0 size-full object-cover";

/**
 * Loot row icon (base art + season watermark + gear tier).
 * Hover zoom resizes the box (no transform) so tier diamonds stay on the art.
 */
export function WeaponRollIcon({
  version,
  gearTier = null,
  className = "",
}: WeaponRollIconProps) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11 ${className}`}
    >
      <div
        className="relative size-10 shrink-0 overflow-hidden border border-zinc-800 bg-zinc-900 transition-[width,height] duration-200 ease-out group-hover:size-[42px] sm:size-11 sm:group-hover:size-[46.2px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bungieIconUrl(version.iconPath)}
          alt=""
          width={44}
          height={44}
          className={ICON_LAYER_CLASS}
          decoding="async"
        />
        {version.seasonIconPath ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={bungieIconUrl(version.seasonIconPath)}
            alt=""
            width={44}
            height={44}
            className={ICON_LAYER_CLASS}
            decoding="async"
          />
        ) : null}
        <GearTierMarkers tier={gearTier} />
      </div>
    </div>
  );
}
