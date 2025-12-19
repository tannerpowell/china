import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

const GALLERY_DIR = path.resolve(process.cwd(), "apps/web/public/gallery");

interface MenuItemDoc {
  _id: string;
  name: string;
  slug: string | null;
  category: { _ref: string };
  images?: { _type: string; asset: { _type: string; _ref: string } }[];
}

async function uploadImage(localPath: string) {
  const stream = fs.createReadStream(localPath);
  const filename = path.basename(localPath);
  return sanity.assets.upload("image", stream, { filename });
}

function extractItemSlugFromFilename(filename: string): string | null {
  // Pattern: {category}--{item-slug}__hero_4x3.jpg or __square_1x1.jpg
  // Skip category images that start with _category--
  if (filename.startsWith("_category--")) return null;

  const match = filename.match(/^.+?--(.+?)__(hero|square)/);
  return match ? match[1] : null;
}

async function main() {
  // Check if gallery directory exists
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error(`Gallery directory not found: ${GALLERY_DIR}`);
    console.error("Please ensure the gallery images are in place before running this script.");
    process.exit(1);
  }

  // Get all menu items from Sanity
  const items = await sanity.fetch<MenuItemDoc[]>(`*[_type == "menuItem"] { _id, name, "slug": slug.current, category }`);
  console.log(`Found ${items.length} menu items in Sanity`);

  // Create a map of slug -> item for quick lookup
  const slugToItem = new Map<string, MenuItemDoc>();
  for (const item of items) {
    if (item.slug) {
      slugToItem.set(item.slug, item);
    }
  }

  // Get all gallery images
  const files = fs.readdirSync(GALLERY_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  console.log(`Found ${files.length} images in gallery`);

  // Group images by item slug
  const imagesBySlug = new Map<string, string[]>();
  for (const file of files) {
    const slug = extractItemSlugFromFilename(file);
    if (slug) {
      const existing = imagesBySlug.get(slug) || [];
      existing.push(file);
      imagesBySlug.set(slug, existing);
    }
  }

  console.log(`Found images for ${imagesBySlug.size} different items`);

  let uploaded = 0;
  let matched = 0;
  let uploadFailed = 0;
  let patchFailed = 0;

  for (const [slug, imageFiles] of imagesBySlug) {
    let item = slugToItem.get(slug);
    if (!item) {
      // Try partial match
      const partialMatch = Array.from(slugToItem.entries()).find(([s]) =>
        s.includes(slug) || slug.includes(s)
      );
      if (partialMatch) {
        console.log(`Partial match: ${slug} -> ${partialMatch[0]}`);
        item = partialMatch[1];
      } else {
        continue;
      }
    }

    matched++;
    console.log(`\nProcessing ${item.name} (${slug}): ${imageFiles.length} images`);

    const uploadedImages: { _type: string; _key: string; asset: { _type: string; _ref: string } }[] = [];

    for (const imageFile of imageFiles) {
      const localPath = path.join(GALLERY_DIR, imageFile);
      try {
        console.log(`  Uploading ${imageFile}...`);
        const asset = await uploadImage(localPath);
        uploadedImages.push({
          _type: "image",
          _key: `img_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          asset: { _type: "reference", _ref: asset._id }
        });
        uploaded++;
      } catch (err) {
        console.error(`  Failed to upload ${imageFile}:`, err);
        uploadFailed++;
      }
    }

    if (uploadedImages.length > 0) {
      try {
        await sanity.patch(item._id).set({ images: uploadedImages }).commit();
        console.log(`  Updated ${item.name} with ${uploadedImages.length} images`);
      } catch (err) {
        console.error(`  Failed to update ${item.name}:`, err);
        patchFailed++;
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Items matched: ${matched}`);
  console.log(`Images uploaded: ${uploaded}`);
  console.log(`Upload failures: ${uploadFailed}`);
  console.log(`Patch failures: ${patchFailed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
