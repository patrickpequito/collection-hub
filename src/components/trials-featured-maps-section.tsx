import Image from "next/image";
import { ACTIVITY_LOOT_PANEL_CLASS, PanelHeading } from "@/components/activity-current-loot-panel";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { TrialsFeaturedMapsResult } from "@/lib/activities/trials-featured-maps";
import { formatTrialsWeekRange } from "@/lib/activities/trials-featured-maps";

type TrialsFeaturedMapsSectionProps = {
  featuredMaps: TrialsFeaturedMapsResult;
  heading?: string;
};

export function TrialsFeaturedMapsSection({
  featuredMaps,
  heading = "Featured maps",
}: TrialsFeaturedMapsSectionProps) {
  const range = formatTrialsWeekRange(featuredMaps.weekStart, featuredMaps.weekEnd);

  if (featuredMaps.maps.length === 0) {
    if (featuredMaps.source !== "iron-banner") return null;

    return (
      <section>
        <PanelHeading title={heading} note={range} />
        <div className={ACTIVITY_LOOT_PANEL_CLASS}>
          <p className="text-sm text-ash">
            Trials of Osiris is paused during Iron Banner. Featured maps return on the next eligible Friday.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <PanelHeading title={heading} note={range} />
      <div className={`${ACTIVITY_LOOT_PANEL_CLASS} grid grid-cols-1 gap-4 sm:grid-cols-3`}>
        {featuredMaps.maps.map((map) => (
          <div key={map.name} className="min-w-0 space-y-2">
            <div className="relative aspect-[21/9] overflow-hidden border border-hairline bg-void">
              <Image
                src={bungieIconUrl(map.imagePath)}
                alt={map.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized
              />
            </div>
            <p className="font-display text-sm uppercase tracking-[0.1em] text-bone">{map.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
