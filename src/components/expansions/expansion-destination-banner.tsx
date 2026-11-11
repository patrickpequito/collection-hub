import Link from "@/components/app-link";
import { DESTINATIONS, destinationImageUrl } from "@/data/destinations";
import { loadDestinationWeekly } from "@/lib/destinations/weekly";
import { loadPathfinderBoard, pathfinderOverthrowRegions } from "@/lib/destinations/pathfinder";

/**
 * Expansion page · Destination section: banner linking to the destination page, in the
 * destination's colours (same as its This week cards), with this week's rotations.
 */

type BannerTheme = {
  accent: string;
  border: string;
  glow: string;
  /** Left-to-right wash over the art (keeps the name readable). */
  wash: string;
  nameGlow: string;
  /** Replaces the destination art (e.g. Europa's red lab, tinted ice blue). */
  image?: string;
};

const THEMES: Record<string, BannerTheme> = {
  // Pale, luminous Traveler light over the Witness's dark.
  "the-pale-heart": {
    accent: "#e9d8a6",
    border: "rgba(233,216,166,0.85)",
    glow: "0 0 16px rgba(233,216,166,0.28)",
    wash: "linear-gradient(90deg, rgba(14,12,18,0.95) 25%, rgba(14,12,18,0.35) 65%, rgba(233,216,166,0.08))",
    nameGlow: "0 0 12px rgba(255,244,214,0.65)",
  },
  neomuna: {
    accent: "#ff7bf5",
    border: "#ff3df2",
    glow: "0 0 16px rgba(255,61,242,0.35)",
    wash: "linear-gradient(90deg, rgba(11,6,32,0.95) 25%, rgba(11,6,32,0.35) 65%, rgba(61,240,255,0.08))",
    nameGlow: "0 0 10px #3df0ff",
  },
  "throne-world": {
    accent: "#b8e04a",
    border: "#b8e04a",
    glow: "0 0 14px rgba(184,224,74,0.22)",
    wash: "linear-gradient(90deg, rgba(12,20,11,0.95) 25%, rgba(12,20,11,0.35) 65%, rgba(184,224,74,0.06))",
    nameGlow: "0 0 12px rgba(184,224,74,0.55)",
  },
  europa: {
    accent: "#8fc4ff",
    border: "rgba(210,230,255,0.85)",
    glow: "inset 0 0 18px rgba(143,196,255,0.22)",
    wash: "linear-gradient(90deg, rgba(10,20,34,0.95) 25%, rgba(10,20,34,0.35) 65%, rgba(143,196,255,0.06))",
    nameGlow: "0 0 14px rgba(143,196,255,0.75)",
    image: "/images/destinations/weekly/europa-eclipsed-zone.webp",
  },
  "the-moon": {
    accent: "#ff3b3b",
    border: "rgba(255,59,59,0.85)",
    glow: "0 0 16px rgba(200,16,46,0.35)",
    wash: "linear-gradient(90deg, rgba(13,5,7,0.95) 25%, rgba(13,5,7,0.35) 65%, rgba(200,16,46,0.08))",
    nameGlow: "0 0 12px rgba(255,40,40,0.8), 0 0 26px rgba(200,16,46,0.6)",
  },
};

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
