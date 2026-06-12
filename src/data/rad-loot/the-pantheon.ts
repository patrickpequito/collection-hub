import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const PANTHEON_SOURCE = "Source: Pantheon";

export const thePantheonLoot: ActivityLootPage = {
  slug: "the-pantheon",
  title: "Pantheon 2.0",
  headerImageFile: "the-pantheon-header.webp",
  armorSets: [
    {
      setName: "Pantheos Resplendent",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "1074455580",
          "Pantheos Resplendent Mask",
          "/common/destiny2_content/icons/7e85b0b4d539f4ee58a9353fc258b212.jpg",
          PANTHEON_SOURCE,
        ),
        gauntlets: item(
          "2429332885",
          "Pantheos Resplendent Grasps",
          "/common/destiny2_content/icons/79ccd6b376a6414c8930fd761b6b0c7f.jpg",
          PANTHEON_SOURCE,
        ),
        chest: item(
          "751380107",
          "Pantheos Resplendent Vest",
          "/common/destiny2_content/icons/7986813114fee45a647901ca1e2ced31.jpg",
          PANTHEON_SOURCE,
        ),
        legs: item(
          "176521975",
          "Pantheos Resplendent Strides",
          "/common/destiny2_content/icons/7f5c872a6463b808631d5b3c6f022265.jpg",
          PANTHEON_SOURCE,
        ),
        classItem: item(
          "3827624354",
          "Pantheos Resplendent Cloak",
          "/common/destiny2_content/icons/c446c3f1372d1a1826b067eb40500ae3.jpg",
          PANTHEON_SOURCE,
        ),
      },
    },
    {
      setName: "Pantheos Resplendent",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2145853080",
          "Pantheos Resplendent Helm",
          "/common/destiny2_content/icons/096ca9c4666f78fdaf910db296cb7c43.jpg",
          PANTHEON_SOURCE,
        ),
        gauntlets: item(
          "2609656681",
          "Pantheos Resplendent Gauntlets",
          "/common/destiny2_content/icons/a6fc61dee80b948fda5c51ff33950044.jpg",
          PANTHEON_SOURCE,
        ),
        chest: item(
          "1774949103",
          "Pantheos Resplendent Plate",
          "/common/destiny2_content/icons/44e76fea51365dcd5671bfc997c0a2a1.jpg",
          PANTHEON_SOURCE,
        ),
        legs: item(
          "2901598523",
          "Pantheos Resplendent Greaves",
          "/common/destiny2_content/icons/9d29a3513cdbb05851489d064d0ae68f.jpg",
          PANTHEON_SOURCE,
        ),
        classItem: item(
          "3022107774",
          "Pantheos Resplendent Mark",
          "/common/destiny2_content/icons/6e4e7c85b3aa7486640c7737a53048c5.jpg",
          PANTHEON_SOURCE,
        ),
      },
    },
    {
      setName: "Pantheos Resplendent",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "3773004861",
          "Pantheos Resplendent Hood",
          "/common/destiny2_content/icons/3caf353b02e4910b090cd1c23a6b672f.jpg",
          PANTHEON_SOURCE,
        ),
        gauntlets: item(
          "2235536812",
          "Pantheos Resplendent Gloves",
          "/common/destiny2_content/icons/6477b887ee36eee57b7b30929ed267df.jpg",
          PANTHEON_SOURCE,
        ),
        chest: item(
          "2089000948",
          "Pantheos Resplendent Robes",
          "/common/destiny2_content/icons/0d111e1759c11c0a8931ca01ebbcb5ff.jpg",
          PANTHEON_SOURCE,
        ),
        legs: item(
          "3305726422",
          "Pantheos Resplendent Boots",
          "/common/destiny2_content/icons/758c89ef1b627b637f8714b037d5081d.jpg",
          PANTHEON_SOURCE,
        ),
        classItem: item(
          "2832830921",
          "Pantheos Resplendent Bond",
          "/common/destiny2_content/icons/2b451f66a4559bc278edd3a996c4f963.jpg",
          PANTHEON_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "4158265643",
      "Reckless Oracle",
      "/common/destiny2_content/icons/af58615844b44293f5911ccaae913804.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "830651379",
      "Chattering Bone",
      "/common/destiny2_content/icons/886c1372ece5e30e6aee0fdfebf65bed.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "3647341740",
      "Zaouli's Bane",
      "/common/destiny2_content/icons/d11aa112b88dc2cbf48706fdad606710.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "1523151869",
      "Threat Level",
      "/common/destiny2_content/icons/b69872f33e6e36f254ccb7580a84a0cd.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "3779290676",
      "Bane of Sorrow",
      "/common/destiny2_content/icons/44a863562e1d27a22ac942ee32c4de51.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "353884603",
      "Alone as a god",
      "/common/destiny2_content/icons/52d2c74f0abbdc5c559822af9863af5e.jpg",
      PANTHEON_SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "707041059",
      "Calus Conquered",
      "/common/destiny2_content/icons/7e1f5ddddf63ff679afdd2c7a4c403cb.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "707041058",
      "Morgeth Mastered",
      "/common/destiny2_content/icons/78a94beb470d9b8d41e82972f5999c9f.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "690263480",
      "Insurrection Eradicated",
      "/common/destiny2_content/icons/76411af400fc4a5c71bcd8ca50882176.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "690263483",
      "Warrior Resplendent",
      "/common/destiny2_content/icons/771bc09864bd32d5f4786ca2f5679449.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "690263482",
      "Hall of the Gods",
      "/common/destiny2_content/icons/8cefd5b855b35d2448aaad6309b46b24.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "2139183278",
      "Orbiter",
      "/common/destiny2_content/icons/6d7bb4989b50c88f291b6606a1ebb44b.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "1928599170",
      "Far-Traveling Shell",
      "/common/destiny2_content/icons/2b58ca5a9168f06119395e18ee72ea11.jpg",
      PANTHEON_SOURCE,
    ),
    item(
      "4041790996",
      "Gilded Record",
      "/common/destiny2_content/icons/f6105ba2b5c3122acefe34eda137914f.jpg",
      PANTHEON_SOURCE,
    ),
  ],
};
