import { defineCollection, reference, z } from 'astro:content';

const linkField = z.string().min(1);
const writingKind = z.enum(['case-study', 'method']);
const projectReferences = z.array(reference('projects')).default([]);
const writingReferences = z.array(reference('writing')).default([]);
const toolReferences = z.array(reference('tools')).default([]);

const projectLinks = z.object({
  code: linkField.optional(),
  demo: linkField.optional(),
});

const toolLinks = z.object({
  open: linkField.optional(),
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
  schema: z.discriminatedUnion('template', [
    z.object({
      template: z.literal('about'),
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
    }),
    z.object({
      template: z.literal('home'),
      title: z.string(),
      description: z.string(),
      hero: z.object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        primaryCtaLabel: z.string(),
        primaryCtaHref: z.string(),
        secondaryCtaLabel: z.string(),
        secondaryCtaHref: z.string(),
      }),
      intro: z.object({
        heading: z.string(),
        body: z.string(),
        supportingNote: z.string().optional(),
      }),
      featuredProjects: z.object({
        sectionTitle: z.string(),
        sectionIntro: z.string(),
      }),
      selectedWriting: z.object({
        sectionTitle: z.string(),
        sectionIntro: z.string(),
        caseStudiesLabel: z.string(),
        methodsLabel: z.string(),
      }),
      featuredTools: z.object({
        sectionTitle: z.string(),
        sectionIntro: z.string(),
      }),
      resumeCta: z.object({
        heading: z.string(),
        body: z.string(),
        primaryCtaLabel: z.string(),
        primaryCtaHref: z.string(),
        secondaryCtaLabel: z.string(),
        secondaryCtaHref: z.string(),
      }),
    }),
    z.object({
      template: z.literal('projects'),
      title: z.string(),
      description: z.string(),
      eyebrow: z.string(),
      featuredSection: z.object({
        title: z.string(),
        intro: z.string(),
      }),
      allSection: z.object({
        title: z.string(),
        intro: z.string(),
        emptyState: z.string(),
      }),
    }),
    z.object({
      template: z.literal('writing'),
      title: z.string(),
      description: z.string(),
      eyebrow: z.string(),
      caseStudies: z.object({
        title: z.string(),
        intro: z.string(),
        emptyState: z.string(),
      }),
      methods: z.object({
        title: z.string(),
        intro: z.string(),
        emptyState: z.string(),
      }),
    }),
    z.object({
      template: z.literal('tools'),
      title: z.string(),
      description: z.string(),
      eyebrow: z.string(),
      library: z.object({
        title: z.string(),
        intro: z.string(),
        emptyState: z.string(),
      }),
    }),
    z.object({
      template: z.literal('resume'),
      title: z.string(),
      description: z.string(),
      eyebrow: z.string(),
      pdf: z.object({
        path: z.string(),
        documentTitle: z.string(),
        summary: z.string(),
        downloadLabel: z.string(),
        openLabel: z.string(),
        readyStatusLabel: z.string(),
        pendingStatusLabel: z.string(),
        contractLabel: z.string(),
        previewTitle: z.string(),
        previewIntro: z.string(),
        fallbackTitle: z.string(),
        fallbackSummary: z.string(),
      }),
      highlights: z.object({
        title: z.string(),
        items: z.array(z.string()).default([]),
      }),
    }),
  ]),
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
    sortOrder: z.number().int(),
    links: projectLinks,
    resultSnapshot: projectResultSnapshot,
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    kind: writingKind,
    status: z.string(),
    tags: z.array(z.string().min(1)).default([]),
    sortOrder: z.number().int(),
    relatedProjects: projectReferences,
  }),
});

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.string(),
    sortOrder: z.number().int(),
    previewImage: z.string().min(1).optional(),
    links: toolLinks,
    tags: z.array(z.string().min(1)).default([]),
    relatedProjects: projectReferences,
  }),
});

const curation = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('surface', [
    z.object({
      surface: z.literal('home'),
      featuredProjects: projectReferences,
      featuredWriting: z.object({
        caseStudies: writingReferences,
        methods: writingReferences,
      }),
      featuredTools: toolReferences,
    }),
    z.object({
      surface: z.literal('projects'),
      featuredProjects: projectReferences,
    }),
    z.object({
      surface: z.literal('writing'),
      caseStudies: writingReferences,
      methods: writingReferences,
    }),
  ]),
});

export const collections = {
  pages,
  projects,
  writing,
  tools,
  curation,
};
