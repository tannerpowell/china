import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

// Patches the `description` field on scrape-managed menuItem docs
// (item_* ids only — owner-created docs are never touched). Unlike the full
// import, this skips image uploads. Items whose normalized description is
// absent get the field explicitly unset so stale copy can't survive.
// Unlike the full import, this never touches images or other fields.
//
// Usage: tsx import/patch_descriptions.ts [--dry-run] [--sets-only]
//
// --sets-only skips the unset pass. Prefer it whenever the local JSON may
// lack copy that exists in Studio (e.g. owner edits): unsets would wipe
// those descriptions, while sets only add missing source copy.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const DRY_RUN = process.argv.includes("--dry-run");
const SETS_ONLY = process.argv.includes("--sets-only");

async function main() {
  const p = path.resolve(PROJECT_ROOT, "apps/web/src/data/menu.normalized.json");
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const managed = data.items.filter((it: any) => String(it.id).startsWith("item_"));
  const sets = managed.filter((it: any) => it.description);
  const unsets = managed.filter((it: any) => !it.description);
  console.log(
    `${DRY_RUN ? "[dry-run] " : ""}Would patch ${sets.length} descriptions, ` +
    `unset ${SETS_ONLY ? 0 : unsets.length}${
      SETS_ONLY ? ` (skipped ${unsets.length} unsets)` : ""
    }, skip ${data.items.length - managed.length} non-managed ` +
    `of ${data.items.length} items`
  );
  if (DRY_RUN) return;

  let ok = 0;
  const failed: string[] = [];
  for (const it of sets) {
    try {
      await sanity.patch(it.id).set({ description: it.description }).commit();
      ok++;
    } catch (err) {
      failed.push(`${it.id}: ${err instanceof Error ? err.message : err}`);
    }
  }
  let unok = 0;
  if (!SETS_ONLY) {
    for (const it of unsets) {
      try {
        await sanity.patch(it.id).unset(["description"]).commit();
        unok++;
      } catch (err) {
        failed.push(`${it.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
  console.log(`Done: ${ok} set, ${unok} unset, ${failed.length} failed`);
  for (const f of failed) console.error("FAILED", f);
  if (failed.length > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
