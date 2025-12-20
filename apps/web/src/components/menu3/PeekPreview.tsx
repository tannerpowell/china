'use client';

import React from 'react';
import Image from 'next/image';
import type { MenuItem } from '@/lib/types';

interface PeekPreviewProps {
  item: MenuItem | null;
}

/**
 * Peek preview card shown on hover/focus.
 * Renders in the right pane (desktop).
 * Premium surface: radius 14-18px, faint border, layered shadow.
 */
export function PeekPreview({ item }: PeekPreviewProps) {
  if (!item) {
    // Show empty state
    return (
      <div className="menu3-peek-empty">
        <div className="menu3-peek-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          </svg>
        </div>
        <p className="menu3-peek-empty-text">
          Hover over an item to preview
        </p>

        <style jsx>{`
          .menu3-peek-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 240px;
            padding: 40px;
            text-align: center;
          }

          .menu3-peek-empty-icon {
            color: var(--menu3-text-muted, #aaa);
            opacity: 0.4;
            margin-bottom: 16px;
          }

          .menu3-peek-empty-text {
            font-family: var(--font-menu-ui, 'Sen', sans-serif);
            font-size: 14px;
            color: var(--menu3-text-muted, #888);
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  const hasImage = item.images && item.images.length > 0;
  const imageSrc = hasImage ? item.images[0] : null;

  return (
    <div className="menu3-peek">
      {/* Image */}
      {imageSrc && (
        <div className="menu3-peek-image">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="280px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="menu3-peek-content">
        {/* Name */}
        <h3 className="menu3-peek-name menu3-type-peek-name">
          {item.name}
        </h3>

        {/* Price */}
        <div className="menu3-peek-price menu3-type-price">
          {item.basePrice !== null ? (
            <>
              <span className="menu3-peek-price-dollar">$</span>
              {item.basePrice.toFixed(2)}
            </>
          ) : (
            <span className="menu3-peek-price-mp">Market Price</span>
          )}
        </div>

        {/* Tags/Badges */}
        {(item.tags.spicy || item.tags.vegetarian || item.tags.popular) && (
          <div className="menu3-peek-badges">
            {item.tags.spicy && (
              <span className="menu3-peek-badge menu3-type-badge" style={{ '--badge-color': '#e53e3e' } as React.CSSProperties}>
                🌶 Spicy
              </span>
            )}
            {item.tags.vegetarian && (
              <span className="menu3-peek-badge menu3-type-badge" style={{ '--badge-color': '#38a169' } as React.CSSProperties}>
                🌱 Vegetarian
              </span>
            )}
            {item.tags.popular && (
              <span className="menu3-peek-badge menu3-type-badge" style={{ '--badge-color': '#d69e2e' } as React.CSSProperties}>
                ⭐ Popular
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="menu3-peek-description menu3-type-description">
            {item.description}
          </p>
        )}

        {/* Click hint */}
        <div className="menu3-peek-hint menu3-type-section">
          Click for details
        </div>
      </div>

      <style jsx>{`
        .menu3-peek {
          background: var(--menu3-card-bg, white);
          border: 1px solid var(--menu3-border, rgba(0, 0, 0, 0.06));
          border-radius: 16px;
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(42, 37, 34, 0.04),
            0 4px 12px rgba(42, 37, 34, 0.06),
            0 12px 24px rgba(42, 37, 34, 0.06);
        }

        /* Image */
        .menu3-peek-image {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: var(--menu3-image-placeholder, #f5f5f5);
        }

        /* Content */
        .menu3-peek-content {
          padding: 20px;
        }

        .menu3-peek-name {
          margin: 0 0 6px;
          color: var(--menu3-text, #2A2522);
        }

        .menu3-peek-price {
          color: var(--menu3-text, #2A2522);
          margin-bottom: 12px;
        }

        .menu3-peek-price-dollar {
          font-size: 0.85em;
          opacity: 0.6;
        }

        .menu3-peek-price-mp {
          font-size: 0.8em;
          color: var(--menu3-text-muted, #888);
        }

        /* Badges */
        .menu3-peek-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .menu3-peek-badge {
          padding: 3px 8px;
          background: color-mix(in srgb, var(--badge-color, #888) 12%, transparent);
          color: var(--badge-color, #888);
          border-radius: 4px;
        }

        /* Description */
        .menu3-peek-description {
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: var(--menu3-text-muted, #5a5a5a);
        }

        /* Hint */
        .menu3-peek-hint {
          color: var(--menu3-text-muted, #888);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
