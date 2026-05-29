import Link from "next/link";

type HubBannerProps = {
  href: string;
  title: string;
  description: string;
  /** Place image at public/images/banners/{imageFile} */
  imageFile: string;
  accentClass: string;
};

export function HubBanner({
  href,
  title,
  description,
  imageFile,
  accentClass,
}: HubBannerProps) {
  const imageUrl = `/images/banners/${imageFile}`;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-zinc-800 shadow-xl shadow-black/30 transition hover:border-zinc-600"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentClass} bg-cover bg-center transition duration-500 group-hover:scale-[1.02]`}
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      <div className="relative flex min-h-[200px] flex-col justify-end p-6 sm:min-h-[240px] sm:p-8 md:min-h-[280px]">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Browse
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm text-zinc-300">{description}</p>
        <span className="mt-4 inline-flex w-fit items-center text-sm font-medium text-amber-300 transition group-hover:text-amber-200">
          Open catalog →
        </span>
      </div>
    </Link>
  );
}
