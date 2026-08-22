"use client";

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
  ExpansionWellspringBoss,
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
  wellspringNormalRecordHash: string;
  wellspringMasterRecordHash: string;
  wellspringBosses: ExpansionWellspringBoss[];
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
  wellspringNormalRecordHash,
  wellspringMasterRecordHash,
  wellspringBosses,
}: ExpansionDestinationPanelProps) {
  const { ownedItemHashes, showOwnership } = useOwnership();
  const signedIn = useSignedIn();
  const hasLoot = armorRows.length > 0 || weapons.length > 0;
  const hasRegionChests = regionChests.length > 0;
  const hasLostSectors = lostSectors.length > 0;
  const hasWellspring = wellspringBosses.length > 0;
  const instances = useProfileRecordInstances();
  const checklists = useProfileChecklists(hasRegionChests);

  const regionChecklist = checklists[regionChestsChecklistHash] ?? {};
  const discoveryInstance = instances[lostSectorsDiscoveryRecordHash];
  const normalWellspring = instances[wellspringNormalRecordHash];
  const masterWellspring = instances[wellspringMasterRecordHash];

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

  if (!hasLoot && !hasRegionChests && !hasLostSectors && !hasWellspring) {
    return (
      <section className="min-w-0 space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            {destinationTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Destination loot and checklists will appear here as they are
            curated for this expansion.
          </p>
        </div>
      </section>
    );
  }

  const checklistParts = [
    hasLoot ? "Destination loot" : null,
    hasRegionChests ? "region chests" : null,
    hasLostSectors ? "lost sectors" : null,
    hasWellspring ? "Wellspring encounters" : null,
  ].filter(Boolean);

  return (
    <section className="min-w-0 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">
          {destinationTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {checklistParts.join(", ").replace(/^./, (c) => c.toUpperCase())}.
        </p>
      </div>

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

      {hasRegionChests ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Region chests
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {regionChests.map((chest) => {
              const done = signedIn
                ? Boolean(regionChecklist[chest.entryHash])
                : null;
              return (
                <li
                  key={chest.entryHash}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200">{chest.label}</span>
                  <CompletionMark complete={done} />
                </li>
              );
            })}
          </ul>
          {!signedIn ? (
            <p className="mt-2 text-xs text-zinc-500">
              Sign in to track region chests.
            </p>
          ) : null}
        </div>
      ) : null}

      {hasLostSectors ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Lost sectors
          </h3>
          <p className="mt-2 text-xs text-zinc-500">
            Normal = discovered/cleared. Expert / Master from Solo triumphs. GM
            column uses Flawless Solo Mastery (no dedicated Grandmaster
            triumph).
          </p>
          <ul className="mt-3 space-y-2">
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
                  className={`rounded-lg border px-3 py-3 ${
                    featured
                      ? "border-[#24b4b3] bg-[#24b4b3]/10"
                      : "border-zinc-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {sector.name}
                      </span>
                      {featured ? (
                        <span className="rounded border border-[#24b4b3]/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7fe0df]">
                          Daily featured
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <CompletionMark complete={normal} label="Normal" />
                      <CompletionMark complete={expert} label="Expert" />
                      <CompletionMark complete={master} label="Master" />
                      <CompletionMark complete={grandmaster} label="GM" />
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      {hasWellspring ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            The Wellspring
          </h3>
          <p className="mt-2 text-xs text-zinc-500">
            Four boss encounters — Normal (Defend/Attack) and Master clears.
          </p>
          <ul className="mt-3 space-y-2">
            {wellspringBosses.map((boss) => (
              <li
                key={boss.name}
                className="flex flex-col gap-1 rounded-lg border border-zinc-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-zinc-100">
                  {boss.name}
                </span>
                <div className="flex flex-wrap gap-3">
                  <CompletionMark
                    complete={
                      signedIn
                        ? objectiveComplete(
                            normalWellspring,
                            boss.normalObjectiveHash,
                          )
                        : null
                    }
                    label="Normal"
                  />
                  <CompletionMark
                    complete={
                      signedIn
                        ? objectiveComplete(
                            masterWellspring,
                            boss.masterObjectiveHash,
                          )
                        : null
                    }
                    label="Master"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
