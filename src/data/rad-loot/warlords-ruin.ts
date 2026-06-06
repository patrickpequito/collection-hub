import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Warlord\'s Ruin" Dungeon';

export const warlordsRuinLoot: ActivityLootPage = {
  slug: "warlords-ruin",
  title: "Warlord's Ruin",
  headerImageFile: "warlords-ruin-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "Dark Age",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "220527011",
          "Dark Age Mask",
          "/common/destiny2_content/icons/b472806e083eaf8ce1d562884c28251a.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1316592242",
          "Dark Age Grips",
          "/common/destiny2_content/icons/86a7a6d8164fd2f7e74e883ce4d89dcb.jpg",
          SOURCE,
        ),
        chest: item(
          "1450838966",
          "Dark Age Harness",
          "/common/destiny2_content/icons/2265ffb3b8914146b5fbc2b455e7e172.jpg",
          SOURCE,
        ),
        legs: item(
          "1717830540",
          "Dark Age Strides",
          "/common/destiny2_content/icons/c57d5e1d791a773f91a2002041b545a1.jpg",
          SOURCE,
        ),
        classItem: item(
          "822042719",
          "Dark Age Cloak",
          "/common/destiny2_content/icons/236a2f3982ac44a5a6b9a7c999e89f91.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Dark Age",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2792429007",
          "Dark Age Helm",
          "/common/destiny2_content/icons/eb4cfb7dae46e6f2bbf64762ddc10751.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "652593750",
          "Dark Age Gauntlets",
          "/common/destiny2_content/icons/1e531efd990d8623e9b420648c18c0ea.jpg",
          SOURCE,
        ),
        chest: item(
          "3788388762",
          "Dark Age Chestrig",
          "/common/destiny2_content/icons/d4c0cabaf876a70b1853cc8a2681313f.jpg",
          SOURCE,
        ),
        legs: item(
          "1864873008",
          "Dark Age Sabatons",
          "/common/destiny2_content/icons/fadd708699a24d949d95cfd461ffb0e1.jpg",
          SOURCE,
        ),
        classItem: item(
          "3012281579",
          "Dark Age Mark",
          "/common/destiny2_content/icons/35d9c3a8ff645f931cd8ce19cab04ea5.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Dark Age",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "3007862180",
          "Dark Age Visor",
          "/common/destiny2_content/icons/ba9ae3a4b40d950f43c8439b57dec6d2.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2572175997",
          "Dark Age Gloves",
          "/common/destiny2_content/icons/9f2a6cd720b32f9a425622dbf4570d69.jpg",
          SOURCE,
        ),
        chest: item(
          "787709443",
          "Dark Age Overcoat",
          "/common/destiny2_content/icons/c74d928973349a439c3bd407d142a3dd.jpg",
          SOURCE,
        ),
        legs: item(
          "601360799",
          "Dark Age Legbraces",
          "/common/destiny2_content/icons/5d066f084e5601dd0e3f4b320e3e30e6.jpg",
          SOURCE,
        ),
        classItem: item(
          "3981499770",
          "Dark Age Bond",
          "/common/destiny2_content/icons/2922c181788524c0897e92ffa7f27681.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "3886719505",
      "Buried Bloodline",
      "/common/destiny2_content/icons/fcae8edcd35227d35fca0a108d831840.jpg",
      SOURCE,
    ),
    item(
      "3668817296",
      "Dragoncult Sickle",
      "/common/destiny2_content/icons/827efcc482b67373c1d854670fe861f5.jpg",
      SOURCE,
    ),
    item(
      "3381450498",
      "Indebted Kindness",
      "/common/destiny2_content/icons/352833d18ac3305cae2b0e026de06554.jpg",
      SOURCE,
    ),
    item(
      "2806569825",
      "Naeem\'s Lance",
      "/common/destiny2_content/icons/eb3209b52d9833cdd7d2cf462eb9fb20.jpg",
      SOURCE,
    ),
    item(
      "839344841",
      "Vengeful Whisper",
      "/common/destiny2_content/icons/6e6730467f11f156beace778dc748bce.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "1465090517",
      "Shattered Fortress",
      "/common/destiny2_content/icons/93db607e87f760be76660070813134b6.jpg",
      SOURCE,
    ),
    item(
      "1465090516",
      "Tattered Regalia",
      "/common/destiny2_content/icons/8f578ecd82ec7e6453aee49542d7425a.jpg",
      SOURCE,
    ),
    item(
      "4141762315",
      "Zira\'s Shell",
      "/common/destiny2_content/icons/f92901c181e9f928abd428b7956a0eca.jpg",
      SOURCE,
    ),
  ],
};
