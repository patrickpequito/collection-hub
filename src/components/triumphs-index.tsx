"use client";

import { useMemo } from "react";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { TriumphProgressBanner } from "@/components/triumph-progress-banner";
import { useSignedIn } from "@/lib/use-signed-in";
import { resolveTriumphIcon } from "@/lib/triumphs/icons";
import {
  countTitleProgress,
  countTriumphProgress,
  getTitleCompletionTier,
} from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  TitleEntry,
  TriumphCatalog,
} from "@/types/triumph";

type TriumphsIndexProps = {
  catalog: TriumphCatalog;
  /** When omitted, progress loads client-side if the user is signed in. */
  recordInstances?: Record<string, RecordInstance>;
  showProgress?: boolean;
};

function TitleList({
  titles,
  instances,
  showProgress,
}: {
  titles: TitleEntry[];
  instances: Map<string, RecordInstance>;
  showProgress: boolean;
}) {
  return (
    <div className="space-y-2">
      {titles.map((title) => {
        const { all } = countTitleProgress(title, instances);
        const iconPath = resolveTriumphIcon(title.iconPath, title.records);
        const titleTier = showProgress
          ? getTitleCompletionTier(title, instances)
          : "none";

        return (
          <TriumphProgressBanner
            key={title.slug}
            href={`/triumphs/title/${title.slug}`}
            name={title.name}
            iconPath={iconPath}
            progress={all}
            titleTier={titleTier}
          />
        );
      })}
    </div>
  );
}

export function TriumphsIndex({
  catalog,
  recordInstances: recordInstancesProp,
  showProgress: showProgressProp,
}: TriumphsIndexProps) {
  const signedIn = useSignedIn();
  const profileInstances = useProfileRecordInstances();

  const recordInstances = useMemo(
    () => recordInstancesProp ?? (signedIn ? profileInstances : {}),
    [recordInstancesProp, signedIn, profileInstances],
  );
  const showProgress = showProgressProp ?? signedIn;

  const instances = useMemo(
    () => new Map(Object.entries(recordInstances)),
    [recordInstances],
  );
  const permanentTitles = catalog.titles.filter((title) => !title.isSeasonal);
  const seasonalTitles = catalog.titles
    .filter((title) => title.isSeasonal)
    .sort((a, b) => b.sortOrder - a.sortOrder);

  return (
    <div className="space-y-4">
      {!signedIn && !recordInstancesProp ? (
        <p className="text-xs text-amber-200/80">
          Sign in to see triumph and title progress.
        </p>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Triumphs
          </h2>
          <div className="space-y-2">
            {catalog.groups.map((group) => {
              const progress = countTriumphProgress(group.records, instances);
              const iconPath = resolveTriumphIcon(group.iconPath, group.records);

              return (
                <TriumphProgressBanner
                  key={group.slug}
                  href={`/triumphs/group/${group.slug}`}
                  name={group.name}
                  iconPath={iconPath}
                  progress={progress}
                  largeIcon
                />
              );
            })}
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Permanent Titles
            </h2>
            <TitleList
              titles={permanentTitles}
              instances={instances}
              showProgress={Boolean(showProgress)}
            />
          </div>

          {seasonalTitles.length > 0 ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Seasonal Titles
              </h2>
              <TitleList
                titles={seasonalTitles}
                instances={instances}
                showProgress={Boolean(showProgress)}
              />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
