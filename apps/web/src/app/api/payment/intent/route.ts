import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getStripe } from '@/lib/stripe';
import { getAllMenuData } from '@/lib/menu-sanity';
import {
  priceProposal,
  toDollars,
  type OrderProposal,
  type PriceOk,
} from '@/lib/pricing';
import type { CustomerInfo } from '@/lib/types';

export interface CreatePaymentIntentRequest {
  /** Order in proposal form — ids + selections only, no prices. */
  proposal: OrderProposal;
  customer: CustomerInfo;
  specialInstructions?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  /** Server-priced snapshot — display these totals, not the cart's. */
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
}

const META_LIMIT = 500; // Stripe metadata value cap

function summarizeLines(result: PriceOk): string {
  // Compact receipt-style summary for Stripe's dashboard/metadata.
  const s = result.lines
    .map((l) => {
      const mods = l.modifiers.length ? ` (${l.modifiers.map((m) => m.label).join(', ')})` : '';
      return `${l.quantity}x ${l.name}${mods}`;
    })
    .join('; ');
  return s.slice(0, META_LIMIT);
}

function orderHash(result: PriceOk, customer: CustomerInfo): string {
  // Fingerprint of the priced snapshot + customer. Lets a future durable
  // order record (or support staff) reconcile an intent to exactly what
  // was quoted, without storing the full order in Stripe metadata.
  const canonical = JSON.stringify({
    lines: result.lines.map((l) => ({
      i: l.menuItemId,
      q: l.quantity,
      u: l.unitCents,
      m: l.modifiers.map((m) => m.optionId).sort(),
      s: l.specialInstructions ?? '',
    })),
    st: result.subtotalCents,
    tx: result.taxCents,
    tp: result.tipCents,
    tt: result.totalCents,
    t: result.orderType,
    c: { n: customer.name.trim(), e: customer.email.trim().toLowerCase(), p: customer.phone.trim() },
  });
  return createHash('sha256').update(canonical).digest('hex').slice(0, 32);
}

export async function POST(request: NextRequest) {
  let body: CreatePaymentIntentRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { proposal, customer, specialInstructions } = body ?? {};
  if (!proposal || !customer?.name?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
    return NextResponse.json(
      { error: 'Missing order proposal or customer info (name, email, phone required)' },
      { status: 400 }
    );
  }

  // The server is the pricing authority — client totals are ignored.
  const menu = await getAllMenuData();
  const priced = priceProposal(proposal, {
    items: menu.items,
    modifierGroups: menu.modifierGroups,
  });

  if (!priced.ok) {
    return NextResponse.json({ errors: priced.errors }, { status: 400 });
  }

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: priced.totalCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderType: priced.orderType,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim(),
        customerPhone: customer.phone.trim(),
        itemCount: String(priced.itemCount),
        subtotalCents: String(priced.subtotalCents),
        taxCents: String(priced.taxCents),
        tipCents: String(priced.tipCents),
        totalCents: String(priced.totalCents),
        orderHash: orderHash(priced, customer),
        orderSummary: summarizeLines(priced),
        specialInstructions: specialInstructions?.slice(0, META_LIMIT) || '',
      },
      receipt_email: customer.email.trim(),
      description: `China Island Grill - ${priced.orderType} order`,
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe returned no client_secret');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalCents: priced.totalCents,
      subtotalCents: priced.subtotalCents,
      taxCents: priced.taxCents,
      tipCents: priced.tipCents,
    } satisfies CreatePaymentIntentResponse);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
