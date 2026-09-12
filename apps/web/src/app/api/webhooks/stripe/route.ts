import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }
  return secret;
}

// Test-mode events must never reach a live integration (and vice versa).
// Derived from the configured secret key — never logged.
function expectLivemode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_live_');
}

// Returns an error string if the intent fails sanity checks, else null.
function verifyIntentIntegrity(intent: Stripe.PaymentIntent): string | null {
  if (intent.currency !== 'usd') {
    return `unexpected currency ${intent.currency}`;
  }
  const expected = Number(intent.metadata?.totalCents ?? NaN);
  if (!Number.isInteger(expected) || expected <= 0) {
    return 'missing/invalid totalCents metadata';
  }
  if (intent.amount !== expected) {
    return `amount ${intent.amount} != quoted ${expected}`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.livemode !== expectLivemode()) {
    console.error(`Webhook livemode mismatch: event.livemode=${event.livemode}`);
    return NextResponse.json({ error: 'Livemode mismatch' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const problem = verifyIntentIntegrity(paymentIntent);
        if (problem) {
          // Don't ack — Stripe will retry; a mismatch means the charged
          // amount doesn't match what we quoted and needs reconciliation.
          console.error(`payment_intent.succeeded integrity check failed for ${paymentIntent.id}: ${problem}`);
          return NextResponse.json({ error: 'Integrity check failed' }, { status: 400 });
        }
        console.log(`Payment succeeded: ${paymentIntent.id} (${paymentIntent.amount}¢, ${paymentIntent.metadata.itemCount} items)`);

        // TODO: durable order record — transition pending → paid using
        // metadata.orderHash to match the quoted snapshot. Idempotency:
        // key on event.id (Stripe may redeliver).
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        // TODO: mark the pending order failed; the cart stays client-side
        // so the customer can retry.
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.currency !== 'usd') {
          console.error(`charge.refunded unexpected currency ${charge.currency} for ${charge.id}`);
          return NextResponse.json({ error: 'Integrity check failed' }, { status: 400 });
        }
        console.log(`Charge refunded: ${charge.id} (${charge.amount_refunded}¢)`);

        // TODO: transition order → refunded (partial if amount_refunded < amount)
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log(`Dispute created: ${dispute.id} (${dispute.amount}¢ ${dispute.currency})`);

        // TODO: alert restaurant owner about dispute
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Note: App Router routes automatically handle raw body access via request.text()
// No bodyParser config needed (that was a Pages Router pattern)
