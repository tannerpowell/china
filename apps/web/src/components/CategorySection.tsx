"use client";

import { useState } from "react";
import type { Category, MenuItem as MenuItemType } from "@/lib/types";
import { getItemImagePath, hasCategoryHeroImage, getCategoryHeroImage } from "@/lib/menu";
import { MenuItem } from "./MenuItem";
import styles from "./CategorySection.module.css";

interface CategorySectionProps {
  category: Category;
  items: MenuItemType[];
  index: number;
}

export function CategorySection({ category, items, index }: CategorySectionProps) {
  const [imageError, setImageError] = useState(false);
  const hasHero = hasCategoryHeroImage(category.slug);
  const heroImage = hasHero ? getCategoryHeroImage(category.slug) : null;

  // Split items into columns for larger screens
  const midpoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midpoint);
  const rightItems = items.slice(midpoint);

  return (
    <section
      id={category.slug}
      className={styles.section}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Category Hero */}
      {heroImage && !imageError && (
        <div className={styles.heroWrapper}>
          <img
            src={heroImage}
            alt={category.title}
            className={styles.heroImage}
            onError={() => setImageError(true)}
          />
          <div className={styles.heroOverlay} />
        </div>
      )}

      {/* Category Header */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
          <h2 className={styles.title}>{category.title}</h2>
        </div>
        <span className={styles.itemCount}>{items.length} items</span>
      </div>

      {/* Items Grid */}
      <div className={styles.itemsGrid}>
        <div className={styles.column}>
          {leftItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              imagePath={getItemImagePath(item, "square")}
            />
          ))}
        </div>
        {rightItems.length > 0 && (
          <div className={styles.column}>
            {rightItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                imagePath={getItemImagePath(item, "square")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Decorative Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerDot} />
      </div>
    </section>
  );
}
