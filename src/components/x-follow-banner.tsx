import { X_PROFILE_HANDLE, X_PROFILE_URL } from "@/lib/social";

export function XFollowBanner() {
  return (
    <div
      role="note"
      className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 sm:px-5"
    >
      <p className="text-sm leading-relaxed text-zinc-300">
        Follow{" "}
        <a
          href={X_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-200/90 underline decoration-amber-500/30 underline-offset-2 transition hover:text-amber-100"
        >
          {X_PROFILE_HANDLE}
        </a>{" "}
        on X to stay up to date with releases, changes, improvements, feedback,
        and suggestions.
      </p>
    </div>
  );
}
