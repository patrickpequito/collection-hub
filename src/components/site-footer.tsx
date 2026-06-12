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
    <footer className="mt-10 flex flex-col items-center gap-4 text-center">
      {children ? (
        <p className="text-xs text-zinc-600">{children}</p>
      ) : null}

      <div className="flex flex-col items-center gap-1.5">
        <a
          href={X_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-xl border border-zinc-700/80 bg-zinc-900/70 px-4 py-3 text-left shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800/90"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-zinc-100 ring-1 ring-zinc-700/80 transition group-hover:bg-zinc-100 group-hover:text-zinc-950">
            <XIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-sm font-semibold text-zinc-100 transition group-hover:text-white">
              Follow us on X
            </span>
            <span className="block text-xs text-zinc-400 transition group-hover:text-zinc-300">
              {X_PROFILE_HANDLE} · updates &amp; feedback
            </span>
          </span>
        </a>
      </div>
    </footer>
  );
}
