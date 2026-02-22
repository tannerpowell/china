"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import styles from "./page.module.css";

// Note: metadata export not supported in client components.
// Checkout is noindex via robots.ts rules.

export default function CheckoutPage() {
  const { items, subtotal, tax, total, clearCart, itemCount, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order submission
    await new Promise((r) => setTimeout(r, 1500));

    const num = `CI-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(num);
    setOrderComplete(true);
    clearCart();
    setIsSubmitting(false);
  };

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

          <form onSubmit={handleSubmit} className={styles.form}>
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

            <div className={styles.paymentNote}>
              Stripe payment integration coming soon.
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : `Place Order — $${total.toFixed(2)}`}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
