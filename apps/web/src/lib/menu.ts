import menuData from '@/data/menu.normalized.json';
import type { MenuData, MenuItem, Category, ModifierGroup } from './types';

const data = menuData as MenuData;

export function getCategories(): Category[] {
  // Sort a copy to avoid mutating the original data
  return [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getModifierGroups(): ModifierGroup[] {
  return data.modifierGroups;
}

export function getModifierGroup(id: string): ModifierGroup | undefined {
  return data.modifierGroups.find((g) => g.id === id);
}

export function getItems(): MenuItem[] {
  return data.items;
}

export function getItemsByCategory(categoryId: string): MenuItem[] {
  return data.items
    .filter((item) => item.categoryId === categoryId)
    .sort((a, b) => b.likes - a.likes); // Sort by popularity
}

export function getItem(id: string): MenuItem | undefined {
  return data.items.find((item) => item.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return data.categories.find((cat) => cat.slug === slug);
}

export function getRestaurantInfo() {
  return data.restaurant;
}

// Image mapping based on gallery_optimized naming convention
// Pattern: {category}--{item-slug}__hero_4x3.jpg or __square_1x1.jpg
// Category heroes: _category--{category}__group_16x9.jpg

const CATEGORY_SLUG_TO_IMAGE_PREFIX: Record<string, string> = {
  'soups': 'soups',
  'appetizers': 'appetizers',
  'fried-rice': 'fried-rice',
  'noodles': 'noodles',
  'favorites': 'chicken', // Default to chicken images for favorites
  'traditional': 'chicken',
  'specialties': 'specialties',
  'lunch-specials': 'chicken',
  'grill': 'beef',
  'vegetarian-light': 'vegetarian',
  'side-orders': 'sides',
  'drinks': 'drinks',
  'catering-options': 'catering',
};

// Map of item slugs to their image category (for items that don't match their category)
const ITEM_IMAGE_OVERRIDES: Record<string, string> = {
  // Add specific overrides as needed
};

export function getItemImagePath(item: MenuItem, size: 'hero' | 'square' = 'square'): string | null {
  // Extract category slug from categoryId (assumes 'cat_' prefix from normalize.ts)
  // e.g., 'cat_soups' -> 'soups'
  const categorySlug = CATEGORY_SLUG_TO_IMAGE_PREFIX[item.categoryId.replace('cat_', '')] || item.categoryId.replace('cat_', '');
  const imageCategory = ITEM_IMAGE_OVERRIDES[item.slug] || categorySlug;
  const suffix = size === 'hero' ? '__hero_4x3.jpg' : '__square_1x1.jpg';

  // Build potential image path
  const imageName = `${imageCategory}--${item.slug}${suffix}`;

  // Return path to gallery_optimized
  return `/gallery/${imageName}`;
}

export function getCategoryHeroImage(categorySlug: string): string {
  // Map category slug to image category
  const imageCategory = CATEGORY_SLUG_TO_IMAGE_PREFIX[categorySlug] || categorySlug;
  return `/gallery/_category--${imageCategory}__group_16x9.jpg`;
}

// Available category hero images
export const AVAILABLE_CATEGORY_IMAGES = [
  'appetizers',
  'beef',
  'chicken',
  'fried-rice',
  'noodles',
  'pork',
  'shrimp',
  'soups',
  'specialties',
];

export function hasCategoryHeroImage(categorySlug: string): boolean {
  const mapped = CATEGORY_SLUG_TO_IMAGE_PREFIX[categorySlug] || categorySlug;
  return AVAILABLE_CATEGORY_IMAGES.includes(mapped);
}
