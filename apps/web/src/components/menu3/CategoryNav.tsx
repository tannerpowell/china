'use client';

import React, { useCallback, useRef } from 'react';
import type { Category } from '@/lib/types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

/**
 * Left pane category navigation with search.
 * Compact, high-density list with small type.
 * Sticky positioning for persistent access.
 */
export function CategoryNav({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
}: CategoryNavProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClear = useCallback(() => {
    onSearchChange('');
    searchInputRef.current?.focus();
  }, [onSearchChange]);

  return (
    <nav className="menu3-category-nav" aria-label="Menu categories">
      {/* Search */}
      <div className="menu3-search-container">
        <div className="menu3-search-wrapper">
          <svg
            className="menu3-search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="menu3-search-input menu3-type-search"
            aria-label="Search menu items"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="menu3-search-clear"
              aria-label="Clear search"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category list */}
      <div className="menu3-category-list" role="radiogroup" aria-label="Filter by category">
        {/* All Menu Items option */}
        <button
          type="button"
          className={`menu3-category-item menu3-type-category ${selectedCategory === '' ? 'is-active' : ''}`}
          onClick={() => onCategoryChange('')}
          role="radio"
          aria-checked={selectedCategory === ''}
        >
          <span className="menu3-category-item-text">All Items</span>
        </button>

        {categories.map(category => (
          <button
            key={category.slug}
            type="button"
            className={`menu3-category-item menu3-type-category ${selectedCategory === category.slug ? 'is-active' : ''}`}
            onClick={() => onCategoryChange(category.slug)}
            role="radio"
            aria-checked={selectedCategory === category.slug}
          >
            <span className="menu3-category-item-text">{category.title}</span>
          </button>
        ))}
      </div>

    </nav>
  );
}
