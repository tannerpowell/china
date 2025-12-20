'use client';

import React, { forwardRef } from 'react';
import type { MenuItem } from '@/lib/types';

interface MenuItemRowProps {
  item: MenuItem;
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
    { item, isHovered, onHover, onLeave, onFocus, onBlur, onClick, className = '' },
    ref
  ) {
    const hasImage = item.images && item.images.length > 0;

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
        aria-label={`${item.name}${item.basePrice != null ? `, $${item.basePrice.toFixed(2)}` : ''}`}
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
          {item.basePrice !== null ? (
            <>
              <span className="menu3-price-dollar">$</span>
              {item.basePrice.toFixed(2)}
            </>
          ) : (
            <span className="menu3-price-mp">MP</span>
          )}
        </span>

        <style jsx>{`
          .menu3-item-row {
            display: grid;
            grid-template-columns: auto 1fr auto auto;
            grid-template-rows: auto auto;
            gap: 0 12px;
            align-items: baseline;
            width: calc(100% + 32px);
            margin-left: -16px;
            margin-right: -16px;
            padding: 12px 16px;
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--menu3-border, rgba(0, 0, 0, 0.04));
            border-radius: 6px;
            cursor: pointer;
            text-align: left;
            transition: background 0.5s ease-out, color 0.5s ease-out;
          }

          .menu3-item-row:hover,
          .menu3-item-row.is-hovered {
            background: var(--menu3-hover-bg, rgba(184, 66, 60, 0.85));
            transition: background 0.35s ease-in, color 0.35s ease-in;
          }

          .menu3-item-row:hover .menu3-item-name,
          .menu3-item-row.is-hovered .menu3-item-name,
          .menu3-item-row:hover .menu3-item-price,
          .menu3-item-row.is-hovered .menu3-item-price,
          .menu3-item-row:hover .menu3-item-description,
          .menu3-item-row.is-hovered .menu3-item-description,
          .menu3-item-row:hover .menu3-price-dollar,
          .menu3-item-row.is-hovered .menu3-price-dollar {
            color: #fafafa;
          }

          .menu3-item-row:focus-visible {
            outline: none;
            background: rgba(184, 66, 60, 0.1);
            box-shadow: 0 0 0 2px var(--menu3-accent, #B8423C);
          }

          /* Image indicator dot */
          .menu3-item-image-dot {
            grid-column: 1;
            grid-row: 1;
            width: 6px;
            height: 6px;
            background: var(--menu3-accent, #B8423C);
            border-radius: 50%;
            margin-top: 7px;
            opacity: 0.4;
            transition: opacity 0.5s ease-out, background 0.5s ease-out;
          }

          .menu3-item-row:hover .menu3-item-image-dot,
          .menu3-item-row.is-hovered .menu3-item-image-dot {
            opacity: 1;
            background: #fafafa;
            transition: opacity 0.35s ease-in, background 0.35s ease-in;
          }

          /* Name container */
          .menu3-item-name-container {
            grid-column: 2;
            grid-row: 1;
            display: flex;
            align-items: baseline;
            gap: 8px;
            min-width: 0;
          }

          .menu3-item-name {
            color: var(--menu3-text, #2A2522);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.5s ease-out;
          }

          .menu3-item-row:hover .menu3-item-name,
          .menu3-item-row.is-hovered .menu3-item-name {
            transition: color 0.35s ease-in;
          }

          /* Badges */
          .menu3-item-badges {
            display: inline-flex;
            gap: 4px;
            flex-shrink: 0;
          }

          .menu3-item-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          }

          /* Description */
          .menu3-item-description {
            grid-column: 2;
            grid-row: 2;
            margin-top: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
            transition: color 0.5s ease-out;
          }

          .menu3-item-row:hover .menu3-item-description,
          .menu3-item-row.is-hovered .menu3-item-description {
            transition: color 0.35s ease-in;
          }

          /* Spacer (dotted line) */
          .menu3-item-spacer {
            grid-column: 3;
            grid-row: 1;
            flex: 1;
            height: 1px;
            min-width: 20px;
            background: repeating-linear-gradient(
              90deg,
              var(--menu3-border, rgba(0, 0, 0, 0.1)) 0,
              var(--menu3-border, rgba(0, 0, 0, 0.1)) 2px,
              transparent 2px,
              transparent 6px
            );
            margin: 0 8px;
            align-self: center;
          }

          /* Price */
          .menu3-item-price {
            grid-column: 4;
            grid-row: 1;
            color: var(--menu3-text, #2A2522);
            white-space: nowrap;
            transition: color 0.5s ease-out;
          }

          .menu3-item-row:hover .menu3-item-price,
          .menu3-item-row.is-hovered .menu3-item-price {
            transition: color 0.35s ease-in;
          }

          .menu3-price-dollar {
            font-size: 0.85em;
            opacity: 0.6;
            transition: color 0.5s ease-out, opacity 0.5s ease-out;
          }

          .menu3-item-row:hover .menu3-price-dollar,
          .menu3-item-row.is-hovered .menu3-price-dollar {
            opacity: 1;
            transition: color 0.35s ease-in, opacity 0.35s ease-in;
          }

          .menu3-price-mp {
            font-size: 0.8em;
            letter-spacing: 0.05em;
            color: var(--menu3-text-muted, #888);
          }

          /* Compact mode for dense display */
          @media (max-width: 1200px) {
            .menu3-item-description {
              display: none;
            }

            .menu3-item-row {
              grid-template-rows: auto;
              padding: 10px 16px;
            }
          }

          /* Mobile */
          @media (max-width: 768px) {
            .menu3-item-row {
              padding: 14px 0;
              margin-left: 0;
              margin-right: 0;
              width: 100%;
            }

            .menu3-item-spacer {
              display: none;
            }

            .menu3-item-name-container {
              grid-column: 1 / 4;
            }

            .menu3-item-price {
              grid-column: 4;
            }

            .menu3-item-image-dot {
              display: none;
            }
          }
        `}</style>
      </button>
    );
  }
);
