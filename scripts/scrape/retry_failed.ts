/**
 * Retry pass for items whose modal endpoint returned the "closed" page.
 * The response is intermittent (rate-limit flavored), not per-item — the
 * same mid succeeds on a later attempt. Reads the existing capture,
 * refetches only failed items with backoff, rewrites in place.
 *
 * Usage: tsx retry_failed.ts
 */
import { readJson, writeJson } from "./utils/storage.js";
import { parseApiResponse } from "./utils/parse_modal.js";
import { log } from "./utils/logger.js";

const MENU_URL = process.env.MENU_URL ?? "http://www.chinaislandasiangrill.com/menu.asp";
const RID = process.env.RID ?? "301196398";
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = Number(process.env.RETRY_DELAY_MS ?? 1500);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const raw = readJson<{ items: any[] }>("data/raw/menu_capture.full.json");
  const origin = new URL(MENU_URL).origin;

  let recovered = 0;
  for (const cap of raw.items) {
    // An "empty" modal is a refusal too — the "today can not order" page
    // parses to all-null fields. Treat it as failed and refetch.
    if (cap.modal && (cap.modal.modalItemName || cap.modal.basePrice != null || cap.modal.likes != null || cap.modal.modifierGroups?.length)) continue;
    if (cap.modal) cap.modal = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const apiUrl = `${origin}/order/?type=addtocart&mid=${cap.itemId}&rid=${RID}&country=us&domain=chinaislandasiangrill.com&_cb=${Date.now()}`;
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const html = await res.text();
          const closed = /do not take online orders currently/i.test(html);
          const unavailable = /today can not order/i.test(html);
          if (!closed && !unavailable) {
            cap.modal = parseApiResponse(html);
            delete cap.modalClosed;
            cap.errors = cap.errors.filter((e: string) => !e.startsWith("modal endpoint returned"));
            recovered++;
            log(`Recovered ${cap.itemId} ${cap.nameFromList} (attempt ${attempt})`);
            break;
          } else if (unavailable) {
            cap.modalClosed = "unavailable";
          }
        } else {
          log(`${cap.itemId}: HTTP ${res.status} (attempt ${attempt})`);
        }
      } catch (e: any) {
        log(`${cap.itemId}: ${e?.message ?? e} (attempt ${attempt})`);
      }
      await sleep(BASE_DELAY_MS * attempt);
    }
    if (!cap.modal) log(`Still closed: ${cap.itemId} ${cap.nameFromList}`);
  }

  writeJson("data/raw/menu_capture.full.json", raw);
  const stillFailed = raw.items.filter((c) => !c.modal).length;
  log(`Done. Recovered ${recovered}; ${stillFailed} still failed.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
