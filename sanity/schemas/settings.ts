import { defineField, defineType } from "sanity";

/**
 * Contact details and the social links in the footer. A singleton, like
 * About.
 *
 * Each social row carries a list of handles rather than a single one,
 * because Jewelry has two — and the footer lays out one link per handle.
 */
export const settings = defineType({
  name: "settings",
  title: "Contact & social",
  type: "document",
  fields: [
    defineField({
      name: "note",
      title: "Intro line",
      type: "string",
      description: 'Sits above the email — "For inquiries, commissions…".',
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      of: [
        defineField({
          name: "group",
          title: "Group",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'The grey heading — "Instagram", "Jewelry".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "handles",
              title: "Handles",
              type: "array",
              of: [
                defineField({
                  name: "handle",
                  type: "object",
                  fields: [
                    defineField({
                      name: "handle",
                      title: "Handle",
                      type: "string",
                      description:
                        'Shown as written — "@koiavalera", or a name like "Saatchi Art".',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "href",
                      title: "Link",
                      type: "url",
                      description:
                        "Leave empty for an Instagram handle and the address is worked out from it. Required for anything else.",
                    }),
                  ],
                  preview: {
                    select: { title: "handle", subtitle: "href" },
                  },
                }),
              ],
              validation: (rule) => rule.min(1),
            }),
          ],
          preview: {
            select: { title: "label", handles: "handles" },
            prepare: ({ title, handles }) => ({
              title,
              subtitle: (handles as { handle?: string }[] | undefined)
                ?.map((entry) => entry.handle)
                .join(", "),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Contact & social" }),
  },
});
