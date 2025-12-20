"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, Flame, Leaf, Check, ShoppingBag } from "lucide-react";
import type { MenuItem, CartModifier, ModifierGroup } from "@/lib/types";
import { getModifierGroup } from "@/lib/menu";
import { useCartStore } from "@/lib/cart-store";
import styles from "./ItemModal.module.css";

interface ItemModalProps {
  item: MenuItem;
  imagePath: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemModal({ item, imagePath, isOpen, onClose }: ItemModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Load modifier groups for this item
  const modifierGroups: ModifierGroup[] = item.modifierGroupIds
    .map((id) => getModifierGroup(id))
    .filter((g): g is ModifierGroup => g !== undefined);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedModifiers({});
      setSpecialInstructions("");
      setAddedToCart(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Calculate price
  const calculatePrice = () => {
    let price = item.basePrice ?? 0;

    // Add modifier prices
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = modifierGroups.find((g) => g.id === groupId);
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

  const handleModifierSelect = (groupId: string, optionId: string, isMulti: boolean) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];

      if (isMulti) {
        // Toggle selection for multi-select
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...current, optionId] };
        }
      } else {
        // Single select - replace
        return { ...prev, [groupId]: [optionId] };
      }
    });
  };

  const handleAddToCart = () => {
    // Build cart modifiers
    const cartModifiers: CartModifier[] = [];
    Object.entries(selectedModifiers).forEach(([groupId, optionIds]) => {
      const group = modifierGroups.find((g) => g.id === groupId);
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        {/* Content */}
        <div className={styles.content}>
          {/* Image */}
          {imagePath && !imageError && (
            <div className={styles.imageWrapper}>
              <img
                src={imagePath}
                alt={item.name}
                className={styles.image}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Details */}
          <div className={styles.details}>
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>{item.name}</h2>
              <div className={styles.tags}>
                {item.tags.spicy && (
                  <span className={`${styles.tag} ${styles.tagSpicy}`}>
                    <Flame size={14} />
                    Spicy
                  </span>
                )}
                {item.tags.vegetarian && (
                  <span className={`${styles.tag} ${styles.tagVeg}`}>
                    <Leaf size={14} />
                    Vegetarian
                  </span>
                )}
              </div>
              {item.description && <p className={styles.description}>{item.description}</p>}
              <p className={styles.basePrice}>
                {item.basePrice !== null ? `$${item.basePrice.toFixed(2)}` : "Price varies"}
              </p>
            </div>

            {/* Modifier Groups */}
            {modifierGroups.length > 0 && (
              <div className={styles.modifiers}>
                {modifierGroups.map((group) => (
                  <div key={group.id} className={styles.modifierGroup}>
                    <h3 className={styles.modifierTitle}>
                      {group.title.replace(/\n.*/, "").trim()}
                      <span className={styles.modifierType}>
                        {group.selectionType === "single" ? "Choose one" : `Choose up to ${group.max}`}
                      </span>
                    </h3>
                    <div className={styles.options}>
                      {group.options.map((option) => {
                        const isSelected = (selectedModifiers[group.id] || []).includes(option.id);
                        return (
                          <button
                            key={option.id}
                            className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                            onClick={() =>
                              handleModifierSelect(group.id, option.id, group.selectionType === "multi")
                            }
                          >
                            <span className={styles.optionCheck}>
                              {isSelected && <Check size={14} />}
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

            {/* Special Instructions */}
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
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {/* Quantity */}
          <div className={styles.quantityWrapper}>
            <button
              className={styles.quantityButton}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={18} />
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              className={styles.quantityButton}
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`${styles.addButton} ${addedToCart ? styles.addButtonSuccess : ""}`}
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
  );
}
