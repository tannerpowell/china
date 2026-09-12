import { describe, expect, test } from "bun:test";
import {
  priceProposal,
  validateSelection,
  selectionUnitCents,
  startingPriceCents,
  toCents,
  TAX_RATE,
  MAX_QTY_PER_LINE,
  type OrderProposal,
  type MenuSource,
} from "./pricing";
import type { MenuItem, ModifierGroup } from "./types";
import menuData from "../data/menu.normalized.json";

const menu = menuData as unknown as { items: MenuItem[]; modifierGroups: ModifierGroup[] };
const source: MenuSource = { items: menu.items, modifierGroups: menu.modifierGroups };

const byName = (n: string) => menu.items.find((i) => i.name === n)!;
const group = (id: string) => menu.modifierGroups.find((g) => g.id === id)!;

const pickup = (items: OrderProposal["items"]): OrderProposal => ({
  items,
  orderType: "pickup",
});

describe("priceProposal: happy path", () => {
  test("simple priced item", () => {
    const eggRoll = menu.items.find((i) => i.name === "Egg Roll (1)")!;
    const r = priceProposal(pickup([{ menuItemId: eggRoll.id, quantity: 2 }]), source);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lines[0].unitCents).toBe(toCents(eggRoll.basePrice!));
    expect(r.lines[0].lineCents).toBe(toCents(eggRoll.basePrice!) * 2);
    expect(r.subtotalCents).toBe(toCents(eggRoll.basePrice!) * 2);
    expect(r.taxCents).toBe(Math.round(r.subtotalCents * TAX_RATE));
    expect(r.totalCents).toBe(r.subtotalCents + r.taxCents);
  });

  test("modifier deltas add to unit price", () => {
    // mod_choose-your-main-ingredient: Shrimp +$2 on e.g. Fried Rice
    const item = menu.items.find(
      (i) => i.modifierGroupIds.includes("mod_choose-your-main-ingredient") && i.basePrice != null
    )!;
    const g = group("mod_choose-your-main-ingredient");
    const shrimp = g.options.find((o) => o.label === "Shrimp")!;
    const r = priceProposal(
      pickup([
        {
          menuItemId: item.id,
          quantity: 1,
          modifiers: [{ groupId: g.id, optionId: shrimp.id }],
        },
      ]),
      source
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lines[0].unitCents).toBe(toCents(item.basePrice!) + toCents(shrimp.priceDelta));
    expect(r.lines[0].modifiers[0].label).toBe("Shrimp");
  });

  test("size-priced item: required group carries the full price", () => {
    const soup = byName("Hot & Sour Soup");
    const gid = soup.modifierGroupIds[0];
    const g = group(gid);
    const large = g.options.find((o) => o.label === "Large")!;
    const r = priceProposal(
      pickup([
        { menuItemId: soup.id, quantity: 1, modifiers: [{ groupId: gid, optionId: large.id }] },
      ]),
      source
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Large Hot & Sour is $6.00 on the source menu.
    expect(r.lines[0].unitCents).toBe(600);
  });

  test("size-priced item: missing size is rejected", () => {
    const soup = byName("Hot & Sour Soup");
    const r = priceProposal(pickup([{ menuItemId: soup.id, quantity: 1 }]), source);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/requires a selection/i);
  });

  test("tip adds to total, never taxed", () => {
    const eggRoll = byName("Egg Roll (1)");
    const r = priceProposal(
      { items: [{ menuItemId: eggRoll.id, quantity: 1 }], orderType: "pickup", tipCents: 300 },
      source
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tipCents).toBe(300);
    expect(r.taxCents).toBe(Math.round(r.subtotalCents * TAX_RATE)); // tip excluded
    expect(r.totalCents).toBe(r.subtotalCents + r.taxCents + 300);
  });
});

