import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const ST_SOURCE = 'Source: "The Shattered Throne" Dungeon';

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
      setName: "Reverie Dawn",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "2804026582",
          "Reverie Dawn Casque",
          "/common/destiny2_content/icons/af81aa219cc82db859c9a6cea4377bdd.jpg",
          ST_SOURCE,
        ),
        gauntlets: item(
          "4008120231",
          "Reverie Dawn Grasps",
          "/common/destiny2_content/icons/9ed2208f882fd6397e2ec4b1d799972f.jpg",
          ST_SOURCE,
        ),
        chest: item(
          "3368092113",
          "Reverie Dawn Hauberk",
          "/common/destiny2_content/icons/de7bf261be9ee014d90b626c4b80e48b.jpg",
          ST_SOURCE,
        ),
        legs: item(
          "3185383401",
          "Reverie Dawn Strides",
          "/common/destiny2_content/icons/3cd701b6ee5852d738fe12851cdc772d.jpg",
          ST_SOURCE,
        ),
        classItem: item(
          "844097260",
          "Reverie Dawn Cloak",
          "/common/destiny2_content/icons/368a106e8247b652aacbe5fa57843a8c.jpg",
          ST_SOURCE,
        ),
      },
    },
    {
      setName: "Reverie Dawn",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "1472713738",
          "Reverie Dawn Helm",
          "/common/destiny2_content/icons/459d3005c8f02562fab317a0da5fc2f9.jpg",
          ST_SOURCE,
        ),
        gauntlets: item(
          "1478378067",
          "Reverie Dawn Gauntlets",
          "/common/destiny2_content/icons/909278e091adeeaadd8587e57a6a8c16.jpg",
          ST_SOURCE,
        ),
        chest: item(
          "2561756285",
          "Reverie Dawn Plate",
          "/common/destiny2_content/icons/802c83f2da9c2f198037506c148c51fe.jpg",
          ST_SOURCE,
        ),
        legs: item(
          "788771493",
          "Reverie Dawn Greaves",
          "/common/destiny2_content/icons/b5d7cb4a26d7859e8564e8e1b6982516.jpg",
          ST_SOURCE,
        ),
        classItem: item(
          "4023744176",
          "Reverie Dawn Mark",
          "/common/destiny2_content/icons/bfacdc2476fca0525be9eb441442a300.jpg",
          ST_SOURCE,
        ),
      },
    },
    {
      setName: "Reverie Dawn",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1076538039",
          "Reverie Dawn Hood",
          "/common/destiny2_content/icons/028311a13ba9a2502ff8f78fd18914ae.jpg",
          ST_SOURCE,
        ),
        gauntlets: item(
          "150052158",
          "Reverie Dawn Gloves",
          "/common/destiny2_content/icons/966d94a593a68415d5e7fd305faa3269.jpg",
          ST_SOURCE,
        ),
        chest: item(
          "757360370",
          "Reverie Dawn Tabard",
          "/common/destiny2_content/icons/22a5030321fef6b5ccfb767ed8bda2e9.jpg",
          ST_SOURCE,
        ),
        legs: item(
          "569434520",
          "Reverie Dawn Boots",
          "/common/destiny2_content/icons/8a250dd89a527d2bf79e638b58da7a59.jpg",
          ST_SOURCE,
        ),
        classItem: item(
          "1394177923",
          "Reverie Dawn Bond",
          "/common/destiny2_content/icons/81337c7ab48ea52f19062101229d7a53.jpg",
          ST_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "3723679465",
      "Waking Vigil",
      "/common/destiny2_content/icons/2292e2d493b8ecf2cbf8e47541475004.jpg",
      ST_SOURCE,
    ),
    item(
      "3242168339",
      "Vouchsafe",
      "/common/destiny2_content/icons/873001b5ee5ed8c0175d88202cabd715.jpg",
      ST_SOURCE,
    ),
    item(
      "640114618",
      "Tigerspite",
      "/common/destiny2_content/icons/2c48ce32f112ccad3ba09dc67718d6bf.jpg",
      ST_SOURCE,
    ),
    item(
      "3297863558",
      "Twilight Oath",
      "/common/destiny2_content/icons/5baeb68f78976816e0ef47d02d5a33fb.jpg",
      ST_SOURCE,
    ),
    item(
      "346136302",
      "Retold Tale",
      "/common/destiny2_content/icons/760fec20e7c73486d928294e71cab18c.jpg",
      ST_SOURCE,
    ),
    item(
      "1644160541",
      "Abide the Return",
      "/common/destiny2_content/icons/a181acd0a1aaa082980cfed6ee2805fe.jpg",
      ST_SOURCE,
    ),
    item(
      "2721249463",
      "Tyranny of Heaven",
      "/common/destiny2_content/icons/b4d39e31c777026b40e6acf2f7c6f720.jpg",
      ST_SOURCE,
    ),
    item(
      "3740842661",
      "Sleepless",
      "/common/destiny2_content/icons/6dd05a5ffa684e38a372122732c5985c.jpg",
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
