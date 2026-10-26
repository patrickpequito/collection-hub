"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { HistoryBackButton } from "@/components/history-back-button";

export type Crumb = { label: string; href?: string };

export type SiblingLinks = {
  previous?: { href: string; label: string };
  next?: { href: string; label: string };
};

type BackLinkConfig =
  | { href: string; label: string; useHistory?: false }
  | { label: string; useHistory: true; fallbackHref: string; fromQuery?: boolean };

type PageBreadcrumbsProps = {
  /** Current page name (last crumb). */
  title?: string;
  /** The page's "back" target; becomes the parent crumb when it adds a level. */
  backLink?: BackLinkConfig;
  /** Extra levels between the section and the page (e.g. a season's expansion). */
  trail?: Crumb[];
  siblings?: SiblingLinks;
  maxWidthClass: string;
  hideSectionCrumb?: boolean;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

const STEP_CLASS =
  "inline-flex h-9 items-center gap-2 border border-white/20 px-3 text-sm text-bone/85 transition hover:border-bone hover:text-white";

function KeyHint({ children }: { children: string }) {
  return (
    <kbd
      aria-hidden
      className="hidden border border-white/25 px-1.5 py-px font-display text-xs text-ash lg:inline-block"
    >
      {children}
    </kbd>
  );
}

/** Top-level section for a path — the first crumb, matching the nav tabs. */
function sectionFor(pathname: string): Crumb | null {
  const sections: [RegExp, Crumb][] = [
    [/^\/(seasons|expansions)(\/|$)/, { label: "Timeline", href: "/expansions" }],
    [
      /^\/(rad-loot|activities|pve-activities|pvp-activities)(\/|$)/,
      { label: "Activities", href: "/activities" },
    ],
    [
      /^\/(all-loot|collections|exotics|sets|shaders|weapons|armor)(\/|$)/,
      { label: "Collections", href: "/all-loot" },
    ],
    [/^\/triumphs(\/|$)/, { label: "Triumphs", href: "/triumphs" }],
  ];
  return sections.find(([pattern]) => pattern.test(pathname))?.[1] ?? null;
}

function cleanLabel(label: string): string {
  return label.replace(/^←\s*/, "").trim();
}

/**
 * Director UI location bar: Section / parent / page, plus a back button when
 * the page returns to wherever you came from (item pages).
 */
export function PageBreadcrumbs({
  title,
  backLink,
  trail = [],
  siblings,
  maxWidthClass,
  hideSectionCrumb = false,
}: PageBreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Z / C step to the previous / next page of the same kind.
  useEffect(() => {
    if (!siblings?.previous && !siblings?.next) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && siblings.previous) router.push(siblings.previous.href);
      if (key === "c" && siblings.next) router.push(siblings.next.href);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, siblings]);
  const section = sectionFor(pathname);

  const crumbs: Crumb[] = [];
  if (section && !hideSectionCrumb) crumbs.push(section);
  if (backLink && !backLink.useHistory && backLink.href !== "/") {
    const parent = { label: cleanLabel(backLink.label), href: backLink.href };
    if (parent.href !== section?.href) crumbs.push(parent);
  }
  crumbs.push(...trail);
  if (title && pathname !== section?.href) crumbs.push({ label: title });

  if (crumbs.length === 0 && !backLink?.useHistory) return null;

  return (
    <div className="border-b border-hairline bg-[rgb(14_17_22/0.85)]">
      <div
        className={`mx-auto flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 ${maxWidthClass}`}
      >
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-2.5">
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="text-ash transition hover:text-bone"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={last ? "page" : undefined}
                      className={last ? "text-bone" : "text-ash"}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!last ? (
                    <span aria-hidden className="text-ash/50">
                      /
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        {siblings?.previous || siblings?.next ? (
          <div className="flex flex-wrap gap-2">
            {siblings.previous ? (
              <Link href={siblings.previous.href} className={STEP_CLASS}>
                <KeyHint>Z</KeyHint>
                <span aria-hidden>←</span>
                {siblings.previous.label}
              </Link>
            ) : null}
            {siblings.next ? (
              <Link href={siblings.next.href} className={STEP_CLASS}>
                {siblings.next.label}
                <span aria-hidden>→</span>
                <KeyHint>C</KeyHint>
              </Link>
            ) : null}
          </div>
        ) : null}

        {backLink?.useHistory ? (
          <Suspense fallback={null}>
            <HistoryBackButton
              label={backLink.label}
              fallbackHref={backLink.fallbackHref}
              fromQuery={backLink.fromQuery}
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
