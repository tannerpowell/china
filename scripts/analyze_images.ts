/**
 * Analyze image coverage for menu items
 * Maps optimized gallery images to Sanity menu items
 */

import fs from "node:fs";
import path from "node:path";

const GALLERY_DIR = "/Users/tp/Projects/China Island Grill/china-island-redesign/data/gallery_optimized";

// Menu items from Sanity (copied from query results)
const menuItems = [
  // Appetizers
  { id: "item_7129113", name: "Boneless Spare Ribs", slug: "boneless-spare-ribs", category: "Appetizers" },
  { id: "item_524761212", name: "Chicken Dumplings (6)", slug: "chicken-dumplings-6", category: "Appetizers" },
  { id: "item_6609138", name: "Crab Rangoons (6)", slug: "crab-rangoons-6", category: "Appetizers" },
  { id: "item_6609144", name: "Edamame", slug: "edamame", category: "Appetizers" },
  { id: "item_6609136", name: "Egg Roll (1)", slug: "egg-roll-1", category: "Appetizers" },
  { id: "item_6609143", name: "Fried Shrimp (6)", slug: "fried-shrimp-6", category: "Appetizers" },
  { id: "item_6609159", name: "Lettuce Wraps", slug: "lettuce-wraps", category: "Appetizers" },
  { id: "item_6609139", name: "Marinated Chicken Wings (8)", slug: "marinated-chicken-wings-8", category: "Appetizers" },
  { id: "item_6609158", name: "Pork Dumplings (6)", slug: "pork-dumplings-6", category: "Appetizers" },
  { id: "item_6609145", name: "Teriyaki Chicken Satay (3)", slug: "teriyaki-chicken-satay-3", category: "Appetizers" },
  { id: "item_6609137", name: "Vegetable Spring Roll (2)", slug: "vegetable-spring-roll-2", category: "Appetizers" },
  // Catering
  { id: "item_6613168", name: "Large 10-12 People (Favorites)", slug: "large-10-12-people-favorites", category: "Catering Options" },
  { id: "item_6613176", name: "Large 10-12 People (Fried Rice)", slug: "large-10-12-people-fried-rice", category: "Catering Options" },
  { id: "item_6613174", name: "Large 10-12 People (Noodles)", slug: "large-10-12-people-noodles", category: "Catering Options" },
  { id: "item_6609422", name: "Large 10-12 People (Traditional)", slug: "large-10-12-people-traditional", category: "Catering Options" },
  { id: "item_6613165", name: "Small 5-6 People (Favorites)", slug: "small-5-6-people-favorites", category: "Catering Options" },
  { id: "item_6613167", name: "Small 5-6 People (Fried Rice)", slug: "small-5-6-people-fried-rice", category: "Catering Options" },
  { id: "item_6613164", name: "Small 5-6 People (Noodles)", slug: "small-5-6-people-noodles", category: "Catering Options" },
  { id: "item_6609421", name: "Small 5-6 People (Traditional)", slug: "small-5-6-people-traditional", category: "Catering Options" },
  // Drinks
  { id: "item_7037582", name: "Bottled Water", slug: "bottled-water", category: "Drinks" },
  { id: "item_7037449", name: "Coke", slug: "coke", category: "Drinks" },
  { id: "item_7037489", name: "Diet Coke", slug: "diet-coke", category: "Drinks" },
  { id: "item_7037493", name: "Diet Dr. Pepper", slug: "diet-dr-pepper", category: "Drinks" },
  { id: "item_7037491", name: "Dr. Pepper", slug: "dr-pepper", category: "Drinks" },
  { id: "item_7037508", name: "Perrier Sparkling Water", slug: "perrier-sparkling-water", category: "Drinks" },
  { id: "item_7037520", name: "S. Pellegrino Water", slug: "s-pellegrino-water", category: "Drinks" },
  { id: "item_7037495", name: "Sprite", slug: "sprite", category: "Drinks" },
  // Favorites
  { id: "item_6609231", name: "General Tsao's Chicken", slug: "general-tsao-s-chicken", category: "Favorites" },
  { id: "item_6609232", name: "Happy Family", slug: "happy-family", category: "Favorites" },
  { id: "item_6609236", name: "Lemon Chicken", slug: "lemon-chicken", category: "Favorites" },
  { id: "item_6609235", name: "Moo Goo Gai Pan", slug: "moo-goo-gai-pan", category: "Favorites" },
  { id: "item_6609233", name: "Pepper Steak", slug: "pepper-steak", category: "Favorites" },
  { id: "item_528112375", name: "Salt and Pepper Chicken", slug: "salt-and-pepper-chicken", category: "Favorites" },
  { id: "item_6609237", name: "Shrimp w/ Lobster Sauce", slug: "shrimp-w-lobster-sauce", category: "Favorites" },
  { id: "item_6609230", name: "Spicy Crispy", slug: "spicy-crispy", category: "Favorites" },
  { id: "item_6609234", name: "Twice Cooked Pork", slug: "twice-cooked-pork", category: "Favorites" },
  // Fried Rice
  { id: "item_6609169", name: "BBQ Pork Fried Rice", slug: "bbq-pork-fried-rice", category: "Fried Rice" },
  { id: "item_6609168", name: "Beef Fried Rice", slug: "beef-fried-rice", category: "Fried Rice" },
  { id: "item_6609167", name: "Chicken Fried Rice", slug: "chicken-fried-rice", category: "Fried Rice" },
  { id: "item_6609173", name: "Combination Fried Rice", slug: "combination-fried-rice", category: "Fried Rice" },
  { id: "item_6609172", name: "Scallop Fried Rice", slug: "scallop-fried-rice", category: "Fried Rice" },
  { id: "item_6609171", name: "Shrimp Fried Rice", slug: "shrimp-fried-rice", category: "Fried Rice" },
  { id: "item_523083281", name: "Tofu Fried Rice", slug: "tofu-fried-rice", category: "Fried Rice" },
  { id: "item_6609170", name: "Vegetable Fried Rice", slug: "vegetable-fried-rice", category: "Fried Rice" },
  // Grill
  { id: "item_6609315", name: "Grilled Chicken", slug: "grilled-chicken", category: "Grill" },
  { id: "item_6609318", name: "Grilled Shrimp", slug: "grilled-shrimp", category: "Grill" },
  { id: "item_6609317", name: "Grilled Tilapia", slug: "grilled-tilapia", category: "Grill" },
  // Lunch Specials
  { id: "item_6609418", name: "Almond Stir-Fry (L)", slug: "almond-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609410", name: "Black Bean Stir-Fry (L)", slug: "black-bean-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609408", name: "Broccoli Stir-Fry (L)", slug: "broccoli-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609412", name: "Cashew Stir-Fry (L)", slug: "cashew-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609388", name: "Fried Rice (L)", slug: "fried-rice-l", category: "Lunch Specials" },
  { id: "item_6609390", name: "General Tsao's Chicken (L)", slug: "general-tsao-s-chicken-l", category: "Lunch Specials" },
  { id: "item_525697887", name: "Hot Garlic Stir -Fry (L)", slug: "hot-garlic-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609395", name: "Hunan Stir-Fry (L)", slug: "hunan-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609409", name: "Jalapeno Stir-Fry (L)", slug: "jalapeno-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609396", name: "Kung Pao Stir-Fry (L)", slug: "kung-pao-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609389", name: "Lo Mein Noodles (L)", slug: "lo-mein-noodles-l", category: "Lunch Specials" },
  { id: "item_6609411", name: "Mongolian Stir-Fry (L)", slug: "mongolian-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609392", name: "Orange Chicken (L)", slug: "orange-chicken-l", category: "Lunch Specials" },
  { id: "item_6609391", name: "Sesame Honey Seared Chicken (L)", slug: "sesame-honey-seared-chicken-l", category: "Lunch Specials" },
  { id: "item_6609397", name: "Sichuan Stir-Fry (L)", slug: "sichuan-stir-fry-l", category: "Lunch Specials" },
  { id: "item_6609393", name: "Sweet & Sour (L)", slug: "sweet-and-sour-l", category: "Lunch Specials" },
  // Noodles
  { id: "item_6609212", name: "Chow Fun Flat Rice Noodles", slug: "chow-fun-flat-rice-noodles", category: "Noodles" },
  { id: "item_6613085", name: "Chow Fun Flat Rice Noodles (Combination)", slug: "chow-fun-flat-rice-noodles-combination", category: "Noodles" },
  { id: "item_6609209", name: "Lo Mein Noodles", slug: "lo-mein-noodles", category: "Noodles" },
  { id: "item_520255298", name: "Lo Mein Noodles (Combination)", slug: "lo-mein-noodles-combination", category: "Noodles" },
  { id: "item_6609210", name: "Phad Thai Noodles", slug: "phad-thai-noodles", category: "Noodles" },
  { id: "item_6613081", name: "Phad Thai Noodles (Combination)", slug: "phad-thai-noodles-combination", category: "Noodles" },
  { id: "item_6609211", name: "Singapore Rice Noodles", slug: "singapore-rice-noodles", category: "Noodles" },
  { id: "item_6613083", name: "Singapore Rice Noodles (Combination)", slug: "singapore-rice-noodles-combination", category: "Noodles" },
  { id: "item_6609213", name: "Udon Noodles", slug: "udon-noodles", category: "Noodles" },
  { id: "item_6613087", name: "Udon Noodles (Combination)", slug: "udon-noodles-combination", category: "Noodles" },
  // Side Orders
  { id: "item_6609362", name: "Fried Wonton Chips", slug: "fried-wonton-chips", category: "Side Orders" },
  { id: "item_6609364", name: "Plain Fried Rice", slug: "plain-fried-rice", category: "Side Orders" },
  { id: "item_6609366", name: "Plain Lo Mein Noodles", slug: "plain-lo-mein-noodles", category: "Side Orders" },
  { id: "item_6613221", name: "Steamed Brown Rice", slug: "steamed-brown-rice", category: "Side Orders" },
  { id: "item_6609365", name: "Steamed Noodles", slug: "steamed-noodles", category: "Side Orders" },
  { id: "item_6609367", name: "Steamed Vegetables", slug: "steamed-vegetables", category: "Side Orders" },
  { id: "item_6609363", name: "Steamed White Rice", slug: "steamed-white-rice", category: "Side Orders" },
  // Soups
  { id: "item_6609114", name: "Chicken & Corn Soup", slug: "chicken-and-corn-soup", category: "Soups" },
  { id: "item_6609117", name: "Egg Drop Soup", slug: "egg-drop-soup", category: "Soups" },
  { id: "item_6609116", name: "Hot & Sour Soup", slug: "hot-and-sour-soup", category: "Soups" },
  { id: "item_6609115", name: "Vegetable & Tofu Soup", slug: "vegetable-and-tofu-soup", category: "Soups" },
  { id: "item_6609113", name: "Wonton Soup", slug: "wonton-soup", category: "Soups" },
  // Specialties
  { id: "item_6609287", name: "Coconut Red Curry", slug: "coconut-red-curry", category: "Specialties" },
  { id: "item_6609289", name: "Crispy Tilapia w/ Special House Sauce", slug: "crispy-tilapia-w-special-house-sauce", category: "Specialties" },
  { id: "item_6609288", name: "Ginger Shrimp", slug: "ginger-shrimp", category: "Specialties" },
  { id: "item_6609284", name: "Lemon Grass Chicken", slug: "lemon-grass-chicken", category: "Specialties" },
  { id: "item_6609285", name: "Mandarin Pecan", slug: "mandarin-pecan", category: "Specialties" },
  { id: "item_6609286", name: "Vanilla Shrimp", slug: "vanilla-shrimp", category: "Specialties" },
  // Traditional
  { id: "item_6609262", name: "Almond Stir-Fry", slug: "almond-stir-fry", category: "Traditional" },
  { id: "item_6609258", name: "Black Bean Sauce Stir-Fry", slug: "black-bean-sauce-stir-fry", category: "Traditional" },
  { id: "item_6609256", name: "Broccoli Stir-Fry", slug: "broccoli-stir-fry", category: "Traditional" },
  { id: "item_6609261", name: "Cashew Stir-Fry", slug: "cashew-stir-fry", category: "Traditional" },
  { id: "item_6609273", name: "Egg Foo Young", slug: "egg-foo-young", category: "Traditional" },
  { id: "item_26165", name: "Hot Garlic Stir-Fry", slug: "hot-garlic-stir-fry", category: "Traditional" },
  { id: "item_6609253", name: "Hunan Stir-Fry", slug: "hunan-stir-fry", category: "Traditional" },
  { id: "item_6609257", name: "Jalapeno Stir-Fry", slug: "jalapeno-stir-fry", category: "Traditional" },
  { id: "item_6609254", name: "Kung Pao Stir-Fry", slug: "kung-pao-stir-fry", category: "Traditional" },
  { id: "item_6609260", name: "Mongolian Stir-Fry", slug: "mongolian-stir-fry", category: "Traditional" },
  { id: "item_6609259", name: "Moo-Shu Stir-Fry", slug: "moo-shu-stir-fry", category: "Traditional" },
  { id: "item_6609275", name: "Orange", slug: "orange", category: "Traditional" },
  { id: "item_6609274", name: "Sesame", slug: "sesame", category: "Traditional" },
  { id: "item_6609255", name: "Sichuan Stir-Fry", slug: "sichuan-stir-fry", category: "Traditional" },
  { id: "item_6609276", name: "Sweet & Sour", slug: "sweet-and-sour", category: "Traditional" },
  // Vegetarian
  { id: "item_6613132", name: "Asparagus Stir-Fry", slug: "asparagus-stir-fry", category: "Vegetarian / Light" },
  { id: "item_6609340", name: "Baby Bok Choy Stir-Fry", slug: "baby-bok-choy-stir-fry", category: "Vegetarian / Light" },
  { id: "item_6613131", name: "Broccoli Stir-Fry", slug: "broccoli-stir-fry-2", category: "Vegetarian / Light" },
  { id: "item_6609339", name: "Eggplant Stir-Fry w/ Hot Garlic Sauce", slug: "eggplant-stir-fry-w-hot-garlic-sauce", category: "Vegetarian / Light" },
  { id: "item_6609341", name: "Ma-Po Tofu", slug: "ma-po-tofu", category: "Vegetarian / Light" },
  { id: "item_6609338", name: "Sichuan String Beans", slug: "sichuan-string-beans", category: "Vegetarian / Light" },
  { id: "item_6613133", name: "Snow Pea Stir-Fry", slug: "snow-pea-stir-fry", category: "Vegetarian / Light" },
];

