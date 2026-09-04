import Image from "next/image";
import { YouTubeEmbed } from "@/components/seasons/youtube-embed";
import { bungieIconUrl } from "@/lib/bungie-icon";

type SeasonTrailerSectionProps = {
  youtubeId: string;
  titleIconPath: string;
  heading?: string;
};

export function SeasonTrailerSection({
  youtubeId,
  titleIconPath,
  heading = "Season trailer",
}: SeasonTrailerSectionProps) {
  const iconUrl = bungieIconUrl(titleIconPath);

  return (
    <section className="min-w-0 space-y-3">
      <h2 className="text-lg font-semibold text-zinc-100">{heading}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,36rem)_1fr] sm:items-center sm:gap-8">
        <div className="min-w-0 w-full">
          <YouTubeEmbed youtubeId={youtubeId} title={heading} />
        </div>
        <div className="flex w-full items-center justify-center px-2 sm:px-6">
          <Image
            src={iconUrl}
            alt=""
            width={192}
            height={192}
            className="size-36 object-contain sm:size-40 md:size-44"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
