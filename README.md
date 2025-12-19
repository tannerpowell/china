# China Island Asian Grill

Website redesign for China Island Asian Grill restaurant.

## Tech Stack

- **Framework**: Next.js 16
- **CMS**: Sanity
- **Payments**: Stripe
- **Package Manager**: npm (workspaces)

## Getting Started

```bash
npm install
cp apps/web/.env.example apps/web/.env
npm run dev
```

### Configuration

Before running the development server, configure your environment in `apps/web/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Your Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Dataset name (usually `production`) |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key |

See `apps/web/.env.example` for all available variables.

## Project Structure

```
apps/web/        # Next.js web application
scripts/scrape/  # Menu scraping tools
scripts/sanity/  # Sanity import tools
data/            # Generated data and assets
```
