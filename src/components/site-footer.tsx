import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

type SiteFooterProps = {
  children?: React.ReactNode;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter({ children }: SiteFooterProps) {
  return (
    <footer className="mt-12 flex flex-col items-center gap-4 border-t border-hairline pt-8 text-center">
      {children ? <p className="text-xs text-ash">{children}</p> : null}

      <a
        href={X_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-3 border border-hairline bg-panel/85 px-4 py-3 text-left transition hover:border-bone"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/20 text-bone transition group-hover:bg-bone group-hover:text-void">
          <XIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 text-left">
          <span className="block font-display text-sm font-semibold uppercase tracking-[0.12em] text-bone">
            Follow us on X
          </span>
          <span className="block text-xs text-ash">
            {X_PROFILE_HANDLE} · updates &amp; feedback
          </span>
        </span>
      </a>
      <p className="text-xs text-ash/70">Not affiliated with Bungie.</p>
    </footer>
  );
}
