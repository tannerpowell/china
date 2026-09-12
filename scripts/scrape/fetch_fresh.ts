/**
 * Playwright-free re-capture of the full menu.
 *
 * The legacy site is server-rendered: menu.asp carries every addtocart(id)
 * anchor in plain HTML, and the modal endpoint
 * (/order/?type=addtocart&mid=…&rid=…) returns plain HTML fragments.
 * A browser adds nothing except a chromium download, so this script uses
 * plain fetch + cheerio and produces the same capture shape as
 * scrape_menu.ts, which normalize.ts consumes.
 *
 * Usage: bun run fetch  (or: tsx fetch_fresh.ts)
 * Env:   MENU_URL, CART_URL, RID, DELAY_MS
 */
import { log } from "./utils/logger.js";
import { writeJson, ensureDir } from "./utils/storage.js";
import { parseApiResponse } from "./utils/parse_modal.js";
import * as cheerio from "cheerio";

const MENU_URL = process.env.MENU_URL ?? "http://www.chinaislandasiangrill.com/menu.asp";
const CART_URL = process.env.CART_URL ?? "https://us.chinesemenu.com/order/shoppingcart.htm";
const RID = process.env.RID ?? "301196398"; // Restaurant ID from discovery
const DELAY_MS = Number(process.env.DELAY_MS ?? 120);

type ItemIndexEntry = { itemId: number; nameFromList: string; categoryFromList: string | null; sourceUrl: string };

/**
 * Price info from the menu LIST page (td.price in the item's row).
 * This is the reliable source: ~38 items' modal endpoints permanently
 * return the "we do not take online orders currently" page, but their
 * list rows always carry the price. Variant cells look like
 * "S $3.25 L $6.00" or "Chicken $9.50 Shrimp $10.50".
 */
type ListPrice = {
  basePrice: number | null;
  sizeVariants: { size: string; price: number }[] | null;
  optionVariants: { option: string; price: number }[] | null;
};

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function parsePriceCell(priceHtml: string): ListPrice {
  const text = priceHtml
    .replace(/&nbsp;/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "\n");
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);

  const sizePattern = /^(S|L|SM|LG|Small|Large)\s+\$([0-9]+(?:\.[0-9]{1,2})?)/i;
  const optionPattern = /^([A-Za-z][A-Za-z\s&']+)\s+\$([0-9]+(?:\.[0-9]{1,2})?)/;
  const sizeVariants: { size: string; price: number }[] = [];
  const optionVariants: { option: string; price: number }[] = [];

  for (const line of lines) {
    const sizeMatch = line.match(sizePattern);
    if (sizeMatch) {
      const code = sizeMatch[1].toUpperCase();
      sizeVariants.push({
        size: code === "S" || code === "SM" || code === "SMALL" ? "Small" : "Large",
        price: Number(sizeMatch[2]),
      });
      continue;
    }
    const optionMatch = line.match(optionPattern);
    if (optionMatch) {
      const optName = optionMatch[1].trim();
      if (optName.length > 1 && !/^(S|L|SM|LG)$/i.test(optName)) {
        optionVariants.push({ option: optName, price: Number(optionMatch[2]) });
      }
    }
  }

  const anyPrice = text.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);

  if (sizeVariants.length > 0) {
    return { basePrice: Math.min(...sizeVariants.map((v) => v.price)), sizeVariants, optionVariants: null };
  }
  if (optionVariants.length > 0) {
    return { basePrice: Math.min(...optionVariants.map((v) => v.price)), sizeVariants: null, optionVariants };
  }
  return { basePrice: anyPrice ? Number(anyPrice[1]) : null, sizeVariants: null, optionVariants: null };
}

