"use client";

import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { WeaponVersionDisplay } from "@/types/weapon-rolls";

type WeaponRollIconProps = {
  version: WeaponVersionDisplay;
};

/** Matches loot search row icons: base weapon art + corner season watermark. */
export function WeaponRollIcon({ version }: WeaponRollIconProps) {
  return (
    <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
      <Image
        src={bungieIconUrl(version.iconPath)}
        alt=""
        width={44}
        height={44}
        className="h-10 w-10 border border-zinc-800 bg-zinc-900 object-cover sm:h-11 sm:w-11"
        unoptimized
      />
      {version.seasonIconPath ? (
        <Image
          src={bungieIconUrl(version.seasonIconPath)}
          alt=""
          width={44}
          height={44}
          className="pointer-events-none absolute left-0 top-0 h-10 w-10 sm:h-11 sm:w-11"
          unoptimized
        />
      ) : null}
    </div>
  );
}
