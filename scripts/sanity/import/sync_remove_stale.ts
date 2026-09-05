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

async function main() {
  const [staleItems, staleCats, staleMods] = await Promise.all([
    sanity.fetch<{ _id: string; sourceItemId?: number }[]>(
      `*[_type == "menuItem"] { _id, sourceItemId }`
    ),
    sanity.fetch<{ _id: string }[]>(`*[_type == "menuCategory"] { _id }`),
    sanity.fetch<{ _id: string }[]>(`*[_type == "modifierGroup"] { _id }`),
  ]);

  const itemIds = staleItems
    .filter((i) => !liveSourceIds.has(String(i.sourceItemId)))
    .map((i) => i._id);
  const catIds = staleCats
    .filter((c) => !liveCategoryIds.has(c._id))
    .map((c) => c._id);
  const modIds = staleMods
    .filter((m) => !liveModIds.has(m._id))
    .map((m) => m._id);

  await deleteByType("menuItem", itemIds, "menuItem");
  await deleteByType("menuCategory", catIds, "menuCategory");
  await deleteByType("modifierGroup", modIds, "modifierGroup");
  console.log("Sanity sync complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});