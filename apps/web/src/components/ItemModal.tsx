"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, Flame, Leaf, Check, ShoppingBag } from "lucide-react";
import type { MenuItem, CartModifier, ModifierGroup } from "@/lib/types";
import { getModifierGroup } from "@/lib/menu";
import { useCartStore } from "@/lib/cart-store";
import { validateSelection, displayPrice, toDollars } from "@/lib/pricing";
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
  const [missingRequired, setMissingRequired] = useState<string[]>([]);

  // Load modifier groups for this item
  const modifierGroups: ModifierGroup[] = item.modifierGroupIds
    .map((id) => getModifierGroup(id))
    .filter((g): g is ModifierGroup => g !== undefined);

  // Reset state when modal opens. Required single-choice groups preselect
  // their first option (cheapest variant for size-priced items).
  useEffect(() => {
    if (isOpen) {
      const preselected: Record<string, string[]> = {};
      for (const g of modifierGroups) {
        if (g.min > 0 && g.selectionType === "single" && g.options.length > 0) {
          preselected[g.id] = [g.options[0].id];
        }
      }
      setQuantity(1);
      setSelectedModifiers(preselected);
      setSpecialInstructions("");
      setAddedToCart(false);
      setMissingRequired([]);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Toggle selection for multi-select, capped at the group's max
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        }
        const group = modifierGroups.find((g) => g.id === groupId);
        if (group && current.length >= group.max) return prev;
        return { ...prev, [groupId]: [...current, optionId] };
      } else {
        // Single select - replace
        return { ...prev, [groupId]: [optionId] };
      }
    });
  };

  const handleAddToCart = () => {
    // Required choices gate the add — the server enforces the same rules,
    // this just fails fast and points at what's missing.
    const check = validateSelection(item, modifierGroups, selectedModifiers);
    if (!check.ok) {
      setMissingRequired(
        check.issues.filter((i) => i.kind === "required").map((i) => i.groupTitle)
      );
      return;
    }
    setMissingRequired([]);

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
                {(() => {
                  const dp = displayPrice(item, modifierGroups);
                  if (!dp) return "Price varies";
                  return dp.from ? `From $${toDollars(dp.cents).toFixed(2)}` : `$${toDollars(dp.cents).toFixed(2)}`;
                })()}
              </p>
            </div>

            {/* Modifier Groups */}
            {modifierGroups.length > 0 && (
              <div className={styles.modifiers}>
                {modifierGroups.map((group) => (
                  <div key={group.id} className={styles.modifierGroup}>
                    <h3 className={styles.modifierTitle}>
                      {group.title.replace(/\n.*/, "").trim()}
                      {group.min > 0 && <span className={styles.modifierRequired}>* required</span>}
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
          {missingRequired.length > 0 && (
            <p className={styles.requiredHint}>
              Please choose: {missingRequired.join(", ")}
            </p>
          )}
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
