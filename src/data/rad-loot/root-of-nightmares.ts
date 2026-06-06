import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const RON_SOURCE = 'Source: "Root of Nightmares" Raid';

export const rootOfNightmaresLoot: ActivityLootPage = {
  slug: "root-of-nightmares",
  title: "Root of Nightmares",
  headerImageFile: "root-of-nightmares-header.webp",
  armorSets: [
    {
      setName: "Trepidation",
      guardianClass: "hunter",
      pieces: {
        helmet: item("2710026903", "Mask of Trepidation", "/common/destiny2_content/icons/b9a9c7af9dc361cbce82065306dd1954.jpg", 'Source: "Root of Nightmares" Raid'),
        gauntlets: item("1783541022", "Grips of Trepidation", "/common/destiny2_content/icons/bf8d8155370ff20b69bb2e4d86c0ecd3.jpg", 'Source: "Root of Nightmares" Raid'),
        chest: item("2128835922", "Vest of Trepidation", "/common/destiny2_content/icons/595e87931bbc6cd8fb02182bb0f21136.jpg", 'Source: "Root of Nightmares" Raid'),
        legs: item("807905267", "Boots of Trepidation", "/common/destiny2_content/icons/beb976a29ce89ebda198060a5468cb2a.jpg", 'Source: "Root of Nightmares" Raid'),
        classItem: item("621315878", "Cloak of Trepidation", "/common/destiny2_content/icons/d22ae8b07b61ff80695dd483267dafad.jpg", 'Source: "Root of Nightmares" Raid'),
      },
    },
    {
      setName: "Agony",
      guardianClass: "titan",
      pieces: {
        helmet: item("2498186173", "Helm of Agony", "/common/destiny2_content/icons/e4aacdd616558bc624d20d132818edf2.jpg", 'Source: "Root of Nightmares" Raid'),
        gauntlets: item("630432767", "Gauntlets of Agony", "/common/destiny2_content/icons/53f6a0ea57758da28f4d78c7e7168961.jpg", 'Source: "Root of Nightmares" Raid'),
        chest: item("824228793", "Plate of Agony", "/common/destiny2_content/icons/70eb4aa0fad572d32ce1346c47368233.jpg", 'Source: "Root of Nightmares" Raid'),
        legs: item("2030907734", "Greaves of Agony", "/common/destiny2_content/icons/caf3ce8463b9ad19f374e53b6a3e6ed9.jpg", 'Source: "Root of Nightmares" Raid'),
        classItem: item("2138394740", "Mark of Agony", "/common/destiny2_content/icons/705397b68f052a487dd03b73402b6039.jpg", 'Source: "Root of Nightmares" Raid'),
      },
    },
    {
      setName: "Detestation",
      guardianClass: "warlock",
      pieces: {
        helmet: item("219584248", "Mask of Detestation", "/common/destiny2_content/icons/2281d9c9707d932817746416e462c9d3.jpg", 'Source: "Root of Nightmares" Raid'),
        gauntlets: item("683387721", "Wraps of Detestation", "/common/destiny2_content/icons/aa5219761c09cc6ed55cbe2852ba1296.jpg", 'Source: "Root of Nightmares" Raid'),
        chest: item("1916413519", "Robes of Detestation", "/common/destiny2_content/icons/a8f9110c2e8ecbc49e31a1c4260091ff.jpg", 'Source: "Root of Nightmares" Raid'),
        legs: item("975329563", "Boots of Detestation", "/common/destiny2_content/icons/3c0b716f9abd74f175c371eb78e808c5.jpg", 'Source: "Root of Nightmares" Raid'),
        classItem: item("2915322487", "Bond of Detestation", "/common/destiny2_content/icons/cb80b0acaaa9883e4c7c88383c2065da.jpg", 'Source: "Root of Nightmares" Raid'),
      },
    },
  ],
  weapons: [
    item("1471212226", "Acasia\'s Dejection", "/common/destiny2_content/icons/255be304412b4f0f3d880cb7e46ca256.jpg", 'Source: "Root of Nightmares" Raid'),
    item("1491665733", "Briar\'s Contempt", "/common/destiny2_content/icons/e2b14324d9a08cfe45d8f07b0f23e8c6.jpg", 'Source: "Root of Nightmares" Raid'),
    item("3371017761", "Conditional Finality", "/common/destiny2_content/icons/c9b4d65adcdfcadde871e5961ce912fb.jpg", 'Source: "Root of Nightmares" Raid'),
    item("2972949637", "Koraxis\'s Distress", "/common/destiny2_content/icons/8e56438089daea61617b735abd64088a.jpg", 'Source: "Root of Nightmares" Raid'),
    item("231031173", "Mykel\'s Reverence", "/common/destiny2_content/icons/a21c38a2e55d4e1ffb1c77751e2fe580.jpg", 'Source: "Root of Nightmares" Raid'),
    item("135029084", "Nessa\'s Oblation", "/common/destiny2_content/icons/44c66e95eddf29130064f5796fedb3d4.jpg", 'Source: "Root of Nightmares" Raid'),
    item("484515708", "Rufus\'s Fury", "/common/destiny2_content/icons/4b2875c89f540ce52d48dba19dac477e.jpg", 'Source: "Root of Nightmares" Raid'),
  ],
  timelostWeaponsTitle: "Adept Weapons",
  timelostWeapons: [
    item("3493494807", "Acasia\'s Dejection (Adept)", "/common/destiny2_content/icons/f6714b9eb7c317b8777d457939b0355f.jpg", 'Source: "Root of Nightmares" Raid'),
    item("2890082420", "Briar\'s Contempt (Adept)", "/common/destiny2_content/icons/7eb3bab7f1ef21d75bc6f1f32fa68fbe.jpg", 'Source: "Root of Nightmares" Raid'),
    item("495442100", "Koraxis\'s Distress (Adept)", "/common/destiny2_content/icons/fa3dfdfbce039e594a12a3276b330040.jpg", 'Source: "Root of Nightmares" Raid'),
    item("1986287028", "Mykel\'s Reverence (Adept)", "/common/destiny2_content/icons/8ba4444d3d5981b066aecc06dcf385d3.jpg", 'Source: "Root of Nightmares" Raid'),
    item("522366885", "Nessa\'s Oblation (Adept)", "/common/destiny2_content/icons/54e1130aa6dbd9e5c4e2d81063c60d91.jpg", 'Source: "Root of Nightmares" Raid'),
    item("342514437", "Rufus\'s Fury (Adept)", "/common/destiny2_content/icons/d97300af968982189795f000da4f3a97.jpg", 'Source: "Root of Nightmares" Raid'),
  ],
  other: [
    item("908153541", "A Good Night\'s Sleep", "/common/destiny2_content/icons/35ad1236cc60b36c160dde8e3fda90aa.jpg", 'Source: "Root of Nightmares" Raid'),
    item("3403636746", "Gift of Cruelty", "/common/destiny2_content/icons/ebdb895f62cc76e432c78d0982accea0.jpg", 'Source: "Root of Nightmares" Raid'),
    item("56137739", "Opaline Shatter", "/common/destiny2_content/icons/b35f9bb318a8e338f8802d03d74c0183.jpg", 'Source: "Root of Nightmares" Raid'),
    item("56137738", "Oxidized Lead", "/common/destiny2_content/icons/ea1c3937e62859b6c01c3e0dc15eb1e8.jpg", 'Source: "Root of Nightmares" Raid'),
    item("908153540", "Terrors Uprooted", "/common/destiny2_content/icons/9f121959eafcbbef4796bdea398f8e48.jpg", 'Source: "Root of Nightmares" Raid'),
  ],
};
