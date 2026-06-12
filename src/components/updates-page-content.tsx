import { AppVersionLabel } from "@/components/app-version-label";
import { XFollowBanner } from "@/components/x-follow-banner";
import {
  CURRENT_VERSION,
  formatReleaseDate,
  UPDATE_RELEASES,
  UPDATE_ROADMAP,
} from "@/data/updates";

export function UpdatesPageContent() {
  return (
    <div className="space-y-10">
      <XFollowBanner />

      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Version log
        </p>
        <h1 className="text-2xl font-semibold text-zinc-100 sm:text-3xl">
          Updates
        </h1>
        <AppVersionLabel />
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          The current release is{" "}
          <span className="font-medium text-zinc-200">v{CURRENT_VERSION}</span>.
          Version 1.0 will arrive once Armor Sets, Exotics, and Monument of
          Triumph are complete. Older releases stay listed below for reference.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Coming next
        </h2>
        <ul className="mt-3 space-y-2">
          {UPDATE_ROADMAP.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm text-zinc-300 before:shrink-0 before:text-zinc-600 before:content-['–']"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Release history
        </h2>

        {UPDATE_RELEASES.map((release) => (
          <article
            key={release.version}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-zinc-100">
                v{release.version}
                {release.tagline ? (
                  <span className="ml-2 text-sm font-normal text-zinc-500">
                    — {release.tagline}
                  </span>
                ) : null}
              </h3>
              <time
                dateTime={release.publishedAt}
                className="text-xs text-zinc-500"
              >
                {formatReleaseDate(release.publishedAt)}
              </time>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {release.summary}
            </p>

            <div className="mt-6 space-y-6">
              {release.sections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-sm font-semibold text-zinc-200">
                    {section.title}
                  </h4>
                  <p className="mt-1 text-sm text-zinc-500">
                    {section.description}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm text-zinc-300 before:shrink-0 before:text-[#c9a227]/70 before:content-['•']"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
