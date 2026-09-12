"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { isRestaurantOpen, restaurantHoursShort } from "@/lib/restaurant";
import { SiteFooter } from "@/components/SiteFooter";
import {
  AnimatedReceipt,
  type ReceiptStage,
} from "@/components/Receipt/AnimatedReceipt";
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

// Live order confirmation: prints the paid snapshot through the shared
// AnimatedReceipt. Stages advance on mount; nothing here is demo-specific
// except the "demo" note rendered by the caller (see STRIPE_TRANSITION).
function ConfirmationReceipt({
  orderNumber,
  orderType,
  items,
  subtotal,
  tax,
  tip,
  total,
  last4,
  paymentId,
}: {
  orderNumber: string;
  orderType: "pickup" | "delivery";
  items: { name: string; qty: number; lineTotal: number; mods: string[] }[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  last4: string;
  paymentId: string;
}) {
  const [stage, setStage] = useState<ReceiptStage>("processing");
  const timers = useRef<number[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Payment happens mid-page; the confirmation is taller than the form,
  // so bring the printer into frame on arrival (instant for reduced motion).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wrapRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("processing");
    timers.current.push(
      window.setTimeout(() => setStage("printing"), 900),
      window.setTimeout(() => setStage("complete"), 3400)
    );
  };
  useEffect(() => {
    play();
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const money = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div ref={wrapRef}>
    <AnimatedReceipt
      stage={stage}
      feedMotion="stepped"
      machineTitle={`Order #${orderNumber}`}
      onReplay={play}
      statusText={{
        processing: "Sending to kitchen…",
        printing: "Printing your receipt…",
        complete: "Order confirmed",
      }}
    >
      <div className={styles.rcpt}>
        <p className={styles.center}>CHINA ISLAND ASIAN GRILL</p>
        <p className={styles.center}>Flower Mound, TX</p>
        <p className={styles.center}>
          Order #{orderNumber} · {orderType === "pickup" ? "Pickup" : "Delivery"}
        </p>
        <hr />
        {items.map((it) => (
          <div key={`${it.name}-${it.mods.join("/")}`}>
            <p className={styles.line}>
              <span>
                {it.qty}x {it.name}
              </span>
              <span>{money(it.lineTotal)}</span>
            </p>
            {it.mods.map((mod) => (
              <p key={mod} className={styles.mod}>
                + {mod}
              </p>
            ))}
          </div>
        ))}
        <hr />
        <p className={styles.line}>
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </p>
        <p className={styles.line}>
          <span>Tax</span>
          <span>{money(tax)}</span>
        </p>
        {tip > 0 && (
          <p className={styles.line}>
            <span>Tip</span>
            <span>{money(tip)}</span>
          </p>
        )}
        <p className={`${styles.line} ${styles.total}`}>
          <span>Total</span>
          <span>{money(total)}</span>
        </p>
        <hr />
        <p className={styles.center}>Paid card ending {last4}</p>
        <p className={styles.center}>Payment {paymentId}</p>
        <p className={styles.center}>Thank you!</p>
      </div>
    </AnimatedReceipt>
    </div>
  );
}

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
  // renders after, when the cart is already empty.
  const [paidTotal, setPaidTotal] = useState(0);
  const [paidSubtotal, setPaidSubtotal] = useState(0);
  const [paidTax, setPaidTax] = useState(0);
  const [paidTip, setPaidTip] = useState(0);
  const [paidOrderType, setPaidOrderType] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [paidItems, setPaidItems] = useState<
    { name: string; qty: number; lineTotal: number; mods: string[] }[]
  >([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderType: "pickup" as "pickup" | "delivery",
    notes: "",
    street: "",
    city: "",
    zip: "",
  });
  const [tipPct, setTipPct] = useState<number | "custom" | null>(null);
  const [tipCustom, setTipCustom] = useState("");
  const [openNow, setOpenNow] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Evaluated client-side so the check uses the visitor's clock against
    // restaurant-local hours (America/Chicago).
    setOpenNow(isRestaurantOpen());
  }, []);

  const tipAmount =
    tipPct === "custom"
      ? Math.max(0, Number(tipCustom) || 0)
      : tipPct
        ? Math.round(subtotal * tipPct) / 100
        : 0;
  const grandTotal = total + tipAmount;

  // Runs after payment succeeds (demo today, Stripe confirmPayment later).
  // Order record creation / email belongs here — it stays put in both modes.
  const handlePaymentSuccess = (intentId: string, cardLast4: string) => {
    const num = `CI-${Date.now().toString(36).toUpperCase()}`;
    setPaymentId(intentId);
    setLast4(cardLast4);
    // Snapshot everything the receipt needs — the store is cleared below.
    setPaidTotal(grandTotal);
    setPaidSubtotal(subtotal);
    setPaidTax(tax);
    setPaidTip(tipAmount);
    setPaidOrderType(form.orderType);
    setPaidItems(
      items.map((item) => ({
        name: item.menuItem.name,
        qty: item.quantity,
        lineTotal:
          (item.basePrice +
            item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) *
          item.quantity,
        mods: item.modifiers.map((m) => m.optionLabel),
      }))
    );
    setOrderNumber(num);
    setOrderComplete(true);
    clearCart();
  };

  const handlePaymentError = (_message: string) => {
    // DemoPaymentForm already surfaces the message inline; the page just
    // needs the hook so the contract matches PaymentForm. Wire error
    // reporting here when Stripe goes live.
  };

  const addressValid =
    form.orderType === "pickup" ||
    (form.street.trim().length > 0 &&
      form.city.trim().length > 0 &&
      /^\d{5}(-\d{4})?$/.test(form.zip.trim()));

  const contactValid =
    form.name.trim().length > 0 &&
    /.+@.+\..+/.test(form.email.trim()) &&
    form.phone.trim().length > 0 &&
    addressValid;

  if (!mounted) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (orderComplete) {
    return (
      <main className={styles.main}>
        <div className={styles.confirmWrap}>
          <ConfirmationReceipt
            orderNumber={orderNumber}
            orderType={paidOrderType}
            items={paidItems}
            subtotal={paidSubtotal}
            tax={paidTax}
            tip={paidTip}
            total={paidTotal}
            last4={last4}
            paymentId={paymentId}
          />
          {/* STRIPE_TRANSITION: the demo note goes away with real Stripe;
              the email note + Order Again stay. */}
          <p className={styles.successNote}>Demo — no charge was made.</p>
          <p className={styles.successNote}>You'll receive a confirmation email shortly.</p>
          <Link href="/menu" className={styles.backLink}>← Order Again</Link>
        </div>
        <SiteFooter />
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
            {tipAmount > 0 && (
              <div className={styles.totalRow}>
                <span>Tip</span>
                <span>${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.totalFinal}`}>
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Checkout Form */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Checkout</h2>
          <div className={styles.dottedRule} />

          {!openNow && (
            <div className={styles.closedNote}>
              We&apos;re closed right now — hours are{" "}
              {restaurantHoursShort.map((h) => `${h.days} ${h.time}`).join(", ")}.
              You can still place your order; we&apos;ll confirm when we open.
            </div>
          )}

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

            {form.orderType === "delivery" && (
              <>
                <div className={styles.field}>
                  <label>Street Address *</label>
                  <input
                    type="text"
                    autoComplete="street-address"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                  />
                </div>
                <div className={styles.cardRow}>
                  <div className={styles.field}>
                    <label>City *</label>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>ZIP *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.field}>
              <label>Tip</label>
              <div className={styles.orderType}>
                {[0.1, 0.15, 0.2].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={tipPct === pct ? styles.active : ""}
                    onClick={() => setTipPct(tipPct === pct ? null : pct)}
                  >
                    {pct * 100}%
                  </button>
                ))}
                <button
                  type="button"
                  className={tipPct === "custom" ? styles.active : ""}
                  onClick={() => setTipPct(tipPct === "custom" ? null : "custom")}
                >
                  Custom
                </button>
              </div>
              {tipPct === "custom" && (
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={tipCustom}
                  onChange={(e) =>
                    setTipCustom(e.target.value.replace(/[^\d.]/g, ""))
                  }
                  style={{ marginTop: 8 }}
                />
              )}
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
              amount={grandTotal}
              contactValid={contactValid}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
