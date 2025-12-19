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
  const sanityCategories = await sanityClient.fetch<SanityCategory[]>(queries.categories);
  return sanityCategories.map(transformCategory);
});

export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
  const sanityItems = await sanityClient.fetch<SanityMenuItem[]>(queries.menuItems);
  return sanityItems.map(transformMenuItem);
});

export const getModifierGroups = cache(async (): Promise<ModifierGroup[]> => {
  const sanityGroups = await sanityClient.fetch<SanityModifierGroup[]>(queries.modifierGroups);
  return sanityGroups.map(transformModifierGroup);
});

export async function getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  // Use server-side GROQ query for filtering instead of fetching all items
  const sanityItems = await sanityClient.fetch<SanityMenuItem[]>(
    queries.itemsByCategory,
    { categoryId }
  );
  return sanityItems.map(transformMenuItem);
}

export async function getModifierGroup(id: string): Promise<ModifierGroup | undefined> {
  const groups = await getModifierGroups();
  return groups.find(g => g.id === id);
}

export async function getItem(id: string): Promise<MenuItem | undefined> {
  const items = await getMenuItems();
  return items.find(item => item.id === id);
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
