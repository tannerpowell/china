/**
 * Re-scrape script for 44 items that failed to capture prices/modifiers
 *
 * Strategy:
 * 1. Extract prices from menu page HTML (<td class="price">) - reliable source
 * 2. Re-attempt modal API calls with proper delays for modifier data
 * 3. Handle size variants (S/L) as modifier groups
 * 4. Output merged data ready for Sanity update
 */

import { chromium } from "playwright";
import * as cheerio from "cheerio";
import { writeJson, readJson, ensureDir } from "./utils/storage.js";

const MENU_URL = "http://www.chinaislandasiangrill.com/menu.asp";
const RID = "301196398";

// 44 items that failed to capture prices
const FAILED_ITEM_IDS = [
  6609116, 6609117, 6609113, 6609114, 6609115, // Soups
  6609136, 6609137, 6609138, 7129113, 6609143, 6609144, 6609145, 6609159, // Appetizers
  6609388, 6609389, 6609390, 6609391, 6609392, 6609393, 6609395, 6609396, 6609397, // Lunch Specials
  6609408, 6609409, 6609410, 6609411, 6609412, 6609418, 525697887, // More Lunch Specials
  6609362, 6609363, 6613221, 6609364, 6609365, 6609366, 6609367, // Side Orders
  7037449, 7037489, 7037491, 7037493, 7037495, 7037582, 7037508, 7037520 // Drinks
];

type PriceInfo = {
  basePrice: number | null;
  sizeVariants: { size: string; price: number }[] | null;
  optionVariants: { option: string; price: number }[] | null;
};

type ModifierOption = { label: string; priceDelta: number; inputType: "radio" | "checkbox" };
type ModifierGroup = { title: string; selectionType: "single" | "multi"; options: ModifierOption[] };

type ItemPatch = {
  itemId: number;
  name: string;
  priceInfo: PriceInfo;
  modifierGroups: ModifierGroup[];
  modalWorked: boolean;
};

function parsePriceCell(priceHtml: string): PriceInfo {
  // Clean up the HTML - convert &nbsp; to regular spaces, then strip tags
  const text = priceHtml
    .replace(/&nbsp;/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Check for size variants (S $2.75, L $5.00)
  // Format: "S $2.75" or "L $5.00" or "Small $2.75" etc.
  const sizePattern = /^(S|L|SM|LG|Small|Large)\s+\$([0-9]+(?:\.[0-9]{1,2})?)/i;
  const sizeVariants: { size: string; price: number }[] = [];

  // Check for option variants (Chicken $8.50, Shrimp $9.50)
  const optionPattern = /^([A-Za-z][A-Za-z\s]+)\s+\$([0-9]+(?:\.[0-9]{1,2})?)/;
  const optionVariants: { option: string; price: number }[] = [];

  for (const line of lines) {
    const sizeMatch = line.match(sizePattern);
    if (sizeMatch) {
      const sizeCode = sizeMatch[1].toUpperCase();
      const size = (sizeCode === 'S' || sizeCode === 'SM' || sizeCode === 'SMALL') ? 'Small' : 'Large';
      sizeVariants.push({ size, price: Number(sizeMatch[2]) });
      continue;
    }

    // Only check option pattern if not a size match and not just a single price
    const optionMatch = line.match(optionPattern);
    if (optionMatch) {
      const optName = optionMatch[1].trim();
      // Exclude single letter matches that might be sizes
      if (optName.length > 1 && !/^(S|L|SM|LG)$/i.test(optName)) {
        optionVariants.push({ option: optName, price: Number(optionMatch[2]) });
      }
    }
  }

  // Simple single price (just "$X.XX" format)
  const simplePrice = text.match(/^\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*$/m);

  if (sizeVariants.length > 0) {
    // Use smallest size as base price
    const basePrice = Math.min(...sizeVariants.map(v => v.price));
    return { basePrice, sizeVariants, optionVariants: null };
  }

  if (optionVariants.length > 0) {
    // Use cheapest option as base price
    const basePrice = Math.min(...optionVariants.map(v => v.price));
    return { basePrice, sizeVariants: null, optionVariants };
  }

  // Fallback: find any price
  const anyPrice = text.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);

  return {
    basePrice: (simplePrice || anyPrice) ? Number((simplePrice || anyPrice)![1]) : null,
    sizeVariants: null,
    optionVariants: null
  };
}

