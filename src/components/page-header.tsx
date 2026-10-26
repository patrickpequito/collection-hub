type PageHeaderProps = {
  title: string;
  /** Path under public/, e.g. /images/banners/exotics.webp */
  imageUrl: string;
  /** Optional icon shown before the title (season symbol, etc.). */
  titleIconUrl?: string;
  /** Matches the page content width so the title lines up with it. */
  maxWidthClass?: string;
  /** Small uppercase line above the title, e.g. "Raid · Year 2 · Forsaken". */
  eyebrow?: string;
  /** Teal tag next to the eyebrow, e.g. "Featured this week". */
  badge?: string;
};

/** Director UI section header: banner art with the title on a short gradient. */
export function PageHeader({
  title,
  imageUrl,
  titleIconUrl,
  maxWidthClass = "max-w-5xl",
  eyebrow,
  badge,
}: PageHeaderProps) {
  return (
    <header className="relative h-[220px] w-full overflow-hidden border-b border-hairline bg-panel">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 via-45% to-transparent"
      />
      <div
        className={`relative mx-auto flex h-full items-end px-4 pb-6 sm:px-6 ${maxWidthClass}`}
      >
        <div className="space-y-2.5">
        {eyebrow || badge ? (
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? (
              <span className="ui-label text-on-art text-bone/85!">{eyebrow}</span>
            ) : null}
            {badge ? (
              <span className="bg-seasonal px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.16em] text-void">
                {badge}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="flex items-center gap-3 sm:gap-4">
          {titleIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={titleIconUrl}
              alt=""
              className="size-10 shrink-0 object-contain drop-shadow-[0_1px_4px_rgb(0_0_0/0.8)] sm:size-12"
            />
          ) : null}
          <h1 className="text-on-art text-3xl font-semibold uppercase tracking-[0.05em] text-bone sm:text-[42px] sm:leading-none">
            {title}
          </h1>
        </div>
        </div>
      </div>
    </header>
  );
}
