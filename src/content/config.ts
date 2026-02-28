import { defineCollection, reference, z } from 'astro:content';

const linkField = z.string().min(1);

const projectLinks = z.object({
  caseStudy: linkField.optional(),
  code: linkField.optional(),
  demo: linkField.optional(),
});

const writingLinks = z.object({
  read: linkField,
  project: linkField.optional(),
});

const toolLinks = z.object({
  open: linkField.optional(),
  readMore: linkField.optional(),
  code: linkField.optional(),
});

const projectResultSnapshot = z.object({
  label: z.string().min(1),
  caption: z.string().min(1),
  image: linkField.optional(),
  alt: z.string().min(1).optional(),
});

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

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    whyItMatters: z.string().min(1),
    status: z.string(),
    currentMilestone: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    featured: z.boolean(),
    sortOrder: z.number().int(),
    links: projectLinks,
    relatedWriting: z.array(reference('writing')),
    relatedTools: z.array(reference('tools')),
    resultSnapshot: projectResultSnapshot,
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    kind: z.enum(['case-study', 'method']),
    status: z.string(),
    tags: z.array(z.string().min(1)).default([]),
    featured: z.boolean().default(false),
    sortOrder: z.number().int(),
    links: writingLinks,
    relatedProject: z.string().min(1).optional(),
  }),
});

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.string(),
    sortOrder: z.number().int(),
    featured: z.boolean().default(false),
    previewImage: z.string().min(1).optional(),
    links: toolLinks,
    tags: z.array(z.string().min(1)).default([]),
  }),
});

export const collections = {
  pages,
  projects,
  writing,
  tools,
};
