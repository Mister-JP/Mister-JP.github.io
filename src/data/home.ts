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

export interface HomeProjectItem {
  title: string;
  summary: string;
  status: string;
  tags: string[];
  caseStudyLabel: string;
  caseStudyHref: string;
  codeLabel: string;
  codeHref: string;
  demoLabel?: string;
  demoHref?: string;
}

export interface HomeProjects {
  sectionTitle: string;
  sectionIntro: string;
  items: HomeProjectItem[];
}

export interface HomeWritingItem {
  title: string;
  summary: string;
  href: string;
  kind: string;
}

export interface HomeWritingGroup {
  label: string;
  items: HomeWritingItem[];
}

export interface HomeWriting {
  sectionTitle: string;
  sectionIntro: string;
  groups: HomeWritingGroup[];
}

export interface HomeToolItem {
  title: string;
  summary: string;
  status: string;
  openLabel: string;
  href: string;
  readMoreLabel: string;
  readMoreHref: string;
  codeLabel: string;
  codeHref: string;
}

export interface HomeTools {
  sectionTitle: string;
  sectionIntro: string;
  items: HomeToolItem[];
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
  featuredProjects: HomeProjects;
  selectedWriting: HomeWriting;
  featuredTools: HomeTools;
  resumeCta: HomeResumeCta;
}

export const homeContent: HomeContent = {
  hero: {
    eyebrow: 'TODO: hero eyebrow',
    title: 'TODO: hero headline',
    subtitle: 'TODO: one-sentence positioning that points to projects, writing, and proof-of-work without locking the final copy yet.',
    primaryCtaLabel: 'TODO: browse projects',
    primaryCtaHref: '/projects',
    secondaryCtaLabel: 'TODO: read writing',
    secondaryCtaHref: '/writing',
  },
  intro: {
    heading: 'TODO: intro heading',
    body: 'TODO: brief site orientation that explains this portfolio will collect projects, writing, tools, and a direct resume path without turning into a biography block.',
    supportingNote: 'TODO: optional supporting note that nudges visitors toward the strongest next click while the final content is still pending.',
  },
  featuredProjects: {
    sectionTitle: 'TODO: featured projects title',
    sectionIntro: 'TODO: short section intro that frames these cards as the fastest build-oriented proof on the homepage.',
    items: [
      {
        title: 'TODO: featured project title',
        summary: 'TODO: featured project summary that is long enough to test spacing, card rhythm, and scanability without pretending the project details are final.',
        status: 'TODO: project status',
        tags: ['TODO: project tag', 'TODO: stack tag', 'TODO: proof tag'],
        caseStudyLabel: 'TODO: case study',
        caseStudyHref: '/writing',
        codeLabel: 'TODO: code link',
        codeHref: '/projects',
        demoLabel: 'TODO: demo link',
        demoHref: '/tools',
      },
      {
        title: 'TODO: featured project title',
        summary: 'TODO: featured project summary that leaves room for later real content while proving the card layout can handle multi-line placeholder copy.',
        status: 'TODO: project status',
        tags: ['TODO: project tag', 'TODO: scope tag'],
        caseStudyLabel: 'TODO: case study',
        caseStudyHref: '/writing',
        codeLabel: 'TODO: code link',
        codeHref: '/projects',
      },
      {
        title: 'TODO: featured project title',
        summary: 'TODO: featured project summary that keeps the homepage shell feeling complete even before the real outcomes and links are added.',
        status: 'TODO: project status',
        tags: ['TODO: project tag', 'TODO: role tag', 'TODO: tool tag'],
        caseStudyLabel: 'TODO: case study',
        caseStudyHref: '/writing',
        codeLabel: 'TODO: code link',
        codeHref: '/projects',
        demoLabel: 'TODO: demo link',
        demoHref: '/tools',
      },
    ],
  },
  selectedWriting: {
    sectionTitle: 'TODO: selected writing title',
    sectionIntro: 'TODO: short section intro that separates project-specific case studies from reusable engineering methods.',
    groups: [
      {
        label: 'TODO: Case Studies',
        items: [
          {
            title: 'TODO: case study title',
            summary: 'TODO: case study summary that shows this lane is for project decisions, tradeoffs, and outcomes rather than general advice.',
            href: '/writing',
            kind: 'TODO: case study kind',
          },
          {
            title: 'TODO: case study title',
            summary: 'TODO: case study summary that keeps this group visually compact while still proving the list can scale later.',
            href: '/writing',
            kind: 'TODO: case study kind',
          },
        ],
      },
      {
        label: 'TODO: Methods',
        items: [
          {
            title: 'TODO: methods article title',
            summary: 'TODO: methods article summary that signals reusable engineering thinking rather than one project retrospective.',
            href: '/writing',
            kind: 'TODO: method kind',
          },
          {
            title: 'TODO: methods article title',
            summary: 'TODO: methods article summary that tests grouped list rhythm without turning this section into a blog archive.',
            href: '/writing',
            kind: 'TODO: method kind',
          },
        ],
      },
    ],
  },
  featuredTools: {
    sectionTitle: 'TODO: featured tools title',
    sectionIntro: 'TODO: short section intro that frames these as interactive artifacts distinct from projects and writing.',
    items: [
      {
        title: 'TODO: featured tool title',
        summary: 'TODO: tool summary that explains the practical purpose of the utility without requiring screenshots or final copy.',
        status: 'TODO: tool status',
        openLabel: 'TODO: open tool',
        href: '/tools',
        readMoreLabel: 'TODO: read more',
        readMoreHref: '/writing',
        codeLabel: 'TODO: code link',
        codeHref: '/projects',
      },
      {
        title: 'TODO: featured tool title',
        summary: 'TODO: tool summary that proves this section can stay compact, useful, and clearly separate from the project cards above.',
        status: 'TODO: tool status',
        openLabel: 'TODO: open tool',
        href: '/tools',
        readMoreLabel: 'TODO: read more',
        readMoreHref: '/writing',
        codeLabel: 'TODO: code link',
        codeHref: '/projects',
      },
    ],
  },
  resumeCta: {
    heading: 'TODO: resume CTA heading',
    body: 'TODO: resume CTA body that keeps the closing action direct, recruiter-friendly, and structurally separate from the footer.',
    primaryCtaLabel: 'TODO: view resume',
    primaryCtaHref: '/resume',
    secondaryCtaLabel: 'TODO: download resume',
    secondaryCtaHref: '/resume#download',
  },
};
