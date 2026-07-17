"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [hydratedInstances, setHydratedInstances] = useState<
    Record<string, RecordInstance>
  >({});
  const [hydrateError, setHydrateError] = useState<string | null>(null);

  useEffect(() => {
    if (recordInstancesProp) return;
    if (!signedIn) return;

    let cancelled = false;
    fetch("/api/triumphs/profile", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          recordInstances: Record<string, RecordInstance>;
          error: string | null;
        };
        if (cancelled) return;
        setHydratedInstances(payload.recordInstances ?? {});
        setHydrateError(payload.error);
      })
      .catch((error) => {
        if (cancelled) return;
        setHydrateError(
          error instanceof Error
            ? error.message
            : "Failed to load triumph progress",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [recordInstancesProp, signedIn]);

  const recordInstances = useMemo(
    () => recordInstancesProp ?? (signedIn ? hydratedInstances : {}),
    [recordInstancesProp, signedIn, hydratedInstances],
  );
  const showProgress =
    showProgressProp ?? (signedIn && !hydrateError);

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
      {hydrateError && signedIn ? (
        <p className="text-xs text-amber-200/80">
          Progress unavailable: {hydrateError}
        </p>
      ) : !signedIn && !recordInstancesProp ? (
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
