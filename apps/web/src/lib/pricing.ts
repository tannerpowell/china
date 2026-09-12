/**
 * Server-side pricing contract — the sole pricing authority for orders.
 *
 * Everything here is integer cents. Client carts display in dollars, but
 * the numbers that charge a card are computed from menu data on the server,
 * never from client-supplied prices.
 *
 * The same module also backs client-side validation (modals gate "Add to
 * Order" on `validateSelection`) so the rules live in exactly one place.
 */

import type { MenuItem, ModifierGroup } from "./types";

export const TAX_RATE = 0.0825; // 8.25% Flower Mound, TX
export const MAX_QTY_PER_LINE = 20; // matches the legacy site's qty select
export const MAX_ITEMS_PER_ORDER = 40;
export const MAX_TIP_CENTS = 50000; // sanity cap — $500 tip
export const MAX_INSTRUCTIONS_LEN = 500;

export const toCents = (dollars: number): number => Math.round(dollars * 100);
export const toDollars = (cents: number): number => cents / 100;
export const fmtCents = (cents: number): string => `$${toDollars(cents).toFixed(2)}`;

// ---------------------------------------------------------------------------
// Selection validation (shared by the order modal and the server)
// ---------------------------------------------------------------------------

export interface SelectionIssue {
  groupId: string;
  groupTitle: string;
  kind: "required" | "too_many";
  /** How many are needed/allowed. */
  limit: number;
}

/**
 * Validate a modal's selection map against an item's modifier groups.
 * `selected` maps groupId → chosen optionIds.
 */
export function validateSelection(
  item: MenuItem,
  groups: ModifierGroup[],
  selected: Record<string, string[]>
): { ok: boolean; issues: SelectionIssue[] } {
  const issues: SelectionIssue[] = [];
  for (const g of groups) {
    if (!item.modifierGroupIds.includes(g.id)) continue;
    const count = selected[g.id]?.length ?? 0;
    if (count < g.min) {
      issues.push({ groupId: g.id, groupTitle: g.title, kind: "required", limit: g.min });
    } else if (count > g.max) {
      issues.push({ groupId: g.id, groupTitle: g.title, kind: "too_many", limit: g.max });
    }
  }
  return { ok: issues.length === 0, issues };
}

/**
 * Unit price in cents for a valid selection: base price + option deltas.
 * For size/variant-priced items the group carries the full price as deltas
 * over the cheapest variant, so the math is the same shape.
 */
export function selectionUnitCents(
  item: MenuItem,
  groups: ModifierGroup[],
  selected: Record<string, string[]>
): number {
  let cents = toCents(item.basePrice ?? 0);
  for (const g of groups) {
    if (!item.modifierGroupIds.includes(g.id)) continue;
    for (const optId of selected[g.id] ?? []) {
      const opt = g.options.find((o) => o.id === optId);
      if (opt) cents += toCents(opt.priceDelta);
    }
  }
  return cents;
}

/**
 * The lowest orderable price for an item — used for "From $X" display on
 * items priced entirely by a required variant group (soups S/L, etc.).
 */
export function startingPriceCents(item: MenuItem, groups: ModifierGroup[]): number | null {
  if (item.basePrice != null) return toCents(item.basePrice);
  const required = groups.filter(
    (g) => item.modifierGroupIds.includes(g.id) && g.min > 0 && g.options.length > 0
  );
  if (required.length === 0) return null;
  // Cheapest legal selection = cheapest option of each required group.
  return required.reduce(
    (sum, g) => sum + toCents(Math.min(...g.options.map((o) => o.priceDelta))),
    0
  );
}

/**
 * Card/list display price. `{ from: true }` means the shown amount is a
 * floor — a required choice (size, lunch/dinner portion) can raise it.
 */
export function displayPrice(
  item: MenuItem,
  groups: ModifierGroup[]
): { cents: number; from: boolean } | null {
  const cents = startingPriceCents(item, groups);
  if (cents == null) return null;
  const from = groups.some(
    (g) =>
      item.modifierGroupIds.includes(g.id) &&
      g.min > 0 &&
      g.options.some((o) => o.priceDelta > 0)
  );
  return { cents, from };
}

// ---------------------------------------------------------------------------
// Order proposal → priced snapshot (server contract)
// ---------------------------------------------------------------------------

export interface ProposalModifier {
  groupId: string;
  optionId: string;
}

export interface ProposalItem {
  menuItemId: string;
  quantity: number;
  modifiers?: ProposalModifier[];
  specialInstructions?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  zip: string;
}

export interface OrderProposal {
  items: ProposalItem[];
  orderType: "pickup" | "delivery";
  tipCents?: number;
  deliveryAddress?: DeliveryAddress;
}

export interface PricedLineModifier {
  groupId: string;
  groupTitle: string;
  optionId: string;
  label: string;
  cents: number;
}

export interface PricedLine {
  menuItemId: string;
  name: string;
  quantity: number;
  unitCents: number;
  lineCents: number;
  modifiers: PricedLineModifier[];
  specialInstructions?: string;
}

