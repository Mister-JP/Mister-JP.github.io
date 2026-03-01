import { getEntries, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import {
  getProjectHref,
  getToolHref,
  getWritingHref,
} from './content-paths';
import { getRelatedProjectsForEntry } from './content-relations';

type ProjectEntry = CollectionEntry<'projects'>;
type ToolEntry = CollectionEntry<'tools'>;
type WritingEntry = CollectionEntry<'writing'>;
type HomePageData = Extract<CollectionEntry<'pages'>['data'], { template: 'home' }>;
type HomeCurationData = Extract<
  CollectionEntry<'curation'>['data'],
  { surface: 'home' }
>;
type LinkedProject = {
  href: string;
  title: string;
};

type HomeProjectCardItem = {
  slug: ProjectEntry['slug'];
  featured: true;
} & Pick<
  ProjectEntry['data'],
  'title' | 'summary' | 'status' | 'tags' | 'links'
>;

type HomeToolCardItem = Pick<
  ToolEntry['data'],
  'title' | 'summary' | 'status' | 'links' | 'tags' | 'previewImage'
> & {
  detailHref: string;
  featured: true;
};

type HomeWritingCardItem = Pick<
  WritingEntry['data'],
  'title' | 'summary' | 'kind' | 'status' | 'tags'
> & {
  href: string;
  relatedProjects: LinkedProject[];
};

export interface HomePageContent {
  page: Pick<HomePageData, 'title' | 'description'>;
  hero: HomePageData['hero'];
  intro: HomePageData['intro'];
  featuredProjects: {
    sectionTitle: HomePageData['featuredProjects']['sectionTitle'];
    sectionIntro: HomePageData['featuredProjects']['sectionIntro'];
    items: HomeProjectCardItem[];
  };
  selectedWriting: {
    sectionTitle: HomePageData['selectedWriting']['sectionTitle'];
    sectionIntro: HomePageData['selectedWriting']['sectionIntro'];
    groups: Array<{
      label: string;
      items: HomeWritingCardItem[];
    }>;
  };
  featuredTools: {
    sectionTitle: HomePageData['featuredTools']['sectionTitle'];
    sectionIntro: HomePageData['featuredTools']['sectionIntro'];
    items: HomeToolCardItem[];
  };
  resumeCta: HomePageData['resumeCta'];
}

export async function getHomePageContent(): Promise<HomePageContent> {
  const [homeEntry, curationEntry] = await Promise.all([
    getEntry('pages', 'home'),
    getEntry('curation', 'home'),
  ]);

  if (!homeEntry) {
    throw new Error('Missing content entry: src/content/pages/home.md');
  }

  if (homeEntry.data.template !== 'home') {
    throw new Error('The home page entry must use the "home" template.');
  }

  if (!curationEntry) {
    throw new Error('Missing content entry: src/content/curation/home.md');
  }

  if (curationEntry.data.surface !== 'home') {
    throw new Error('The home curation entry must use the "home" surface.');
  }

  const pageCopy = homeEntry.data;
  const curation = curationEntry.data as HomeCurationData;
  const [
    featuredProjectEntries,
    featuredToolEntries,
    featuredCaseStudyEntries,
    featuredMethodEntries,
  ] = await Promise.all([
    getEntries(curation.featuredProjects),
    getEntries(curation.featuredTools),
    getEntries(curation.featuredWriting.caseStudies),
    getEntries(curation.featuredWriting.methods),
  ]);

  const buildWritingGroupItems = async (
    entries: WritingEntry[],
    expectedKind: WritingEntry['data']['kind'],
    label: string,
  ): Promise<HomeWritingCardItem[]> => {
    entries.forEach((entry) => {
      if (entry.data.kind !== expectedKind) {
        throw new Error(
          `Home writing group "${label}" includes "${entry.slug}", which is ${entry.data.kind}.`,
        );
      }
    });

    return Promise.all(
      entries.map(async (entry) => {
        const relatedProjects = await getRelatedProjectsForEntry(entry);

        return {
          title: entry.data.title,
          summary: entry.data.summary,
          kind: entry.data.kind,
          status: entry.data.status,
          tags: entry.data.tags,
          href: getWritingHref(entry),
          relatedProjects: relatedProjects.map((project) => ({
            href: getProjectHref(project),
            title: project.data.title,
          })),
        };
      }),
    );
  };

  const selectedWritingGroups = [
    {
      label: pageCopy.selectedWriting.caseStudiesLabel,
      items: await buildWritingGroupItems(
        featuredCaseStudyEntries,
        'case-study',
        pageCopy.selectedWriting.caseStudiesLabel,
      ),
    },
    {
      label: pageCopy.selectedWriting.methodsLabel,
      items: await buildWritingGroupItems(
        featuredMethodEntries,
        'method',
        pageCopy.selectedWriting.methodsLabel,
      ),
    },
  ];

  return {
    page: {
      title: pageCopy.title,
      description: pageCopy.description,
    },
    hero: pageCopy.hero,
    intro: pageCopy.intro,
    featuredProjects: {
      sectionTitle: pageCopy.featuredProjects.sectionTitle,
      sectionIntro: pageCopy.featuredProjects.sectionIntro,
      items: featuredProjectEntries.map((entry) => ({
        slug: entry.slug,
        title: entry.data.title,
        summary: entry.data.summary,
        status: entry.data.status,
        tags: entry.data.tags,
        links: entry.data.links,
        featured: true,
      })),
    },
    selectedWriting: {
      sectionTitle: pageCopy.selectedWriting.sectionTitle,
      sectionIntro: pageCopy.selectedWriting.sectionIntro,
      groups: selectedWritingGroups,
    },
    featuredTools: {
      sectionTitle: pageCopy.featuredTools.sectionTitle,
      sectionIntro: pageCopy.featuredTools.sectionIntro,
      items: featuredToolEntries.map((entry) => ({
        title: entry.data.title,
        summary: entry.data.summary,
        status: entry.data.status,
        links: entry.data.links,
        tags: entry.data.tags,
        previewImage: entry.data.previewImage,
        detailHref: getToolHref(entry),
        featured: true,
      })),
    },
    resumeCta: pageCopy.resumeCta,
  };
}
