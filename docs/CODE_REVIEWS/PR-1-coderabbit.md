# CodeRabbit Review - PR #1 (feat/web-app)

## Summary
- **Total Actionable Comments**: 13 (Critical/Major as inline)
- **Minor Comments**: 11
- **Nitpick Comments**: 52

---

## Critical Issues (4)

| # | File | Line | Issue | Status |
|---|------|------|-------|--------|
| C1 | `scripts/analyze_images.ts` | 9 | Hardcoded absolute path | ✅ Fixed |
| C2 | `scripts/optimize-images.mjs` | 14 | Hardcoded absolute paths | ✅ Fixed |
| C3 | `scripts/sanity/upload-images.mjs` | 22 | Hardcoded absolute path | ✅ Fixed |
| C4 | `scripts/sanity/upload-images.mjs` | 139 | Undefined variable `slug` (should be `imageSlug`) | ✅ Fixed |

---

## Major Issues (17)

| # | File | Line | Issue | Status |
|---|------|------|-------|--------|
| M1 | `apps/web/.env.example` | 2 | Replace actual project ID with placeholder | ✅ Fixed |
| M2 | `apps/web/vercel.json` | 3 | Fix buildCommand to use pnpm | ✅ Fixed |
| M3 | `apps/web/src/lib/sanity.ts` | 61 | GROQ injection risk - use parameterized queries | ✅ Fixed |
| M4 | `apps/web/src/app/globals.css` | 1 | Use next/font instead of @import | ✅ Fixed |
| M5 | `apps/web/src/app/styles/menu3-fonts.css` | 51 | WCAG contrast (#888888 -> #767676) | ✅ Fixed |
| M6 | `apps/web/src/lib/menu-sanity.ts` | 49 | Module-level caching in serverless | ⏭️ Noted (future improvement) |
| M7 | `apps/web/scripts/screenshot-test.mjs` | 36 | Code duplication with .ts version | ⏭️ Skipped (intentional) |
| M8 | `apps/web/src/app/api/webhooks/stripe/route.ts` | 5 | Validate STRIPE_WEBHOOK_SECRET | ✅ Fixed |
| M9 | `apps/web/src/app/ui/MenuExplorer.tsx` | 6 | Unsafe `any` type casting | ✅ Fixed |
| M10 | `apps/web/src/components/StripeProvider.tsx` | 10 | Validate publishable key | ✅ Fixed |
| M11 | `scripts/optimize-images.mjs` | 88 | Shell command injection risk | ✅ Fixed |
| M12 | `scripts/sanity/import/import_to_sanity.ts` | 60 | Silent error catch | ✅ Fixed |
| M13 | `scripts/sanity/import/upload_images.ts` | 14 | Type mismatch slug field | ✅ Fixed |
| M14 | `scripts/sanity/upload-round2.mjs` | 18 | Hardcoded absolute path | ✅ Fixed |
| M15 | `scripts/scrape/utils/normalize.ts` | 41 | Empty option labels | ✅ Fixed |
| M16 | `apps/web/src/lib/menu-sanity.ts` | 44 | Defensive fallback for options | ✅ Fixed |

---

## Minor Issues (13)

| # | File | Line | Issue | Status |
|---|------|------|-------|--------|
| N1 | `apps/web/src/app/location/page.tsx` | 9 | Add `noopener` to rel attribute | ✅ Fixed |
| N2 | `apps/web/src/app/order/page.tsx` | 9 | Add `noopener` to rel attribute | ✅ Fixed |
| N3 | `scripts/sanity/utils/sanityClient.ts` | 4-7 | Use more recent API version date | ✅ Fixed |
| N4 | `docs/IMAGE_SYNC_PLAN.md` | 50 | Fix malformed table row | ✅ Fixed |
| N5 | `apps/web/src/app/v2/page.tsx` | 66-69 | Hardcoded "Open Now" is misleading | ✅ Fixed |
| N6 | `scripts/sanity/import/upload_images.ts` | 65-76 | Partial match found but never used | ✅ Fixed |
| N7 | `scripts/scrape/discover_endpoints.ts` | 42 | Silent error swallowing | ✅ Fixed |
| N8 | `apps/web/src/components/Header.module.css` | 136 | Missing animation definition | ✅ Fixed |
| N9 | `apps/web/src/app/ui/MenuExplorer.tsx` | 41 | Missing aria-label for search | ✅ Fixed |
| N10 | `scripts/scrape/scrape_menu.ts` | 90-184 | Browser may not close on error | ✅ Fixed |
| N11 | `scripts/scrape/rescrape_missing.ts` | 101-105 | Risky non-null assertion | ✅ Fixed |
| N12 | `apps/web/src/app/page.tsx` | 30 | Duplicate nav links / hardcoded active | ✅ Fixed |
| N13 | `apps/web/src/app/styles/menu3-fonts.css` | 63 | Inconsistent variable naming (border-dashed) | ✅ Fixed |

---

## Nitpick Comments (Selected)

| # | File | Issue | Status |
|---|------|-------|--------|
| NP1 | `docs/vercel-deploy.md` | Enhance documentation | ⏭️ Low priority |
| NP2 | Various | Alphabetical ordering of env vars | ⏭️ Low priority |
| ... | ... | (52 total nitpicks - most are low priority) | ... |

---

## Notes

### Skipped Items (with justification)
- **M6 (serverless caching)**: This is a known limitation. Full solution requires ISR or webhook-based invalidation. Noted for future sprint.
- **M7 (duplicate test files)**: Both .mjs and .ts versions kept intentionally for different execution contexts.

### Fixed in commit ae7fc18
- C1-C4: All hardcoded paths and variable bug
- M8, M10: Stripe env validation
- M5: WCAG contrast
- M12, M15, M16: Error handling and defensive coding

### Fixed in final nitpick pass
- N1, N2: Added `noopener` to external links
- N4: Fixed malformed markdown table
- N6: Partial match now used in upload_images.ts
- N7: Error logging in discover_endpoints.ts
- N8: Added scaleIn keyframes animation
- N9: Added aria-label to search input
- N10: Added try/finally for browser cleanup
- N11: Removed risky non-null assertion
- N12: Fixed duplicate nav links and removed hardcoded active state
- N13: Fixed inconsistent border-dashed variable
- M9: Added proper TypeScript interfaces for menu data
- M11: Used execFileSync to prevent shell injection
- M13: Fixed slug type mismatch in upload_images.ts

### Fixed in follow-up pass
- M4: Migrated to next/font (removed @import, added Sen font via next/font/google)
- N3: Updated Sanity API version to 2025-12-01 (4 files)
- N5: Implemented dynamic open/closed status based on business hours

---

## Final Status

| Category | Total | Fixed | Skipped | Remaining |
|----------|-------|-------|---------|-----------|
| Critical | 4 | 4 | 0 | 0 |
| Major | 17 | 15 | 2 | 0 |
| Minor | 13 | 13 | 0 | 0 |
| Nitpick | 52 | - | - | Low priority |

**All actionable issues have been addressed.**
