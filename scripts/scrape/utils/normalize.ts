import fs from "node:fs";
import { readJson, writeJson, ensureDir } from "./storage.js";
import { slugify } from "./slugify.js";

type Raw = { menuUrl: string; cartUrl: string; items: any[] };

// Previous normalized output, used to carry data forward for items whose
// modal endpoint refused the capture (~38 permanently serve the legacy
// "not taking online orders" page). Their groups/descriptions/images were
// captured in earlier runs and must not regress.
function readPrevious(): { items: any[]; modifierGroups: any[] } {
  const p = "data/normalized/menu.normalized.json";
  try {
    if (fs.existsSync(p)) {
      const prev = JSON.parse(fs.readFileSync(p, "utf-8"));
      return { items: prev.items ?? [], modifierGroups: prev.modifierGroups ?? [] };
    }
  } catch {}
  return { items: [], modifierGroups: [] };
}

const stableCategorySlug = (t: string) => slugify(t || "uncategorized") || "uncategorized";

function guessTags(item: any) {
  const name = String(item?.modal?.modalItemName || item?.nameFromList || "").toLowerCase();
  const spicy = /spicy|hot|chili|szechuan|kung pao|mapo|ma po|mala/.test(name);
  const vegetarian = /vegetarian|tofu|eggplant|bok choy|broccoli|mushroom|veggie/.test(name);
  const popular = (item?.modal?.likes ?? 0) >= 1000;
  return { spicy, vegetarian, popular };
}

// Display-title cleanups keyed by the slug-derived group id (ids must stay
// stable — items and Sanity docs reference them).
const GROUP_TITLE_FIXES: Record<string, string> = {
  "mod_chooschoose-your-main-ingredient": "Choose Your Main Ingredient",
};

// "(Select up to 3 items below)" in the scraped title is the real max.
function parseMaxFromTitle(title: string): number | null {
  const m = title.match(/select up to\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

// Pricelist labels from the legacy modal ("S", "L") get friendly names.
function expandSizeLabel(label: string): string {
  const l = label.trim().toUpperCase();
  if (l === "S" || l === "SM" || l === "SMALL") return "Small";
  if (l === "L" || l === "LG" || l === "LARGE") return "Large";
  if (l === "PT" || l === "PINT") return "Pint";
  if (l === "QT" || l === "QUART") return "Quart";
  return label.trim();
}

const SIZE_LIKE = /^(s|m|l|sm|md|lg|small|medium|large|pt|qt|pint|quart)$/i;

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
  const addGroup = (id: string, g: any) => {
    if (modMap.has(id)) return;
    const selectionType = g.selectionType === "multi" ? "multi" : "single";
    const title = GROUP_TITLE_FIXES[id] ?? String(g.title || "Options").trim();
    const options = (g.options || []).map((o: any, idx: number) => ({
      // Preserve existing ids when re-registering carried-over groups —
      // option ids are selection identity in the cart/order path.
      id: o.id ?? `opt_${slugify(o.label || `option_${idx}`) || "option"}`,
      label: o.label,
      priceDelta: Number(o.priceDelta ?? 0)
    }));
    const titleMax = parseMaxFromTitle(title);
    const min = g.min ?? (g.required ? 1 : 0);
    const max = g.max ?? titleMax ?? (selectionType === "multi" ? options.length : 1);
    modMap.set(id, { id, title, selectionType, min, max, options });
  };

  const prev = readPrevious();
  const prevItemById = new Map(prev.items.map((i: any) => [i.id, i]));
  const prevGroupById = new Map(prev.modifierGroups.map((g: any) => [g.id, g]));

  for (const it of raw.items) {
    for (const g of (it?.modal?.modifierGroups ?? [])) {
      const slug = slugify(String(g.title || "Options").trim()) || "options";
      addGroup(`mod_${slug}`, g);
    }
  }

  const items = raw.items.map((it: any) => {
    const sourceItemId = it.itemId;
    const prevItem = prevItemById.get(`item_${sourceItemId}`);
    const name = it?.modal?.modalItemName || it.nameFromList || `Item ${sourceItemId}`;
    const slug = slugify(name) || `item-${sourceItemId}`;
    const categoryTitle = it.categoryFromList || "Uncategorized";
    const categoryId = `cat_${stableCategorySlug(categoryTitle)}`;

    // Modal refused (closed page) → carry the previous capture's groups
    // forward; they were real when captured and the endpoint won't re-serve
    // them.
    const modalFailed = !it?.modal;
    let modifierGroupIds: string[] = (it?.modal?.modifierGroups ?? []).map((g: any) => `mod_${slugify(String(g.title || "options").trim()) || "options"}`);
    if (modalFailed && prevItem?.modifierGroupIds?.length) {
      modifierGroupIds = prevItem.modifierGroupIds;
      for (const gid of modifierGroupIds) {
        const pg = prevGroupById.get(gid);
        if (pg) addGroup(pg.id, pg);
      }
    }

    let images = (it?.downloadedImages ?? []).map((x: any) => ({ originalUrl: x.originalUrl, localPath: x.localPath }));
    if (images.length === 0 && prevItem?.images?.length) images = prevItem.images;

    // Pricelist variants (modal input[name="price"]) are FULL prices, not
    // deltas — the base price is the cheapest variant and the group is
    // required. ~10 items price exclusively this way.
    const priceOptions = it?.modal?.priceOptions ?? [];
    let basePrice = it?.modal?.basePrice ?? null;
    if (priceOptions.length > 0) {
      const cheapest = Math.min(...priceOptions.map((o: any) => Number(o.price)));
      if (basePrice == null) basePrice = cheapest;
      const sizeLike = priceOptions.every((o: any) => SIZE_LIKE.test(String(o.label)));
      const gid = `mod_${sizeLike ? "size" : "choice"}_${slug}`;
      addGroup(gid, {
        title: sizeLike ? "Size" : "Options",
        selectionType: "single",
        min: 1,
        max: 1,
        options: priceOptions.map((o: any) => ({
          id: `opt_${o.pid}`,
          label: expandSizeLabel(String(o.label)),
          priceDelta: Number(o.price) - cheapest,
        })),
      });
      modifierGroupIds.unshift(gid);
    }

    // List-page price is the fallback (and cross-check) — ~38 items' modals
    // permanently return the legacy "not taking online orders" page.
    if (basePrice == null) {
      basePrice = it?.listPrice?.basePrice ?? null;
    }

    return {
      id: `item_${sourceItemId}`,
      sourceItemId,
      name,
      slug,
      categoryId,
      basePrice,
      description: it?.description ?? it?.modal?.description ?? prevItem?.description ?? null,
      likes: it?.modal?.likes ?? prevItem?.likes ?? null,
      tags: guessTags(it),
      images,
      modifierGroupIds,
      order: { provider: "chinesemenu", cartUrl: raw.cartUrl, itemOrderUrl: null }
    };
  });

  const categories = Array.from(catMap.values());
  const modifierGroups = Array.from(modMap.values());

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
