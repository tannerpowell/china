import { defineField, defineType } from "sanity";

// Schemas mirror the documents written by scripts/sanity/import/*.
// Field names must stay in sync with apps/web/src/lib/menu-sanity.ts.

export const menuCategory = defineType({
  name: "menuCategory",
  title: "Menu Category",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number", initialValue: 10 }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const modifierGroup = defineType({
  name: "modifierGroup",
  title: "Modifier Group",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "selectionType",
      title: "Selection type",
      type: "string",
      options: { list: ["single", "multi"], layout: "radio" },
      initialValue: "single",
    }),
    defineField({ name: "min", title: "Min selections", type: "number", initialValue: 0 }),
    defineField({ name: "max", title: "Max selections", type: "number", initialValue: 1 }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [
        defineField({
          name: "modifierOption",
          title: "Option",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "priceDelta", title: "Price delta ($)", type: "number", initialValue: 0 }),
          ],
          preview: { select: { title: "label", subtitle: "priceDelta" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "title", subtitle: "selectionType" } },
});

export const menuItem = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "menuCategory" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "basePrice", title: "Base price ($)", type: "number", validation: (r) => r.min(0) }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "object",
      fields: [
        defineField({ name: "spicy", title: "Spicy", type: "boolean", initialValue: false }),
        defineField({ name: "vegetarian", title: "Vegetarian", type: "boolean", initialValue: false }),
        defineField({ name: "popular", title: "Popular", type: "boolean", initialValue: false }),
      ],
    }),
    defineField({
      name: "modifierGroups",
      title: "Modifier groups",
      type: "array",
      of: [{ type: "reference", to: [{ type: "modifierGroup" }] }],
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "likes", title: "Likes (from ordering platform)", type: "number", readOnly: true }),
    defineField({ name: "sourceItemId", title: "Source item ID", type: "number", readOnly: true }),
    defineField({
      name: "order",
      title: "Ordering (managed by sync scripts)",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "provider", title: "Provider", type: "string" }),
        defineField({ name: "cartUrl", title: "Cart URL", type: "url" }),
        defineField({ name: "itemOrderUrl", title: "Item order URL", type: "url" }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category.title", media: "images.0" },
  },
});

export const restaurantSettings = defineType({
  name: "restaurantSettings",
  title: "Restaurant Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Restaurant name", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "address", title: "Address", type: "string" }),
    defineField({ name: "hours", title: "Hours", type: "string" }),
    defineField({ name: "primaryOrderUrl", title: "Primary order URL", type: "url" }),
  ],
});

export const schemaTypes = [menuCategory, modifierGroup, menuItem, restaurantSettings];
