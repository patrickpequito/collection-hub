import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Sundered Doctrine" Dungeon';

export const sunderedDoctrineLoot: ActivityLootPage = {
  slug: "sundered-doctrine",
  title: "Sundered Doctrine",
  headerImageFile: "sundered-doctrine-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "Flain",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "2146870895",
          "Mask of the Flain",
          "/common/destiny2_content/icons/439e83a802c148767ec097a597729259.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "431596278",
          "Grasps of the Flain",
          "/common/destiny2_content/icons/057cc7ed4d044e7e31d9d3c46ae8e107.jpg",
          SOURCE,
        ),
        chest: item(
          "4052335546",
          "Scales of the Flain",
          "/common/destiny2_content/icons/83477d938b3ef242ffbfd167e1d3281e.jpg",
          SOURCE,
        ),
        legs: item(
          "1643875408",
          "Hooks of the Flain",
          "/common/destiny2_content/icons/baf70f7185404f29a58d8507f5071c2e.jpg",
          SOURCE,
        ),
        classItem: item(
          "3276331403",
          "Husk\'s Cloak",
          "/common/destiny2_content/icons/26088873abb93f92e1faf659d938627d.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Flain",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "3781388955",
          "Skull of the Flain",
          "/common/destiny2_content/icons/46e37cf570d428aad6b4e0426fe88e82.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "945703242",
          "Grips of the Flain",
          "/common/destiny2_content/icons/e7305d165e48c70f5732b92cd88ead39.jpg",
          SOURCE,
        ),
        chest: item(
          "380371582",
          "Carapace of the Flain",
          "/common/destiny2_content/icons/e68733c1b666d1ef26a39a079b9684bc.jpg",
          SOURCE,
        ),
        legs: item(
          "3897001828",
          "Claws of the Flain",
          "/common/destiny2_content/icons/ac00f4ace056802acd15195323f4a449.jpg",
          SOURCE,
        ),
        classItem: item(
          "4004965895",
          "Attendant\'s Mark",
          "/common/destiny2_content/icons/3108097e1c1a654f5de473871e03bc6d.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Flain",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "2549679488",
          "Visage of the Flain",
          "/common/destiny2_content/icons/2b032267bb0cfa214205167753227848.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "115752785",
          "Reach of the Flain",
          "/common/destiny2_content/icons/3a10975aac8ca00925ef70cefd9f995e.jpg",
          SOURCE,
        ),
        chest: item(
          "3300886791",
          "Adornment of the Flain",
          "/common/destiny2_content/icons/b1b825b9aa4a4d41b470c47904e3fe0d.jpg",
          SOURCE,
        ),
        legs: item(
          "4241869859",
          "Talons of the Flain",
          "/common/destiny2_content/icons/ddd74fe8854ddef8b85753cb248a4156.jpg",
          SOURCE,
        ),
        classItem: item(
          "187348246",
          "Weaver\'s Bond",
          "/common/destiny2_content/icons/11ed461d1b2bb1b8d73a7f2e207e6201.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "331231237",
      "Finality\'s Auger",
      "/common/destiny2_content/icons/22f0588bf5ce837fc5f4f89e86693c1f.jpg",
      SOURCE,
    ),
    item(
      "2485881870",
      "Unloved",
      "/common/destiny2_content/icons/926deadea9095f16c24c3bea7e91178e.jpg",
      SOURCE,
    ),
    item(
      "1303313141",
      "Unsworn",
      "/common/destiny2_content/icons/dd0ae6e8b9aeccfcbec7d5971c48984c.jpg",
      SOURCE,
    ),
    item(
      "3360937899",
      "Unvoiced",
      "/common/destiny2_content/icons/0c30a57365acedf3d2b116c96edd0cfd.jpg",
      SOURCE,
    ),
    item(
      "2226158470",
      "Unworthy",
      "/common/destiny2_content/icons/6dc5d7c9cdda0240b3a21ef03711c39b.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "2993751041",
      "Future Proof",
      "/common/destiny2_content/icons/aa2362c4998657013fa4ff33b4bc61c2.jpg",
      SOURCE,
    ),
    item(
      "3992231360",
      "Last Erasure",
      "/common/destiny2_content/icons/8045f917902bdfb6d4c0c780ac0748e9.jpg",
      SOURCE,
    ),
    item(
      "3992231368",
      "Pyramid\'s Pilot",
      "/common/destiny2_content/icons/fc82b0d4375a8e7573f8d207b67f5acc.jpg",
      SOURCE,
    ),
    item(
      "3992231369",
      "Unsounded Depths",
      "/common/destiny2_content/icons/2bd89013766c8e31cab9adac4fddf233.jpg",
      SOURCE,
    ),
  ],
};
