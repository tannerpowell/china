import { describe, expect, test, afterEach } from "bun:test";
import { breadcrumbJsonLd, menuJsonLd } from "./schema";
import type { Category, MenuItem } from "./types";

const ENV_KEY = "NEXT_PUBLIC_SITE_URL";
const savedEnv = process.env[ENV_KEY];

afterEach(() => {
  if (savedEnv === undefined) delete process.env[ENV_KEY];
  else process.env[ENV_KEY] = savedEnv;
});

function category(overrides: Partial<Category> = {}): Category {
  return { id: "cat_soups", title: "Soups", slug: "soups", sortOrder: 1, ...overrides };
}

function item(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: "item_1",
    sourceItemId: 1,
    name: "Wonton Soup",
    slug: "wonton-soup",
    categoryId: "cat_soups",
    basePrice: 8.5,
    description: "Classic pork wontons.",
    likes: 10,
    tags: { spicy: false, vegetarian: false, popular: false },
    images: [],
    modifierGroupIds: [],
    order: { provider: "", cartUrl: "", itemOrderUrl: null },
    ...overrides,
  };
}

describe("breadcrumbJsonLd", () => {
  test("ancestor crumbs carry absolute URLs, current page carries none", () => {
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Menu" },
    ]);
    expect(data["@type"]).toBe("BreadcrumbList");
    const els = data.itemListElement as Array<Record<string, unknown>>;
    expect(els).toHaveLength(2);
    expect(els[0]).toMatchObject({ position: 1, name: "Home" });
    expect(els[0].item).toBe("https://chinaislandgrill.com/");
    expect(els[1]).toMatchObject({ position: 2, name: "Menu" });
    expect("item" in els[1]).toBe(false);
  });

  test("trailing slash on configured base does not double up", () => {
    process.env[ENV_KEY] = "https://example.com/";
    const data = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Order Online" },
    ]);
    const els = data.itemListElement as Array<Record<string, unknown>>;
    expect(els[0].item).toBe("https://example.com/");
  });

  test("empty or non-absolute values fall back to the canonical site", () => {
    for (const bad of ["", "   ", "/menu", "not a url"]) {
      process.env[ENV_KEY] = bad;
      const data = breadcrumbJsonLd([{ name: "Home", path: "/" }]);
      const els = data.itemListElement as Array<Record<string, unknown>>;
      expect(els[0].item).toBe("https://chinaislandgrill.com/");
    }
  });
});

describe("menuJsonLd", () => {
  test("sections follow sortOrder and items stay in their section", () => {
    const cats = [
      category({ id: "cat_b", title: "B", slug: "b", sortOrder: 2 }),
      category({ id: "cat_a", title: "A", slug: "a", sortOrder: 1 }),
    ];
    const items = [
      item({ id: "i1", name: "In B", categoryId: "cat_b" }),
      item({ id: "i2", name: "In A", categoryId: "cat_a" }),
    ];
    const data = menuJsonLd(cats, items);
    const sections = data.hasMenuSection as Array<{
      name: string;
      hasMenuItem: Array<{ name: string }>;
    }>;
    expect(sections.map((s) => s.name)).toEqual(["A", "B"]);
    expect(sections[0].hasMenuItem.map((i) => i.name)).toEqual(["In A"]);
    expect(sections[1].hasMenuItem.map((i) => i.name)).toEqual(["In B"]);
  });

  test("items in unknown categories are excluded; empty sections render empty", () => {
    const data = menuJsonLd(
      [category()],
      [item({ id: "orphan", categoryId: "cat_missing" })]
    );
    const sections = data.hasMenuSection as Array<{ hasMenuItem: unknown[] }>;
    expect(sections).toHaveLength(1);
    expect(sections[0].hasMenuItem).toEqual([]);
  });

  test("null price omits offers; zero price keeps a $0.00 offer", () => {
    const data = menuJsonLd(
      [category()],
      [
        item({ id: "unpriced", basePrice: null }),
        item({ id: "free", basePrice: 0 }),
      ]
    );
    const items = (data.hasMenuSection as Array<{ hasMenuItem: Array<Record<string, unknown>> }>)[0]
      .hasMenuItem;
    expect("offers" in items[0]).toBe(false);
    expect(items[1].offers).toMatchObject({
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
    });
  });

  test("price formats to two decimals; description omitted when absent", () => {
    const data = menuJsonLd(
      [category()],
      [item({ basePrice: 8.5, description: null })]
    );
    const got = (data.hasMenuSection as Array<{ hasMenuItem: Array<Record<string, unknown>> }>)[0]
      .hasMenuItem[0];
    expect(got.offers).toMatchObject({ price: "8.50", priceCurrency: "USD" });
    expect("description" in got).toBe(false);
  });

  test("vegetarian flag maps to VegetarianDiet; other items omit it", () => {
    const data = menuJsonLd(
      [category()],
      [
        item({ id: "veg", tags: { spicy: false, vegetarian: true, popular: false } }),
        item({ id: "meat", tags: { spicy: true, vegetarian: false, popular: true } }),
      ]
    );
    const items = (data.hasMenuSection as Array<{ hasMenuItem: Array<Record<string, unknown>> }>)[0]
      .hasMenuItem;
    expect(items[0].suitableForDiet).toBe("https://schema.org/VegetarianDiet");
    expect("suitableForDiet" in items[1]).toBe(false);
  });

  test("menu URL uses the normalized configured base", () => {
    process.env[ENV_KEY] = "https://example.com/";
    const data = menuJsonLd([category()], []);
    expect(data.url).toBe("https://example.com/menu");
  });
});
