export interface HomeHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface HomeIntro {
  heading: string;
  body: string;
  supportingNote?: string;
}

export interface HomeCollectionSection {
  sectionTitle: string;
  sectionIntro: string;
  slugs: string[];
}

export interface HomeWritingGroup {
  label: string;
  kind: 'case-study' | 'method';
  slugs: string[];
}

export interface HomeWritingSection {
  sectionTitle: string;
  sectionIntro: string;
  groups: HomeWritingGroup[];
}

export interface HomeResumeCta {
  heading: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface HomeContent {
  hero: HomeHero;
  intro: HomeIntro;
  featuredProjects: HomeCollectionSection;
  selectedWriting: HomeWritingSection;
  featuredTools: HomeCollectionSection;
  resumeCta: HomeResumeCta;
}

export const homeContent: HomeContent = {
  hero: {
    eyebrow: 'TODO: hero eyebrow',
    title: 'TODO: hero headline',
    subtitle:
      'TODO: one-sentence positioning that points to projects, writing, and proof-of-work without locking the final copy yet.',
    primaryCtaLabel: 'TODO: browse projects',
    primaryCtaHref: '/projects',
    secondaryCtaLabel: 'TODO: read writing',
    secondaryCtaHref: '/writing',
  },
  intro: {
    heading: 'TODO: intro heading',
    body:
      'TODO: brief site orientation that explains this portfolio will collect projects, writing, tools, and a direct resume path without turning into a biography block.',
    supportingNote:
      'TODO: optional supporting note that nudges visitors toward the strongest next click while the final content is still pending.',
  },
  featuredProjects: {
    sectionTitle: 'TODO: featured projects title',
    sectionIntro:
      'TODO: short section intro that frames these cards as the fastest build-oriented proof on the homepage.',
    slugs: [
      'microscopy-benchmark-pipeline',
      'architecture-diagram-composer',
      'experiment-reproducibility-framework',
    ],
  },
  selectedWriting: {
    sectionTitle: 'TODO: selected writing title',
    sectionIntro:
      'TODO: short section intro that separates project-specific case studies from reusable engineering methods.',
    groups: [
      {
        label: 'Case Studies',
        kind: 'case-study',
        slugs: ['bsccm-first-baseline', 'future-case-study-placeholder'],
      },
      {
        label: 'Methods',
        kind: 'method',
        slugs: ['reproducible-experiment-stack', 'experiment-observability'],
      },
    ],
  },
  featuredTools: {
    sectionTitle: 'TODO: featured tools title',
    sectionIntro:
      'TODO: short section intro that frames these as interactive artifacts distinct from projects and writing.',
    slugs: ['procedural-architecture-composer', 'future-tool-placeholder'],
  },
  resumeCta: {
    heading: 'TODO: resume CTA heading',
    body:
      'TODO: resume CTA body that keeps the closing action direct, recruiter-friendly, and structurally separate from the footer.',
    primaryCtaLabel: 'TODO: view resume',
    primaryCtaHref: '/resume',
    secondaryCtaLabel: 'TODO: download resume',
    secondaryCtaHref: '/resume#download',
  },
};