export interface PriceOk {
  ok: true;
  lines: PricedLine[];
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
  orderType: "pickup" | "delivery";
  itemCount: number;
}

export interface PriceErr {
  ok: false;
  errors: string[];
}

export interface MenuSource {
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
}

export function priceProposal(proposal: OrderProposal, menu: MenuSource): PriceOk | PriceErr {
  const errors: string[] = [];

  if (!proposal || !Array.isArray(proposal.items) || proposal.items.length === 0) {
    return { ok: false, errors: ["Cart is empty"] };
  }
  if (proposal.items.length > MAX_ITEMS_PER_ORDER) {
    return { ok: false, errors: [`Too many line items (max ${MAX_ITEMS_PER_ORDER})`] };
  }
  if (proposal.orderType !== "pickup" && proposal.orderType !== "delivery") {
    return { ok: false, errors: ["Invalid order type"] };
  }
  if (proposal.orderType === "delivery") {
    const a = proposal.deliveryAddress;
    if (!a || !a.street?.trim() || !a.city?.trim() || !/^\d{5}(-\d{4})?$/.test(a.zip?.trim() ?? "")) {
      errors.push("Delivery orders need a street, city, and ZIP");
    }
  }

  const tipCents = proposal.tipCents ?? 0;
  if (!Number.isInteger(tipCents) || tipCents < 0 || tipCents > MAX_TIP_CENTS) {
    errors.push("Invalid tip amount");
  }

  const itemById = new Map(menu.items.map((i) => [i.id, i]));
  const groupById = new Map(menu.modifierGroups.map((g) => [g.id, g]));
  const lines: PricedLine[] = [];
  let itemCount = 0;

  proposal.items.forEach((line, idx) => {
    const where = `item ${idx + 1}`;
    const menuItem = line && itemById.get(line.menuItemId);
    if (!menuItem) {
      errors.push(`${where}: unknown menu item`);
      return;
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QTY_PER_LINE) {
      errors.push(`${where} (${menuItem.name}): quantity must be 1–${MAX_QTY_PER_LINE}`);
      return;
    }
    itemCount += line.quantity;

    // Group the proposal's modifiers by group, then validate each group.
    const byGroup = new Map<string, string[]>();
    for (const m of line.modifiers ?? []) {
      if (!m?.groupId || !m?.optionId) {
        errors.push(`${where} (${menuItem.name}): malformed modifier`);
        return;
      }
      byGroup.set(m.groupId, [...(byGroup.get(m.groupId) ?? []), m.optionId]);
    }

    const pricedMods: PricedLineModifier[] = [];
    let unitCents = toCents(menuItem.basePrice ?? 0);
    let failed = false;

    for (const gid of menuItem.modifierGroupIds) {
      const group = groupById.get(gid);
      const chosen = byGroup.get(gid) ?? [];
      if (!group) continue; // dangling ref — menu-sanity validation normally prevents this

      if (chosen.length < group.min) {
        errors.push(`${where} (${menuItem.name}): "${group.title}" requires a selection`);
        failed = true;
      }
      if (chosen.length > group.max || (group.selectionType === "single" && chosen.length > 1)) {
        errors.push(`${where} (${menuItem.name}): "${group.title}" allows at most ${group.selectionType === "single" ? 1 : group.max}`);
        failed = true;
      }
      if (new Set(chosen).size !== chosen.length) {
        errors.push(`${where} (${menuItem.name}): duplicate selection in "${group.title}"`);
        failed = true;
      }
      for (const optId of chosen) {
        const opt = group.options.find((o) => o.id === optId);
        if (!opt) {
          errors.push(`${where} (${menuItem.name}): unknown option in "${group.title}"`);
          failed = true;
          continue;
        }
        const cents = toCents(opt.priceDelta);
        unitCents += cents;
        pricedMods.push({
          groupId: gid,
          groupTitle: group.title,
          optionId: optId,
          label: opt.label,
          cents,
        });
      }
    }

    // Modifiers for groups the item doesn't offer are rejected outright.
    for (const gid of byGroup.keys()) {
      if (!menuItem.modifierGroupIds.includes(gid)) {
        errors.push(`${where} (${menuItem.name}): modifier group "${gid}" not offered`);
        failed = true;
      }
    }

    if (failed) return;
    if (unitCents <= 0) {
      // Structural guard against the "$0 item" class of bug — nothing on
      // this menu is legitimately free.
      errors.push(`${where} (${menuItem.name}): unpriced selection`);
      return;
    }

    const lineCents = unitCents * line.quantity;
    lines.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: line.quantity,
      unitCents,
      lineCents,
      modifiers: pricedMods,
      specialInstructions: line.specialInstructions?.slice(0, MAX_INSTRUCTIONS_LEN).trim() || undefined,
    });
  });

  if (errors.length > 0) return { ok: false, errors };

  const subtotalCents = lines.reduce((s, l) => s + l.lineCents, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents + tipCents;

  return {
    ok: true,
    lines,
    subtotalCents,
    taxCents,
    tipCents,
    totalCents,
    orderType: proposal.orderType,
    itemCount,
  };
}
