#!/usr/bin/env node
/**
 * Exit 0 when any of the given JSON data files changed in a meaningful way since
 * the last commit, 1 when only bookkeeping fields (like `generatedAt`) changed.
 * The scheduled data workflows use it so a refresh with no new data doesn't
 * create a commit (and with it a new Vercel deployment).
 *
 * Usage: node scripts/data-changed.mjs data/a.json data/b.json
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const IGNORED_KEYS = new Set(["generatedAt"]);

function withoutBookkeeping(text) {
  if (text == null) return null;
  const value = JSON.parse(text);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of IGNORED_KEYS) delete value[key];
  }
  return JSON.stringify(value);
}

function committed(file) {
  try {
    return execFileSync("git", ["show", `HEAD:${file}`], { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
  } catch {
    return null; // new file
  }
}

const changed = process.argv.slice(2).filter((file) => {
  const current = existsSync(file) ? readFileSync(file, "utf8") : null;
  return withoutBookkeeping(current) !== withoutBookkeeping(committed(file));
});

if (changed.length) {
  console.log(`Meaningful changes in: ${changed.join(", ")}`);
  process.exit(0);
}
console.log("Only timestamps changed; nothing to commit.");
process.exit(1);
