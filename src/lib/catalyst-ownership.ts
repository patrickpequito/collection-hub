import catalystData from "../../public/data/catalysts.json";
import type { ItemHashIndex } from "@/lib/item-acquisition-index";
import type { CatalystCatalog } from "@/types/catalyst-item";

const catalog = catalystData as CatalystCatalog;

let indexPromise: Promise<ItemHashIndex> | null = null;

async function loadItemHashIndex(): Promise<ItemHashIndex> {
  if (!indexPromise) {
    indexPromise = import("../../public/data/item-hash-index.json").then(
      (mod) => mod.default as ItemHashIndex,
    );
  }
  return indexPromise;
}

async function expandWeaponHashes(hashes: Iterable<string>): Promise<Set<string>> {
  const itemIndex = await loadItemHashIndex();
  const expanded = new Set<string>();
  for (const hash of hashes) {
    expanded.add(hash);
    const name = itemIndex.hashToName[hash];
    if (name) {
      for (const alias of itemIndex.nameToHashes[name] ?? []) {
        expanded.add(alias);
      }
    }
  }
  return expanded;
}

/** DestinyRecordState.RecordRedeemed */
const RECORD_REDEEMED = 1;

function collectRedeemedRecordHashes(
  profileRecords?: Record<string, { state: number }>,
  characterRecordsByCharacter?: Record<
    string,
    { records?: Record<string, { state: number }> }
  >,
): Set<string> {
  const redeemed = new Set<string>();

  for (const [recordHash, record] of Object.entries(profileRecords ?? {})) {
    if ((record.state & RECORD_REDEEMED) !== 0) {
      redeemed.add(recordHash);
    }
  }

  for (const charRecords of Object.values(characterRecordsByCharacter ?? {})) {
    for (const [recordHash, record] of Object.entries(
      charRecords.records ?? {},
    )) {
      if ((record.state & RECORD_REDEEMED) !== 0) {
        redeemed.add(recordHash);
      }
    }
  }

  return redeemed;
}

/** Hashes for catalysts the account has finished (triumph or unlocked plug). */
export async function collectOwnedCatalystHashes(input: {
  profileRecords?: Record<string, { state: number }>;
  characterRecordsByCharacter?: Record<
    string,
    { records?: Record<string, { state: number }> }
  >;
  unlockedPlugHashes: Iterable<string>;
  /** Parent exotic weapons that are masterworked (catalyst required to MW exotics). */
  masterworkWeaponHashes?: Iterable<string>;
}): Promise<Set<string>> {
  const redeemed = collectRedeemedRecordHashes(
    input.profileRecords,
    input.characterRecordsByCharacter,
  );
  const unlockedPlugs = new Set(input.unlockedPlugHashes);
  const masterworkWeapons = await expandWeaponHashes(
    input.masterworkWeaponHashes ?? [],
  );
  const owned = new Set<string>();

  for (const catalyst of catalog.items) {
    const fromRecord =
      catalyst.recordHash !== undefined && redeemed.has(catalyst.recordHash);
    const fromPlug = catalyst.alternateItemHashes.some((hash) =>
      unlockedPlugs.has(hash),
    );
    const fromMasterwork = masterworkWeapons.has(catalyst.weaponHash);

    if (!fromRecord && !fromPlug && !fromMasterwork) continue;

    owned.add(catalyst.itemHash);
    for (const hash of catalyst.alternateItemHashes) {
      owned.add(hash);
    }
  }

  return owned;
}
