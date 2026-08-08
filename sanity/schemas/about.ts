import { defineField, defineType } from "sanity";

/**
 * The About section. A singleton — there is only ever one of these, which
 * the Studio's structure enforces by opening the document directly rather
 * than showing a list.
 */
export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Pull quote",
      type: "text",
      rows: 3,
      description:
        "The large heading that opens the section. Quotation marks are added by the site.",
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Biography",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      description:
        "One entry per paragraph. Add, reorder or remove them freely.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "About" }),
  },
});
