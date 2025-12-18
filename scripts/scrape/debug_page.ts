import { chromium } from "playwright";
import * as cheerio from "cheerio";

const MENU_URL = "http://www.chinaislandasiangrill.com/menu.asp";

// Items with known size variants on website
const TEST_IDS = [6609116, 6609117, 6609113, 6609363, 6609159];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MENU_URL, { waitUntil: "domcontentloaded" });
  const menuHtml = await page.content();
  const $ = cheerio.load(menuHtml);

  for (const itemId of TEST_IDS) {
    const anchor = $(`a[onclick*='addtocart(${itemId})']`);
    const name = anchor.text().trim();
    const row = anchor.closest("tr");
    const priceCell = row.find("td.price");
    const priceHtml = priceCell.html();

    console.log(`\n=== ${name} (id=${itemId}) ===`);
    console.log('Price HTML:', JSON.stringify(priceHtml));
  }

  await browser.close();
}

main().catch(console.error);
