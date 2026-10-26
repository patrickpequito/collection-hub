"use client";

import { BoxHeading, SectionHeading } from "@/components/detail-page-parts";
import { useMemo } from "react";
import { useOwnership } from "@/components/client-ownership";
import {
  useProfileChecklists,
  useProfileRecordInstances,
} from "@/components/profile-progress-provider";
import { ActivityCurrentLootPanel } from "@/components/activity-current-loot-panel";
import { CompletionMark } from "@/components/expansions/completion-mark";
import { useSignedIn } from "@/lib/use-signed-in";
import { isRecordRedeemed } from "@/lib/triumphs/record-progress";
import type {
  ExpansionLostSector,
  ExpansionRegionChest,
} from "@/lib/expansions/resolve-expansion-loot";
import type { ActivityArmorRow, LootItem } from "@/types/activity-loot";
import type { RecordInstance } from "@/types/triumph";

type ExpansionDestinationPanelProps = {
  destinationTitle: string;
  destinationActivityTitle: string;
  destinationActivitySlug: string;
  armorRows: ActivityArmorRow[];
  weapons: LootItem[];
  previewFiles?: string[];
  itemHrefs?: Record<string, string>;
  regionChestsChecklistHash: string;
  regionChests: ExpansionRegionChest[];
  lostSectorsChecklistHash: string;
  lostSectorsDiscoveryRecordHash: string;
  lostSectors: ExpansionLostSector[];
  featuredLostSectorName: string | null;
};

function objectiveComplete(
  instance: RecordInstance | undefined,
  objectiveHash: string,
): boolean | null {
  if (!instance) return null;
  const objective = instance.objectives?.find(
    (entry) => entry.objectiveHash === objectiveHash,
  );
  if (!objective) return null;
  return objective.progress >= objective.completionValue;
}

function recordComplete(
  recordHash: string,
  instances: Record<string, RecordInstance>,
  signedIn: boolean,
): boolean | null {
  if (!signedIn) return null;
  const instance = instances[recordHash];
  if (!instance) return false;
  if (isRecordRedeemed(instance.state)) return true;
  const objectives = instance.objectives ?? [];
  if (objectives.length === 0) return false;
  return objectives.every(
    (objective) =>
      Boolean(objective.complete) ||
      objective.progress >= objective.completionValue,
  );
}

export function ExpansionDestinationPanel({
  destinationTitle,
  destinationActivityTitle,
  destinationActivitySlug,
  armorRows,
  weapons,
  previewFiles,
  itemHrefs,
  regionChestsChecklistHash,
  regionChests,
  lostSectorsChecklistHash: _lostSectorsChecklistHash,
  lostSectorsDiscoveryRecordHash,
  lostSectors,
  featuredLostSectorName,
}: ExpansionDestinationPanelProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const signedIn = useSignedIn();
  const hasLoot = armorRows.length > 0 || weapons.length > 0;
  const hasRegionChests = regionChests.length > 0;
  const hasLostSectors = lostSectors.length > 0;
  const instances = useProfileRecordInstances();
  const checklists = useProfileChecklists(hasRegionChests);

  const regionChecklist = checklists[regionChestsChecklistHash] ?? {};
  const discoveryInstance = instances[lostSectorsDiscoveryRecordHash];

  const lostSectorRows = useMemo(
    () =>
      lostSectors.map((sector) => ({
        sector,
        featured: featuredLostSectorName === sector.name,
        normal: signedIn
          ? objectiveComplete(discoveryInstance, sector.discoveryObjectiveHash)
          : null,
        expert: recordComplete(sector.expertRecordHash, instances, signedIn),
        master: recordComplete(sector.masterRecordHash, instances, signedIn),
        grandmaster: recordComplete(
          sector.grandmasterRecordHash,
          instances,
          signedIn,
        ),
      })),
    [
      discoveryInstance,
      featuredLostSectorName,
      instances,
      lostSectors,
      signedIn,
    ],
  );

  if (!hasLoot && !hasRegionChests && !hasLostSectors) {
    return (
      <section className="min-w-0 space-y-3">
        <div>
          <SectionHeading title={destinationTitle.replace(" // ", " · ")} />
          <p className="text-sm text-zinc-400">
            Destination loot and checklists will appear here as they are
            curated for this expansion.
          </p>
        </div>
      </section>
    );
  }


  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title={destinationTitle.replace(" // ", " · ")} />

      {hasLoot ? (
        <ActivityCurrentLootPanel
          activitySlug={destinationActivitySlug}
          activityTitle={destinationActivityTitle}
          armorRows={armorRows}
          previewFiles={previewFiles}
          weapons={weapons}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
          itemHrefs={itemHrefs}
        />
      ) : null}

      {hasRegionChests || hasLostSectors ? (
      <div className={`grid items-start gap-3 ${hasRegionChests && hasLostSectors ? "lg:grid-cols-3" : ""}`}>
      {hasRegionChests ? (
        <div className="space-y-3 border border-hairline bg-panel/85 p-3 sm:p-4">
          <BoxHeading
            title="Region chests"
            note={
              signedIn
                ? `${regionChests.filter((chest) => regionChecklist[chest.entryHash]).length} / ${regionChests.length}`
                : regionChests.length
            }
          />
          <ul>
            {regionChests.map((chest) => {
              const done = signedIn
                ? Boolean(regionChecklist[chest.entryHash])
                : null;
              return (
                <li
                  key={chest.entryHash}
                  className="flex items-center justify-between gap-3 border-b border-white/[0.08] py-2.5 last:border-0"
                >
                  <span className="text-sm text-zinc-200">{chest.label}</span>
                  <CompletionMark complete={done} />
                </li>
              );
            })}
          </ul>
          {!signedIn ? (
            <p className="text-xs text-zinc-500">
              Sign in to track region chests.
            </p>
          ) : null}
        </div>
      ) : null}

      {hasLostSectors ? (
        <div className={`space-y-3 border border-hairline bg-panel/85 p-3 sm:p-4 ${hasRegionChests ? "lg:col-span-2" : ""}`}>
          <BoxHeading title="Lost sectors" note={lostSectors.length} />
          <ul>
            {lostSectorRows.map(
              ({
                sector,
                featured,
                normal,
                expert,
                master,
                grandmaster,
              }) => (
                <li
                  key={sector.name}
                  className={`border-b py-2.5 last:border-0 ${
                    featured
                      ? "border-seasonal/60 bg-seasonal/10 px-2"
                      : "border-white/[0.08]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {sector.name}
                      </span>
                      {featured ? (
                        <span className="border border-seasonal/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7fe0df]">
                          Daily featured
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <CompletionMark complete={normal} label="Normal" />
                      <CompletionMark complete={expert} label="Expert" />
                      <CompletionMark complete={master} label="Master" />
                      <CompletionMark complete={grandmaster} label="Flawless Solo Mastery" />
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      </div>
      ) : null}
    </section>
  );
}
