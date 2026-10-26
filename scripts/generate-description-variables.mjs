/**
 * Builds data/description-variables.json — values for the {var:hash} placeholders
 * Bungie puts in triumph descriptions ("Perform {var:…} tricks"). They are game
 * constants, read from a public profile, so descriptions read right when signed out.
 *
 * Usage: node scripts/generate-description-variables.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** Same public probe profile as the Nightmare Hunt / Wellspring lookups. */
const PROBE = "/Platform/Destiny2/3/Profile/4611686018473121985/?components=1200";

for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0 && !line.trim().startsWith("#") && !process.env[line.slice(0, eq).trim()]) {
    process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
}

const triumphs = readFileSync(resolve(root, "data/triumphs.json"), "utf8");
const hashes = new Set([...triumphs.matchAll(/"description": "[^"]*/g)].flatMap((m) => [...m[0].matchAll(/\{var:(\d+)\}/g)].map((v) => v[1])));

const response = await fetch(`https://www.bungie.net${PROBE}`, { headers: { "X-API-Key": process.env.BUNGIE_API_KEY } });
const profile = (await response.json()).Response;
const values = profile?.profileStringVariables?.data?.integerValuesByHash ?? {};
const characters = Object.values(profile?.characterStringVariables?.data ?? {});

const output = {};
for (const hash of hashes) {
  const value = values[hash] ?? characters.map((c) => c.integerValuesByHash?.[hash]).find((v) => v !== undefined);
  if (value !== undefined) output[hash] = value;
}
writeFileSync(resolve(root, "data/description-variables.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`description variables: ${Object.keys(output).length} of ${hashes.size}`);
