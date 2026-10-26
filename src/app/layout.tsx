import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Barlow, Barlow_Semi_Condensed, Geist_Mono } from "next/font/google";
import { AppNavigationProvider } from "@/components/app-navigation-provider";
import { NavigationLoadingIndicator } from "@/components/navigation-loading-indicator";
import { ProfileBootstrap } from "@/components/profile-bootstrap";
import "./globals.css";

/** Director UI body face. */
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/** Director UI display face: titles, tabs and uppercase labels. */
const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-barlow-semi-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collection HUB",
  description: "A collection tracker for Destiny 2 players",
};

/** Matches the Director UI void background — tints Safari chrome and overscroll on iOS. */
export const viewport: Viewport = {
  themeColor: "#0b0d10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowSemiCondensed.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProfileBootstrap>{children}</ProfileBootstrap>
        <Suspense fallback={null}>
          <AppNavigationProvider />
        </Suspense>
        <NavigationLoadingIndicator />
        <Analytics />
      </body>
    </html>
  );
}
