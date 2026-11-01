import type { MetadataRoute } from "next";
import { exoticItemPaths } from "@/lib/seo-pages";

/**
 * robots.txt. Item pages (/weapons, /armor) number in the thousands and are expensive to
 * crawl: only exotics are open. AI crawlers are also blocked in src/middleware.ts.
 */
export const revalidate = 86400;

const AI_CRAWLERS = ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "ClaudeBot", "Google-Extended", "Bytespider", "Amazonbot"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const exotics = await exoticItemPaths();
  return {
    rules: [
      {
        userAgent: "*",
        // Exact exotic pages ($) win over the broader /weapons/ and /armor/ rules.
        allow: ["/", ...exotics.map((path) => `${path}$`)],
        disallow: ["/api/", "/share", "/admin", "/data/", "/weapons/", "/armor/", "/all-loot", "/profile"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: "https://d2collector.site/sitemap.xml",
    host: "https://d2collector.site",
  };
}
