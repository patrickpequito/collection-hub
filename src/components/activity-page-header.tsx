type ActivityPageHeaderProps = {
  title: string;
  /** File in public/images/rad-loot/headers/ */
  imageFile: string;
};

export function ActivityPageHeader({ title, imageFile }: ActivityPageHeaderProps) {
  const imageUrl = `/images/rad-loot/headers/${imageFile}`;

  return (
    <header className="relative h-[200px] w-full overflow-hidden border-b border-zinc-800">
      <div
        className="absolute inset-0 bg-zinc-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="relative flex h-full items-end px-6 pb-6 sm:px-10">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
      </div>
    </header>
  );
}
