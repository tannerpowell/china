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

      <style jsx>{`
        .menu3-category-nav {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px 0;
        }

        /* Search */
        .menu3-search-container {
          padding: 0 16px 16px;
          border-bottom: 1px solid var(--menu3-border, rgba(0, 0, 0, 0.06));
        }

        .menu3-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .menu3-search-icon {
          position: absolute;
          left: 10px;
          color: var(--menu3-text-muted, #888);
          pointer-events: none;
        }

        .menu3-search-input {
          width: 100%;
          padding: 9px 32px 9px 34px;
          background: var(--menu3-search-bg, rgba(0, 0, 0, 0.03));
          border: 1px solid var(--menu3-border, rgba(0, 0, 0, 0.08));
          border-radius: 6px;
          color: var(--menu3-text, #1a1a1a);
          transition: all 0.2s ease;
        }

        .menu3-search-input::placeholder {
          color: var(--menu3-text-muted, #888);
        }

        .menu3-search-input:focus {
          outline: none;
          border-color: var(--menu3-accent, #B8423C);
          background: white;
          box-shadow: 0 0 0 3px rgba(184, 66, 60, 0.1);
        }

        .menu3-search-clear {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          padding: 0;
          background: var(--menu3-text-muted, #888);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .menu3-search-clear:hover {
          background: var(--menu3-text, #333);
        }

        /* Category list */
        .menu3-category-list {
          list-style: none;
          margin: 0;
          padding: 8px 0;
          flex: 1;
          overflow-y: auto;
        }

        .menu3-category-item {
          position: relative;
          display: flex;
          align-items: center;
          width: calc(100% - 16px);
          padding: 10px 16px;
          margin: 0 8px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--menu3-category-color, #499e4b);
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          transition: all 0.25s ease;
        }

        .menu3-category-item:hover {
          background: var(--menu3-hover-bg-light, rgba(255, 255, 255, 0.6));
          color: var(--menu3-text, #2A2522);
        }

        .menu3-category-item.is-active {
          background: var(--menu3-category-active-bg, #499e4b);
          color: var(--menu3-category-active-color, white);
          font-weight: 700;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .menu3-category-item:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px var(--menu3-accent, #B8423C);
        }

        .menu3-category-item-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Mobile: horizontal scroll chips */
        @media (max-width: 1023px) {
          .menu3-category-nav {
            flex-direction: row;
            height: auto;
            padding: 0;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .menu3-category-nav::-webkit-scrollbar {
            display: none;
          }

          .menu3-search-container {
            display: none;
          }

          .menu3-category-list {
            display: flex;
            gap: 4px;
            padding: 4px;
            margin: 8px 12px;
            background: rgba(42, 37, 34, 0.03);
            border-radius: 20px;
            border: 1px solid rgba(42, 37, 34, 0.05);
            overflow: visible;
          }

          .menu3-category-item {
            padding: 6px 14px;
            margin: 0;
            width: auto;
            border: none;
            border-radius: 16px;
            font-size: 13px;
            white-space: nowrap;
            color: var(--menu3-category-color, #499e4b);
          }

          .menu3-category-item:hover {
            background: rgba(255, 255, 255, 0.6);
          }

          .menu3-category-item.is-active {
            background: var(--menu3-category-active-bg, #499e4b);
            color: var(--menu3-category-active-color, white);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </nav>
  );
}