// Image mapping rules - maps optimized image names to menu item patterns
const imageMapping: Record<string, string[]> = {
  "appetizers--bbq-spare-ribs": ["boneless-spare-ribs"],
  "appetizers--chicken-lettuce-wraps": ["lettuce-wraps"],
  "appetizers--edamame": ["edamame"],
  "appetizers--egg-rolls": ["egg-roll-1"],
  "appetizers--pan-fried-dumplings": ["chicken-dumplings-6", "pork-dumplings-6"],
  "beef--beef-with-mushrooms": [], // Could map to beef dishes
  "beef--mongolian-beef": ["mongolian-stir-fry", "mongolian-stir-fry-l"],
  "beef--pepper-steak": ["pepper-steak"],
  "chicken--chicken-with-broccoli-takeout": ["broccoli-stir-fry"],
  "chicken--general-tsos-chicken": ["general-tsao-s-chicken", "general-tsao-s-chicken-l"],
  "chicken--general-tsos-chicken-plated": [],
  "chicken--general-tsos-chicken-takeout": [],
  "chicken--honey-pecan-chicken": ["mandarin-pecan"],
  "chicken--hunan-chicken-lunch": ["hunan-stir-fry", "hunan-stir-fry-l"],
  "chicken--kung-pao-chicken": ["kung-pao-stir-fry", "kung-pao-stir-fry-l"],
  "chicken--kung-pao-chicken-lunch": [],
  "chicken--mongolian-chicken": [],
  "chicken--sesame-chicken": ["sesame", "sesame-honey-seared-chicken-l"],
  "fried-rice--house-special-fried-rice": ["combination-fried-rice"],
  "fried-rice--pork-fried-rice-combo": ["bbq-pork-fried-rice"],
  "fried-rice--shrimp-fried-rice": ["shrimp-fried-rice"],
  "noodles--beef-chow-fun": ["chow-fun-flat-rice-noodles", "chow-fun-flat-rice-noodles-combination"],
  "noodles--beef-lo-mein": ["lo-mein-noodles", "lo-mein-noodles-combination", "lo-mein-noodles-l"],
  "noodles--pad-thai": ["phad-thai-noodles", "phad-thai-noodles-combination"],
  "noodles--singapore-noodles": ["singapore-rice-noodles", "singapore-rice-noodles-combination"],
  "noodles--singapore-noodles-2": [],
  "noodles--vegetable-lo-mein-takeout": [],
  "pork--honey-garlic-spare-ribs": [],
  "pork--twice-cooked-pork": ["twice-cooked-pork"],
  "shrimp--garlic-shrimp-snow-peas": ["ginger-shrimp"],
  "shrimp--grilled-tilapia": ["grilled-tilapia", "crispy-tilapia-w-special-house-sauce"],
  "shrimp--honey-walnut-shrimp": ["vanilla-shrimp"],
  "shrimp--shrimp-with-broccoli": ["shrimp-w-lobster-sauce"],
  "soups--egg-drop-soup": ["egg-drop-soup"],
  "soups--hot-and-sour-soup": ["hot-and-sour-soup"],
  "soups--wonton-soup": ["wonton-soup"],
  "specialties--happy-family": ["happy-family"],
  "specialties--happy-family-deluxe": [],
  "specialties--string-beans-chicken": ["sichuan-string-beans"],
};