function parseModalResponse(html: string): { modifierGroups: ModifierGroup[]; basePrice: number | null } {
  const $ = cheerio.load(html);

  // Try multiple selectors for base price
  let basePrice: number | null = null;
  const priceSelectors = ['.baseprice', '.price', '.item-price', 'span:contains("$")'];

  for (const selector of priceSelectors) {
    const priceText = $(selector).first().text();
    const priceMatch = priceText.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
    if (priceMatch) {
      basePrice = Number(priceMatch[1]);
      break;
    }
  }

  // Also check for price in any element
  if (!basePrice) {
    const allText = $.root().text();
    const priceMatch = allText.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
    if (priceMatch) basePrice = Number(priceMatch[1]);
  }

  // Extract modifier groups
  const modifierGroups: ModifierGroup[] = [];

  // Spicy options
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
    modifierGroups.push({ title: "How Spicy?", selectionType: "single", options: spicyOptions });
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

  return { modifierGroups, basePrice };
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  ensureDir("data/patches");

  console.log("Starting re-scrape of 44 failed items...\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Step 1: Fetch menu page and extract ALL prices from HTML
  console.log("Step 1: Extracting prices from menu page HTML...");
  await page.goto(MENU_URL, { waitUntil: "domcontentloaded" });
  const menuHtml = await page.content();
  const $ = cheerio.load(menuHtml);

  // Build a map of itemId -> price info from menu page
  const menuPrices = new Map<number, { name: string; priceInfo: PriceInfo }>();

  $("a[onclick*='addtocart(']").each((_, anchor) => {
    const onclick = $(anchor).attr("onclick") || "";
    const idMatch = onclick.match(/addtocart\((\d+)\)/);
    if (!idMatch) return;

    const itemId = Number(idMatch[1]);
    const name = $(anchor).text().trim();

    // Find the price cell in the same row
    const $row = $(anchor).closest("tr");
    const priceCell = $row.find("td.price").html() || "";
    const priceInfo = parsePriceCell(priceCell);

    menuPrices.set(itemId, { name, priceInfo });
  });

  console.log(`  Found prices for ${menuPrices.size} items on menu page\n`);

  // Step 2: Re-attempt modal API for each failed item with delay
  console.log("Step 2: Re-attempting modal API calls with 1s delays...");
  const patches: ItemPatch[] = [];

  for (let i = 0; i < FAILED_ITEM_IDS.length; i++) {
    const itemId = FAILED_ITEM_IDS[i];
    const menuData = menuPrices.get(itemId);
    const name = menuData?.name || `Item ${itemId}`;

    console.log(`  [${i + 1}/${FAILED_ITEM_IDS.length}] ${name} (id=${itemId})`);

    // Get price from menu page (reliable source)
    const priceInfo: PriceInfo = menuData?.priceInfo || { basePrice: null, sizeVariants: null, optionVariants: null };

    // Try modal API with delay
    let modifierGroups: ModifierGroup[] = [];
    let modalWorked = false;

    try {
      await sleep(1000); // 1 second delay between requests

      const apiUrl = `http://www.chinaislandasiangrill.com/order/?type=addtocart&mid=${itemId}&rid=${RID}&country=us&domain=chinaislandasiangrill.com&${Math.random()}&`;
      const response = await page.request.get(apiUrl, { timeout: 10000 });

      if (response.ok()) {
        const html = await response.text();
        const modalData = parseModalResponse(html);
        modifierGroups = modalData.modifierGroups;
        modalWorked = modifierGroups.length > 0 || html.includes("QTY:");

        // If modal has price and we don't, use it
        if (!priceInfo.basePrice && modalData.basePrice) {
          priceInfo.basePrice = modalData.basePrice;
        }

        console.log(`    Modal: ${modalWorked ? 'OK' : 'empty'}, Modifiers: ${modifierGroups.length}, Price: $${priceInfo.basePrice || 'N/A'}`);
      } else {
        console.log(`    Modal: HTTP ${response.status()}`);
      }
    } catch (e: any) {
      console.log(`    Modal: Error - ${e.message?.slice(0, 50)}`);
    }

    // Create size modifier group if we have size variants
    if (priceInfo.sizeVariants && priceInfo.sizeVariants.length > 0) {
      const basePrice = priceInfo.basePrice || priceInfo.sizeVariants[0].price;
      const sizeOptions: ModifierOption[] = priceInfo.sizeVariants.map(v => ({
        label: v.size,
        priceDelta: v.price - basePrice,
        inputType: "radio" as const
      }));
      modifierGroups.unshift({
        title: "Size",
        selectionType: "single",
        options: sizeOptions
      });
    }

    // Create option modifier group if we have option variants (like Chicken/Vegetarian/Shrimp)
    if (priceInfo.optionVariants && priceInfo.optionVariants.length > 0) {
      const basePrice = priceInfo.basePrice || priceInfo.optionVariants[0].price;
      const optionOptions: ModifierOption[] = priceInfo.optionVariants.map(v => ({
        label: v.option,
        priceDelta: v.price - basePrice,
        inputType: "radio" as const
      }));
      modifierGroups.unshift({
        title: "Choose Option",
        selectionType: "single",
        options: optionOptions
      });
    }

    patches.push({
      itemId,
      name,
      priceInfo,
      modifierGroups,
      modalWorked
    });
  }

  await browser.close();

  // Step 3: Write patch data
  console.log("\nStep 3: Writing patch data...");
  writeJson("data/patches/failed_items_patch.json", patches);

  // Summary
  const withPrices = patches.filter(p => p.priceInfo.basePrice !== null);
  const withModifiers = patches.filter(p => p.modifierGroups.length > 0);
  const withSizes = patches.filter(p => p.priceInfo.sizeVariants !== null);

  console.log("\n=== SUMMARY ===");
  console.log(`Total items processed: ${patches.length}`);
  console.log(`Items with prices extracted: ${withPrices.length}`);
  console.log(`Items with modifiers captured: ${withModifiers.length}`);
  console.log(`Items with size variants: ${withSizes.length}`);
  console.log(`\nPatch file: data/patches/failed_items_patch.json`);

  // Show items still missing prices
  const stillMissing = patches.filter(p => p.priceInfo.basePrice === null);
  if (stillMissing.length > 0) {
    console.log(`\nWARNING: ${stillMissing.length} items still missing prices:`);
    stillMissing.forEach(p => console.log(`  - ${p.name} (id=${p.itemId})`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
