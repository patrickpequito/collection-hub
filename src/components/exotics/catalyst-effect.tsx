import { bungieIconUrl } from "@/lib/bungie-icon";
import type { ExoticCatalystEntry } from "@/lib/exotics/page-data";

/** What a catalyst does: perk icon, name and description. */
export function CatalystEffect({ catalyst, compact = false }: { catalyst: ExoticCatalystEntry; compact?: boolean }) {
  if (!catalyst.effect) {
    return <p className="text-xs text-ash">Masterworks the weapon.</p>;
  }
  return (
    <div className="flex gap-2.5 border-y border-white/[0.08] py-2.5">
      {catalyst.effect.iconPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bungieIconUrl(catalyst.effect.iconPath)}
          alt=""
          width={compact ? 24 : 32}
          height={compact ? 24 : 32}
          className={`${compact ? "size-6" : "size-8"} shrink-0 rounded-full border border-owned/50 bg-panel`}
        />
      ) : null}
      <div className="min-w-0">
        <p className="text-[13px] text-owned">{catalyst.effect.name}</p>
        <p className="text-xs leading-snug text-bone/75">{catalyst.effect.description}</p>
      </div>
    </div>
  );
}

