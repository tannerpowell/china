/**
 * Sync normalized menu data into Sanity WITHOUT a full re-import.
 *
 * Unlike import_to_sanity.ts (which createOrReplace's every doc and
 * re-uploads every image), this patches only the fields the scraper owns:
 *
 *   modifierGroup  – created if missing (options included); if it exists,
 *                    only title/selectionType/min/max are patched. Options
 *                    are left alone — the owner may have edited them in
 *                    Studio, and option _key stability matters.
 *   menuItem       – basePrice + modifierGroups refs synced (normalized
 *                    order first, Sanity-only refs appended so owner-added
 *                    groups survive). description filled only when Sanity
 *                    has none. Images/likes untouched.
 *
 * Usage (from repo root, needs .env with SANITY_TOKEN):
 *   bun x tsx scripts/sanity/import/sync_normalized.ts [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const DRY_RUN = process.argv.includes("--dry-run");

function readNormalized(): any {
  const paths = [
    path.resolve(PROJECT_ROOT, "apps/web/src/data/menu.normalized.json"),
    path.resolve(PROJECT_ROOT, "scripts/scrape/data/normalized/menu.normalized.json"),
  ];
  const p = paths.find((x) => fs.existsSync(x));
  if (!p) throw new Error("Could not find menu.normalized.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const sameRefs = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

async function main() {
  const data = readNormalized();

  const [sGroups, sItems] = await Promise.all([
    sanity.fetch<any[]>(`*[_type == "modifierGroup"] { _id, title, selectionType, min, max, options }`),
    sanity.fetch<any[]>(`*[_type == "menuItem"] { _id, name, basePrice, description, "modifierGroupIds": modifierGroups[]._ref }`),
  ]);
  const sGroupById = new Map(sGroups.map((g) => [g._id, g]));
  const sItemById = new Map(sItems.map((i) => [i._id, i]));

  let created = 0, patched = 0, skipped = 0;
  const notes: string[] = [];

  for (const g of data.modifierGroups) {
    const existing = sGroupById.get(g.id);
    if (!existing) {
      notes.push(`+ group ${g.id} "${g.title.replace(/\n.*/, "")}" (${g.options.length} opts)`);
      if (!DRY_RUN) {
        await sanity.createOrReplace({
          _id: g.id,
          _type: "modifierGroup",
          title: g.title,
          selectionType: g.selectionType,
          min: g.min,
          max: g.max,
          options: g.options.map((o: any) => ({ _key: o.id, ...o })),
        });
      }
      created++;
      continue;
    }
    // Exists — sync only the scraper-owned fields, never options.
    const patch: Record<string, any> = {};
    if (existing.title !== g.title) patch.title = g.title;
    if ((existing.selectionType ?? "single") !== g.selectionType) patch.selectionType = g.selectionType;
    if ((existing.min ?? 0) !== g.min) patch.min = g.min;
    if ((existing.max ?? 1) !== g.max) patch.max = g.max;
    if (Object.keys(patch).length === 0) {
      skipped++;
      continue;
    }
    notes.push(`~ group ${g.id}: ${JSON.stringify(patch)}`);
    if (!DRY_RUN) await sanity.patch(g.id).set(patch).commit();
    patched++;
  }

  for (const it of data.items) {
    const existing = sItemById.get(it.id);
    if (!existing) {
      notes.push(`+ item ${it.id} "${it.name}" (missing in Sanity)`);
      if (!DRY_RUN) {
        await sanity.createOrReplace({
          _id: it.id,
          _type: "menuItem",
          sourceItemId: it.sourceItemId,
          name: it.name,
          slug: { _type: "slug", current: it.slug },
          basePrice: it.basePrice ?? null,
          description: it.description ?? null,
          likes: it.likes ?? null,
          tags: it.tags ?? { spicy: false, vegetarian: false, popular: false },
          category: { _type: "reference", _ref: it.categoryId },
          modifierGroups: (it.modifierGroupIds ?? []).map((id: string) => ({ _type: "reference", _ref: id, _key: id })),
          images: [],
          order: it.order,
        });
      }
      created++;
      continue;
    }

    const patch: Record<string, any> = {};
    if (existing.basePrice !== it.basePrice) patch.basePrice = it.basePrice ?? null;

    // Merge group refs: normalized order first, then any Sanity-only refs
    // (owner-added groups) preserved at the end.
    const wanted: string[] = it.modifierGroupIds ?? [];
    const current: string[] = existing.modifierGroupIds ?? [];
    const merged = [...wanted, ...current.filter((id) => !wanted.includes(id))];
    if (!sameRefs(current, merged)) {
      patch.modifierGroups = merged.map((id) => ({ _type: "reference", _ref: id, _key: id }));
    }

    // Fill description only when Sanity lacks one — owner edits win.
    if (!existing.description && it.description) patch.description = it.description;

    if (Object.keys(patch).length === 0) {
      skipped++;
      continue;
    }
    notes.push(`~ item ${it.id} "${it.name}": ${Object.keys(patch).join(", ")}`);
    if (!DRY_RUN) await sanity.patch(it.id).set(patch).commit();
    patched++;
  }

  console.log(notes.join("\n"));
  console.log(`\n${DRY_RUN ? "[dry-run] " : ""}created=${created} patched=${patched} unchanged=${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
