import { chromium } from "playwright";
import * as cheerio from "cheerio";
import { log } from "./utils/logger.js";
import { writeJson, ensureDir } from "./utils/storage.js";
import { slugify } from "./utils/slugify.js";

const MENU_URL = process.env.MENU_URL ?? "http://www.chinaislandasiangrill.com/menu.asp";
const CART_URL = process.env.CART_URL ?? "https://us.chinesemenu.com/order/shoppingcart.htm";
const RID = "301196398"; // Restaurant ID from discovery

type ItemIndexEntry = { itemId: number; nameFromList: string; categoryFromList: string | null; sourceUrl: string };
type ModifierOption = { label: string; priceDelta: number; inputType: "radio" | "checkbox" };
type ModifierGroup = { title: string; selectionType: "single" | "multi"; options: ModifierOption[] };

function parseApiResponse(html: string) {
  const $ = cheerio.load(html);

  // Item name from h6.t
  let modalItemName = $("h6.t").first().text().trim();
  // Remove trailing images text
  modalItemName = modalItemName.replace(/\s*$/, "").trim();

  // Base price
  let basePrice: number | null = null;
  const priceText = $(".baseprice").text();
  const priceMatch = priceText.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  if (priceMatch) basePrice = Number(priceMatch[1]);

  // Likes
  let likes: number | null = null;
  const likeText = $("p").text();
  const likeMatch = likeText.match(/([0-9,]+)\s+people\s+like/i);
  if (likeMatch) likes = Number(likeMatch[1].replace(/,/g, ""));

  // Modifier groups
  const modifierGroups: ModifierGroup[] = [];

  // Spicy options (special case - directly under choosemain)
  const spicyOptions: ModifierOption[] = [];
  $('input[name="spicy"]').each((_, el) => {
    const $el = $(el);
    const $label = $el.closest("label");
    const label = $label.text().trim();
    if (label) {
      spicyOptions.push({ label, priceDelta: 0, inputType: "radio" });
    }
  });
  if (spicyOptions.length > 0) {
    const spicyTitle = $("strong.t").first().text().trim() || "How Spicy?";
    modifierGroups.push({ title: spicyTitle, selectionType: "single", options: spicyOptions });
  }

  // Side order groups
  $(".sideOrderList").each((_, group) => {
    const $group = $(group);
    const title = $group.find("h3").first().text().trim() || "Options";
    const options: ModifierOption[] = [];

    $group.find("input[type='radio'], input[type='checkbox']").each((_, input) => {
      const $input = $(input);
      const $label = $input.closest("label");
      const inputType = ($input.attr("type") || "radio") as "radio" | "checkbox";

      // Get full label text and parse price delta
      let labelText = $label.text().trim();
      let priceDelta = 0;
      const deltaMatch = labelText.match(/\(\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*\)/);
      if (deltaMatch) {
        priceDelta = Number(deltaMatch[1]);
        labelText = labelText.replace(deltaMatch[0], "").replace(/\s*:\s*$/, "").trim();
      }

      if (labelText) {
        options.push({ label: labelText, priceDelta, inputType });
      }
    });

    if (options.length > 0) {
      const selectionType = options.some(o => o.inputType === "checkbox") ? "multi" : "single";
      modifierGroups.push({ title, selectionType, options });
    }
  });

  const hasSpecialInstructions = html.includes("Special Instructions");
  const hasQty = html.includes("QTY:");

  return { modalItemName, basePrice, likes, modifierGroups, hasSpecialInstructions, hasQty, imageUrls: [] as string[] };
}

async function main() {
  ensureDir("data/raw");
  ensureDir("data/images");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  log("Opening menu:", MENU_URL);
  await page.goto(MENU_URL, { waitUntil: "domcontentloaded" });

  // Extract item index from the page
  const index: ItemIndexEntry[] = await page.evaluate(`
    (function() {
      function norm(s) { return (s || "").replace(/\\s+/g, " ").trim(); }
      var anchors = Array.from(document.querySelectorAll("a[onclick*='addtocart(']"));
      var out = [];
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var onclick = a.getAttribute("onclick") || "";
        var m = onclick.match(/addtocart\\((\\d+)\\)/);
        if (!m) continue;
        var itemId = Number(m[1]);
        var nameFromList = norm(a.textContent || "");

        var category = null;
        var el = a;
        for (var steps = 0; steps < 10 && el; steps++) {
          var sib = el.previousElementSibling;
          while (sib) {
            var tag = sib.tagName.toLowerCase();
            var t = norm(sib.textContent || "");
            if ((tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "b" || tag === "strong") && t.length <= 40 && t.length >= 2) {
              category = t;
              break;
            }
            sib = sib.previousElementSibling;
          }
          if (category) break;
          el = el.parentElement;
        }

        out.push({ itemId: itemId, nameFromList: nameFromList, categoryFromList: category, sourceUrl: location.href });
      }
      var byId = new Map();
      for (var j = 0; j < out.length; j++) {
        var x = out[j];
        if (!byId.has(x.itemId)) byId.set(x.itemId, x);
      }
      return Array.from(byId.values());
    })()
  `);

  writeJson("data/raw/item_index.json", index);
  log("Found items:", index.length);

  const captures: any[] = [];
  const partialEvery = 20;

  for (let i = 0; i < index.length; i++) {
    const entry = index[i];
    const errors: string[] = [];
    const cap: any = { ...entry, modal: null, downloadedImages: [], errors };

    try {
      log(`Item ${i + 1}/${index.length} id=${entry.itemId}`);

      // Fetch the API directly
      const apiUrl = `http://www.chinaislandasiangrill.com/order/?type=addtocart&mid=${entry.itemId}&rid=${RID}&country=us&domain=chinaislandasiangrill.com&${Math.random()}&`;
      const response = await page.request.get(apiUrl);

      if (response.ok()) {
        const html = await response.text();
        const modal = parseApiResponse(html);
        cap.modal = modal;
      } else {
        errors.push(`API returned ${response.status()}`);
      }
    } catch (e: any) {
      errors.push(String(e?.message ?? e));
    }

    captures.push(cap);

    if ((i + 1) % partialEvery === 0) {
      writeJson("data/raw/menu_capture.partial.json", { menuUrl: MENU_URL, cartUrl: CART_URL, items: captures });
      log("Wrote partial checkpoint:", i + 1);
    }
  }

  writeJson("data/raw/menu_capture.full.json", { menuUrl: MENU_URL, cartUrl: CART_URL, items: captures });
  log("Wrote full capture.");
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
