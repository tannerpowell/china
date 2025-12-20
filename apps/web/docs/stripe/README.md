# Stripe Integration

## Overview

This project uses Stripe for payment processing. The integration uses Stripe's Payment Element for a unified checkout experience supporting cards, Apple Pay, Google Pay, and other payment methods.

## File Structure

```
apps/web/src/
├── lib/
│   └── stripe.ts                    # Server-side Stripe client + utilities
├── app/api/
│   ├── payment/
│   │   └── intent/route.ts          # POST - Creates PaymentIntent
│   └── webhooks/
│       └── stripe/route.ts          # POST - Handles Stripe webhooks
└── components/
    ├── StripeProvider.tsx           # Elements wrapper with theme config
    └── PaymentForm.tsx              # Payment Element form component
```

## Environment Variables

Required in `.env.local`:

```env
# Client-side (exposed to browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side only (never exposed)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## API Routes

### POST /api/payment/intent

Creates a Stripe PaymentIntent for checkout.

**Request Body:**
```typescript
{
  items: CartItem[];           // Cart items from cart-store
  subtotal: number;            // Pre-tax amount
  tax: number;                 // Tax amount
  total: number;               // Final amount (dollars, not cents)
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  orderType: 'pickup' | 'delivery';
  specialInstructions?: string;
}
```

**Response:**
```typescript
{
  clientSecret: string;        // Pass to StripeProvider
  paymentIntentId: string;     // For tracking
}
```

### POST /api/webhooks/stripe

Receives Stripe webhook events. Handles:
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `charge.dispute.created` - Dispute opened

## Components

### StripeProvider

Wraps checkout content with Stripe Elements context.

```tsx
import { StripeProvider } from '@/components/StripeProvider';

// clientSecret comes from /api/payment/intent response
<StripeProvider clientSecret={clientSecret}>
  <PaymentForm ... />
</StripeProvider>
```

### PaymentForm

Renders the Stripe Payment Element and handles submission.

```tsx
import { PaymentForm } from '@/components/PaymentForm';

<PaymentForm
  onSuccess={(paymentIntentId) => {
    // Redirect to confirmation page
  }}
  onError={(message) => {
    // Show error to user
  }}
  returnUrl={`${window.location.origin}/checkout/confirmation`}
/>
```

## Checkout Integration Example

```tsx
'use client';

import { useState } from 'react';
import { StripeProvider } from '@/components/StripeProvider';
import { PaymentForm } from '@/components/PaymentForm';
import { useCartStore } from '@/lib/cart-store';

export function CheckoutPayment({ customer, orderType }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { items, subtotal, tax, total } = useCartStore();

  // Create PaymentIntent when ready to pay
  const initializePayment = async () => {
    const response = await fetch('/api/payment/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        subtotal,
        tax,
        total,
        customer,
        orderType,
      }),
    });
    const { clientSecret } = await response.json();
    setClientSecret(clientSecret);
  };

  if (!clientSecret) {
    return <button onClick={initializePayment}>Proceed to Payment</button>;
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm
        onSuccess={(id) => router.push(`/checkout/confirmation?pi=${id}`)}
        onError={(msg) => setError(msg)}
        returnUrl={`${window.location.origin}/checkout/confirmation`}
      />
    </StripeProvider>
  );
}
```

## Local Development

### Testing with Stripe CLI

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Test Card Numbers

| Card | Number | Use Case |
|------|--------|----------|
| Visa | 4242 4242 4242 4242 | Successful payment |
| Visa (decline) | 4000 0000 0000 0002 | Generic decline |
| Visa (3DS) | 4000 0027 6000 3184 | Requires authentication |

Use any future expiry date, any 3-digit CVC, any postal code.

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Configure webhook to receive: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`
- [ ] Implement order persistence in webhook handler
- [ ] Add email notifications on successful payment
- [ ] Test end-to-end with real card

## Dependencies

```json
{
  "@stripe/react-stripe-js": "^5.4.1",
  "@stripe/stripe-js": "^8.6.0",
  "stripe": "^20.1.0"
}
```

## Theming

The `StripeProvider` configures Payment Element appearance:

```typescript
appearance: {
  theme: 'stripe',
  variables: {
    colorPrimary: '#c41e3a',      // China Island red
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',
    colorDanger: '#df1b41',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
  },
}
```

Modify in `src/components/StripeProvider.tsx`.
