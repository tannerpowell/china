'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, Check, ShoppingBag } from 'lucide-react';
import type { MenuItem, ModifierGroup, CartModifier, Category } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import styles from './MenuItemModal.module.css';

interface MenuItemModalProps {
  item: MenuItem;
  categories: Category[];
  modifierGroups: ModifierGroup[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Premium menu item detail modal.
 * Horizontal layout on desktop (image left, content right).
 * Accessible: focus trap, ESC closes, aria labels.
 * Full ordering flow: modifiers, quantity, add to cart.
 */
export function MenuItemModal({
  item,
  categories,
  modifierGroups,
  isOpen,
  onClose,
}: MenuItemModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  // Get modifier groups for this item
  const itemModifierGroups = item.modifierGroupIds
    .map(id => modifierGroups.find(g => g.id === id))
    .filter((g): g is ModifierGroup => g !== undefined);

  // Get category name
  const category = categories.find(c => c.id === item.categoryId);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // Focus trap
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose]);

  // Focus trap and body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      document.addEventListener('keydown', handleKeyDown);

      // Reset state
      setQuantity(1);
      setSelectedModifiers({});
      setSpecialInstructions('');
      setAddedToCart(false);

      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleKeyDown);

        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle modifier selection
  const handleModifierSelect = (groupId: string, optionId: string, isMulti: boolean) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];

      if (isMulti) {
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [groupId]: [optionId] };
      }
    });
  };

  // Calculate price
  const calculatePrice = () => {
    let price = item.basePrice ?? 0;

    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = itemModifierGroups.find((g) => g.id === groupId);
      if (group) {
        optionIds.forEach((optId) => {
          const option = group.options.find((o) => o.id === optId);
          if (option) {
            price += option.priceDelta;
          }
        });
      }
    });

    return price;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const cartModifiers: CartModifier[] = [];
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = itemModifierGroups.find((g) => g.id === groupId);
      if (group) {
        optionIds.forEach((optId) => {
          const option = group.options.find((o) => o.id === optId);
          if (option) {
            cartModifiers.push({
              groupId,
              groupTitle: group.title.replace(/\n.*/, '').trim(),
              optionId: option.id,
              optionLabel: option.label,
              priceDelta: option.priceDelta,
            });
          }
        });
      }
    });

    addItem(
      item,
      quantity,
      item.basePrice ?? 0,
      cartModifiers,
      specialInstructions.trim() || undefined
    );

    setAddedToCart(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const unitPrice = calculatePrice();
  const totalPrice = unitPrice * quantity;

  if (!isOpen) return null;

  const hasImage = item.images && item.images.length > 0;
  const imageSrc = hasImage ? item.images[0] : null;

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`${styles.card} ${!hasImage ? styles.cardCompact : ''}`}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Image section */}
        {imageSrc && (
          <div className={styles.imageWrapper}>
            <div className={styles.imageFrame}>
              <Image
                src={imageSrc}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {/* Eyebrow category */}
          {category && (
            <div className={styles.eyebrow}>
              {category.title}
            </div>
          )}

          {/* Name */}
          <h2 id="modal-title" className={styles.name}>
            {item.name}
          </h2>

          {/* Tags */}
          {(item.tags.spicy || item.tags.vegetarian || item.tags.popular) && (
            <div className={styles.tags}>
              {item.tags.spicy && (
                <span className={`${styles.tag} ${styles.tagSpicy}`}>
                  🌶 Spicy
                </span>
              )}
              {item.tags.vegetarian && (
                <span className={`${styles.tag} ${styles.tagVeg}`}>
                  🌱 Vegetarian
                </span>
              )}
              {item.tags.popular && (
                <span className={`${styles.tag} ${styles.tagPopular}`}>
                  ⭐ Popular
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className={styles.price}>
            {item.basePrice !== null ? (
              <>
                <span className={styles.priceCurrency}>$</span>
                <span className={styles.priceAmount}>{item.basePrice.toFixed(2)}</span>
              </>
            ) : (
              <span className={styles.priceMarket}>Market Price</span>
            )}
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Description */}
          {item.description && (
            <p className={styles.description}>
              {item.description}
            </p>
          )}

          {/* Modifier groups */}
          {itemModifierGroups.length > 0 && (
            <div className={styles.modifiers}>
              {itemModifierGroups.map((group) => (
                <div key={group.id} className={styles.modifierGroup}>
                  <h3 className={styles.modifierTitle}>
                    {group.title.replace(/\n.*/, '').trim()}
                    {group.min > 0 && <span className={styles.required}>(Required)</span>}
                    <span className={styles.modifierType}>
                      {group.selectionType === 'single' ? 'Choose one' : `Choose up to ${group.max}`}
                    </span>
                  </h3>
                  <div className={styles.options}>
                    {group.options.map((option) => {
                      const isSelected = (selectedModifiers[group.id] || []).includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                          onClick={() =>
                            handleModifierSelect(group.id, option.id, group.selectionType === 'multi')
                          }
                        >
                          <span className={styles.optionCheck}>
                            {isSelected && <Check size={12} />}
                          </span>
                          <span className={styles.optionLabel}>{option.label}</span>
                          {option.priceDelta > 0 && (
                            <span className={styles.optionPrice}>+${option.priceDelta.toFixed(2)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special instructions */}
          <div className={styles.instructions}>
            <label className={styles.instructionsLabel}>Special Instructions</label>
            <textarea
              className={styles.instructionsInput}
              placeholder="Any allergies or special requests?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Spacer */}
          <div className={styles.spacer} />

          {/* Footer with quantity and add button */}
          <div className={styles.footer}>
            <div className={styles.quantityWrapper}>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={18} aria-hidden="true" />
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button
                type="button"
                className={styles.quantityButton}
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              className={`${styles.addButton} ${addedToCart ? styles.addButtonSuccess : ''}`}
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check size={20} />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Add to Order
                  <span className={styles.addButtonPrice}>${totalPrice.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
