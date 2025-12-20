"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CartDrawer.module.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal, tax, total, removeItem, updateQuantity, itemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShoppingBag size={22} strokeWidth={1.5} />
            <h2>Your Order</h2>
            {itemCount > 0 && <span className={styles.itemCount}>({itemCount})</span>}
          </div>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={48} strokeWidth={1} />
              </div>
              <p className={styles.emptyText}>Your cart is empty</p>
              <p className={styles.emptySubtext}>Add some delicious dishes to get started</p>
              <button onClick={onClose} className={styles.browseButton}>
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className={styles.items}>
                {items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>{item.menuItem.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={styles.removeButton}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Modifiers */}
                    {item.modifiers.length > 0 && (
                      <ul className={styles.modifiers}>
                        {item.modifiers.map((mod, i) => (
                          <li key={i} className={styles.modifier}>
                            {mod.groupTitle}: {mod.optionLabel}
                            {mod.priceDelta > 0 && (
                              <span className={styles.modifierPrice}>+${mod.priceDelta.toFixed(2)}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <p className={styles.instructions}>Note: {item.specialInstructions}</p>
                    )}

                    {/* Quantity and Price */}
                    <div className={styles.itemFooter}>
                      <div className={styles.quantity}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={styles.quantityButton}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.quantityValue}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={styles.quantityButton}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className={styles.itemPrice}>
                        ${((item.basePrice + item.modifiers.reduce((s, m) => s + m.priceDelta, 0)) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
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

              {/* Footer */}
              <div className={styles.footer}>
                <Link href="/checkout" className={styles.checkoutButton} onClick={onClose}>
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
