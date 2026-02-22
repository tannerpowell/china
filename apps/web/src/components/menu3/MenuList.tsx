'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { MenuItem, Category } from '@/lib/types';
import { MenuItemRow } from './MenuItemRow';

interface MenuListProps {
  items: MenuItem[];
  categories: Category[];
  selectedCategory: string;
  searchTerm: string;
  onItemHover: (item: MenuItem | null) => void;
  onItemClick: (item: MenuItem) => void;
}

/**
 * Menu list with filtering.
 * Renders all items with category headers.
 * Handles hover state and modal opening.
 */
export function MenuList({
  items,
  categories,
  selectedCategory,
  searchTerm,
  onItemHover,
  onItemClick,
}: MenuListProps) {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Normalize search term
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory) {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category && item.categoryId !== category.id) {
          return false;
        }
      }

      // Search filter
      if (normalizedSearch) {
        const nameMatch = item.name.toLowerCase().includes(normalizedSearch);
        const descMatch = item.description?.toLowerCase().includes(normalizedSearch);
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [items, categories, selectedCategory, normalizedSearch]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: { category: Category; items: MenuItem[] }[] = [];

    const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

    for (const category of sortedCategories) {
      const categoryItems = filteredItems
        .filter(item => item.categoryId === category.id)
        .sort((a, b) => b.likes - a.likes);

      if (categoryItems.length > 0) {
        groups.push({ category, items: categoryItems });
      }
    }

    return groups;
  }, [filteredItems, categories]);

  function handleItemHover(item: MenuItem) {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItemId(item.id);
      onItemHover(item);
    }, 80);
  }

  function handleItemLeave() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItemId(null);
      onItemHover(null);
    }, 150);
  }

  // Count total visible items
  const visibleItemCount = filteredItems.length;

  return (
    <>
      <div className="menu3-list-header">
        <span className="menu3-item-count menu3-type-section">
          {visibleItemCount} {visibleItemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="menu3-list" role="list" aria-label="Menu items">
        {groupedItems.map(({ category, items: categoryItems }) => (
          <div key={category.id} className="menu3-category-group">
            {/* Category header - only show if not filtering by single category */}
            {!selectedCategory && (
              <div className="menu3-category-header">
                <h2 className="menu3-category-title menu3-type-section">{category.title}</h2>
              </div>
            )}

            {/* Items in this category */}
            {categoryItems.map(item => {
              const isHovered = hoveredItemId === item.id;

              return (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  isHovered={isHovered}
                  onHover={() => handleItemHover(item)}
                  onLeave={handleItemLeave}
                  onFocus={() => handleItemHover(item)}
                  onBlur={handleItemLeave}
                  onClick={() => onItemClick(item)}
                />
              );
            })}
          </div>
        ))}

        {/* No results message */}
        {filteredItems.length === 0 && (
          <div className="menu3-no-results">
            <p>No items found</p>
            {searchTerm && <p className="menu3-no-results-hint">Try adjusting your search</p>}
          </div>
        )}
      </div>

      <style jsx>{`
        .menu3-list-header {
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--menu3-border, rgba(0, 0, 0, 0.06));
        }

        .menu3-item-count {
          color: var(--menu3-text-muted, #8A8583);
          opacity: 0.8;
        }

        .menu3-list {
          display: flex;
          flex-direction: column;
        }

        .menu3-category-group {
          margin-bottom: 32px;
        }

        .menu3-category-group:last-child {
          margin-bottom: 0;
        }

        .menu3-category-header {
          margin-bottom: 16px;
          padding-bottom: 8px;
        }

        .menu3-category-title {
          margin: 0;
          color: var(--menu3-accent, #f74140);
          font-size: 13px;
        }

        .menu3-no-results {
          text-align: center;
          padding: 48px 24px;
          color: var(--menu3-text-muted, #8A8583);
        }

        .menu3-no-results p {
          margin: 0;
          font-size: 16px;
        }

        .menu3-no-results-hint {
          margin-top: 8px !important;
          font-size: 14px !important;
          opacity: 0.7;
        }
      `}</style>
    </>
  );
}
