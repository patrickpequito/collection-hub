import { getBungieApiKey } from "@/lib/env";

const BUNGIE_ORIGIN = "https://www.bungie.net";

type BungieResponse<T> = {
  Response: T;
  ErrorCode: number;
  Message: string;
};

type InventoryItemDefinition = {
  hash: number;
  displayProperties?: {
    name?: string;
    icon?: string;
  };
  itemTypeDisplayName?: string;
  preview?: {
    previewVendorHash?: number;
    derivedItemCategories?: Array<{
      categoryDescription?: string;
      items?: Array<{ itemHash: number }>;
    }>;
  };
};

const definitionCache = new Map<string, InventoryItemDefinition>();

async function bungieManifestGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BUNGIE_ORIGIN}${path}`, {
    headers: { "X-API-Key": getBungieApiKey() },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`Manifest request failed (${response.status})`);
  }

  const data = (await response.json()) as BungieResponse<T>;
  if (data.ErrorCode !== 1) {
    throw new Error(data.Message || "Unexpected manifest response");
  }

  return data.Response;
}

export async function fetchInventoryItemDefinition(
  itemHash: string,
): Promise<InventoryItemDefinition | null> {
  const cached = definitionCache.get(itemHash);
  if (cached) return cached;

  try {
    const definition = await bungieManifestGet<InventoryItemDefinition>(
      `/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`,
    );
    definitionCache.set(itemHash, definition);
    return definition;
  } catch {
    return null;
  }
}

export type ResolvedEververseItem = {
  itemHash: string;
  name: string;
  iconPath: string;
  itemType: string;
};

export async function resolveEververseDisplayItems(
  itemHash: string,
): Promise<ResolvedEververseItem[]> {
  const definition = await fetchInventoryItemDefinition(itemHash);
  if (!definition) {
    return [
      {
        itemHash,
        name: "Unknown item",
        iconPath: "",
        itemType: "Item",
      },
    ];
  }

  const derivedItems =
    definition.preview?.derivedItemCategories?.flatMap(
      (category) => category.items ?? [],
    ) ?? [];

  if (derivedItems.length > 0) {
    const resolved = await Promise.all(
      derivedItems.map(async (entry) => {
        const child = await fetchInventoryItemDefinition(String(entry.itemHash));
        return {
          itemHash: String(entry.itemHash),
          name: child?.displayProperties?.name ?? "Unknown item",
          iconPath: child?.displayProperties?.icon ?? "",
          itemType: child?.itemTypeDisplayName ?? "Item",
        };
      }),
    );
    return resolved;
  }

  return [
    {
      itemHash,
      name: definition.displayProperties?.name ?? "Unknown item",
      iconPath: definition.displayProperties?.icon ?? "",
      itemType: definition.itemTypeDisplayName ?? "Item",
    },
  ];
}
