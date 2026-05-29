"use client";

import Image from "next/image";
import { useState } from "react";
import { bungieIconUrl } from "@/lib/bungie-icon";

type CollectionItemIconProps = {
  name: string;
  iconPath: string;
  source?: string;
  owned?: boolean;
  showOwnership?: boolean;
  /** Border color when owned. Exotics use green; armor sets use gold. */
  ownedBorder?: "gold" | "green";
};

const OWNED_BORDER_STYLES = {
  gold: "border-2 border-[rgb(255,188,0)] shadow-[0_0_6px_rgba(255,188,0,0.8)]",
  green: "border-2 border-[rgb(18,233,135)] shadow-[0_0_6px_rgba(18,233,135,1)]",
} as const;

export function CollectionItemIcon({
  name,
  iconPath,
  source,
  owned = false,
  showOwnership = false,
  ownedBorder = "gold",
}: CollectionItemIconProps) {
  const [hovered, setHovered] = useState(false);

  const ownedStyles =
    showOwnership && owned
      ? OWNED_BORDER_STYLES[ownedBorder]
      : "border-zinc-800";

  const unownedStyles =
    showOwnership && !owned ? "opacity-70 brightness-90 saturate-75" : "";

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={bungieIconUrl(iconPath)}
        alt={name}
        width={48}
        height={48}
        className={`h-12 w-12 rounded-md border bg-zinc-900 object-cover transition duration-200 ease-out hover:scale-110 hover:brightness-110 ${ownedStyles} ${unownedStyles}`}
        unoptimized
      />

      {hovered ? (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-950/95 px-2.5 py-2 text-center shadow-lg">
          <p className="text-xs font-medium text-zinc-100">{name}</p>
          {source ? (
            <p className="mt-1 text-[10px] leading-snug text-zinc-400">{source}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