describe("priceProposal: rejection cases", () => {
  test("empty cart", () => {
    const r = priceProposal({ items: [], orderType: "pickup" }, source);
    expect(r.ok).toBe(false);
  });

  test("unknown item id", () => {
    const r = priceProposal(pickup([{ menuItemId: "item_bogus", quantity: 1 }]), source);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/unknown menu item/i);
  });

  test("quantity bounds", () => {
    const eggRoll = byName("Egg Roll (1)");
    for (const q of [0, -1, 1.5, MAX_QTY_PER_LINE + 1]) {
      const r = priceProposal(pickup([{ menuItemId: eggRoll.id, quantity: q }]), source);
      expect(r.ok).toBe(false);
    }
  });

  test("modifier group not offered by the item", () => {
    const eggRoll = byName("Egg Roll (1)"); // has no modifier groups
    const r = priceProposal(
      pickup([
        { menuItemId: eggRoll.id, quantity: 1, modifiers: [{ groupId: "mod_how-spicy", optionId: "opt_extra-hot" }] },
      ]),
      source
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/not offered/i);
  });

  test("unknown option id inside a valid group", () => {
    const item = menu.items.find((i) => i.modifierGroupIds.includes("mod_how-spicy"))!;
    const r = priceProposal(
      pickup([
        { menuItemId: item.id, quantity: 1, modifiers: [{ groupId: "mod_how-spicy", optionId: "opt_nope" }] },
      ]),
      source
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/unknown option/i);
  });

  test("single-select group rejects two options", () => {
    const item = menu.items.find((i) => i.modifierGroupIds.includes("mod_how-spicy"))!;
    const g = group("mod_how-spicy");
    const r = priceProposal(
      pickup([
        {
          menuItemId: item.id,
          quantity: 1,
          modifiers: [
            { groupId: g.id, optionId: g.options[0].id },
            { groupId: g.id, optionId: g.options[1].id },
          ],
        },
      ]),
      source
    );
    expect(r.ok).toBe(false);
  });

  test("multi-select group caps at max", () => {
    // "Additional Protein (Select up to 3 items below)" — 6 options, max 3
    const g = group("mod_additional-protein-select-up-to-3-items-below");
    const item = menu.items.find((i) => i.modifierGroupIds.includes(g.id))!;
    const over = g.options.map((o) => ({ groupId: g.id, optionId: o.id }));
    expect(over.length).toBeGreaterThan(g.max);
    const r = priceProposal(
      pickup([{ menuItemId: item.id, quantity: 1, modifiers: over }]),
      source
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/at most/i);
  });

  test("duplicate option in same group rejected", () => {
    const item = menu.items.find((i) => i.modifierGroupIds.includes("mod_how-spicy"))!;
    const g = group("mod_how-spicy");
    const r = priceProposal(
      pickup([
        {
          menuItemId: item.id,
          quantity: 1,
          modifiers: [
            { groupId: g.id, optionId: g.options[0].id },
            { groupId: g.id, optionId: g.options[0].id },
          ],
        },
      ]),
      source
    );
    expect(r.ok).toBe(false);
  });

  test("delivery without address rejected", () => {
    const eggRoll = byName("Egg Roll (1)");
    const r = priceProposal(
      { items: [{ menuItemId: eggRoll.id, quantity: 1 }], orderType: "delivery" },
      source
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.join(" ")).toMatch(/street, city, and ZIP/i);
  });

  test("delivery with valid address passes", () => {
    const eggRoll = byName("Egg Roll (1)");
    const r = priceProposal(
      {
        items: [{ menuItemId: eggRoll.id, quantity: 1 }],
        orderType: "delivery",
        deliveryAddress: { street: "100 Main St", city: "Flower Mound", zip: "75028" },
      },
      source
    );
    expect(r.ok).toBe(true);
  });

  test("invalid tip rejected", () => {
    const eggRoll = byName("Egg Roll (1)");
    for (const tipCents of [-1, 1.5, 999999]) {
      const r = priceProposal(
        { items: [{ menuItemId: eggRoll.id, quantity: 1 }], orderType: "pickup", tipCents },
        source
      );
      expect(r.ok).toBe(false);
    }
  });
});

describe("validateSelection (client/shared)", () => {
  test("required group blocks until satisfied", () => {
    const soup = byName("Hot & Sour Soup");
    const g = group(soup.modifierGroupIds[0]);
    const empty = validateSelection(soup, [g], {});
    expect(empty.ok).toBe(false);
    const filled = validateSelection(soup, [g], { [g.id]: [g.options[0].id] });
    expect(filled.ok).toBe(true);
  });
});

describe("startingPriceCents", () => {
  test("returns base price when present", () => {
    const eggRoll = byName("Egg Roll (1)");
    expect(startingPriceCents(eggRoll, menu.modifierGroups)).toBe(toCents(eggRoll.basePrice!));
  });

  test("size-priced item returns cheapest legal selection", () => {
    const soup = byName("Hot & Sour Soup");
    expect(startingPriceCents(soup, menu.modifierGroups)).toBe(325); // Small $3.25
  });
});

describe("menu data invariants (guard the pipeline)", () => {
  test("every item is priceable: basePrice or a required priced group", () => {
    const bad = menu.items.filter((i) => {
      if (i.basePrice != null) return false;
      return !i.modifierGroupIds.some((gid) => {
        const g = menu.modifierGroups.find((x) => x.id === gid);
        return g && g.min > 0 && g.options.some((o) => o.priceDelta >= 0);
      });
    });
    expect(bad.map((i) => i.name)).toEqual([]);
  });

  test("every modifierGroupId on an item resolves to a real group", () => {
    const ids = new Set(menu.modifierGroups.map((g) => g.id));
    const dangling = menu.items.flatMap((i) => i.modifierGroupIds.filter((gid) => !ids.has(gid)));
    expect(dangling).toEqual([]);
  });

  test("no $0-or-less legal selection", () => {
    // For each item, the cheapest legal selection must be > $0.
    const bad = menu.items.filter((i) => {
      const groups = menu.modifierGroups.filter((g) => i.modifierGroupIds.includes(g.id));
      const start = startingPriceCents(i, groups);
      return start == null || start <= 0;
    });
    expect(bad.map((i) => i.name)).toEqual([]);
  });
});
