import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

// Retires the third-party cart: unsets the whole `order` object
// (provider / cartUrl / itemOrderUrl, ex chinesemenu.com) on
// scrape-managed menuItem docs (item_* ids only — owner-created docs
// are never touched). Nothing renders these fields anymore; all
// ordering routes to the in-house /order cart.
//
// Backup: /tmp/sanity-order-backup-*.json (118 docs, 2026-09-07).
//
// Usage: tsx import/unset_order_links.ts [--dry-run]
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  const all = await sanity.fetch(
    `*[_type == "menuItem" && defined(order)]{_id}`
  );
  const docs = (all as { _id: string }[]).filter((d) =>
    d._id.startsWith("item_")
  );
  console.log(
    `${DRY_RUN ? "[dry-run] " : ""}Would unset order on ${docs.length} managed docs`
  );
  if (DRY_RUN) return;

  let ok = 0;
  const failed: string[] = [];
  for (const d of docs as { _id: string }[]) {
    try {
      await sanity.patch(d._id).unset(["order"]).commit();
      ok++;
    } catch (err) {
      failed.push(`${d._id}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`Done: ${ok} unset, ${failed.length} failed`);
  for (const f of failed) console.error("FAILED", f);
  if (failed.length > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
