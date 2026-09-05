import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

// Patches only the `description` field on menuItem docs that have one in
// the normalized data. Unlike the full import, this skips image uploads.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

async function main() {
  const p = path.resolve(PROJECT_ROOT, "apps/web/src/data/menu.normalized.json");
  const data = JSON.parse(fs.readFileSync(p, "utf-8"));
  const withDesc = data.items.filter((it: any) => it.description);
  console.log(`Patching descriptions on ${withDesc.length}/${data.items.length} items`);

  let ok = 0;
  const failed: string[] = [];
  for (const it of withDesc) {
    try {
      await sanity.patch(it.id).set({ description: it.description }).commit();
      ok++;
    } catch (err) {
      failed.push(`${it.id}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`Done: ${ok} patched, ${failed.length} failed`);
  for (const f of failed) console.error("FAILED", f);
  if (failed.length > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
