import { Suspense } from "react";
import { AuthBar } from "@/components/auth-bar";
import { AuthCallbackFlash } from "@/components/auth-callback-flash";
import { PageHeader } from "@/components/page-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import type { BungieUserSession } from "@/lib/bungie";

type SectionPageLayoutProps = {
  title?: string;
  imageUrl?: string;
  showHeader?: boolean;
  session: BungieUserSession | null;
  oauthConfigured: boolean;
  children: React.ReactNode;
  maxWidth?: "4xl" | "5xl";
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
} as const;

const HOME_BACK_LINK = { href: "/", label: "← Home" } as const;

export function SectionPageLayout({
  title,
  imageUrl,
  showHeader = true,
  session,
  oauthConfigured,
  children,
  maxWidth = "4xl",
  backLink = HOME_BACK_LINK,
}: SectionPageLayoutProps) {
  return (
    <>
      <SiteNav />
      <Suspense fallback={null}>
        <AuthCallbackFlash />
      </Suspense>
      <main className="min-h-dvh bg-zinc-950 text-zinc-100">
        {showHeader && title && imageUrl ? (
          <PageHeader title={title} imageUrl={imageUrl} />
        ) : null}
        <AuthBar
          session={session}
          oauthConfigured={oauthConfigured}
          backLink={backLink}
        />
        <div
          className={`mx-auto min-w-0 ${MAX_WIDTH_CLASSES[maxWidth]} space-y-6 px-4 py-8 sm:px-6`}
        >
          {children}
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
