import { chromium, type Response } from "playwright";
import { log } from "./utils/logger.js";
import { writeJson, ensureDir } from "./utils/storage.js";
import fs from "node:fs";

const MENU_URL = process.env.MENU_URL ?? "http://www.chinaislandasiangrill.com/menu.asp";
const SAMPLE_ITEM_ID = Number(process.env.SAMPLE_ITEM_ID ?? "6609230");

type Captured = { url: string; method?: string; status: number; contentType?: string | null; bodyPath?: string };

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const captured: Captured[] = [];
  ensureDir("data/raw/responses");

  page.on("response", async (res: Response) => {
    try {
      const req = res.request();
      const url = res.url();
      const rt = req.resourceType();
      if (!["xhr", "fetch", "document"].includes(rt)) return;

      const entry: Captured = {
        url,
        method: req.method(),
        status: res.status(),
        contentType: res.headers()["content-type"] ?? null
      };

      const maybeRelevant = /add|cart|order|menu|item|popup|dialog|shoppingcart|chinesemenu/i.test(url);
      if (maybeRelevant && res.ok()) {
        const buf = await res.body().catch(() => null);
        if (buf) {
          const safe = url.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 120);
          const bodyPath = `data/raw/responses/${safe}__${Date.now()}.bin`;
          fs.writeFileSync(bodyPath, buf);
          entry.bodyPath = bodyPath;
        }
      }
      captured.push(entry);
    } catch {}
  });

  log("Opening menu:", MENU_URL);
  await page.goto(MENU_URL, { waitUntil: "domcontentloaded" });

  log("Invoking addtocart:", SAMPLE_ITEM_ID);
  await page.evaluate((id) => {
    // @ts-ignore
    if (typeof window.addtocart === "function") window.addtocart(id);
  }, SAMPLE_ITEM_ID);

  await page.waitForTimeout(3000);

  writeJson("data/raw/discover_endpoints.report.json", { menuUrl: MENU_URL, sampleItemId: SAMPLE_ITEM_ID, captured });
  log("Wrote data/raw/discover_endpoints.report.json:", captured.length, "entries");
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
