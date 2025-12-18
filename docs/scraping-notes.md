# Scraping Notes

Primary strategy:
- Collect all `addtocart(<id>)` anchors from menu.asp
- For each id, invoke `window.addtocart(id)` and parse:
  - modal DOM fields (name, base price, groups/options)
  - images from modal (best-effort)
- Use `discover` command to capture XHR/fetch endpoints and pivot to structured parsing if available.

Commands:
- `pnpm --filter @ci/scrape discover`
- `pnpm --filter @ci/scrape scrape`
- `pnpm --filter @ci/scrape normalize`
