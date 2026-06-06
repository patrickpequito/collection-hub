import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Vesper\'s Host" Dungeon';

export const vespersHostLoot: ActivityLootPage = {
  slug: "vespers-host",
  title: "Vesper's Host",
  headerImageFile: "vespers-host-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "Spacewalk",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "283230886",
          "Spacewalk Cowl",
          "/common/destiny2_content/icons/5ccb1759915a2dadc619684c666542e0.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "3592158071",
          "Spacewalk Grasps",
          "/common/destiny2_content/icons/4254f817ee0d92b294e5efcc4c7c0482.jpg",
          SOURCE,
        ),
        chest: item(
          "2436714433",
          "Spacewalk Vest",
          "/common/destiny2_content/icons/93c287ab5da8c426ff84f5f082c9848b.jpg",
          SOURCE,
        ),
        legs: item(
          "1105725465",
          "Spacewalk Strides",
          "/common/destiny2_content/icons/64efc9d1f68d51c4a7f8ce893dfb565f.jpg",
          SOURCE,
        ),
        classItem: item(
          "3219219484",
          "Spacewalk Cloak",
          "/common/destiny2_content/icons/a6247ff6c411583eaa4b0e9b93317aea.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Spacewalk",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2244013188",
          "Spacewalk Helm",
          "/common/destiny2_content/icons/0052789b278ef66c46fd93fb665a2b17.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1808327005",
          "Spacewalk Gauntlets",
          "/common/destiny2_content/icons/fde024346bb55adb55616e3a83e8ce66.jpg",
          SOURCE,
        ),
        chest: item(
          "1615763427",
          "Spacewalk Plate",
          "/common/destiny2_content/icons/b50fa7377b1af700316629842f91e4e4.jpg",
          SOURCE,
        ),
        legs: item(
          "4132376063",
          "Spacewalk Greaves",
          "/common/destiny2_content/icons/943212f561de8e7d2c5362237bec763c.jpg",
          SOURCE,
        ),
        classItem: item(
          "514586330",
          "Spacewalk Mark",
          "/common/destiny2_content/icons/497333077960142d80ade161dfc59a74.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Spacewalk",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1446639859",
          "Spacewalk Cover",
          "/common/destiny2_content/icons/b1a3611aad54ede50e1585dab6c1b861.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "3234613634",
          "Spacewalk Gloves",
          "/common/destiny2_content/icons/7e430c984ba9bd47740efe1ff39c881c.jpg",
          SOURCE,
        ),
        chest: item(
          "4190676582",
          "Spacewalk Robes",
          "/common/destiny2_content/icons/1ec45cb43100438b3d2e2d0a9b5ae008.jpg",
          SOURCE,
        ),
        legs: item(
          "1025368892",
          "Spacewalk Boots",
          "/common/destiny2_content/icons/e62d16650730f70675e04e10c9cbc512.jpg",
          SOURCE,
        ),
        classItem: item(
          "213803727",
          "Spacewalk Bond",
          "/common/destiny2_content/icons/a24aae5cc8a425114e627d220fbfdae3.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "1111334348",
      "Ice Breaker",
      "/common/destiny2_content/icons/5f3f44c8ec720f4ece9a8903ae29df60.jpg",
      SOURCE,
    ),
    item(
      "1762785662",
      "VS Chill Inhibitor",
      "/common/destiny2_content/icons/6c1d34f6dcca37c6b4b8dde37f4c94ba.jpg",
      SOURCE,
    ),
    item(
      "93061497",
      "VS Gravitic Arrest",
      "/common/destiny2_content/icons/9eb673deb4b6c88634f99d69a1e4f6ff.jpg",
      SOURCE,
    ),
    item(
      "4232480042",
      "VS Pyroelectric Propellant",
      "/common/destiny2_content/icons/564561966f9448d71662e3d9905cc1c4.jpg",
      SOURCE,
    ),
    item(
      "1762785663",
      "VS Velocity Baton",
      "/common/destiny2_content/icons/b89e90437957f2c56ef62425b30406a3.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "3508476927",
      "Anomalous",
      "/common/destiny2_content/icons/31d60aedc5ebdd94c369d1b4f352cf45.jpg",
      SOURCE,
    ),
    item(
      "3508476924",
      "Station\'s Savior",
      "/common/destiny2_content/icons/65669fbb25d524537bf5a213eedca3cf.jpg",
      SOURCE,
    ),
    item(
      "788073488",
      "Vespertine",
      "/common/destiny2_content/icons/98ae379f3586121f1111939eb3b46cd2.jpg",
      SOURCE,
    ),
    item(
      "3031600404",
      "VS Tech Sledge",
      "/common/destiny2_content/icons/ab3fbc08eb8b6990b9de66e0df63fc3a.jpg",
      SOURCE,
    ),
  ],
};
