import { cache } from 'react';
import { sanityClient, queries, SanityCategory, SanityMenuItem, SanityModifierGroup } from './sanity';
import type { Category, MenuItem, ModifierGroup } from './types';

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
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const sanityCategories = await sanityClient.fetch<SanityCategory[]>(queries.categories);
    return sanityCategories.map(transformCategory);
  } catch (error) {
    console.error('Failed to fetch categories from Sanity:', error);
    throw new Error('Unable to load menu categories', { cause: error });
  }
});

export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
  try {
    const sanityItems = await sanityClient.fetch<SanityMenuItem[]>(queries.menuItems);
    return sanityItems.map(transformMenuItem);
  } catch (error) {
    console.error('Failed to fetch menu items from Sanity:', error);
    throw new Error('Unable to load menu items', { cause: error });
  }
});

export const getModifierGroups = cache(async (): Promise<ModifierGroup[]> => {
  try {
    const sanityGroups = await sanityClient.fetch<SanityModifierGroup[]>(queries.modifierGroups);
    return sanityGroups.map(transformModifierGroup);
  } catch (error) {
    console.error('Failed to fetch modifier groups from Sanity:', error);
    throw new Error('Unable to load modifier options', { cause: error });
  }
});

export async function getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  try {
    const sanityItems = await sanityClient.fetch<SanityMenuItem[]>(
      queries.itemsByCategory,
      { categoryId }
    );
    return sanityItems.map(transformMenuItem);
  } catch (error) {
    console.error(`Failed to fetch items for category ${categoryId}:`, error);
    throw new Error('Unable to load category items', { cause: error });
  }
}

// Server-side GROQ query for single modifier group lookup
export async function getModifierGroup(id: string): Promise<ModifierGroup | undefined> {
  try {
    const sanityGroup = await sanityClient.fetch<SanityModifierGroup | null>(
      queries.modifierGroupById,
      { id }
    );
    return sanityGroup ? transformModifierGroup(sanityGroup) : undefined;
  } catch (error) {
    console.error(`Failed to fetch modifier group ${id}:`, error);
    throw new Error('Unable to load modifier group', { cause: error });
  }
}

// Server-side GROQ query for single menu item lookup
export async function getItem(id: string): Promise<MenuItem | undefined> {
  try {
    const sanityItem = await sanityClient.fetch<SanityMenuItem | null>(
      queries.menuItemById,
      { id }
    );
    return sanityItem ? transformMenuItem(sanityItem) : undefined;
  } catch (error) {
    console.error(`Failed to fetch menu item ${id}:`, error);
    throw new Error('Unable to load menu item', { cause: error });
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
