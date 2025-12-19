# Vercel Deployment Guide

## Quick Start

1. Import this repository into Vercel
2. Configure the build settings (see below)
3. Add environment variables
4. Deploy

## Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `pnpm --filter @ci/web build` |
| Output Directory | `.next` (default) |
| Install Command | `pnpm install` |

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | `abc123xyz` |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name | `production` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version | `2025-12-01` |
| `NEXT_PUBLIC_SANITY_USE_CDN` | Enable Sanity CDN | `false` |
| `NEXT_PUBLIC_ORDER_CART_URL` | External ordering link | — |
| `NEXT_PUBLIC_RESTAURANT_PHONE` | Phone for call-to-order | — |

### Stripe (if payments enabled)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (server-side) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |

## Monorepo Configuration

This is a pnpm monorepo. Vercel should auto-detect pnpm from the lockfile.

If builds fail with dependency issues:
1. Ensure `Root Directory` is set to `apps/web`
2. Verify `Install Command` uses pnpm
3. Check that the filter flag targets the correct package name

## Post-Deployment

- Verify environment variables are loaded (check console for startup errors)
- Test Sanity content is fetching correctly
- Confirm ordering links work
