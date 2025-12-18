import { getAllMenuData } from "@/lib/menu-sanity";
import { Menu3PageClient } from "@/components/menu3";

export const revalidate = 60; // Revalidate every 60 seconds

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
