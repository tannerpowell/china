# Scraping Notes

## Strategy

1. Collect all `addtocart(<id>)` anchors from the menu page
2. For each item ID, call the modal API endpoint to get:
   - Item name and base price
   - Modifier groups and options with price deltas
   - Images (best-effort)
3. Normalize into a clean JSON structure

## Commands

```bash
# Discover API endpoints (run first to understand the site)
npm run discover -w @ci/scrape

# Scrape all menu items (Playwright — slow, browser-driven)
npm run scrape -w @ci/scrape

# Fresh capture WITHOUT a browser — fetch list + all modal endpoints
# directly. Preferred for re-captures. Checkpoints every 20 items.
cd scripts/scrape && bun x tsx fetch_fresh.ts

# Retry items whose modal refused the capture (closed/unavailable pages)
cd scripts/scrape && bun x tsx retry_failed.ts

# Normalize scraped data into clean JSON (reads previous normalized output
# to carry forward data for items whose modal failed this run)
npm run normalize -w @ci/scrape
```

## Script Locations

| Script | Path | Purpose |
|--------|------|---------|
| `discover` | `scripts/scrape/discover_endpoints.ts` | Find XHR/fetch endpoints |
| `scrape` | `scripts/scrape/scrape_menu.ts` | Extract menu data (Playwright) |
| `fetch_fresh` | `scripts/scrape/fetch_fresh.ts` | Playwright-free full capture |
| `retry_failed` | `scripts/scrape/retry_failed.ts` | Backoff retry for refused modals |
| `parse_modal` | `scripts/scrape/utils/parse_modal.ts` | Shared modal-HTML parser (price, groups, pricelist) |
| `normalize` | `scripts/scrape/utils/normalize.ts` | Clean and structure data |
| `sync_normalized` | `scripts/sanity/import/sync_normalized.ts` | Merge-safe Sanity patch (not a full re-import) |

## Source quirks (learned the hard way)

- **`.pricelist` radios carry FULL prices** for ~10 items (soups S/L, rice,
  wraps) — not deltas. Normalize makes the cheapest variant `basePrice` and
  emits a required (`min: 1`) `Size`/`Options` group with deltas.
- **Modals can refuse**: the endpoint sometimes returns
  "We do not take online orders currently" (`modalClosed: "closed"`) or an
  item-level "…today can not order!" (`modalClosed: "unavailable"`, e.g.
  lunch specials outside their window). Normalize carries the previous
  run's groups/images/descriptions forward for these — never blank them.
- **Prices on the list page** (`td.price` / `listPrice` in the capture) are
  the fallback when a modal refuses, and catch source price drift.
- **Descriptions live on the list page** in `<p id="name_info">`, not the
  modal — `fetch_fresh` extracts them.
- **"(Select up to N items below)"** in a group title is the real max;
  normalize parses it.
- The `ChoosChoose Your Main Ingredient` source typo keeps its stable id
  (`mod_chooschoose-your-main-ingredient`); only the display title is fixed.

## Output Files

- `data/raw/item_index.json` - List of all menu item IDs
- `data/raw/menu_capture.full.json` - Raw scraped data
- `data/normalized/menu.normalized.json` - Clean data for import
- `apps/web/src/data/menu.normalized.json` - Same file, copied for the app

## Troubleshooting

**No items found?** The menu page structure may have changed. Check if `addtocart()` anchors still exist.

**Missing prices?** Should not happen — normalize falls back to the list-page
price and the app's invariant tests (`pricing.test.ts`) fail if any item is
unpriceable. If it recurs, check `modalClosed` markers in the capture.

**Images not loading?** Image scraping is best-effort. Use the AI image generation pipeline in `data/` for missing images.
