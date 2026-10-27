import Link from "@/components/app-link";
import type { ReactNode } from "react";

type ActivityCardProps = {
  href?: string;
  title: string;
  /** Small uppercase line above the title (era, playlist type…). */
  label?: string | null;
  imageUrl?: string;
  /** Teal "Featured" tag in the corner. */
  featured?: boolean;
  size?: "lg" | "md" | "sm";
  /** Dimmed (retired / coming soon). */
  muted?: boolean;
  /** Teal frame + label: this week's featured rotation. */
  highlight?: boolean;
  /** CSS object-position for cropped art (e.g. "75% center" for banners extended on the left). */
  imagePosition?: string;
  /** "home": home page card style (gold eyebrow, tighter spacing above the progress bar). */
  tone?: "default" | "home";
  children?: ReactNode;
};

const SIZE = {
  lg: { box: "min-h-[180px]", title: "text-[22px]" },
  md: { box: "min-h-[150px]", title: "text-[19px]" },
  sm: { box: "min-h-[104px]", title: "text-base" },
} as const;

/**
 * Director UI art card: banner at full strength, short gradient behind the
 * bottom text, optional Featured tag and signed-in progress (children).
 */
export function ActivityCard({
  href,
  title,
  label,
  imageUrl,
  featured = false,
  size = "lg",
  muted = false,
  highlight = false,
  imagePosition,
  tone = "default",
  children,
}: ActivityCardProps) {
  const frame = highlight
    ? `border-seasonal/70 ${href ? "hover:border-seasonal" : ""}`
    : `border-white/[0.18] ${href ? "hover:border-bone" : ""}`;
  const className = `group relative flex flex-col justify-end ${tone === "home" ? "gap-1" : "gap-1.5"} overflow-hidden border bg-panel px-4 pb-4 pt-5 transition ${
    SIZE[size].box
  } ${frame} ${muted ? "opacity-60" : ""}`;

  const body = (
    <>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.04)_0_2px,transparent_2px_14px)]"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/35 via-45% to-transparent"
      />
      {highlight ? (
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-seasonal" />
      ) : null}
      {featured ? (
        <span className="absolute right-3 top-3 bg-seasonal px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.16em] text-void">
          Featured
        </span>
      ) : null}
      {label ? (
        highlight ? (
          <span className="relative self-start bg-seasonal px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.16em] text-void">
            {label}
          </span>
        ) : (
          <span
            className={`ui-label text-on-art relative ${tone === "home" ? "text-[11px]! text-[#e8c860]!" : "text-bone/85!"}`}
          >
            {label}
          </span>
        )
      ) : null}
      <span
        className={`text-on-art relative font-display font-semibold uppercase leading-tight tracking-[0.06em] text-bone ${SIZE[size].title}`}
      >
        {title}
      </span>
      {children}
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