function extractIndex(html: string, pageUrl: string): (ItemIndexEntry & { listPrice: ListPrice })[] {
  const $ = cheerio.load(html);
  const out = new Map<number, ItemIndexEntry & { listPrice: ListPrice }>();

  $("a[onclick*='addtocart(']").each((_, el) => {
    const $a = $(el);
    const m = ($a.attr("onclick") || "").match(/addtocart\((\d+)\)/);
    if (!m) return;
    const itemId = Number(m[1]);
    if (out.has(itemId)) return;

    // Category: nearest preceding short heading/strong, walking ancestors
    // (same heuristic the in-page scrape used).
    let category: string | null = null;
    let $el = $a;
    for (let steps = 0; steps < 10 && $el.length; steps++) {
      let sib = $el.prev();
      while (sib.length) {
        const tag = (sib.prop("tagName") || "").toLowerCase();
        const t = norm(sib.text());
        if (["h1", "h2", "h3", "h4", "b", "strong"].includes(tag) && t.length >= 2 && t.length <= 40) {
          category = t;
          break;
        }
        sib = sib.prev();
      }
      if (category) break;
      $el = $el.parent();
    }

    const priceCell = $a.closest("tr").find("td.price").html() || "";

    out.set(itemId, {
      itemId,
      nameFromList: norm($a.text()),
      categoryFromList: category,
      sourceUrl: pageUrl,
      listPrice: parsePriceCell(priceCell),
    });
  });

  return Array.from(out.values());
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Descriptions live on the LIST page in <p id="name_info"> blocks — not the
// modal. Same extraction as scrape_descriptions.ts: the source nests <p>
// inside <p> and splits words across <span>s, so a tag-depth scan over raw
// HTML is more reliable than a DOM parser.
function cleanDescription(rawHtml: string): string | null {
  let t = rawHtml
    .replace(/<\/span><span[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  t = t
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
  t = t.replace(/\?/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/^\*+\s*/, "").replace(/\s*\*+$/, "").trim();
  t = t.replace(/\*\*/g, " ").replace(/\s+/g, " ").trim();
  t = t.replace(/cannot be make\b/gi, "cannot be made");
  return t === "" ? null : t;
}

function extractDescriptions(html: string): Map<number, string> {
  const descriptions = new Map<number, string>();
  const anchorRe = /addtocart\((\d+)\)">/g;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const itemId = Number(m[1]);
    if (descriptions.has(itemId)) continue;
    const afterAnchor = html.slice(m.index + m[0].length);
    const nameEnd = afterAnchor.indexOf("</a>");
    if (nameEnd === -1) continue;
    const afterName = afterAnchor.slice(nameEnd + "</a>".length);
    const infoOpen = '<p id="name_info">';
    if (!afterName.startsWith(infoOpen)) continue;
    const body = afterName.slice(infoOpen.length);
    let depth = 1;
    const tagRe = /<\/?p[\s>]/gi;
    let tm: RegExpExecArray | null;
    let inner = "";
    while ((tm = tagRe.exec(body)) !== null) {
      if (tm[0].startsWith("</")) {
        depth--;
        if (depth === 0) {
          inner = body.slice(0, tm.index);
          break;
        }
      } else {
        depth++;
      }
    }
    const cleaned = cleanDescription(inner);
    if (cleaned) descriptions.set(itemId, cleaned);
  }
  return descriptions;
}

async function main() {
  ensureDir("data/raw");

  log("Fetching index:", MENU_URL);
  const res = await fetch(MENU_URL);
  if (!res.ok) throw new Error(`menu page returned ${res.status}`);
  const menuHtml = await res.text();
  const index = extractIndex(menuHtml, MENU_URL);
  const descriptions = extractDescriptions(menuHtml);
  writeJson("data/raw/item_index.json", index);
  log(`Found items: ${index.length}, descriptions: ${descriptions.size}`);

  const captures: any[] = [];
  const partialEvery = 20;

  for (let i = 0; i < index.length; i++) {
    const entry = index[i];
    const errors: string[] = [];
    const cap: any = {
      ...entry,
      modal: null,
      description: descriptions.get(entry.itemId) ?? null,
      downloadedImages: [],
      errors,
    };

    try {
      const apiUrl = `${new URL(MENU_URL).origin}/order/?type=addtocart&mid=${entry.itemId}&rid=${RID}&country=us&domain=chinaislandasiangrill.com&_cb=${Date.now()}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const html = await response.text();
        // Two non-data responses the endpoint serves instead of a modal:
        //  - "we do not take online orders currently" (item disabled /
        //    outside global 11:00–21:30 ordering window)
        //  - "<item> today can not order!" (per-item window, e.g. lunch
        //    specials at 3 a.m.)
        const closed = /do not take online orders currently/i.test(html);
        const unavailable = /today can not order/i.test(html);
        if (closed || unavailable) {
          cap.modalClosed = closed ? "closed" : "unavailable";
          errors.push(`modal endpoint returned ${cap.modalClosed} page`);
        } else {
          cap.modal = parseApiResponse(html);
        }
      } else {
        errors.push(`API returned ${response.status()}`);
      }
    } catch (e: any) {
      errors.push(String(e?.message ?? e));
    }

    captures.push(cap);
    log(`Item ${i + 1}/${index.length} id=${entry.itemId}${cap.modal ? "" : " FAILED"}`);

    if ((i + 1) % partialEvery === 0) {
      writeJson("data/raw/menu_capture.partial.json", { menuUrl: MENU_URL, cartUrl: CART_URL, items: captures });
      log("Wrote partial checkpoint:", i + 1);
    }
    if (i + 1 < index.length) await sleep(DELAY_MS);
  }

  writeJson("data/raw/menu_capture.full.json", { menuUrl: MENU_URL, cartUrl: CART_URL, items: captures });
  const failed = captures.filter((c) => !c.modal).length;
  const closed = captures.filter((c) => c.modalClosed).length;
  const withSizes = captures.filter((c) => (c.modal?.priceOptions?.length ?? 0) > 0).length;
  log(`Wrote full capture. ${failed} failed (${closed} closed-page), ${withSizes} items have size/variant pricelists.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
