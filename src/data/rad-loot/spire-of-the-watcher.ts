import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Spire of the Watcher" Dungeon';

export const spireOfTheWatcherLoot: ActivityLootPage = {
  slug: "spire-of-the-watcher",
  title: "Spire of the Watcher",
  headerImageFile: "spire-of-the-watcher-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "TM-Earp Custom",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "2976233114",
          "TM-Earp Custom Hood",
          "/common/destiny2_content/icons/58443e545ea769cb7dff9704a0693678.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "918537443",
          "TM-Earp Custom Grips",
          "/common/destiny2_content/icons/1260de30c13c48cf0b1f31d9da692147.jpg",
          SOURCE,
        ),
        chest: item(
          "597199405",
          "TM-Earp Custom Vest",
          "/common/destiny2_content/icons/2c402be038567eae733640a934c2f7d9.jpg",
          SOURCE,
        ),
        legs: item(
          "2839517205",
          "TM-Earp Custom Chaps",
          "/common/destiny2_content/icons/149495842849691570e803825eb46037.jpg",
          SOURCE,
        ),
        classItem: item(
          "3006077984",
          "TM-Earp Custom Cloaked Stetson",
          "/common/destiny2_content/icons/f0652413c50e3f62b359bec5478fa4b5.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "TM-Cogburn Custom",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2599025960",
          "TM-Cogburn Custom Cover",
          "/common/destiny2_content/icons/9ec415c63252bca0f65e77008e9b7c76.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1480429241",
          "TM-Cogburn Custom Gauntlets",
          "/common/destiny2_content/icons/0ebb7a306a994413ea70bf544f9bf48b.jpg",
          SOURCE,
        ),
        chest: item(
          "3088058655",
          "TM-Cogburn Custom Plate",
          "/common/destiny2_content/icons/935f8baedc1403de85cc2f0ea25d1c94.jpg",
          SOURCE,
        ),
        legs: item(
          "119121067",
          "TM-Cogburn Custom Legguards",
          "/common/destiny2_content/icons/02ff76a3d6b812af6e9be885987f25d5.jpg",
          SOURCE,
        ),
        classItem: item(
          "506181038",
          "TM-Cogburn Custom Mark",
          "/common/destiny2_content/icons/fb0ad676bffab5bf8df7010df28a9fa8.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "TM-Moss Custom",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "2014814167",
          "TM-Moss Custom Hat",
          "/common/destiny2_content/icons/5c4481ea21a484955918eb886c5510a7.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1088225118",
          "TM-Moss Custom Gloves",
          "/common/destiny2_content/icons/a25fd0ed6fbe5eb4b43d77176ee6f44e.jpg",
          SOURCE,
        ),
        chest: item(
          "3185363346",
          "TM-Moss Custom Duster",
          "/common/destiny2_content/icons/d7bdbb187841c99d20a7def5dc4f88bc.jpg",
          SOURCE,
        ),
        legs: item(
          "1932168248",
          "TM-Moss Custom Pants",
          "/common/destiny2_content/icons/70f03c00a14a1284075b151e542736d9.jpg",
          SOURCE,
        ),
        classItem: item(
          "3780604323",
          "TM-Moss Custom Bond",
          "/common/destiny2_content/icons/32447bc71520295735cbe53d51adc6da.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "4174431791",
      "Hierarchy of Needs",
      "/common/destiny2_content/icons/8c32410000243e6024130f755b23fbe6.jpg",
      SOURCE,
    ),
    item(
      "3138208275",
      "Liminal Vigil",
      "/common/destiny2_content/icons/fc58eadcd477da1a3e584ee363bb078e.jpg",
      SOURCE,
    ),
    item(
      "8293111",
      "Long Arm",
      "/common/destiny2_content/icons/dd86f6bfb4f566edad870e9f6c5dc687.jpg",
      SOURCE,
    ),
    item(
      "4070357005",
      "Seventh Seraph Carbine",
      "/common/destiny2_content/icons/9accd37c7b06804618fc9557f3f2b480.jpg",
      SOURCE,
    ),
    item(
      "1555959830",
      "Seventh Seraph Officer Revolver",
      "/common/destiny2_content/icons/6b0275414044484c7f039e58781239ff.jpg",
      SOURCE,
    ),
    item(
      "487205709",
      "Terminus Horizon",
      "/common/destiny2_content/icons/00cca0594c0db3371104f01ab9c0bbd2.jpg",
      SOURCE,
    ),
    item(
      "2306182339",
      "Wilderflight",
      "/common/destiny2_content/icons/3d716eb7631167ec9ae7d2c642c5f0ae.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "2026109717",
      "Flight of Soteria",
      "/common/destiny2_content/icons/422e73a82b084fb29c197fdcfbc71412.jpg",
      SOURCE,
    ),
    item(
      "2017375168",
      "Into the Sunset",
      "/common/destiny2_content/icons/b363a52f7ae520aa9ce695f925b4b9fd.jpg",
      SOURCE,
    ),
    item(
      "2026109716",
      "Pillory Partition",
      "/common/destiny2_content/icons/3d3f3a5b8a73880956d13f31ee544e3a.jpg",
      SOURCE,
    ),
  ],
};
