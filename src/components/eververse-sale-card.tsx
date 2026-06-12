"use client";

import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { EververseSaleItem } from "@/types/eververse";

type EververseSaleCardProps = {
  item: EververseSaleItem;
  owned?: boolean;
  showOwnership?: boolean;
};

export function EververseSaleCard({
  item,
  owned = false,
  showOwnership = false,
}: EververseSaleCardProps) {
  const ownedStyles =
    showOwnership && owned
      ? "border-2 border-[rgb(255,188,0)] shadow-[0_0_6px_rgba(255,188,0,0.8)]"
      : "border-zinc-800";

  const unownedStyles =
    showOwnership && !owned ? "opacity-70 brightness-90 saturate-75" : "";

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border bg-zinc-900/70 p-3 ${ownedStyles} ${unownedStyles}`}
    >
      <Image
        src={bungieIconUrl(item.iconPath)}
        alt={item.name}
        width={60}
        height={60}
        className="h-[60px] w-[60px] rounded-md bg-zinc-950 object-cover"
        unoptimized
      />
      <div className="w-full text-center">
        <p className="line-clamp-2 text-xs font-medium text-zinc-100">
          {item.name}
        </p>
        <p className="mt-0.5 text-[10px] text-zinc-500">{item.itemType}</p>
        <p className="mt-1 text-xs font-semibold text-sky-300">
          {item.brightDustCost.toLocaleString()} Bright Dust
        </p>
      </div>
    </div>
  );
}
