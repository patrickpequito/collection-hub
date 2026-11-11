import Link from "@/components/app-link";
import { DESTINATIONS, destinationImageUrl } from "@/data/destinations";
import { loadDestinationWeekly } from "@/lib/destinations/weekly";
import { DESTINATION_BANNER_THEMES as THEMES } from "@/lib/destinations/banner-themes";
import { loadPathfinderBoard, pathfinderOverthrowRegions } from "@/lib/destinations/pathfinder";

/**
 * Expansion page · Destination section: banner linking to the destination page, in the
 * destination's colours (same as its This week cards), with this week's rotations.
 */

/** Banner chip labels (the destination page uses the longer ones). */
const SHORT_LABEL: Record<string, string> = {
  "Altars of Reflection": "Altars",
  "The Wellspring": "Wellspring",
};

export async function ExpansionDestinationBanner({ slug }: { slug: string }) {
  const destination = DESTINATIONS.find((entry) => entry.slug === slug);
  const theme = THEMES[slug];
  if (!destination?.built || !theme) return null;

  const weekly = (await loadDestinationWeekly(destination)).slice(0, 3).map((activity) => {
    const label = activity.label.replace(/\s*·\s*today$/i, "");
    return { label: SHORT_LABEL[label] ?? label, name: activity.name };
  });
  // Pale Heart: the Pathfinder board's Overthrow regions for the week.
  if (slug === "the-pale-heart") {
    const board = await loadPathfinderBoard();
    const regions = board ? pathfinderOverthrowRegions(board) : [];
    if (regions.length) weekly.push({ label: "Pathfinder · Overthrow", name: regions.join(" · ") });
  }

  return (
    <Link
      href={`/activities/destinations/${slug}`}
      className="group relative flex min-h-[132px] flex-col justify-center gap-4 overflow-hidden border px-5 py-4 sm:flex-row sm:items-center sm:justify-start sm:gap-[26px] sm:px-[26px]"
      style={{ borderColor: theme.border, boxShadow: theme.glow }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={theme.image ?? destinationImageUrl(destination)}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[50%_45%] transition duration-300 group-hover:scale-[1.02]"
      />
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: theme.wash }} />

      <div className="relative sm:w-[260px] sm:shrink-0">
        <div className="font-display text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
          Destination
        </div>
        <div
          className="font-display text-[34px] font-semibold uppercase leading-none tracking-[0.04em] text-white sm:text-[38px]"
          style={{ textShadow: theme.nameGlow }}
        >
          {destination.name}
        </div>
        <div className="mt-2 font-display text-[11px] uppercase tracking-[0.18em] text-[#c7cad0] transition group-hover:text-white">
          Open destination →
        </div>
      </div>

      {weekly.length ? (
        <div className="relative flex min-w-0 flex-col gap-1.5">
          <span className="font-display text-[10px] uppercase tracking-[0.18em] text-[#c7cad0]">This week</span>
          <div className="flex flex-wrap gap-2">
            {weekly.map((activity, index) => (
              <div
                key={`${activity.label}-${index}`}
                className="flex flex-col gap-[3px] border-l-2 bg-void/55 px-3 py-2"
                style={{ borderColor: theme.accent }}
              >
                <span className="font-display text-[10px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                  {activity.label}
                </span>
                <span className="font-display text-base font-semibold uppercase tracking-[0.04em] text-white">
                  {activity.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Link>
  );
}