function main() {
  // Get all images in gallery_optimized
  const images = fs.readdirSync(GALLERY_DIR).filter(f => f.endsWith('.jpg'));
  const dishImages = images.filter(f => !f.startsWith('_category'));

  console.log("=== IMAGE ANALYSIS ===\n");
  console.log(`Total optimized images: ${images.length}`);
  console.log(`Category banners: ${images.length - dishImages.length}`);
  console.log(`Dish images: ${dishImages.length} (${dishImages.length / 2} unique dishes)\n`);

  // Build reverse mapping: slug -> image
  const slugToImage: Map<string, string[]> = new Map();
  for (const [imgBase, slugs] of Object.entries(imageMapping)) {
    for (const slug of slugs) {
      const existing = slugToImage.get(slug) || [];
      existing.push(imgBase);
      slugToImage.set(slug, existing);
    }
  }

  // Categorize items
  const itemsWithImages: typeof menuItems = [];
  const itemsNeedingImages: typeof menuItems = [];
  const itemsSkippable: typeof menuItems = [];

  for (const item of menuItems) {
    const hasImage = slugToImage.has(item.slug);

    // Skip drinks (can use product photos), catering (generic), and lunch specials (share with regular items)
    const isSkippable =
      item.category === "Drinks" ||
      item.category === "Catering Options" ||
      item.category === "Side Orders" ||
      item.slug.endsWith("-l"); // Lunch specials can share with regular items

    if (hasImage) {
      itemsWithImages.push(item);
    } else if (isSkippable) {
      itemsSkippable.push(item);
    } else {
      itemsNeedingImages.push(item);
    }
  }

  console.log("=== COVERAGE SUMMARY ===\n");
  console.log(`Items with images: ${itemsWithImages.length}`);
  console.log(`Items needing images: ${itemsNeedingImages.length}`);
  console.log(`Items skippable (drinks/catering/sides/lunch): ${itemsSkippable.length}`);
  console.log(`Total: ${menuItems.length}\n`);

  console.log("=== ITEMS WITH IMAGES ===\n");
  for (const item of itemsWithImages) {
    const imgs = slugToImage.get(item.slug)!;
    console.log(`✓ ${item.name} <- ${imgs.join(', ')}`);
  }

  console.log("\n=== ITEMS NEEDING IMAGES (for Nano Banana) ===\n");
  const byCategory: Record<string, typeof menuItems> = {};
  for (const item of itemsNeedingImages) {
    byCategory[item.category] = byCategory[item.category] || [];
    byCategory[item.category].push(item);
  }

  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`\n${cat}:`);
    for (const item of items) {
      console.log(`  • ${item.name}`);
    }
  }

  console.log("\n=== SKIPPABLE ITEMS ===\n");
  const skipByCategory: Record<string, typeof menuItems> = {};
  for (const item of itemsSkippable) {
    skipByCategory[item.category] = skipByCategory[item.category] || [];
    skipByCategory[item.category].push(item);
  }

  for (const [cat, items] of Object.entries(skipByCategory)) {
    console.log(`\n${cat}: (${items.length} items)`);
  }

  // Generate nano-banana prompts for missing items
  console.log("\n\n=== NANO BANANA GENERATION PROMPTS ===\n");
  for (const item of itemsNeedingImages) {
    const prompt = generatePrompt(item.name, item.category);
    console.log(`### ${item.name}`);
    console.log(`Prompt: ${prompt}\n`);
  }
}

