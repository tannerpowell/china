import * as cheerio from "cheerio";
import type { ModifierOption, ModifierGroup } from "../scrape_item_modal.js";

export type PriceOption = {
  /** Source product id of this variant (radio value). */
  pid: number;
  /** Raw label text with the price stripped, e.g. "S" or "Shrimp". */
  label: string;
  /** Full variant price in dollars (NOT a delta — the pricelist IS the price). */
  price: number;
  /** Whether the source markup pre-selects this option. */
  checked: boolean;
};

export type ModalExtract = {
  modalItemName: string | null;
  basePrice: number | null;
  likes: number | null;
  modifierGroups: ModifierGroup[];
  /** Size/variant radios from div.pricelist (input[name="price"]). */
  priceOptions: PriceOption[];
  /** Heading above the pricelist, e.g. "Choose your dish and size". */
  priceOptionsTitle: string | null;
  hasSpecialInstructions: boolean;
  hasQty: boolean;
  imageUrls: string[];
};

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Parse the legacy addtocart modal HTML
 * (chinaislandasiangrill.com/order/?type=addtocart&mid=…).
 *
 * Three pricing shapes exist on this menu template:
 *   1. .baseprice — a single flat price (most items)
 *   2. div.pricelist — required size/variant radios whose parenthesized
 *      values are the FULL item price (soups, steamed rice, lettuce wraps).
 *      Previously missed entirely → those items imported with no price.
 *   3. .sideOrderList / input[name="spicy"] — real modifier groups.
 */
export function parseApiResponse(html: string): ModalExtract {
  const $ = cheerio.load(html);

  // Item name from h6.t
  let modalItemName = $("h6.t").first().text().trim();
  modalItemName = modalItemName.replace(/\s*$/, "").trim();

  // Base price
  let basePrice: number | null = null;
  const priceText = $(".baseprice").text();
  const priceMatch = priceText.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  if (priceMatch) basePrice = Number(priceMatch[1]);

  // Likes
  let likes: number | null = null;
  const likeText = $("p").text();
  const likeMatch = likeText.match(/([0-9,]+)\s+people\s+like/i);
  if (likeMatch) likes = Number(likeMatch[1].replace(/,/g, ""));

  // Pricelist radios: input[name="price"] inside .pricelist li.
  // Label markup: <label for="priceN"><input …>S: ($3.25)</label>
  const priceOptions: PriceOption[] = [];
  $('.pricelist input[name="price"]').each((_, el) => {
    const $el = $(el);
    const pid = Number($el.attr("value"));
    const labelText = norm($el.closest("label").text());
    const priceMatch = labelText.match(/\(\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*\)/);
    if (!pid || !priceMatch) return;
    const label = norm(labelText.replace(priceMatch[0], "").replace(/[:\s]+$/, ""));
    priceOptions.push({
      pid,
      label: label || `Option ${priceOptions.length + 1}`,
      price: Number(priceMatch[1]),
      checked: $el.is("[checked]") || $el.attr("checked") !== undefined,
    });
  });

  // Heading above the pricelist (e.g. "Choose your dish and size")
  let priceOptionsTitle: string | null = null;
  if (priceOptions.length > 0) {
    const heading = $(".pricelist").prevAll("strong.t").first().text();
    priceOptionsTitle = norm(heading) || null;
  }

  // Modifier groups
  const modifierGroups: ModifierGroup[] = [];

  // Spicy options (special case - directly under choosemain)
  const spicyOptions: ModifierOption[] = [];
  $('input[name="spicy"]').each((_, el) => {
    const $el = $(el);
    const $label = $el.closest("label");
    const label = $label.text().trim();
    if (label) {
      spicyOptions.push({ label, priceDelta: 0, inputType: "radio" });
    }
  });
  if (spicyOptions.length > 0) {
    const spicyTitle = $("strong.t").first().text().trim() || "How Spicy?";
    modifierGroups.push({ title: spicyTitle, selectionType: "single", options: spicyOptions });
  }

  // Side order groups
  $(".sideOrderList").each((_, group) => {
    const $group = $(group);
    const title = $group.find("h3").first().text().trim() || "Options";
    const options: ModifierOption[] = [];

    $group.find("input[type='radio'], input[type='checkbox']").each((_, input) => {
      const $input = $(input);
      const $label = $input.closest("label");
      const inputType = ($input.attr("type") || "radio") as "radio" | "checkbox";

      // Get full label text and parse price delta
      let labelText = $label.text().trim();
      let priceDelta = 0;
      const deltaMatch = labelText.match(/\(\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*\)/);
      if (deltaMatch) {
        priceDelta = Number(deltaMatch[1]);
        labelText = labelText.replace(deltaMatch[0], "").replace(/\s*:\s*$/, "").trim();
      }

      if (labelText) {
        options.push({ label: labelText, priceDelta, inputType });
      }
    });

    if (options.length > 0) {
      const selectionType = options.some(o => o.inputType === "checkbox") ? "multi" : "single";
      modifierGroups.push({ title, selectionType, options });
    }
  });

  const hasSpecialInstructions = html.includes("Special Instructions");
  const hasQty = html.includes("QTY:");

  return {
    modalItemName,
    basePrice,
    likes,
    modifierGroups,
    priceOptions,
    priceOptionsTitle,
    hasSpecialInstructions,
    hasQty,
    imageUrls: [] as string[],
  };
}
