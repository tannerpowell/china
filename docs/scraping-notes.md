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

# Scrape all menu items
npm run scrape -w @ci/scrape

# Normalize scraped data into clean JSON
npm run normalize -w @ci/scrape
```

## Script Locations

| Script | Path | Purpose |
|--------|------|---------|
| `discover` | `scripts/scrape/discover_endpoints.ts` | Find XHR/fetch endpoints |
| `scrape` | `scripts/scrape/scrape_menu.ts` | Extract menu data |
| `normalize` | `scripts/scrape/utils/normalize.ts` | Clean and structure data |

## Output Files

- `data/raw/item_index.json` - List of all menu item IDs
- `data/raw/menu_capture.full.json` - Raw scraped data
- `data/normalized/menu.normalized.json` - Clean data for import

## Troubleshooting

**No items found?** The menu page structure may have changed. Check if `addtocart()` anchors still exist.

**Missing prices?** Some items use size variants (S/L) instead of base prices. The normalize script handles this.

**Images not loading?** Image scraping is best-effort. Use the AI image generation pipeline in `data/` for missing images.
