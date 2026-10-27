"use client";

import Link from "@/components/app-link";
import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import type { DestinationTriumphSection } from "@/lib/destinations/load";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SealSummary } from "@/lib/triumphs/hub";
import { countTriumphProgress } from "@/lib/triumphs/record-progress";
import { sealProgress } from "@/lib/triumphs/seal-progress";
import { useSignedIn } from "@/lib/use-signed-in";

/** Summary blocks: loot, triumphs and (when there is one) the destination's seal. */
export function DestinationStatBlocks({
  lootGroups,
  sections,
  seal,
}: {
  lootGroups: string[][];
  sections: DestinationTriumphSection[];
  seal: SealSummary | null;
}) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();
  const instanceMap = useMemo(() => new Map(Object.entries(signedIn ? instances : {})), [instances, signedIn]);
  const records = sections.flatMap((section) => section.records);
  const triumphs = countTriumphProgress(records, instanceMap);
  const sealBase = seal ? sealProgress(seal, signedIn ? instances : {}).base : null;

  return (
    <StatBlockGrid count={1 + (records.length ? 1 : 0) + (seal ? 1 : 0)}>
      <StatBlock label="Destination loot">
        <StatCount owned={showOwnership ? countOwnedGroups(lootGroups, ownedItemHashes) : null} total={lootGroups.length} gold />
      </StatBlock>
      {records.length ? (
        <StatBlock label="Triumphs">
          <StatCount owned={signedIn ? triumphs.completed : null} total={triumphs.total} />
        </StatBlock>
      ) : null}
      {seal && sealBase ? (
        <StatBlock label={`Title · ${seal.guardianTitle}`}>
          <StatCount owned={signedIn ? sealBase.completed : null} total={sealBase.total} />
        </StatBlock>
      ) : null}
    </StatBlockGrid>
  );
}

/** Triumph subcategories with progress, linking into the Triumphs group page, plus the related seal. */
export function DestinationTriumphs({
  sections,
  seal,
}: {
  sections: DestinationTriumphSection[];
  seal: SealSummary | null;
}) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const instanceMap = useMemo(() => new Map(Object.entries(signedIn ? instances : {})), [instances, signedIn]);
  const parents = [...new Set(sections.map((section) => section.parent))];
  const sealState = seal ? sealProgress(seal, signedIn ? instances : {}) : null;
  const earned = signedIn && sealState?.tier !== "none";

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${parents.length > 1 ? "md:grid-cols-2" : ""}`}>
        {parents.map((parent) => (
          <div key={parent} className="ui-panel">
            <p className="ui-label border-b border-white/[0.14] px-4 py-3">{parent}</p>
            {sections
              .filter((section) => section.parent === parent)
              .map((section) => {
                const progress = countTriumphProgress(section.records, instanceMap);
                const complete = signedIn && progress.completed === progress.total;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 border-b border-white/[0.08] px-4 py-2.5 transition last:border-0 hover:bg-white/[0.03]"
                  >
                    <span className="truncate text-[15px] text-bone">{section.name}</span>
                    <span className={`text-xs tabular-nums ${complete ? "text-owned" : "text-[#c7cad0]"}`}>
                      {signedIn ? `${progress.completed}/${progress.total}` : `${progress.total} triumphs`}
                    </span>
                    {signedIn ? (
                      <span className="col-span-2 block h-[3px] bg-white/10">
                        <span
                          className={`block h-full ${complete ? "bg-owned" : "bg-ash"}`}
                          style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }}
                        />
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        ))}
      </div>

      {seal && sealState ? (
        <Link
          href={`/triumphs/title/${seal.slug}`}
          className="ui-panel grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 transition hover:border-bone/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bungieIconUrl(seal.iconPath)}
            alt=""
            width={64}
            height={64}
            className={`size-16 object-contain ${signedIn && !earned ? "opacity-70 grayscale" : ""}`}
          />
          <span className="min-w-0">
            <span className="ui-label block text-[11px]!">Related seal</span>
            <span className={`block font-display text-xl font-semibold uppercase tracking-[0.06em] ${earned ? "text-owned" : "text-bone"}`}>
              {seal.guardianTitle}
            </span>
            <span className="text-xs text-ash">
              {seal.name} seal{signedIn ? ` · ${sealState.base.completed} / ${sealState.base.total}` : ""}
            </span>
          </span>
          <span className="inline-flex min-h-[38px] items-center border border-white/[0.22] px-3.5 font-display text-sm uppercase tracking-[0.12em] text-[#c7cad0]">
            Open seal →
          </span>
        </Link>
      ) : null}
    </div>
  );
}
