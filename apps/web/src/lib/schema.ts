import type { Category, MenuItem } from "./types";
import { restaurant } from "./restaurant";

const FALLBACK_SITE_URL = "https://chinaislandgrill.com";

function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (raw !== "") {
    try {
      const url = new URL(raw);
      const absoluteHttp =
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.username === "" &&
        url.password === "" &&
        url.search === "" &&
        url.hash === "";
      if (absoluteHttp) {
        // Preserve a deliberate base pathname (staging mounts), but never
        // let query/fragment/credentials leak into structured-data URLs.
        return (url.origin + url.pathname).replace(/\/+$/, "") || url.origin;
      }
    } catch {
      // Not parseable as an absolute URL — fall through to the fallback.
    }
  }
  return FALLBACK_SITE_URL;
}

export interface BreadcrumbTrailItem {
  name: string;
  /** Path from the site root, e.g. "/menu". Omit for the current page. */
  path?: string;
}

/**
 * BreadcrumbList structured data for a page.
 * Pass the trail from Home to the current page.
 */
export function breadcrumbJsonLd(trail: BreadcrumbTrailItem[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${base}${crumb.path}` } : {}),
    })),
  };
}

/**
 * Menu structured data for the full menu page.
 *
 * Deterministic with zero owner input:
 * - Every item renders with name (+ description when the source site has one).
 * - offers renders only when a base price exists (some source items are unpriced).
 * - suitableForDiet renders only for vegetarian items (VegetarianDiet).
 *   Spiciness has no schema.org diet equivalent, so it is intentionally omitted.
 */
export function menuJsonLd(categories: Category[], items: MenuItem[]) {
  const base = siteUrl();
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${restaurant.name} Menu`,
    url: `${base}/menu`,
    hasMenuSection: sorted.map((cat) => ({
      "@type": "MenuSection",
      name: cat.title,
      hasMenuItem: items
        .filter((item) => item.categoryId === cat.id)
        .map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.basePrice != null
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.basePrice.toFixed(2),
                  priceCurrency: "USD",
                },
              }
            : {}),
          ...(item.tags.vegetarian
            ? { suitableForDiet: "https://schema.org/VegetarianDiet" }
            : {}),
        })),
    })),
  };
}
