import Stripe from 'stripe';

// Server-side Stripe client
// Only use in API routes and server components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Stripe configuration for client-side
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
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
