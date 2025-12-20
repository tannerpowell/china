import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

// Compute project root from script location (scripts/sanity/import/ -> project root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

function readNormalized(): any {
  const paths = [
    path.resolve(PROJECT_ROOT, "apps/web/src/data/menu.normalized.json"),
    path.resolve(PROJECT_ROOT, "data/normalized/menu.normalized.json"),
    path.resolve(PROJECT_ROOT, "scripts/scrape/data/normalized/menu.normalized.json"),
    // Fallback to cwd-based paths for backwards compatibility
    path.resolve(process.cwd(), "apps/web/src/data/menu.normalized.json"),
    path.resolve(process.cwd(), "data/normalized/menu.normalized.json"),
  ];
  const p = paths.find(p => fs.existsSync(p));
  if (!p) throw new Error("Could not find menu.normalized.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function upsert(doc: any) {
  return sanity.createOrReplace(doc);
}

async function uploadImage(localPath: string) {
  // Resolve relative paths from project root (where data/ directory lives)
  const abs = path.isAbsolute(localPath) ? localPath : path.resolve(PROJECT_ROOT, localPath);
  const stream = fs.createReadStream(abs);
  const filename = path.basename(abs);
  return sanity.assets.upload("image", stream, { filename });
}

async function main() {
  const data = readNormalized();

  await upsert({
    _id: "restaurantSettings",
    _type: "restaurantSettings",
    name: data.restaurant?.name ?? "China Island Asian Grill",
    phone: process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "",
    address: process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ?? "",
    hours: "",
    primaryOrderUrl: process.env.NEXT_PUBLIC_ORDER_CART_URL ?? data?.items?.[0]?.order?.cartUrl ?? ""
  });

  for (const c of data.categories) {
    await upsert({ _id: c.id, _type: "menuCategory", title: c.title, slug: { _type: "slug", current: c.slug }, sortOrder: c.sortOrder });
  }

  for (const m of data.modifierGroups) {
    await upsert({ _id: m.id, _type: "modifierGroup", title: m.title, selectionType: m.selectionType, min: m.min, max: m.max, options: m.options });
  }

  for (const it of data.items) {
    const images: any[] = [];
    for (const img of (it.images ?? [])) {
      if (!img?.localPath) continue;
      try {
        const asset = await uploadImage(img.localPath);
        images.push({ _type: "image", asset: { _type: "reference", _ref: asset._id } });
      } catch (err) {
        console.warn(`Failed to upload image ${img.localPath}:`, err instanceof Error ? err.message : err);
      }
    }

    await upsert({
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
      modifierGroups: (it.modifierGroupIds ?? []).map((id: string) => ({ _type: "reference", _ref: id })),
      images,
      order: it.order
    });
  }

  console.log("Sanity import complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
