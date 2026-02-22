import { cache } from 'react';
import { sanityClient, queries, SanityCategory, SanityMenuItem, SanityModifierGroup } from './sanity';
import * as localMenu from './menu';
import type { Category, MenuItem, ModifierGroup } from './types';

// Check if Sanity is configured (env vars present)
function isSanityConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET);
}

// Transform Sanity data to match existing types
function transformCategory(cat: SanityCategory): Category {
  return {
    id: cat._id,
    title: cat.title,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
  };
}

function transformMenuItem(item: SanityMenuItem): MenuItem {
  return {
    id: item._id,
    sourceItemId: item.sourceItemId,
    name: item.name,
    slug: item.slug,
    categoryId: item.categoryId,
    basePrice: item.basePrice,
    description: item.description,
    likes: item.likes || 0,
    tags: item.tags || { spicy: false, vegetarian: false, popular: false },
    images: item.images || [],
    modifierGroupIds: item.modifierGroupIds || [],
    order: item.order || { provider: '', cartUrl: '', itemOrderUrl: null },
  };
}

function transformModifierGroup(group: SanityModifierGroup): ModifierGroup {
  return {
    id: group._id,
    title: group.title,
    selectionType: group.selectionType,
    min: group.min,
    max: group.max,
    options: (group.options || []).map(opt => ({
      id: opt.id,
      label: opt.label,
      priceDelta: opt.priceDelta,
    })),
  };
}

// Use React cache() for request-scoped memoization (prevents stale data in serverless)
// Falls back to local JSON when Sanity is not configured or unavailable
export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSanityConfigured()) return localMenu.getCategories();
  try {
    const sanityCategories = await sanityClient.fetch<SanityCategory[]>(queries.categories);
    return sanityCategories.map(transformCategory);
  } catch (error) {
    console.error('Sanity fetch failed, falling back to local data:', error);
    return localMenu.getCategories();
  }
});

export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
  if (!isSanityConfigured()) return localMenu.getItems();
  try {
    const sanityItems = await sanityClient.fetch<SanityMenuItem[]>(queries.menuItems);
    return sanityItems.map(transformMenuItem);
  } catch (error) {
    console.error('Sanity fetch failed, falling back to local data:', error);
    return localMenu.getItems();
  }
});

export const getModifierGroups = cache(async (): Promise<ModifierGroup[]> => {
  if (!isSanityConfigured()) return localMenu.getModifierGroups();
  try {
    const sanityGroups = await sanityClient.fetch<SanityModifierGroup[]>(queries.modifierGroups);
    return sanityGroups.map(transformModifierGroup);
  } catch (error) {
    console.error('Sanity fetch failed, falling back to local data:', error);
    return localMenu.getModifierGroups();
  }
});

export async function getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  if (!isSanityConfigured()) return localMenu.getItemsByCategory(categoryId);
  try {
    const sanityItems = await sanityClient.fetch<SanityMenuItem[]>(
      queries.itemsByCategory,
      { categoryId }
    );
    return sanityItems.map(transformMenuItem);
  } catch (error) {
    console.error(`Sanity fetch failed for category ${categoryId}, falling back:`, error);
    return localMenu.getItemsByCategory(categoryId);
  }
}

export async function getModifierGroup(id: string): Promise<ModifierGroup | undefined> {
  if (!isSanityConfigured()) return localMenu.getModifierGroup(id);
  try {
    const sanityGroup = await sanityClient.fetch<SanityModifierGroup | null>(
      queries.modifierGroupById,
      { id }
    );
    return sanityGroup ? transformModifierGroup(sanityGroup) : undefined;
  } catch (error) {
    console.error(`Sanity fetch failed for modifier group ${id}, falling back:`, error);
    return localMenu.getModifierGroup(id);
  }
}

export async function getItem(id: string): Promise<MenuItem | undefined> {
  if (!isSanityConfigured()) return localMenu.getItem(id);
  try {
    const sanityItem = await sanityClient.fetch<SanityMenuItem | null>(
      queries.menuItemById,
      { id }
    );
    return sanityItem ? transformMenuItem(sanityItem) : undefined;
  } catch (error) {
    console.error(`Sanity fetch failed for item ${id}, falling back:`, error);
    return localMenu.getItem(id);
  }
}

// Get all menu data in one call (for SSR)
export async function getAllMenuData() {
  const [categories, items, modifierGroups] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getModifierGroups(),
  ]);

  return { categories, items, modifierGroups };
}
