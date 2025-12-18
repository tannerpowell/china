"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import type { MenuItem, Category, ModifierGroup, CartModifier } from "@/lib/types";
import styles from "./page.module.css";

interface MenuClientProps {
  categories: Category[];
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
}

export default function MenuClient({ categories, items, modifierGroups }: MenuClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const itemCount = useCartStore((state) => state.itemCount);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  // Peek modal state
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);
  const [peekPosition, setPeekPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper functions
  const getItemsByCategory = (categoryId: string) => {
    return items
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => b.likes - a.likes);
  };

  const getModifierGroup = (id: string) => {
    return modifierGroups.find(g => g.id === id);
  };

  const getItemImage = (item: MenuItem, size: 'hero' | 'square' = 'square') => {
    // First check Sanity images
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    // Fallback to local gallery
    const categorySlug = item.categoryId.replace('cat_', '');
    const suffix = size === 'hero' ? '__hero_4x3.jpg' : '__square_1x1.jpg';
    return `/gallery/${categorySlug}--${item.slug}${suffix}`;
  };

  const handleItemClick = (item: MenuItem) => {
    setHoveredItem(null);
    setSelectedItem(item);
    setSelectedModifiers({});
    setQuantity(1);
  };

  const handleMouseEnter = (item: MenuItem, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPeekPosition({
      x: rect.right + 16,
      y: Math.min(rect.top, window.innerHeight - 280)
    });

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(item);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredItem(null);
  };

  const handleModifierChange = (groupId: string, optionId: string, isMulti: boolean) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];
      if (isMulti) {
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        }
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  const calculatePrice = () => {
    if (!selectedItem) return 0;
    let price = selectedItem.basePrice ?? 0;

    const groups = selectedItem.modifierGroupIds
      .map((id) => getModifierGroup(id))
      .filter(Boolean);

    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = groups.find((g) => g?.id === groupId);
      if (group) {
        optionIds.forEach((optId) => {
          const option = group.options.find((o) => o.id === optId);
          if (option) price += option.priceDelta;
        });
      }
    });

    return price;
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const groups = selectedItem.modifierGroupIds
      .map((id) => getModifierGroup(id))
      .filter(Boolean);

    const cartModifiers: CartModifier[] = [];
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = groups.find((g) => g?.id === groupId);
      if (group) {
        optionIds.forEach((optId) => {
          const option = group.options.find((o) => o.id === optId);
          if (option) {
            cartModifiers.push({
              groupId,
              groupTitle: group.title.replace(/\n.*/, "").trim(),
              optionId: option.id,
              optionLabel: option.label,
              priceDelta: option.priceDelta,
            });
          }
        });
      }
    });

    addItem(selectedItem, quantity, selectedItem.basePrice ?? 0, cartModifiers);
    setSelectedItem(null);
  };

  return (
    <div className={styles.layout}>
      {/* Fixed Left Panel */}
      <aside className={styles.leftPanel}>
        <div className={styles.intro}>
          <Link href="/" className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="China Island Asian Grill"
              className={styles.logo}
            />
            <h1 className={styles.title}>China Island</h1>
            <p className={styles.subtitle}>Asian Grill</p>
          </Link>

          <nav className={styles.categoryNav}>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.slug}`}
                className={styles.categoryLink}
              >
                {cat.title}
              </a>
            ))}
          </nav>

          {itemCount > 0 && (
            <Link href="/checkout" className={styles.cartButton}>
              View Cart ({itemCount})
            </Link>
          )}
        </div>
      </aside>

      {/* Scrolling Right Panel */}
      <main className={styles.rightPanel}>
        {categories.map((category) => {
          const categoryItems = getItemsByCategory(category.id);
          if (categoryItems.length === 0) return null;

          return (
            <section key={category.id} id={category.slug} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryLabel}>{category.title}</span>
                <h2 className={styles.categoryTitle}>{category.title}</h2>
              </div>

              <div className={styles.menuItems}>
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    className={styles.menuItem}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className={styles.itemName}>
                      {item.name}
                      {item.tags.spicy && " 🌶"}
                      {item.tags.vegetarian && " 🌱"}
                    </span>
                    {item.basePrice && (
                      <span className={styles.itemPrice}>${item.basePrice.toFixed(2)}</span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Peek Modal (on hover) */}
      {hoveredItem && !selectedItem && (
        <div
          className={styles.peekModal}
          style={{
            left: Math.min(peekPosition.x, typeof window !== 'undefined' ? window.innerWidth - 280 : 1000),
            top: peekPosition.y
          }}
        >
          <div className={styles.peekImageWrapper}>
            <Image
              src={getItemImage(hoveredItem, 'square')}
              alt={hoveredItem.name}
              width={240}
              height={240}
              className={styles.peekImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-food.svg';
              }}
            />
          </div>
          <div className={styles.peekContent}>
            <h4 className={styles.peekTitle}>{hoveredItem.name}</h4>
            {hoveredItem.basePrice && (
              <span className={styles.peekPrice}>${hoveredItem.basePrice.toFixed(2)}</span>
            )}
            {hoveredItem.description && (
              <p className={styles.peekDescription}>{hoveredItem.description}</p>
            )}
            <span className={styles.peekHint}>Click to customize & add</span>
          </div>
        </div>
      )}

      {/* Full Order Modal (on click) */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedItem(null)}>
              ✕
            </button>

            {/* Modal Image */}
            <div className={styles.modalImageWrapper}>
              <Image
                src={getItemImage(selectedItem, 'hero')}
                alt={selectedItem.name}
                width={400}
                height={300}
                className={styles.modalImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-food.svg';
                }}
              />
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalHeader}>
                <span className={styles.modalLabel}>Order</span>
                <h3 className={styles.modalTitle}>{selectedItem.name}</h3>
                {selectedItem.basePrice && (
                  <span className={styles.modalPrice}>${selectedItem.basePrice.toFixed(2)}</span>
                )}
              </div>

              {/* Tags */}
              <div className={styles.modalTags}>
                {selectedItem.tags.spicy && <span className={styles.modalTag}>🌶 Spicy</span>}
                {selectedItem.tags.vegetarian && <span className={styles.modalTag}>🌱 Vegetarian</span>}
                {selectedItem.tags.popular && <span className={styles.modalTag}>⭐ Popular</span>}
              </div>

              {/* Description */}
              {selectedItem.description && (
                <p className={styles.modalDescription}>{selectedItem.description}</p>
              )}

              {/* Modifiers */}
              {selectedItem.modifierGroupIds.length > 0 && (
                <div className={styles.modifiers}>
                  {selectedItem.modifierGroupIds.map((groupId) => {
                    const group = getModifierGroup(groupId);
                    if (!group) return null;

                    return (
                      <div key={group.id} className={styles.modifierGroup}>
                        <span className={styles.modifierLabel}>
                          {group.title.replace(/\n.*/, "").trim()}
                          {group.min > 0 && <span className={styles.required}> (Required)</span>}
                        </span>
                        <div className={styles.modifierOptions}>
                          {group.options.map((opt) => {
                            const isSelected = (selectedModifiers[group.id] || []).includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                className={`${styles.modifierOption} ${isSelected ? styles.modifierSelected : ""}`}
                                onClick={() => handleModifierChange(group.id, opt.id, group.selectionType === "multi")}
                              >
                                {opt.label}
                                {opt.priceDelta > 0 && ` +$${opt.priceDelta.toFixed(2)}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity */}
              <div className={styles.quantityRow}>
                <span>Quantity</span>
                <div className={styles.quantityControls}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              {/* Add to Cart */}
              <button className={styles.addButton} onClick={handleAddToCart}>
                Add to Cart — ${(calculatePrice() * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
