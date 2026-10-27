import { SectionHeading } from "@/components/detail-page-parts";
import Image from "next/image";
import Link from "@/components/app-link";
import { SeasonSealTitle } from "@/components/seasons/season-seal-title";
import { YouTubeEmbed } from "@/components/seasons/youtube-embed";
import { bungieIconUrl } from "@/lib/bungie-icon";

type SeasonTrailerSectionProps = {
  youtubeId?: string;
  titleIconPath: string;
  /** Expansion that ran during this season. */
  parent: { title: string; tag: string; imageUrl?: string; href?: string } | null;
  seal?: { title: string; completionRecordHash: string };
  heading?: string;
};

/** Overview: season trailer with the seal, its title and the parent expansion. */
export function SeasonTrailerSection({
  youtubeId,
  titleIconPath,
  parent,
  seal,
  heading = "Overview",
}: SeasonTrailerSectionProps) {
  const iconUrl = bungieIconUrl(titleIconPath);

  const parentCard = parent ? (
    <span className="relative flex min-h-[80px] flex-col justify-end overflow-hidden border border-white/[0.18] bg-panel px-3 py-2.5">
      {parent.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={parent.imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 via-60% to-transparent"
      />
      <span className="ui-label text-on-art relative text-[11px]! text-bone/80!">{parent.tag}</span>
      <span className="text-on-art relative font-display text-[17px] font-semibold uppercase leading-tight tracking-[0.06em] text-bone">
        {parent.title}
      </span>
    </span>
  ) : null;

  return (
    <section className="min-w-0 space-y-3">
      <SectionHeading title={heading} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        {youtubeId ? (
          <div className="min-w-0">
            <YouTubeEmbed youtubeId={youtubeId} title={`${heading} trailer`} />
          </div>
        ) : null}
        <div className="ui-panel flex min-w-0 flex-col gap-3 p-4">
          {iconUrl ? (
            <Image
              src={iconUrl}
              alt=""
              width={176}
              height={176}
              className="mx-auto size-40 object-contain"
              unoptimized
            />
          ) : null}
          {seal ? (
            <SeasonSealTitle
              title={seal.title}
              completionRecordHash={seal.completionRecordHash}
            />
          ) : null}
          {parentCard ? (
            <div className="mt-auto flex flex-col gap-2 pt-2">
              <span className="ui-label">Part of</span>
              {parent?.href ? (
                <Link href={parent.href} className="block transition hover:brightness-110">
                  {parentCard}
                </Link>
              ) : (
                parentCard
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
