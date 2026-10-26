import { Suspense } from "react";
import { AuthCallbackFlash } from "@/components/auth-callback-flash";
import {
  PageBreadcrumbs,
  type Crumb,
  type SiblingLinks,
} from "@/components/page-breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { RecordRecentVisit } from "@/components/record-recent-visit";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

type SectionPageLayoutProps = {
  title?: string;
  imageUrl?: string;
  titleIconUrl?: string;
  showHeader?: boolean;
  /** @deprecated Session is resolved client-side to keep pages cacheable. */
  session?: unknown;
  oauthConfigured: boolean;
  children: React.ReactNode;
  maxWidth?: "4xl" | "5xl" | "wide";
  /** Extra breadcrumb levels between the section and this page. */
  breadcrumbs?: Crumb[];
  /** Item pages: the trail already starts with its own hub section. */
  hideSectionCrumb?: boolean;
  /** Previous / next page of the same kind (Z / C keys). */
  siblings?: SiblingLinks;
  headerEyebrow?: string;
  headerBadge?: string;
  /** Full-width header rendered instead of the image header (e.g. the profile emblem hero). */
  headerSlot?: React.ReactNode;
  /** Hide the breadcrumb bar when the header already says where you are. */
  showBreadcrumbs?: boolean;
  /** Name/image for the home "Jump back in" list when there is no header title. */
  recentVisit?: { title: string; imageUrl?: string };
  backLink?:
    | {
        href: string;
        label: string;
        useHistory?: false;
      }
    | {
        label: string;
        useHistory: true;
        fallbackHref: string;
      };
};

const MAX_WIDTH_CLASSES = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  /** Hub pages: same width as the home page and navigation. */
  wide: "max-w-[1360px]",
} as const;

const HOME_BACK_LINK = { href: "/", label: "← Home" } as const;

export function SectionPageLayout({
  title,
  imageUrl,
  titleIconUrl,
  showHeader = true,
  oauthConfigured,
  children,
  maxWidth = "4xl",
  backLink = HOME_BACK_LINK,
  recentVisit,
  breadcrumbs,
  hideSectionCrumb,
  siblings,
  headerEyebrow,
  headerBadge,
  headerSlot,
  showBreadcrumbs = true,
}: SectionPageLayoutProps) {
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth];
  const visitTitle = recentVisit?.title ?? title;
  return (
    <>
      <SiteNav oauthConfigured={oauthConfigured} />
      {visitTitle ? (
        <RecordRecentVisit
          title={visitTitle}
          imageUrl={recentVisit?.imageUrl ?? imageUrl}
        />
      ) : null}
      <Suspense fallback={null}>
        <AuthCallbackFlash />
      </Suspense>
      <main className="min-h-dvh bg-void text-bone">
        {headerSlot}
        {showHeader && title && imageUrl ? (
          <PageHeader
            title={title}
            imageUrl={imageUrl}
            titleIconUrl={titleIconUrl}
            maxWidthClass={maxWidthClass}
            eyebrow={headerEyebrow}
            badge={headerBadge}
          />
        ) : null}
        {showBreadcrumbs ? (
          <PageBreadcrumbs
            title={visitTitle}
            backLink={backLink}
            trail={breadcrumbs}
            hideSectionCrumb={hideSectionCrumb}
            siblings={siblings}
            maxWidthClass={maxWidthClass}
          />
        ) : null}
        <div
          className={`mx-auto min-w-0 ${maxWidthClass} space-y-6 px-4 py-8 sm:px-6`}
        >
          {children}
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
