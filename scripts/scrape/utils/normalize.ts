import { readJson, writeJson, ensureDir } from "./storage.js";
import { slugify } from "./slugify.js";

type Raw = { menuUrl: string; cartUrl: string; items: any[] };

const stableCategorySlug = (t: string) => slugify(t || "uncategorized") || "uncategorized";

function guessTags(item: any) {
  const name = String(item?.modal?.modalItemName || item?.nameFromList || "").toLowerCase();
  const spicy = /spicy|hot|chili|szechuan|kung pao|mapo|ma po|mala/.test(name);
  const vegetarian = /vegetarian|tofu|eggplant|bok choy|broccoli|mushroom|veggie/.test(name);
  const popular = (item?.modal?.likes ?? 0) >= 1000;
  return { spicy, vegetarian, popular };
}

export function main() {
  ensureDir("data/normalized");
  const raw = readJson<Raw>("data/raw/menu_capture.full.json");

  const catMap = new Map<string, any>();
  let sort = 10;
  for (const it of raw.items) {
    const title = it.categoryFromList || "Uncategorized";
    const slug = stableCategorySlug(title);
    const id = `cat_${slug}`;
    if (!catMap.has(id)) { catMap.set(id, { id, title, slug, sortOrder: sort }); sort += 10; }
  }

  const modMap = new Map<string, any>();
  for (const it of raw.items) {
    for (const g of (it?.modal?.modifierGroups ?? [])) {
      const title = String(g.title || "Options").trim();
      const slug = slugify(title) || "options";
      const id = `mod_${slug}`;
      if (!modMap.has(id)) {
        const selectionType = g.selectionType === "multi" ? "multi" : "single";
        const options = (g.options || []).map((o: any, idx: number) => ({
          id: `opt_${slugify(o.label || `option_${idx}`) || "option"}`,
          label: o.label,
          priceDelta: Number(o.priceDelta ?? 0)
        }));
        modMap.set(id, { id, title, selectionType, min: 0, max: selectionType === "multi" ? options.length : 1, options });
      }
    }
  }

  const categories = Array.from(catMap.values());
  const modifierGroups = Array.from(modMap.values());

  const items = raw.items.map((it: any) => {
    const sourceItemId = it.itemId;
    const name = it?.modal?.modalItemName || it.nameFromList || `Item ${sourceItemId}`;
    const slug = slugify(name) || `item-${sourceItemId}`;
    const categoryTitle = it.categoryFromList || "Uncategorized";
    const categoryId = `cat_${stableCategorySlug(categoryTitle)}`;
    const modifierGroupIds = (it?.modal?.modifierGroups ?? []).map((g: any) => `mod_${slugify(g.title || "options") || "options"}`);
    const images = (it?.downloadedImages ?? []).map((x: any) => ({ originalUrl: x.originalUrl, localPath: x.localPath }));

    return {
      id: `item_${sourceItemId}`,
      sourceItemId,
      name,
      slug,
      categoryId,
      basePrice: it?.modal?.basePrice ?? null,
      description: null,
      likes: it?.modal?.likes ?? null,
      tags: guessTags(it),
      images,
      modifierGroupIds,
      order: { provider: "chinesemenu", cartUrl: raw.cartUrl, itemOrderUrl: null }
    };
  });

  const normalized = {
    restaurant: { name: "China Island Asian Grill", source: { siteUrl: raw.menuUrl, scrapedAt: new Date().toISOString() } },
    categories,
    modifierGroups,
    items
  };

  writeJson("data/normalized/menu.normalized.json", normalized);
  writeJson("../../apps/web/src/data/menu.normalized.json", normalized);
  console.log("Wrote data/normalized/menu.normalized.json and apps/web/src/data/menu.normalized.json");
}

main();
