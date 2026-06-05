import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const KF_SOURCE = 'Source: "King\'s Fall" Raid';

export const kingsFallLoot: ActivityLootPage = {
  slug: "kings-fall",
  title: "King's Fall",
  headerImageFile: "kings-fall-header.webp",
  armorSets: [
    {
      setName: "Darkhollow",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "1656833637",
          "Darkhollow Mask",
          "/common/destiny2_content/icons/9d9efbe59a7eaa9e98218682972ee388.jpg",
          KF_SOURCE,
        ),
        gauntlets: item(
          "2437510452",
          "Darkhollow Grasps",
          "/common/destiny2_content/icons/b74049aa88629eb1f03a761ec9b96849.jpg",
          KF_SOURCE,
        ),
        chest: item(
          "169689932",
          "Darkhollow Chiton",
          "/common/destiny2_content/icons/589a68c537dede75694e35d5e0c86cae.jpg",
          KF_SOURCE,
        ),
        legs: item(
          "716885299",
          "Darkhollow Treads",
          "/common/destiny2_content/icons/614589979057cca209a09bbc5a01c339.jpg",
          KF_SOURCE,
        ),
        classItem: item(
          "1479604326",
          "Darkhollow Mantle",
          "/common/destiny2_content/icons/7afce71ac5b24be097fc3b367eae78b2.jpg",
          KF_SOURCE,
        ),
      },
    },
    {
      setName: "War Numen's",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "26254737",
          "War Numen's Crown",
          "/common/destiny2_content/icons/1706a0543a5a8549ea0be30979fd3a8b.jpg",
          KF_SOURCE,
        ),
        gauntlets: item(
          "2937773672",
          "War Numen's Fist",
          "/common/destiny2_content/icons/7084b10a0a9580035b5a53f5c9e5a2fc.jpg",
          KF_SOURCE,
        ),
        chest: item(
          "1066132704",
          "War Numen's Chest",
          "/common/destiny2_content/icons/730bc426a67e611a02ffbad0030db47c.jpg",
          KF_SOURCE,
        ),
        legs: item(
          "4039112898",
          "War Numen's Boots",
          "/common/destiny2_content/icons/9ab2efd81d6a5acd7785514836a4292c.jpg",
          KF_SOURCE,
        ),
        classItem: item(
          "376168733",
          "War Numen's Mark",
          "/common/destiny2_content/icons/bb3da19b52d4a838247d6fe00a9fc9a7.jpg",
          KF_SOURCE,
        ),
      },
    },
    {
      setName: "Worm God",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1537426592",
          "Mouth of Ur",
          "/common/destiny2_content/icons/7ed5224ab887bc57f03861b39a00f306.jpg",
          KF_SOURCE,
        ),
        gauntlets: item(
          "884969196",
          "Grasp of Eir",
          "/common/destiny2_content/icons/4f5b8762c1faedbfcfc9c1fe9ec23c08.jpg",
          KF_SOURCE,
        ),
        chest: item(
          "2939738676",
          "Chasm of Yul",
          "/common/destiny2_content/icons/3dbe92ce844d91b4e7915d356c63041e.jpg",
          KF_SOURCE,
        ),
        legs: item(
          "1530701334",
          "Path of Xol",
          "/common/destiny2_content/icons/0a8728d9b478e690122b96285cc8599c.jpg",
          KF_SOURCE,
        ),
        classItem: item(
          "766618550",
          "Bond of the Wormlore",
          "/common/destiny2_content/icons/c8d7455cd3550d9b12f7933cd9757ae8.jpg",
          KF_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "694218974",
      "Smite of Merain",
      "/common/destiny2_content/icons/e47393574637ea49389e500ab365b311.jpg",
      KF_SOURCE,
    ),
    item(
      "3228096719",
      "Defiance of Yasmin",
      "/common/destiny2_content/icons/0d2362114689cf93a8cb8b9c0eac5097.jpg",
      KF_SOURCE,
    ),
    item(
      "3969066556",
      "Midha's Reckoning",
      "/common/destiny2_content/icons/e8b9e6f728f8b3705fbf38aff730ff97.jpg",
      KF_SOURCE,
    ),
    item(
      "431721920",
      "Zaouli's Bane",
      "/common/destiny2_content/icons/d11aa112b88dc2cbf48706fdad606710.jpg",
      KF_SOURCE,
    ),
    item(
      "479338636",
      "Doom of Chelchis",
      "/common/destiny2_content/icons/d439b1b560e696b8214362b12364da6d.jpg",
      KF_SOURCE,
    ),
    item(
      "1058857259",
      "Qullim's Terminus",
      "/common/destiny2_content/icons/7e045bc7b88d478a54913ddc6bd7f373.jpg",
      KF_SOURCE,
    ),
    item(
      "1802135586",
      "Touch of Malice",
      "/common/destiny2_content/icons/106a8a40a6e55b5ec5088a26d1ed979d.jpg",
      KF_SOURCE,
    ),
  ],
  timelostWeaponsTitle: "Harrowed Weapons",
  timelostWeapons: [
    item(
      "3407395594",
      "Smite of Merain (Harrowed)",
      "/common/destiny2_content/icons/3fcdc4c1f4f866df39248a296ac710df.jpg",
      KF_SOURCE,
    ),
    item(
      "3503019618",
      "Defiance of Yasmin (Harrowed)",
      "/common/destiny2_content/icons/b82e8de6477f03b716e90d5be299f70b.jpg",
      KF_SOURCE,
    ),
    item(
      "3904516037",
      "Midha's Reckoning (Harrowed)",
      "/common/destiny2_content/icons/a49117b831284796386bdf04ae34b630.jpg",
      KF_SOURCE,
    ),
    item(
      "291092617",
      "Zaouli's Bane (Harrowed)",
      "/common/destiny2_content/icons/22009ab433d96fee661b6be12cc734b2.jpg",
      KF_SOURCE,
    ),
    item(
      "1184692845",
      "Doom of Chelchis (Harrowed)",
      "/common/destiny2_content/icons/2d98a8b5e97febf8744ad3df1d94d051.jpg",
      KF_SOURCE,
    ),
    item(
      "2811165950",
      "Qullim's Terminus (Harrowed)",
      "/common/destiny2_content/icons/c449217d255f5b210037d069bde484b2.jpg",
      KF_SOURCE,
    ),
  ],
  other: [
    item(
      "528682407",
      "Ossein Earthcarver",
      "/common/destiny2_content/icons/b3cccef8559414c766720f4c13d0d5c3.jpg",
      KF_SOURCE,
    ),
    item(
      "3889064943",
      "Ossified Skycarver",
      "/common/destiny2_content/icons/9f2bd211fd99769b850dc1bdba60a9f9.jpg",
      KF_SOURCE,
    ),
    item(
      "3970180846",
      "Woven Resilience",
      "/common/destiny2_content/icons/4a0b3adfcabccceb4af92b6c310a4a52.jpg",
      KF_SOURCE,
    ),
    item(
      "2847579030",
      "Before Aurora",
      "/common/destiny2_content/icons/4ad87ea2a439ad1a8ec12210338055fb.jpg",
      KF_SOURCE,
    ),
    item(
      "866034301",
      "King No More",
      "/common/destiny2_content/icons/2ecd3b7e3ad6e64e80464b618a2409e4.jpg",
      KF_SOURCE,
    ),
    item(
      "3204751449",
      "Silkworm Weave",
      "/common/destiny2_content/icons/6fc8c94eb434d0c33f97155d72213935.jpg",
      KF_SOURCE,
    ),
    item(
      "983194593",
      "Ancient Wisdom",
      "/common/destiny2_content/icons/3f5090aefd3119b7258df35f72c1ce43.jpg",
      KF_SOURCE,
    ),
  ],
};
