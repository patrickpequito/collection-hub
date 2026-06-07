import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

type SiteFooterProps = {
  children?: React.ReactNode;
};

export function SiteFooter({ children }: SiteFooterProps) {
  return (
    <footer className="mt-10 text-center text-xs text-zinc-600">
      {children}
      <p className={children ? "mt-2" : undefined}>
        <a
          href={X_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 transition hover:text-zinc-400"
        >
          {X_PROFILE_HANDLE} on X
        </a>
      </p>
    </footer>
  );
}
