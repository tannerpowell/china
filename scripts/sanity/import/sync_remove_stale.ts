import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

const dataPath = path.resolve(PROJECT_ROOT, "apps/web/src/data/menu.normalized.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const liveSourceIds = new Set(data.items.map((i: any) => String(i.sourceItemId)));
const liveCategoryIds = new Set(data.categories.map((c: any) => c.id));
const liveModIds = new Set(data.modifierGroups.map((m: any) => m.id));

async function deleteByType(type: string, ids: string[], label: string) {
  if (ids.length === 0) {
    console.log(`${label}: none to delete`);
    return;
  }
  const tx = sanity.transaction();
  for (const id of ids) tx.delete(id);
  await tx.commit();
  console.log(`${label}: deleted ${ids.length} (${ids.join(", ")})`);
}

// A stale managed category/modifier may still be referenced by a surviving
// (e.g. owner-created) document. Sanity rejects the whole transaction in
// that case, so check inbound references first and only delete unreferenced
// docs — report the blocked ones instead of aborting the entire cleanup.
async function filterReferenced(ids: string[], label: string): Promise<string[]> {
  const deletable: string[] = [];
  for (const id of ids) {
    const count = await sanity.fetch<number>(`count(*[references($id)])`, { id });
    if (count > 0) {
      console.log(`${label}: keeping ${id} — still referenced by ${count} document(s)`);
    } else {
      deletable.push(id);
    }
  }
  return deletable;
}

async function main() {
  const [staleItems, staleCats, staleMods] = await Promise.all([
    sanity.fetch<{ _id: string; sourceItemId?: number }[]>(
      `*[_type == "menuItem"] { _id, sourceItemId }`
    ),
    sanity.fetch<{ _id: string }[]>(`*[_type == "menuCategory"] { _id }`),
    sanity.fetch<{ _id: string }[]>(`*[_type == "modifierGroup"] { _id }`),
  ]);

  // Only scrape-managed docs (item_*/cat_*/mod_*) are eligible for deletion.
  // Owner-created Studio docs have random _ids and no sourceItemId — they
  // must survive the sync, so anything outside the managed prefixes is spared.
  const itemIds = staleItems
    .filter((i) => i._id.startsWith("item_") && !liveSourceIds.has(String(i.sourceItemId)))
    .map((i) => i._id);
  const catIds = staleCats
    .filter((c) => c._id.startsWith("cat_") && !liveCategoryIds.has(c._id))
    .map((c) => c._id);
  const modIds = staleMods
    .filter((m) => m._id.startsWith("mod_") && !liveModIds.has(m._id))
    .map((m) => m._id);

  await deleteByType("menuItem", itemIds, "menuItem");
  await deleteByType("menuCategory", await filterReferenced(catIds, "menuCategory"), "menuCategory");
  await deleteByType("modifierGroup", await filterReferenced(modIds, "modifierGroup"), "modifierGroup");
  console.log("Sanity sync complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});