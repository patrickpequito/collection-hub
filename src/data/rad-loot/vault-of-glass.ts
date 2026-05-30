import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const VOG_SOURCE = 'Source: "Vault of Glass" Raid';

export const vaultOfGlassLoot: ActivityLootPage = {
  slug: "vault-of-glass",
  title: "Vault of Glass",
  headerImageFile: "vault-of-glass-header.webp",
  armorSets: [
    {
      setName: "Prime Zealot",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "586128500",
          "Prime Zealot Mask",
          "/common/destiny2_content/icons/a74303d3afb22d91a66a616766278acc.jpg",
          VOG_SOURCE,
        ),
        gauntlets: item(
          "3753500813",
          "Prime Zealot Gloves",
          "/common/destiny2_content/icons/c0ef7b4f342a19611f0c34e74db91dbf.jpg",
          VOG_SOURCE,
        ),
        chest: item(
          "1133961267",
          "Prime Zealot Cuirass",
          "/common/destiny2_content/icons/f8f4b1a69763ce8cb57e50766aec57b0.jpg",
          VOG_SOURCE,
        ),
        legs: item(
          "129332559",
          "Prime Zealot Strides",
          "/common/destiny2_content/icons/342a406ccdedbce8680910cfd93d4263.jpg",
          VOG_SOURCE,
        ),
        classItem: item(
          "3339387242",
          "Shattered Vault Cloak",
          "/common/destiny2_content/icons/64aca077d2bd3439f0130d59c97ba06c.jpg",
          VOG_SOURCE,
        ),
      },
    },
    {
      setName: "Kabr's Suit",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "4029224226",
          "Kabr's Battlecage",
          "/common/destiny2_content/icons/d91748bdb67a44df028b017240e6c954.jpg",
          VOG_SOURCE,
        ),
        gauntlets: item(
          "3368765451",
          "Kabr's Brazen Grips",
          "/common/destiny2_content/icons/945960135faee84c7c6b82d7adea215b.jpg",
          VOG_SOURCE,
        ),
        chest: item(
          "3890978501",
          "Kabr's Wrath",
          "/common/destiny2_content/icons/8383768d8d45cd88e3e38ef8c4c4eb35.jpg",
          VOG_SOURCE,
        ),
        legs: item(
          "123979037",
          "Kabr's Forceful Greaves",
          "/common/destiny2_content/icons/36842b39b933ffd6eac8e8057a61e291.jpg",
          VOG_SOURCE,
        ),
        classItem: item(
          "3012927512",
          "Light of the Great Prism",
          "/common/destiny2_content/icons/46846499b0905ddee6c6cad00bcec75.jpg",
          VOG_SOURCE,
        ),
      },
    },
    {
      setName: "Armor of the Hezen Lords",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "673599343",
          "Facade of the Hezen Lords",
          "/common/destiny2_content/icons/8eccfa30d37466b802969fa14063b626.jpg",
          VOG_SOURCE,
        ),
        gauntlets: item(
          "3253292022",
          "Gloves of the Hezen Lords",
          "/common/destiny2_content/icons/6abe6afb919b75ed281f2f0a151d1829.jpg",
          VOG_SOURCE,
        ),
        chest: item(
          "3029386938",
          "Cuirass of the Hezen Lords",
          "/common/destiny2_content/icons/47c7a4a37f9eab48c93ea33721914c36.jpg",
          VOG_SOURCE,
        ),
        legs: item(
          "170603856",
          "Tread of the Hezen Lords",
          "/common/destiny2_content/icons/a3f7800becec650fd095834e43450fc1.jpg",
          VOG_SOURCE,
        ),
        classItem: item(
          "2253382795",
          "Fragment of the Prime",
          "/common/destiny2_content/icons/3f3fc55df3c76693add0392a3412c0ff.jpg",
          VOG_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "3186018373",
      "Vision of Confluence",
      "/common/destiny2_content/icons/91164af10befddb76a53e50f5c1ee804.jpg",
      VOG_SOURCE,
    ),
    item(
      "2171478765",
      "Fatebringer",
      "/common/destiny2_content/icons/7741689cbc1102aa9fc742b33a106f19.jpg",
      VOG_SOURCE,
    ),
    item(
      "694500607",
      "Found Verdict",
      "/common/destiny2_content/icons/1037e708755c7086c1ac467364ca4340.jpg",
      VOG_SOURCE,
    ),
    item(
      "3653573172",
      "Praedyth's Revenge",
      "/common/destiny2_content/icons/47c2eb10dd01f64b4993988956c5c24c.jpg",
      VOG_SOURCE,
    ),
    item(
      "2265407516",
      "Hezen Vengeance",
      "/common/destiny2_content/icons/3b17caa86d9bb7b83a19d809084fa93b.jpg",
      VOG_SOURCE,
    ),
    item(
      "471518543",
      "Corrective Measure",
      "/common/destiny2_content/icons/38b4251825652c4f5464aa3ac2139d1b.jpg",
      VOG_SOURCE,
    ),
    item(
      "4289226715",
      "Vex Mythoclast",
      "/common/destiny2_content/icons/111a10b59029fc6a9ca5e821267e6f6c.jpg",
      VOG_SOURCE,
    ),
  ],
  timelostWeapons: [
    item(
      "337578911",
      "Vision of Confluence (Timelost)",
      "/common/destiny2_content/icons/9a43bdf2323286e3d107b3c632941f0a.jpg",
      VOG_SOURCE,
    ),
    item(
      "1216319404",
      "Fatebringer (Timelost)",
      "/common/destiny2_content/icons/0e281ebb76f5e5ba169bd44c036fcf39.jpg",
      VOG_SOURCE,
    ),
    item(
      "631439337",
      "Found Verdict (Timelost)",
      "/common/destiny2_content/icons/d5f35f65221d2a96d608989a7bc0e04f.jpg",
      VOG_SOURCE,
    ),
    item(
      "1987769101",
      "Praedyth's Revenge (Timelost)",
      "/common/destiny2_content/icons/31c5932c1629cfb37976cf916f672fc8.jpg",
      VOG_SOURCE,
    ),
    item(
      "1921159786",
      "Hezen Vengeance (Timelost)",
      "/common/destiny2_content/icons/53cea2eb2d4df9d6db37fd731ea8a288.jpg",
      VOG_SOURCE,
    ),
    item(
      "2334480463",
      "Corrective Measure (Timelost)",
      "/common/destiny2_content/icons/afc4bf7003651980fac94464f807f964.jpg",
      VOG_SOURCE,
    ),
  ],
  other: [
    item(
      "2907216422",
      "Vaultstrider",
      "/common/destiny2_content/icons/8aa59eba9edc4ebbca0138e1dfef1f7e.jpg",
      VOG_SOURCE,
    ),
    item(
      "2173688423",
      "Bitterpearl",
      "/common/destiny2_content/icons/79c026d344ebb9c37f43cb4cdfcb71b1.jpg",
      VOG_SOURCE,
    ),
    item(
      "208045060",
      "Continuum Alloy",
      "/common/destiny2_content/icons/e69347c8fb012137291883e45bf40220.jpg",
      'Source: Eververse — complete the "Vault of Glass" raid to unlock.',
    ),
    item(
      "2173688422",
      "Corrective // Protective",
      "/common/destiny2_content/icons/f6fabb71a8f98b4fac6d581ef26f3e24.jpg",
      VOG_SOURCE,
    ),
    item(
      "208045061",
      "Omnichronia",
      "/common/destiny2_content/icons/a8bae8a6c41a05f576e63c5bafec07d2.jpg",
      'Source: Eververse — complete the "Vault of Glass" raid to unlock.',
    ),
    item(
      "2510169795",
      "Exotemporal",
      "/common/destiny2_content/icons/3c251b702026fee24488eac5cbd3a2e2.jpg",
      VOG_SOURCE,
    ),
    item(
      "2510169794",
      "Infinite Reflections",
      "/common/destiny2_content/icons/0a59f5a322e2e6e36d03aa6eafaf60c3.jpg",
      VOG_SOURCE,
    ),
  ],
};

const ACTIVITY_PAGES: Record<string, ActivityLootPage> = {
  "vault-of-glass": vaultOfGlassLoot,
};

export function getActivityLootPage(slug: string): ActivityLootPage | null {
  return ACTIVITY_PAGES[slug] ?? null;
}
