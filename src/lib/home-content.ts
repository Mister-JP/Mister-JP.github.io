import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { homeComposition } from '../data/home';
import { sortCollectionEntriesBySortOrderThenTitle } from './collection-utils';
import {
  getProjectHref,
  getToolHref,
  getWritingHref,
} from './content-paths';

type ProjectEntry = CollectionEntry<'projects'>;
type ToolEntry = CollectionEntry<'tools'>;
type WritingEntry = CollectionEntry<'writing'>;
type HomePageData = Extract<CollectionEntry<'pages'>['data'], { template: 'home' }>;
type HomeCollectionConfig = (typeof homeComposition)['featuredProjects'];
type HomeWritingGroupConfig = (typeof homeComposition)['selectedWriting']['groups'][number];

type HomeProjectCardItem = {
  slug: ProjectEntry['slug'];
} & Pick<
  ProjectEntry['data'],
  'title' | 'summary' | 'status' | 'tags' | 'links' | 'featured'
>;

type HomeToolCardItem = Pick<
  ToolEntry['data'],
  'title' | 'summary' | 'status' | 'links' | 'tags' | 'featured' | 'previewImage'
> & {
  detailHref: string;
};

type HomeWritingCardItem = Pick<
  WritingEntry['data'],
  'title' | 'summary' | 'kind' | 'status' | 'tags' | 'featured'
> & {
  href: string;
  relatedProjectHref?: string;
  relatedProjectTitle?: string;
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

const createSlugMap = <T extends { slug: string }>(entries: T[]): Map<string, T> =>
  new Map<string, T>(entries.map((entry): [string, T] => [entry.slug, entry]));

const resolveEntriesInOrder = <T extends { slug: string }>(
  entries: T[],
  slugs: string[],
  collectionName: string,
) => {
  const entryBySlug = createSlugMap(entries);

  return slugs.map((slug) => {
    const entry = entryBySlug.get(slug);

    if (!entry) {
      throw new Error(
        `Home content references missing ${collectionName} slug "${slug}".`,
      );
    }

    return entry;
  });
};

const getConfiguredEntries = <
  T extends { slug: string; data: { featured: boolean; sortOrder: number; title: string } },
>(
  entries: T[],
  config: HomeCollectionConfig,
  collectionName: string,
) => {
  if (config.slugs && config.slugs.length > 0) {
    return resolveEntriesInOrder(entries, config.slugs, collectionName);
  }

  return entries
    .filter((entry) => entry.data.featured)
    .sort(sortCollectionEntriesBySortOrderThenTitle)
    .slice(0, config.limit);
};

const getConfiguredWritingEntries = (
  entries: WritingEntry[],
  config: HomeWritingGroupConfig,
) => {
  const selectedEntries = config.slugs && config.slugs.length > 0
    ? resolveEntriesInOrder(entries, config.slugs, `writing entries for ${config.kind}`)
    : entries
        .filter(
          (entry) => entry.data.kind === config.kind && entry.data.featured,
        )
        .sort(sortCollectionEntriesBySortOrderThenTitle)
        .slice(0, config.limit);

  selectedEntries.forEach((entry) => {
    if (entry.data.kind !== config.kind) {
      throw new Error(
        `Home writing config for "${config.kind}" includes "${entry.slug}", which is ${entry.data.kind}.`,
      );
    }
  });

  return selectedEntries;
};

export async function getHomePageContent(): Promise<HomePageContent> {
  const homeEntry = await getEntry('pages', 'home');

  if (!homeEntry) {
    throw new Error('Missing content entry: src/content/pages/home.md');
  }

  if (homeEntry.data.template !== 'home') {
    throw new Error('The home page entry must use the "home" template.');
  }

  const pageCopy = homeEntry.data;
  const [projectEntries, toolEntries, writingEntries]: [
    ProjectEntry[],
    ToolEntry[],
    WritingEntry[],
  ] = await Promise.all([
    getCollection('projects'),
    getCollection('tools'),
    getCollection('writing'),
  ]);

  const featuredProjectEntries = getConfiguredEntries(
    projectEntries,
    homeComposition.featuredProjects,
    'projects',
  );
  const featuredToolEntries = getConfiguredEntries(
    toolEntries,
    homeComposition.featuredTools,
    'tools',
  );
  const writingGroupCopyByKind = new Map(
    pageCopy.selectedWriting.groups.map((group) => [group.kind, group]),
  );

  const selectedWritingGroups = await Promise.all(
    homeComposition.selectedWriting.groups.map(async (groupConfig) => {
      const groupCopy = writingGroupCopyByKind.get(groupConfig.kind);

      if (!groupCopy) {
        throw new Error(
          `Home page copy is missing a selected writing label for "${groupConfig.kind}".`,
        );
      }

      const entries = getConfiguredWritingEntries(writingEntries, groupConfig);
      const items = await Promise.all(
        entries.map(async (entry) => {
          const relatedProject = entry.data.relatedProject
            ? await getEntry(entry.data.relatedProject)
            : undefined;

          return {
            title: entry.data.title,
            summary: entry.data.summary,
            kind: entry.data.kind,
            status: entry.data.status,
            tags: entry.data.tags,
            featured: entry.data.featured,
            href: getWritingHref(entry),
            relatedProjectHref: relatedProject
              ? getProjectHref(relatedProject)
              : undefined,
            relatedProjectTitle: relatedProject?.data.title,
          };
        }),
      );

      return {
        label: groupCopy.label,
        items,
      };
    }),
  );

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
        featured: entry.data.featured,
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
        featured: entry.data.featured,
        previewImage: entry.data.previewImage,
        detailHref: getToolHref(entry),
      })),
    },
    resumeCta: pageCopy.resumeCta,
  };
}
