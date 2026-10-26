"use client";

import { useMemo, type ReactNode } from "react";
import { useActivitiesProgress } from "@/components/activities/activities-progress-provider";
import { useOwnership } from "@/components/client-ownership";
import { StatBlock } from "@/components/detail-page-parts";
import { ProgressBar } from "@/components/home/progress-bar";
import {
  useProfileRaidCompletions,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import { countTitleProgress, countTriumphProgress } from "@/lib/triumphs/record-progress";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { useSignedIn } from "@/lib/use-signed-in";
import type { TitleEntry, TriumphRecord } from "@/types/triumph";

export type ActivityExotic = { name: string; iconPath: string; hashes: string[] };

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-[13px] text-ash">{children}</span>;
}

/** Top-of-page summary: total loot, title progress, clears and the exotic. */
export function ActivityStatBlocks({
  slug,
  title,
  titleRecords,
  titleLabel,
  showClears,
  hasMasterTier,
  exotics,
}: {
  slug: string;
  title: TitleEntry | null;
  /** Records toward the title (or the activity's triumphs when it has none). */
  titleRecords: TriumphRecord[];
  titleLabel: string;
  showClears: boolean;
  /** Show Normal and Master clears side by side. */
  hasMasterTier: boolean;
  exotics: ActivityExotic[];
}) {
  const signedIn = useSignedIn();
  const { progress } = useActivitiesProgress();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const recordInstances = useProfileRecordInstances();
  const raidCompletionsBySlug = useProfileRaidCompletions();

  const loot = progress?.[slug]?.total;

  const titleProgress = useMemo(() => {
    const instances = new Map(Object.entries(signedIn ? recordInstances : {}));
    return title
      ? countTitleProgress({ ...title, records: titleRecords }, instances).base
      : countTriumphProgress(titleRecords, instances);
  }, [recordInstances, signedIn, title, titleRecords]);

  const clears = signedIn ? raidCompletionsBySlug[slug] : undefined;
  const showTitle = titleProgress.total > 0;
  const blocks = 1 + (showTitle ? 1 : 0) + (showClears ? 1 : 0) + (exotics.length > 0 ? 1 : 0);
  const columns = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[
    blocks
  ];

  return (
    <section className={`grid gap-3 ${columns}`}>
      <StatBlock label="Loot">
        {loot ? (
          <>
            <span className="font-display text-[30px] leading-none text-owned">
              {loot.owned} / {loot.total}
            </span>
            <ProgressBar owned={loot.owned} total={loot.total} />
          </>
        ) : (
          <>
            <span className="font-display text-[30px] leading-none text-ash">—</span>
            <Muted>{signedIn ? "Loading your collection…" : "Sign in to track"}</Muted>
          </>
        )}
      </StatBlock>

      {showTitle ? (
        <StatBlock label={titleLabel}>
          <span className="font-display text-[30px] leading-none text-bone">
            {signedIn ? titleProgress.completed : "—"} / {titleProgress.total}
          </span>
          <ProgressBar
            owned={signedIn ? titleProgress.completed : 0}
            total={titleProgress.total}
          />
        </StatBlock>
      ) : null}

      {showClears ? (
        <StatBlock label="Clears">
          {hasMasterTier ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-[30px] leading-none text-bone">
                  {clears ? clears.normal.toLocaleString() : "—"}
                </span>
                <span className="font-display text-xs uppercase tracking-[0.16em] text-ash">
                  Normal
                </span>
              </div>
              <div className="flex flex-col gap-1.5 border-l border-hairline pl-3">
                <span className="font-display text-[30px] leading-none text-owned">
                  {clears ? clears.master.toLocaleString() : "—"}
                </span>
                <span className="font-display text-xs uppercase tracking-[0.16em] text-owned/80">
                  Master
                </span>
              </div>
            </div>
          ) : (
            <>
              <span className="font-display text-[30px] leading-none text-bone">
                {clears ? clears.normal.toLocaleString() : "—"}
              </span>
              <Muted>Full completions</Muted>
            </>
          )}
          {!signedIn ? <Muted>Sign in to track</Muted> : null}
        </StatBlock>
      ) : null}

      {exotics.length > 0 ? (
        <StatBlock label={exotics.length > 1 ? "Exotic weapons" : "Exotic weapon"}>
          <ul className="space-y-2.5">
            {exotics.map((exotic) => {
              const owned = exotic.hashes.some((hash) => ownedItemHashes.has(hash));
              return (
                <li key={exotic.name} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bungieIconUrl(exotic.iconPath)}
                    alt=""
                    width={48}
                    height={48}
                    className={`size-12 shrink-0 ${
                      showOwnership && owned
                        ? "border-2 border-owned"
                        : "border border-white/20"
                    }`}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display text-lg font-semibold uppercase leading-tight tracking-[0.04em] text-bone">
                      {exotic.name}
                    </span>
                    {showOwnership ? (
                      <span className={`text-[13px] ${owned ? "text-owned" : "text-ash"}`}>
                        {owned ? "Owned" : "Not owned"}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </StatBlock>
      ) : null}
    </section>
  );
}
