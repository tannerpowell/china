"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { DemoPaymentForm } from "./DemoPaymentForm";
import styles from "./page.module.css";

// Note: metadata export not supported in client components.
// Checkout is noindex via robots.ts rules.
//
// STRIPE_TRANSITION: payment is DEMO MODE (see DemoPaymentForm.tsx for the
// 3-step swap). The page below only depends on the
// onSuccess(paymentIntentId) / onError(message) contract, which the real
// PaymentForm already honors — so this page does not change when Stripe
// goes live, except swapping the component + wrapping in StripeProvider.

export default function CheckoutPage() {
  const { items, subtotal, tax, total, clearCart, itemCount, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  // STRIPE_TRANSITION: last4 + demo badge are demo-only display. A real
  // PaymentIntent id arrives the same way via onSuccess — keep storing it.
  const [paymentId, setPaymentId] = useState("");
  const [last4, setLast4] = useState("");
  // Captured before clearCart() wipes the store — the success screen
  // renders after, when total is already 0.
  const [paidTotal, setPaidTotal] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderType: "pickup" as "pickup" | "delivery",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Runs after payment succeeds (demo today, Stripe confirmPayment later).
  // Order record creation / email belongs here — it stays put in both modes.
  const handlePaymentSuccess = (intentId: string, cardLast4: string) => {
    const num = `CI-${Date.now().toString(36).toUpperCase()}`;
    setPaymentId(intentId);
    setLast4(cardLast4);
    setPaidTotal(total);
    setOrderNumber(num);
    setOrderComplete(true);
    clearCart();
  };

  const handlePaymentError = (_message: string) => {
    // DemoPaymentForm already surfaces the message inline; the page just
    // needs the hook so the contract matches PaymentForm. Wire error
    // reporting here when Stripe goes live.
  };

  const contactValid =
    form.name.trim().length > 0 &&
    /.+@.+\..+/.test(form.email.trim()) &&
    form.phone.trim().length > 0;

  if (!mounted) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (orderComplete) {
    return (
      <main className={styles.main}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h1>Order Confirmed!</h1>
          <p>Order #{orderNumber}</p>
          {/* STRIPE_TRANSITION: keep paymentId/last4 lines for real Stripe —
              only the "demo" badge goes away. */}
          <p className={styles.successNote}>
            Paid ${paidTotal.toFixed(2)} with card ending in {last4} (demo — no charge).
          </p>
          <p className={styles.successNote}>Payment {paymentId}</p>
          <p className={styles.successNote}>You'll receive a confirmation email shortly.</p>
          <Link href="/menu" className={styles.backLink}>← Order Again</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className={styles.main}>
        <div className={styles.empty}>
          <h1>Your cart is empty</h1>
          <Link href="/menu" className={styles.backLink}>← Browse Menu</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Link href="/menu" className={styles.back}>← Back to Menu</Link>

      <div className={styles.grid}>
        {/* Order Summary */}
        <section className={styles.summary}>
          <h2 className={styles.sectionTitle}>Your Order</h2>
          <div className={styles.dottedRule} />

          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemName}>{item.menuItem.name}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </button>
                </div>

                {item.modifiers.length > 0 && (
                  <div className={styles.itemMods}>
                    {item.modifiers.map((m, i) => (
                      <span key={i}>{m.optionLabel}</span>
                    ))}
                  </div>
                )}

                <div className={styles.itemFooter}>
                  <div className={styles.qtyControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <span className={styles.itemPrice}>
                    ${((item.basePrice + item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Checkout Form */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Checkout</h2>
          <div className={styles.dottedRule} />

          {/* Contact block is a plain div, not a <form>: the payment
              component below owns the only submit (same split as Stripe's
              PaymentElement + confirmPayment). */}
          <div className={styles.form}>
            {/* DEMO ONLY — one-click sample contact info. Delete with demo mode. */}
            <button
              type="button"
              className={styles.testCardBtn}
              onClick={() =>
                setForm({
                  ...form,
                  name: "Demo Diner",
                  email: "demo@example.com",
                  phone: "(972) 555-0134",
                })
              }
            >
              Demo only — fill sample info
            </button>
            <div className={styles.field}>
              <label>Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className={styles.field}>
              <label>Order Type</label>
              <div className={styles.orderType}>
                <button
                  type="button"
                  className={form.orderType === "pickup" ? styles.active : ""}
                  onClick={() => setForm({ ...form, orderType: "pickup" })}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  className={form.orderType === "delivery" ? styles.active : ""}
                  onClick={() => setForm({ ...form, orderType: "delivery" })}
                >
                  Delivery
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label>Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>

            {/* STRIPE_TRANSITION: swap this one component for
                <StripeProvider clientSecret={...}><PaymentForm …/></StripeProvider>.
                Props stay the same. */}
            <DemoPaymentForm
              amount={total}
              contactValid={contactValid}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
