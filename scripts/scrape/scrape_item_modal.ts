import type { Page } from "playwright";
import { parseMoney, parsePriceDelta } from "./utils/parseMoney.js";

export type ModifierOption = { label: string; priceDelta: number; inputType: "radio" | "checkbox" };
export type ModifierGroup = { title: string; selectionType: "single" | "multi"; options: ModifierOption[] };

export type ItemModalExtract = {
  modalItemName: string | null;
  basePrice: number | null;
  likes: number | null;
  modifierGroups: ModifierGroup[];
  hasSpecialInstructions: boolean;
  hasQty: boolean;
  imageUrls: string[];
};

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

export async function extractFromModal(page: Page): Promise<ItemModalExtract> {
  const root = page.locator('.ui-dialog:has-text("Add item to cart")').first();
  const hasRoot = await root.count().then(c => c > 0).catch(() => false);

  const container = hasRoot ? root : page.locator("body");
  await container.waitFor({ state: "visible", timeout: 10_000 }).catch(() => null);

  const containerText = norm(await container.innerText().catch(() => ""));

  const titleCandidates = container.locator("h1, h2, h3, .item-title, .ui-dialog-title");
  const modalItemName = await titleCandidates.first().innerText().then(norm).catch(() => null);

  const basePrice = parseMoney(containerText);

  let likes: number | null = null;
  const likeMatch = containerText.match(/([0-9]{1,9})\s+people\s+like\s+this/i);
  if (likeMatch) likes = Number(likeMatch[1]);

  const inputs = container.locator('input[type="radio"], input[type="checkbox"]');
  const inputCount = await inputs.count();
  const groupsMap = new Map<string, ModifierOption[]>();

  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const inputType = (await input.getAttribute("type").catch(() => "radio")) as "radio" | "checkbox";

    let labelText =
      (await input.locator("xpath=following-sibling::*[1]").innerText().catch(() => null)) ||
      (await input.locator("xpath=ancestor::*[self::label or self::div or self::td][1]").innerText().catch(() => null));

    if (!labelText) continue;
    labelText = norm(labelText);

    const priceDelta = parsePriceDelta(labelText);
    const groupTitle = await input.locator("xpath=preceding::*[self::h1 or self::h2 or self::h3 or self::strong][1]")
      .innerText().then(norm).catch(() => "Options");

    const key = groupTitle || "Options";
    const arr = groupsMap.get(key) ?? [];
    arr.push({ label: labelText, priceDelta, inputType });
    groupsMap.set(key, arr);
  }

  const modifierGroups: ModifierGroup[] = [];
  for (const [title, options] of groupsMap.entries()) {
    const selectionType = options.some(o => o.inputType === "checkbox") ? "multi" : "single";
    modifierGroups.push({ title, selectionType, options });
  }

  const hasSpecialInstructions = /special instructions/i.test(containerText);
  const hasQty = /qty/i.test(containerText);

  const imgs = container.locator("img");
  const imgCount = await imgs.count();
  const imageUrls: string[] = [];
  for (let i = 0; i < imgCount; i++) {
    const src = await imgs.nth(i).getAttribute("src").catch(() => null);
    if (src && !imageUrls.includes(src)) imageUrls.push(src);
  }

  return { modalItemName, basePrice, likes, modifierGroups, hasSpecialInstructions, hasQty, imageUrls };
}
