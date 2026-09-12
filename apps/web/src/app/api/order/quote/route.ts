import { NextRequest, NextResponse } from 'next/server';
import { getAllMenuData } from '@/lib/menu-sanity';
import { priceProposal, toDollars, type OrderProposal } from '@/lib/pricing';

/**
 * POST /api/order/quote — server-authoritative price check.
 *
 * The client sends a proposal (menu item ids + modifier selections), never
 * prices. We recompute everything from menu data and return the priced
 * snapshot the checkout displays — the same computation /api/payment/intent
 * uses for the charge amount.
 */
export async function POST(request: NextRequest) {
  let proposal: OrderProposal;
  try {
    proposal = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const menu = await getAllMenuData();
  const result = priceProposal(proposal, { items: menu.items, modifierGroups: menu.modifierGroups });

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({
    lines: result.lines.map((l) => ({
      menuItemId: l.menuItemId,
      name: l.name,
      quantity: l.quantity,
      unitPrice: toDollars(l.unitCents),
      lineTotal: toDollars(l.lineCents),
      modifiers: l.modifiers.map((m) => ({
        groupId: m.groupId,
        groupTitle: m.groupTitle,
        optionId: m.optionId,
        label: m.label,
        priceDelta: toDollars(m.cents),
      })),
      specialInstructions: l.specialInstructions,
    })),
    orderType: result.orderType,
    itemCount: result.itemCount,
    subtotal: toDollars(result.subtotalCents),
    tax: toDollars(result.taxCents),
    tip: toDollars(result.tipCents),
    total: toDollars(result.totalCents),
  });
}
