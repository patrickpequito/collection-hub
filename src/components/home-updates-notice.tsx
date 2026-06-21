import Link from "next/link";
import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

const linkClassName =
  "font-medium text-zinc-200 underline decoration-zinc-600 underline-offset-2 transition hover:text-zinc-100";

export function HomeUpdatesNotice() {
  return (
    <p
      role="note"
      className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm leading-relaxed text-zinc-400"
    >
      We regularly ship changes and updates to the site. See the{" "}
      <Link href="/updates" className={linkClassName}>
        Updates
      </Link>{" "}
      page for details, or follow{" "}
      <a
        href={X_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {X_PROFILE_HANDLE}
      </a>{" "}
      on X.
    </p>
  );
}
