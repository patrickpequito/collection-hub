import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ArmorSetBonus } from "@/types/armor-set-bonuses";

type ArmorSetBonusesPanelProps = {
  setName: string;
  twoPiece: ArmorSetBonus | null;
  fourPiece: ArmorSetBonus | null;
};

function SetBonusCard({
  requiredCount,
  bonus,
}: {
  requiredCount: number;
  bonus: ArmorSetBonus | null;
}) {
  if (!bonus) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-500">
        No {requiredCount}-piece set bonus for this armor.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex gap-3">
        {bonus.iconPath ? (
          <Image
            src={bungieIconUrl(bonus.iconPath)}
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
            {requiredCount} Piece | {bonus.name}
          </p>
          <p className="text-[11px] leading-snug text-zinc-300">
            {bonus.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ArmorSetBonusesPanel({
  setName,
  twoPiece,
  fourPiece,
}: ArmorSetBonusesPanelProps) {
  if (!twoPiece && !fourPiece) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-500">
        {setName
          ? `${setName} has no set bonus data yet.`
          : "This armor piece is not part of a legendary set."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {setName ? (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {setName} Set Bonuses
        </h2>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <SetBonusCard requiredCount={2} bonus={twoPiece} />
        <SetBonusCard requiredCount={4} bonus={fourPiece} />
      </div>
    </div>
  );
}
