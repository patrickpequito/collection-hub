import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ExoticArmorPerk } from "@/types/all-loot";

type ExoticPerkPanelProps = {
  perk: ExoticArmorPerk | null;
  unavailableMessage?: string;
};

export function ExoticPerkPanel({
  perk,
  unavailableMessage = "Exotic perk data is not available yet.",
}: ExoticPerkPanelProps) {
  if (!perk) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-500">
        {unavailableMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Exotic Perk
      </h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex gap-3">
          {perk.iconPath ? (
            <Image
              src={bungieIconUrl(perk.iconPath)}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-md border border-zinc-800 bg-zinc-950 object-cover"
              unoptimized
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md border border-zinc-800 bg-zinc-950" />
          )}
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
              {perk.name}
            </p>
            <p className="text-[11px] leading-snug text-zinc-300">
              {perk.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
