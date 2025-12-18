import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import type { CartItem, CustomerInfo, OrderType } from '@/lib/types';

export interface CreatePaymentIntentRequest {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  customer: CustomerInfo;
  orderType: OrderType;
  specialInstructions?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await request.json();
    const { items, total, customer, orderType, specialInstructions } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (total <= 0) {
      return NextResponse.json(
        { error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // Build line items description for Stripe metadata
    const itemsDescription = items
      .map((item) => `${item.quantity}x ${item.menuItem.name}`)
      .join(', ');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(total),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderType,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        itemsDescription: itemsDescription.substring(0, 500), // Stripe metadata limit
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0).toString(),
        specialInstructions: specialInstructions?.substring(0, 500) || '',
      },
      receipt_email: customer.email,
      description: `China Island Grill - ${orderType} order`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    } as CreatePaymentIntentResponse);
  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
