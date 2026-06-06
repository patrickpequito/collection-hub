import { InteractiveBannerLink } from "@/components/interactive-banner-link";

type HubBannerProps = {
  href: string;
  title: string;
  description: string;
  /** Place image at public/images/banners/{imageFile} */
  imageFile: string;
};

export function HubBanner({
  href,
  title,
  description,
  imageFile,
}: HubBannerProps) {
  const imageUrl = `/images/banners/${imageFile}`;

  return (
    <InteractiveBannerLink
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-zinc-800 shadow-xl shadow-black/30 transition hover:border-zinc-600"
    >
      <div
        className="absolute inset-0 bg-zinc-900 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      <div className="relative flex min-h-[140px] flex-col justify-end p-4 sm:min-h-[240px] sm:p-8 md:min-h-[280px]">
        <h2 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 max-w-md text-xs text-zinc-300 sm:mt-2 sm:text-sm">
          {description}
        </p>
        <span className="mt-2 inline-flex w-fit items-center text-xs font-medium text-amber-300 transition group-hover:text-amber-200 sm:mt-4 sm:text-sm">
          Open catalog →
        </span>
      </div>
    </InteractiveBannerLink>
  );
}
