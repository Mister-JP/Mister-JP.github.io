import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { homeContent } from '../data/home';
import type { HomeContent } from '../data/home';
import {
  getProjectHref,
  getToolHref,
  getWritingHref,
} from './content-paths';

type ProjectEntry = CollectionEntry<'projects'>;
type ToolEntry = CollectionEntry<'tools'>;
type WritingEntry = CollectionEntry<'writing'>;

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
  hero: HomeContent['hero'];
  intro: HomeContent['intro'];
  featuredProjects: {
    sectionTitle: string;
    sectionIntro: string;
    items: HomeProjectCardItem[];
  };
  selectedWriting: {
    sectionTitle: string;
    sectionIntro: string;
    groups: Array<{
      label: string;
      items: HomeWritingCardItem[];
    }>;
  };
  featuredTools: {
    sectionTitle: string;
    sectionIntro: string;
    items: HomeToolCardItem[];
  };
  resumeCta: HomeContent['resumeCta'];
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

export async function getHomePageContent(): Promise<HomePageContent> {
  const [projectEntries, toolEntries, writingEntries]: [
    ProjectEntry[],
    ToolEntry[],
    WritingEntry[],
  ] = await Promise.all([
    getCollection('projects'),
    getCollection('tools'),
    getCollection('writing'),
  ]);

  const featuredProjectEntries = resolveEntriesInOrder(
    projectEntries,
    homeContent.featuredProjects.slugs,
    'projects',
  );
  const featuredToolEntries = resolveEntriesInOrder(
    toolEntries,
    homeContent.featuredTools.slugs,
    'tools',
  );

  const selectedWritingGroups = await Promise.all(
    homeContent.selectedWriting.groups.map(async (group) => {
      const entries = resolveEntriesInOrder(
        writingEntries,
        group.slugs,
        `writing entries for ${group.label}`,
      );

      const items = await Promise.all(
        entries.map(async (entry) => {
          if (entry.data.kind !== group.kind) {
            throw new Error(
              `Home writing group "${group.label}" expects ${group.kind} entries, but "${entry.slug}" is ${entry.data.kind}.`,
            );
          }

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
        label: group.label,
        items,
      };
    }),
  );

  return {
    hero: homeContent.hero,
    intro: homeContent.intro,
    featuredProjects: {
      sectionTitle: homeContent.featuredProjects.sectionTitle,
      sectionIntro: homeContent.featuredProjects.sectionIntro,
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
      sectionTitle: homeContent.selectedWriting.sectionTitle,
      sectionIntro: homeContent.selectedWriting.sectionIntro,
      groups: selectedWritingGroups,
    },
    featuredTools: {
      sectionTitle: homeContent.featuredTools.sectionTitle,
      sectionIntro: homeContent.featuredTools.sectionIntro,
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
    resumeCta: homeContent.resumeCta,
  };
}
