import Image from "next/image";
import { ACTIVITY_LOOT_PANEL_CLASS } from "@/components/activity-current-loot-panel";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { TrialsFeaturedMapsResult } from "@/lib/activities/trials-featured-maps";
import { formatTrialsWeekRange } from "@/lib/activities/trials-featured-maps";

type TrialsFeaturedMapsSectionProps = {
  featuredMaps: TrialsFeaturedMapsResult;
};

export function TrialsFeaturedMapsSection({
  featuredMaps,
}: TrialsFeaturedMapsSectionProps) {
  if (featuredMaps.maps.length === 0) return null;

  return (
    <section className={ACTIVITY_LOOT_PANEL_CLASS}>
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-medium text-zinc-300">
          Featured maps this weekend
        </h3>
        <p className="text-xs text-zinc-500">
          {formatTrialsWeekRange(
            featuredMaps.weekStart,
            featuredMaps.weekEnd,
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {featuredMaps.maps.map((map) => (
          <div key={map.name} className="min-w-0 text-center">
            <p className="text-sm font-medium text-zinc-100">{map.name}</p>
            <div className="relative mt-3 aspect-[21/9] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
              <Image
                src={bungieIconUrl(map.imagePath)}
                alt={map.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
