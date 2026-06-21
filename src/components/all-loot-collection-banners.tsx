import { InteractiveBannerLink } from "@/components/interactive-banner-link";
import { ALL_LOOT_COLLECTION_BANNERS } from "@/data/all-loot/collection-banners";
import { isLootCollectionBannerAvailable } from "@/lib/loot-navigation";

type AllLootCollectionBannerProps = {
  title: string;
  href?: string;
  comingSoon?: boolean;
  imageFile?: string;
};

function AllLootCollectionBanner({
  title,
  href,
  comingSoon = false,
  imageFile,
}: AllLootCollectionBannerProps) {
  const isLink = isLootCollectionBannerAvailable({
    title,
    href,
    comingSoon,
  });
  const imageUrl = imageFile ? `/images/banners/${imageFile}` : null;

  return (
    <InteractiveBannerLink
      href={isLink ? href : null}
      className="group relative block overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20 transition hover:border-zinc-600"
    >
      <div
        className={`absolute inset-0 bg-cover bg-center transition duration-500 ${
          comingSoon ? "" : "group-hover:scale-[1.02]"
        } ${imageUrl ? "" : "bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900"}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />

      {comingSoon ? (
        <div
          className="absolute inset-0 z-[1] bg-zinc-950/60"
          aria-hidden
        />
      ) : null}

      <div className="relative z-[2] flex h-10 items-center justify-between gap-3 px-3 sm:h-11 sm:px-3.5">
        <span className="truncate text-sm font-medium text-zinc-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {title}
        </span>
        {comingSoon ? (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-xs">
            Coming soon
          </span>
        ) : (
          <span
            className="shrink-0 text-sm text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] transition group-hover:text-amber-200"
            aria-hidden
          >
            →
          </span>
        )}
      </div>
    </InteractiveBannerLink>
  );
}

export function AllLootCollectionBanners() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {ALL_LOOT_COLLECTION_BANNERS.map((banner) => (
        <AllLootCollectionBanner key={banner.title} {...banner} />
      ))}
    </div>
  );
}
