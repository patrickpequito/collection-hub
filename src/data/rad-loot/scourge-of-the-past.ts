import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: Found in the "Scourge of the Past" raid.';

const SCOURGE_ICON =
  "/common/destiny2_content/icons/6577a6172ce4e9e65fe6294f024be4ea.png";

export const scourgeOfThePastLoot: ActivityLootPage = {
  slug: "scourge-of-the-past",
  title: "Scourge of the Past",
  headerImageFile: "scourge-of-the-past-header.webp",
  armorSetPreviewFiles: ["scourge-of-the-past.webp"],
  triumphPanel: {
    name: "Scourge of the Past",
    description: 'Triumphs for the "Scourge of the Past" raid.',
    iconPath: SCOURGE_ICON,
    recordHashes: [],
    records: [
      {
        recordHash: "2159542632",
        name: "Valiant Savior",
        description: 'Complete the "Scourge of the Past" raid.',
        iconPath:
          "/common/destiny2_content/icons/bd7a1fc995f87be96698263bc16698e7.png",
        score: 0,
        forTitleGilding: false,
        progressStyle: "default",
        objectives: [],
        rewards: [],
      },
    ],
  },
  armorSets: [
    {
      setName: "Bladesmith's Memory",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "96643258",
          "Bladesmith's Memory Mask",
          "/common/destiny2_content/icons/9e4621b86cc0831643fa270f6f66cda9.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2334017923",
          "Bladesmith's Memory Grips",
          "/common/destiny2_content/icons/5eed2b488da4868360d2e6ff8a8615d8.jpg",
          SOURCE,
        ),
        chest: item(
          "300528205",
          "Bladesmith's Memory Vest",
          "/common/destiny2_content/icons/a15cecc3058602775d8ea57a0581f59c.jpg",
          SOURCE,
        ),
        legs: item(
          "384384821",
          "Bladesmith's Memory Strides",
          "/common/destiny2_content/icons/bd5429369a23c629ec7344d248fe0fa1.jpg",
          SOURCE,
        ),
        classItem: item(
          "2750983488",
          "Bladesmith's Memory Cloak",
          "/common/destiny2_content/icons/757869416be55cb5109078f79c4d87c5.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Bulletsmith's Ire",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2719710110",
          "Bulletsmith's Ire Helm",
          "/common/destiny2_content/icons/330317f35372e1740886497e8e23d81d.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1989682895",
          "Bulletsmith's Ire Gauntlets",
          "/common/destiny2_content/icons/43d1183aa57b25dee6e88d08740078e3.jpg",
          SOURCE,
        ),
        chest: item(
          "3491990569",
          "Bulletsmith's Ire Plate",
          "/common/destiny2_content/icons/4264d7ae810aceea90dac45a294251da.jpg",
          SOURCE,
        ),
        legs: item(
          "2564183153",
          "Bulletsmith's Ire Greaves",
          "/common/destiny2_content/icons/478fac8e4d37f11b4c0f0d9f26008c2c.jpg",
          SOURCE,
        ),
        classItem: item(
          "977326564",
          "Bulletsmith's Ire Mark",
          "/common/destiny2_content/icons/8bd38ef0fe8412770e417342423367a7.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Gunsmith's Devotion",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "583145321",
          "Gunsmith's Devotion Crown",
          "/common/destiny2_content/icons/140b26f5c4a87ba62105f5db7605c218.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2286640864",
          "Gunsmith's Devotion Gloves",
          "/common/destiny2_content/icons/c610591ee6f560cf9b620dc4ac533792.jpg",
          SOURCE,
        ),
        chest: item(
          "4092373800",
          "Gunsmith's Devotion Robes",
          "/common/destiny2_content/icons/d35afac693d03140a1e5a4415db40dd2.jpg",
          SOURCE,
        ),
        legs: item(
          "940003738",
          "Gunsmith's Devotion Boots",
          "/common/destiny2_content/icons/9034dfadb940ed952749f5b2bf942442.jpg",
          SOURCE,
        ),
        classItem: item(
          "1499503877",
          "Gunsmith's Devotion Bond",
          "/common/destiny2_content/icons/f3e709e5f81e67985c566d1ffbb79ef8.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "2376481550",
      "Anarchy",
      "/common/destiny2_content/icons/f24e3336a1142847d6bf47b56b492eea.jpg",
      SOURCE,
    ),
    item(
      "2186258845",
      "Bellowing Giant",
      "/common/destiny2_content/icons/d93a12a1f2250f0869a4173c022bd46d.jpg",
      SOURCE,
    ),
    item(
      "1931556011",
      "No Feelings",
      "/common/destiny2_content/icons/6bc5e55173fbd169de1d9c98ce8c50ae.jpg",
      SOURCE,
    ),
    item(
      "2753269585",
      "Tempered Dynamo",
      "/common/destiny2_content/icons/c2e80432236c0313c546c1323056d962.jpg",
      SOURCE,
    ),
    item(
      "1664372054",
      "Threat Level",
      "/common/destiny2_content/icons/b69872f33e6e36f254ccb7580a84a0cd.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "3931192718",
      "Recovered Memories",
      "/common/destiny2_content/icons/b30618f548fbcbe4cd6323eb7adf6257.jpg",
      SOURCE,
    ),
    item(
      "3931192719",
      "Scourge of Nothing",
      "/common/destiny2_content/icons/35564e16cd31ad5f8c8933eb6e63fc9d.jpg",
      SOURCE,
    ),
    item(
      "3317837688",
      "Always on Time",
      "/common/destiny2_content/icons/695a74095f445dfa9b7855febedbe880.jpg",
      SOURCE,
    ),
    item(
      "2557722678",
      "Midnight Smith",
      "/common/destiny2_content/icons/9121afbb8adfebca29e0813154e5f50a.jpg",
      SOURCE,
    ),
    item(
      "3650581589",
      "Bergusian Night",
      "/common/destiny2_content/icons/9d9d76c84169095385bee08a7e7d8c0c.jpg",
      SOURCE,
    ),
  ],
};
