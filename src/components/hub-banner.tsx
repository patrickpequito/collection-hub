import { InteractiveBannerLink } from "@/components/interactive-banner-link";

type HubBannerProps = {
  href?: string;
  title: string;
  description: string;
  /** Place image at public/images/banners/{imageFile} */
  imageFile?: string;
  comingSoon?: boolean;
};

export function HubBanner({
  href,
  title,
  description,
  imageFile,
  comingSoon = false,
}: HubBannerProps) {
  const isLink = Boolean(href) && !comingSoon;
  const imageUrl = imageFile ? `/images/banners/${imageFile}` : null;

  return (
    <InteractiveBannerLink
      href={isLink ? href : null}
      className={`group relative block overflow-hidden rounded-2xl border border-zinc-800 shadow-xl shadow-black/30 transition ${
        isLink ? "hover:border-zinc-600" : ""
      } ${comingSoon ? "opacity-80" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-zinc-900 bg-cover bg-center transition duration-500 ${
          isLink ? "group-hover:scale-[1.02]" : ""
        } ${imageUrl ? "" : "bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/30"}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />

      <div className="relative flex min-h-[140px] flex-col justify-end p-4 sm:min-h-[240px] sm:p-8 md:min-h-[280px]">
        <h2 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 max-w-md text-xs text-zinc-300 sm:mt-2 sm:text-sm">
          {description}
        </p>
        {comingSoon ? (
          <span className="mt-2 inline-flex w-fit items-center text-xs font-medium uppercase tracking-wide text-zinc-500 sm:mt-4 sm:text-sm">
            Coming soon
          </span>
        ) : (
          <span className="mt-2 inline-flex w-fit items-center text-xs font-medium text-amber-300 transition group-hover:text-amber-200 sm:mt-4 sm:text-sm">
            Open catalog →
          </span>
        )}
      </div>
    </InteractiveBannerLink>
  );
}
