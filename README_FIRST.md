# China Island Redesign (Vercel + Sanity, Option A)

This repo is designed to be **handed to a coding agent** (Codex / Claude) and executed with minimal human handholding.

## What this repo does
1) Scrapes the legacy menu site (http://www.chinaislandasiangrill.com/menu.asp) using Playwright:
   - categories (best-effort heuristic)
   - all items
   - base prices
   - all modifier groups/options (radio/checkbox)
   - images (best-effort)
2) Normalizes into a clean JSON data model.
3) Imports into Sanity (schemas + deterministic upserts + asset uploads).
4) Runs a Next.js (App Router) site ready for Vercel deployment.

## Quick start
### Prereqs
- Node 20+

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

### Scrape (if needed)
```bash
npm run scrape -w @ci/scrape
```

Outputs:
- `data/raw/item_index.json`
- `data/raw/menu_capture.full.json`
- `data/images/*`

### Normalize
```bash
npm run normalize -w @ci/scrape
```

Outputs:
- `data/normalized/menu.normalized.json`

### Sanity (optional now, recommended soon)
Copy `.env.example` -> `.env` and fill values.

Then:
```bash
npm run import -w @ci/sanity
```

## Agent handoff
If you're running an LLM agent one directory above this repo:
- Point it at `TODO.md` and tell it to execute tasks in order.
- It should start by running the scraper and confirming extracted modifiers look correct.

