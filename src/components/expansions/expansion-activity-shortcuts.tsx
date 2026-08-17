import { ActivityBannerSmall } from "@/components/activity-banner-small";
import { DUNGEONS, RAIDS } from "@/data/rad-loot/activities";
import type { ActivityEntry } from "@/types/activity-loot";

type ExpansionActivityShortcutsProps = {
  slugs: readonly string[];
  blurb: string;
};

function findActivity(slug: string): ActivityEntry | undefined {
  return (
    RAIDS.find((entry) => entry.slug === slug) ??
    DUNGEONS.find((entry) => entry.slug === slug)
  );
}

export function ExpansionActivityShortcuts({
  slugs,
  blurb,
}: ExpansionActivityShortcutsProps) {
  const entries = slugs
    .map((slug) => findActivity(slug))
    .filter((entry): entry is ActivityEntry => Boolean(entry));

  if (entries.length === 0) return null;

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">
          Raids &amp; Dungeons
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{blurb}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {entries.map((entry) => (
          <ActivityBannerSmall key={entry.slug} entry={entry} />
        ))}
      </div>
    </section>
  );
}
