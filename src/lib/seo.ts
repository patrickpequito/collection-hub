import type { Metadata } from "next";

/**
 * Per-page title, description and canonical URL. The root layout adds " | Collection HUB" to
 * every title and resolves paths against the site's own domain (metadataBase).
 */
export const SITE_NAME = "Collection HUB";

export function pageMetadata(path: string, title: string, description: string, options: { noindex?: boolean } = {}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: path, siteName: SITE_NAME, type: "website" },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description },
    ...(options.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Title + description for pages that don't exist (keeps 404s out of the index). */
export const NOT_FOUND_METADATA: Metadata = { title: "Not found", robots: { index: false, follow: false } };
