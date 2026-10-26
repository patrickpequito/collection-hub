"use client";

import { ActivityCard } from "@/components/activities/activity-card";
import { DestinationCard } from "@/components/destinations/destination-card";
import { useOwnership } from "@/components/client-ownership";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { ProgressLine } from "@/components/home/home-progress";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import type { DestinationCardData } from "@/lib/destinations/load";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";
import { isProfileRecordComplete } from "@/lib/triumphs/record-progress";
import { sealProgress } from "@/lib/triumphs/seal-progress";
import { useDestinationReputation } from "@/lib/use-destination-reputation";
import { useSignedIn } from "@/lib/use-signed-in";

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-2.5">
        <h2 className="text-[26px] font-semibold uppercase tracking-[0.06em] text-bone">{title}</h2>
        {note ? <span className="ui-label">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function DestinationsIndex({ destinations }: { destinations: DestinationCardData[] }) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();
  const ranks = useDestinationReputation();

  const lootOwned = (entry: DestinationCardData) => countOwnedGroups(entry.lootGroups, ownedItemHashes);
  const triumphsDone = (entry: DestinationCardData) =>
    entry.triumphHashes.filter((hash) => isProfileRecordComplete(instances[hash])).length;

  const active = destinations.filter((entry) => !entry.vaulted);
  const vaulted = destinations.filter((entry) => entry.vaulted);
  const seals = active.flatMap((entry) => (entry.seal ? [entry.seal] : []));
  const lootTotal = active.reduce((sum, entry) => sum + entry.lootGroups.length, 0);
  const triumphTotal = active.reduce((sum, entry) => sum + entry.triumphHashes.length, 0);

  const withReputation = active.filter((entry) => entry.reputationVendor);
  const maxedRanks = ranks
    ? withReputation.filter((entry) => {
        const rank = ranks[entry.slug];
        return rank && rank.levelCap > 0 && rank.level >= rank.levelCap;
      }).length
    : null;

  const card = (entry: DestinationCardData, size: "lg" | "md") => {
    const rank = ranks?.[entry.slug];
    return (
      <DestinationCard
        key={entry.slug}
        href={entry.built ? `/activities/destinations/${entry.slug}` : undefined}
        name={entry.name}
        era={entry.era}
        imageUrl={entry.imageUrl}
        iconPath={entry.iconPath}
        size={size}
        chip={entry.reputationVendor && rank ? `${entry.reputationVendor} · Rank ${rank.level}` : null}
      >
        {showOwnership ? (
          <ProgressLine label="Loot" owned={lootOwned(entry)} total={entry.lootGroups.length} />
        ) : (
          <span className="text-xs text-ash">{entry.lootGroups.length} items</span>
        )}
        {entry.triumphHashes.length ? (
          signedIn ? (
            <ProgressLine label="Triumphs" owned={triumphsDone(entry)} total={entry.triumphHashes.length} />
          ) : (
            <span className="text-xs text-ash">{entry.triumphHashes.length} triumphs</span>
          )
        ) : null}
      </DestinationCard>
    );
  };

  return (
    <div className="space-y-12">
      <StatBlockGrid count={4}>
        <StatBlock label="Destination loot">
          <StatCount
            owned={showOwnership ? active.reduce((sum, entry) => sum + lootOwned(entry), 0) : null}
            total={lootTotal}
            gold
          />
        </StatBlock>
        <StatBlock label="Destination triumphs">
          <StatCount
            owned={signedIn ? active.reduce((sum, entry) => sum + triumphsDone(entry), 0) : null}
            total={triumphTotal}
          />
        </StatBlock>
        <StatBlock label="Reputation ranks maxed">
          <StatCount owned={maxedRanks} total={withReputation.length} />
        </StatBlock>
        <StatBlock label="Destination titles">
          <StatCount
            owned={signedIn ? seals.filter((seal) => sealProgress(seal, instances).tier !== "none").length : null}
            total={seals.length}
          />
        </StatBlock>
      </StatBlockGrid>

      <Section title="Destinations">
        <div className="grid gap-3 sm:grid-cols-2">{active.slice(0, 2).map((entry) => card(entry, "lg"))}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{active.slice(2).map((entry) => card(entry, "md"))}</div>
      </Section>

      <Section title="Vaulted destinations" note="Expected to return">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {vaulted.map((entry) => (
            <div key={entry.slug} className="relative grayscale [&>div:first-child]:min-h-[125px]">
              <ActivityCard
                title={entry.name}
                label={`${entry.era} · ${entry.lootGroups.length} items`}
                imageUrl={entry.imageUrl}
                size="sm"
                muted
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
