type ActivitySectionHeaderProps = {
  children: React.ReactNode;
};

/** Sticky section label for RAD Loot columns — visible but same size as before. */
export function ActivitySectionHeader({ children }: ActivitySectionHeaderProps) {
  return (
    <h2 className="sticky top-12 z-30 -mx-4 mb-3 border-y border-zinc-700/70 bg-black/50 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.22em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:-mx-6 sm:px-6">
      <span className="flex items-center gap-3">
        <span
          className="size-4 shrink-0 bg-[#f2721b] shadow-[0_0_8px_rgba(242,114,27,0.45)]"
          aria-hidden
        />
        {children}
      </span>
    </h2>
  );
}
