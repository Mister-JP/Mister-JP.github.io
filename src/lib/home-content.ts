import { getEntries, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import {
  getProjectHref,
  getToolHref,
  getWritingHref,
} from './content-paths';
import {
  getProjectFeatureImage,
  getToolFeatureImage,
  getWritingFeatureImage,
} from './feature-images';
import { getRelatedProjectsForEntry } from './content-relations';
import {
  getWritingCategoryMeta,
  normalizeWritingCategory,
} from './writing-categories';

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
  | 'title'
  | 'summary'
  | 'status'
  | 'tags'
  | 'links'
  | 'featureImage'
  | 'currentMilestone'
>;

type HomeToolCardItem = Pick<
  ToolEntry['data'],
  'title' | 'summary' | 'status' | 'links' | 'tags' | 'featureImage'
> & {
  detailHref: string;
  featured: true;
};

type HomeWritingCardItem = Pick<
  WritingEntry['data'],
  'title' | 'summary' | 'category' | 'status' | 'tags' | 'featureImage'
> & {
  href: string;
  relatedProjects: LinkedProject[];
};

export interface HomePageContent {
  page: Pick<HomePageData, 'title' | 'description'>;
  hero: HomePageData['hero'];
  proofStrip: HomePageData['proofStrip'];
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
      category: WritingEntry['data']['category'];
      items: HomeWritingCardItem[];
    }>;
  };
  featuredTools: {
    sectionTitle: HomePageData['featuredTools']['sectionTitle'];
    sectionIntro: HomePageData['featuredTools']['sectionIntro'];
    items: HomeToolCardItem[];
  };
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
    rawFeaturedProjectEntries,
    rawFeaturedToolEntries,
    rawFeaturedWritingGroups,
  ] = await Promise.all([
    getEntries(curation.featuredProjects),
    getEntries(curation.featuredTools),
    Promise.all(
      curation.featuredWriting.map(async (group) => ({
        ...group,
        entries: (await getEntries(group.entries)).filter(
          (entry): entry is WritingEntry => Boolean(entry),
        ),
      })),
    ),
  ]);

  const featuredProjectEntries = rawFeaturedProjectEntries.filter(
    (entry): entry is ProjectEntry => Boolean(entry),
  );
  const featuredToolEntries = rawFeaturedToolEntries.filter(
    (entry): entry is ToolEntry => Boolean(entry),
  );
  const buildWritingGroupItems = async (
    entries: WritingEntry[],
    expectedCategory: WritingEntry['data']['category'],
    label: string,
  ): Promise<HomeWritingCardItem[]> => {
    const normalizedExpectedCategory = normalizeWritingCategory(expectedCategory);

    entries.forEach((entry) => {
      const normalizedCategory = normalizeWritingCategory(entry.data.category);

      if (!entry.data.listed) {
        throw new Error(
          `Home writing group "${label}" includes "${entry.slug}", which is not listed.`,
        );
      }

      if (normalizedCategory !== normalizedExpectedCategory) {
        throw new Error(
          `Home writing group "${label}" includes "${entry.slug}", which resolves to ${normalizedCategory}.`,
        );
      }
    });

    return Promise.all(
      entries.map(async (entry) => {
        const relatedProjects = await getRelatedProjectsForEntry(entry);

        return {
          title: entry.data.title,
          summary: entry.data.summary,
          featureImage: getWritingFeatureImage(entry.data.featureImage),
          category: normalizeWritingCategory(entry.data.category),
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

  const selectedWritingGroups = await Promise.all(
    rawFeaturedWritingGroups.map(async (group) => ({
      label: group.label || getWritingCategoryMeta(group.category).pluralLabel,
      category: normalizeWritingCategory(group.category),
      items: await buildWritingGroupItems(group.entries, group.category, group.label),
    })),
  );

  return {
    page: {
      title: pageCopy.title,
      description: pageCopy.description,
    },
    hero: pageCopy.hero,
    proofStrip: pageCopy.proofStrip,
    intro: pageCopy.intro,
    featuredProjects: {
      sectionTitle: pageCopy.featuredProjects.sectionTitle,
      sectionIntro: pageCopy.featuredProjects.sectionIntro,
      items: featuredProjectEntries.map((entry) => ({
        slug: entry.slug,
        title: entry.data.title,
        summary: entry.data.summary,
        featureImage: getProjectFeatureImage(entry.data.featureImage),
        status: entry.data.status,
        currentMilestone: entry.data.currentMilestone,
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
        featureImage: getToolFeatureImage(entry.data.featureImage),
        detailHref: getToolHref(entry),
        featured: true,
      })),
    },
  };
}
