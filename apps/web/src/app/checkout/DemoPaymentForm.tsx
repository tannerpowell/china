"use client";

import { useState } from "react";
import styles from "./page.module.css";

// ============================================================================
// DEMO MODE — DELETE THIS FILE when Stripe is wired up.
// ----------------------------------------------------------------------------
// STRIPE_TRANSITION (the full swap, in 3 steps):
//   1. Delete this file.
//   2. In `page.tsx`: replace `<DemoPaymentForm …/>` with
//        <StripeProvider clientSecret={clientSecret}>
//          <PaymentForm onSuccess={…} onError={…} returnUrl={…} />
//        </StripeProvider>
//      (`StripeProvider` + `PaymentForm` already exist in
//      src/components/ — they take the SAME onSuccess/onError contract
//      as this component, so the page logic below does not change.)
//   3. Add an API route that creates a PaymentIntent server-side and
//      returns its clientSecret (needs STRIPE_SECRET_KEY). Until then,
//      `clientSecret` doesn't exist, which is why this demo stands in.
//
// This component intentionally mirrors PaymentForm's public interface:
//   onSuccess(paymentIntentId: string) / onError(message: string)
// so the checkout page can't tell demo apart from real Stripe.
// ============================================================================

interface DemoPaymentFormProps {
  /** Order total in dollars, shown on the pay button. */
  amount: number;
  /** Same contract as PaymentForm: receives a (fake) payment-intent id. */
  onSuccess: (paymentIntentId: string, last4: string) => void;
  /** Same contract as PaymentForm. */
  onError: (error: string) => void;
  /** Page passes false until name/email/phone are valid; demo refuses to
      "charge" until contact info is complete — just like a real flow. */
  contactValid: boolean;
}

const TEST_CARD = "4242 4242 4242 4242";

function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function formatCard(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function DemoPaymentForm({ amount, onSuccess, onError, contactValid }: DemoPaymentFormProps) {
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!contactValid) {
      const msg = "Please complete name, email, and phone above first.";
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    const digits = card.replace(/\D/g, "");
    if (!luhnValid(digits)) {
      const msg = "Card number looks invalid — try the 4242 test card.";
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    const m = expiry.match(/^(\d{2})\/(\d{2})$/);
    const now = new Date();
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) {
      const msg = "Expiry must be MM/YY.";
      setErrorMessage(msg);
      onError(msg);
      return;
    }
    const expEnd = new Date(2000 + Number(m[2]), Number(m[1]));
    if (expEnd <= now) {
      const msg = "Card is expired — use a future date for the demo.";
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      const msg = "CVC must be 3–4 digits.";
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    setIsProcessing(true);
    // STRIPE_TRANSITION: this timeout stands in for
    // stripe.confirmPayment(). The delay is deliberate — it exercises the
    // same processing/disabled/success states the real flow will use.
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    // Fake intent id in Stripe's format so logs/order records look familiar.
    onSuccess(`pi_demo_${Date.now().toString(36).toUpperCase()}`, digits.slice(-4));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.demoBadge}>
        Demo mode — no real charge. Use card 4242&nbsp;4242&nbsp;4242&nbsp;4242.
      </div>

      <div className={styles.field}>
        <label>Card number</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={card}
          onChange={(e) => setCard(formatCard(e.target.value))}
        />
      </div>

      <div className={styles.cardRow}>
        <div className={styles.field}>
          <label>Expiry</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <label>CVC</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.testCardBtn}
        onClick={() => {
          setCard(TEST_CARD);
          setExpiry("12/28");
          setCvc("123");
          setErrorMessage(null);
        }}
      >
        Fill test card
      </button>

      {errorMessage && <div className={styles.payError}>{errorMessage}</div>}

      <button type="submit" className={styles.submitBtn} disabled={isProcessing}>
        {isProcessing ? "Processing…" : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
