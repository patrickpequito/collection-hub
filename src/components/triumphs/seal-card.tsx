import Link from "@/components/app-link";
import { PinIcon } from "@/components/pin-icon";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SealSummary } from "@/lib/triumphs/hub";
import type { sealProgress } from "@/lib/triumphs/seal-progress";

type Progress = ReturnType<typeof sealProgress>;

/** Seal in the hub grid: grey until earned (like in game), gold title when earned, gold frame when gilded. */
export function SealCard({
  seal,
  progress,
  pinned = false,
}: {
  seal: SealSummary;
  progress: Progress | null;
  pinned?: boolean;
}) {
  const earned = progress ? progress.tier !== "none" : true;
  const gilded = progress?.tier === "gilded";
  const percent = progress && progress.base.total ? (progress.base.completed / progress.base.total) * 100 : 0;
  return (
    <Link
      href={`/triumphs/title/${seal.slug}`}
      title={seal.name}
      className={`group relative flex flex-col items-center gap-1.5 px-1.5 pb-2.5 pt-3 text-center transition hover:bg-white/[0.05] ${
        gilded ? "bg-owned/[0.07] shadow-[inset_0_0_0_1px_#c9a227,0_0_16px_rgba(201,162,39,0.25)]" : ""
      }`}
    >
      {seal.gildingHashes.length > 0 ? (
        <span aria-label="Gildable" className="absolute left-2 top-2 size-[7px] rotate-45 border border-owned" />
      ) : null}
      {pinned || (gilded && progress.gildCount > 0) ? (
        <span className="absolute right-1.5 top-1.5 flex items-center gap-1 font-display text-[11px] text-owned">
          {gilded && progress.gildCount > 0 ? `×${progress.gildCount}` : null}
          {pinned ? <PinIcon className="size-3" /> : null}
        </span>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bungieIconUrl(seal.iconPath)}
        alt=""
        width={76}
        height={76}
        className={`size-[76px] object-contain transition ${
          earned ? "" : "opacity-55 brightness-75 grayscale group-hover:opacity-80"
        }`}
      />
      <span
        className={`flex min-h-[30px] items-center font-display text-[13px] font-semibold uppercase leading-[1.15] tracking-[0.1em] ${
          progress && earned ? "text-owned" : "text-[#c7cad0]"
        }`}
      >
        {seal.guardianTitle}
      </span>
      {progress ? (
        <span className="block h-[5px] w-[70%] bg-white/10">
          <span
            className={`block h-full ${earned ? "bg-owned" : "bg-bone"}`}
            style={{ width: `${earned ? 100 : percent}%` }}
          />
        </span>
      ) : null}
    </Link>
  );
}

/** Legacy seal: small and white, only shows whether it was earned. */
export function LegacySealCard({ seal, earned }: { seal: SealSummary; earned: boolean | null }) {
  return (
    <Link
      href={`/triumphs/title/${seal.slug}`}
      title={seal.name}
      className="flex flex-col items-center gap-1 px-0.5 py-2 text-center transition hover:bg-white/[0.05]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bungieIconUrl(seal.iconPath)}
        alt=""
        width={44}
        height={44}
        className={`size-11 object-contain grayscale ${
          earned === false ? "opacity-35 brightness-90" : "brightness-[1.7] contrast-[0.9]"
        }`}
      />
      <span
        className={`font-display text-[11px] uppercase leading-[1.1] tracking-[0.08em] ${
          earned === false ? "text-ash" : "text-[#c7cad0]"
        }`}
      >
        {seal.guardianTitle}
      </span>
    </Link>
  );
}