function generatePrompt(name: string, category: string): string {
  const baseStyle = "Professional food photography, overhead angle, natural lighting, on a dark wooden table with chopsticks, Chinese restaurant style";

  const dishDescriptions: Record<string, string> = {
    "Crab Rangoons (6)": "Golden crispy fried wontons filled with cream cheese and crab, arranged on a plate with sweet chili dipping sauce",
    "Fried Shrimp (6)": "Crispy golden breaded shrimp arranged in a row with cocktail sauce",
    "Marinated Chicken Wings (8)": "Glossy glazed Chinese-style chicken wings with sesame seeds",
    "Teriyaki Chicken Satay (3)": "Grilled chicken skewers with teriyaki glaze and peanut sauce",
    "Vegetable Spring Roll (2)": "Crispy golden vegetable spring rolls cut diagonally showing filling",
    "General Tsao's Chicken": "Crispy orange-glazed chicken pieces with broccoli and steamed rice",
    "Lemon Chicken": "Crispy breaded chicken with bright yellow lemon sauce and lemon slices",
    "Moo Goo Gai Pan": "Sliced chicken breast with mushrooms, snow peas, and white sauce",
    "Salt and Pepper Chicken": "Crispy fried chicken pieces with jalapeños, onions, and salt and pepper seasoning",
    "Shrimp w/ Lobster Sauce": "Large shrimp in creamy white lobster sauce with peas and egg",
    "Spicy Crispy": "Crispy fried meat pieces in spicy red sauce with dried chilies",
    "Chicken Fried Rice": "Fried rice with chicken pieces, egg, peas, and carrots",
    "Beef Fried Rice": "Fried rice with sliced beef, egg, vegetables, and green onions",
    "Vegetable Fried Rice": "Colorful vegetable fried rice with egg, peas, carrots, and corn",
    "Tofu Fried Rice": "Fried rice with cubed tofu, vegetables, and soy sauce",
    "Scallop Fried Rice": "Fried rice with seared scallops, egg, and vegetables",
    "Grilled Chicken": "Grilled chicken breast with grill marks, served with vegetables",
    "Grilled Shrimp": "Grilled jumbo shrimp skewers with herbs and lemon",
    "Udon Noodles": "Thick white udon noodles stir-fried with vegetables",
    "Udon Noodles (Combination)": "Thick udon noodles with shrimp, chicken, and vegetables",
    "Chicken & Corn Soup": "Creamy yellow soup with chicken shreds and corn kernels",
    "Vegetable & Tofu Soup": "Clear broth soup with tofu cubes and vegetables",
    "Coconut Red Curry": "Rich red curry with coconut milk, vegetables, and basil",
    "Lemon Grass Chicken": "Aromatic chicken with lemongrass, Thai basil, and chilies",
    "Almond Stir-Fry": "Stir-fried meat with toasted almonds, celery, and vegetables",
    "Black Bean Sauce Stir-Fry": "Stir-fry with fermented black beans, peppers, and onions",
    "Cashew Stir-Fry": "Stir-fried meat with roasted cashews, celery, and zucchini",
    "Egg Foo Young": "Chinese omelette patties with brown gravy",
    "Hot Garlic Stir-Fry": "Spicy stir-fry with garlic, bamboo shoots, and vegetables",
    "Jalapeno Stir-Fry": "Spicy stir-fry with fresh jalapeños, onions, and bell peppers",
    "Moo-Shu Stir-Fry": "Shredded vegetables with egg and moo-shu pancakes",
    "Orange": "Orange-glazed crispy meat with broccoli and orange zest",
    "Sweet & Sour": "Crispy meat in red sweet and sour sauce with pineapple and peppers",
    "Sichuan Stir-Fry": "Spicy Sichuan-style stir-fry with dried chilies and Sichuan peppercorns",
    "Asparagus Stir-Fry": "Fresh asparagus stir-fried with garlic and light sauce",
    "Baby Bok Choy Stir-Fry": "Tender baby bok choy in garlic sauce",
    "Broccoli Stir-Fry": "Fresh broccoli florets stir-fried in garlic sauce",
    "Eggplant Stir-Fry w/ Hot Garlic Sauce": "Soft eggplant pieces in spicy garlic sauce",
    "Ma-Po Tofu": "Soft tofu cubes in spicy red ma-po sauce with ground meat",
    "Snow Pea Stir-Fry": "Crisp snow peas stir-fried with garlic",
  };

  const desc = dishDescriptions[name] || `${name} Chinese dish, beautifully plated`;
  return `${desc}. ${baseStyle}`;
}

main();
