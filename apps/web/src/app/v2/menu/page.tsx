"use client";

import { useState, useEffect } from "react";
import { getCategories, getItemsByCategory } from "@/lib/menu";
import { CategorySection } from "@/components/CategorySection";
import styles from "./page.module.css";

export default function MenuPage() {
  const categories = getCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Track active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map((cat) => ({
        slug: cat.slug,
        el: document.getElementById(cat.slug),
      }));

      for (const section of sections) {
        if (section.el) {
          const rect = section.el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveCategory(section.slug);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Our Menu</h1>
          <p className={styles.heroSubtitle}>
            Fresh ingredients, authentic flavors, crafted with care
          </p>
        </div>
        <div className={styles.heroDecor}>
          <span className={styles.heroLine} />
          <span className={styles.heroDot} />
          <span className={styles.heroLine} />
        </div>
      </header>

      {/* Category Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.navItem} ${activeCategory === cat.slug ? styles.navItemActive : ""}`}
              onClick={() => scrollToCategory(cat.slug)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Content */}
      <div className={styles.content}>
        {categories.map((category, index) => {
          const items = getItemsByCategory(category.id);
          if (items.length === 0) return null;
          return (
            <CategorySection
              key={category.id}
              category={category}
              items={items}
              index={index}
            />
          );
        })}
      </div>

      {/* Footer Note */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Consuming raw or undercooked meats, poultry, seafood, shellfish, or eggs may increase your risk of foodborne illness.
        </p>
      </footer>
    </div>
  );
}
