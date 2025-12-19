import { getAllMenuData } from "@/lib/menu-sanity";
import { Menu3PageClient } from "@/components/menu3";

// Force dynamic rendering - menu data comes from Sanity CMS
export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const { categories, items, modifierGroups } = await getAllMenuData();

  return (
    <Menu3PageClient
      categories={categories}
      items={items}
      modifierGroups={modifierGroups}
    />
  );
}
