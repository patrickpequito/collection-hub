import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Leviathan, Spire of Stars" Raid Lair';
const PRESTIGE_SOURCE =
  'Source: "Leviathan, Spire of Stars" Raid Lair (Prestige)';

const LEVIATHAN_ICON =
  "/common/destiny2_content/icons/99dd675e20df42d2451400ceb3636223.png";

export const spireOfStarsLoot: ActivityLootPage = {
  slug: "spire-of-stars",
  title: "Spire of Stars",
  headerImageFile: "spire-of-stars-header.webp",
  armorSetPreviewFiles: ["spire-of-stars.webp"],
  completionsLabel: "Raid Lair Completions",
  triumphPanel: {
    name: "Spire of Stars",
    description: 'Triumphs for the "Leviathan, Spire of Stars" raid lair.',
    iconPath: LEVIATHAN_ICON,
    recordHashes: [],
    records: [
      {
        recordHash: "3364437692",
        name: "On Your Way Up",
        description:
          'Complete the "Leviathan, Spire of Stars" raid lair.',
        iconPath:
          "/common/destiny2_content/icons/cccae615320fc0f4cf1a848ac82e47d8.png",
        score: 0,
        forTitleGilding: false,
        progressStyle: "default",
        objectives: [],
        rewards: [],
      },
      {
        recordHash: "3569082466",
        name: "A Superior Retainer",
        description:
          'Complete the "Leviathan, Spire of Stars" raid lair on Prestige difficulty.',
        iconPath:
          "/common/destiny2_content/icons/cccae615320fc0f4cf1a848ac82e47d8.png",
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
      setName: "Equitis Shade",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "3518692432",
          "Equitis Shade Cowl",
          "/common/destiny2_content/icons/b583a1c6eebf832b265c98bded867317.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "3316476193",
          "Equitis Shade Grips",
          "/common/destiny2_content/icons/25bcff152ae0748e29039db003a0b59e.jpg",
          SOURCE,
        ),
        chest: item(
          "813277303",
          "Equitis Shade Rig",
          "/common/destiny2_content/icons/2e9110e68d2e9398ffff69ec0b4c005f.jpg",
          SOURCE,
        ),
        legs: item(
          "91896851",
          "Equitis Shade Boots",
          "/common/destiny2_content/icons/7648b4e80ffc48f2b396e0207ee50171.jpg",
          SOURCE,
        ),
        classItem: item(
          "2475562438",
          "Equitis Shade Cloak",
          "/common/destiny2_content/icons/3afe627e1fa5698c2cdc86b6f8ee7ecb.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Turris Shade",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "1178920188",
          "Turris Shade Helm",
          "/common/destiny2_content/icons/9ff3510278761510a91ff5dc44ab6aef.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2575374197",
          "Turris Shade Gauntlets",
          "/common/destiny2_content/icons/039a13a1555d4fc6e624779fc80e0a0f.jpg",
          SOURCE,
        ),
        chest: item(
          "2295412715",
          "Turris Shade Plate",
          "/common/destiny2_content/icons/e41b1a93d7aa24e6e4d197e5f432782d.jpg",
          SOURCE,
        ),
        legs: item(
          "4151496279",
          "Turris Shade Greaves",
          "/common/destiny2_content/icons/df6bb7188946a495386a39e5bc0e05da.jpg",
          SOURCE,
        ),
        classItem: item(
          "1035112834",
          "Turris Shade Mark",
          "/common/destiny2_content/icons/56c281cdf0fcde94a69f857d1b05c95c.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Insigne Shade",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "2305801487",
          "Insigne Shade Cover",
          "/common/destiny2_content/icons/3931f1e02f338fa64893697bb8b7ebd8.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "165966230",
          "Insigne Shade Gloves",
          "/common/destiny2_content/icons/169295b52f2ae5e0b6f9ac8fc2217502.jpg",
          SOURCE,
        ),
        chest: item(
          "4213777114",
          "Insigne Shade Robes",
          "/common/destiny2_content/icons/753f7ba5fa370093a826995cd9599c2d.jpg",
          SOURCE,
        ),
        legs: item(
          "1378348656",
          "Insigne Shade Boots",
          "/common/destiny2_content/icons/b3ba8b2bf63f308e9d98808e9a624f74.jpg",
          SOURCE,
        ),
        classItem: item(
          "3862230571",
          "Insigne Shade Bond",
          "/common/destiny2_content/icons/fcd098ebcb857fe3a3182b3f79b0e644.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "4288031461",
      "The Emperor's Envy",
      "/common/destiny2_content/icons/3b07d774a601a27ad9c9eb3f125cb592.jpg",
      SOURCE,
    ),
    item(
      "2084611899",
      "Last of the Legion",
      "/common/destiny2_content/icons/9e6b75da73f23824506ffdfcfde44847.jpg",
      SOURCE,
    ),
    item(
      "530754878",
      "Luxurious Toast",
      "/common/destiny2_content/icons/339cdad21abf7b65ed1e0f186432e6e7.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "1057119308",
      "Spire Star",
      "/common/destiny2_content/icons/9fbda4197ce07f0b0787d3faba2c8ac0.jpg",
      SOURCE,
    ),
    item(
      "1595521942",
      "Atop the Spire",
      "/common/destiny2_content/icons/991cb12dba873315864446650ab5e908.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "2331063860",
      "Grind Underfoot",
      "/common/destiny2_content/icons/8456ea17b3774b025693e00d989d8e83.jpg",
      SOURCE,
    ),
    item(
      "2331063861",
      "Together, For Glory!",
      "/common/destiny2_content/icons/5d924cd5decf1e796bcf7279ade0eb25.jpg",
      SOURCE,
    ),
    item(
      "2543722796",
      "Praetorian Visage",
      "/common/destiny2_content/icons/55b3cf5ffd8c09a3a17608803d4ec8bd.jpg",
      SOURCE,
    ),
    item(
      "2543722797",
      "Calus's Shadow",
      "/common/destiny2_content/icons/2663183a3f4383a9e49d0ea751a71ab3.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "113124080",
      "Contender's Shell",
      "/common/destiny2_content/icons/b4be50b8f7a198175de791f15932c2c7.jpg",
      SOURCE,
    ),
    item(
      "430065393",
      "Praetorian Ornament",
      "/common/destiny2_content/icons/3a90aa9938caa3864572b81bd6acde0a.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "1331851268",
      "Praetorian Ornament",
      "/common/destiny2_content/icons/ae64fd5a1033890ed97389619f85a167.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "3802263800",
      "Praetorian Ornament",
      "/common/destiny2_content/icons/78148083da8390521a486262f10429ed.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "136852797",
      "Sleeper Simulant Catalyst",
      "/common/destiny2_content/icons/013403d109a9563ee881830044177193.jpg",
      PRESTIGE_SOURCE,
    ),
  ],
};
