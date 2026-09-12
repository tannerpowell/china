'use client';

import React, { forwardRef } from 'react';
import type { MenuItem, ModifierGroup } from '@/lib/types';
import { displayPrice, toDollars } from '@/lib/pricing';
import { T } from '@/components/T';

interface MenuItemRowProps {
  item: MenuItem;
  modifierGroups: ModifierGroup[];
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onClick: () => void;
  className?: string;
}

/**
 * Single menu item row with premium typography.
 * Typography-driven: bold name, price alignment, quiet description.
 * Chinese red hover state with smooth transition.
 */
export const MenuItemRow = forwardRef<HTMLButtonElement, MenuItemRowProps>(
  function MenuItemRow(
    { item, modifierGroups, isHovered, onHover, onLeave, onFocus, onBlur, onClick, className = '' },
    ref
  ) {
    const hasImage = item.images && item.images.length > 0;
    const dp = displayPrice(item, modifierGroups);
    const priceText = dp ? `$${toDollars(dp.cents).toFixed(2)}` : null;

    return (
      <button
        ref={ref}
        type="button"
        className={`menu3-item-row ${isHovered ? 'is-hovered' : ''} ${className}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
        aria-label={`${item.name}${priceText ? `, ${dp!.from ? 'from ' : ''}${priceText}` : ''}`}
      >
        {/* Image indicator (subtle dot) */}
        {hasImage && (
          <span className="menu3-item-image-dot" aria-hidden="true" />
        )}

        {/* Name + tags */}
        <span className="menu3-item-name-container">
          <span className="menu3-item-name menu3-type-item-name">
            {item.name}
          </span>
          {(item.tags.spicy || item.tags.vegetarian) && (
            <span className="menu3-item-badges" aria-label="Item badges">
              {item.tags.spicy && (
                <span className="menu3-item-badge" title="Spicy" aria-hidden="true">
                  🌶
                </span>
              )}
              {item.tags.vegetarian && (
                <span className="menu3-item-badge" title="Vegetarian" aria-hidden="true">
                  🌱
                </span>
              )}
            </span>
          )}
        </span>

        {/* Description (truncated) */}
        {item.description && (
          <span className="menu3-item-description menu3-type-description">
            {item.description}
          </span>
        )}

        {/* Spacer line */}
        <span className="menu3-item-spacer" aria-hidden="true" />

        {/* Price */}
        <span className="menu3-item-price menu3-type-price">
          {dp ? (
            <>
              {dp.from && <span className="menu3-price-from"><T id="menu.modalFrom" /> </span>}
              <span className="menu3-price-dollar">$</span>
              {toDollars(dp.cents).toFixed(2)}
            </>
          ) : (
            <span className="menu3-price-mp"><T id="menu.mp" /></span>
          )}
        </span>
      </button>
    );
  }
);
