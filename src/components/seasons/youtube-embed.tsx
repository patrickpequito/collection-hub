type YouTubeEmbedProps = {
  youtubeId: string;
  title: string;
};

export function YouTubeEmbed({ youtubeId, title }: YouTubeEmbedProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
