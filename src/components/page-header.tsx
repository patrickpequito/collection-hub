type PageHeaderProps = {
  title: string;
  /** Path under public/, e.g. /images/banners/exotics.webp */
  imageUrl: string;
};

export function PageHeader({ title, imageUrl }: PageHeaderProps) {
  return (
    <header className="relative h-[200px] w-full overflow-hidden border-b border-zinc-800">
      <div
        className="absolute inset-0 bg-zinc-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="relative flex h-full items-end px-6 pb-6 sm:px-10">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
      </div>
    </header>
  );
}
