/**
 * Restaurant information — single source of truth.
 *
 * Values verified 2026-09-05 against the official site
 * (chinaislandasiangrill.com) and delivery listings:
 * - Address: 6101 Long Prairie Rd, Suite 740, Flower Mound, TX 75028
 *   (Highland of Flower Mound Shopping Center)
 * - Phone: (972) 704-1971
 * - Hours: Sun–Thu 11 a.m.–9 p.m., Fri–Sat 11 a.m.–9:30 p.m.
 * - Cuisines: Sichuan, Mandarin, Hunan
 *
 * Each field can still be overridden with a NEXT_PUBLIC_* env var
 * (useful for staging), but the verified value is the fallback so
 * production never renders an empty phone/address block.
 */

function envOr(env: string | undefined, fallback: string): string {
  const v = (env ?? "").trim();
  return v === "" ? fallback : v;
}

export const restaurant = {
  name: "China Island Asian Grill",
  shortName: "China Island",

  phoneDisplay: envOr(
    process.env.NEXT_PUBLIC_RESTAURANT_PHONE,
    "(972) 704-1971"
  ),

  addressStreet: "6101 Long Prairie Rd, Suite 740",
  addressCity: "Flower Mound",
  addressRegion: "TX",
  addressZip: "75028",
  shoppingCenter: "Highland of Flower Mound Shopping Center",

  // Map pin for the shopping center (suite-level precision isn't published;
  // Google matches the listing to the GBP pin). Verified via OpenStreetMap.
  geo: { lat: 33.0691, lng: -97.0841 },
  priceRange: "$$",

  hoursSummary: envOr(
    process.env.NEXT_PUBLIC_RESTAURANT_HOURS,
    "Sun–Thu: 11 a.m. – 9 p.m. | Fri–Sat: 11 a.m. – 9:30 p.m."
  ),

  cuisines: ["Sichuan", "Mandarin", "Hunan", "Chinese", "Asian"],

  uberEatsUrl:
    "https://www.ubereats.com/store/china-island-asian-grill/Cb5z-PlgVGyHTwFF6vZoMQ",
  grubhubUrl:
    "https://www.grubhub.com/restaurant/china-island-asian-grill-6101-long-prairie-rd-flower-mound/2383162",
} as const;

export const restaurantPhoneHref =
  "tel:+1" + restaurant.phoneDisplay.replace(/\D/g, "").slice(-10);

export const restaurantAddressFull = `${restaurant.addressStreet}, ${restaurant.addressCity}, ${restaurant.addressRegion} ${restaurant.addressZip}`;

export const restaurantAddressEnv =
  envOr(process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS, restaurantAddressFull);

export const restaurantMapsQuery = encodeURIComponent(
  `${restaurant.name}, ${restaurantAddressFull}`
);

export const restaurantDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${restaurantMapsQuery}`;

export const restaurantMapEmbedUrl = `https://www.google.com/maps?q=${restaurantMapsQuery}&output=embed`;

export const restaurantHoursRows = [
  { days: "Sunday – Thursday", time: "11 a.m. – 9 p.m." },
  { days: "Friday – Saturday", time: "11 a.m. – 9:30 p.m." },
] as const;

export const restaurantHoursShort = [
  { days: "Sun–Thu", time: "11 a.m. – 9 p.m." },
  { days: "Fri–Sat", time: "11 a.m. – 9:30 p.m." },
] as const;
