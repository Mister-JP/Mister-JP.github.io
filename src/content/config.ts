import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    intro: z.object({
      heading: z.string(),
      summary: z.string(),
      details: z.array(z.string()).default([]),
    }),
    background: z.object({
      heading: z.string(),
      paragraphs: z.array(z.string()).min(1),
    }),
    work: z.object({
      heading: z.string(),
      paragraphs: z.array(z.string()).min(1),
      highlights: z.array(z.string()).default([]),
    }),
    focus: z.object({
      heading: z.string(),
      summary: z.string(),
      details: z.array(z.string()).default([]),
    }),
    contact: z.object({
      heading: z.string(),
      intro: z.string(),
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
            note: z.string().optional(),
            ctaLabel: z.string().optional(),
          }),
        )
        .default([]),
    }),
    authorNotes: z.array(z.string()).default([]),
  }),
});

export const collections = {
  pages,
};
