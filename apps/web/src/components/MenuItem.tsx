"use client";

import { useState, useRef } from "react";
import { Flame, Leaf, Heart } from "lucide-react";
import type { MenuItem as MenuItemType } from "@/lib/types";
import { ItemModal } from "./ItemModal";
import styles from "./MenuItem.module.css";

interface MenuItemProps {
  item: MenuItemType;
  imagePath: string | null;
}

export function MenuItem({ item, imagePath }: MenuItemProps) {
  const [showPeek, setShowPeek] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const peekTimeout = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    peekTimeout.current = setTimeout(() => {
      setShowPeek(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (peekTimeout.current) {
      clearTimeout(peekTimeout.current);
    }
    setShowPeek(false);
  };

  const handleClick = () => {
    setShowPeek(false);
    setShowModal(true);
  };

  const displayPrice = item.basePrice !== null ? `$${item.basePrice.toFixed(2)}` : "Select options";

  return (
    <>
      <div
        ref={itemRef}
        className={styles.item}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        {/* Item Content */}
        <div className={styles.content}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{item.name}</h3>
            <span className={styles.dots} />
            <span className={styles.price}>{displayPrice}</span>
          </div>

          {/* Tags */}
          <div className={styles.tags}>
            {item.tags.spicy && (
              <span className={`${styles.tag} ${styles.tagSpicy}`}>
                <Flame size={12} />
                Spicy
              </span>
            )}
            {item.tags.vegetarian && (
              <span className={`${styles.tag} ${styles.tagVeg}`}>
                <Leaf size={12} />
                Vegetarian
              </span>
            )}
            {item.tags.popular && (
              <span className={`${styles.tag} ${styles.tagPopular}`}>
                <Heart size={12} />
                Popular
              </span>
            )}
          </div>

          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
        </div>

        {/* Peek Modal (on hover) */}
        {showPeek && imagePath && !imageError && (
          <div className={styles.peek}>
            <div className={styles.peekImageWrapper}>
              <img
                src={imagePath}
                alt={item.name}
                className={styles.peekImage}
                onError={() => setImageError(true)}
              />
            </div>
            <div className={styles.peekContent}>
              <span className={styles.peekName}>{item.name}</span>
              <span className={styles.peekPrice}>{displayPrice}</span>
            </div>
            <div className={styles.peekHint}>Click to customize</div>
          </div>
        )}
      </div>

      {/* Full Modal */}
      <ItemModal
        item={item}
        imagePath={imagePath}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
