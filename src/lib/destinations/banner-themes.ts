/** Destination banner colours (expansion pages), matching each destination's This week cards. */

export type BannerTheme = {
  accent: string;
  border: string;
  glow: string;
  /** Left-to-right wash over the art (keeps the name readable). */
  wash: string;
  nameGlow: string;
  /** Replaces the destination art (e.g. Europa's red lab, tinted ice blue). */
  image?: string;
};

export const DESTINATION_BANNER_THEMES: Record<string, BannerTheme> = {
  // Kepler's pale turquoise highlights.
  kepler: {
    accent: "#8fe3d6",
    border: "rgba(143,227,214,0.75)",
    glow: "0 0 16px rgba(143,227,214,0.25)",
    wash: "linear-gradient(90deg, rgba(8,13,14,0.95) 25%, rgba(8,13,14,0.35) 65%, rgba(143,227,214,0.08))",
    nameGlow: "0 0 12px rgba(143,227,214,0.6)",
    image: "/images/destinations/kepler-banner.webp",
  },
  // Pale, luminous Traveler light over the Witness's dark.
  "the-pale-heart": {
    accent: "#e9d8a6",
    border: "rgba(233,216,166,0.85)",
    glow: "0 0 16px rgba(233,216,166,0.28)",
    wash: "linear-gradient(90deg, rgba(14,12,18,0.95) 25%, rgba(14,12,18,0.35) 65%, rgba(233,216,166,0.08))",
    nameGlow: "0 0 12px rgba(255,244,214,0.65)",
  },
  neomuna: {
    accent: "#ff7bf5",
    border: "#ff3df2",
    glow: "0 0 16px rgba(255,61,242,0.35)",
    wash: "linear-gradient(90deg, rgba(11,6,32,0.95) 25%, rgba(11,6,32,0.35) 65%, rgba(61,240,255,0.08))",
    nameGlow: "0 0 10px #3df0ff",
  },
  "throne-world": {
    accent: "#b8e04a",
    border: "#b8e04a",
    glow: "0 0 14px rgba(184,224,74,0.22)",
    wash: "linear-gradient(90deg, rgba(12,20,11,0.95) 25%, rgba(12,20,11,0.35) 65%, rgba(184,224,74,0.06))",
    nameGlow: "0 0 12px rgba(184,224,74,0.55)",
  },
  europa: {
    accent: "#8fc4ff",
    border: "rgba(210,230,255,0.85)",
    glow: "inset 0 0 18px rgba(143,196,255,0.22)",
    wash: "linear-gradient(90deg, rgba(10,20,34,0.95) 25%, rgba(10,20,34,0.35) 65%, rgba(143,196,255,0.06))",
    nameGlow: "0 0 14px rgba(143,196,255,0.75)",
    image: "/images/destinations/weekly/europa-eclipsed-zone.webp",
  },
  "the-moon": {
    accent: "#ff3b3b",
    border: "rgba(255,59,59,0.85)",
    glow: "0 0 16px rgba(200,16,46,0.35)",
    wash: "linear-gradient(90deg, rgba(13,5,7,0.95) 25%, rgba(13,5,7,0.35) 65%, rgba(200,16,46,0.08))",
    nameGlow: "0 0 12px rgba(255,40,40,0.8), 0 0 26px rgba(200,16,46,0.6)",
  },
};
