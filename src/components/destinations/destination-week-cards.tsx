import type { CSSProperties } from "react";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { WeeklyActivity } from "@/lib/destinations/weekly";

/**
 * "This week" cards on destination pages: each rotation over its own art (Bungie's activity image,
 * or a screenshot where Bungie has none), with the destination's accent colour and frame.
 */

type CardTheme = { accent: string; border: string; glow?: string };

const THEMES: Record<string, CardTheme> = {
  neomuna: { accent: "#ff7bf5", border: "#ff3df2", glow: "0 0 14px rgba(255,61,242,0.35)" },
  "throne-world": { accent: "#b8e04a", border: "#b8e04a", glow: "0 0 12px rgba(184,224,74,0.22)" },
  europa: { accent: "#8fc4ff", border: "rgba(210,230,255,0.85)", glow: "inset 0 0 18px rgba(143,196,255,0.22)" },
  "the-moon": { accent: "#ff3b3b", border: "rgba(255,59,59,0.85)", glow: "0 0 16px rgba(200,16,46,0.35)" },
  "dreaming-city": { accent: "#bfeaff", border: "rgba(200,240,255,0.6)", glow: "inset 0 0 18px rgba(190,235,255,0.18)" },
};

/** Activities whose look differs from their destination's (by rotation label). */
const ACTIVITY_THEMES: Record<string, CardTheme> = {
  "Vex Incursion Zone": { accent: "#ff5a4f", border: "rgba(244,241,234,0.5)", glow: "inset 0 0 0 1px rgba(255,59,48,0.2)" },
  "Terminal Overload · today": { accent: "#ffb27a", border: "#ff8a2a" },
  "Altars of Reflection": { accent: "#9fd6ff", border: "#9fd6ff", glow: "0 0 12px rgba(159,214,255,0.25)" },
};

const DEFAULT_THEME: CardTheme = { accent: "#e8c860", border: "rgba(255,255,255,0.16)" };

function cardImage(image: string | undefined): string | null {
  if (!image) return null;
  return image.startsWith("/images/") ? image : bungieIconUrl(image);
}

export function DestinationWeekCards({ slug, activities }: { slug: string; activities: WeeklyActivity[] }) {
  const base = THEMES[slug] ?? DEFAULT_THEME;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {activities.map((activity) => {
        const theme = ACTIVITY_THEMES[activity.label] ?? base;
        const image = cardImage(activity.image);
        const label = activity.label.replace(/\s*·\s*today$/i, "");
        const frame: CSSProperties = { borderColor: theme.border, boxShadow: theme.glow };
        return (
          <div
            key={`${activity.label}-${activity.name}`}
            className="relative flex min-h-[190px] flex-col justify-end gap-1.5 overflow-hidden border bg-panel px-[18px] py-4"
            style={frame}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(11,13,16,0.92) 15%, rgba(11,13,16,0.15) 70%), linear-gradient(135deg, ${theme.accent}33, transparent 55%)`,
              }}
            />
            {activity.cadence ? (
              <span
                className="absolute right-3 top-3 border bg-void/60 px-[7px] py-[3px] font-display text-[10.5px] uppercase tracking-[0.16em] text-bone"
                style={{ borderColor: theme.border }}
              >
                {activity.cadence === "daily" ? "Daily" : "Weekly"}
              </span>
            ) : null}
            <span className="relative font-display text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
              {label}
            </span>
            <span className="relative font-display text-[26px] font-semibold uppercase leading-none tracking-[0.04em] text-white">
              {activity.name}
            </span>
            <span className="relative text-[13px] text-[#c7cad0]">{activity.detail}</span>
          </div>
        );
      })}
    </div>
  );
}
