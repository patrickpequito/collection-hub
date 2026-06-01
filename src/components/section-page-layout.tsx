import { AuthBar } from "@/components/auth-bar";
import { PageHeader } from "@/components/page-header";
import { SiteNav } from "@/components/site-nav";
import type { BungieUserSession } from "@/lib/bungie";

type SectionPageLayoutProps = {
  title: string;
  imageUrl: string;
  session: BungieUserSession | null;
  oauthConfigured: boolean;
  children: React.ReactNode;
  maxWidth?: "4xl" | "5xl";
  backLink?: {
    href: string;
    label: string;
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
  session,
  oauthConfigured,
  children,
  maxWidth = "4xl",
  backLink = HOME_BACK_LINK,
}: SectionPageLayoutProps) {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <SiteNav />
      <PageHeader title={title} imageUrl={imageUrl} />
      <AuthBar
        session={session}
        oauthConfigured={oauthConfigured}
        backLink={backLink}
      />
      <div
        className={`mx-auto ${MAX_WIDTH_CLASSES[maxWidth]} space-y-6 px-4 py-8 sm:px-6`}
      >
        {children}
      </div>
    </main>
  );
}
