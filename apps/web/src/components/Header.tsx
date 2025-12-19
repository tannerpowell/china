"use client";

import { ShoppingBag, MapPin, Phone, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

// Restaurant phone from environment
const PHONE_NUMBER = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || "";
const PHONE_HREF = PHONE_NUMBER ? `tel:${PHONE_NUMBER}` : "/order";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const itemCount = useCartStore((state) => state.itemCount);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo / Brand */}
        <a href="/" className={styles.brand}>
          <span className={styles.brandText}>China Island</span>
          <span className={styles.brandSubtext}>Asian Grill</span>
        </a>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <a href="/menu" className={styles.navLink}>
            Menu
          </a>
          <a href="/location" className={styles.navLink}>
            <MapPin size={16} />
            <span>Location</span>
          </a>
          <a href={PHONE_HREF} className={styles.navLink}>
            <Phone size={16} />
            <span>Order</span>
          </a>
        </nav>

        {/* Right side actions */}
        <div className={styles.actions}>
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

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <nav
        className={`${styles.mobileNav} ${mobileMenuOpen ? styles.mobileNavOpen : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <a
          href="/menu"
          className={styles.mobileNavLink}
          onClick={() => setMobileMenuOpen(false)}
        >
          Menu
        </a>
        <a
          href="/location"
          className={styles.mobileNavLink}
          onClick={() => setMobileMenuOpen(false)}
        >
          <MapPin size={18} />
          <span>Location</span>
        </a>
        <a
          href={PHONE_HREF}
          className={styles.mobileNavLink}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Phone size={18} />
          <span>Order by Phone</span>
        </a>
      </nav>
    </header>
  );
}
