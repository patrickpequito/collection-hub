import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Equilibrium" Dungeon';

export const equilibriumLoot: ActivityLootPage = {
  slug: "equilibrium",
  title: "Equilibrium",
  headerImageFile: "equilibrium-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "Sage Protector",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "112779239",
          "Sage Protector Cowl",
          "/common/destiny2_content/icons/9b00fe395c967aad444781c60a3f30ce.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2354448750",
          "Sage Protector Grips",
          "/common/destiny2_content/icons/52638b17019c098c6c1da2f1982d8490.jpg",
          SOURCE,
        ),
        chest: item(
          "1867581826",
          "Sage Protector Vest",
          "/common/destiny2_content/icons/3f1ff9e43b32dacfc4ecedc8a1a4c1fa.jpg",
          SOURCE,
        ),
        legs: item(
          "142559592",
          "Sage Protector Strides",
          "/common/destiny2_content/icons/00f278de1522dd9b322ba9ac50d701e0.jpg",
          SOURCE,
        ),
        classItem: item(
          "1091577811",
          "Sage Protector Cloak",
          "/common/destiny2_content/icons/d492ae9a63a7fc7e0da93e7fac4fae2b.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Sage Protector",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "4118260899",
          "Sage Protector Helm",
          "/common/destiny2_content/icons/8bfb177435f932f248a8f998f0cdc381.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "919358834",
          "Sage Protector Gauntlets",
          "/common/destiny2_content/icons/2e8dedcd287d7b5eb2d2793d16672dac.jpg",
          SOURCE,
        ),
        chest: item(
          "279565494",
          "Sage Protector Plate",
          "/common/destiny2_content/icons/ef33e03c5da90f0f40e09c77c0bc26e8.jpg",
          SOURCE,
        ),
        legs: item(
          "1320597132",
          "Sage Protector Greaves",
          "/common/destiny2_content/icons/25d1125aede7166a834d413d5882426a.jpg",
          SOURCE,
        ),
        classItem: item(
          "3945736543",
          "Sage Protector Mark",
          "/common/destiny2_content/icons/ab6c58abbc55e00078912b046fd2d127.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Sage Protector",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1786011928",
          "Sage Protector Cover",
          "/common/destiny2_content/icons/4f7e906e79295eabeb487187af329509.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2249815529",
          "Sage Protector Gloves",
          "/common/destiny2_content/icons/fa5689a3d5f5e433b39f8055c66d37c4.jpg",
          SOURCE,
        ),
        chest: item(
          "640369263",
          "Sage Protector Robes",
          "/common/destiny2_content/icons/921a1c5e0de0a61d31ffe735a3633b9c.jpg",
          SOURCE,
        ),
        legs: item(
          "2541757371",
          "Sage Protector Boots",
          "/common/destiny2_content/icons/e435632848cfab6c7411f7463aed910a.jpg",
          SOURCE,
        ),
        classItem: item(
          "1887527934",
          "Sage Protector Bond",
          "/common/destiny2_content/icons/48861601b58e92ebcb5d3c66d5e37124.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "954563454",
      "Bitter End",
      "/common/destiny2_content/icons/7676ddf1e3306b5f61b7d58eadcef875.jpg",
      SOURCE,
    ),
    item(
      "4062069077",
      "Conspiracy Honed",
      "/common/destiny2_content/icons/c7fef3b2cd1832d11841b7f7e0b04604.jpg",
      SOURCE,
    ),
    item(
      "1685137410",
      "Heirloom",
      "/common/destiny2_content/icons/95e57b924511a206cee9fb6b8bab8ce2.jpg",
      SOURCE,
    ),
    item(
      "2873508409",
      "High Tyrant",
      "/common/destiny2_content/icons/c407c0039ceddedd9f6c43c7b1a49f1c.jpg",
      SOURCE,
    ),
    item(
      "1085743380",
      "Sullen Claw",
      "/common/destiny2_content/icons/2e37778d6c3cdcbd3d32819f735522c2.jpg",
      SOURCE,
    ),
    item(
      "71057630",
      "Voltaic Shade",
      "/common/destiny2_content/icons/943d41dc70ecc2b3d4d48ead9673cb5b.jpg",
      SOURCE,
    ),
    item(
      "1863583117",
      "Zealous Ideal",
      "/common/destiny2_content/icons/2e86eec32721d89f885b1b9c2b2f03f7.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "4104431769",
      "Arid Rambler",
      "/common/destiny2_content/icons/258b5460318c474abc3f0fc65c6fad67.jpg",
      SOURCE,
    ),
    item(
      "809980656",
      "Imperium Parade",
      "/common/destiny2_content/icons/122b63ac3e420ae0488c95c963bf46c9.jpg",
      SOURCE,
    ),
    item(
      "2680217523",
      "Imperium\'s Adversary",
      "/common/destiny2_content/icons/b4f0bda33a97ed66c9c842df6b67dc8d.jpg",
      SOURCE,
    ),
    item(
      "809980657",
      "Praxic Drape",
      "/common/destiny2_content/icons/c18b231fdfe9b98e7e08be35d1b80a30.jpg",
      SOURCE,
    ),
    item(
      "748692000",
      "Stand Alone",
      "/common/destiny2_content/icons/8f080409c876cd829d71b55a8250bc7b.jpg",
      SOURCE,
    ),
    item(
      "2043430167",
      "Static Data Shell",
      "/common/destiny2_content/icons/fc0887a4251772254e27c710036b7c56.jpg",
      SOURCE,
    ),
  ],
};
