import type { GuardianClass } from "@/types/armor-set";

/*
 * Deadlands Bundle: armor ornaments and cosmetics unlocked with Bungie.net redeem codes
 * (special offer / charity promotion, Season: Lawless watermark). Shown on the Monument of Triumph page.
 */
export const DEADLANDS_REDEEM_URL = "https://www.bungie.net/7/en/Codes/Redeem";

export const DEADLANDS_SET_NAME = "Deadlands";

/** One code per class unlocks that class's five ornaments. */
export const DEADLANDS_CLASS_CODES: Record<GuardianClass, string> = {
  hunter: "6MC-A3F-X3R",
  titan: "3TG-G67-PYD",
  warlock: "MMX-3HF-CJ4",
};

/** Cosmetics in display order, each with its own code. */
export const DEADLANDS_COSMETICS: { name: string; code: string }[] = [
  { name: "Field Transcriber Shell", code: "FPP-NHV-HNC" },
  { name: "Mobile Array", code: "7AM-PJR-GMX" },
  { name: "Dynamic Equivalence", code: "K9P-PVD-NR6" },
  { name: "Evergreen Destrier", code: "M3L-7DA-67C" },
  { name: "Hot and Cold", code: "FLK-TXG-P4A" },
];
