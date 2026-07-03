import { InteractiveBannerLink } from "@/components/interactive-banner-link";

type HubBannerSize = "large" | "featured";

type HubBannerProps = {
  href?: string;
  title: string;
  description: string;
  /** Place image at public/images/banners/{imageFile} */
  imageFile?: string;
  /** Override banner image path (e.g. activity headers). */
  imageUrl?: string;
  comingSoon?: boolean;
  size?: HubBannerSize;
};

const SIZE_STYLES: Record<
  HubBannerSize,
  {
    shell: string;
    content: string;
    title: string;
    description: string;
    cta: string;
    ctaLabel: string;
  }
> = {
  large: {
    shell: "rounded-2xl border-zinc-800 shadow-xl shadow-black/30",
    content: "min-h-[140px] p-4 sm:min-h-[240px] sm:p-8 md:min-h-[280px]",
    title: "text-xl font-semibold text-white sm:text-2xl md:text-3xl",
    description: "mt-1 max-w-md text-xs text-zinc-300 sm:mt-2 sm:text-sm",
    cta: "mt-2 sm:mt-4 sm:text-sm",
    ctaLabel: "Open catalog →",
  },
  featured: {
    shell:
      "rounded-xl border-amber-500/30 shadow-lg shadow-amber-950/25 hover:border-amber-400/50",
    content: "min-h-[70px] p-3 sm:min-h-[120px] sm:p-4 md:min-h-[140px]",
    title: "text-sm font-semibold text-white sm:text-lg md:text-xl",
    description:
      "mt-0.5 line-clamp-2 text-[10px] text-zinc-300 sm:mt-1 sm:text-xs",
    cta: "mt-1 text-[10px] sm:mt-2 sm:text-xs",
    ctaLabel: "Open →",
  },
};

export function HubBanner({
  href,
  title,
  description,
  imageFile,
  imageUrl: imageUrlProp,
  comingSoon = false,
  size = "large",
}: HubBannerProps) {
  const isLink = Boolean(href) && !comingSoon;
  const imageUrl =
    imageUrlProp ?? (imageFile ? `/images/banners/${imageFile}` : null);
  const styles = SIZE_STYLES[size];

  return (
    <InteractiveBannerLink
      href={isLink ? href : null}
      className={`group relative block overflow-hidden border transition ${styles.shell} ${
        isLink && size === "large" ? "hover:border-zinc-600" : ""
      } ${comingSoon ? "opacity-80" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-zinc-900 bg-cover bg-center transition duration-500 ${
          isLink ? "group-hover:scale-[1.02]" : ""
        } ${imageUrl ? "" : "bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/30"}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />

      <div
        className={`relative flex flex-col justify-end ${styles.content}`}
      >
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        {comingSoon ? (
          <span
            className={`inline-flex w-fit items-center font-medium uppercase tracking-wide text-zinc-500 ${styles.cta}`}
          >
            Coming soon
          </span>
        ) : (
          <span
            className={`inline-flex w-fit items-center font-medium text-amber-300 transition group-hover:text-amber-200 ${styles.cta}`}
          >
            {styles.ctaLabel}
          </span>
        )}
      </div>
    </InteractiveBannerLink>
  );
}
