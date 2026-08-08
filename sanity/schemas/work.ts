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
      description:
        "Used in the address bar when the painting is opened. Generated from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "The painting itself. Upload the largest version you have — it is resized automatically.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Position in the gallery, lowest first. Leave gaps (10, 20, 30) so paintings can be slotted in between later.",
    }),
    defineField({
      name: "medium",
      title: "Medium",
      type: "string",
      description: 'For example "Oil on canvas".',
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "string",
      description: 'For example "31.5 x 31.5 in".',
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "string",
      description:
        'Shown as written, so include the currency — for example "$1,200". Leave empty to hide the price and the Buy button.',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "buyUrl",
      title: "Saatchi listing",
      type: "url",
      description:
        "Link to this painting on Saatchi Art. Falls back to the profile page if empty.",
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
    select: { title: "title", subtitle: "medium", media: "image" },
  },
});
