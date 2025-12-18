"use client";

import { ShoppingBag, MapPin, Phone } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const itemCount = useCartStore((state) => state.itemCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo / Brand */}
        <a href="/" className={styles.brand}>
          <span className={styles.brandText}>China Island</span>
          <span className={styles.brandSubtext}>Asian Grill</span>
        </a>

        {/* Navigation */}
        <nav className={styles.nav}>
          <a href="/menu" className={styles.navLink}>
            Menu
          </a>
          <a href="/location" className={styles.navLink}>
            <MapPin size={16} />
            <span>Location</span>
          </a>
          <a href="tel:+1234567890" className={styles.navLink}>
            <Phone size={16} />
            <span>Order</span>
          </a>
        </nav>

        {/* Cart Button */}
        <button
          className={styles.cartButton}
          onClick={onCartClick}
          aria-label={`Shopping cart${mounted && itemCount > 0 ? `, ${itemCount} items` : ''}`}
        >
          <ShoppingBag size={22} strokeWidth={1.5} />
          {mounted && itemCount > 0 && (
            <span className={styles.cartBadge}>{itemCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
