import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const VOD_SOURCE = 'Source: "Vow of the Disciple" Raid';

export const vowOfTheDiscipleLoot: ActivityLootPage = {
  slug: "vow-of-the-disciple",
  title: "Vow of the Disciple",
  headerImageFile: "vow-of-the-disciple-header.webp",
  armorSets: [
    {
      setName: "Resonant Fury",
      guardianClass: "hunter",
      pieces: {
        helmet: item("1649346047", "Resonant Fury Mask", "/common/destiny2_content/icons/c5c3f94bc0480d09df1d41c2da8ae5dc.jpg", 'Source: "Vow of the Disciple" Raid'),
        gauntlets: item("1583213254", "Resonant Fury Grips", "/common/destiny2_content/icons/da8669bdb50ef263019c5015c7827cc9.jpg", 'Source: "Vow of the Disciple" Raid'),
        chest: item("3487540074", "Resonant Fury Vest", "/common/destiny2_content/icons/4cf653856fc76709add5446ea9b37e79.jpg", 'Source: "Vow of the Disciple" Raid'),
        legs: item("987005387", "Resonant Fury Strides", "/common/destiny2_content/icons/ca468462234b47437d0c21aa3daa91d5.jpg", 'Source: "Vow of the Disciple" Raid'),
        classItem: item("1036946254", "Resonant Fury Cloak", "/common/destiny2_content/icons/cad952fe45a5540e0d351ea73e2efa09.jpg", 'Source: "Vow of the Disciple" Raid'),
      },
    },
    {
      setName: "Resonant Fury",
      guardianClass: "titan",
      pieces: {
        helmet: item("362541459", "Resonant Fury Helm", "/common/destiny2_content/icons/055e3c4032a12077f51518b70a87eea1.jpg", 'Source: "Vow of the Disciple" Raid'),
        gauntlets: item("2150515362", "Resonant Fury Gauntlets", "/common/destiny2_content/icons/4f221010196c2d8ec78f3f573d8823ff.jpg", 'Source: "Vow of the Disciple" Raid'),
        chest: item("1627640710", "Resonant Fury Plate", "/common/destiny2_content/icons/c79a9f20d449419d6d8a68d8c990818d.jpg", 'Source: "Vow of the Disciple" Raid'),
        legs: item("365727964", "Resonant Fury Greaves", "/common/destiny2_content/icons/b4f594335d373df578f14bfc2206c573.jpg", 'Source: "Vow of the Disciple" Raid'),
        classItem: item("2179092242", "Resonant Fury Mark", "/common/destiny2_content/icons/366f9700c370b36f040a3181cdabbfde.jpg", 'Source: "Vow of the Disciple" Raid'),
      },
    },
    {
      setName: "Resonant Fury",
      guardianClass: "warlock",
      pieces: {
        helmet: item("482364597", "Resonant Fury Cowl", "/common/destiny2_content/icons/0b6ec4f07b0de0f65137f43088bae80f.jpg", 'Source: "Vow of the Disciple" Raid'),
        gauntlets: item("1656263403", "Resonant Fury Gloves", "/common/destiny2_content/icons/3db02161ecebd7b5112c6375a9801cd8.jpg", 'Source: "Vow of the Disciple" Raid'),
        chest: item("3265935868", "Resonant Fury Robes", "/common/destiny2_content/icons/0ed8a42d5d6734931481de70798bae95.jpg", 'Source: "Vow of the Disciple" Raid'),
        legs: item("664396334", "Resonant Fury Boots", "/common/destiny2_content/icons/4f518fcdd08f21a5e2a6070b974f15b6.jpg", 'Source: "Vow of the Disciple" Raid'),
        classItem: item("256905329", "Resonant Fury Bond", "/common/destiny2_content/icons/96dfda921d5f4d391da214fbfca8bcb0.jpg", 'Source: "Vow of the Disciple" Raid'),
      },
    },
  ],
  weapons: [
    item("999767358", "Cataclysmic", "/common/destiny2_content/icons/a180748fde0e20e450b841663c388833.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("3505113722", "Collective Obligation", "/common/destiny2_content/icons/238ab90ba2f858ebb8a5a1797a13fdd4.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("768621510", "Deliverance", "/common/destiny2_content/icons/b32b09e7a3e0cf827ca1bea39dc71d05.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("613334176", "Forbearance", "/common/destiny2_content/icons/2222167aadddbfe4954b9710784c1f6e.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("3428521585", "Insidious", "/common/destiny2_content/icons/43022ab2098d527e2ab42d108a0c17da.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("2534546147", "Lubrae\'s Ruin", "/common/destiny2_content/icons/53d4a204d26117fb165185fd575b5f4a.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("3886416794", "Submission", "/common/destiny2_content/icons/4d596b18d607700aca914f348fa188f6.jpg", 'Source: "Vow of the Disciple" Raid'),
  ],
  timelostWeaponsTitle: "Adept Weapons",
  timelostWeapons: [
    item("2886339027", "Cataclysmic (Adept)", "/common/destiny2_content/icons/1743ef015a30466edce0d45460127552.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("2943293195", "Deliverance (Adept)", "/common/destiny2_content/icons/541f69a657fedd37c46c2d0661f5cc77.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("4038592169", "Forbearance (Adept)", "/common/destiny2_content/icons/33e60ffc54246375a76f7009f34c91ad.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("786352912", "Insidious (Adept)", "/common/destiny2_content/icons/e0ae0d1fde47d065f6aac35fa9abfae4.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("1466006054", "Lubrae\'s Ruin (Adept)", "/common/destiny2_content/icons/22f59f268081033c9a55d1bb9716ac62.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("1941816543", "Submission (Adept)", "/common/destiny2_content/icons/fb723dd77d609e7a312924f800b50953.jpg", 'Source: "Vow of the Disciple" Raid'),
  ],
  other: [
    item("1782474707", "Divinity\'s Caress", "/common/destiny2_content/icons/1ba3b20688f5507ce69abbacd16af627.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("1782474706", "Echoed Anger", "/common/destiny2_content/icons/37afc90d65f023c5cb0d2669cc09ffac.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("787024996", "Light of the Dark Sun", "/common/destiny2_content/icons/1b66639f98fa5936210ad1a1a2103ebf.jpg", 'Source: "Vow of the Disciple" Raid'),
    item("787024999", "The Cleaver", "/common/destiny2_content/icons/43701237a748a29d458aca9e9b43324f.jpg", 'Source: "Vow of the Disciple" Raid'),
  ],
};
