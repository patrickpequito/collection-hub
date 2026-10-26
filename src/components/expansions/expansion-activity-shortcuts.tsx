import { SectionHeading } from "@/components/detail-page-parts";
import { ActivitiesProgressProvider } from "@/components/activities/activities-progress-provider";
import { ActivityCard } from "@/components/activities/activity-card";
import { ActivityCardProgress } from "@/components/activities/activity-card-progress";
import { DUNGEONS, RAIDS } from "@/data/rad-loot/activities";
import { activityEraLabel } from "@/data/rad-loot/activity-eras";
import type { ActivityEntry } from "@/types/activity-loot";

type ExpansionActivityShortcutsProps = {
  slugs: readonly string[];
};

function findActivity(slug: string): { entry: ActivityEntry; kind: string } | undefined {
  const raid = RAIDS.find((entry) => entry.slug === slug);
  if (raid) return { entry: raid, kind: "Raid" };
  const dungeon = DUNGEONS.find((entry) => entry.slug === slug);
  return dungeon ? { entry: dungeon, kind: "Dungeon" } : undefined;
}

/** Raids & dungeons from this expansion — same cards as the Activities hub. */
export function ExpansionActivityShortcuts({ slugs }: ExpansionActivityShortcutsProps) {
  const activities = slugs
    .map((slug) => findActivity(slug))
    .filter((found): found is NonNullable<typeof found> => Boolean(found));

  if (activities.length === 0) return null;

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title="Raids & dungeons" />
      <ActivitiesProgressProvider>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {activities.map(({ entry, kind }) => {
            const file = entry.wideImageFile ?? entry.imageFile;
            const era = activityEraLabel(entry.slug);
            return (
              <ActivityCard
                key={entry.slug}
                href={entry.available ? `/activities/${entry.slug}` : undefined}
                title={entry.title}
                label={[kind, era?.split(" · ")[0]].filter(Boolean).join(" · ")}
                imageUrl={file ? `/images/rad-loot/activities/${file}` : undefined}
                size="md"
              >
                <ActivityCardProgress slug={entry.slug} />
              </ActivityCard>
            );
          })}
        </div>
      </ActivitiesProgressProvider>
    </section>
  );
}
