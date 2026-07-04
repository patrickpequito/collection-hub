import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const ST_SOURCE = 'Complete the "Shattered Throne" dungeon.';

export const theShatteredThroneLoot: ActivityLootPage = {
  slug: "the-shattered-throne",
  title: "The Shattered Throne",
  headerImageFile: "the-shattered-throne-header.webp",
  completionsLabel: "Dungeon Completions",
  triumphPanel: {
    name: "The Shattered Throne",
    description: 'Triumphs for "The Shattered Throne" dungeon.',
    iconPath:
      "/common/destiny2_content/icons/1406f929d0c25506a5ab5ea73956fcb3.png",
    recordHashes: [
      "349475271",
      "1025573696",
      "1178448425",
      "3899996566",
      "3205009787",
      "174211525",
      "2436465535",
      "4180867423",
      "3484341438",
      "3853748669",
      "2843728443",
      "3067888367",
      "479505886",
      "3253562931",
      "1078539354",
      "763614929",
    ],
  },
  armorSets: [
    {
      setName: "Techeun's Regalia",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "4263497347",
          "Techeun's Regalia Mask",
          "/common/destiny2_content/icons/5567eb438a33d12b5e4b00f16bb474b3.jpg",
          ST_SOURCE,
        ),
        gauntlets: item(
          "1106068818",
          "Techeun's Regalia Grips",
          "/common/destiny2_content/icons/cb590f9e0b39b871c899c27cf7d642ea.jpg",
          ST_SOURCE,
        ),
        chest: item(
          "2438408214",
          "Techeun's Regalia Vest",
          "/common/destiny2_content/icons/28019ab85ef0508784e727f667435238.jpg",
          ST_SOURCE,
        ),
        legs: item(
          "1507307244",
          "Techeun's Regalia Strides",
          "/common/destiny2_content/icons/6becf14b988b8ed640ff6a94e248defc.jpg",
          ST_SOURCE,
        ),
        classItem: item(
          "1768035391",
          "Techeun's Regalia Cloak",
          "/common/destiny2_content/icons/88b92cd5dd13134e087007c6382c7fa7.jpg",
          ST_SOURCE,
        ),
      },
    },
    {
      setName: "Techeun's Regalia",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2009401631",
          "Techeun's Regalia Helmet",
          "/common/destiny2_content/icons/09e9a273f5fc6bf736fbc327a881ede6.jpg",
          ST_SOURCE,
        ),
        gauntlets: item(
          "2367623270",
          "Techeun's Regalia Gauntlets",
          "/common/destiny2_content/icons/8c7dd8d5d5ce18478c4be74cf921252f.jpg",
          ST_SOURCE,
        ),
        chest: item(
          "950387978",
          "Techeun's Regalia Plate",
          "/common/destiny2_content/icons/6085ef455581e313e769729aeda5438a.jpg",
          ST_SOURCE,
        ),
        legs: item(
          "1926755680",
          "Techeun's Regalia Greaves",
          "/common/destiny2_content/icons/7c34cc2565891850ac6582482c57b100.jpg",
          ST_SOURCE,
        ),
        classItem: item(
          "1587205659",
          "Techeun's Regalia Mark",
          "/common/destiny2_content/icons/3f5c97bb86d7cbc4c9171fc27e162284.jpg",
          ST_SOURCE,
        ),
      },
    },
    {
      setName: "Techeun's Regalia",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1228973722",
          "Techeun's Regalia Hood",
          "/common/destiny2_content/icons/317a289dc64564fb8593d59a277014ac.jpg",
          ST_SOURCE,
        ),
        gauntlets: item(
          "3466245347",
          "Techeun's Regalia Gloves",
          "/common/destiny2_content/icons/1de50e0400ca2271fbb9cd1c25535ae3.jpg",
          ST_SOURCE,
        ),
        chest: item(
          "826300973",
          "Techeun's Regalia Robes",
          "/common/destiny2_content/icons/80331a28d7565b6b813448f219667909.jpg",
          ST_SOURCE,
        ),
        legs: item(
          "1092257813",
          "Techeun's Regalia Boots",
          "/common/destiny2_content/icons/bd0b76b645868732378a423a7f9f42f8.jpg",
          ST_SOURCE,
        ),
        classItem: item(
          "3235179552",
          "Techeun's Regalia Bond",
          "/common/destiny2_content/icons/61519b4b18b51a9c2a4d53360c1089eb.jpg",
          ST_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "2966714447",
      "Canis Major",
      "/common/destiny2_content/icons/cc48d0afb44de5a61bc9cc44bbc8897e.jpg",
      ST_SOURCE,
    ),
    item(
      "1750388538",
      "Chrysura Melo",
      "/common/destiny2_content/icons/52f79ce87b2041391ea2e33af8ee0906.jpg",
      ST_SOURCE,
    ),
    item(
      "2993995118",
      "Fractethyst",
      "/common/destiny2_content/icons/9feb11833613f20e0e9bab915c4fa47a.jpg",
      ST_SOURCE,
    ),
    item(
      "3245446311",
      "Vulpecula",
      "/common/destiny2_content/icons/6495d6a04cc9e7c0515b27b26ad8be60.jpg",
      ST_SOURCE,
    ),
    item(
      "814876684",
      "Wish-Ender",
      "/common/destiny2_content/icons/8e5d7a68305a0d1e53ccade9398c7e8b.jpg",
      ST_SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "185321778",
      "The Eternal Return",
      "/common/destiny2_content/icons/b7c314b501b6a75d4bfa029d0059b7b8.jpg",
      ST_SOURCE,
    ),
  ],
};
