# Sanity Setup

## Create Project

1. Go to [sanity.io/manage](https://sanity.io/manage) and create a new project
2. Create a dataset named `production`
3. Go to API → Tokens and create a token with **Editor** permissions

## Owner Access (editing the menu in a browser)

The Studio is embedded in the site at `/studio` (e.g.
https://chinaislandgrill.vercel.app/studio). For the owner to log in:

1. The owner needs a Sanity account (free — sign in with Google at
   [sanity.io](https://sanity.io)).
2. In [sanity.io/manage](https://sanity.io/manage), open the project →
   **Members** → **Invite member**, and add the owner's email as an
   **Editor**.
3. In project → **API** → **CORS origins**, add the site origin
   (`https://chinaislandgrill.vercel.app`, allow credentials) — without
   this the Studio shows a "Connect this Studio" screen instead of logging in.
4. The owner visits `/studio`, clicks **Log in**, and can edit menu items,
   categories, prices, descriptions, and tags. Changes go live on `/menu`
   immediately (the page reads Sanity at request time — no redeploy needed).

Schemas live in `apps/web/src/sanity/schemas.ts` and match the documents
written by the import scripts.

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
