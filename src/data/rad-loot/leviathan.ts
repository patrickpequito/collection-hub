import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const LEVIATHAN_SOURCE = 'Source: "Leviathan" Raid';
const LEVIATHAN_PRESTIGE_SOURCE = 'Source: "Leviathan" Raid (Prestige)';

export const leviathanLoot: ActivityLootPage = {
  slug: "leviathan",
  title: "Leviathan",
  headerImageFile: "leviathan-header.webp",
  armorSetPreviewFiles: ["leviathan.webp", "leviathan-prestige.webp"],
  triumphPanel: {
    name: "Leviathan",
    description: 'Triumphs for the "Leviathan" raid.',
    iconPath:
      "/common/destiny2_content/icons/99dd675e20df42d2451400ceb3636223.png",
    recordHashes: [],
    records: [
      {
        recordHash: "749900395",
        name: "Grow Fat from Strength",
        description: 'Complete the "Leviathan" raid.',
        iconPath:
          "/common/destiny2_content/icons/cccae615320fc0f4cf1a848ac82e47d8.png",
        score: 0,
        forTitleGilding: false,
        progressStyle: "default",
        objectives: [],
        rewards: [],
      },
      {
        recordHash: "3369371997",
        name: "Calus Has Spoken",
        description: 'Complete the "Leviathan" raid on Prestige difficulty.',
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
      setName: "Ace-Defiant",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "641933202",
          "Helm of the Ace-Defiant",
          "/common/destiny2_content/icons/8a7d25ae1fb1b8f3845a09a021f1100c.jpg",
          LEVIATHAN_SOURCE,
        ),
        gauntlets: item(
          "917591018",
          "Grips of the Ace-Defiant",
          "/common/destiny2_content/icons/f2ef982685a15665ea33d736c354f9f0.jpg",
          LEVIATHAN_SOURCE,
        ),
        chest: item(
          "325434398",
          "Vest of the Ace-Defiant",
          "/common/destiny2_content/icons/1cb1ea87c4734d2c3a04c8fe4e9824ef.jpg",
          LEVIATHAN_SOURCE,
        ),
        legs: item(
          "30962015",
          "Boots of the Ace-Defiant",
          "/common/destiny2_content/icons/5c29e7f7869ae2e58fe35f991c108d8f.jpg",
          LEVIATHAN_SOURCE,
        ),
        classItem: item(
          "2147583688",
          "Spacewalk Cloak",
          "/common/destiny2_content/icons/a6247ff6c411583eaa4b0e9b93317aea.jpg",
          LEVIATHAN_SOURCE,
        ),
      },
    },
    {
      setName: "Rull",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "455108041",
          "Mask of Rull",
          "/common/destiny2_content/icons/f7afc52c99eaeb5083e5617ba6c33e90.jpg",
          LEVIATHAN_SOURCE,
        ),
        gauntlets: item(
          "1879942843",
          "Gauntlets of Rull",
          "/common/destiny2_content/icons/5e95ea54dcc48963281b9be1c36dbce6.jpg",
          LEVIATHAN_SOURCE,
        ),
        chest: item(
          "1390282760",
          "Chassis of Rull",
          "/common/destiny2_content/icons/d44ae5c8598e311db205f643fd32263b.jpg",
          LEVIATHAN_SOURCE,
        ),
        legs: item(
          "288406317",
          "Greaves of Rull",
          "/common/destiny2_content/icons/c4dfa02f0252bc369739ecda2951b2da.jpg",
          LEVIATHAN_SOURCE,
        ),
        classItem: item(
          "514586330",
          "Spacewalk Mark",
          "/common/destiny2_content/icons/497333077960142d80ade161dfc59a74.jpg",
          LEVIATHAN_SOURCE,
        ),
      },
    },
    {
      setName: "Fulminator",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "618662449",
          "Mask of the Fulminator",
          "/common/destiny2_content/icons/066a65b77ac2b152b0996e541ef87ce5.jpg",
          LEVIATHAN_SOURCE,
        ),
        gauntlets: item(
          "754149843",
          "Wraps of the Fulminator",
          "/common/destiny2_content/icons/cbd3cf1dcb4965a2543fe204fc07b882.jpg",
          LEVIATHAN_SOURCE,
        ),
        chest: item(
          "608074493",
          "Robes of the Fulminator",
          "/common/destiny2_content/icons/793fc6bf1c67a25cf6886fcf403b58c6.jpg",
          LEVIATHAN_SOURCE,
        ),
        legs: item(
          "64543269",
          "Boots of the Fulminator",
          "/common/destiny2_content/icons/1fafa97729cf2f9240e21c0caa9f3dc8.jpg",
          LEVIATHAN_SOURCE,
        ),
        classItem: item(
          "213803727",
          "Spacewalk Bond",
          "/common/destiny2_content/icons/a24aae5cc8a425114e627d220fbfdae3.jpg",
          LEVIATHAN_SOURCE,
        ),
      },
    },
    {
      setName: "Emperor's Agent",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "641933203",
          "Mask of the Emperor's Agent",
          "/common/destiny2_content/icons/45cfb7ab5bc53f901b4599de35a3dd52.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        gauntlets: item(
          "917591019",
          "Gloves of the Emperor's Agent",
          "/common/destiny2_content/icons/a2fe6841e062c4a61101546e245447f3.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        chest: item(
          "325434399",
          "Vest of the Emperor's Agent",
          "/common/destiny2_content/icons/6fb7a62d8e29f67be41348d7ce685b18.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        legs: item(
          "30962014",
          "Boots of the Emperor's Agent",
          "/common/destiny2_content/icons/82e6b8800c99fc48c49f178bba9de3d2.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        classItem: item(
          "1354679721",
          "Cloak of the Emperor's Agent",
          "/common/destiny2_content/icons/7d27bb373b7d6fe7ddd67d039d8ebd76.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
      },
    },
    {
      setName: "Emperor's Champion",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "455108040",
          "Helm of the Emperor's Champion",
          "/common/destiny2_content/icons/b6853afff936a636a23ef6e7cd04266e.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        gauntlets: item(
          "1879942842",
          "Gauntlets of the Emperor's Champion",
          "/common/destiny2_content/icons/223e4b25b16899dd89e4b8962f3f6a4c.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        chest: item(
          "1390282761",
          "Cuirass of the Emperor's Champion",
          "/common/destiny2_content/icons/6f41d7ccae2ddc760f3ae164a9acd9e2.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        legs: item(
          "288406316",
          "Greaves of the Emperor's Champion",
          "/common/destiny2_content/icons/9dd819e9fb02abb6cff44d6e673d1b84.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        classItem: item(
          "311429765",
          "Mark of the Emperor's Champion",
          "/common/destiny2_content/icons/237783ae0670b84ef52636184f754ebb.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
      },
    },
    {
      setName: "Emperor's Minister",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "618662448",
          "Headpiece of the Emperor's Minister",
          "/common/destiny2_content/icons/4abd338e12a0ee803dcbe08839640312.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        gauntlets: item(
          "754149842",
          "Wraps of the Emperor's Minister",
          "/common/destiny2_content/icons/65b7d032a118067a9e88f5476f2795d4.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        chest: item(
          "608074492",
          "Robes of the Emperor's Minister",
          "/common/destiny2_content/icons/9041d615ba4aa0c249ffd82e2b6ea765.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        legs: item(
          "64543268",
          "Boots of the Emperor's Minister",
          "/common/destiny2_content/icons/0633f1d0c9f72c7361c9678f542acca4.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
        classItem: item(
          "581908796",
          "Bond of the Emperor's Minister",
          "/common/destiny2_content/icons/a215e72509c71f285be5c515d2f5c18a.jpg",
          LEVIATHAN_PRESTIGE_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "3580904580",
      "Legend of Acrius",
      "/common/destiny2_content/icons/6de5f786f39bf827de8490e97b672ddb.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "3380742308",
      "Alone as a god",
      "/common/destiny2_content/icons/52d2c74f0abbdc5c559822af9863af5e.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "3906942101",
      "Conspirator",
      "/common/destiny2_content/icons/37f1c019f25826548e24bdedccbe6f99.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "2505533224",
      "Ghost Primus",
      "/common/destiny2_content/icons/6cb301481212e5c058b0c87dae1317de.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "3325744914",
      "Inaugural Address",
      "/common/destiny2_content/icons/1dd877d83de776e355ed666689845ba5.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "1018072983",
      "It Stared Back",
      "/common/destiny2_content/icons/85c18238b2b5c92ca49c79beee19accd.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "1128225405",
      "Midnight Coup",
      "/common/destiny2_content/icons/d5c1b1c3eaf09bbf7aa5592490c31aa0.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "3954531357",
      "Mob Justice",
      "/common/destiny2_content/icons/c8922c900bce5394c4837086eb03e800.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "3691881271",
      "Sins of the Past",
      "/common/destiny2_content/icons/204880460456462deacaa14ecc23ff04.jpg",
      LEVIATHAN_SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "3257147585",
      "Embrace His Name",
      "/common/destiny2_content/icons/e648a1cdcd8bbba4b0e30dae36c7f8a7.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "2984066626",
      "Splish Splash",
      "/common/destiny2_content/icons/2dd11fa1bde3cf373e6a6a59cab38e57.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "1667199810",
      "Good Dog",
      "/common/destiny2_content/icons/0caaf9909730d085f42d8edb2e93933e.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "1625974211",
      "Two Enter, One Leaves",
      "/common/destiny2_content/icons/eb2fc6053e63a8108663375c66640a85.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "812824526",
      "Take the Throne",
      "/common/destiny2_content/icons/f6da03010b44eb8156966b84c908ddcc.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "2107367383",
      "Glory to the Emperor",
      "/common/destiny2_content/icons/0fcd145b3491fd73580a305ab3459b54.jpg",
      LEVIATHAN_PRESTIGE_SOURCE,
    ),
    item(
      "1422712818",
      "Calus's Selected",
      "/common/destiny2_content/icons/56622ba132760e617d902977aadf41f7.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "1422712819",
      "Calus's Treasured",
      "/common/destiny2_content/icons/f9689efc349b213146291cea16cbbb3a.jpg",
      LEVIATHAN_PRESTIGE_SOURCE,
    ),
    item(
      "113124080",
      "Contender's Shell",
      "/common/destiny2_content/icons/b4be50b8f7a198175de791f15932c2c7.jpg",
      LEVIATHAN_SOURCE,
    ),
    item(
      "2912834745",
      "The Emperor's Pleasure",
      "/common/destiny2_content/icons/ca5af9ad3e852a06de74bb71e3babcaa.jpg",
      LEVIATHAN_PRESTIGE_SOURCE,
    ),
    item(
      "456628588",
      "Acrius Catalyst",
      "/common/destiny2_content/icons/3b4c1694f52b85f9fc1c57cb963dc36c.jpg",
      LEVIATHAN_PRESTIGE_SOURCE,
    ),
  ],
};
