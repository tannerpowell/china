import Stripe from 'stripe';

// Lazy-initialized Stripe client to avoid build-time errors
let _stripe: Stripe | null = null;

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return key;
}

function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
  }
  return key;
}

// Server-side Stripe client (lazy initialization)
// Only use in API routes and server components
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeSecretKey(), {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// Stripe configuration for client-side
export const stripeConfig = {
  get publishableKey() {
    return getStripePublishableKey();
  },
};

// Convert cents to dollars for display
export function formatAmountForDisplay(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

// Convert dollars to cents for Stripe
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}
