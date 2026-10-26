"use client";

import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { DestinationReputationInfo } from "@/lib/destinations/load";
import { useDestinationReputation } from "@/lib/use-destination-reputation";
import { useSignedIn } from "@/lib/use-signed-in";

/** Vendor rank ladder: icon, current rank name, one segment per rank, resets. */
export function DestinationReputation({ slug, info }: { slug: string; info: DestinationReputationInfo }) {
  const signedIn = useSignedIn();
  const ranks = useDestinationReputation();
  const rank = ranks?.[slug];
  const level = rank ? Math.min(rank.level, info.maxRank) : null;
  const maxed = level !== null && level >= info.maxRank;
  // Rank emblem + name for the current level (rank 0 while signed out).
  const step = info.steps.length ? info.steps[Math.min(level ?? 0, info.steps.length - 1)] : null;
  const rankName = level !== null ? (step?.name ?? null) : null;

  return (
    <div className="ui-panel grid items-center gap-5 p-4 sm:grid-cols-[72px_minmax(0,1fr)]">
      {step?.icon ? (
        <Image
          src={bungieIconUrl(step.icon)}
          alt=""
          width={72}
          height={72}
          className={`hidden size-[72px] sm:block ${level === null ? "opacity-40 grayscale" : ""}`}
          unoptimized
        />
      ) : (
        <span className="hidden sm:block" />
      )}
      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-[22px] font-semibold uppercase leading-tight tracking-[0.04em] text-bone">
            {info.vendor}
          </span>
          <span className={`font-display text-lg tabular-nums ${maxed ? "text-owned" : "text-bone"}`}>
            {rank ? `Rank ${rank.level} / ${info.maxRank}` : `— / ${info.maxRank}`}
          </span>
        </div>
        <div className="flex gap-[3px]" aria-hidden>
          {Array.from({ length: info.maxRank }, (_, index) => (
            <span
              key={index}
              className={`h-2 flex-1 ${
                level !== null && index < level ? (maxed ? "bg-owned" : "bg-bone") : "bg-white/[0.12]"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[13px] text-ash">
          <span>
            {!signedIn
              ? "Sign in to see your rank"
              : rankName
                ? `${maxed ? "Max rank reached · " : ""}${rankName}`
                : "Loading your rank…"}
          </span>
          {rank && rank.resets > 0 ? (
            <span>
              Reset {rank.resets} time{rank.resets === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
