import { chromium } from "playwright";
import { log } from "./utils/logger.js";
import { writeJson, ensureDir } from "./utils/storage.js";
import { parseApiResponse } from "./utils/parse_modal.js";

const MENU_URL = process.env.MENU_URL ?? "http://www.chinaislandasiangrill.com/menu.asp";
const CART_URL = process.env.CART_URL ?? "https://us.chinesemenu.com/order/shoppingcart.htm";
const RID = "301196398"; // Restaurant ID from discovery

type ItemIndexEntry = { itemId: number; nameFromList: string; categoryFromList: string | null; sourceUrl: string };

async function main() {
  ensureDir("data/raw");
  ensureDir("data/images");

  const browser = await chromium.launch({ headless: true });
  try {
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
      const apiUrl = `http://www.chinaislandasiangrill.com/order/?type=addtocart&mid=${entry.itemId}&rid=${RID}&country=us&domain=chinaislandasiangrill.com&_cb=${Date.now()}`;
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
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
