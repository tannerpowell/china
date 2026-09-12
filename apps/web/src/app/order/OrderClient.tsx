'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { restaurantPhoneHref, restaurant } from "@/lib/restaurant";
import { T } from "@/components/T";
import styles from "./page.module.css";

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Cart-aware order landing: empty state or summary + checkout. */
export function OrderClient() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const subtotal = useCartStore((s) => s.subtotal);
  const tax = useCartStore((s) => s.tax);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={styles.body} aria-hidden="true" />;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <ShoppingBag size={40} strokeWidth={1.5} />
        </span>
        <h2 className={styles.emptyTitle}>
          <T id="order.empty" />
        </h2>
        <p className={styles.emptyBody}>
          <T id="order.emptyBody" />
        </p>
        <div className={styles.ctaRow}>
          <Link href="/menu" className={styles.ctaPrimary}>
            <T id="order.browse" />
          </Link>
          <a href={restaurantPhoneHref} className={styles.ctaSecondary}>
            <T id="order.call" />{" "}{restaurant.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.summaryHead}>
        <h2 className={styles.summaryTitle}>
          <T id="order.summary" />
        </h2>
        <span className={styles.summaryMeta}>
          <T id="order.count" vars={{ n: itemCount }} />
          {" · "}
          <button
            type="button"
            onClick={clearCart}
            className={styles.clearBtn}
          >
            <T id="order.clear" />
          </button>
        </span>
      </div>
      <ul className={styles.lines}>
        {items.map((item) => {
          const unit =
            item.basePrice +
            item.modifiers.reduce((s, m) => s + m.priceDelta, 0);
          return (
            <li key={item.id} className={styles.line}>
              <div className={styles.lineMain}>
                <p className={styles.lineName}>{item.menuItem.name}</p>
                {item.modifiers.length > 0 && (
                  <p className={styles.lineMods}>
                    {item.modifiers.map((m) => m.optionLabel).join(" · ")}
                  </p>
                )}
                {item.specialInstructions && (
                  <p className={styles.lineNote}>
                    “{item.specialInstructions}”
                  </p>
                )}
                <div className={styles.lineActions}>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className={styles.qtyBtn}
                      aria-label={`-${item.menuItem.name}`}
                    >
                      −
                    </button>
                    <span className={styles.qtyVal}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className={styles.qtyBtn}
                      aria-label={`+${item.menuItem.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className={styles.removeBtn}
                  >
                    <T id="order.remove" />
                  </button>
                </div>
              </div>
              <span className={styles.lineTotal}>
                {money(unit * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>
      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt><T id="order.subtotal" /></dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt><T id="order.tax" /></dt>
          <dd>{money(tax)}</dd>
        </div>
        <div className={`${styles.totalRow} ${styles.grandRow}`}>
          <dt><T id="order.total" /></dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>
      <div className={styles.ctaRow}>
        <Link href="/checkout" className={styles.ctaPrimary}>
          <T id="order.checkout" />
        </Link>
        <Link href="/menu" className={styles.ctaSecondary}>
          <T id="order.browse" />
        </Link>
      </div>
    </div>
  );
}
