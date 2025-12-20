# Sanity Setup

## Create Project

1. Go to [sanity.io/manage](https://sanity.io/manage) and create a new project
2. Create a dataset named `production`
3. Go to API → Tokens and create a token with **Editor** permissions

## Environment Variables

Copy the example env file and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project settings → Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` |
| `SANITY_TOKEN` | API → Tokens (for import scripts) |

## Import Data

Run the import script to populate Sanity with menu data:

```bash
npm run import -w @ci/sanity
```

This reads from `data/normalized/menu.normalized.json` and creates:
- Categories
- Menu items with prices and modifiers
- Image assets
