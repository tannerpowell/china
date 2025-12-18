"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, CreditCard, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax, total, clearCart, itemCount } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = (): boolean => {
    setError(null);

    if (!customerInfo.name.trim()) {
      setError("Please enter your name");
      return false;
    }

    if (!customerInfo.email.trim()) {
      setError("Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!customerInfo.phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    const digitsOnly = customerInfo.phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate payment processing (replace with actual Stripe integration)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate order number
      const orderNumber = `CI-${Date.now().toString(36).toUpperCase()}`;

      // Success!
      setOrderComplete(true);
      clearCart();

      // Store order number for confirmation display
      sessionStorage.setItem("lastOrderNumber", orderNumber);
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check size={48} />
          </div>
          <h1 className={styles.successTitle}>Order Confirmed!</h1>
          <p className={styles.successText}>
            Thank you for your order. You'll receive a confirmation email shortly.
          </p>
          <p className={styles.successOrder}>
            Order #{sessionStorage.getItem("lastOrderNumber")}
          </p>
          <Link href="/menu" className={styles.successButton}>
            Order Again
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <ShoppingBag size={64} className={styles.emptyIcon} />
          <h1 className={styles.emptyTitle}>Your cart is empty</h1>
          <p className={styles.emptyText}>Add some items from the menu to checkout.</p>
          <Link href="/menu" className={styles.emptyButton}>
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back Link */}
        <Link href="/menu" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Menu
        </Link>

        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.grid}>
          {/* Form Section */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit}>
              {/* Error Banner */}
              {error && <div className={styles.error}>{error}</div>}

              {/* Contact Info */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Contact Information</h2>
                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className={styles.input}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className={styles.input}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className={styles.input}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Order Type */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Order Type</h2>
                <div className={styles.orderTypeToggle}>
                  <button
                    type="button"
                    className={`${styles.orderTypeButton} ${orderType === "pickup" ? styles.orderTypeActive : ""}`}
                    onClick={() => setOrderType("pickup")}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    className={`${styles.orderTypeButton} ${orderType === "delivery" ? styles.orderTypeActive : ""}`}
                    onClick={() => setOrderType("delivery")}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Special Instructions</h2>
                <textarea
                  className={styles.textarea}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests for your order?"
                  rows={3}
                />
              </div>

              {/* Payment Info - Placeholder for Stripe */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <CreditCard size={20} />
                  Payment
                </h2>
                <div className={styles.paymentPlaceholder}>
                  <p>Stripe payment integration coming soon.</p>
                  <p className={styles.paymentNote}>For now, click "Place Order" to simulate checkout.</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    Processing...
                  </>
                ) : (
                  <>Place Order &middot; ${total.toFixed(2)}</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className={styles.summarySection}>
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>
                Order Summary
                <span className={styles.summaryCount}>({itemCount} items)</span>
              </h2>

              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.summaryItemHeader}>
                      <span className={styles.summaryItemQty}>{item.quantity}x</span>
                      <span className={styles.summaryItemName}>{item.menuItem.name}</span>
                      <span className={styles.summaryItemPrice}>
                        ${((item.basePrice + item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className={styles.summaryItemMods}>
                        {item.modifiers.map((mod, i) => (
                          <span key={i}>
                            {mod.optionLabel}
                            {mod.priceDelta > 0 && ` (+$${mod.priceDelta.toFixed(2)})`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
