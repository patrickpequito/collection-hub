import type { ActivityEventCardReward } from "@/types/activity-hub";

const WEAPON_ENGRAM_T5_ICON =
  "/common/destiny2_content/icons/4a323240c02e389d829db81bf0af47bd.png";
const ARMOR_ENGRAM_T5_ICON =
  "/common/destiny2_content/icons/4a323240c02e389d829db81bf0af47bd.png";

/** Iron Banner Event Card reward track (15 ranks). */
export const IRON_BANNER_EVENT_CARD_REWARDS: ActivityEventCardReward[] = [
  {
    rank: 1,
    name: "Stag Lord",
    subtitle: "Consumable",
    iconPath:
      "/common/destiny2_content/icons/6077d67320afee63c839034771c1f818.jpg",
    itemHash: "1937857104",
    progressionRewardIndex: 0,
  },
  {
    rank: 2,
    name: "Iron Banner Weapon Engram",
    subtitle: "Tier 5 Engram",
    iconPath: WEAPON_ENGRAM_T5_ICON,
    itemHash: "593326778",
    progressionRewardIndex: 4,
  },
  {
    rank: 3,
    name: "Reroll Chip",
    subtitle: "Daily Challenge Reroll",
    iconPath:
      "/common/destiny2_content/icons/e65ba13ecfb23d4435baa794a87a5146.png",
    itemHash: "2456277757",
    progressionRewardIndex: 5,
  },
  {
    rank: 4,
    name: "Enhancement Prism",
    subtitle: "Material",
    iconPath:
      "/common/destiny2_content/icons/dea2a35badf7466d4c2c2697ce6e8d87.jpg",
    itemHash: "4257549984",
    progressionRewardIndex: 6,
  },
  {
    rank: 5,
    name: "Iron Banner Armor Engram",
    subtitle: "Tier 5 Engram",
    iconPath: ARMOR_ENGRAM_T5_ICON,
    itemHash: "1635496577",
    progressionRewardIndex: 10,
  },
  {
    rank: 6,
    name: "Strange Coins ×9",
    subtitle: "Currency",
    iconPath:
      "/common/destiny2_content/icons/1fa5806bb6ec16b5f8cdeb4b36d4bb01.jpg",
    itemHash: "800069450",
    progressionRewardIndex: 11,
  },
  {
    rank: 7,
    name: "Iron Banner Weapon Engram",
    subtitle: "Tier 5 Engram",
    iconPath: WEAPON_ENGRAM_T5_ICON,
    itemHash: "593326778",
    progressionRewardIndex: 15,
  },
  {
    rank: 8,
    name: "Young Wolf's Pack",
    subtitle: "Legendary Emblem",
    iconPath:
      "/common/destiny2_content/icons/13c289f610714c3193f25a5371100d65.jpg",
    itemHash: "2279246949",
    progressionRewardIndex: 16,
  },
  {
    rank: 9,
    name: "Reroll Chip",
    subtitle: "Daily Challenge Reroll",
    iconPath:
      "/common/destiny2_content/icons/e65ba13ecfb23d4435baa794a87a5146.png",
    itemHash: "2456277757",
    progressionRewardIndex: 18,
  },
  {
    rank: 10,
    name: "Iron Banner Armor Engram",
    subtitle: "Tier 5 Engram",
    iconPath: ARMOR_ENGRAM_T5_ICON,
    itemHash: "1635496577",
    progressionRewardIndex: 22,
  },
  {
    rank: 11,
    name: "Reroll Chip",
    subtitle: "Daily Challenge Reroll",
    iconPath:
      "/common/destiny2_content/icons/e65ba13ecfb23d4435baa794a87a5146.png",
    itemHash: "2456277757",
    progressionRewardIndex: 23,
  },
  {
    rank: 12,
    name: "Iron Banner Weapon Engram",
    subtitle: "Tier 5 Engram",
    iconPath: WEAPON_ENGRAM_T5_ICON,
    itemHash: "593326778",
    progressionRewardIndex: 27,
  },
  {
    rank: 13,
    name: "Salute of the Lords",
    subtitle: "Exotic Emote",
    iconPath:
      "/common/destiny2_content/icons/166cfacb24f3cbc649452e0178a8b399.jpg",
    itemHash: "253898492",
    progressionRewardIndex: 28,
  },
  {
    rank: 14,
    name: "Iron Banner Armor Engram",
    subtitle: "Tier 5 Engram",
    iconPath: ARMOR_ENGRAM_T5_ICON,
    itemHash: "1635496577",
    progressionRewardIndex: 33,
  },
  {
    rank: 15,
    name: "Iron Banner Weapon Engram",
    subtitle: "Tier 5 Engram",
    iconPath: WEAPON_ENGRAM_T5_ICON,
    itemHash: "593326778",
    progressionRewardIndex: 38,
  },
];
