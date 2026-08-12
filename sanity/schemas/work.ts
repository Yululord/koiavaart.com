import { defineField, defineType } from "sanity";

/**
 * One painting. Mirrors the `Work` type the site already renders, so the
 * only thing that changed when this replaced the hardcoded array was where
 * the values come from.
 *
 * Every field but the image and the title is optional: the site simply does
 * not render what is not set, which is how the placeholder copy could be
 * dropped without leaving gaps.
 */
export const work = defineType({
  name: "work",
  title: "Painting",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      // Hidden: it is derived from the title and only used in the address
      // bar. The site falls back to slugifying the title if it is unset, so
      // nothing breaks when a painting is added without one.
      hidden: true,
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description:
        "The first is the one the gallery shows; drag to reorder. Add more — a detail, the work framed or on a wall — and they can be stepped through on the painting's own page. Upload the largest versions you have; they are resized automatically.",
      options: { layout: "grid" },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      // Hidden: the gallery falls back to the date a painting was added, so
      // new work lands at the end without anyone setting a number.
      hidden: true,
    }),
    defineField({
      name: "medium",
      title: "Materials",
      type: "string",
      description: 'What it is painted with and on — "Oil on canvas".',
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "string",
      description: 'For example "31.5 x 31.5 in".',
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      description: "The year the painting was made.",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      description:
        "Digits only — the site adds the € itself, so every painting reads the same way. Leave empty to hide the price and the Buy button.",
      placeholder: "1600 (€)",
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description:
        "Sold paintings stay in the gallery and are marked as sold. Available ones say nothing — the price speaks for itself.",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Sold", value: "sold" },
        ],
        layout: "radio",
      },
      initialValue: "available",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
  ],
  orderings: [
    {
      name: "orderAsc",
      title: "Gallery order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "medium", media: "images.0" },
  },
});
